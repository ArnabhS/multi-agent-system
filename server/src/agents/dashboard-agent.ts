import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoDBTool, MongoDBAnalyticsTool } from '../tools/mongodb-tool.js';

export class DashboardAgent {
  private mongoTool: MongoDBTool;
  private analyticsTool: MongoDBAnalyticsTool;
  private llm: ChatGoogleGenerativeAI;

  constructor() {
    this.mongoTool = new MongoDBTool();
    this.analyticsTool = new MongoDBAnalyticsTool();
    
    // Initialize Google Gemini AI for multilingual understanding
    this.llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.1,
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async handleQuery(query: string): Promise<string> {
    try {
      // Use LLM to understand multilingual queries and translate intent to English
      const intentResponse = await this.llm.invoke([
        {
          role: "user",
          content: `Analyze this business analytics query (it may be in any language - English, Hindi, Bengali, etc.) and classify the intent: "${query}"

          Return JSON with:
          - intent: one of [revenue, enrollment, attendance, clients, dashboard, unknown]
          - period: if mentioned (today, week, month, year)
          - translated_query: English translation of the query

          Examples:
          - "Show me monthly revenue" -> {"intent": "revenue", "period": "month", "translated_query": "Show me monthly revenue"}
          - "मासिक राजस्व दिखाएं" -> {"intent": "revenue", "period": "month", "translated_query": "Show me monthly revenue"}
          - "মাসিক রাজস্ব দেখান" -> {"intent": "revenue", "period": "month", "translated_query": "Show me monthly revenue"}
          - "उपस्थिति रिपोर्ट" -> {"intent": "attendance", "translated_query": "attendance report"}
          - "ড্যাশবোর্ড" -> {"intent": "dashboard", "translated_query": "dashboard"}`
        }
      ]);

      let intentData;
      try {
      
        const content = typeof intentResponse.content === 'string' 
          ? intentResponse.content 
          : JSON.stringify(intentResponse.content);
        const jsonMatch = content.match(/\{.*\}/s);
        intentData = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: 'unknown' };
      } catch {
        intentData = { intent: 'unknown' };
      }

      return await this.routeByIntent(intentData, query);
    } catch (error) {
      console.error('Dashboard Agent Error:', error);
      // Fallback to simple pattern matching if LLM fails
      return await this.handleSpecificQueries(query);
    }
  }

  private async routeByIntent(intentData: any, originalQuery: string): Promise<string> {
    const { intent } = intentData;

    switch (intent) {
      case 'revenue':
        return this.getMonthlyRevenue();
      case 'enrollment':
        return this.getTopEnrollments();
      case 'attendance':
        return this.getAttendanceStats();
      case 'clients':
        return this.getInactiveClients();
      case 'dashboard':
        return this.generateDashboardSummary();
      default:
        // Fallback to pattern matching for unknown intents
        return this.handleSpecificQueries(originalQuery);
    }
  }

  async handleSpecificQueries(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    try {
     
      if (this.matchesRevenue(lowerQuery)) {
        return this.getMonthlyRevenue();
      }

      // Enrollment queries
      if (this.matchesEnrollment(lowerQuery)) {
        return this.getTopEnrollments();
      }

      // Attendance queries
      if (this.matchesAttendance(lowerQuery)) {
        return this.getAttendanceStats();
      }

      // Client queries
      if (this.matchesClients(lowerQuery)) {
        return this.getInactiveClients();
      }

      // Dashboard queries
      if (this.matchesDashboard(lowerQuery)) {
        return this.generateDashboardSummary();
      }

      return 'I can provide revenue metrics, client insights, service analytics, and attendance reports. Please be more specific.';
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Multilingual pattern matching methods
  private matchesRevenue(query: string): boolean {
    const patterns = ['revenue', 'income', 'earnings', 'money', 'sales', 'राजस्व', 'आय', 'কমাই', 'রাজস্ব', 'আয়'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesEnrollment(query: string): boolean {
    const patterns = ['enrollment', 'registration', 'signup', 'popular', 'top', 'नामांकन', 'पंजीकरण', 'নথিভুক্তি', 'নিবন্ধন'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesAttendance(query: string): boolean {
    const patterns = ['attendance', 'present', 'absent', 'participation', 'उपस্থিति', 'উপস্থিতি'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesClients(query: string): boolean {
    const patterns = ['client', 'customer', 'user', 'inactive', 'ग्राहक', 'গ্রাহক'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesDashboard(query: string): boolean {
    const patterns = ['dashboard', 'summary', 'overview', 'report', 'डैशবोर্ড', 'ড্যাশবোর্ড', 'सारांश', 'সারসংক্ষেপ'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private async getMonthlyRevenue(): Promise<string> {
    const revenueQuery = JSON.stringify({
      type: 'revenue',
      period: 'month'
    });

    const result = await this.analyticsTool._call(revenueQuery);
    return `Monthly revenue: ${result}`;
  }

  private async getTopEnrollments(): Promise<string> {
    const enrollmentQuery = JSON.stringify({
      type: 'service_analytics',
      period: 'month'
    });

    const result = await this.analyticsTool._call(enrollmentQuery);
    return `Top enrollments: ${result}`;
  }

  private async getAttendanceStats(): Promise<string> {
    const attendanceQuery = JSON.stringify({
      type: 'attendance_report'
    });

    const result = await this.analyticsTool._call(attendanceQuery);
    return `Attendance statistics: ${result}`;
  }

  private async getInactiveClients(): Promise<string> {
    const clientQuery = JSON.stringify({
      type: 'client_insights'
    });

    const result = await this.analyticsTool._call(clientQuery);
    return `Client insights: ${result}`;
  }

  async generateDashboardSummary(): Promise<string> {
    try {
      const [revenue, clients, services, attendance] = await Promise.all([
        this.getMonthlyRevenue(),
        this.getInactiveClients(), 
        this.getTopEnrollments(),
        this.getAttendanceStats()
      ]);

      return `📊 Business Dashboard Summary\n\n${revenue}\n\n${clients}\n\n${services}\n\n${attendance}`;
    } catch (error) {
      return `Error generating dashboard: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
