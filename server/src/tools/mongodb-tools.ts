import { Tool } from '@langchain/core/tools';
import { Client } from "../models/client.model"
import { Order } from '../models/order.model';
import { Payment } from '../models/payment.model';
import { Class } from '../models/class.model';
import { Course } from '../models/course.model';
import { Attendance } from '../models/attendance.model';

export class MongoDBTool extends Tool {
  name = 'mongodb_query';
  description = `
    Query MongoDB collections for business data. 
    Input should be a JSON string with:
    - collection: The collection name (clients, orders, payments, courses, classes, attendance)
    - operation: The operation type (find, findOne, aggregate, count)
    - query: The query object
    - options: Additional options like limit, sort, etc.
    
    Examples:
    - {"collection": "clients", "operation": "find", "query": {"email": "john@example.com"}}
    - {"collection": "orders", "operation": "find", "query": {"status": "pending"}, "options": {"limit": 10}}
    - {"collection": "payments", "operation": "aggregate", "query": [{"$group": {"_id": null, "total": {"$sum": "$amount"}}}]}
  `;

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { collection, operation, query, options = {} } = params;

      let model: any;
      switch (collection) {
        case 'clients':
          model = Client;
          break;
        case 'orders':
          model = Order;
          break;
        case 'payments':
          model = Payment;
          break;
        case 'courses':
          model = Course;
          break;
        case 'classes':
          model = Class;
          break;
        case 'attendance':
          model = Attendance;
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }

      let result;
      switch (operation) {
        case 'find':
          result = await model.find(query, null, options);
          break;
        case 'findOne':
          result = await model.findOne(query, null, options);
          break;
        case 'aggregate':
          result = await model.aggregate(query);
          break;
        case 'count':
          result = await model.countDocuments(query);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error executing MongoDB query: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}


export class MongoDBAnalyticsTool extends Tool {
  name = 'mongodb_analytics';
  description = `
    Perform analytics queries on MongoDB collections.
    Input should be a JSON string with:
    - type: The analytics type (revenue, client_insights, service_analytics, attendance_report)
    - period: Optional time period (today, week, month, year)
    - filters: Optional additional filters
    
    Examples:
    - {"type": "revenue", "period": "month"}
    - {"type": "client_insights", "filters": {"isActive": true}}
    - {"type": "service_analytics", "period": "week"}
    - {"type": "attendance_report", "filters": {"classId": "64a1b2c3d4e5f6789012345"}}
  `;

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { type, period, filters = {} } = params;

      let result;
      const now = new Date();
      let dateFilter = {};

      
      if (period) {
        const periodDate = new Date();
        switch (period) {
          case 'today':
            periodDate.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: periodDate } };
            break;
          case 'week':
            periodDate.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: periodDate } };
            break;
          case 'month':
            periodDate.setMonth(now.getMonth() - 1);
            dateFilter = { createdAt: { $gte: periodDate } };
            break;
          case 'year':
            periodDate.setFullYear(now.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: periodDate } };
            break;
        }
      }

      switch (type) {
        case 'revenue':
          result = await Payment.aggregate([
            { $match: { status: 'completed', ...dateFilter } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } }
          ]);
          break;

        case 'outstanding_payments':
          result = await Order.aggregate([
            { $match: { status: 'pending', ...filters } },
            { $group: { _id: null, totalOutstanding: { $sum: '$amount' }, count: { $sum: 1 } } }
          ]);
          break;

        case 'client_insights':
          const activeClients = await Client.countDocuments({ isActive: true, ...filters });
          const inactiveClients = await Client.countDocuments({ isActive: false, ...filters });
          const newClients = await Client.countDocuments({ ...dateFilter, ...filters });
          
          
          const currentMonth = now.getMonth();
          const birthdayClients = await Client.find({
            dateOfBirth: {
              $exists: true,
              $ne: null
            },
            $expr: { $eq: [{ $month: '$dateOfBirth' }, currentMonth + 1] }
          });

          result = {
            activeClients,
            inactiveClients,
            newClients,
            birthdayReminders: birthdayClients
          };
          break;

        case 'service_analytics':
          const topCourses = await Order.aggregate([
            { $match: { serviceType: 'course', ...dateFilter } },
            { $group: { _id: '$serviceId', enrollments: { $sum: 1 } } },
            { $sort: { enrollments: -1 } },
            { $limit: 5 }
          ]);

          const topClasses = await Order.aggregate([
            { $match: { serviceType: 'class', ...dateFilter } },
            { $group: { _id: '$serviceId', enrollments: { $sum: 1 } } },
            { $sort: { enrollments: -1 } },
            { $limit: 5 }
          ]);

          result = { topCourses, topClasses };
          break;

        case 'attendance_report':
          result = await Attendance.aggregate([
            { $match: filters },
            {
              $group: {
                _id: '$classId',
                totalSessions: { $sum: 1 },
                attendedSessions: { $sum: { $cond: ['$present', 1, 0] } }
              }
            },
            {
              $addFields: {
                attendancePercentage: {
                  $multiply: [
                    { $divide: ['$attendedSessions', '$totalSessions'] },
                    100
                  ]
                }
              }
            }
          ]);
          break;

        default:
          throw new Error(`Unknown analytics type: ${type}`);
      }

      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error executing analytics query: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
