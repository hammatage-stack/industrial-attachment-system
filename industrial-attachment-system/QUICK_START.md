# 🚀 QUICK START GUIDE

## Industrial Attachment Management System

### What You Have

A complete, production-ready system with:
- ✅ Full backend API (Node.js/Express)
- ✅ React frontend with Tailwind CSS
- ✅ M-Pesa payment integration
- ✅ File upload system (Cloudinary)
- ✅ Kubernetes deployment configs
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Complete documentation

### Folder Structure Overview

```
industrial-attachment-system/
├── backend/          → Node.js API server
├── frontend/         → React application
├── k8s/              → Kubernetes configs
└── .github/          → CI/CD workflows
```

---

## 🏃 Quick Start (Local Development)

### 1. Prerequisites
Install these first:
- Node.js 18+ (https://nodejs.org)
- MongoDB (https://www.mongodb.com/try/download/community)
- Git

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials:
# - MongoDB URI
# - M-Pesa credentials (get from https://developer.safaricom.co.ke)
# - Cloudinary credentials (get from https://cloudinary.com)

# Start MongoDB (if not running)
# mongod

# Run backend
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run frontend
npm run dev
```

Frontend will run on http://localhost:3000

---

## 🔑 Getting API Credentials

### M-Pesa (Safaricom)
1. Go to https://developer.safaricom.co.ke
2. Register/Login
3. Create an app
4. Get: Consumer Key, Consumer Secret, Shortcode, Passkey
5. Use sandbox for testing

### Cloudinary (File Storage)
1. Go to https://cloudinary.com
2. Sign up for free account
3. Get: Cloud Name, API Key, API Secret from dashboard

---

## 🐳 Docker Deployment

```bash
# Build images
docker build -t my-backend ./backend
docker build -t my-frontend ./frontend

# Run containers
docker run -d -p 5000:5000 --env-file backend/.env my-backend
docker run -d -p 3000:80 my-frontend
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (Minikube, EKS, GKE, AKS, etc.)
- kubectl installed
- Docker registry access

### Steps

1. **Edit secrets** in `k8s/database/secret.yaml`
2. **Update image URLs** in deployment files
3. **Deploy:**

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/database/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods -n industrial-attachment
kubectl get services -n industrial-attachment
```

---

## 📱 Testing the System

### 1. Register a User
- Go to http://localhost:3000/register
- Fill in details (phone: 254XXXXXXXXX format)
- Submit

### 2. Browse Opportunities
- Click "Opportunities" in navbar
- View available positions

### 3. Submit Application
- Click on an opportunity
- Click "Apply"
- Fill in application form
- Upload resume and referral form
- Initiate M-Pesa payment (KES 500)
- Check phone for STK push
- Enter M-Pesa PIN
- Application submitted!

### 4. Track Applications
- Go to "My Applications"
- View application status

---

## 🔧 Configuration Files

### Backend Environment (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/industrial-attachment
JWT_SECRET=your-secret-key
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
CLOUDINARY_CLOUD_NAME=...
```

### Frontend Environment (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 API Testing

Use Postman/Insomnia to test endpoints:

### Register
```
POST http://localhost:5000/api/auth/register
Body: {
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "254712345678"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Opportunities
```
GET http://localhost:5000/api/opportunities
```

---

## 🎨 Customization

### Branding
- Update colors in `frontend/tailwind.config.js`
- Change logo in `frontend/src/components/Navbar.jsx`
- Update app name throughout

### Application Fee
- Change in `backend/src/config/config.js`
- Update `applicationFee: 500` to your amount

### Email Setup
- Add SMTP credentials to backend `.env`
- Notifications will be sent automatically

---

## 🐛 Common Issues

### Backend won't start
- Check MongoDB is running
- Verify .env file exists and has correct values

### Frontend can't connect to backend
- Check backend is running on port 5000
- Verify VITE_API_URL in frontend .env

### M-Pesa not working
- Ensure using sandbox credentials for testing
- Verify callback URL is publicly accessible
- Check phone number format (254XXXXXXXXX)

---

## 📚 Next Steps

1. **Add Admin Panel** - Create admin routes for managing applications
2. **Email Notifications** - Implement email alerts for application updates
3. **SMS Integration** - Add SMS notifications via Africa's Talking
4. **Analytics Dashboard** - Track applications, payments, success rates
5. **Mobile App** - Build React Native version

---

## 🆘 Support

Need help? Check:
- Main README.md for full documentation
- API endpoints documentation
- Kubernetes deployment guide

---

## ✅ Pre-Launch Checklist

Before going live:
- [ ] Switch M-Pesa to production API
- [ ] Update all URLs in configs
- [ ] Set strong JWT_SECRET
- [ ] Configure HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring (e.g., Sentry)
- [ ] Test payment flow end-to-end
- [ ] Set up error logging
- [ ] Configure email notifications
- [ ] Update branding/logos

---

**You're all set! 🎉**

The system is ready to deploy. Just add your credentials and you're good to go!
