import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
import { SpacesService } from '../spaces/spaces.service';

enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out'
}
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private spaceService: SpacesService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async findAll(userId: string, userRole: string): Promise<Reservation[]> {
    let query = {};
    if (userRole === 'consumer') {
      query = { user: userId };
    } else if (userRole === 'brand_owner') {
      // Get spaces owned by this user first
      const userSpaces = await this.spaceService.findByOwner(userId);
      const spaceIds = userSpaces.map(space => (space as any)._id);
      query = { space: { $in: spaceIds } };
    } else if (userRole === 'staff') {
      // Staff should only see today's reservations
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      query = {
        startTime: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['confirmed', 'checked_in'] }
      };
    }
    
    return this.reservationModel.find(query)
      .populate('space', 'name address images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id)
      .populate('space')
      .populate('user', 'name email');
    
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    // Authorization checks
    if (userRole === 'consumer' && (reservation.user as any)._id.toString() !== userId) {
      throw new UnauthorizedException('You can only view your own reservations');
    }
    
    if (userRole === 'brand_owner') {
      const space = await this.spaceService.findOne((reservation.space as any)._id.toString());
      if ((space as any).owner.toString() !== userId) {
        throw new UnauthorizedException('You can only view reservations for your spaces');
      }
    }
    
    return reservation;
  }

  async create(reservationData: any, userId: string): Promise<Reservation> {
    const { space: spaceId, startTime, endTime, totalAmount } = reservationData;

    // Validate required fields
    if (!spaceId || !startTime || !endTime) {
      throw new BadRequestException('Space ID, start time, and end time are required');
    }

    // Validate time inputs
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    
    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }
    
    if (start < new Date()) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    // Get space details to calculate price
    const space = await this.spaceService.findOne(spaceId);
    
    if (!(space as any).isActive) {
      throw new BadRequestException('This space is not available for booking');
    }

    // Check for overlapping reservations
    const overlappingReservations = await this.reservationModel.find({
      space: spaceId,
      status: { $in: ['confirmed', 'pending', 'checked_in'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    if (overlappingReservations.length > 0) {
      throw new BadRequestException('This space is already booked for the selected time slot');
    }

    // Calculate price based on duration and pricing rules
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const baseRate = (space as any).pricingRules?.[0]?.rate || 100;
    const calculatedAmount = Math.round(baseRate * durationHours);
    
    // Use provided total amount or calculated amount
    const finalAmount = totalAmount || calculatedAmount;

    const reservation = new this.reservationModel({
      user: userId,
      space: spaceId,
      startTime: start,
      endTime: end,
      totalAmount: finalAmount,
      status: 'pending',
    });

    await reservation.save();
    return reservation.populate('space', 'name address images');
  }

  async update(id: string, updateData: Partial<Reservation>): Promise<Reservation> {
    return this.reservationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async updatePaymentStatus(orderId: string, paymentId: string, status: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findOne({ razorpayOrderId: orderId });
    
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    (reservation as any).paymentId = paymentId;
    reservation.status = status === 'success' ? 'confirmed' : 'cancelled';
    
    await reservation.save();
    return reservation.populate('space user', 'name email address');
  }

  async cancelReservation(id: string, userId: string): Promise<Reservation> {
    // First check if reservation exists
    const reservation = await this.reservationModel.findById(id);
    
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    // Check if user owns this reservation
    if (reservation.user.toString() !== userId) {
      throw new UnauthorizedException('You can only cancel your own reservations');
    }
    
    // Check if reservation can be cancelled
    if (!['pending', 'confirmed'].includes(reservation.status)) {
      throw new BadRequestException('This reservation cannot be cancelled');
    }
    
    // Allow cancellation only if start time is at least 2 hours away
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (new Date(reservation.startTime) < twoHoursFromNow) {
      throw new BadRequestException('Reservation can only be cancelled at least 2 hours before start time');
    }
    
    reservation.status = 'cancelled';
    await reservation.save();
    
    return reservation.populate('space', 'name address');
  }

  async getTodayReservations(): Promise<Reservation[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    return this.reservationModel.find({
      startTime: { $gte: todayStart, $lte: todayEnd },
      status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] }
    })
    .populate('space', 'name address')
    .populate('user', 'name email')
    .sort({ startTime: 1 })
    .exec();
  }

  async checkIn(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(reservationId);
    
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed reservations can be checked in');
    }
    
    // Allow check-in 15 minutes before start time
    const fifteenMinutesBefore = new Date(reservation.startTime);
    fifteenMinutesBefore.setMinutes(fifteenMinutesBefore.getMinutes() - 15);
    
    if (new Date() < fifteenMinutesBefore) {
      throw new BadRequestException('Check-in is only allowed 15 minutes before the reservation time');
    }
    
    reservation.status = ReservationStatus.CHECKED_IN;
    (reservation as any).checkInTime = new Date();
    await reservation.save();
    
    return reservation.populate('space user', 'name email address');
  }

  async checkOut(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(reservationId);
    
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('Only checked-in reservations can be checked out');
    }
    
    reservation.status = ReservationStatus.CHECKED_OUT;
    (reservation as any).checkOutTime = new Date();
    await reservation.save();
    
    return reservation.populate('space user', 'name email address');
  }
}