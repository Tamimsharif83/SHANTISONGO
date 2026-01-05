# How to Test the Apply Now Feature

## Quick Start Guide

### For Users (Applicants):
1. Open: `frontend/html/signup.html` in your browser
2. Fill in the application form:
   - Full Name (required)
   - Email Address (required)
   - Phone Number (required)
   - Amount of Share (optional)
   - National ID Number (required)
   - Upload National ID Card Image (required)
   - Address (required)
3. Click "Submit Application"
4. You'll see a success message
5. Form will reset, ready for next application

### For Admin:
1. Open: `frontend/html/admindashboard.html` in your browser
2. Click on: **Members & Customers** → **Membership Applications**
3. You'll see a table of all applications
4. Use the search bar to find applications by name or email
5. Use the status filter to view pending/approved/rejected applications
6. Click the **View** button to see application details
7. In the details modal:
   - See all applicant information
   - View the uploaded NID card image
   - For pending applications:
     - Set initial password
     - Confirm initial password
     - Click "Approve & Set Password" to approve
     - Or click "Reject" to reject the application
8. Approved applications show:
   - Approval date
   - Approver name
   - Password set (hidden as ••••••••)
   - Can no longer be deleted

## Sample Test Data

You can create test applications by:

### Method 1: Using the Form
1. Navigate to the Apply Now page
2. Fill in the form and submit

### Method 2: Adding Data via Browser Console
```javascript
// Open browser console (F12 or Ctrl+Shift+I)
// Paste this code to add a test application

let testApps = [
  {
    id: "APP-TEST-001",
    status: "pending",
    appliedDate: new Date().toLocaleString(),
    fullName: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "01912345678",
    shareAmount: "5000",
    nid: "12345678901234",
    nidImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    address: "123 Main Street, Dhaka",
    initialPassword: null,
    confirmPassword: null,
    approvedDate: null,
    approvedBy: null,
    modifiedInfo: null
  },
  {
    id: "APP-TEST-002",
    status: "pending",
    appliedDate: new Date().toLocaleString(),
    fullName: "Fatima Khan",
    email: "fatima@example.com",
    phone: "01998765432",
    shareAmount: "10000",
    nid: "98765432109876",
    nidImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    address: "456 Oak Avenue, Chittagong",
    initialPassword: null,
    confirmPassword: null,
    approvedDate: null,
    approvedBy: null,
    modifiedInfo: null
  }
];

let current = JSON.parse(localStorage.getItem('applicationsDatabase')) || [];
let merged = [...current, ...testApps];
localStorage.setItem('applicationsDatabase', JSON.stringify(merged));
console.log('Test applications added!');
```

## Browser Console Commands

Check what's stored in localStorage:

```javascript
// View all applications
JSON.parse(localStorage.getItem('applicationsDatabase'))

// Count total applications
JSON.parse(localStorage.getItem('applicationsDatabase')).length

// View applications by status
let apps = JSON.parse(localStorage.getItem('applicationsDatabase'));
console.log('Pending:', apps.filter(a => a.status === 'pending').length);
console.log('Approved:', apps.filter(a => a.status === 'approved').length);
console.log('Rejected:', apps.filter(a => a.status === 'rejected').length);

// Clear all applications (use carefully!)
localStorage.removeItem('applicationsDatabase');
console.log('All applications cleared');

// Approve an application programmatically
let apps = JSON.parse(localStorage.getItem('applicationsDatabase'));
if (apps.length > 0) {
  apps[0].status = 'approved';
  apps[0].initialPassword = 'temppass123';
  apps[0].approvedDate = new Date().toLocaleString();
  apps[0].approvedBy = 'Admin';
  localStorage.setItem('applicationsDatabase', JSON.stringify(apps));
  console.log('First application approved!');
}
```

## Feature Testing Checklist

### ✅ Application Form
- [ ] All form fields display correctly
- [ ] Required field validation works
- [ ] Email validation works
- [ ] Phone number validation works
- [ ] NID validation works
- [ ] File upload works with drag & drop
- [ ] File size validation works (must be < 10MB)
- [ ] File type validation works (images only)
- [ ] Error messages display correctly
- [ ] Success message appears on submission
- [ ] Form resets after successful submission
- [ ] Data saves to localStorage

### ✅ Admin Dashboard
- [ ] Membership Applications section appears
- [ ] Applications table displays with correct columns
- [ ] Search functionality works
- [ ] Status filter works
- [ ] View button opens details modal
- [ ] Modal displays all application information
- [ ] NID image preview works
- [ ] Password fields appear for pending applications
- [ ] Approve button works and updates status
- [ ] Reject button works and updates status
- [ ] Delete button removes pending applications
- [ ] Approved applications show approval info
- [ ] Pagination works correctly

### ✅ Data Persistence
- [ ] Data persists after page reload
- [ ] Applications appear in correct status
- [ ] Search results persist across sessions
- [ ] Maximum 40 applications limit enforced

## Troubleshooting

**Applications not showing in admin?**
- Check browser console for errors
- Verify localStorage has data: `JSON.parse(localStorage.getItem('applicationsDatabase'))`
- Clear cache and reload page

**File upload not working?**
- Check file size (must be < 10MB)
- Check file type (must be image)
- Try different browser (compatibility issue?)

**Modal not opening?**
- Check browser console for JavaScript errors
- Verify admindashboard.js is loaded
- Try in a different browser

**Data lost after clearing browser cache?**
- localStorage is cleared when cache is cleared
- Export important data before clearing cache

## Next Steps

Once you're satisfied with the frontend:
1. Connect to backend API for data persistence
2. Add email notifications
3. Implement user account creation on approval
4. Add audit logging
5. Implement role-based access control
6. Add image compression for file storage
7. Implement email verification
