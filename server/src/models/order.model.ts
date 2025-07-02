import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  clientId: mongoose.Types.ObjectId;
  serviceType: 'course' | 'class';
  serviceId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
},
  clientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
},
  serviceType: { 
    type: String, 
    enum: ['course', 'class'], 
    required: true 
},
  serviceId: { 
    type: Schema.Types.ObjectId, 
    required: true 
},
  amount: { 
    type: Number, 
    required: true 
},
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled'], 
    default: 'pending' 
},
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);