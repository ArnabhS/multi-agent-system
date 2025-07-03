import { Request, Response }  from 'express';
import { DashboardAgent } from '../agents/dashboard-agent.js';
import { SupportAgent } from '../agents/support-agent.js';
import { memoryService } from '../services/memory-service.js';

const dashboardAgent = new DashboardAgent();
const supportAgent = new SupportAgent();

export const supportAgentQueries = async (req:Request, res:Response):Promise<void> =>{
try {
    const { query, sessionId } = req.body;
    console.log(query)
    if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
    }

    const result = await supportAgent.handleQuery(query, sessionId);
    console.log(result.response)
    res.json({ 
      success: true, 
      data: result.response, 
      sessionId: result.sessionId,
      message: 'Support query processed' 
    });
    return;
} catch (error) {
    console.error('Support query error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
}
}

export const dashboardAgentQueries = async (req:Request, res:Response):Promise<void> =>{
try {
    const { query, sessionId } = req.body;
    console.log(query);
    if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
    }
    
    const result = await dashboardAgent.handleQuery(query, sessionId);
    console.log(result.response)
    res.json({ 
      success: true, 
      data: result.response, 
      sessionId: result.sessionId,
      message: 'Dashboard query processed' 
    });
    return;
} catch (error) {
    console.error('Dashboard query error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
}
}

export const dashboardAgentSummary = async (req:Request, res:Response):Promise<void> =>{
try {
    const result = await dashboardAgent.generateDashboardSummary();
    res.json({ success: true, data: result, message: 'Dashboard summary generated' });
    return;
} catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
}
}

export const getWeeklyClasses = async(req:Request, res:Response):Promise<void>=>{
    try {
    const result = await supportAgent.handleSpecificQueries('What classes are available this week?');
    res.json({ success: true, data: result, message: 'Weekly classes retrieved' });
    return;
  } catch (error) {
    console.error('Weekly classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export const getOrderStatus = async (req:Request, res:Response): Promise<void>=>{
    try {
    const { orderId } = req.params;
    if(!orderId){
        res.status(400).json({message:"Order Id required"})    
    }
    const result = await supportAgent.handleSpecificQueries(`Has order #${orderId} been paid?`);
    res.json({ success: true, data: result, message: 'Order status retrieved' });
    return;
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export const createOrder=async(req:Request, res:Response):Promise<void> =>{
    try {
    const { serviceName, clientEmail } = req.body;
    
    if (!serviceName || !clientEmail) {
      res.status(400).json({ message: 'Service name and client email are required' });
      return
    }
    const query = `Create an order for ${serviceName} for client ${clientEmail}`;
    const result = await supportAgent.handleSpecificQueries(query);
    console.log(result)
    res.json({ success: true, data: result, message: 'Order creation processed' });
    return;
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export const getMonthlyRevenue = async(req:Request, res:Response): Promise<void> =>{
    try {
    const result = await dashboardAgent.handleSpecificQueries('How much revenue did we generate this month?');
    res.json({ success: true, data: result, message: 'Monthly revenue calculated' });
    return;
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export const getTopEnrollments = async (req:Request, res:Response): Promise<void> =>{
    try {
    const result = await dashboardAgent.handleSpecificQueries('Which course has the highest enrollment?');
    res.json({ success: true, data: result, message: 'Top enrollment data retrieved' });
    return;
  } catch (error) {
    console.error('Top enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export const getAttendanceStatsByClassname = async (req:Request, res:Response) : Promise<void> =>{
    try {
    const { className } = req.params;

    if(!className){
        res.status(400).json({messsage:"Classname is required"})
        return;
    }    

    const query = `What is the attendance percentage for ${className}?`;
    
    const result = await dashboardAgent.handleSpecificQueries(query);
    res.json({ success: true, data: result, message: 'Attendance statistics calculated' });
    return;
  } catch (error) {
    console.error('Attendance stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
} 

export const getAttendanceStats = async(req:Request, res:Response)=>{
    try {
    const query = 'Show attendance statistics';
    const result = await dashboardAgent.handleSpecificQueries(query);
    res.json({ success: true, data: result, message: 'General attendance statistics calculated' });
    return;
  } catch (error) {
    console.error('Attendance stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export const getInactiveClients = async (req:Request, res:Response):Promise<void>=>{
    try {
    const result = await dashboardAgent.handleSpecificQueries('How many inactive clients do we have?');
    res.json({ success: true, data: result, message: 'Inactive clients data retrieved' });
    return
  } catch (error) {
    console.error('Inactive clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getActiveClients = async (req:Request, res:Response):Promise<void>=>{
    try {
    const result = await dashboardAgent.handleSpecificQueries('How many active clients do we have?');
    res.json({ success: true, data: result, message: 'active clients data retrieved' });
    return
  } catch (error) {
    console.error('active clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const birthdayReminders = async(req:Request,res:Response):Promise<void> =>{
    try {
    const result = await dashboardAgent.handleSpecificQueries('Show clients with birthdays this month');
    res.json({ success: true, data: result, message: 'Birthday reminders retrieved' });
  } catch (error) {
    console.error('Birthday reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getNewClients = async(req:Request,res:Response):Promise<void> =>{
 try {
    const result = await dashboardAgent.handleSpecificQueries('How many new clients joined this month?');
    res.json({ success: true, data: result, message: 'New clients this month retrieved' });
  } catch (error) {
    console.error('New clients this month error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const courseCompletionRate = async(req:Request,res:Response):Promise<void>=>{
try {
    const result = await dashboardAgent.handleSpecificQueries('Show course completion rates');
    res.json({ success: true, data: result, message: 'Course completion rates retrieved' });
    return
  } catch (error) {
    console.error('Course completion rates error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return
  }
}


export const getSessionContext = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    const context = memoryService.getContext(sessionId);
    const stats = memoryService.getSessionStats(sessionId);
    const recentInteractions = memoryService.getRecentInteractions(sessionId, 10);

    res.json({ 
      success: true, 
      data: { 
        context, 
        stats, 
        recentInteractions 
      }, 
      message: 'Session context retrieved' 
    });
    return;
  } catch (error) {
    console.error('Get session context error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const clearSessionMemory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    const cleared = memoryService.clearSession(sessionId);
    
    if (cleared) {
      res.json({ success: true, message: 'Session memory cleared' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
    return;
  } catch (error) {
    console.error('Clear session memory error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const getActiveSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = memoryService.getActiveSessions();
    
    res.json({ 
      success: true, 
      data: { 
        sessionCount: sessions.length,
        sessions 
      }, 
      message: 'Active sessions retrieved' 
    });
    return;
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const createNewSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const newSessionId = memoryService.createNewSession();
    
    res.json({ 
      success: true, 
      data: { sessionId: newSessionId }, 
      message: 'New session created' 
    });
    return;
  } catch (error) {
    console.error('Create new session error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

