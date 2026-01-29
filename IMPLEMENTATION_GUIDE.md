# Industrial Attachment System (IAS) - API Documentation

## Overview

The Industrial Attachment System is a centralized, web-based platform designed to help Kenyan students easily access, apply for, and secure industrial attachment, internship, and teaching practice opportunities.

### Key Features

1. **Opportunity Management** - Centralized database of all attachment opportunities
2. **Application Management** - Students apply through the system with required documents
3. **Institution Directory** - Searchable directory of companies, organizations, schools
4. **Manual MPesa Payment** - KES 500 application fee via M-Pesa Till No: 3400188
5. **Admin Dashboard** - Comprehensive dashboard for opportunity and payment management
6. **Email Notifications** - Automated email confirmations and updates

## Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Email**: Nodemailer (Gmail, Zoho, SendGrid, Mailgun)
- **Authentication**: JWT (JSON Web Tokens)

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword"
}
```

#### Change Password
```
PUT /api/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Institution Directory Routes (`/api/institutions`)

#### Get All Institutions (Public)
```
GET /api/institutions?search=tech&type=company&county=Nairobi&page=1&limit=20
```

**Query Parameters:**
- `search` - Search by name, description, sectors
- `type` - Filter by institution type (company, organization, ngo, high-school, secondary-school, college, university, tvet, other)
- `county` - Filter by county
- `subCounty` - Filter by sub-county
- `page` - Pagination (default: 1)
- `limit` - Results per page (default: 20)

#### Get Institution Types
```
GET /api/institutions/types/list
```

#### Get Counties (dropdown)
```
GET /api/institutions/counties
```

#### Get Sub-Counties
```
GET /api/institutions/sub-counties/:county
```

#### Get Single Institution
```
GET /api/institutions/:id
```

#### Create Institution (Admin Only)
```
POST /api/institutions
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Tech Company Ltd",
  "type": "company",
  "description": "Leading tech company in Kenya",
  "email": "hr@techcompany.com",
  "phoneNumber": "0712345678",
  "website": "https://techcompany.com",
  "location": {
    "county": "Nairobi",
    "subCounty": "Westlands",
    "subLocation": "Kilimani",
    "street": "Tom Mboya Street",
    "city": "Nairobi",
    "postalCode": "00100"
  },
  "contactPerson": "Jane Smith",
  "contactPersonTitle": "HR Manager",
  "sectors": ["IT", "Software", "Technology"]
}
```

#### Verify Institution (Admin Only)
```
PUT /api/institutions/:id/verify
Authorization: Bearer <admin-jwt-token>
```

### Opportunities Routes (`/api/opportunities`)

#### Get All Opportunities
```
GET /api/opportunities?search=software&category=IT&location=Nairobi&page=1&limit=20
```

#### Get Single Opportunity
```
GET /api/opportunities/:id
```

#### Create Opportunity (Admin/Company)
```
POST /api/opportunities
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "companyName": "Tech Corp",
  "companyEmail": "careers@techcorp.com",
  "companyPhone": "0712345678",
  "title": "Software Engineer Internship",
  "description": "Join our team as a software engineer intern...",
  "type": "internship",
  "category": "IT & Software",
  "location": "Nairobi",
  "duration": "3 months",
  "requirements": ["Node.js", "React", "MongoDB"],
  "benefits": ["Stipend: KES 15,000/month", "Transport allowance"],
  "availableSlots": 5,
  "applicationDeadline": "2024-02-28T23:59:59Z"
}
```

#### Update Opportunity Status (Admin)
```
PUT /api/opportunities/:id/status
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "status": "closed"
}
```

### Application Routes (`/api/applications`)

#### Create Application (Save Draft)
```
POST /api/applications
Authorization: Bearer <student-jwt-token>
Content-Type: application/json

{
  "opportunity": "opportunity-id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "254712345678",
  "dateOfBirth": "2002-05-15",
  "nationality": "Kenyan",
  "idType": "national-id",
  "idNumber": "12345678",
  "institution": "University of Nairobi",
  "course": "Computer Science",
  "yearOfStudy": "3",
  "studentId": "REG2022001",
  "applicationType": "industrial-attachment",
  "coverLetter": "I am interested in this position..."
}
```

#### Get My Applications
```
GET /api/applications/my
Authorization: Bearer <student-jwt-token>
```

#### Get Application Details
```
GET /api/applications/:id
Authorization: Bearer <jwt-token>
```

### Payment Routes (`/api/payments`)

#### Validate MPesa Payment (Manual)
```
POST /api/payments/validate-mpesa
Authorization: Bearer <student-jwt-token>
Content-Type: application/json

{
  "applicationId": "application-id",
  "mpesaCode": "ABC1234567",
  "phoneNumber": "254712345678"
}
```

**M-Pesa Payment Instructions:**
1. User sends KES 500 to Till Number: **3400188**
2. M-Pesa sends confirmation with transaction code
3. User submits the transaction code above
4. Admin verifies the payment in the dashboard
5. Upon verification, application is submitted to organization

#### Get Payment Status
```
GET /api/payments/:applicationId/status
Authorization: Bearer <student-jwt-token>
```

### Admin Routes (`/api/admin`)

#### Get Dashboard Statistics
```
GET /api/admin/dashboard/stats
Authorization: Bearer <admin-jwt-token>
```

**Response includes:**
- Total users, applications, opportunities, institutions
- Applications and payments by status
- Recent applications
- Verified institutions count

#### Get All Users
```
GET /api/admin/users?role=student&page=1&limit=20&search=john
Authorization: Bearer <admin-jwt-token>
```

#### Get All Payments
```
GET /api/admin/payments?status=pending&page=1&limit=20
Authorization: Bearer <admin-jwt-token>
```

#### Verify Payment
```
PUT /api/admin/payments/:paymentId/verify
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "verificationNotes": "Transaction verified successfully"
}
```

#### Reject Payment
```
PUT /api/admin/payments/:paymentId/reject
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "rejectionReason": "Invalid transaction code"
}
```

#### Get Application (Full Details)
```
GET /api/admin/applications/:id/full
Authorization: Bearer <admin-jwt-token>
```

#### Update Application Status
```
PUT /api/applications/:id/status
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "status": "shortlisted",
  "rejectionReason": "" // Only if status is 'rejected'
}
```

#### Generate Report
```
GET /api/admin/reports/:type?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-jwt-token>
```

**Report types:** applications, payments, institutions, users

#### Get System Logs
```
GET /api/admin/logs?page=1&limit=50
Authorization: Bearer <admin-jwt-token>
```

## Application Workflow

### Student Perspective

1. **Register/Login** - Create account with email, password, name, phone
2. **Browse Opportunities** - Search by title, category, location
3. **View Institution Directory** - Search institutions by county, type
4. **Apply for Opportunity** - 
   - Fill application form with:
     - National ID/Passport number
     - Course and institution
     - Year of study
     - Upload CV (PDF/DOC)
     - Upload Recommendation Letter (PDF/DOC)
5. **Make Payment** - 
   - Send KES 500 to M-Pesa Till: 3400188
   - Submit M-Pesa transaction code
   - Receive payment confirmation email
6. **Track Application** - 
   - View application status in dashboard
   - Receive email updates on progress

### Admin Perspective

1. **Dashboard** - View statistics and recent activities
2. **Manage Users** - View all students, change roles
3. **Moderate Opportunities** - Create, edit, delete, enable/disable opportunities
4. **Verify Payments** - 
   - Review pending M-Pesa transactions
   - Verify or reject payments
   - Flag duplicate codes
5. **Review Applications** - 
   - View student applications
   - View uploaded documents
   - Update application status
6. **Manage Institutions** - 
   - Add new institutions
   - Verify institutions
   - View institution details
7. **Generate Reports** - 
   - Applications report
   - Payments report
   - Users report
   - Institutions report

## Email Notifications

### Automated Emails Sent

#### To Student:
1. **Application Submission Confirmation** - Sent when application form is submitted
2. **Payment Confirmation** - Sent when M-Pesa code is submitted
3. **Payment Verification Notification** - Sent when admin verifies payment
4. **Payment Rejection Notification** - Sent if payment is rejected
5. **Application Status Updates** - Sent when admin updates application status
6. **Password Reset** - Sent when user requests password reset

#### To Admin:
1. **New Payment Notification** - Alerts admin when new M-Pesa code submitted
2. **New Application** - Notifies when application needs review

## File Upload Requirements

### Supported File Types
- **CV/Resume**: PDF, DOC, DOCX (Max 5MB)
- **Recommendation Letter**: PDF, DOC, DOCX (Max 5MB)
- **ID Document**: PDF, JPG, PNG (Max 10MB)

### Upload Endpoint
```
POST /api/upload
Authorization: Bearer <student-jwt-token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "type": "cv" // or "recommendation-letter" or "id-document"
}
```

## Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Role-Based Access Control** - Different permissions for students, admins, companies
3. **Password Hashing** - bcryptjs for secure password storage
4. **CORS Protection** - Cross-origin requests controlled
5. **Rate Limiting** - API request throttling (100 requests per 15 minutes)
6. **Helmet.js** - HTTP security headers
7. **Environment Variables** - Sensitive data protection
8. **Transaction Code Validation** - Prevents duplicate M-Pesa codes

## Setup & Installation

### Prerequisites
- Node.js v14+
- MongoDB v4.0+
- npm or yarn

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your actual configuration
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Start Production Server**
```bash
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.

### Essential Variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` - Email configuration
- `CLOUDINARY_*` - File upload configuration

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)"
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Bypass**: Authenticated requests have higher limits

## Future Enhancements

1. **Automated MPesa STK Push** - Instead of manual code submission
2. **Mobile Application** - Native mobile app for iOS/Android
3. **AI-based Matching** - Machine learning for opportunity recommendations
4. **Institutional Self-Registration** - Direct portal for institutions to register
5. **Government Partnerships** - Integration with government platforms
6. **Real-time Notifications** - Push notifications for app updates
7. **Video Interviews** - Built-in interview platform
8. **Document Verification API** - Automated document validation

## Support & Maintenance

### Common Issues

**MongoDB Connection Error**
- Check MONGO_URI in .env
- Ensure MongoDB service is running
- Verify network connectivity

**Email Not Sending**
- Verify email credentials in .env
- Check SMTP port (usually 587 or 465)
- Enable "Less secure app access" for Gmail

**File Upload Failing**
- Verify Cloudinary credentials
- Check file size limits
- Ensure supported file format

## License

MIT License - See LICENSE file for details

## Contact & Support

For issues, feature requests, or support:
- Email: support@attachmentsystem.com
- GitHub Issues: [Project Issues]
- Documentation: [Full Documentation Link]

---

**Last Updated:** January 2024
**Version:** 1.0.0
