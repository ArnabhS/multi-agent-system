import { MongoDBTool, MongoDBAnalyticsTool } from '../tools/mongodb-tool.js';

export class DashboardAgent {
  private mongoTool: MongoDBTool;
  private analyticsTool: MongoDBAnalyticsTool;

  constructor() {
    this.mongoTool = new MongoDBTool();
    this.analyticsTool = new MongoDBAnalyticsTool();
  }

  async handleQuery(query: string): Promise<string> {
    try {
      // Use pattern matching for now, but this could be enhanced with actual LLM
      return await this.handleSpecificQueries(query);
    } catch (error) {
      console.error('Dashboard Agent Error:', error);
      return `I apologize, but I encountered an error while generating analytics: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  async handleSpecificQueries(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    try {
      // Revenue queries
      if (lowerQuery.includes('revenue') && lowerQuery.includes('month')) {
        return this.getMonthlyRevenue();
      }

      // Enrollment queries
      if (lowerQuery.includes('enrollment') || lowerQuery.includes('highest')) {
        return this.getTopEnrollments();
      }

      // Attendance queries
      if (lowerQuery.includes('attendance')) {
        return this.getAttendanceStats();
      }

      // Inactive clients
      if (lowerQuery.includes('inactive') && lowerQuery.includes('clients')) {
        return this.getInactiveClients();
      }

      // General dashboard
      if (lowerQuery.includes('dashboard') || lowerQuery.includes('summary')) {
        return this.generateDashboardSummary();
      }

      return 'I can provide revenue metrics, client insights, service analytics, and attendance reports. Please be more specific.';
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
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
