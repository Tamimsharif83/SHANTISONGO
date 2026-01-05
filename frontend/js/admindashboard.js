// Admin Dashboard JavaScript

// Global variables for application management
let applicationsDatabase = JSON.parse(localStorage.getItem('applicationsDatabase')) || [];
let currentApplicationPage = 1;
const APPS_PER_PAGE = 10;
let currentViewingApp = null;

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.notificationsPanelOpen = false;
        this.profileMenuOpen = false;
        this.charts = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadDashboardData();
        this.initializeCharts();
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('mobileMenuToggle').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('globalSearch').addEventListener('input', (e) => this.handleGlobalSearch(e));
        
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    initializeTheme() {
        const themeIcon = document.getElementById('themeToggle').querySelector('.theme-icon');
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeIcon.textContent = '🌙';
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.textContent = '🌞';
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('darkTheme', this.isDarkTheme);
        this.initializeTheme();
        this.showNotification('Theme changed successfully', 'success');
    }

    toggleMobileMenu() {
        document.getElementById('sidebar').classList.toggle('open');
    }

    handleResize() {
        if (window.innerWidth > 1024) {
            document.getElementById('sidebar').classList.remove('open');
        }
    }

    handleOutsideClick(e) {
        // Close notifications panel if clicked outside
        const notificationsPanel = document.getElementById('notificationsPanel');
        const notificationIcon = document.querySelector('.notification-icon');
        if (!notificationsPanel.contains(e.target) && !notificationIcon.contains(e.target)) {
            notificationsPanel.classList.remove('open');
            this.notificationsPanelOpen = false;
        }

        // Close profile menu if clicked outside
        const profileMenu = document.getElementById('profileMenu');
        const userProfile = document.querySelector('.user-profile');
        if (!profileMenu.contains(e.target) && !userProfile.contains(e.target)) {
            profileMenu.classList.remove('open');
            this.profileMenuOpen = false;
        }
    }

    handleGlobalSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Implement global search functionality
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        console.log('Loading dashboard data...');
    }

    // Navigation
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }

        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.submenu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });

        // For main menu items
        const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
        if (menuItem) {
            menuItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load applications when membership-applications section is shown
        if (sectionId === 'membership-applications') {
            loadApplicationsList();
        }
        
        // Close mobile menu on section change
        if (window.innerWidth <= 1024) {
            this.toggleMobileMenu();
        }
    }

    toggleSubmenu(element) {
        const submenu = element.nextElementSibling;
        const isActive = submenu.classList.contains('active');
        
        // Close all submenus
        document.querySelectorAll('.submenu').forEach(sub => {
            sub.classList.remove('active');
        });
        
        document.querySelectorAll('.menu-item.has-submenu').forEach(item => {
            item.classList.remove('open');
        });

        // Toggle clicked submenu
        if (!isActive) {
            submenu.classList.add('active');
            element.classList.add('open');
        }
    }

    // Notifications
    toggleNotifications() {
        const panel = document.getElementById('notificationsPanel');
        this.notificationsPanelOpen = !this.notificationsPanelOpen;
        
        if (this.notificationsPanelOpen) {
            panel.classList.add('open');
        } else {
            panel.classList.remove('open');
        }
    }

    // Profile Menu
    toggleProfileMenu() {
        const menu = document.getElementById('profileMenu');
        this.profileMenuOpen = !this.profileMenuOpen;
        
        if (this.profileMenuOpen) {
            menu.classList.add('open');
        } else {
            menu.classList.remove('open');
        }
    }

    viewProfile() {
        this.toggleProfileMenu();
        this.showNotification('Opening profile page...', 'info');
    }

    showSettings() {
        this.toggleProfileMenu();
        document.getElementById('settingsModal').style.display = 'block';
    }

    // Charts
    initializeCharts() {
        // Transaction Chart
        const transactionCanvas = document.getElementById('transactionChart');
        if (transactionCanvas) {
            // Using simple canvas drawing as placeholder
            const ctx = transactionCanvas.getContext('2d');
            ctx.fillStyle = '#e3f2fd';
            ctx.fillRect(0, 0, transactionCanvas.width, transactionCanvas.height);
            ctx.fillStyle = '#2196f3';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Transaction Chart', transactionCanvas.width / 2, transactionCanvas.height / 2);
        }

        // Investment Chart
        const investmentCanvas = document.getElementById('investmentChart');
        if (investmentCanvas) {
            const ctx = investmentCanvas.getContext('2d');
            ctx.fillStyle = '#dcfce7';
            ctx.fillRect(0, 0, investmentCanvas.width, investmentCanvas.height);
            ctx.fillStyle = '#1e7e34';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Investment Distribution', investmentCanvas.width / 2, investmentCanvas.height / 2);
        }
    }

    // Dashboard Actions
    refreshDashboard() {
        this.showLoading('Refreshing dashboard...');
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Dashboard refreshed successfully', 'success');
            this.loadDashboardData();
        }, 1500);
    }

    // Data Entry
    showNewDataEntryModal() {
        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>New Data Entry</h3>
                        <button onclick="closeModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="newDataEntryForm">
                            <div class="form-group">
                                <label>Transaction Type *</label>
                                <select name="type" required>
                                    <option value="">Select Type</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="investment">Investment</option>
                                    <option value="payment">Payment</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Member ID *</label>
                                <input type="text" name="memberId" required placeholder="Enter Member ID" />
                            </div>
                            <div class="form-group">
                                <label>Amount (৳) *</label>
                                <input type="number" name="amount" min="0" required placeholder="Enter Amount" />
                            </div>
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" name="date" required />
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="3" placeholder="Enter description"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                        <button onclick="submitDataEntry()" class="btn btn-primary">Submit Entry</button>
                    </div>
                </div>
            </div>
        `;
        this.showModal(modalHTML);
    }

    submitDataEntry() {
        this.showLoading('Submitting data...');
        setTimeout(() => {
            this.hideLoading();
            this.closeModal();
            this.showNotification('Data entry submitted successfully', 'success');
        }, 1500);
    }

    // Reports
    showReportType(type) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        console.log('Showing report type:', type);
    }

    generateFinancialReport() {
        this.showLoading('Generating financial report...');
        
        setTimeout(() => {
            const displayArea = document.getElementById('financialReportDisplay');
            const reportHTML = `
                <div class="report-content">
                    <h3 style="text-align: center; color: var(--primary-blue); margin-bottom: 2rem;">
                        Income Statement<br>
                        <small style="color: var(--text-gray);">For the period ending ${new Date().toLocaleDateString()}</small>
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--light-blue);">
                                <th style="padding: 12px; text-align: left; border: 1px solid var(--border-gray);">Account</th>
                                <th style="padding: 12px; text-align: right; border: 1px solid var(--border-gray);">Amount (৳)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; border: 1px solid var(--border-gray);">Revenue</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid var(--border-gray);">15,250,000</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid var(--border-gray);">Operating Expenses</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid var(--border-gray);">(3,450,000)</td>
                            </tr>
                            <tr style="background: var(--light-green); font-weight: 600;">
                                <td style="padding: 12px; border: 1px solid var(--border-gray);">Net Income</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid var(--border-gray);">11,800,000</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="exportReport('pdf')" class="btn btn-secondary">Export PDF</button>
                        <button onclick="exportReport('excel')" class="btn btn-primary">Export Excel</button>
                    </div>
                </div>
            `;
            displayArea.innerHTML = reportHTML;
            this.hideLoading();
        }, 2000);
    }

    exportReport(format) {
        this.showLoading(`Exporting as ${format.toUpperCase()}...`);
        setTimeout(() => {
            this.hideLoading();
            this.showNotification(`Report exported as ${format.toUpperCase()} successfully`, 'success');
        }, 1500);
    }

    // Monitoring
    refreshMonitoring() {
        this.showLoading('Refreshing monitoring data...');
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Monitoring data refreshed', 'success');
        }, 1500);
    }

    // Utility Functions
    showModal(html) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = html;
        document.body.style.overflow = 'hidden';

        // Add modal styles if not already added
        if (!document.getElementById('modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
            modalStyles.textContent = `
                .modal-overlay { 
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    height: 100%; 
                    background: rgba(0,0,0,0.5); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    z-index: 10000; 
                    animation: fadeIn 0.3s ease;
                }
                .modal-content { 
                    background: var(--white); 
                    border-radius: 12px; 
                    max-width: 600px; 
                    width: 90%; 
                    max-height: 90vh; 
                    overflow-y: auto; 
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                }
                .modal-header { 
                    padding: 1.5rem; 
                    border-bottom: 2px solid var(--border-gray); 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                }
                .modal-header h3 { 
                    color: var(--primary-blue); 
                    margin: 0; 
                }
                .modal-close { 
                    background: none; 
                    border: none; 
                    font-size: 1.5rem; 
                    cursor: pointer; 
                    padding: 0.5rem;
                    color: var(--text-gray);
                }
                .modal-close:hover {
                    color: var(--text-dark);
                }
                .modal-body { 
                    padding: 1.5rem; 
                }
                .modal-footer { 
                    padding: 1.5rem; 
                    border-top: 2px solid var(--border-gray); 
                    display: flex; 
                    gap: 1rem; 
                    justify-content: flex-end; 
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(modalStyles);
        }
    }

    closeModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
        document.body.style.overflow = 'auto';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; 
            top: calc(var(--header-height) + 1rem); 
            right: 2rem; 
            z-index: 10001; 
            padding: 1rem 1.5rem;
            border-radius: 8px; 
            font-weight: 500; 
            max-width: 350px; 
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 20px var(--shadow);
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            border: 2px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showLoading(message = 'Loading...') {
        if (document.getElementById('loadingOverlay')) return;
        
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.7);
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center;
            z-index: 10002; 
            color: white;
        `;
        
        loading.innerHTML = `
            <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 1rem; font-size: 1.1rem;">${message}</p>
        `;
        
        document.body.appendChild(loading);

        // Add spin animation if not already added
        if (!document.getElementById('spin-animation')) {
            const style = document.createElement('style');
            style.id = 'spin-animation';
            style.textContent = `
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
                @keyframes slideIn { 
                    from { transform: translateX(100%); opacity: 0; } 
                    to { transform: translateX(0); opacity: 1; } 
                }
                @keyframes slideOut { 
                    from { transform: translateX(0); opacity: 1; } 
                    to { transform: translateX(100%); opacity: 0; } 
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.remove();
    }
}

// Global Functions
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
});

// Navigation Functions
function showSection(section) { 
    dashboard.showSection(section); 
}

function toggleSubmenu(element) { 
    dashboard.toggleSubmenu(element); 
}

function toggleNotifications() { 
    dashboard.toggleNotifications(); 
}

function toggleProfileMenu() { 
    dashboard.toggleProfileMenu(); 
}

function viewProfile() { 
    dashboard.viewProfile(); 
}

function showSettings() { 
    dashboard.showSettings(); 
}

function toggleMobileMenu() { 
    dashboard.toggleMobileMenu(); 
}

// Dashboard Actions
function refreshDashboard() { 
    dashboard.refreshDashboard(); 
}

// Data Entry
function showNewDataEntryModal() { 
    dashboard.showNewDataEntryModal(); 
}

function submitDataEntry() { 
    dashboard.submitDataEntry(); 
}

// Reports
function showReportType(type) { 
    dashboard.showReportType(type); 
}

function generateFinancialReport() { 
    dashboard.generateFinancialReport(); 
}

function exportReport(format) { 
    dashboard.exportReport(format); 
}

// Monitoring
function refreshMonitoring() { 
    dashboard.refreshMonitoring(); 
}

// Modal Functions
function closeModal() {
    dashboard.closeModal();
}

// Logout
function logout() {
    showLogoutConfirmation();
}

function showLogoutConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'logout-confirmation-modal';
    modal.innerHTML = `
        <div class="logout-modal-overlay" onclick="closeLogoutConfirmation()"></div>
        <div class="logout-modal-content">
            <div class="logout-modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout from admin dashboard?</p>
            <div class="logout-modal-actions">
                <button class="btn btn-secondary" onclick="closeLogoutConfirmation()">
                    <span>Cancel</span>
                </button>
                <button class="btn btn-danger" onclick="confirmLogout()">
                    <span>Yes, Logout</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeLogoutConfirmation() {
    const modal = document.querySelector('.logout-confirmation-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function confirmLogout() {
    closeLogoutConfirmation();
    dashboard.showNotification('Logging out...', 'info');
    sessionStorage.clear();
    localStorage.removeItem('adminSession');
    setTimeout(() => { 
        window.location.href = '/frontend/html/login.html'; 
    }, 800);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + 1-9 for quick section navigation
    if (e.altKey && e.key >= '1' && e.key <= '9') {
        const sections = ['dashboard', 'all-data-entry', 'create-member', 'deposit-account', 
                         'received-register', 'general-reports', 'upload-circular', 'operation-monitoring'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) dashboard.showSection(sections[index]);
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeModal();
        document.getElementById('notificationsPanel').classList.remove('open');
        document.getElementById('profileMenu').classList.remove('open');
    }
    
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('globalSearch').focus();
    }
});

// Auto-close notifications after reading
document.addEventListener('click', (e) => {
    if (e.target.closest('.notification-item')) {
        e.target.closest('.notification-item').classList.remove('unread');
    }
});

// Initialize tooltips (if needed)
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('mouseenter', function() {
        const title = this.getAttribute('title');
        if (title) {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = title;
            tooltip.style.cssText = `
                position: absolute;
                background: var(--text-dark);
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 4px;
                font-size: 0.85rem;
                z-index: 10003;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            
            this.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        }
    });
});

// Print functionality
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment below to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

console.log('Admin Dashboard loaded successfully');
console.log('Keyboard shortcuts:');
console.log('- Alt + 1-9: Quick navigation');
console.log('- Ctrl/Cmd + K: Focus search');
console.log('- Escape: Close modals/panels');

function logoRefresh() {
    window.location.href = 'index.html';
}

// Settings Modal Functions
function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
    document.getElementById('passwordChangeForm').reset();
    clearPasswordErrors();
}

function togglePasswordField(fieldId) {
    const field = document.getElementById(fieldId);
    const btn = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        btn.textContent = '🙈';
    } else {
        field.type = 'password';
        btn.textContent = '👁️';
    }
}

function validateNewPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const reqLength = document.getElementById('req-length');
    const errorMsg = document.getElementById('newPasswordError');
    
    if (newPassword.length >= 6) {
        reqLength.classList.add('valid');
        reqLength.classList.remove('invalid');
        errorMsg.textContent = '';
        return true;
    } else {
        reqLength.classList.add('invalid');
        reqLength.classList.remove('valid');
        if (newPassword.length > 0) {
            errorMsg.textContent = 'Password must be at least 6 characters';
        }
        return false;
    }
}

function validateConfirmPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const reqMatch = document.getElementById('req-match');
    const errorMsg = document.getElementById('confirmPasswordError');
    
    if (confirmPassword.length === 0) {
        reqMatch.classList.remove('valid', 'invalid');
        errorMsg.textContent = '';
        return false;
    }
    
    if (newPassword === confirmPassword) {
        reqMatch.classList.add('valid');
        reqMatch.classList.remove('invalid');
        errorMsg.textContent = '';
        return true;
    } else {
        reqMatch.classList.add('invalid');
        reqMatch.classList.remove('valid');
        errorMsg.textContent = 'Passwords do not match';
        return false;
    }
}

function clearPasswordErrors() {
    document.getElementById('oldPasswordError').textContent = '';
    document.getElementById('newPasswordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    document.querySelectorAll('.password-requirements li').forEach(li => {
        li.classList.remove('valid', 'invalid');
    });
}

async function handlePasswordChange(event) {
    event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const saveBtn = document.getElementById('savePasswordBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');
    
    // Clear previous errors
    clearPasswordErrors();
    
    // Validate
    let isValid = true;
    
    if (!oldPassword) {
        document.getElementById('oldPasswordError').textContent = 'Current password is required';
        isValid = false;
    }
    
    if (!validateNewPassword()) {
        isValid = false;
    }
    
    if (!validateConfirmPassword()) {
        isValid = false;
    }
    
    if (!isValid) {
        dashboard.showNotification('Please fix the errors above', 'error');
        return;
    }
    
    // Get userId from sessionStorage
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        dashboard.showNotification('Session expired. Please login again.', 'error');
        setTimeout(() => {
            window.location.href = '/frontend/html/login.html';
        }, 2000);
        return;
    }
    
    // Show loading state
    saveBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    try {
        const response = await fetch('http://localhost:5000/auth/update-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                oldPassword: oldPassword,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            dashboard.showNotification('Password changed successfully! Redirecting to login...', 'success');
            closeSettingsModal();
            
            // Auto-redirect to login after password change
            setTimeout(() => {
                sessionStorage.clear();
                localStorage.removeItem('adminSession');
                window.location.href = '/frontend/html/login.html';
            }, 1500);
        } else {
            if (data.msg === 'Old password is incorrect') {
                document.getElementById('oldPasswordError').textContent = data.msg;
            }
            dashboard.showNotification(data.msg || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        dashboard.showNotification('Unable to connect to server', 'error');
    } finally {
        saveBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Chart Initialization
let transactionChart = null;
let investmentChart = null;

function initializeCharts() {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(initializeCharts, 100);
        return;
    }
    
    initTransactionChart();
    initInvestmentChart();
}

function initTransactionChart() {
    const ctx = document.getElementById('transactionChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (transactionChart) {
        transactionChart.destroy();
    }
    
    // Dummy data for the last 6 months
    const labels = ['July', 'August', 'September', 'October', 'November', 'December'];
    const deposits = [2.1, 2.4, 2.2, 2.8, 2.6, 3.1];
    const withdrawals = [1.2, 1.5, 1.3, 1.6, 1.4, 1.8];
    const investments = [0.8, 1.0, 0.9, 1.2, 1.1, 1.3];
    
    transactionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deposits',
                    data: deposits,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Withdrawals',
                    data: withdrawals,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Investments',
                    data: investments,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '৳' + context.parsed.y.toFixed(1) + 'M';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '৳' + value + 'M';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initInvestmentChart() {
    const ctx = document.getElementById('investmentChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (investmentChart) {
        investmentChart.destroy();
    }
    
    // Dummy data for investment distribution
    const data = [
        { label: 'Monthly Share', value: 3.2, color: '#4CAF50' },
        { label: 'Fixed Deposit', value: 2.8, color: '#2196F3' },
        { label: 'Savings Account', value: 1.5, color: '#FF9800' },
        { label: 'Business Investment', value: 0.8, color: '#9C27B0' }
    ];
    
    investmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.color),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return label + ': ৳' + value.toFixed(1) + 'M (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Initialize charts when dashboard is shown
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeCharts, 500);
    loadApplicationsList(); // Load applications when page loads
});

// ================== APPLICATION MANAGEMENT FUNCTIONS ==================

function loadApplicationsList() {
    // Reload from localStorage to get latest data
    applicationsDatabase = JSON.parse(localStorage.getItem('applicationsDatabase')) || [];
    currentApplicationPage = 1;
    displayApplicationsTable();
}

function displayApplicationsTable() {
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (applicationsDatabase.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No applications found</td></tr>';
        return;
    }
    
    // Get filtered and paginated data
    let filteredApps = getFilteredApplications();
    const startIdx = (currentApplicationPage - 1) * APPS_PER_PAGE;
    const endIdx = startIdx + APPS_PER_PAGE;
    const paginatedApps = filteredApps.slice(startIdx, endIdx);
    
    paginatedApps.forEach(app => {
        const row = document.createElement('tr');
        const statusClass = app.status === 'approved' ? 'approved' : app.status === 'rejected' ? 'rejected' : 'pending';
        
        row.innerHTML = `
            <td>${app.id}</td>
            <td>${app.fullName}</td>
            <td>${app.email}</td>
            <td>${app.phone}</td>
            <td>${app.nid}</td>
            <td>৳${Number(app.shareAmount || 0).toLocaleString()}</td>
            <td>${app.appliedDate}</td>
            <td><span class="status-badge ${statusClass}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td>
            <td>
                <button class="action-btn view" title="View Details" onclick="viewApplicationDetails('${app.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                ${app.status === 'pending' ? `
                    <button class="action-btn delete" title="Delete Application" onclick="deleteApplication('${app.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update pagination
    updateApplicationsPagination(filteredApps.length);
}

function getFilteredApplications() {
    const searchTerm = document.getElementById('appSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    return applicationsDatabase.filter(app => {
        const matchesSearch = !searchTerm || 
                            app.fullName.toLowerCase().includes(searchTerm) ||
                            app.email.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
}

function updateApplicationsPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / APPS_PER_PAGE);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentApplicationPage} of ${totalPages || 1}`;
    }
}

function filterApplications() {
    currentApplicationPage = 1;
    displayApplicationsTable();
}

function nextPage() {
    const filteredApps = getFilteredApplications();
    const totalPages = Math.ceil(filteredApps.length / APPS_PER_PAGE);
    if (currentApplicationPage < totalPages) {
        currentApplicationPage++;
        displayApplicationsTable();
    }
}

function previousPage() {
    if (currentApplicationPage > 1) {
        currentApplicationPage--;
        displayApplicationsTable();
    }
}

function viewApplicationDetails(appId) {
    const app = applicationsDatabase.find(a => a.id === appId);
    if (!app) {
        alert('Application not found');
        return;
    }
    
    currentViewingApp = app;
    const detailsContent = document.getElementById('appDetailsContent');
    
    const imagePreview = app.nidImage ? `<img src="${app.nidImage}" style="max-width: 300px; border-radius: 8px; margin: 1rem 0;">` : '';
    
    detailsContent.innerHTML = `
        <div style="display: grid; gap: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong>Full Name:</strong>
                    <p style="margin: 0.5rem 0;">${app.fullName}</p>
                </div>
                <div>
                    <strong>Email:</strong>
                    <p style="margin: 0.5rem 0;">${app.email}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong>Phone:</strong>
                    <p style="margin: 0.5rem 0;">${app.phone}</p>
                </div>
                <div>
                    <strong>NID Number:</strong>
                    <p style="margin: 0.5rem 0;">${app.nid}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong>Share Amount:</strong>
                    <p style="margin: 0.5rem 0;">৳${Number(app.shareAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                    <strong>Applied Date:</strong>
                    <p style="margin: 0.5rem 0;">${app.appliedDate}</p>
                </div>
            </div>
            
            <div>
                <strong>Address:</strong>
                <p style="margin: 0.5rem 0;">${app.address}</p>
            </div>
            
            <div>
                <strong>NID Card Image:</strong>
                ${imagePreview}
            </div>
            
            ${app.status === 'approved' ? `
                <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #0284c7;">
                    <strong>Approval Information:</strong>
                    <p style="margin: 0.5rem 0;"><strong>Approved By:</strong> ${app.approvedBy || 'Admin'}</p>
                    <p style="margin: 0.5rem 0;"><strong>Approved Date:</strong> ${app.approvedDate || 'N/A'}</p>
                    <p style="margin: 0.5rem 0;"><strong>Initial Password:</strong> ••••••••</p>
                </div>
            ` : ''}
            
            ${app.status === 'approved' && app.modifiedInfo ? `
                <div style="background: #f9fce7; padding: 1rem; border-radius: 8px; border-left: 4px solid #84cc16;">
                    <strong>Modified Information:</strong>
                    <p style="margin: 0.5rem 0; white-space: pre-wrap;">${JSON.stringify(app.modifiedInfo, null, 2)}</p>
                </div>
            ` : ''}
            
            ${app.status === 'pending' ? `
                <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <strong style="color: #dc2626;">Admin Actions Required</strong>
                    <p style="margin: 0.5rem 0;">Set initial password to approve this application:</p>
                    
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem;"><strong>Initial Password:</strong></label>
                        <input type="password" id="initialPassword" placeholder="Enter password" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem;"><strong>Confirm Password:</strong></label>
                        <input type="password" id="confirmInitialPassword" placeholder="Confirm password" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('appDetailsModal').style.display = 'block';
}

function approveApplication() {
    if (!currentViewingApp) return;
    
    if (currentViewingApp.status !== 'pending') {
        alert('This application has already been processed');
        return;
    }
    
    const password = document.getElementById('initialPassword')?.value;
    const confirmPassword = document.getElementById('confirmInitialPassword')?.value;
    
    if (!password || !confirmPassword) {
        alert('Please enter and confirm the password');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Update application
    const appIndex = applicationsDatabase.findIndex(a => a.id === currentViewingApp.id);
    if (appIndex !== -1) {
        applicationsDatabase[appIndex].status = 'approved';
        applicationsDatabase[appIndex].initialPassword = password;
        applicationsDatabase[appIndex].confirmPassword = confirmPassword;
        applicationsDatabase[appIndex].approvedDate = new Date().toLocaleString();
        applicationsDatabase[appIndex].approvedBy = 'Admin'; // Get from logged in user
        
        localStorage.setItem('applicationsDatabase', JSON.stringify(applicationsDatabase));
        
        alert('Application approved successfully!');
        closeAppModal();
        loadApplicationsList();
    }
}

function rejectApplication() {
    if (!currentViewingApp) return;
    
    if (currentViewingApp.status !== 'pending') {
        alert('This application has already been processed');
        return;
    }
    
    if (confirm('Are you sure you want to reject this application?')) {
        const appIndex = applicationsDatabase.findIndex(a => a.id === currentViewingApp.id);
        if (appIndex !== -1) {
            applicationsDatabase[appIndex].status = 'rejected';
            localStorage.setItem('applicationsDatabase', JSON.stringify(applicationsDatabase));
            
            alert('Application rejected');
            closeAppModal();
            loadApplicationsList();
        }
    }
}

function deleteApplication(appId) {
    if (confirm('Are you sure you want to delete this application?')) {
        applicationsDatabase = applicationsDatabase.filter(a => a.id !== appId);
        localStorage.setItem('applicationsDatabase', JSON.stringify(applicationsDatabase));
        loadApplicationsList();
    }
}

function closeAppModal() {
    document.getElementById('appDetailsModal').style.display = 'none';
    currentViewingApp = null;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('appDetailsModal');
    if (event.target === modal) {
        closeAppModal();
    }
});
// Re-initialize charts on window resize for responsiveness
window.addEventListener('resize', function() {
    if (transactionChart || investmentChart) {
        setTimeout(initializeCharts, 100);
    }
});
