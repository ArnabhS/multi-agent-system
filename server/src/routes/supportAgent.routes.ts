import express from 'express'
import { 
  createOrder, 
  getOrderStatus, 
  getWeeklyClasses, 
  supportAgentQueries,
  getSessionContext,
  clearSessionMemory,
  getActiveSessions,
  createNewSession
} from '../controllers/agent.controller';

const router = express.Router();

router.post('/query',supportAgentQueries);
router.post('/orders/create', createOrder);
router.get('/classes/weekly',getWeeklyClasses);
router.get('/orders/:orderId/status', getOrderStatus);

// Memory management routes
router.post('/memory/sessions/new', createNewSession);
router.get('/memory/sessions/:sessionId', getSessionContext);
router.delete('/memory/sessions/:sessionId', clearSessionMemory);
router.get('/memory/sessions', getActiveSessions);

export default router;