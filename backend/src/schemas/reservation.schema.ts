import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Space } from './space.schema';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Space', required: true })
  space: Space;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  })
  status: string;

  @Prop()
  razorpayOrderId: string;

  @Prop()
  paymentId: string;

  @Prop()
  paidAmount: number;

  @Prop()
  checkInTime: Date;

  @Prop()
  checkOutTime: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);