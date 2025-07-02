import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  status: 'completed' | 'failed' | 'pending';
  transactionId: string;
}

const PaymentSchema = new Schema<IPayment>({
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
},
  amount: { 
    type: Number, 
    required: true 
},
  paymentDate: { 
    type: Date, 
    default: Date.now 
},
  paymentMethod: { 
    type: String, 
    required: true 
},
  status: { 
    type: String, 
    enum: ['completed', 'failed', 'pending'], 
    default: 'pending' 
},
  transactionId: { 
    type: String, 
    required: true 
},
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);