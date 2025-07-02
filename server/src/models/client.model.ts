import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  isActive: boolean;
  enrolledServices: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
  phone: { 
    type: String, 
    required: true 
},
  dateOfBirth: { 
    type: Date 
},
  isActive: { 
    type: Boolean, 
    default: true 
},
  enrolledServices: [{ 
    type: String 
}],
}, { timestamps: true });


export const Client = mongoose.model<IClient>('Client', ClientSchema);