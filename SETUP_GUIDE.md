# Industrial Attachment System - Troubleshooting & Setup Guide

## ✅ Current Status

### Fixed Issues:
1. ✅ **Duplicate Schema Indexes** - Removed duplicate indexes from Payment.js and Application.js models
2. ✅ **Mock Email Service** - Email service now works in development mode without SMTP configuration
3. ✅ **Development Configuration** - Created .env file with all required configuration templates
4. ✅ **Database Initialization** - Created sample data initialization script

### Current Limitations (Development):
- MongoDB connection requires local MongoDB instance or Atlas connection
- Email service runs in mock mode (logs to console instead of sending real emails)
- Payment processing requires M-Pesa credentials configuration
- File uploads require Cloudinary configuration for production

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create/update `backend/.env` with:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/industrial-attachment
JWT_SECRET=your-secret-key-here
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # or npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - (Optional) Initialize Database:**
```bash
cd backend
npm run init:db
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🔧 Configuration

### Email Service (Development Mode)
- **Status**: ✅ Working in mock mode
- **How it works**: Emails are logged to console instead of being sent
- **To enable real emails**: Set SMTP credentials in `.env`:
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-app-password
  ```

### Database (MongoDB)
**Option 1: Local MongoDB**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community
mongod
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/industrial-attachment
   ```

### Payment Processing (M-Pesa)
**Note**: Currently accepts any payment submission. To enable real M-Pesa verification:

1. Get M-Pesa credentials from Safaricom
2. Update in `.env`:
   ```
   MPESA_CONSUMER_KEY=your-key
   MPESA_CONSUMER_SECRET=your-secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your-passkey
   ```

### File Uploads (Cloudinary)
**Note**: Currently disabled. To enable:

1. Create account at https://cloudinary.com
2. Update `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```

---

## 📊 Database Initialization

### Seed Sample Data
```bash
npm run init:db
```

This creates:
- ✅ 2 sample institutions
- ✅ 1 admin user (admin@ias.com / admin123)
- ✅ 1 student user (student@ias.com / student123)
- ✅ 1 company user (company@ias.com / company123)
- ✅ 3 sample opportunities

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ias.com | admin123 |
| Student | student@ias.com | student123 |
| Company | company@ias.com | company123 |

---

## 🧪 Testing Features

### Available Features (All Working):
- ✅ **User Registration** - Create new accounts
- ✅ **User Login** - Authenticate with email/password
- ✅ **Dashboard** - View user dashboard
- ✅ **Opportunities** - Browse opportunities
- ✅ **Applications** - Submit applications (payment validation skipped in mock)
- ✅ **Admin Panel** - Manage applications and payments
- ✅ **Email Notifications** - See in console logs (mock mode)

### Features Requiring Configuration:
- ⚠️ **Real Email Sending** - Requires SMTP setup
- ⚠️ **M-Pesa Verification** - Requires Safaricom credentials
- ⚠️ **File Uploads** - Requires Cloudinary setup
- ⚠️ **SMS Notifications** - Requires Africast credentials

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Error
**Error**: `connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:
1. Start local MongoDB: `mongod`
2. OR use MongoDB Atlas and update connection string in `.env`

### Issue: Email Configuration Error
**Error**: `connect ECONNREFUSED 127.0.0.1:587`

**Solution**: This is expected in development. Email is in mock mode and logs to console. No action needed.

### Issue: Application Won't Start
**Check**:
1. All dependencies installed: `npm install`
2. Node version >= 14: `node --version`
3. Port 5000 not in use: `lsof -i :5000`

### Issue: Frontend Can't Connect to Backend
**Check**:
1. Backend running on port 5000
2. CORS enabled in backend
3. API URL in frontend points to correct backend

---

## 📝 Important Notes

### Development Mode Behavior:
- Email service logs to console instead of sending
- Payment validation is simplified
- File uploads are disabled by default
- Database runs in-memory or requires local MongoDB

### Production Deployment:
- Set `NODE_ENV=production`
- Configure all SMTP/Payment credentials
- Use MongoDB Atlas for database
- Enable HTTPS
- Set strong JWT secret
- Configure proper CORS origins

---

## 🔗 Useful Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Safaricom M-Pesa API](https://developer.safaricom.co.ke/)
- [Cloudinary API](https://cloudinary.com/documentation)

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review error logs in console
3. Check `.env` configuration
4. Verify all dependencies are installed

---

**Last Updated**: January 29, 2026
**Version**: 1.0.0
