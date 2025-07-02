import { Request, Response } from 'express';
import { Client } from '../models/client.model';
import { Order } from '../models/order.model';

export const clientCreated = async (req:Request, res:Response):Promise<void>=>{
    try {
    const { clientId, email, name } = req.body;
    console.log(`Webhook received: Client created `);
    if(!clientId || !email || !name){
      res.status(400).json({message:"Credenitals missing"})
    }
    const notifications = [
      { type: 'email', status: 'sent', message: `Welcome email sent to ${email}` },
      { type: 'crm', status: 'updated', message: `Client ${name} added to CRM` },
      { type: 'analytics', status: 'tracked', message: 'New client event tracked' }
    ];

    res.json({
      success: true,
      message: 'Client creation webhook processed',
      clientId,
      notifications
    });
    return;
  } catch (error) {
    console.error('Client webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Webhook processing failed' 
    });
    return;
}
}

export const orderCreated = async(req:Request, res:Response):Promise<void>=>{
   try {
    const { orderId, clientEmail, serviceName, amount } = req.body;
    
    console.log(`Webhook received: Order created`);
     if(!orderId || !clientEmail || !serviceName || !amount){
      res.status(400).json({message:"Credenitals missing"})
    }
    const notifications = [
      { type: 'email', status: 'sent', message: `Order confirmation sent to ${clientEmail}` },
      { type: 'payment', status: 'pending', message: `Payment link generated for $${amount}` },
      { type: 'instructor', status: 'notified', message: `Instructor notified about new enrollment` },
      { type: 'calendar', status: 'updated', message: 'Calendar slots updated' }
    ];

    res.json({
      success: true,
      message: 'Order creation webhook processed',
      orderId,
      notifications
    });
    return;
  } catch (error) {
    console.error('Order webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Webhook processing failed' 
    });
    return;
}
}

export const enquiryCreated = async(req:Request, res:Response):Promise<void>=>{
   try {
    const { id, name, email } = req.body;
    
    console.log(`Webhook received: Enquiry created `);
     if(!id || !name || !email){
      res.status(400).json({message:"Credenitals missing"})
    }
    const notifications = [
      { type: 'crm', status: 'created', message: `Lead ${name} added to CRM` },
      { type: 'email', status: 'sent', message: `Auto-response sent to ${email}` },
      { type: 'sales', status: 'notified', message: 'Sales team notified of new enquiry' },
      { type: 'followup', status: 'scheduled', message: 'Follow-up task created' }
    ];

    res.json({
      success: true,
      message: 'Enquiry creation webhook processed',
      enquiryId: id,
      notifications
    });
    return;
  } catch (error) {
    console.error('Enquiry webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Webhook processing failed' 
    });
    return;
  }
}