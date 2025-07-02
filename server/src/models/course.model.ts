import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  description: string;
  instructor: string;
  duration: number; // in weeks
  price: number;
  maxStudents: number;
  currentEnrollment: number;
  status: 'active' | 'inactive' | 'completed';
  startDate: Date;
  endDate: Date;
}

const CourseSchema = new Schema<ICourse>({
  name: { 
    type: String, 
    required: true 
},
  description: { 
    type: String, 
    required: true 
},
  instructor: { 
    type: String, 
    required: true 
},
  duration: { 
    type: Number, 
    required: true 
},
  price: { 
    type: Number, 
    required: true 
},
  maxStudents: { 
    type: Number, 
    required: true 
},
  currentEnrollment: { 
    type: Number, 
    default: 0 
},
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'completed'], 
    default: 'active' 
},
  startDate: { 
    type: Date, 
    required: true 
},
  endDate: { 
    type: Date, 
    required: true 
},
});


export const Course = mongoose.model<ICourse>('Course', CourseSchema);