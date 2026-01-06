# Member Onboarding & Authentication Flow

## Overview
This document describes the complete member onboarding and authentication flow implemented in the SHANTISONGHO system.

## Flow Steps

### 1. Application Submission
- **Page**: [signup.html](frontend/html/signup.html)
- **Process**:
  - User fills out membership application form
  - Form includes: Full Name, Email, Phone, Share Amount, NID, NID Image, Address
  - Application is submitted to MongoDB via API endpoint `/applications/submit`
  - Application status is set to "pending"

### 2. Admin Reviews Application
- **Page**: [admindashboard.html](frontend/html/admindashboard.html)
- **Section**: Membership Applications
- **Process**:
  - Admin views list of pending applications
  - Admin clicks 👁️ (View) button to see full application details
  - Admin can see all information including NID image

### 3. Admin Approves & Sets Credentials
- **Action**: Admin clicks "Approve & Set Password" button
- **Process**:
  1. System prompts for **Member ID** (unique identifier for the member)
  2. System prompts for **Initial Password** (minimum 6 characters)
  3. System asks to confirm the password
  4. Upon confirmation:
     - A new **User account** is created in the database
     - Username = Email address
     - Password is hashed using bcrypt
     - User role is set to "member"
     - `firstLogin` flag is set to `true`
     - Application status updated to "approved"
     - Member ID and initial password stored in application record

### 4. Member's First Login
- **Page**: [login.html](frontend/html/login.html)
- **Credentials**: 
  - **Username**: Email address (provided during application)
  - **Password**: Initial password (set by admin)
- **Process**:
  - Member enters email and initial password
  - System authenticates credentials
  - System detects `firstLogin = true`
  - Member is **automatically redirected** to change password page

### 5. Mandatory Password Change
- **Page**: [change-password.html](frontend/html/change-password.html)
- **Requirements**:
  - Password must be at least 8 characters
  - Must include uppercase letter
  - Must include lowercase letter
  - Must include number
  - Must include special character
- **Process**:
  - Member enters new password (meeting all requirements)
  - Member confirms new password
  - Upon successful change:
    - Password is updated in database
    - `firstLogin` flag is set to `false`
    - Session is cleared
    - Member is **logged out automatically**
    - Redirected to login page

### 6. Second Login with New Credentials
- **Page**: [login.html](frontend/html/login.html)
- **Credentials**: 
  - **Username**: Email OR Member ID
  - **Password**: New password (set by member)
- **Process**:
  - Member can now use either email or member ID to login
  - System authenticates with new password
  - Since `firstLogin = false`, member is taken directly to dashboard
  - Member has full access to all features

## Database Models

### User Schema
```javascript
{
  username: String (email),
  email: String (unique),
  memberID: String (unique, set by admin),
  fullName: String,
  password: String (hashed),
  role: String (admin/member),
  firstLogin: Boolean (true on creation),
  applicationId: ObjectId (reference to application)
}
```

### Application Schema
```javascript
{
  fullName: String,
  email: String,
  phone: String,
  shareAmount: Number,
  nid: String,
  nidImage: String (base64),
  address: String,
  status: String (pending/approved/rejected),
  submittedDate: Date,
  approvedDate: Date,
  approvedBy: String,
  memberID: String (set on approval),
  initialPassword: String (stored for admin reference),
  userCreated: Boolean
}
```

## API Endpoints

### POST `/auth/login`
- **Input**: `{ username: String, password: String }`
- **Output**: User info with `firstLogin` flag
- **Note**: `username` can be email, memberID, or username

### POST `/auth/change-password`
- **Input**: `{ userId: String, newPassword: String }`
- **Output**: Success message
- **Effect**: Updates password and sets `firstLogin = false`

### POST `/applications/submit`
- **Input**: Application form data
- **Output**: Application ID and confirmation

### PUT `/applications/approve/:id`
- **Input**: `{ approvedBy: String, memberID: String, initialPassword: String }`
- **Output**: Success message with member details
- **Effect**: 
  - Creates User account
  - Updates application status
  - Links application to user

## Security Features

1. **Password Hashing**: All passwords stored using bcrypt
2. **Unique Constraints**: Email and Member ID are unique
3. **First Login Detection**: Automatic redirect to password change
4. **Session Management**: Session cleared after password change
5. **Role-Based Access**: Members can't access admin dashboard
6. **Forced Re-authentication**: Must login again after password change

## User Experience Flow

```
Application → Admin Approval → First Login (Email + Initial Password) 
    ↓
Mandatory Password Change → Auto Logout → Second Login (Email/ID + New Password) 
    ↓
Full Dashboard Access
```

## Important Notes

1. **Admin must provide Member ID and password** when approving
2. **First login always uses email** (member doesn't know their ID yet)
3. **After password change, member can use email OR member ID**
4. **Password change is mandatory** - cannot access dashboard without it
5. **System automatically manages the flow** - no manual intervention needed
6. **Initial password is stored in plain text** in application record for admin reference (consider removing after member's first successful login for better security)

## Testing the Flow

1. **Submit an application** via signup page
2. **Login as admin** to admindashboard
3. **View and approve** the application (set ID: TEST001, password: Test123!)
4. **Login with email** (from application) and initial password
5. **Verify redirect** to change-password page
6. **Set new password** meeting all requirements
7. **Verify logout** and redirect to login
8. **Login again** using either email or TEST001 with new password
9. **Verify access** to member dashboard

## Files Modified

- `backend/models/User.js` - Added email, memberID, fullName, applicationId
- `backend/models/Application.js` - Added memberID, initialPassword, userCreated
- `backend/routes/applications.js` - Updated approve route to create user accounts
- `backend/routes/auth.js` - Updated login to accept email/memberID/username
- `frontend/js/admindashboard.js` - Added memberID/password prompts on approval, added auth checks
- `frontend/js/login.js` - Store and handle additional user data
- `frontend/js/change-password.js` - Logout and clear session after password change
- `frontend/js/member-dashboard.js` - Added auth checks and firstLogin redirect
