# 🚀 Fanpit Spaces - Complete Implementation Guide

## 📋 Hackathon Checklist

### ✅ Pre-Setup (Complete these first)
- [ ] Create GitHub repository
- [ ] Create Razorpay test account
- [ ] Setup MongoDB Atlas cluster
- [ ] Prepare development environment

## 🏗️ Phase 1: Project Architecture & Setup

### Step 1: Initialize Project Structure
```bash
# Create main project directory
mkdir fanpit-spaces
cd fanpit-spaces

# Initialize backend (NestJS)
npx @nestjs/cli new backend
cd backend

# Install required dependencies
npm install @nestjs/mongoose @nestjs/jwt @nestjs/passport @nestjs/config
npm install mongoose bcryptjs jsonwebtoken passport passport-jwt
npm install razorpay nodemailer qrcode
npm install class-validator class-transformer
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/passport-jwt

# Initialize frontend (Next.js 15)
cd ..
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend

# Install frontend dependencies
npm install axios react-hook-form @hookform/resolvers zod
npm install razorpay @types/razorpay
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-select
npm install date-fns react-calendar
```

### Step 2: Environment Configuration

#### Backend Environment (.env)
```bash
# Create backend/.env
cat > backend/.env << 'EOF'
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fanpit-spaces?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF
```

#### Frontend Environment (.env.local)
```bash
# Create frontend/.env.local
cat > frontend/.env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Database (for API routes)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fanpit-spaces?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
EOF
```

## 🔧 Phase 2: Backend Implementation

### Step 3: Database Schemas

#### User Schema (backend/src/schemas/user.schema.ts)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['consumer', 'brand_owner', 'staff'], default: 'consumer' })
  role: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  emailVerifiedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

#### Space Schema (backend/src/schemas/space.schema.ts)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PricingRule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['hourly', 'daily', 'monthly', 'special_event'] })
  type: string;

  @Prop({ required: true })
  rate: number;

  @Prop({ default: false })
  isPeakHour: boolean;

  @Prop({ default: 1 })
  multiplier: number;

  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop([String])
  daysOfWeek?: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export type SpaceDocument = Space & Document;

@Schema({ timestamps: true })
export class Space {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  capacity: number;

  @Prop([String])
  amenities: string[];

  @Prop([String])
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [PricingRule], default: [] })
  pricingRules: PricingRule[];

  @Prop({ default: 0 })
  basePrice: number;

  @Prop({ type: Object })
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop([String])
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;
}

export const SpaceSchema = SchemaFactory.createForClass(Space);
SpaceSchema.index({ location: '2dsphere' });
```

#### Reservation Schema (backend/src/schemas/reservation.schema.ts)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Space', required: true })
  space: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, enum: Object.values(ReservationStatus), default: ReservationStatus.PENDING })
  status: ReservationStatus;

  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpayPaymentId?: string;

  @Prop()
  checkInTime?: Date;

  @Prop()
  checkOutTime?: Date;

  @Prop()
  checkInCode?: string;

  @Prop()
  promoCode?: string;

  @Prop()
  discount?: number;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  checkedInBy?: Types.ObjectId;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
```

### Step 4: Authentication Module

#### JWT Strategy (backend/src/auth/jwt.strategy.ts)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub).select('-password');
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

#### Auth Service (backend/src/auth/auth.service.ts)
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(name: string, email: string, password: string, role: string = 'consumer') {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    return this.generateTokens(user);
  }

  private async generateTokens(user: UserDocument) {
    const payload = { 
      sub: user._id, 
      email: user.email, 
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    // Store refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }
}
```

### Step 5: Spaces Module

#### Spaces Service (backend/src/spaces/spaces.service.ts)
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Space, SpaceDocument } from '../schemas/space.schema';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    @InjectModel(Space.name) private spaceModel: Model<SpaceDocument>,
  ) {}

  async create(createSpaceDto: CreateSpaceDto, ownerId: string): Promise<Space> {
    const space = new this.spaceModel({
      ...createSpaceDto,
      owner: ownerId,
    });
    return space.save();
  }

  async findAll(filters?: any): Promise<Space[]> {
    const query = { isActive: true, ...filters };
    return this.spaceModel
      .find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Space> {
    const space = await this.spaceModel
      .findById(id)
      .populate('owner', 'name email')
      .exec();
    
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    return space;
  }

  async update(id: string, updateSpaceDto: UpdateSpaceDto, userId: string): Promise<Space> {
    const space = await this.spaceModel.findById(id);
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.owner.toString() !== userId) {
      throw new ForbiddenException('You can only update your own spaces');
    }

    return this.spaceModel
      .findByIdAndUpdate(id, updateSpaceDto, { new: true })
      .populate('owner', 'name email')
      .exec();
  }

  async remove(id: string, userId: string): Promise<void> {
    const space = await this.spaceModel.findById(id);
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.owner.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own spaces');
    }

    await this.spaceModel.findByIdAndUpdate(id, { isActive: false });
  }

  async findByOwner(ownerId: string): Promise<Space[]> {
    return this.spaceModel
      .find({ owner: ownerId, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async calculatePrice(spaceId: string, startTime: Date, endTime: Date): Promise<number> {
    const space = await this.findOne(spaceId);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Find applicable pricing rule
    const applicableRule = space.pricingRules.find(rule => {
      if (!rule.isActive) return false;
      
      // Check time-based rules
      if (rule.startTime && rule.endTime) {
        const startHour = parseInt(rule.startTime.split(':')[0]);
        const endHour = parseInt(rule.endTime.split(':')[0]);
        const bookingHour = startTime.getHours();
        
        if (bookingHour < startHour || bookingHour > endHour) {
          return false;
        }
      }
      
      // Check day-based rules
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayName = startTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
        if (!rule.daysOfWeek.includes(dayName)) {
          return false;
        }
      }
      
      return true;
    });

    const baseRate = applicableRule?.rate || space.basePrice || 100;
    const multiplier = applicableRule?.multiplier || 1;
    
    return Math.round(baseRate * durationHours * multiplier);
  }
}
```

### Step 6: Reservations Module

#### Reservations Service (backend/src/reservations/reservations.service.ts)
```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument, ReservationStatus } from '../schemas/reservation.schema';
import { SpacesService } from '../spaces/spaces.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private spacesService: SpacesService,
    private paymentsService: PaymentsService,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string): Promise<any> {
    const { spaceId, startTime, endTime } = createReservationDto;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate booking time
    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    if (start < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Check space availability
    const space = await this.spacesService.findOne(spaceId);
    const overlappingReservations = await this.reservationModel.find({
      space: spaceId,
      status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    if (overlappingReservations.length > 0) {
      throw new BadRequestException('Space is not available for the selected time');
    }

    // Calculate pricing
    const totalAmount = await this.spacesService.calculatePrice(spaceId, start, end);

    // Create Razorpay order
    const order = await this.paymentsService.createOrder(totalAmount);

    // Generate check-in code
    const checkInCode = this.generateCheckInCode();

    const reservation = new this.reservationModel({
      user: userId,
      space: spaceId,
      startTime: start,
      endTime: end,
      totalAmount,
      razorpayOrderId: order.id,
      checkInCode,
      status: ReservationStatus.PENDING,
    });

    await reservation.save();
    await reservation.populate(['space', 'user']);

    return {
      reservation,
      razorpayOrder: order,
      checkInCode,
    };
  }

  async findAll(userId: string, userRole: string, filters?: any): Promise<Reservation[]> {
    let query: any = { ...filters };

    if (userRole === 'consumer') {
      query.user = userId;
    } else if (userRole === 'brand_owner') {
      // Get spaces owned by this user
      const ownedSpaces = await this.spacesService.findByOwner(userId);
      const spaceIds = ownedSpaces.map(space => space._id);
      query.space = { $in: spaceIds };
    }
    // Staff can see all reservations

    return this.reservationModel
      .find(query)
      .populate(['space', 'user'])
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate(['space', 'user'])
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check access permissions
    if (userRole === 'consumer' && reservation.user._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own reservations');
    }

    if (userRole === 'brand_owner') {
      const space = await this.spacesService.findOne(reservation.space._id.toString());
      if (space.owner.toString() !== userId) {
        throw new ForbiddenException('You can only view reservations for your spaces');
      }
    }

    return reservation;
  }

  async updatePaymentStatus(orderId: string, paymentId: string, status: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findOne({ razorpayOrderId: orderId });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.razorpayPaymentId = paymentId;
    reservation.status = status === 'confirmed' ? ReservationStatus.CONFIRMED : ReservationStatus.CANCELLED;

    await reservation.save();
    return reservation;
  }

  async checkIn(checkInCode: string, staffId?: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findOne({ checkInCode, status: ReservationStatus.CONFIRMED })
      .populate(['space', 'user']);

    if (!reservation) {
      throw new NotFoundException('Invalid check-in code or reservation not found');
    }

    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);

    // Allow check-in 15 minutes before start time
    if (now < new Date(startTime.getTime() - 15 * 60 * 1000)) {
      throw new BadRequestException('Check-in not allowed yet');
    }

    if (now > endTime) {
      throw new BadRequestException('Reservation has expired');
    }

    reservation.checkInTime = now;
    if (staffId) {
      reservation.checkedInBy = staffId as any;
    }

    await reservation.save();
    return reservation;
  }

  async checkOut(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (!reservation.checkInTime) {
      throw new BadRequestException('Cannot check out without checking in first');
    }

    reservation.checkOutTime = new Date();
    reservation.status = ReservationStatus.COMPLETED;

    await reservation.save();
    return reservation;
  }

  async markNoShow(reservationId: string, staffId: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.status = ReservationStatus.NO_SHOW;
    reservation.checkedInBy = staffId as any;

    await reservation.save();
    return reservation;
  }

  async generateQRCode(checkInCode: string): Promise<string> {
    try {
      const qrCodeData = await QRCode.toDataURL(checkInCode);
      return qrCodeData;
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  private generateCheckInCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async getTodayReservations(): Promise<Reservation[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.reservationModel
      .find({
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
      })
      .populate(['space', 'user'])
      .sort({ startTime: 1 })
      .exec();
  }
}
```

### Step 7: Payments Module

#### Payments Service (backend/src/payments/payments.service.ts)
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(amount: number, currency: string = 'INR'): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    try {
      const hmac = crypto.createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'));
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');
      
      return generatedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<any> {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.configService.get('RAZORPAY_WEBHOOK_SECRET'))
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new BadRequestException('Invalid webhook signature');
      }

      return payload;
    } catch (error) {
      throw new BadRequestException('Webhook verification failed');
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundData: any = { payment_id: paymentId };
      if (amount) {
        refundData.amount = amount * 100; // amount in paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      return refund;
    } catch (error) {
      throw new BadRequestException(`Failed to process refund: ${error.message}`);
    }
  }
}
```

## 🎨 Phase 3: Frontend Implementation

### Step 8: Authentication Context

#### Auth Context (frontend/src/context/AuthContext.tsx)
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      api.get('/auth/me')
        .then(response => setUser(response.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    localStorage.setItem('token', accessToken);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { accessToken, user: userData } = response.data;
    
    localStorage.setItem('token', accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshToken = async () => {
    // Implement refresh token logic
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Step 9: Complete Frontend Components

#### Enhanced Login Page (frontend/src/app/login/page.tsx)
```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      router.push('/spaces');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Fanpit Spaces
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Accounts:</h3>
              <div className="text-xs text-blue-600 space-y-1">
                <div>Consumer: consumer@demo.com / demo123</div>
                <div>Brand Owner: owner@demo.com / demo123</div>
                <div>Staff: staff@demo.com / demo123</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
```

## 🚀 Phase 4: Deployment & Final Steps

### Step 10: Deployment Commands

#### Backend Deployment (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set RAZORPAY_KEY_ID="your-razorpay-key"
railway variables set RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Deploy
railway up
```

#### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-backend-url
# NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
```

### Step 11: Testing & API Collection

#### Create Postman Collection
```json
{
  "info": {
    "name": "Fanpit Spaces API",
    "description": "Complete API collection for Fanpit Spaces platform"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://your-backend-url"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

### Step 12: Final Checklist

#### Pre-Submission Checklist
- [ ] All environment variables configured
- [ ] Database seeded with demo data
- [ ] Razorpay test integration working
- [ ] All user roles functional
- [ ] Responsive design tested
- [ ] API collection exported
- [ ] README updated with demo URLs
- [ ] Repository made private with collaborators added
- [ ] Demo accounts created and tested

#### Submission Steps
1. **Final Testing**: Test all user flows end-to-end
2. **Documentation**: Update README with live URLs
3. **API Collection**: Export Postman collection
4. **Repository**: Ensure all code is pushed
5. **Form Submission**: Submit at https://forms.gle/oDK22oSTXsDjN7oW6

## 🎯 Success Metrics

### Technical Excellence
- ✅ Clean, modular code architecture
- ✅ Proper error handling and validation
- ✅ Security best practices implemented
- ✅ Responsive, accessible UI/UX
- ✅ Complete payment integration
- ✅ Real-time features working

### Business Logic
- ✅ Multi-role authentication system
- ✅ Sophisticated pricing engine
- ✅ Conflict-free booking system
- ✅ Staff management dashboard
- ✅ Payment webhook handling
- ✅ QR code check-in system

### Deployment & Performance
- ✅ Production-ready deployment
- ✅ Environment configuration
- ✅ Database optimization
- ✅ API performance
- ✅ Frontend optimization
- ✅ Mobile responsiveness

---

**Good luck with your hackathon! 🚀**

Remember: Start with MVP, iterate quickly, and focus on core functionality first. The judges will appreciate a working system over incomplete advanced features.