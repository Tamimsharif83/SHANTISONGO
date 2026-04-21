# Developer Quick Reference

## 🚀 Quick Start

### Users (Apply):
```
frontend/html/signup.html → Fill form → Submit → Data saved
```

### Admin (Manage):
```
frontend/html/admindashboard.html → Members & Customers → Membership Applications → Manage
```

## 📁 Key Files

```
/frontend/
├── html/
│   ├── signup.html          ← Apply Now form
│   └── admindashboard.html  ← Admin panel with applications management
├── js/
│   ├── signup.js            ← Form logic + localStorage storage
│   └── admindashboard.js    ← Admin functions + applications display
└── styles/
    ├── signup-style.css     ← Form styling + file upload
    └── admindashboard.css   ← Admin UI + modal styles
```

## 🔧 Main Functions

### Application Form (signup.js)
```javascript
handleFormSubmission()      // Form submission handler
submitApplication()         // Saves to localStorage
initializeFileUpload()      // File upload handling
validateField()             // Field validation
```

### Admin Dashboard (admindashboard.js)
```javascript
loadApplicationsList()      // Load from localStorage
displayApplicationsTable()  // Render applications
viewApplicationDetails()    // Show details modal
approveApplication()        // Approve with password
rejectApplication()         // Reject application
deleteApplication()         // Delete pending app
filterApplications()        // Filter + search
```

## 💾 localStorage Keys

```javascript
// Main database
localStorage.getItem('applicationsDatabase')    // Array of applications
localStorage.getItem('darkMode')                // Theme preference (signup)
localStorage.getItem('darkTheme')               // Theme preference (admin)
```

## 📊 Application Object

```javascript
{
  id: "APP-[timestamp]-[random]",
  status: "pending|approved|rejected",
  appliedDate: "MM/DD/YYYY, HH:MM:SS AM/PM",
  fullName: "string",
  email: "string",
  phone: "string",
  shareAmount: "number",
  nid: "string",
  nidImage: "data:image/[type];base64,...",
  address: "string",
  initialPassword: "string|null",
  confirmPassword: "string|null",
  approvedDate: "string|null",
  approvedBy: "string|null",
  modifiedInfo: "object|null"
}
```

## ✨ Features by File

### signup.html
- Apply Now form with 7 fields
- File upload with drag-drop
- Form validation

### signup.js
- Real-time validation
- File upload handling
- Data serialization (base64 images)
- localStorage persistence
- Success/error notifications

### admindashboard.html
- Membership Applications section
- Applications table
- Search & filter inputs
- Action buttons (View, Delete)
- Application details modal
- Admin fields (password, approval)

### admindashboard.js
- Load/display applications
- Pagination (10 per page)
- Search & filter logic
- Modal open/close
- Approve/reject logic
- Delete functionality
- localStorage sync

### CSS Files
- Responsive design
- Dark mode support
- Form validation states
- Modal styling
- Table styling
- Status badge colors

## 🔄 Data Flow

```
User fills form → Validation → File conversion → Storage → Success message

Admin views → Filter/search → Click view → Modal opens → Approve/reject → Update storage
```

## 🎨 Important CSS Classes

### Form States
```css
.error           /* Red border + background for invalid field */
.success         /* Green border for valid field */
.shake           /* Animation for validation error */
```

### Status Badges
```css
.status-badge.pending   /* Yellow - awaiting approval */
.status-badge.approved  /* Green - approved */
.status-badge.rejected  /* Red - rejected */
```

### Buttons
```css
.action-btn.view    /* Blue - view details */
.action-btn.delete  /* Red - delete application */
.btn-primary        /* Primary action button */
.btn-secondary      /* Secondary action button */
.btn-danger         /* Danger action (red) */
.btn-success        /* Success action (green) */
```

## 🔍 Common Tasks

### Add Test Data
```javascript
let testApp = {
  id: "APP-TEST-001",
  status: "pending",
  appliedDate: new Date().toLocaleString(),
  fullName: "Test User",
  email: "test@example.com",
  phone: "01912345678",
  shareAmount: "5000",
  nid: "12345678901234",
  nidImage: "data:image/png;base64,iVBORw0KGgo...",
  address: "Test Address"
};
let apps = JSON.parse(localStorage.getItem('applicationsDatabase')) || [];
apps.push(testApp);
localStorage.setItem('applicationsDatabase', JSON.stringify(apps));
```

### Clear All Data
```javascript
localStorage.removeItem('applicationsDatabase');
```

### Get Application Count
```javascript
JSON.parse(localStorage.getItem('applicationsDatabase')).length
```

### Get Applications by Status
```javascript
let apps = JSON.parse(localStorage.getItem('applicationsDatabase')) || [];
console.log('Pending:', apps.filter(a => a.status === 'pending').length);
console.log('Approved:', apps.filter(a => a.status === 'approved').length);
console.log('Rejected:', apps.filter(a => a.status === 'rejected').length);
```

## 🐛 Debugging

### Check localStorage
```javascript
// In browser console (F12)
JSON.parse(localStorage.getItem('applicationsDatabase'))
```

### Monitor functions
```javascript
// Add to js files for debugging
console.log('Function called with:', param);
```

### Check form submission
```javascript
// Check browser network tab for any API calls
// Check console for JavaScript errors
```

### Verify file upload
```javascript
// Check file size: file.size
// Check file type: file.type
// Should be: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
```

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All components adapt automatically.

## 🎯 Validation Rules

### Full Name
- Required
- Min 2 characters
- Letters & spaces only
- Pattern: `/^[a-zA-Z\s\u0980-\u09FF]+$/`

### Email
- Required
- Valid email format
- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Phone
- Required
- Bangladesh format: 01[3-9]XXXXXXXX
- Pattern: `/^01[3-9]\d{8}$/`

### NID
- Required
- 10, 13, or 17 digits
- Pattern: `/^\d{10}$|^\d{13}$|^\d{17}$/`

### Address
- Required
- Min 10 characters

### File (NID Image)
- Required
- Size: < 10MB
- Type: image/* (PNG, JPG, GIF, WebP)

### Password (Admin set)
- Min 6 characters
- Must match confirmation

## 🔐 Security Considerations

### Current (Frontend - Testing Only)
- Input validation
- File validation
- Password confirmation
- Queue limit (40 max)

### Production (Will Need)
- Backend validation
- Password hashing
- Rate limiting
- HTTPS
- CORS
- SQL injection prevention
- CSRF tokens
- Audit logging
- Data encryption

## 📚 Documentation Structure

1. **COMPLETION_REPORT.md** - What was built, feature list, next steps
2. **TESTING_GUIDE.md** - How to test, browser console commands
3. **APPLICATION_FLOW.md** - System diagrams, data flow, architecture
4. **This file** - Developer quick reference

## 🚦 Next Steps

1. ✅ Frontend complete
2. ⏳ Backend implementation
3. ⏳ Email notifications
4. ⏳ Production deployment
5. ⏳ User account creation integration

## 💡 Tips

- Always check localStorage for data persistence
- Use browser DevTools for debugging
- Test with different file sizes/types
- Test on mobile devices
- Check console for JavaScript errors
- Test pagination with 40+ apps

## ✅ Quality Checklist

- [x] All form validations working
- [x] File upload functional
- [x] localStorage persistence
- [x] Admin features complete
- [x] Responsive design
- [x] Dark mode support
- [x] Error handling
- [x] Success notifications
- [x] Documentation complete
- [x] Code commented
