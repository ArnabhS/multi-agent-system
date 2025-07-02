import express from 'express'
import { clientCreated, enquiryCreated, orderCreated } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/client-created', clientCreated);
router.post('/order-created', orderCreated);
router.post('/enquiry-created', enquiryCreated);

export default router;