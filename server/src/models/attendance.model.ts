import mongoose, { Schema, Document } from 'mongoose';


export interface IAttendance extends Document {
  classId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  date: Date;
  present: boolean;
  notes?: string;
}

const AttendanceSchema = new Schema<IAttendance>({
  classId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
},
  clientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
},
  date: { 
    type: Date, 
    required: true 
},
  present: { 
    type: Boolean,
    required: true 

},
  notes: { 
    type: String 
},
});


export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);