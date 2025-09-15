import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PaymentsService } from '../payments/payments.service';
import { Reservation } from '../schemas/reservation.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() reservationData: any, @Request() req): Promise<{ reservation: Reservation; order?: any }> {
    try {
      // First create the reservation with pending status
      const reservation = await this.reservationsService.create(
        reservationData, 
        req.user.userId
      );

      // Create Razorpay order
      const order = await this.paymentsService.createOrder(
        reservation.totalAmount,
        'INR',
        `receipt_${(reservation as any)._id}`
      );

      // Update reservation with Razorpay order ID
      await this.reservationsService.update((reservation as any)._id, {
        razorpayOrderId: order.id
      });

      return { reservation, order };
    } catch (error) {
      console.error('Reservation creation error:', error);
      throw error;
    }
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Body() paymentData: any, @Request() req) {
    const { orderId, paymentId, signature, amount } = paymentData;
    
    const isValid = await this.paymentsService.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update reservation status to confirmed
    const reservation = await this.paymentsService.handleSuccessfulPayment(
      paymentId,
      orderId,
      amount
    );

    return { success: true, reservation };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req): Promise<Reservation[]> {
    return this.reservationsService.findAll(req.user.userId, req.user.role);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string, @Request() req): Promise<Reservation> {
    return this.reservationsService.cancelReservation(id, req.user.userId);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard)
  async getTodayReservations(@Request() req): Promise<Reservation[]> {
    if (req.user.role !== 'staff') {
      throw new Error('Only staff can access this endpoint');
    }
    return this.reservationsService.getTodayReservations();
  }

  @Patch(':id/checkin')
  @UseGuards(JwtAuthGuard)
  async checkIn(@Param('id') id: string, @Request() req): Promise<Reservation> {
    if (req.user.role !== 'staff') {
      throw new Error('Only staff can check in reservations');
    }
    return this.reservationsService.checkIn(id);
  }

  @Patch(':id/checkout')
  @UseGuards(JwtAuthGuard)
  async checkOut(@Param('id') id: string, @Request() req): Promise<Reservation> {
    if (req.user.role !== 'staff') {
      throw new Error('Only staff can check out reservations');
    }
    return this.reservationsService.checkOut(id);
  }
}