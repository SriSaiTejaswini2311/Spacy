# 🚀 Deployment Instructions

## Backend Deployment to Railway

### Prerequisites
- Railway account (https://railway.app)
- MongoDB Atlas database URL

### Steps:

1. **Login to Railway**
   ```bash
   cd backend
   railway login
   ```

2. **Create or Link Project**
   ```bash
   railway link
   # Or create new: railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI="your_mongodb_connection_string"
   railway variables set JWT_SECRET="your-super-secret-jwt-key-production"
   railway variables set JWT_REFRESH_SECRET="your-refresh-secret-key-production"
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   railway variables set RAZORPAY_KEY_ID="your_razorpay_key_id"
   railway variables set RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Railway URL**
   ```bash
   railway status
   # Note the deployment URL (e.g., https://your-app.up.railway.app)
   ```

---

## Frontend Deployment to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- Backend deployed and URL available

### Steps:

1. **Login to Vercel**
   ```bash
   cd frontend
   vercel login
   ```

2. **Update API URL**
   Update the `NEXT_PUBLIC_API_URL` in `frontend/.env.production` with your Railway backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables (if needed)**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter your Railway backend URL when prompted
   ```

---

## 🔧 Configuration Files Created

### Backend Files:
- `railway.json` - Railway deployment configuration
- `Dockerfile` - Container configuration
- `.env.production` - Production environment variables template

### Frontend Files:
- `vercel.json` - Vercel deployment configuration
- `.env.production` - Production environment variables

---

## 📝 Important Notes

1. **Database Setup**: Ensure your MongoDB Atlas database is configured with proper network access
2. **CORS**: Backend is configured to accept requests from any origin in production
3. **Environment Variables**: Replace placeholder values in `.env.production` files with actual values
4. **Domain**: Update the frontend API URL after backend deployment
5. **Razorpay**: Configure Razorpay keys for payment functionality

---

## 🚨 Security Checklist

- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up proper Razorpay webhook endpoints
- [ ] Enable HTTPS on both deployments
- [ ] Review CORS settings for production

---

## 📊 Monitoring

### Railway (Backend)
- Check logs: `railway logs`
- Monitor metrics in Railway dashboard

### Vercel (Frontend)
- Check deployment logs in Vercel dashboard
- Monitor performance and analytics

---

## 🔄 Redeployment

### Backend Updates:
```bash
cd backend
railway up
```

### Frontend Updates:
```bash
cd frontend
vercel --prod
```

---

## 🆘 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify MongoDB URI and network access
3. **CORS Errors**: Ensure frontend URL is allowed in backend CORS settings
4. **Environment Variables**: Double-check all required variables are set

### Support:
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com