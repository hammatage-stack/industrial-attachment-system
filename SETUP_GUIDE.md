# Industrial Attachment System (IAS) - Setup Guide

## Prerequisites

- Node.js v14 or higher
- MongoDB v4.0 or higher (local or Atlas)
- npm or yarn package manager
- Git
- A code editor (VS Code recommended)

## Environment Setup

### Backend Configuration

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create `.env` file from template:**
```bash
cp .env.example .env
```

3. **Configure MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/industrial-attachment
# OR for MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/industrial-attachment?retryWrites=true&w=majority
```

4. **Generate JWT Secret:**
```bash
# Use a strong random string, e.g.:
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
```

5. **Configure Email Service:**

**Option A: Using Gmail**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Generate at https://myaccount.google.com/apppasswords
EMAIL_FROM=noreply@attachmentsystem.com
```

**Option B: Using Zoho Mail**
```
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_USER=your-email@zoho.com
EMAIL_PASSWORD=your-zoho-password
EMAIL_FROM=noreply@attachmentsystem.com
```

**Option C: Using SendGrid**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@attachmentsystem.com
```

6. **Configure File Upload (Cloudinary):**
   - Sign up at https://cloudinary.com
   - Get your credentials from Dashboard
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

7. **Configure M-Pesa (Optional for now):**
```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=3400188
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/applications/mpesa/callback
```

8. **Install dependencies and start:**
```bash
npm install
npm run dev  # For development
# OR
npm start   # For production
```

### Frontend Configuration

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Create `.env.local` file:**
```bash
VITE_API_URL=http://localhost:5000/api
```

3. **Install dependencies:**
```bash
npm install
```

4. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## MongoDB Setup

### Local MongoDB

1. **Install MongoDB Community Edition:**
   - **macOS:** `brew install mongodb-community`
   - **Windows:** Download from https://www.mongodb.com/try/download/community
   - **Linux:** `sudo apt-get install mongodb`

2. **Start MongoDB service:**
```bash
# macOS
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project
4. Create a cluster (M0 free tier)
5. Add a database user
6. Get connection string
7. Add to `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/industrial-attachment?retryWrites=true&w=majority
```

## Database Initialization

### Create Initial Admin User

1. Open MongoDB Shell or Atlas UI
2. Create admin user:

```javascript
// Using MongoDB shell
use industrial-attachment

db.users.insertOne({
  email: "admin@attachmentsystem.com",
  password: "$2a$10$...", // bcryptjs hash of "admin123"
  firstName: "System",
  lastName: "Administrator",
  phoneNumber: "254712345678",
  role: "admin",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Add Sample Institutions

```javascript
db.institutions.insertOne({
  name: "Tech Corp Ltd",
  type: "company",
  description: "Leading technology company",
  email: "careers@techcorp.com",
  phoneNumber: "0712345678",
  website: "https://techcorp.com",
  location: {
    county: "Nairobi",
    subCounty: "Westlands",
    subLocation: "Kilimani",
    street: "Chiromo Road",
    city: "Nairobi",
    postalCode: "00100"
  },
  sectors: ["Technology", "Software", "IT"],
  isVerified: true,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Docker Setup (Optional)

### Using Docker Compose

1. **Create `docker-compose.yml` in project root:**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: industrial-attachment
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGO_URI: mongodb://mongodb:27017/industrial-attachment
      JWT_SECRET: your-secret-key
    env_file:
      - backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:5000/api

volumes:
  mongodb_data:
```

2. **Start all services:**
```bash
docker-compose up
```

## Verification Checklist

- [ ] MongoDB is running and accessible
- [ ] Backend `.env` file is configured
- [ ] Email configuration is set up
- [ ] Cloudinary API credentials are added
- [ ] JWT secret is set to a strong value
- [ ] CORS_ORIGIN in backend config matches frontend URL
- [ ] Backend server starts without errors
- [ ] Frontend can connect to backend API
- [ ] Admin user can login
- [ ] All pages load without errors

## Default Login Credentials

**Admin Account:**
- Email: `admin@attachmentsystem.com`
- Password: `admin123`

⚠️ **Change these immediately in production!**

## Test Data Creation

### Create Test Opportunity

```bash
curl -X POST http://localhost:5000/api/opportunities \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Solutions",
    "companyEmail": "careers@techsolutions.com",
    "companyPhone": "0712345678",
    "title": "Software Engineer Internship",
    "description": "Join our growing tech team",
    "type": "internship",
    "category": "IT & Software",
    "location": "Nairobi",
    "duration": "3 months",
    "requirements": ["JavaScript", "Node.js"],
    "benefits": ["Stipend: 15,000/month"],
    "availableSlots": 5,
    "applicationDeadline": "2024-12-31T23:59:59Z"
  }'
```

### Test Student Registration

1. Go to `http://localhost:5173/register`
2. Fill in registration form
3. Create account with role "student"
4. Login with credentials

### Test Application Submission

1. Login as student
2. Go to Opportunities
3. Click on opportunity
4. Fill application form with:
   - National ID: "12345678"
   - Course: "Computer Science"
   - Year: "3"
   - Upload CV (mock file)
   - Upload Recommendation Letter
5. Proceed to payment
6. Enter M-Pesa code: "ABC1234567"
7. Submit payment

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB service is running
```bash
# macOS
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### Email Not Sending
**Check:**
- Email credentials are correct
- SMTP port is correct (587 for TLS, 465 for SSL)
- App passwords enabled for Gmail
- Firewall allows SMTP connection

### CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Update backend `CORS_ORIGIN`:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### File Upload Fails
**Check:**
- Cloudinary credentials are valid
- File size is within limits (5MB for CV, 10MB for ID)
- Supported file format (PDF, DOC, JPG, PNG)

### JWT Token Expired
**Solution:** Clear browser cache and localStorage
```javascript
localStorage.clear()
```

## Production Deployment

### Environment Variables for Production
```
NODE_ENV=production
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
MONGO_URI=mongodb+srv://prod_user:password@prod-cluster.mongodb.net/industrial-attachment
```

### Security Checklist
- [ ] Change JWT secret to strong random value
- [ ] Change admin password
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS for all connections
- [ ] Set secure CORS origins
- [ ] Enable rate limiting in production
- [ ] Set up logging and monitoring
- [ ] Regular database backups
- [ ] Use environment-specific configurations

## Support & Resources

- **MongoDB Documentation:** https://docs.mongodb.com
- **Express.js Guide:** https://expressjs.com
- **React Documentation:** https://react.dev
- **API Reference:** See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## Next Steps

1. ✅ Complete setup and configuration
2. ✅ Test all basic features
3. ✅ Create sample opportunities
4. ✅ Test user registration and login
5. ✅ Test application submission
6. ✅ Test admin dashboard
7. ✅ Configure email service
8. ✅ Test email notifications
9. ✅ Deploy to staging environment
10. ✅ Deploy to production

---

**Setup Complete!** You're ready to start the IAS platform. Visit http://localhost:5173 to access the application.
