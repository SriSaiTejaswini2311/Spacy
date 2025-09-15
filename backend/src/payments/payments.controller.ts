import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ReservationsService } from '../reservations/reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Body() body: any) {
    const { orderId, paymentId, signature, amount } = body;
    
    const isValid = await this.paymentsService.verifyPaymentSignature(orderId, paymentId, signature);
    
    if (isValid) {
      const reservation = await this.paymentsService.handleSuccessfulPayment(paymentId, orderId, amount);
      return { 
        status: 'success', 
        message: 'Payment verified successfully',
        reservation 
      };
    } else {
      await this.reservationsService.updatePaymentStatus(orderId, paymentId, 'failed');
      throw new Error('Invalid payment signature');
    }
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  async processRefund(@Body() body: any) {
    const { paymentId, amount, reservationId } = body;
    
    try {
      const refund = await this.paymentsService.refundPayment(paymentId, amount);
      
      // Update reservation status to refunded
      const reservation = await this.reservationsService.findOne(reservationId, '', 'admin');
      await this.reservationsService.updatePaymentStatus(reservationId, paymentId, 'refunded');
      
      return { 
        status: 'success', 
        message: 'Refund processed successfully',
        refund 
      };
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }
}