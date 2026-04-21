# Application Flow Diagram

## User Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICANT JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

    1. Open signup.html (Apply Now Page)
                ↓
    2. Fill Application Form
       ├─ Full Name *
       ├─ Email Address *
       ├─ Phone Number *
       ├─ Amount of Share (optional)
       ├─ National ID Number *
       ├─ Upload NID Card Image * (drag & drop)
       └─ Address *
                ↓
    3. Form Validation
       ├─ Check all required fields
       ├─ Validate email format
       ├─ Validate phone format
       ├─ Validate NID format
       ├─ Validate file size (<10MB)
       └─ Validate file type (images only)
                ↓
    4. Submit Application
                ↓
    5. Data Stored in Browser
       ├─ localStorage['applicationsDatabase']
       ├─ Application Object Created
       │  ├─ id: "APP-[timestamp]-[random]"
       │  ├─ status: "pending"
       │  ├─ appliedDate: "[timestamp]"
       │  ├─ fullName, email, phone, nid, etc.
       │  └─ nidImage: "[base64 encoded]"
       └─ Maximum 40 applications
                ↓
    6. Success Message Displayed
                ↓
    7. Form Resets (Ready for next application)
                ↓
    8. Wait for Admin Approval
       ├─ Admin reviews application
       ├─ Admin approves or rejects
       └─ Initial password set by admin


┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD FLOW                         │
└─────────────────────────────────────────────────────────────────┘

    1. Login to Admin Dashboard
                ↓
    2. Navigate to: Members & Customers → Membership Applications
                ↓
    3. View Applications List
       ├─ Display all applications in table
       ├─ Show: ID, Name, Email, Phone, NID, Share Amount, Date, Status
       ├─ 10 applications per page (pagination)
       └─ Total count shown
                ↓
    4. Search & Filter (Optional)
       ├─ Search by name or email
       └─ Filter by status (Pending/Approved/Rejected)
                ↓
    5. Select Application to Review
                ↓
    6. Click "View" Button
                ↓
    7. Application Details Modal Opens
       ├─ Display all applicant information
       ├─ Show NID card image preview
       ├─ For Pending Applications:
       │  ├─ Input field for initial password
       │  ├─ Input field to confirm password
       │  ├─ "Approve & Set Password" button
       │  └─ "Reject" button
       ├─ For Approved Applications:
       │  ├─ Show approval date
       │  ├─ Show approver name
       │  └─ Cannot be deleted
       └─ For Rejected Applications:
           └─ Show rejection status
                ↓
    8. Admin Decision
       │
       ├─→ APPROVE PATH:
       │   ├─ Enter initial password
       │   ├─ Confirm password
       │   ├─ Click "Approve & Set Password"
       │   └─ Application Status Changes:
       │       ├─ status = "approved"
       │       ├─ initialPassword = [set]
       │       ├─ approvedDate = [timestamp]
       │       └─ approvedBy = "Admin"
       │
       ├─→ REJECT PATH:
       │   ├─ Click "Reject"
       │   ├─ Confirm rejection
       │   └─ Application Status Changes:
       │       └─ status = "rejected"
       │
       └─→ DELETE PATH (Pending Only):
           ├─ Click "Delete"
           └─ Application removed from database
                ↓
    9. Data Updated in localStorage
                ↓
    10. Table Refreshes
        └─ Shows updated status


┌─────────────────────────────────────────────────────────────────┐
│                    DATA STRUCTURE                               │
└─────────────────────────────────────────────────────────────────┘

Application Object in applicationsDatabase:

{
  "id": "APP-1704459213000-abc123def",
  "status": "pending|approved|rejected",
  "appliedDate": "1/5/2026, 10:30:00 AM",
  
  // ===== USER PROVIDED DATA =====
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "01912345678",
  "shareAmount": "5000",
  "nid": "12345678901234",
  "nidImage": "data:image/png;base64,iVBORw0KGgo...",
  "address": "123 Main Street, City, Country",
  
  // ===== ADMIN SET DATA (on approval) =====
  "initialPassword": "hashedPassword123",
  "confirmPassword": "hashedPassword123",
  "approvedDate": "1/5/2026, 11:00:00 AM",
  "approvedBy": "Admin Name",
  "modifiedInfo": {
    "changedField": "newValue"
  }
}

Storage Location:
- Key: "applicationsDatabase"
- Type: JSON Array in localStorage
- Max Size: 40 applications (configurable)
- Persistence: Browser session + recovery


┌─────────────────────────────────────────────────────────────────┐
│                    STATUS TRANSITIONS                           │
└─────────────────────────────────────────────────────────────────┘

   PENDING
      │
      ├──→ APPROVED (Admin clicks Approve & Set Password)
      │       └──→ User receives credentials via email (future)
      │           └──→ User logs in
      │               └──→ Change temporary password
      │                   └──→ Account active
      │
      ├──→ REJECTED (Admin clicks Reject)
      │       └──→ User notified via email (future)
      │           └──→ Can reapply
      │
      └──→ DELETED (Admin clicks Delete)
          └──→ Application permanently removed
              └──→ User can reapply


┌─────────────────────────────────────────────────────────────────┐
│                    FILE LOCATIONS                               │
└─────────────────────────────────────────────────────────────────┘

Frontend Files:
├─ /frontend/html/
│  ├─ signup.html (Apply Now Form)
│  └─ admindashboard.html (Admin Panel)
├─ /frontend/js/
│  ├─ signup.js (Application form logic & storage)
│  └─ admindashboard.js (Admin management functions)
├─ /frontend/styles/
│  ├─ signup-style.css (Form styling)
│  └─ admindashboard.css (Admin panel styling)
└─ /frontend/logo/
   └─ (Logo images)

Documentation:
├─ IMPLEMENTATION_SUMMARY.md (What was built)
├─ TESTING_GUIDE.md (How to test)
└─ APPLICATION_FLOW.md (This file)


┌─────────────────────────────────────────────────────────────────┐
│                    KEY FEATURES                                 │
└─────────────────────────────────────────────────────────────────┘

✅ Application Form
  ├─ 7 form fields with validation
  ├─ Real-time error messages
  ├─ File upload with drag & drop
  ├─ Image preview before upload
  └─ Success notifications

✅ Data Storage
  ├─ Browser localStorage (frontend only for now)
  ├─ Up to 40 applications queue
  ├─ Persistent across browser sessions
  └─ Easy to migrate to backend

✅ Admin Management
  ├─ View all applications in table
  ├─ Search by name/email
  ├─ Filter by status
  ├─ Pagination (10 per page)
  ├─ Detailed application view
  ├─ Set initial password
  ├─ Approve/Reject/Delete applications
  ├─ View NID card images
  └─ Track approval history

✅ Security (Frontend)
  ├─ Input validation
  ├─ File type & size validation
  ├─ Password confirmation required
  └─ Prevents queue overflow

✅ User Experience
  ├─ Dark mode support
  ├─ Responsive mobile design
  ├─ Loading states
  ├─ Error handling
  ├─ Success feedback
  └─ Intuitive interface


┌─────────────────────────────────────────────────────────────────┐
│                    FUTURE ENHANCEMENTS                          │
└─────────────────────────────────────────────────────────────────┘

Phase 1: Backend Integration
  ├─ Move from localStorage to database
  ├─ Implement API endpoints
  ├─ Add server-side validation
  └─ Implement user authentication

Phase 2: Email Notifications
  ├─ Confirmation email on application submit
  ├─ Approval notification with credentials
  ├─ Rejection notification with feedback
  └─ Password reset functionality

Phase 3: Security & Compliance
  ├─ Image compression & optimization
  ├─ Encrypted password storage
  ├─ Audit logging
  ├─ Role-based access control
  └─ Data privacy compliance (GDPR, etc.)

Phase 4: Advanced Features
  ├─ Application status tracking (user dashboard)
  ├─ Bulk import/export
  ├─ Advanced search filters
  ├─ Custom workflows
  └─ Integration with member account system
