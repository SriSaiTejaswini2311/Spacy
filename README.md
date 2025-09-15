# Spacy - Full-Stack Space Booking Platform

## 🎯 Project Overview
A production-ready platform for booking event spaces, co-working areas, and casual third spaces with complete user management, space management, and reservation system.

## 🚀 Live Demo
- **Frontend**: https://frontend-feqnw2yh1.vercel.app
- **Backend API**: https://acceptable-fulfillment-production-e219.up.railway.app

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Custom hooks
- **Deployment**: Vercel

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens)
- **Deployment**: Railway

## 🔐 User Roles & Capabilities

### Consumer
- Browse spaces (public access)
- Sign-up/login with email + password
- View space details with pricing
- Make reservations
- View/cancel own reservations

### Brand Owner
- All consumer capabilities
- CRUD operations on own spaces
- Upload space images and details
- Configure pricing rules
- View/manage reservations for their spaces
- Dashboard with space analytics

### Staff
- View daily reservation list
- Manage space occupancy
- Basic reservation management

## 🛠️ Tech Stack

### Frontend Dependencies
```json
{
  "next": "15.5.3",
  "react": "19.1.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "react-hook-form": "^7.62.0",
  "zod": "^4.1.8",
  "@hookform/resolvers": "^5.2.1",
  "axios": "^1.12.1"
}
```

### Backend Dependencies
```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/mongoose": "^10.0.2",
  "@nestjs/jwt": "^10.1.1",
  "@nestjs/passport": "^10.0.0",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3"
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Installation
```bash
# Clone repository
git clone https://github.com/SriSaiTejaswini2311/Spacy.git
cd Spacy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spacy
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=3001
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development
```bash
# Start backend (Terminal 1)
cd backend
npm run start:dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

## 📱 Features Implemented

### ✅ Core Features
- [x] Multi-role authentication (Consumer, Brand Owner, Staff)
- [x] JWT access + refresh token system
- [x] Space CRUD operations with image upload
- [x] Real-time space browsing
- [x] Reservation system
- [x] Owner-based space management
- [x] Responsive design with Tailwind CSS

### 🎯 Advanced Features
- [x] Dynamic pricing with hourly rates
- [x] Owner-specific dashboards
- [x] Space filtering by owner
- [x] Professional UI with custom logos
- [x] Role-based access control (RBAC)
- [x] Reservation management
- [x] Space edit/delete functionality

## 🔒 Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- Secure password hashing with bcrypt
- CORS configuration
- Owner-only space modifications

## 📊 Database Schema

### User Schema
```typescript
{
  name: string;
  email: string (unique);
  password: string (hashed);
  role: 'consumer' | 'brand_owner' | 'staff';
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Space Schema
```typescript
{
  name: string;
  description: string;
  about?: string;
  address: string;
  capacity: number;
  amenities: string[];
  images: string[];
  owner: ObjectId (User);
  pricingRules: PricingRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Reservation Schema
```typescript
{
  user: ObjectId (User);
  space: ObjectId (Space);
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 UI/UX Design
- Mobile-first responsive design
- Clean, modern interface with custom branding
- Intuitive navigation with role-based menus
- Real-time feedback for user actions
- Loading states and error handling
- Professional logo integration

## 🔄 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Spaces
- `GET /spaces` - List all spaces (public)
- `GET /spaces/my/spaces` - Get owner's spaces (Brand Owner)
- `GET /spaces/:id` - Get space details
- `POST /spaces` - Create space (Brand Owner)
- `PUT /spaces/:id` - Update space (Brand Owner)
- `DELETE /spaces/:id` - Delete space (Brand Owner)

### Reservations
- `GET /reservations` - List user reservations
- `POST /reservations` - Create reservation
- `PATCH /reservations/:id/cancel` - Cancel reservation

## 📁 Project Structure

```
Spacy/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── spaces/         # Space management
│   │   ├── reservations/   # Reservation system
│   │   ├── schemas/        # MongoDB schemas
│   │   └── main.ts         # Application entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts
│   │   ├── lib/           # Utilities
│   │   └── design-assets/ # Logos and assets
│   ├── package.json
│   └── next.config.js
└── README.md
```

## 🎯 Key Features Breakdown

### Space Management
- **Create Spaces**: Brand owners can add new spaces with details, images, and pricing
- **Edit Spaces**: Update space information, amenities, and pricing
- **Delete Spaces**: Remove spaces with confirmation dialog
- **Owner Filtering**: Dashboard shows only spaces owned by logged-in user

### Reservation System
- **Browse Spaces**: Public access to view all available spaces
- **Book Spaces**: Select time slots and make reservations
- **Manage Reservations**: View and cancel existing bookings
- **Status Tracking**: Track reservation status (pending, confirmed, cancelled, completed)

### User Management
- **Multi-Role System**: Consumer, Brand Owner, Staff roles
- **Secure Authentication**: JWT-based login with refresh tokens
- **Role-Based Access**: Different permissions for different user types
- **Profile Management**: User registration and login system

## 🚀 Deployment

### Frontend (Vercel)
- Automatic deployments from Git
- Environment variables configured
- Custom domain support
- CDN optimization

### Backend (Railway)
- Docker-based deployment
- MongoDB Atlas integration
- Environment variables management
- Automatic scaling

## 📈 Performance Optimizations
- Next.js SSR/SSG for better SEO
- Image optimization with Next.js Image component
- API response optimization
- Database query optimization
- Lazy loading for components

## 🧪 Testing
- API endpoint testing
- Form validation testing
- Role-based access testing
- Edge case handling

## 🎯 Future Enhancements
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Real-time notifications
- [ ] Advanced search and filters
- [ ] Calendar integration
- [ ] Mobile app development
- [ ] Analytics dashboard
- [ ] Review and rating system

## 👥 Demo Accounts
- **Consumer**: consumer@demo.com / demo123
- **Brand Owner**: owner@demo.com / demo123
- **Staff**: staff@demo.com / demo123

## 🤝 Contributing
This is a private repository. Please contact the repository owner for contribution guidelines.

## 📞 Support
For any issues or questions, please contact the repository owner.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, NestJS, MongoDB, and TypeScript**

### 🏆 Project Highlights
- **Full-Stack TypeScript**: End-to-end type safety
- **Production Ready**: Deployed and scalable architecture
- **Modern Tech Stack**: Latest versions of frameworks and libraries
- **Security First**: JWT authentication and role-based access
- **Responsive Design**: Works on all devices
- **Professional UI**: Custom branding and clean interface
- **Owner Management**: Complete space ownership system
- **Real-time Features**: Live updates and notifications ready