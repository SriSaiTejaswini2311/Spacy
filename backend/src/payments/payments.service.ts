import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_RHSYT9Kk2MlI4e',
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET') || 'r7UpZMKke6GUdXuwn0HBoJtR',
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    try {
      const options = {
        amount: amount * 100, // amount in paise
        currency,
        receipt,
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'));
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === signature;
  }

  async handleSuccessfulPayment(paymentId: string, orderId: string, amount: number) {
    try {
      const reservation = await this.reservationModel.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { 
          status: 'confirmed',
          paymentId: paymentId,
          paidAmount: amount
        },
        { new: true }
      );
      
      return reservation;
    } catch (error) {
      throw new Error(`Failed to update reservation: ${error.message}`);
    }
  }

  async refundPayment(paymentId: string, amount: number) {
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
      };

      const refund = await this.razorpay.payments.refund(paymentId, options);
      return refund;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }
}