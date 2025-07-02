import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoDBTool } from '../tools/mongodb-tool.js';
import { ExternalAPITool } from '../tools/external-api-tool.js';

export class SupportAgent {
  private mongoTool: MongoDBTool;
  private externalTool: ExternalAPITool;
  private llm: ChatGoogleGenerativeAI;

  constructor() {
    this.mongoTool = new MongoDBTool();
    this.externalTool = new ExternalAPITool();
    
    // Initialize Google Gemini AI for multilingual understanding
    this.llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.1,
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async handleQuery(query: string): Promise<string> {
    try {
      // Use LLM to understand multilingual queries and extract information
      const intentResponse = await this.llm.invoke([
        {
          role: "user",
          content: `Analyze this customer support query (it may be in any language - English, Hindi, Bengali, etc.) and extract key information: "${query}"

          Return JSON with:
          - intent: one of [search_client, order_status, create_order, weekly_classes, payment_info, unknown]
          - extracted_data: object with relevant extracted information
          - translated_query: English translation of the query

          Examples:
          - "Find client john@example.com" -> {"intent": "search_client", "extracted_data": {"email": "john@example.com"}, "translated_query": "Find client john@example.com"}
          - "ग्राहक john@example.com खोजें" -> {"intent": "search_client", "extracted_data": {"email": "john@example.com"}, "translated_query": "Find client john@example.com"}
          - "অর্ডার #123 এর অবস্থা কী?" -> {"intent": "order_status", "extracted_data": {"orderId": "123"}, "translated_query": "What is the status of order #123?"}
          - "योग कोर्स के लिए ऑर्डर बनाएं" -> {"intent": "create_order", "extracted_data": {"service": "Yoga Course"}, "translated_query": "Create order for Yoga Course"}`
        }
      ]);

      let intentData;
      try {
        // Extract JSON from response content
        const content = typeof intentResponse.content === 'string' 
          ? intentResponse.content 
          : JSON.stringify(intentResponse.content);
        const jsonMatch = content.match(/\{.*\}/s);
        intentData = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: 'unknown' };
      } catch {
        intentData = { intent: 'unknown' };
      }

      // Route to appropriate handler based on intent
      return await this.routeByIntent(intentData, query);
    } catch (error) {
      console.error('Support Agent Error:', error);
      // Fallback to simple pattern matching if LLM fails
      return await this.handleSpecificQueries(query);
    }
  }

  private async routeByIntent(intentData: any, originalQuery: string): Promise<string> {
    const { intent, extracted_data } = intentData;

    try {
      switch (intent) {
        case 'search_client':
          return await this.searchClients(originalQuery);
        case 'order_status':
          return await this.getOrderStatus(extracted_data?.orderId || '');
        case 'create_order':
          return await this.createOrder(originalQuery);
        case 'weekly_classes':
          return await this.getWeeklyClasses();
        case 'payment_info':
          return await this.getPaymentInfo(originalQuery);
        default:
          return await this.handleSpecificQueries(originalQuery);
      }
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async handleSpecificQueries(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();
    
    try {
      // Create order - multilingual support
      if (this.matchesCreateOrder(lowerQuery)) {
        console.log("reaching create order")
        return this.createOrder(query);
      }

      // Client search - multilingual support
      if (this.matchesClientSearch(lowerQuery)) {
        return this.searchClients(query);
      }

      // Order status - multilingual support
      if (this.matchesOrderStatus(lowerQuery)) {
        console.log("here 2")
        const orderMatch = query.match(/order\s*#?(\w+)/i) || query.match(/ऑर्डर\s*#?(\w+)/i) || query.match(/অর্ডার\s*#?(\w+)/i);
        console.log(orderMatch)
        if (orderMatch) {
          return this.getOrderStatus(orderMatch[1]);
        }
      }

      // Weekly classes - multilingual support
      if (this.matchesWeeklyClasses(lowerQuery)) {
        console.log("here 3")
        return this.getWeeklyClasses();
      }

      // Payment info - multilingual support
      if (this.matchesPaymentInfo(lowerQuery)) {
        return this.getPaymentInfo(query);
      }

      return 'I can help you with client searches, order status, class schedules, payments, and creating new orders. Please be more specific.';
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Multilingual pattern matching methods
  private matchesCreateOrder(query: string): boolean {
    const patterns = ['create', 'order', 'बनाएं', 'ऑर्डर', 'তৈরি', 'অর্ডার'];
    return patterns.filter(pattern => query.includes(pattern)).length >= 2;
  }

  private matchesClientSearch(query: string): boolean {
    const searchPatterns = ['client', 'search', 'find', 'ग्राहक', 'खोज', 'গ্রাহক', 'খুঁজ'];
    return searchPatterns.some(pattern => query.includes(pattern));
  }

  private matchesOrderStatus(query: string): boolean {
    const patterns = ['order', 'status', 'ऑर्डर', 'स्थिति', 'অর্ডার', 'অবস্থা'];
    return patterns.some(pattern => query.includes(pattern)) && /order\s*#?\w+|ऑर्डर\s*#?\w+|অর্ডার\s*#?\w+/.test(query);
  }

  private matchesWeeklyClasses(query: string): boolean {
    const patterns = ['classes', 'week', 'कक्षा', 'सप्ताह', 'ক্লাস', 'সপ্তাহ'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private matchesPaymentInfo(query: string): boolean {
    const patterns = ['paid', 'payment', 'भुगतान', 'পেমেন্ট'];
    return patterns.some(pattern => query.includes(pattern));
  }

  private async searchClients(query: string): Promise<string> {
    // Enhanced pattern matching for multilingual queries
    const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = query.match(/(\+?[\d\s-()]{10,})/);
    const nameMatch = query.match(/name\s+([^@\n]+?)(?:\s|$)/i) || 
                     query.match(/नाम\s+([^@\n]+?)(?:\s|$)/i) ||
                     query.match(/নাম\s+([^@\n]+?)(?:\s|$)/i);

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
    // Enhanced extraction for multilingual queries
    const serviceMatch = query.match(/for\s+([^f]+?)\s+for\s+client/i) ||
                        query.match(/के लिए\s+([^क]+?)\s+के लिए\s+ग्राहक/i) ||
                        query.match(/জন্য\s+([^গ]+?)\s+জন্য\s+গ্রাহক/i);
    
    const clientMatch = query.match(/client\s+([^"'\n]+?)(?:\s|$)/i) ||
                       query.match(/ग्राहक\s+([^"'\n]+?)(?:\s|$)/i) ||
                       query.match(/গ্রাহক\s+([^"'\n]+?)(?:\s|$)/i);

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
