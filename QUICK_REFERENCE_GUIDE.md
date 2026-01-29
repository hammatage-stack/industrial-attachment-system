# Industrial Attachment System - Quick Reference Guide

**Last Updated:** January 29, 2026  
**Status:** ✅ Complete Implementation

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Clone and navigate
cd industrial-attachment-system

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env - Add MongoDB URI, JWT Secret, Email config

# 3. Start Backend (Terminal 1)
npm run dev  # Runs on http://localhost:5000

# 4. Setup Frontend (Terminal 2)
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

Access the application at **http://localhost:5173**

---

## 👤 Default Login Credentials

### Admin Account
```
Email: admin@attachmentsystem.com
Password: admin123
```

⚠️ Change these immediately in production!

---

## 📍 Key URLs

| Feature | URL |
|---------|-----|
| Home | http://localhost:5173/ |
| Register | http://localhost:5173/register |
| Login | http://localhost:5173/login |
| Opportunities | http://localhost:5173/opportunities |
| Institutions | http://localhost:5173/institutions |
| My Applications | http://localhost:5173/my-applications |
| Admin Dashboard | http://localhost:5173/admin |
| API Base | http://localhost:5000/api |
| API Docs | See IMPLEMENTATION_GUIDE.md |

---

## 🔑 Essential Configuration

### Environment Variables (.env)

```bash
# Database
MONGO_URI=mongodb://localhost:27017/industrial-attachment

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# M-Pesa (Optional)
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
```

---

## 📚 Documentation Map

| Document | Purpose | Location |
|----------|---------|----------|
| **IMPLEMENTATION_GUIDE.md** | Complete API documentation | Root |
| **SETUP_GUIDE.md** | Environment setup instructions | Root |
| **IMPLEMENTATION_SUMMARY.md** | Feature overview & checklist | Root |
| **README_UPDATED.md** | Project overview | Root |
| **FILES_CREATED_MODIFIED.md** | File changes summary | Root |
| **QUICK_REFERENCE.md** | This file | Root |

---

## 🏗️ Architecture at a Glance

```
Frontend (React)          Backend (Node.js)         Database (MongoDB)
─────────────────────────────────────────────────────────────────
Homepage          →       Express Server       →     Users Collection
Opportunities     →       Auth Routes          →     Opportunities
Applications      →       Opportunity Routes   →     Applications
Institutions      →       Application Routes   →     Institutions
Payment           →       Institution Routes   →     Payments
Admin Dashboard   →       Payment Routes       →     (+ Indexes)
                  →       Admin Routes
                  →       Upload Handler
```

---

## 💡 Common Tasks

### Create a Test User
```javascript
// Using MongoDB Compass or mongosh
use industrial-attachment
db.users.insertOne({
  email: "test@example.com",
  password: "$2a$10$...", // bcryptjs hash
  firstName: "Test",
  lastName: "User",
  phoneNumber: "254712345678",
  role: "student",
  createdAt: new Date()
})
```

### Add a Test Opportunity
```bash
curl -X POST http://localhost:5000/api/opportunities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Corp",
    "title": "Software Engineer",
    "description": "Join our team",
    "type": "internship",
    "category": "IT & Software",
    "location": "Nairobi",
    "duration": "3 months",
    "availableSlots": 5,
    "applicationDeadline": "2024-12-31T23:59:59Z"
  }'
```

### Test Student Application Flow
1. Register at `/register`
2. Login with credentials
3. Go to Opportunities
4. Click on opportunity
5. Fill application form
6. Upload files (CV, Recommendation)
7. Go to payment
8. Enter M-Pesa code (test: ABC1234567)
9. Submit
10. Check admin dashboard to verify

---

## 🔒 Security Checklist

### Development
- [ ] MongoDB running locally
- [ ] .env file created with test values
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can login with test account

### Staging
- [ ] Change admin password
- [ ] Configure real email provider
- [ ] Configure Cloudinary
- [ ] Set secure JWT secret
- [ ] Test email notifications
- [ ] Test file uploads

### Production
- [ ] Use HTTPS only
- [ ] Change all default credentials
- [ ] Use MongoDB Atlas with auth
- [ ] Configure secure CORS
- [ ] Enable rate limiting
- [ ] Setup monitoring
- [ ] Regular backups

---

## 📊 API Quick Reference

### Authentication
```bash
POST   /api/auth/register              # New user
POST   /api/auth/login                 # Login
PUT    /api/auth/change-password       # Change password
```

### Opportunities
```bash
GET    /api/opportunities              # List all
GET    /api/opportunities/:id          # Details
POST   /api/opportunities              # Create (Admin)
```

### Institutions
```bash
GET    /api/institutions               # Search & filter
GET    /api/institutions/counties      # Get counties
GET    /api/institutions/:id           # Details
POST   /api/institutions               # Create (Admin)
```

### Applications
```bash
POST   /api/applications               # Submit
GET    /api/applications/my            # My applications
GET    /api/applications/:id           # Details
PUT    /api/applications/:id/status    # Update (Admin)
```

### Payments
```bash
POST   /api/payments/validate-mpesa    # Submit code
GET    /api/payments/:appId/status     # Check status
PUT    /api/payments/:id/verify        # Verify (Admin)
```

### Admin
```bash
GET    /api/admin/dashboard/stats      # Statistics
GET    /api/admin/users                # User list
GET    /api/admin/payments             # Payment list
GET    /api/admin/reports/:type        # Generate report
```

---

## 🐛 Troubleshooting Quick Fixes

### "MongoDB Connection Error"
```bash
# Check if MongoDB is running
mongosh  # Should connect
# Or
mongo   # For older versions
```

### "Email Not Sending"
```bash
# Check credentials in .env
# Gmail: Enable app passwords
# Check firewall: SMTP port 587 should be open
# Test: npm run test:email (if available)
```

### "CORS Error"
```bash
# Update backend .env:
CORS_ORIGIN=http://localhost:5173

# Or in docker-compose:
# Set frontend service port to 3000
```

### "Cloudinary Upload Fails"
```bash
# Verify credentials in .env:
CLOUDINARY_CLOUD_NAME=your_actual_name
CLOUDINARY_API_KEY=your_actual_key

# Check file size (max 5MB for CV)
# Check file type (PDF, DOC, DOCX)
```

### "Cannot Login as Admin"
```bash
# Reset admin user in MongoDB
use industrial-attachment
db.users.deleteOne({email: "admin@attachmentsystem.com"})
# Then register new admin via API
```

---

## 📱 Features by User Role

### Student
- ✅ Browse opportunities
- ✅ Search institutions
- ✅ Submit applications
- ✅ Make payment
- ✅ Track status
- ✅ Receive emails

### Admin
- ✅ Dashboard view
- ✅ Verify payments
- ✅ Manage applications
- ✅ Manage institutions
- ✅ Generate reports
- ✅ View logs

---

## 🚢 Deployment Options

### Local Development
```bash
npm run dev  # Both frontend and backend
```

### Docker (Single command)
```bash
docker-compose up  # Runs everything
```

### Cloud Platforms
- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas

---

## 📞 Support Resources

### Documentation
- **API Docs**: IMPLEMENTATION_GUIDE.md
- **Setup**: SETUP_GUIDE.md
- **Overview**: IMPLEMENTATION_SUMMARY.md

### Files Modified
- **List**: FILES_CREATED_MODIFIED.md
- **Details**: See each file comment headers

### Code Comments
- Each file has detailed inline comments
- Controllers explain business logic
- Models describe relationships

---

## 🎯 Next Steps

### For New Developers
1. Read SETUP_GUIDE.md
2. Run `npm install` and setup .env
3. Start dev servers
4. Explore API with Postman
5. Test each feature manually

### For Integration
1. Review API documentation
2. Setup test environment
3. Create API client
4. Test all endpoints
5. Handle errors gracefully

### For Customization
1. Identify feature to modify
2. Check relevant file location
3. Make changes
4. Test thoroughly
5. Update documentation

### For Production Deployment
1. Follow SETUP_GUIDE.md production section
2. Configure all environment variables
3. Setup MongoDB Atlas
4. Configure email service
5. Setup Cloudinary
6. Deploy backend
7. Deploy frontend
8. Test all features
9. Setup monitoring
10. Regular backups

---

## 💾 Important Files to Know

### Must Read
- `.env.example` - See all configuration options
- `src/server.js` - Backend entry point
- `src/App.jsx` - Frontend entry point
- `IMPLEMENTATION_GUIDE.md` - API reference

### Key Models
- `User.js` - User structure
- `Opportunity.js` - Job listings
- `Application.js` - User applications
- `Institution.js` - Company directory
- `Payment.js` - Payment tracking

### Key Routes
- `auth.js` - Authentication
- `opportunities.js` - Job management
- `institutions.js` - Directory
- `applications.js` - Applications
- `payments.js` - Payment verification
- `admin.js` - Admin operations

---

## 📈 Performance Tips

### Database
```bash
# Add indexes for frequent queries
db.opportunities.createIndex({ "status": 1 })
db.institutions.createIndex({ "location.county": 1 })
```

### Caching
- Implement Redis for frequently accessed data
- Cache opportunity listings
- Cache institution directory

### Monitoring
- Setup error tracking (Sentry)
- Monitor database performance
- Track API response times

---

## 🔔 Important Reminders

⚠️ **Before Production**
- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Setup email notifications
- [ ] Test all features
- [ ] Enable monitoring
- [ ] Setup backups

✅ **During Development**
- Keep .env secure
- Don't commit .env file
- Use test data for testing
- Check error logs regularly
- Update dependencies

---

## 📊 Key Statistics

- **Backend**: 3000+ lines of code
- **Frontend**: 2000+ lines of code
- **Documentation**: 3000+ lines
- **API Endpoints**: 39+
- **Database Collections**: 5
- **Email Templates**: 6
- **Test Users**: Use admin account

---

## 🎉 You're All Set!

Everything is ready to:
1. ✅ Run in development
2. ✅ Test all features
3. ✅ Deploy to production
4. ✅ Customize for your needs

Start with `npm run dev` and have fun!

---

<div align="center">

### Need More Help?

📖 [Full Documentation](./IMPLEMENTATION_GUIDE.md)  
🛠️ [Setup Guide](./SETUP_GUIDE.md)  
📋 [File Reference](./FILES_CREATED_MODIFIED.md)  
🎯 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

---

**Industrial Attachment System (IAS)**  
*Empowering Kenyan Students*

</div>
