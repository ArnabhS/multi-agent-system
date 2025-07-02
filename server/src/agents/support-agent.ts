import { MongoDBTool } from '../tools/mongodb-tool.js';
import { ExternalAPITool } from '../tools/external-api-tool.js';

export class SupportAgent {
  private mongoTool: MongoDBTool;
  private externalTool: ExternalAPITool;

  constructor() {
    this.mongoTool = new MongoDBTool();
    this.externalTool = new ExternalAPITool();
  }

  async handleQuery(query: string): Promise<string> {
    try {
     
      return await this.handleSpecificQueries(query);
    } catch (error) {
      console.error('Support Agent Error:', error);
      return `I apologize, but I encountered an error while processing your request: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  async handleSpecificQueries(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();
    
    try {
      
      if (lowerQuery.includes('create') && lowerQuery.includes('order')) {
        console.log("reaching create order")
        return this.createOrder(query);
      }

     
      if (lowerQuery.includes('client') && (lowerQuery.includes('search') || lowerQuery.includes('find'))) {
        
        return this.searchClients(query);
      }

      
      if (lowerQuery.includes('order') && /order\s*#?\w+/.test(lowerQuery)) {
        console.log("here 2")
        
        const orderMatch = query.match(/order\s*#?(\w+)/i);
        console.log(orderMatch)
        if (orderMatch) {
          return this.getOrderStatus(orderMatch[1]);
        }
      }

     
      if (lowerQuery.includes('classes') && lowerQuery.includes('week')) {
        console.log("here 3")
        return this.getWeeklyClasses();
      }

      
      if (lowerQuery.includes('paid') || lowerQuery.includes('payment')) {
        return this.getPaymentInfo(query);
      }

      return 'I can help you with client searches, order status, class schedules, payments, and creating new orders. Please be more specific.';
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private async searchClients(query: string): Promise<string> {
    
    const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = query.match(/(\+?[\d\s-()]{10,})/);
    const nameMatch = query.match(/name\s+([^@\n]+?)(?:\s|$)/i);

    let searchQuery: any = {};

    if (emailMatch) {
      searchQuery.email = { $regex: emailMatch[1], $options: 'i' };
    } else if (phoneMatch) {
      searchQuery.phone = { $regex: phoneMatch[1].replace(/\s|-|\(|\)/g, '') };
    } else if (nameMatch) {
      searchQuery.name = { $regex: nameMatch[1].trim(), $options: 'i' };
    }

    const mongoQuery = JSON.stringify({
      collection: 'clients',
      operation: 'find',
      query: searchQuery,
      options: { limit: 10 }
    });

    const result = await this.mongoTool._call(mongoQuery);
    return `Client search completed: ${result}`;
  }

  private async getOrderStatus(orderId: string): Promise<string> {
    const orderQuery = JSON.stringify({
      collection: 'orders',
      operation: 'findOne',
      query: { orderId: orderId }
    });

    const orderResult = await this.mongoTool._call(orderQuery);
    const order = JSON.parse(orderResult);

    if (!order) {
      return `Order ${orderId} not found`;
    }

    // Get payment info
    const paymentQuery = JSON.stringify({
      collection: 'payments',
      operation: 'findOne',
      query: { orderId: order._id }
    });

    const paymentResult = await this.mongoTool._call(paymentQuery);
    const payment = JSON.parse(paymentResult);

    return `Order ${orderId} is ${order.status}${payment ? ` and payment is ${payment.status}` : ' with no payment record'}`;
  }

  private async getWeeklyClasses(): Promise<string> {
    const startOfWeek = new Date();
    const endOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const classQuery = JSON.stringify({
      collection: 'classes',
      operation: 'find',
      query: {
        date: {
          $gte: startOfWeek.toISOString(),
          $lte: endOfWeek.toISOString()
        },
        status: { $in: ['scheduled', 'ongoing'] }
      },
      options: { sort: { date: 1 } }
    });

    const result = await this.mongoTool._call(classQuery);
    return `Weekly classes: ${result}`;
  }

  private async getPaymentInfo(query: string): Promise<string> {
    const orderMatch = query.match(/order\s*#?(\w+)/i);
    
    if (!orderMatch) {
      // Get pending payments
      const pendingQuery = JSON.stringify({
        collection: 'orders',
        operation: 'find',
        query: { status: 'pending' },
        options: { limit: 10 }
      });

      const result = await this.mongoTool._call(pendingQuery);
      return `Pending payments: ${result}`;
    }

    return this.getOrderStatus(orderMatch[1]);
  }

  private async createOrder(query: string): Promise<string> {
    // Extract service and client info
    const serviceMatch = query.match(/for\s+([^f]+?)\s+for\s+client/i);
    const clientMatch = query.match(/client\s+([^"'\n]+?)(?:\s|$)/i);

    if (!serviceMatch || !clientMatch) {
      return "Please specify: 'Create an order for [Service Name] for client [Client Name/Email]'";
    }

    const orderData = {
      action: 'create_order',
      data: {
        clientEmail: clientMatch[1].includes('@') ? clientMatch[1].trim() : undefined,
        clientName: !clientMatch[1].includes('@') ? clientMatch[1].trim() : undefined,
        serviceName: serviceMatch[1].trim(),
        serviceType: 'course'
      }
    };
    console.log("reaching here...")
    const result = await this.externalTool._call(JSON.stringify(orderData));
    return `Order creation result: ${result}`;
  }
}
