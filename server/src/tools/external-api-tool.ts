import { Tool } from '@langchain/core/tools';
import { Client } from '../models/client.model';
import { Order } from '../models/order.model';
import { Course } from '../models/course.model';
import { Class } from '../models/class.model';
import axios from 'axios';

export class ExternalAPITool extends Tool {
  name = 'external_api';
  description = `
    Make external API calls for creating orders and client enquiries.
    Input should be a JSON string with:
    - action: The action to perform (create_order, create_enquiry, create_client)
    - data: The data object containing relevant information
    
    Examples:
    - {"action": "create_order", "data": {"clientEmail": "john@example.com", "serviceName": "Yoga Beginner", "serviceType": "course"}}
    - {"action": "create_enquiry", "data": {"name": "Jane Doe", "email": "jane@example.com", "message": "Interested in yoga classes"}}
    - {"action": "create_client", "data": {"name": "John Smith", "email": "john@example.com", "phone": "+1234567890"}}
  `;

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { action, data } = params;

      let result;

      switch (action) {
        case 'create_client':
          result = await this.createClient(data);
          break;
        case 'create_order':
          result = await this.createOrder(data);
          break;
        case 'create_enquiry':
          result = await this.createEnquiry(data);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error executing external API call: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private async createClient(data: any): Promise<any> {
    try {
     
      const existingClient = await Client.findOne({ email: data.email });
      if (existingClient) {
        return { success: false, message: 'Client already exists', client: existingClient };
      }

      const client = new Client({
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        isActive: true,
        enrolledServices: []
      });

      const savedClient = await client.save();
      
      
      await this.simulateExternalCall('client-created', {
        clientId: savedClient._id,
        email: savedClient.email,
        name: savedClient.name
      });

      return { success: true, message: 'Client created successfully', client: savedClient };
    } catch (error) {
      throw new Error(`Failed to create client: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createOrder(data: any): Promise<any> {
    try {
     
    
      const client = await Client.findOne({ email: data.clientEmail });
      if (!client) {
        throw new Error('Client not found');
      }

      
      let service;
      let serviceType = data.serviceType;
      
      if (serviceType === 'course') {
        service = await Course.findOne({ name: { $regex: new RegExp(data.serviceName, 'i') } });
      } else if (serviceType === 'class') {
        service = await Class.findOne({ name: { $regex: new RegExp(data.serviceName, 'i') } });
      }

      if (!service) {
        throw new Error(`${serviceType} not found with name: ${data.serviceName}`);
      }

     
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const order = new Order({
        orderId,
        clientId: client._id,
        serviceType,
        serviceId: service._id,
        amount: service.price,
        status: 'pending'
      });

      const savedOrder = await order.save();

     
      if (!client.enrolledServices.includes(service.name)) {
        client.enrolledServices.push(service.name);
        await client.save();
      }

      
      await this.simulateExternalCall('order-created', {
        orderId: savedOrder.orderId,
        clientEmail: client.email,
        serviceName: service.name,
        amount: savedOrder.amount
      });

      return { 
        success: true, 
        message: 'Order created successfully', 
        order: savedOrder,
        client: client.name,
        service: service.name
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createEnquiry(data: any): Promise<any> {
    try {
      
      const enquiry = {
        id: `ENQ-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        status: 'new',
        createdAt: new Date()
      };

      await this.simulateExternalCall('enquiry-created', enquiry);

      return { 
        success: true, 
        message: 'Enquiry created successfully', 
        enquiry 
      };
    } catch (error) {
      throw new Error(`Failed to create enquiry: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async simulateExternalCall(event: string, data: any): Promise<void> {
   
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const webhookUrl = `${baseUrl}/api/internal/webhooks/${event}`;
    
    try {
      console.log(`Making external API call to: ${webhookUrl}`);
      
      const response = await axios.post(webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API': 'true' 
        },
        timeout: 5000 
      });

      console.log(`External API call successful:`, response.data);
    } catch (error) {
      console.error(`❌ External API call failed:`, error instanceof Error ? error.message : String(error));
      
      
      console.log(`📝 Fallback logging - Event: ${event}`, JSON.stringify(data, null, 2));
    }
  }
}
