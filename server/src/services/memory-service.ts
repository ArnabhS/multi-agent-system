interface MemoryEntry {
  id: string;
  sessionId: string;
  timestamp: Date;
  query: string;
  response: string;
  extractedData?: any;
  intent?: string;
  agentType: 'support' | 'dashboard';
}

interface ClientContext {
  clientEmail?: string;
  clientName?: string;
  clientId?: string;
  lastSearched?: Date;
}

interface ServiceContext {
  serviceName?: string;
  serviceType?: string;
  orderId?: string;
  lastInteraction?: Date;
}

interface SessionMemory {
  sessionId: string;
  clientContext?: ClientContext;
  serviceContext?: ServiceContext;
  recentInteractions: MemoryEntry[];
  createdAt: Date;
  lastActive: Date;
}

export class MemoryService {
  private sessions: Map<string, SessionMemory> = new Map();
  private readonly maxInteractionsPerSession = 20;
  private readonly sessionTimeoutMinutes = 30; 
  private currentSessionId: string | null = null;

  constructor() {
    
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 15 * 60 * 1000);
  }

 
  getOrCreateSession(): string {
   
    if (this.currentSessionId && this.isSessionActive(this.currentSessionId)) {
      return this.currentSessionId;
    }

   this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: SessionMemory = {
      sessionId: this.currentSessionId,
      recentInteractions: [],
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    this.sessions.set(this.currentSessionId, session);
    console.log(`🧠 Created new session: ${this.currentSessionId}`);
    
    return this.currentSessionId;
  }

  
  private isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const cutoffTime = new Date(Date.now() - this.sessionTimeoutMinutes * 60 * 1000);
    return session.lastActive > cutoffTime;
  }

  
  storeInteraction(
    sessionId: string | undefined,
    agentType: 'support' | 'dashboard',
    query: string,
    response: string,
    extractedData?: any,
    intent?: string
  ): string {
   
    const activeSessionId = sessionId || this.getOrCreateSession();
    
    const entry: MemoryEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: activeSessionId,
      timestamp: new Date(),
      query,
      response,
      extractedData,
      intent,
      agentType
    };

    let session = this.sessions.get(activeSessionId);
    if (!session) {
      session = {
        sessionId: activeSessionId,
        recentInteractions: [],
        createdAt: new Date(),
        lastActive: new Date()
      };
      this.sessions.set(activeSessionId, session);
    }

   
    session.lastActive = new Date();
    
    
    session.recentInteractions.push(entry);

   
    if (session.recentInteractions.length > this.maxInteractionsPerSession) {
      session.recentInteractions = session.recentInteractions.slice(-this.maxInteractionsPerSession);
    }

   
    this.updateContext(session, extractedData, intent);
    
   
    return activeSessionId;
  }

  
  private updateContext(session: SessionMemory, extractedData?: any, intent?: string): void {
    if (!extractedData) return;

    
    if (extractedData.email || extractedData.clientEmail) {
      session.clientContext = {
        ...session.clientContext,
        clientEmail: extractedData.email || extractedData.clientEmail,
        lastSearched: new Date()
      };
    }

    if (extractedData.name || extractedData.clientName) {
      session.clientContext = {
        ...session.clientContext,
        clientName: extractedData.name || extractedData.clientName,
        lastSearched: new Date()
      };
    }

    
    if (extractedData.serviceName || extractedData.service) {
      session.serviceContext = {
        ...session.serviceContext,
        serviceName: extractedData.serviceName || extractedData.service,
        lastInteraction: new Date()
      };
    }

    if (extractedData.serviceType) {
      session.serviceContext = {
        ...session.serviceContext,
        serviceType: extractedData.serviceType,
        lastInteraction: new Date()
      };
    }

    if (extractedData.orderId) {
      session.serviceContext = {
        ...session.serviceContext,
        orderId: extractedData.orderId,
        lastInteraction: new Date()
      };
    }
  }

  
  getContext(sessionId?: string): string {
    const activeSessionId = sessionId || this.currentSessionId;
    if (!activeSessionId) return '';
    
    const session = this.sessions.get(activeSessionId);
    if (!session) {
      return '';
    }

    let context = '';

    
    if (session.clientContext) {
      const client = session.clientContext;
      context += 'Recent client context:\n';
      if (client.clientEmail) context += `- Last searched client: ${client.clientEmail}\n`;
      if (client.clientName) context += `- Client name: ${client.clientName}\n`;
    }

   
    if (session.serviceContext) {
      const service = session.serviceContext;
      context += 'Recent service context:\n';
      if (service.serviceName) context += `- Last service: ${service.serviceName}\n`;
      if (service.serviceType) context += `- Service type: ${service.serviceType}\n`;
      if (service.orderId) context += `- Last order: ${service.orderId}\n`;
    }

    
    const recentQueries = session.recentInteractions
      .slice(-3)
      .map(entry => `- ${entry.query}`)
      .join('\n');

    if (recentQueries) {
      context += `\nRecent queries:\n${recentQueries}\n`;
    }

    return context;
  }

  
  getRecentInteractions(sessionId: string, limit: number = 5): MemoryEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    return session.recentInteractions.slice(-limit);
  }

 
  getClientContext(sessionId: string): ClientContext | undefined {
    const session = this.sessions.get(sessionId);
    return session?.clientContext;
  }

  
  getServiceContext(sessionId: string): ServiceContext | undefined {
    const session = this.sessions.get(sessionId);
    return session?.serviceContext;
  }

 
  needsContextResolution(query: string): boolean {
    const contextWords = [
      'that client', 'this client', 'the client',
      'that order', 'this order', 'the order',
      'that service', 'this service', 'the service',
      'them', 'it', 'he', 'she', 'they',
      'same client', 'same order', 'same service'
    ];

    const lowerQuery = query.toLowerCase();
    return contextWords.some(word => lowerQuery.includes(word));
  }

  
  resolveContext(sessionId: string | undefined, query: string): string {
    const activeSessionId = sessionId || this.currentSessionId;
    if (!activeSessionId) return query;
    
    const session = this.sessions.get(activeSessionId);
    if (!session || !this.needsContextResolution(query)) {
      return query;
    }

    let resolvedQuery = query;
    const lowerQuery = query.toLowerCase();

   
    if (session.clientContext) {
      const client = session.clientContext;
      if ((lowerQuery.includes('that client') || lowerQuery.includes('this client') || lowerQuery.includes('the client')) && client.clientEmail) {
        resolvedQuery = resolvedQuery.replace(/(that client|this client|the client)/gi, client.clientEmail);
      }
    }

   
    if (session.serviceContext) {
      const service = session.serviceContext;
      if ((lowerQuery.includes('that order') || lowerQuery.includes('this order') || lowerQuery.includes('the order')) && service.orderId) {
        resolvedQuery = resolvedQuery.replace(/(that order|this order|the order)/gi, `order ${service.orderId}`);
      }

    
      if ((lowerQuery.includes('that service') || lowerQuery.includes('this service') || lowerQuery.includes('the service')) && service.serviceName) {
        resolvedQuery = resolvedQuery.replace(/(that service|this service|the service)/gi, service.serviceName);
      }
    }

    return resolvedQuery;
  }

  
  private cleanupExpiredSessions(): void {
    const cutoffTime = new Date(Date.now() - this.sessionTimeoutMinutes * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActive < cutoffTime) {
        this.sessions.delete(sessionId);
      }
    }
  }

  
  getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId,
      totalInteractions: session.recentInteractions.length,
      hasClientContext: !!session.clientContext,
      hasServiceContext: !!session.serviceContext,
      createdAt: session.createdAt,
      lastActive: session.lastActive
    };
  }

  
  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }


  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  
  createNewSession(): string {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: SessionMemory = {
      sessionId: this.currentSessionId,
      recentInteractions: [],
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    this.sessions.set(this.currentSessionId, session);
    console.log(`🧠 Force created new session: ${this.currentSessionId}`);
    
    return this.currentSessionId;
  }
}


export const memoryService = new MemoryService();
