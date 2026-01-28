# Industrial Attachment Management System - Application Repository

> 🚀 **This is the APPLICATION CODE repository**  
> For Kubernetes manifests, see the separate **Helm Charts repository**

Full-stack application for managing industrial attachments and internships with M-Pesa payment integration.

## 📦 Repository Purpose

This repository contains:
- ✅ **Backend API** (Node.js + Express + MongoDB)
- ✅ **Frontend Application** (React + Tailwind CSS)
- ✅ **Dockerfiles** for containerization
- ✅ **GitHub Actions CI/CD** pipeline
- ✅ **Builds and pushes Docker images to AWS ECR**

**This repo does NOT contain Kubernetes manifests** - those are in a separate Helm Charts repository for GitOps best practices.

---

## 🏗️ Project Structure

```
industrial-attachment-system/
├── backend/                        # Node.js API Server
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── models/                # MongoDB models
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Auth, upload, etc.
│   │   ├── utils/                 # M-Pesa, file upload
│   │   └── server.js              # Entry point
│   ├── Dockerfile                 # Backend container
│   ├── package.json
│   └── .env.example               # Environment template
│
├── frontend/                       # React Application
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API client
│   │   ├── context/               # State management
│   │   └── App.jsx                # Main app
│   ├── Dockerfile                 # Frontend container
│   ├── nginx.conf                 # Nginx config
│   ├── package.json
│   └── .env.example
│
├── .github/
│   └── workflows/
│       ├── build-and-push-ecr.yml # 🆕 ECR CI/CD Pipeline
│       └── deploy.yml             # Legacy (ignore)
│
├── scripts/
│   └── create-ecr-repos.sh        # 🆕 Create ECR repositories
│
├── .gitignore
├── README.md                       # This file
└── QUICK_START.md                 # Local development guide
```

---

## 🎯 This Repository's Role in DevOps Pipeline

```
┌─────────────────────────────────────────────────────┐
│  THIS REPOSITORY                                    │
│  (industrial-attachment-system)                     │
│                                                      │
│  1. Developer pushes code                           │
│         ↓                                            │
│  2. GitHub Actions triggered                        │
│         ↓                                            │
│  3. Builds Docker images                            │
│         ↓                                            │
│  4. Pushes to AWS ECR                               │
│         ↓                                            │
│  5. Outputs image tags                              │
│     (e.g., abc1234-20240128)                        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  HELM CHARTS REPOSITORY (SEPARATE)                  │
│  (industrial-attachment-helm-charts)                │
│                                                      │
│  6. Update Helm values with new image tags          │
│  7. Commit and push                                 │
│  8. ArgoCD detects changes                          │
│  9. Deploys to Kubernetes                           │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start - Local Development

### Prerequisites
- Node.js 18+
- MongoDB
- M-Pesa Developer Account (sandbox)
- Cloudinary Account

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Required:
# - MONGO_URI
# - JWT_SECRET
# - M-Pesa credentials
# - Cloudinary credentials

# Start development server
npm run dev
```

Backend runs on: **http://localhost:5000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 🐳 Docker Build (Local Testing)

```bash
# Build backend
docker build -t industrial-attachment-backend:local ./backend

# Build frontend
docker build -t industrial-attachment-frontend:local ./frontend

# Run locally
docker run -p 5000:5000 --env-file backend/.env industrial-attachment-backend:local
docker run -p 3000:80 industrial-attachment-frontend:local
```

---

## ☁️ AWS ECR Setup (One-Time)

### Step 1: Create ECR Repositories

```bash
# Make script executable
chmod +x scripts/create-ecr-repos.sh

# Run script
./scripts/create-ecr-repos.sh
```

This creates two ECR repositories:
- `industrial-attachment-backend`
- `industrial-attachment-frontend`

### Step 2: Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add these secrets:
```
AWS_ACCOUNT_ID          Your AWS account ID (e.g., 123456789012)
AWS_ACCESS_KEY_ID       IAM user access key
AWS_SECRET_ACCESS_KEY   IAM user secret key
```

### Step 3: Update Workflow (Optional)

Edit `.github/workflows/build-and-push-ecr.yml` if needed:
```yaml
env:
  AWS_REGION: us-east-1  # Change your region
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Workflow: `build-and-push-ecr.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main`

**What it does:**
1. ✅ Checks out code
2. ✅ Configures AWS credentials
3. ✅ Logs in to ECR
4. ✅ Generates image tags (SHA + timestamp)
5. ✅ Builds Docker images
6. ✅ Scans images for vulnerabilities (Trivy)
7. ✅ Pushes images to ECR
8. ✅ Outputs image tags

**Example output:**
```
Backend Image: 123456789.dkr.ecr.us-east-1.amazonaws.com/industrial-attachment-backend:abc1234-20240128
Frontend Image: 123456789.dkr.ecr.us-east-1.amazonaws.com/industrial-attachment-frontend:abc1234-20240128
```

**Note these tags** - you'll need them to update the Helm charts!

---

## 📝 Typical Development Workflow

### 1. Make Code Changes

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
vim backend/src/controllers/someController.js

# Test locally
npm run dev
```

### 2. Commit and Push

```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 3. Create Pull Request

- Go to GitHub
- Create Pull Request to `main`
- CI/CD builds and tests automatically
- Wait for approval

### 4. Merge to Main

- Merge PR
- CI/CD automatically builds and pushes to ECR
- Note the image tags from Actions output

### 5. Update Helm Charts (Separate Repo)

```bash
cd ../industrial-attachment-helm-charts
./scripts/update-image-tags.sh production <backend-tag> <frontend-tag>
```

### 6. ArgoCD Deploys Automatically! 🎉

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/industrial-attachment

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# M-Pesa
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=http://localhost:5000/api/applications/mpesa/callback
MPESA_API_URL=https://sandbox.safaricom.co.ke

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Opportunities
- `GET /api/opportunities` - List opportunities
- `GET /api/opportunities/:id` - Get opportunity
- `POST /api/opportunities` - Create opportunity (Admin)

### Applications
- `POST /api/applications` - Create application
- `GET /api/applications/my` - Get user's applications
- `POST /api/applications/:id/payment` - Initiate M-Pesa payment
- `POST /api/applications/mpesa/callback` - M-Pesa callback

### File Upload
- `POST /api/upload/resume/:applicationId` - Upload resume
- `POST /api/upload/referral/:applicationId` - Upload referral form

---

## 🔍 Monitoring CI/CD Pipeline

### View GitHub Actions

Go to: **Actions tab** in GitHub

### Check Build Status

```bash
# View recent workflows
gh run list

# View specific run
gh run view RUN_ID

# Watch live
gh run watch
```

### ECR Images

```bash
# List images
aws ecr describe-images \
  --repository-name industrial-attachment-backend \
  --region us-east-1

# Get image details
aws ecr describe-images \
  --repository-name industrial-attachment-backend \
  --image-ids imageTag=abc1234-20240128
```

---

## 🐛 Troubleshooting

### CI/CD Pipeline Fails

**Check workflow logs:**
```bash
# In GitHub Actions tab
# Click on failed workflow
# View logs for each step
```

**Common issues:**
- AWS credentials incorrect → Check GitHub secrets
- ECR repositories don't exist → Run `create-ecr-repos.sh`
- Docker build fails → Test build locally first

### Local Development Issues

**Backend won't start:**
```bash
# Check MongoDB is running
mongosh

# Check .env file exists
cat backend/.env

# Check dependencies
cd backend && npm install
```

**Frontend won't connect to backend:**
```bash
# Check backend is running on port 5000
curl http://localhost:5000/health

# Check frontend .env
cat frontend/.env
```

---

## 🔗 Related Repositories

### Helm Charts Repository (Separate)
**Repository:** `industrial-attachment-helm-charts`
- Kubernetes manifests
- Helm charts
- Environment configurations
- ArgoCD applications

### Why Separate Repositories?

✅ **Best Practice:** Separate application code from infrastructure code  
✅ **GitOps:** Infrastructure changes tracked independently  
✅ **Security:** Different access controls  
✅ **Clarity:** Clear separation of concerns  
✅ **CI/CD:** Different pipelines for different purposes

---

## 📚 Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment:** M-Pesa STK Push
- **File Storage:** Cloudinary
- **Validation:** express-validator

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **State:** Zustand
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Build Tool:** Vite

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Registry:** AWS ECR
- **Orchestration:** Kubernetes (deployed via Helm)
- **GitOps:** ArgoCD

---

## 🎯 Features

- ✅ User authentication (JWT)
- ✅ Browse opportunities (internships & attachments)
- ✅ Multi-step application form
- ✅ File uploads (resume, referral form)
- ✅ M-Pesa STK Push payment (KES 500)
- ✅ Application tracking
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ API rate limiting
- ✅ Security headers
- ✅ Error handling

---

## 📄 License

MIT License

---

## 🆘 Support

**Issues:** Open an issue in this repository  
**Documentation:** See QUICK_START.md for detailed local setup  
**Helm Charts:** See separate helm-charts repository

---

## ✅ Checklist Before First Push

- [ ] Created ECR repositories
- [ ] Added GitHub secrets (AWS credentials)
- [ ] Updated workflow file with your AWS region
- [ ] Tested builds locally
- [ ] Set up Helm charts repository
- [ ] Configured ArgoCD

---

**🎉 This repository is ready for production CI/CD!**

When you push code:
1. GitHub Actions builds images
2. Images pushed to ECR with tags
3. You update Helm charts with new tags
4. ArgoCD deploys automatically

Simple, clean, professional! 🚀
