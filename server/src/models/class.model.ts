import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  courseId?: mongoose.Types.ObjectId;
  instructor: string;
  date: Date;
  duration: number; // in minutes
  maxStudents: number;
  currentEnrollment: number;
  price: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

const ClassSchema = new Schema<IClass>({
  name: { 
    type: String, 
    required: true 
},
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course' 
},
  instructor: { 
    type: String, 
    required: true 
},
  date: { 
    type: Date, 
    required: true 
},
  duration: { 
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
  price: { 
    type: Number, 
    required: true 
},
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
},
});

export const Class = mongoose.model<IClass>('Class', ClassSchema);