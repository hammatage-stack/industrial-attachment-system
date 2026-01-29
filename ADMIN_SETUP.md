# Admin Setup Guide

## Overview
This document explains how to set up and manage admin accounts in the Industrial Attachment System.

## Admin Access Control

### Frontend Security
- **Admin pages are hidden** from regular users
- The `/admin` route is protected by the `AdminRoute` component
- Non-admin users attempting to access `/admin` are automatically redirected to `/dashboard`
- The admin navigation link only appears in the navbar for users with `role: 'admin'`

### Backend Security
- All admin endpoints require authentication via JWT token
- User role is checked on the backend for sensitive operations
- Non-admin users receive 403 Forbidden responses when attempting admin operations

---

## Admin Account Creation

### Method 1: Using Seed Script (Recommended for Development)

The system includes a dedicated admin seeding script that creates admin accounts with predefined credentials.

#### Command:
```bash
cd backend
npm run seed:admins
```

#### Pre-configured Admin Accounts:

**Admin 1:**
- Admission Number: `ADMIN001`
- Password: `Manuu254@`

**Admin 2:**
- Admission Number: `ADMIN002`
- Password: `Ham254@`

#### Features:
- Checks for existing admins before creating duplicates
- Displays created credentials in the console
- Safe to run multiple times (won't create duplicates)

---

### Method 2: Manual Registration via Admin API

If you need to create additional admin accounts:

#### Endpoint:
```
POST /api/auth/register
```

#### Request Body:
```json
{
  "admissionNumber": "ADMIN003",
  "firstName": "Admin",
  "lastName": "User",
  "phoneNumber": "254712345680",
  "password": "YourSecurePassword123@"
}
```

#### Important Note:
Once created, you must manually update the user's role to `admin` via the database:

```javascript
// In MongoDB
db.users.updateOne(
  { admissionNumber: "ADMIN003" },
  { $set: { role: "admin" } }
)
```

---

## Admin Login

### Steps:
1. Navigate to login page: `http://localhost:5173/login`
2. Enter Admission Number: `ADMIN001` (or `ADMIN002`)
3. Enter Password: `Manuu254@` (or `Ham254@`)
4. Click Login

### After Login:
- You will see the "Admin" link in the navbar (purple colored)
- Click "Admin" to access the admin dashboard at `/admin`
- Regular users will NOT see this link

---

## Admin Features

### Admin Dashboard
Located at `/admin`, accessible only to users with `role: 'admin'`

**Available Features:**
- View all user accounts
- Manage opportunities
- View payment submissions
- Verify/reject payments
- View application submissions
- Generate reports
- System logs and monitoring

---

## User Roles

The system supports three user roles:

| Role | Access | Can See Admin Link |
|------|--------|-------------------|
| `admin` | All admin features | Yes |
| `student` | Apply, view opportunities | No |
| `company` | Post opportunities, view applications | No |

---

## Environment Variables

No special environment variables are needed for admin accounts. All configuration is done through the database.

---

## Database User Schema

Admin users are stored with the following structure:

```javascript
{
  admissionNumber: "ADMIN001",     // Unique identifier
  firstName: "Super",
  lastName: "Admin",
  phoneNumber: "254712345678",
  password: "hashed_password",     // Automatically hashed
  role: "admin",                   // Determines access level
  createdAt: "2024-01-29T...",
  updatedAt: "2024-01-29T..."
}
```

---

## Password Requirements

All passwords must meet these criteria:
- Minimum 6 characters (enforced by backend)
- Recommended: Mix of uppercase, lowercase, numbers, and special characters

### Pre-configured Passwords:
- `Manuu254@` ✅ Secure (includes uppercase, numbers, special chars)
- `Ham254@` ✅ Secure (includes uppercase, numbers, special chars)

---

## Troubleshooting

### Issue: Admin link not showing in navbar after login
**Solution:** 
- Verify your user account has `role: 'admin'` in the database
- Re-login after the role is updated

### Issue: Can't access /admin route
**Solution:**
- Ensure you're logged in as an admin user
- Non-admin users are automatically redirected to `/dashboard`

### Issue: Getting 401 Unauthorized on admin endpoints
**Solution:**
- Your JWT token may have expired
- Log out and log back in
- Check that the Authorization header includes your token

### Issue: Seed script shows "admin user(s) already exist"
**Solution:**
- Run the seed script to create missing admins if needed
- To reset, delete admins from the database first:
  ```bash
  # In MongoDB
  db.users.deleteMany({ role: "admin" })
  npm run seed:admins
  ```

---

## Security Best Practices

1. **Change Default Passwords**: After first login, admins should change their passwords
2. **Use Strong Passwords**: Include uppercase, lowercase, numbers, and special characters
3. **Keep Credentials Secure**: Don't share admin credentials in code or emails
4. **Rotate Periodically**: Change admin passwords every 90 days
5. **Audit Logs**: Monitor admin activity through the logs section

---

## Next Steps

1. Run the seed script to create initial admin accounts
2. Log in with the provided credentials
3. Access the admin dashboard
4. Configure system settings as needed
5. Create additional admins if required

For more information, see:
- [IMPLEMENTATION_COMPLETE.md](../../IMPLEMENTATION_COMPLETE.md)
- [QUICK_START.md](../../QUICK_START.md)
- Backend API documentation in README.md
