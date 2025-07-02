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
          - intent: one of [revenue, outstanding_payments, enrollment, attendance, clients, dashboard, unknown]
          - period: if mentioned (today, week, month, year)
          - translated_query: English translation of the query

          Examples:
          - "Show me monthly revenue" -> {"intent": "revenue", "period": "month", "translated_query": "Show me monthly revenue"}
          - "What are the top performing services?" -> {"intent": "enrollment", "translated_query": "What are the top performing services?"}
          - "Top courses" -> {"intent": "enrollment", "translated_query": "Top courses"}
          - "Most popular classes" -> {"intent": "enrollment", "translated_query": "Most popular classes"}
          - "Service analytics" -> {"intent": "enrollment", "translated_query": "Service analytics"}
          - "Outstanding payments" -> {"intent": "outstanding_payments", "translated_query": "Outstanding payments"}
          - "Pending orders" -> {"intent": "outstanding_payments", "translated_query": "Pending orders"}
          - "मासिक राजस्व दिखाएं" -> {"intent": "revenue", "period": "month", "translated_query": "Show me monthly revenue"}
          - "শীর্ষ কোর্স" -> {"intent": "enrollment", "translated_query": "Top courses"}
          - "बकाया भुगतान" -> {"intent": "outstanding_payments", "translated_query": "Outstanding payments"}
          - "उपस্থিति रिপोर्ট" -> {"intent": "attendance", "translated_query": "attendance report"}
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
        console.log("Intent Data:", intentData)
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
      case 'outstanding_payments':
        return this.getOutstandingPayments();
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

      // Outstanding payments queries  
      if (this.matchesOutstandingPayments(lowerQuery)) {
        return this.getOutstandingPayments();
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

      return 'I can provide revenue metrics, outstanding payments, client insights, service analytics, and attendance reports. Please be more specific.';
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
    const patterns = ['enrollment', 'registration', 'signup', 'popular', 'top', 'performing', 'service', 'course', 'class', 'analytics', 'नामांकन', 'पंजीकरण', 'নথিভুক্তি', 'নিবন্ধন', 'सेवा', 'কোর্স'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesAttendance(query: string): boolean {
    const patterns = ['attendance', 'present', 'absent', 'participation', 'उपस्थिति', 'উপস্থিতি'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesClients(query: string): boolean {
    const patterns = ['client', 'customer', 'user', 'inactive', 'ग्राहक', 'ग्राहक'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesDashboard(query: string): boolean {
    const patterns = ['dashboard', 'summary', 'overview', 'report', 'डैशबोर्ड', 'ড্যাশবোর্ড', 'सारांश', 'সারসংক্ষেপ'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesOutstandingPayments(query: string): boolean {
    const patterns = ['outstanding', 'pending', 'unpaid', 'due', 'owed', 'overdue', 'बकाया', 'लंबित', 'বকেয়া', 'অমীমাংসিত'];
    return patterns.some(pattern => query.includes(pattern)) && 
           (query.includes('payment') || query.includes('order') || query.includes('पेमेंट') || query.includes('ऑर्डर') || 
            query.includes('পেমেন্ট') || query.includes('অর্ডার'));
  }

  private async getMonthlyRevenue(): Promise<string> {
    const revenueQuery = JSON.stringify({
      type: 'revenue',
      period: 'month'
    });

    const result = await this.analyticsTool._call(revenueQuery);
    
    try {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || (Array.isArray(parsedResult) && parsedResult.length === 0) || 
          (parsedResult[0] && parsedResult[0].totalRevenue === 0)) {
        return "Monthly revenue: No revenue data found for this month.";
      }
      return `Monthly revenue: ${result}`;
    } catch (error) {
      return `Monthly revenue: ${result}`;
    }
  }

  private async getTopEnrollments(): Promise<string> {
    const enrollmentQuery = JSON.stringify({
      type: 'service_analytics',
      period: 'month'
    });

    const result = await this.analyticsTool._call(enrollmentQuery);
    
    try {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || 
          (parsedResult.topCourses && parsedResult.topCourses.length === 0 && 
           parsedResult.topClasses && parsedResult.topClasses.length === 0)) {
        return "Top enrollments: No enrollment data found for this month.";
      }
      return `Top enrollments: ${result}`;
    } catch (error) {
      return `Top enrollments: ${result}`;
    }
  }

  private async getAttendanceStats(): Promise<string> {
    const attendanceQuery = JSON.stringify({
      type: 'attendance_report'
    });

    const result = await this.analyticsTool._call(attendanceQuery);
    
    try {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || (Array.isArray(parsedResult) && parsedResult.length === 0)) {
        return "Attendance statistics: No attendance data found.";
      }
      return `Attendance statistics: ${result}`;
    } catch (error) {
      return `Attendance statistics: ${result}`;
    }
  }

  private async getInactiveClients(): Promise<string> {
    const clientQuery = JSON.stringify({
      type: 'client_insights'
    });

    const result = await this.analyticsTool._call(clientQuery);
    
    try {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || 
          (parsedResult.activeClients === 0 && parsedResult.inactiveClients === 0 && 
           parsedResult.newClients === 0 && parsedResult.birthdayClients === 0)) {
        return "Client insights: No client data found.";
      }
      return `Client insights: ${result}`;
    } catch (error) {
      return `Client insights: ${result}`;
    }
  }

  private async getOutstandingPayments(): Promise<string> {
    const outstandingQuery = JSON.stringify({
      type: 'outstanding_payments'
    });

    const result = await this.analyticsTool._call(outstandingQuery);
    
    try {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || (Array.isArray(parsedResult) && parsedResult.length === 0) || 
          (parsedResult[0] && parsedResult[0].totalOutstanding === 0)) {
        return "Outstanding payments: No pending orders found.";
      }
      return `Outstanding payments: ${result}`;
    } catch (error) {
      return `Outstanding payments: ${result}`;
    }
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
