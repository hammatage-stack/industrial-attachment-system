# Quick Start Guide - Industrial Attachment System

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm 6+ installed
- (Optional) MongoDB running locally for full database testing

---

## 📝 Backend Setup & Run

### Installation
```bash
cd backend
npm install
```

### Start Development Server
```bash
npm start
```
Server runs on `http://localhost:5000`

**Output:** Server should show:
```
Server running in development mode on port 5000
⚠️  Email gmail not fully configured. Using mock email mode for development.
```

### Run Tests
```bash
npm test
```

**Expected Output:**
```
Test Suites: 5 passed, 5 total
Tests:       36 passed, 36 total
```

---

## 🎨 Frontend Setup & Run

### Installation
```bash
cd frontend
npm install
```

### Start Development Server
```bash
npm run dev
```
Application runs on `http://localhost:5173`

---

## 📋 API Testing

### 1. Register a New Account

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Request Body:**
```json
{
  "admissionNumber": "AD123456",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "254712345678",
  "password": "SecurePassword123"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "admissionNumber": "AD123456",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "254712345678",
    "role": "student"
  }
}
```

### 2. Login

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "admissionNumber": "AD123456",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "admissionNumber": "AD123456",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "254712345678",
    "role": "student"
  }
}
```

### 3. Get Current User Profile

**Endpoint:** `GET http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "admissionNumber": "AD123456",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "254712345678",
  "role": "student"
}
```

### 4. Validate M-Pesa Payment

**Endpoint:** `POST http://localhost:5000/api/payments/validate`

**Request Body:**
```json
{
  "mpesaCode": "ABC1234567",
  "amount": 5000,
  "phoneNumber": "254712345678",
  "applicantId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "M-Pesa code validated successfully",
  "payment": {
    "_id": "507f1f77bcf86cd799439012",
    "mpesaCode": "ABC1234567",
    "amount": 5000,
    "status": "verified",
    "applicantId": "507f1f77bcf86cd799439011"
  }
}
```

### 5. Get Opportunities (Student)

**Endpoint:** `GET http://localhost:5000/api/opportunities`

**Headers:**
```
Authorization: Bearer {student_token}
```

**Response (Student - Limited View):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Software Engineering Internship",
    "description": "6-month software engineering internship...",
    "requirements": ["Java", "SQL", "REST APIs"],
    "deadline": "2024-12-31",
    "applyVia": "IAS"
  }
]
```

**Note:** Hidden fields for students:
- ❌ companyEmail
- ❌ companyPhone
- ❌ howToApply (direct contact info)

---

## 🧪 Frontend Testing

### Manual Testing Checklist

#### Login Flow
1. Open `http://localhost:5173`
2. Click on login
3. Enter admission number: `AD123456`
4. Enter password: `SecurePassword123`
5. Click "Login"
6. Should redirect to dashboard

#### Registration Flow
1. Open `http://localhost:5173`
2. Click on register
3. Fill form:
   - First Name: John
   - Last Name: Doe
   - Admission Number: AD789012
   - Phone: 254712345678
   - Password: SecurePassword123
   - Confirm: SecurePassword123
4. Click "Create Account"
5. Should log in automatically and redirect to dashboard

#### Payment Validation
1. Login as student
2. Navigate to Payment section
3. Enter:
   - M-Pesa Code: `ABC1234567`
   - Amount: `5000`
4. Submit
5. Should show verification status

---

## 🔧 Email Configuration (Optional)

### Using Gmail
```bash
# 1. Generate app password from: https://myaccount.google.com/apppasswords
# 2. Set environment variables:

export EMAIL_PROVIDER=gmail
export GMAIL_APP_PASSWORD=your_app_password
export EMAIL_USER=your_email@gmail.com

# 3. Restart server
npm start
```

### Using Zoho
```bash
export EMAIL_PROVIDER=zoho
export ZOHO_API_URL=api.zoho.com
export ZOHO_REGION=us
export EMAIL_USER=your_email@zoho.com
export EMAIL_PASSWORD=your_password
```

### Using SendGrid
```bash
export EMAIL_PROVIDER=sendgrid
export SENDGRID_API_KEY=your_api_key
export EMAIL_USER=noreply@yourdomain.com
```

### Using Custom SMTP
```bash
export EMAIL_PROVIDER=custom
export EMAIL_HOST=smtp.example.com
export EMAIL_PORT=587
export EMAIL_USER=your_email@example.com
export EMAIL_PASSWORD=your_password
```

---

## 📊 Database Setup (Optional)

### MongoDB Local
```bash
# Install MongoDB Community
# Start MongoDB service
mongod

# Backend will connect on port 27017
```

### MongoDB Atlas (Cloud)
```bash
# 1. Create cluster at mongodb.com/cloud
# 2. Set MONGODB_URI environment variable:

export MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# 3. Restart backend
npm start
```

---

## 🐛 Troubleshooting

### Backend Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test
npm test -- auth.test.js

# Run with verbose output
npm test -- --verbose
```

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Connection Error
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```
This is expected if MongoDB is not running. Tests run in-memory without a database.

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express server entry point |
| `backend/src/controllers/authController.js` | Authentication logic |
| `backend/src/controllers/paymentController.js` | Payment processing |
| `backend/src/models/User.js` | User schema (admission number based) |
| `backend/src/utils/emailServiceEnhanced.js` | Multi-provider email service |
| `backend/src/utils/mpesaValidation.js` | M-Pesa validation logic |
| `frontend/src/pages/Login.jsx` | Login component |
| `frontend/src/pages/Register.jsx` | Registration component |
| `frontend/src/context/authStore.js` | Zustand auth store |

---

## 🔍 Logs & Debug

### Backend Logs
```bash
# See all logs
npm start

# With more verbose output
DEBUG=* npm start
```

### Frontend Logs
Open browser DevTools (F12) → Console tab

### Test Logs
```bash
npm test -- --verbose
npm test -- --coverage
```

---

## ✅ Verification Commands

```bash
# Backend health check
curl http://localhost:5000/api/health

# Test login (with actual credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"admissionNumber":"AD123456","password":"SecurePassword123"}'

# Test protected endpoint
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

---

## 📖 Documentation

- **Full Feature Details:** See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)
- **Validation Checklist:** See [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)
- **API Documentation:** See [README.md](README.md)
- **Status Report:** See [STATUS_REPORT.md](STATUS_REPORT.md)

---

## 🎯 Next Steps

1. ✅ **Development**: Start backend and frontend servers
2. ✅ **Testing**: Run test suite to verify everything works
3. ✅ **Database**: (Optional) Connect to MongoDB
4. ✅ **Email**: (Optional) Configure email provider
5. 🚀 **Deployment**: Follow deployment guide in README

---

**Version:** 2.0 (Complete with admission number auth)  
**Last Updated:** 2024  
**Status:** Production Ready
