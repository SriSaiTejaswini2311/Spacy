import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Space, SpaceDocument } from '../schemas/space.schema';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';

@Injectable()
export class SpacesService {
  constructor(
    @InjectModel(Space.name) private spaceModel: Model<SpaceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>
  ) {}

  async findAll(): Promise<Space[]> {
    return this.spaceModel.find({ isActive: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Space> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid space ID');
    }
    
    const space = await this.spaceModel.findById(id)
      .populate('owner', 'name email');
    
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    
    return space;
  }

  async findByOwner(ownerId: string): Promise<Space[]> {
    return this.spaceModel.find({ owner: new Types.ObjectId(ownerId) })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
  }

  async create(spaceData: Partial<Space>, ownerId: string): Promise<Space> {
    const space = new this.spaceModel({ 
      ...spaceData, 
      owner: ownerId,
      isActive: true 
    });
    
    return space.save();
  }

  async update(id: string, spaceData: Partial<Space>, ownerId: string): Promise<Space> {
    const space = await this.spaceModel.findOne({ _id: id, owner: ownerId });
    
    if (!space) {
      throw new UnauthorizedException('You can only update your own spaces');
    }
    
    Object.assign(space, spaceData);
    return space.save();
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.spaceModel.deleteOne({ _id: id, owner: ownerId });
    
    if (result.deletedCount === 0) {
      throw new UnauthorizedException('You can only delete your own spaces');
    }
  }

  async addPricingRule(id: string, pricingData: any, ownerId: string): Promise<Space> {
    const space = await this.spaceModel.findOne({ _id: id, owner: ownerId });
    
    if (!space) {
      throw new UnauthorizedException('You can only update your own spaces');
    }
    
    space.pricingRules.push(pricingData);
    return space.save();
  }

  async toggleAvailability(id: string, ownerId: string, isActive: boolean): Promise<Space> {
    const space = await this.spaceModel.findOne({ _id: id, owner: ownerId });
    
    if (!space) {
      throw new UnauthorizedException('You can only update your own spaces');
    }
    
    space.isActive = isActive;
    return space.save();
  }

  async searchSpaces(query: any): Promise<Space[]> {
    const { location, minCapacity, maxPrice, amenities, date, startTime, endTime } = query;
    
    let filter: any = { isActive: true };
    
    if (location) {
      filter.address = { $regex: location, $options: 'i' };
    }
    
    if (minCapacity) {
      filter.capacity = { $gte: parseInt(minCapacity) };
    }
    
    if (maxPrice) {
      filter['pricingRules.0.rate'] = { $lte: parseInt(maxPrice) };
    }
    
    if (amenities) {
      filter.amenities = { $all: amenities.split(',') };
    }
    
    // If date and time are provided, check for availability
    if (date && startTime && endTime) {
      const requestedStart = new Date(`${date}T${startTime}`);
      const requestedEnd = new Date(`${date}T${endTime}`);
      
      // Find spaces that don't have conflicting reservations
      const conflictingReservations = await this.reservationModel.find({
        status: { $in: ['confirmed', 'checked_in'] },
        $or: [
          { startTime: { $lt: requestedEnd }, endTime: { $gt: requestedStart } },
        ],
      }).select('space');
      
      const conflictingSpaceIds = conflictingReservations.map(r => r.space.toString());
      filter._id = { $nin: conflictingSpaceIds };
    }
    
    return this.spaceModel.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
  }
}