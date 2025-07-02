import express from 'express'
import { createOrder, getOrderStatus, getWeeklyClasses, supportAgentQueries } from '../controllers/agent.controller';

const router = express.Router();

router.post('/query',supportAgentQueries);
router.post('/orders/create', createOrder);
router.get('/classes/weekly',getWeeklyClasses);
router.get('/orders/:orderId/status', getOrderStatus);


export default router;