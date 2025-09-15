#!/bin/bash

# Fanpit Spaces - Environment Setup Script
# This script sets up the complete development environment

echo "🚀 Setting up Fanpit Spaces Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version check passed: $(node -v)"

# Create project structure
print_info "Creating project structure..."

# Backend setup
print_info "Setting up backend (NestJS)..."
cd backend

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install @nestjs/mongoose @nestjs/jwt @nestjs/passport @nestjs/config
npm install mongoose bcryptjs jsonwebtoken passport passport-jwt
npm install razorpay nodemailer qrcode
npm install class-validator class-transformer
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/passport-jwt @types/qrcode

print_status "Backend dependencies installed"

# Create backend environment file
if [ ! -f .env ]; then
    print_info "Creating backend .env file..."
    cat > .env << 'EOF'
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fanpit-spaces?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=fanpit-spaces-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=fanpit-spaces-refresh-secret-key-min-32-characters-long
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF
    print_status "Backend .env file created"
    print_warning "Please update the .env file with your actual credentials"
else
    print_info "Backend .env file already exists"
fi

# Frontend setup
cd ../frontend
print_info "Setting up frontend (Next.js 15)..."

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install axios react-hook-form @hookform/resolvers zod
npm install razorpay @types/razorpay
npm install lucide-react date-fns
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast

print_status "Frontend dependencies installed"

# Create frontend environment file
if [ ! -f .env.local ]; then
    print_info "Creating frontend .env.local file..."
    cat > .env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Razorpay Configuration (Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# Database (for API routes if needed)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fanpit-spaces?retryWrites=true&w=majority
JWT_SECRET=fanpit-spaces-super-secret-jwt-key-min-32-characters-long

# Environment
NODE_ENV=development
EOF
    print_status "Frontend .env.local file created"
    print_warning "Please update the .env.local file with your actual credentials"
else
    print_info "Frontend .env.local file already exists"
fi

# Create package.json scripts for easy development
cd ..
if [ ! -f package.json ]; then
    print_info "Creating root package.json with development scripts..."
    cat > package.json << 'EOF'
{
  "name": "fanpit-spaces",
  "version": "1.0.0",
  "description": "Full-stack space booking platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run start:dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "cd backend && npm run start:prod",
    "start:frontend": "cd frontend && npm run start",
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "clean": "rm -rf node_modules backend/node_modules frontend/node_modules backend/dist frontend/.next"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "keywords": ["nestjs", "nextjs", "mongodb", "razorpay", "booking", "spaces"],
  "author": "SriSaiTejaswini2311",
  "license": "MIT"
}
EOF
    npm install
    print_status "Root package.json created with development scripts"
fi

# Create development startup script
print_info "Creating development startup script..."
cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Fanpit Spaces Development Environment..."

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "❌ Backend .env file not found. Please create it first."
    exit 1
fi

if [ ! -f frontend/.env.local ]; then
    echo "❌ Frontend .env.local file not found. Please create it first."
    exit 1
fi

# Start both backend and frontend
echo "🔧 Starting backend and frontend servers..."
npm run dev
EOF

chmod +x start-dev.sh
print_status "Development startup script created"

# Create deployment scripts
print_info "Creating deployment scripts..."

# Backend deployment script
cat > deploy-backend.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

cd backend

# Build the application
echo "🔧 Building backend..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Backend deployment completed!"
EOF

chmod +x deploy-backend.sh

# Frontend deployment script
cat > deploy-frontend.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

cd frontend

# Build the application
echo "🔧 Building frontend..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
EOF

chmod +x deploy-frontend.sh

print_status "Deployment scripts created"

# Create database seeding script
print_info "Creating database seeding script..."
cat > seed-database.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// Import schemas (you'll need to adjust paths based on your structure)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['consumer', 'brand_owner', 'staff'], default: 'consumer' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    // Create demo users
    const demoUsers = [
      {
        name: 'Demo Consumer',
        email: 'consumer@demo.com',
        password: await bcrypt.hash('demo123', 12),
        role: 'consumer'
      },
      {
        name: 'Demo Brand Owner',
        email: 'owner@demo.com',
        password: await bcrypt.hash('demo123', 12),
        role: 'brand_owner'
      },
      {
        name: 'Demo Staff',
        email: 'staff@demo.com',
        password: await bcrypt.hash('demo123', 12),
        role: 'staff'
      }
    ];

    await User.insertMany(demoUsers);
    console.log('✅ Demo users created successfully');

    console.log('\n📋 Demo Accounts:');
    console.log('Consumer: consumer@demo.com / demo123');
    console.log('Brand Owner: owner@demo.com / demo123');
    console.log('Staff: staff@demo.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
EOF

print_status "Database seeding script created"

# Create README with quick start instructions
print_info "Updating README with quick start instructions..."

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Environment files
.env
.env.local
.env.production
.env.staging

# Build outputs
backend/dist/
frontend/.next/
frontend/out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp

# Database
*.sqlite
*.db

# Deployment
.vercel
.railway
EOF
    print_status ".gitignore file created"
fi

print_status "Environment setup completed successfully!"

echo ""
print_info "📋 Next Steps:"
echo "1. Update backend/.env with your MongoDB URI and Razorpay credentials"
echo "2. Update frontend/.env.local with your Razorpay public key"
echo "3. Run 'node seed-database.js' to create demo accounts"
echo "4. Run './start-dev.sh' to start development servers"
echo "5. Visit http://localhost:3000 to see your application"

echo ""
print_info "🔗 Useful Commands:"
echo "• Start development: ./start-dev.sh"
echo "• Deploy backend: ./deploy-backend.sh"
echo "• Deploy frontend: ./deploy-frontend.sh"
echo "• Seed database: node seed-database.js"

echo ""
print_warning "⚠️  Don't forget to:"
echo "• Create your Razorpay test account"
echo "• Setup your MongoDB Atlas cluster"
echo "• Add collaborators to your GitHub repository"
echo "• Test all user flows before submission"

print_status "🎉 Happy coding! Good luck with your hackathon!"