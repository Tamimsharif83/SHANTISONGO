// Admin Dashboard JavaScript

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// ========================================
// PAISA CONVERSION UTILITIES
// ========================================
// Rule: 1 Taka = 100 Paisa
// Storage & Calculation: Always in PAISA (integer)
// Display: Convert to Taka (paisa / 100) with max 2 decimals

/**
 * Convert Taka (from user input) to Paisa for backend
 * @param {number} taka - Amount in taka (can be decimal)
 * @returns {number} Amount in paisa (integer)
 */
function takaToPaysa(taka) {
    return Math.round(parseFloat(taka) * 100);
}

/**
 * Convert Paisa (from backend) to Taka for display
 * @param {number} paisa - Amount in paisa (integer)
 * @returns {number} Amount in taka (with decimals)
 */
function paysaToTaka(paisa) {
    return paisa / 100;
}

/**
 * Format paisa as taka string with ৳ symbol
 * @param {number} paisa - Amount in paisa (integer)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted string like "৳1,234.56"
 */
function formatPaysaAsTaka(paisa, decimals = 2) {
    const taka = paysaToTaka(paisa);
    return `৳${taka.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}

// ========================================

// Global variables for application management
let applicationsDatabase = [];
let currentApplicationPage = 1;
const APPS_PER_PAGE = 10;
let currentViewingApp = null;

class AdminDashboard {
    constructor() {
        // Check if user is logged in and not on first login
        const userId = sessionStorage.getItem('userId');
        const firstLogin = sessionStorage.getItem('firstLogin');
        const userRole = sessionStorage.getItem('userRole');
        
        if (!userId) {
            window.location.href = '/frontend/html/login.html';
            return;
        }
        
        if (firstLogin === 'true') {
            window.location.href = '/frontend/html/change-password.html';
            return;
        }
        
        if (userRole !== 'admin') {
            alert('Unauthorized access!');
            window.location.href = '/frontend/html/login.html';
            return;
        }
        
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
        
        // Load investment requests when investment-monitoring section is shown
        if (sectionId === 'investment-monitoring') {
            loadInvestmentRequests();
        }
        
        // Load investment report when investment-report section is shown
        if (sectionId === 'investment-report') {
            loadInvestmentReport();
        }
        
        // Load investment accounts when investment-account section is shown
        if (sectionId === 'investment-account') {
            loadInvestmentAccounts();
        }
        
        // Load recent recoveries and pending accounts when investment-recovery-entry section is shown
        if (sectionId === 'investment-recovery-entry') {
            loadPendingRecoveryAccounts();
            loadRecentRecoveries();
        }
        
        // Load pending entries when authorize-delete-data section is shown
        if (sectionId === 'authorize-delete-data') {
            loadPendingRecoveryEntries();
            loadPendingMonthlyShareEntries();
            loadPendingExpenditureEntries();
            loadPendingIncomeEntries();
        }

        // Load interest rates when interest-rate-management section is shown
        if (sectionId === 'interest-rate-management') {
            loadInterestRates();
        }

        // Load expenditure data when expenditure-entry section is shown
        if (sectionId === 'expenditure-entry') {
            initExpenditureSection();
        }

        // Load income data when income-entry section is shown
        if (sectionId === 'income-entry') {
            initIncomeSection();
        }
        
        // Clear navbar badge for this section when it's opened
        clearNavBadge(sectionId);

        // Close mobile menu on section change
        if (window.innerWidth <= 1024) {
            this.toggleMobileMenu();
        }
    }

    toggleSubmenu(element) {
        const submenu = element.nextElementSibling;
        const isActive = submenu.classList.contains('active');
        const parentSubmenu = element.closest('.submenu');

        // If this is a top-level menu item (not inside another submenu)
        if (!parentSubmenu) {
            // Close all other top-level submenus
            document.querySelectorAll('.sidebar-menu > .submenu').forEach(sub => {
                if (sub !== submenu) sub.classList.remove('active');
            });
            document.querySelectorAll('.sidebar-menu > .menu-item.has-submenu').forEach(item => {
                if (item !== element) item.classList.remove('open');
            });
        } else {
             // If nested, close siblings only (optional, but good for accordion feel)
             // For now, let's just toggle independent state to allow multiple nested menus to be open if needed
             // or strictly close siblings.
             const siblingSubmenus = parentSubmenu.querySelectorAll('.submenu');
             siblingSubmenus.forEach(sub => {
                 if (sub !== submenu) sub.classList.remove('active');
             });
        }

        // Toggle clicked submenu
        if (!isActive) {
            submenu.classList.add('active');
            element.classList.add('open');
        } else {
            submenu.classList.remove('active');
            element.classList.remove('open');
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

async function loadApplicationsList() {
    try {
        const response = await fetch(`${API_BASE_URL}/applications/all`);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Failed to load applications:', data.msg);
            applicationsDatabase = [];
        } else {
            applicationsDatabase = data;
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        applicationsDatabase = [];
    }
    
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
        const appId = app._id;
        const appliedDate = new Date(app.appliedDate).toLocaleString();
        
        row.innerHTML = `
            <td>${appId.slice(-8).toUpperCase()}</td>
            <td>${app.fullName}</td>
            <td>${app.email}</td>
            <td>${app.phone}</td>
            <td>${app.nid}</td>
            <td>${formatPaysaAsTaka(Number(app.shareAmount || 0))}</td>
            <td>${appliedDate}</td>
            <td><span class="status-badge ${statusClass}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td>
            <td>
                <button class="action-btn view" title="View Details" onclick="viewApplicationDetails('${appId}')">
                    👁️
                </button>
                ${app.status === 'pending' ? `
                    <button class="action-btn delete" title="Delete Application" onclick="deleteApplication('${appId}')">
                        🗑️
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
    const app = applicationsDatabase.find(a => a._id === appId);
    if (!app) {
        alert('Application not found');
        return;
    }
    
    currentViewingApp = app;
    const detailsContent = document.getElementById('appDetailsContent');
    const appliedDate = new Date(app.appliedDate).toLocaleString();
    const approvedDate = app.approvedDate ? new Date(app.approvedDate).toLocaleString() : 'N/A';
    
    const nidImagePreview = app.nidImage ? `<img src="${app.nidImage}" style="max-width: 300px; border-radius: 8px; margin: 1rem 0;">` : '';
    const profilePicturePreview = app.profilePicture ? `<img src="${app.profilePicture}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-green); box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 1rem 0;">` : '';
    
    detailsContent.innerHTML = `
        <div style="display: grid; gap: 1rem;">
            ${profilePicturePreview ? `
            <div style="text-align: center; margin-bottom: 1rem;">
                <strong style="display: block; margin-bottom: 0.5rem;">Profile Picture:</strong>
                ${profilePicturePreview}
            </div>
            ` : ''}
            
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
                    <p style="margin: 0.5rem 0;">${formatPaysaAsTaka(Number(app.shareAmount || 0))}</p>
                </div>
                <div>
                    <strong>Applied Date:</strong>
                    <p style="margin: 0.5rem 0;">${appliedDate}</p>
                </div>
            </div>
            
            <div>
                <strong>Address:</strong>
                <p style="margin: 0.5rem 0;">${app.address}</p>
            </div>
            
            <div>
                <strong>NID Card Image:</strong>
                ${nidImagePreview}
            </div>
            
            ${app.status === 'approved' ? `
                <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #0284c7;">
                    <strong>Approval Information:</strong>
                    <p style="margin: 0.5rem 0;"><strong>Approved By:</strong> ${app.approvedBy || 'Admin'}</p>
                    <p style="margin: 0.5rem 0;"><strong>Approved Date:</strong> ${approvedDate}</p>
                </div>
            ` : ''}
            
            ${app.status === 'approved' && app.modifiedInfo ? `
                <div style="background: #f9fce7; padding: 1rem; border-radius: 8px; border-left: 4px solid #84cc16;">
                    <strong>Modified Information:</strong>
                    <p style="margin: 0.5rem 0; white-space: pre-wrap;">${JSON.stringify(app.modifiedInfo, null, 2)}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('appDetailsModal').style.display = 'block';
}

async function approveApplication() {
    if (!currentViewingApp) return;
    
    if (currentViewingApp.status !== 'pending') {
        alert('This application has already been processed');
        return;
    }
    
    // Show credentials modal
    document.getElementById('setCredentialsModal').style.display = 'flex';
    document.getElementById('memberIdInput').focus();
    
    // Reset form
    document.getElementById('credentialsForm').reset();
    document.getElementById('passwordMatchHint').textContent = '';
    document.getElementById('passwordMatchHint').className = 'form-hint password-match-hint';
}

function closeCredentialsModal() {
    document.getElementById('setCredentialsModal').style.display = 'none';
    document.getElementById('credentialsForm').reset();
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentElement.querySelector('.toggle-password-btn');
    const svg = button.querySelector('svg');
    
    if (field.type === 'password') {
        field.type = 'text';
        svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
        field.type = 'password';
        svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
}

// Real-time password match validation
document.addEventListener('DOMContentLoaded', function() {
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const initialPasswordInput = document.getElementById('initialPasswordInput');
    const passwordMatchHint = document.getElementById('passwordMatchHint');
    
    if (confirmPasswordInput && initialPasswordInput && passwordMatchHint) {
        const checkPasswordMatch = () => {
            const password = initialPasswordInput.value;
            const confirm = confirmPasswordInput.value;
            
            if (confirm.length === 0) {
                passwordMatchHint.textContent = '';
                passwordMatchHint.className = 'form-hint password-match-hint';
            } else if (password === confirm) {
                passwordMatchHint.textContent = '✓ Passwords match';
                passwordMatchHint.className = 'form-hint password-match-hint match';
            } else {
                passwordMatchHint.textContent = '✗ Passwords do not match';
                passwordMatchHint.className = 'form-hint password-match-hint no-match';
            }
        };
        
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        initialPasswordInput.addEventListener('input', checkPasswordMatch);
    }
});

async function submitApprovalWithCredentials(event) {
    event.preventDefault();
    
    const memberID = document.getElementById('memberIdInput').value.trim();
    const initialPassword = document.getElementById('initialPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    const submitBtn = document.getElementById('submitCredentialsBtn');
    
    // Validate passwords match
    if (initialPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Validate password length
    if (initialPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning"><circle cx="12" cy="12" r="10"/></svg>Processing...</span>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/applications/approve/${currentViewingApp._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                approvedBy: 'Admin',
                memberID: memberID,
                initialPassword: initialPassword
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.msg || 'Failed to approve application');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            return;
        }
        
        // Success
        closeCredentialsModal();
        closeAppModal();
        
        // Show success message with credentials
        alert(`✓ Application Approved Successfully!\n\n` +
              `Member ID: ${data.memberID}\n` +
              `Email: ${currentViewingApp.email}\n` +
              `Initial Password: ${initialPassword}\n\n` +
              `The member can now login with their email and this password.`);
        
        loadApplicationsList();
        
    } catch (error) {
        console.error('Error approving application:', error);
        alert('Failed to approve application. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
}

async function rejectApplication() {
    if (!currentViewingApp) return;
    
    if (currentViewingApp.status !== 'pending') {
        alert('This application has already been processed');
        return;
    }
    
    if (confirm('Are you sure you want to reject this application?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/applications/reject/${currentViewingApp._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rejectedBy: 'Admin' })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                alert(data.msg || 'Failed to reject application');
                return;
            }
            
            alert('Application rejected');
            closeAppModal();
            loadApplicationsList();
            
        } catch (error) {
            console.error('Error rejecting application:', error);
            alert('Failed to reject application. Please try again.');
        }
    }
}

async function deleteApplication(appId) {
    if (confirm('Are you sure you want to delete this application?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${appId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                alert(data.msg || 'Failed to delete application');
                return;
            }
            
            loadApplicationsList();
            
        } catch (error) {
            console.error('Error deleting application:', error);
            alert('Failed to delete application. Please try again.');
        }
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
    if (dashboard && dashboard.charts) {
        Object.values(dashboard.charts).forEach(chart => {
            if (chart && chart.resize) chart.resize();
        });
    }
});

// ============================================
// INVESTMENT MONITORING FUNCTIONS
// ============================================

let currentInvestmentFilter = 'all';
let allInvestmentRequests = [];
let investmentSearchTerm = '';
let investmentSearchType = '';

async function loadInvestmentRequests(filter = 'all') {
    currentInvestmentFilter = filter;
    
    try {
        const response = await fetch('http://localhost:5000/api/investment-requests/admin/all');
        const data = await response.json();
        
        if (response.ok) {
            allInvestmentRequests = data;
            displayInvestmentRequests(filter);
            await loadInvestmentStatistics();
        } else {
            showInvestmentError('Failed to load investment requests');
        }
    } catch (error) {
        console.error('Error loading investment requests:', error);
        showInvestmentError('Error loading investment requests');
    }
}

function displayInvestmentRequests(filter = 'all') {
    const tbody = document.getElementById('investmentRequestsTableBody');
    
    let filteredRequests = allInvestmentRequests;
    
    // Apply status filter
    if (filter !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === filter);
    }
    
    // Apply search filter
    if (investmentSearchTerm && investmentSearchType) {
        if (investmentSearchType === 'memberID') {
            filteredRequests = filteredRequests.filter(req => 
                req.memberID.toLowerCase().includes(investmentSearchTerm.toLowerCase())
            );
        } else if (investmentSearchType === 'requestID') {
            filteredRequests = filteredRequests.filter(req => 
                req.requestId.toLowerCase().includes(investmentSearchTerm.toLowerCase())
            );
        }
    }
    
    if (filteredRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No investment requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredRequests.map(request => {
        const appDate = new Date(request.applicationDate).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
        
        const statusClass = request.status === 'approved' ? 'status-approved' : 
                           request.status === 'rejected' ? 'status-rejected' : 'status-pending';
        
        const statusBadge = `<span class="${statusClass}" style="padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${request.status.toUpperCase()}</span>`;
        
        const actionButton = `
            <button class="btn btn-sm" onclick="viewInvestmentRequest('${request._id}')" style="padding: 6px 16px; background: var(--primary-blue); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Action
            </button>
        `;
        
        return `
            <tr>
                <td>${request.requestId}</td>
                <td>${request.memberName}</td>
                <td>${request.memberID}</td>
                <td>${formatPaysaAsTaka(request.amount)}</td>
                <td>${request.purpose}</td>
                <td>${request.duration} months</td>
                <td>${appDate}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    }).join('');
}

async function loadInvestmentStatistics() {
    try {
        const response = await fetch('http://localhost:5000/api/investment-requests/admin/statistics');
        const stats = await response.json();
        
        if (response.ok) {
            document.getElementById('pendingCount').textContent = stats.pendingCount;
            document.getElementById('approvedCount').textContent = stats.approvedCount;
            document.getElementById('rejectedCount').textContent = stats.rejectedCount;
            document.getElementById('approvedAmount').textContent = formatPaysaAsTaka(stats.approvedAmount);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function filterInvestmentRequests(filter) {
    // Update active button
    document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayInvestmentRequests(filter);
}

async function viewInvestmentRequest(requestId) {
    try {
        const response = await fetch(`http://localhost:5000/api/investment-requests/${requestId}`);
        const request = await response.json();
        
        if (response.ok) {
            showInvestmentDetailsModal(request);
        } else {
            alert('Failed to load investment request details');
        }
    } catch (error) {
        console.error('Error viewing investment request:', error);
        alert('Error loading investment request details');
    }
}

function showInvestmentDetailsModal(request) {
    const appDate = new Date(request.applicationDate).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
    const reviewDate = request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    }) : 'N/A';
    
    const statusColor = request.status === 'approved' ? 'var(--primary-green)' : 
                       request.status === 'rejected' ? 'var(--danger-red)' : 'var(--warning-orange)';
    
    // Member history section
    const memberHistory = request.memberHistory || {};
    const profileAndHistorySection = memberHistory.totalShareAmount !== undefined ? `
        <div style="margin-bottom: 1.5rem; display: grid; grid-template-columns: ${request.memberProfilePicture ? '1fr auto' : '1fr'}; gap: 1.5rem; align-items: stretch;">
            <div style="padding: 1rem; background: #f0f9ff; border: 2px solid var(--primary-green); border-radius: 8px; display: flex; flex-direction: column;">
                <h4 style="color: var(--primary-green); margin: 0 0 1rem 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📊</span>
                    <span>Member Financial History (Before Application)</span>
                </h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; flex: 1;">
                    <div style="background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #e0e0e0;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">Total Share Amount</div>
                        <div style="font-size: 1.15rem; color: var(--primary-green); font-weight: bold;">${formatPaysaAsTaka(memberHistory.totalShareAmount)}</div>
                    </div>
                    <div style="background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #e0e0e0;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">Total Savings Amount</div>
                        <div style="font-size: 1.15rem; color: var(--primary-green); font-weight: bold;">${formatPaysaAsTaka(memberHistory.totalSavingsAmount)}</div>
                    </div>
                    <div style="background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #e0e0e0;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">Previous Investments</div>
                        <div style="font-size: 1.15rem; color: var(--primary-blue); font-weight: bold;">${formatPaysaAsTaka(memberHistory.totalPreviousInvestment)}</div>
                    </div>
                    <div style="background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #e0e0e0;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">Investment Status</div>
                        <div style="font-size: 0.95rem; margin-top: 0.25rem;">
                            <span style="color: var(--primary-green); font-weight: bold;">${memberHistory.clearedInvestmentsCount} Cleared</span>
                            <span style="color: #999; margin: 0 0.25rem;">|</span>
                            <span style="color: var(--warning-orange); font-weight: bold;">${memberHistory.pendingInvestmentsCount} Pending</span>
                        </div>
                    </div>
                </div>
            </div>
            ${request.memberProfilePicture ? `
            <div style="display: flex; align-items: center; justify-content: center; padding: 1rem; background: white; border: 2px solid var(--primary-green); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100%;">
                <img src="${request.memberProfilePicture}" alt="Profile" style="width: 160px; height: 160px; border-radius: 8px; object-fit: cover; display: block;">
            </div>
            ` : ''}
        </div>
    ` : '';
    
    const modalHTML = `
        <div class="modal-overlay" id="investmentDetailsModal" onclick="closeInvestmentModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3); position: relative;">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-green); margin: 0;">Investment Request Details - ${request.requestId}</h3>
                    <button onclick="closeInvestmentModal()" class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; color: var(--text-gray);">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    ${profileAndHistorySection}
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div><strong>Member Name:</strong> ${request.memberName}</div>
                        <div><strong>Member ID:</strong> ${request.memberID}</div>
                        <div><strong>Amount:</strong> ${formatPaysaAsTaka(request.amount)}</div>
                        <div><strong>Purpose:</strong> ${request.purpose}</div>
                        <div><strong>Duration:</strong> ${request.duration} Months</div>
                        <div><strong>Application Date:</strong> ${appDate}</div>
                        <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${request.status.toUpperCase()}</span></div>
                        ${request.reviewedAt ? `<div><strong>Review Date:</strong> ${reviewDate}</div>` : ''}
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Bank Details:</strong>
                        <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                            <p><strong>Bank Name:</strong> ${request.bankName}</p>
                            <p><strong>Branch:</strong> ${request.bankBranch}</p>
                            <p><strong>Account No:</strong> ${request.bankAccountNo}</p>
                            <p><strong>Account Type:</strong> ${request.bankAccountType}</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Guarantor Information:</strong>
                        <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                            <p><strong>Name:</strong> ${request.guarantor.name}</p>
                            <p><strong>Phone:</strong> ${request.guarantor.phone}</p>
                            <p><strong>Relationship:</strong> ${request.guarantor.relationship}</p>
                        </div>
                    </div>
                    
                    ${request.adminNote ? `
                    <div>
                        <strong>Admin Note:</strong>
                        <p style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${request.adminNote}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer" style="padding: 1.5rem; border-top: 2px solid var(--border-gray); display: flex; gap: 0.75rem; justify-content: flex-end;">
                    ${request.status === 'pending' ? `
                        <button onclick="closeInvestmentModal(); showApproveRejectModal('${request._id}', 'approve')" class="btn" style="background: #28a745; color: white; padding: 0.6rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Approve</button>
                        <button onclick="closeInvestmentModal(); showApproveRejectModal('${request._id}', 'reject')" class="btn" style="background: #dc3545; color: white; padding: 0.6rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Reject</button>
                    ` : ''}
                    <button onclick="closeInvestmentModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

function showApproveRejectModal(requestId, action) {
    const actionText = action === 'approve' ? 'Approve' : 'Reject';
    const actionColor = action === 'approve' ? '#28a745' : '#dc3545';
    
    const modalHTML = `
        <div class="modal-overlay" id="approveRejectModal" onclick="closeApproveRejectModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 550px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3); position: relative;">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-green); margin: 0;">${actionText} Investment Request</h3>
                    <button onclick="closeApproveRejectModal()" class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; color: var(--text-gray);">&times;</button>
                </div>
                <div class="modal-body" style="padding: 2rem;">
                    <p style="margin-bottom: 1.5rem; font-size: 1rem; color: var(--text-dark);">
                        Are you sure you want to <strong style="color: ${actionColor};">${action}</strong> this investment request?
                    </p>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-dark);">
                            Note/Comment: <span style="color: var(--text-gray); font-weight: 400; font-size: 0.9rem;">(Optional)</span>
                        </label>
                        <textarea 
                            id="adminNoteInput" 
                            rows="5" 
                            placeholder="Enter your note or reason here..." 
                            style="width: 100%; 
                                   padding: 0.75rem; 
                                   border: 2px solid var(--border-gray); 
                                   border-radius: 8px; 
                                   font-family: inherit; 
                                   font-size: 0.95rem; 
                                   resize: vertical;
                                   min-height: 120px;
                                   transition: border-color 0.2s;"
                            onfocus="this.style.borderColor='var(--primary-green)'"
                            onblur="this.style.borderColor='var(--border-gray)'"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 1.5rem 2rem; border-top: 2px solid var(--border-gray); display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button onclick="closeApproveRejectModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Cancel</button>
                    <button onclick="processInvestmentRequest('${requestId}', '${action}')" class="btn" style="background: ${actionColor}; color: white; padding: 0.6rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Confirm ${actionText}</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

async function processInvestmentRequest(requestId, action) {
    const adminNote = document.getElementById('adminNoteInput').value;
    const userId = sessionStorage.getItem('userId');
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    try {
        const response = await fetch(`http://localhost:5000/api/investment-requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                adminNote: adminNote,
                reviewerId: userId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeApproveRejectModal();
            dashboard.showNotification(data.message, 'success');
            loadInvestmentRequests(currentInvestmentFilter);
            updateNavBadges();
        } else {
            alert(data.message || 'Failed to process request');
        }
    } catch (error) {
        console.error('Error processing investment request:', error);
        alert('Error processing investment request');
    }
}

function closeInvestmentModal() {
    const modal = document.getElementById('investmentDetailsModal');
    if (modal) {
        modal.parentElement.remove();
    }
}

function closeApproveRejectModal() {
    const modal = document.getElementById('approveRejectModal');
    if (modal) {
        modal.parentElement.remove();
    }
}

function showInvestmentError(message) {
    const tbody = document.getElementById('investmentRequestsTableBody');
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger-red);">${message}</td></tr>`;
}

function searchInvestmentRequests() {
    const searchInput = document.getElementById('investmentSearchInput');
    const searchTypeSelect = document.getElementById('investmentSearchType');
    
    investmentSearchTerm = searchInput.value.trim();
    investmentSearchType = searchTypeSelect.value;
    
    if (!investmentSearchTerm) {
        dashboard.showNotification('Please enter a search value', 'error');
        return;
    }
    
    displayInvestmentRequests(currentInvestmentFilter);
}

function clearInvestmentSearch() {
    investmentSearchTerm = '';
    investmentSearchType = '';
    
    const searchInput = document.getElementById('investmentSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    displayInvestmentRequests(currentInvestmentFilter);
}


// Create Member Form Handler
document.addEventListener("DOMContentLoaded", function() {
    const createMemberForm = document.getElementById("createMemberForm");
    if (createMemberForm) {
        createMemberForm.addEventListener("submit", handleCreateMember);
    }
});

async function handleCreateMember(e) {
    e.preventDefault();
    
    const fullName = document.getElementById("createMemberFullName").value.trim();
    const memberID = document.getElementById("createMemberID").value.trim();
    const email = document.getElementById("createMemberEmail").value.trim();
    const password = document.getElementById("createMemberPassword").value;
    const confirmPassword = document.getElementById("createMemberConfirmPassword").value;
    const numberOfShares = parseInt(document.getElementById("createMemberShares").value) || 0;
    const phone = document.getElementById("createMemberPhone").value.trim();
    const nid = document.getElementById("createMemberNID").value.trim();
    const address = document.getElementById("createMemberAddress").value.trim();
    const profilePictureFile = document.getElementById("createMemberProfilePicture").files[0];
    
    // Validate passwords match
    if (password !== confirmPassword) {
        if (typeof dashboard !== "undefined") {
            dashboard.showNotification("Passwords do not match", "error");
        } else {
            alert("Passwords do not match");
        }
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        if (typeof dashboard !== "undefined") {
            dashboard.showNotification("Password must be at least 6 characters", "error");
        } else {
            alert("Password must be at least 6 characters");
        }
        return;
    }
    
    // Show loading
    if (typeof dashboard !== "undefined") {
        dashboard.showLoading("Creating member...");
    }
    
    try {
        // Convert profile picture to base64 if uploaded
        let profilePictureBase64 = null;
        if (profilePictureFile) {
            profilePictureBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(profilePictureFile);
            });
        }
        
        const response = await fetch("http://localhost:5000/auth/create-member", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                memberID,
                email,
                password,
                numberOfShares,
                phone,
                nid,
                address,
                profilePicture: profilePictureBase64
            })
        });
        
        const data = await response.json();
        
        if (typeof dashboard !== "undefined") {
            dashboard.hideLoading();
        }
        
        if (response.ok) {
            if (typeof dashboard !== "undefined") {
                dashboard.showNotification(data.msg || "Member created successfully", "success");
            } else {
                alert(data.msg || "Member created successfully");
            }
            
            // Reset form
            document.getElementById("createMemberForm").reset();
            
            // Show member credentials
            alert(`Member Created Successfully!

Member ID: ${data.memberID}
Email: ${data.email}
Password: (as set)

Please provide these credentials to the member.`);
        } else {
            if (typeof dashboard !== "undefined") {
                dashboard.showNotification(data.msg || "Failed to create member", "error");
            } else {
                alert(data.msg || "Failed to create member");
            }
        }
    } catch (error) {
        if (typeof dashboard !== "undefined") {
            dashboard.hideLoading();
        }
        console.error("Error creating member:", error);
        if (typeof dashboard !== "undefined") {
            dashboard.showNotification("Error creating member", "error");
        } else {
            alert("Error creating member");
        }
    }
}

function resetCreateMemberForm() {
    document.getElementById("createMemberForm").reset();
}

// ============================================
// INVESTMENT REPORT FUNCTIONS
// ============================================

let allInvestmentReportRequests = [];
let investmentReportSearchTerm = '';
let investmentReportSearchType = '';

async function loadInvestmentReport() {
    try {
        const response = await fetch('http://localhost:5000/api/investment-accounts/approved-requests');
        const data = await response.json();
        
        if (response.ok) {
            allInvestmentReportRequests = data;
            investmentReportSearchTerm = '';
            investmentReportSearchType = '';
            document.getElementById('investmentReportSearchInput').value = '';
            displayInvestmentReport(data);
        } else {
            showInvestmentReportError('Failed to load approved requests');
        }
    } catch (error) {
        console.error('Error loading investment report:', error);
        showInvestmentReportError('Error loading investment report');
    }
}

function displayInvestmentReport(requests) {
    const tbody = document.getElementById('investmentReportTableBody');
    
    // Filter only requests that don't have investment accounts yet
    const pendingRequests = requests.filter(req => !req.hasInvestmentAccount);
    
    if (pendingRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #666;">No pending approved requests</td></tr>';
        return;
    }
    
    tbody.innerHTML = pendingRequests.map(request => {
        const approvedDate = new Date(request.reviewedAt).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
        
        return `
            <tr>
                <td>${request.requestId}</td>
                <td>${request.memberID}</td>
                <td>${request.memberName}</td>
                <td>${formatPaysaAsTaka(request.amount)}</td>
                <td>${request.duration} months</td>
                <td>${request.purpose}</td>
                <td>${approvedDate}</td>
                <td><span style="color: var(--primary-green); font-weight: bold;">APPROVED</span></td>
                <td>
                    <button 
                        onclick="openCreateInvestmentAccountModal('${request._id}')" 
                        class="btn btn-primary"
                        style="padding: 0.5rem 1rem; font-size: 0.9rem;"
                    >
                        Create Account
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchInvestmentReport() {
    const searchInput = document.getElementById('investmentReportSearchInput');
    const searchTypeSelect = document.getElementById('investmentReportSearchType');
    
    investmentReportSearchTerm = searchInput.value.trim();
    investmentReportSearchType = searchTypeSelect.value;
    
    if (!investmentReportSearchTerm) {
        dashboard.showNotification('Please enter a search value', 'error');
        return;
    }
    
    let filteredRequests = allInvestmentReportRequests;
    
    if (investmentReportSearchType === 'memberID') {
        filteredRequests = filteredRequests.filter(req => 
            req.memberID.toLowerCase().includes(investmentReportSearchTerm.toLowerCase())
        );
    } else if (investmentReportSearchType === 'requestID') {
        filteredRequests = filteredRequests.filter(req => 
            req.requestId.toLowerCase().includes(investmentReportSearchTerm.toLowerCase())
        );
    }
    
    displayInvestmentReport(filteredRequests);
}

async function openCreateInvestmentAccountModal(requestId) {
    try {
        const response = await fetch(`http://localhost:5000/api/investment-requests/${requestId}`);
        const request = await response.json();
        
        if (response.ok) {
            showCreateInvestmentAccountModal(request);
        } else {
            alert('Failed to load request details');
        }
    } catch (error) {
        console.error('Error loading request details:', error);
        alert('Error loading request details');
    }
}

function showCreateInvestmentAccountModal(request) {
    const today = new Date().toISOString().split('T')[0];
    
    const modalHTML = `
        <div class="modal-overlay" id="createInvestmentAccountModal" onclick="closeCreateInvestmentAccountModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-green); margin: 0;">Create Investment Account</h3>
                    <button onclick="closeCreateInvestmentAccountModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-gray);">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <!-- Request Details with Member Picture -->
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; background: #f0f9ff; padding: 1rem; border-radius: 8px; border: 2px solid var(--primary-green); margin-bottom: 1.5rem;">
                        <div>
                            <h4 style="color: var(--primary-green); margin: 0 0 0.75rem 0;">Request Details</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.95rem;">
                                <div><strong>Request ID:</strong> ${request.requestId}</div>
                                <div><strong>Member ID:</strong> ${request.memberID}</div>
                                <div><strong>Member Name:</strong> ${request.memberName}</div>
                                <div><strong>Amount:</strong> ${formatPaysaAsTaka(request.amount)}</div>
                                <div><strong>Duration:</strong> ${request.duration} Months</div>
                                <div><strong>Purpose:</strong> ${request.purpose}</div>
                            </div>
                        </div>
                        ${request.memberProfilePicture ? `
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <img src="${request.memberProfilePicture}" alt="Member Photo" style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 2px solid var(--primary-green); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        </div>
                        ` : ''}
                    </div>

                    <!-- Profit Calculation Form -->
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: var(--primary-green); margin: 0 0 1rem 0;">Investment Details</h4>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Profit Percentage (%) *</label>
                            <input 
                                type="number" 
                                id="profitPercentageInput" 
                                placeholder="Enter annual profit percentage (e.g., 10 for 10%)"
                                step="0.01"
                                min="0"
                                max="100"
                                oninput="calculateProfit('${request._id}')"
                                style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                            />
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Start Date *</label>
                            <input 
                                type="date" 
                                id="startDateInput" 
                                value="${today}"
                                max="${today}"
                                oninput="calculateEndDate('${request.duration}')"
                                style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                            />
                            <small style="color: var(--text-gray);">You can select past dates but not future dates</small>
                        </div>

                        <!-- Calculation Results -->
                        <div id="profitCalculationResults" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #e0e0e0; display: none;">
                            <h5 style="margin: 0 0 0.75rem 0; color: var(--primary-green);">Calculation Summary</h5>
                            <div style="display: grid; gap: 0.5rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Principal Amount:</span>
                                    <strong>${formatPaysaAsTaka(request.amount)}</strong>
                                </div>
                                
                                <!-- Monthly Profit Section with Calculated, Rounded, and Editable values -->
                                <div style="background: #fff3cd; padding: 0.75rem; border-radius: 6px; border: 1px solid #ffc107; margin: 0.5rem 0;">
                                    <div style="margin-bottom: 0.5rem;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                            <span style="font-size: 0.9rem; color: #856404;">Calculated Monthly Profit:</span>
                                            <strong id="monthlyProfitRaw" style="color: #856404;">৳0.00</strong>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="font-size: 0.9rem; color: #856404;">Rounded Suggestion:</span>
                                            <strong id="monthlyProfitRounded" style="color: #856404;">৳0</strong>
                                        </div>
                                    </div>
                                    <div style="border-top: 1px solid #ffc107; padding-top: 0.5rem;">
                                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; color: #856404;">Final Monthly Profit (Editable):</label>
                                        <input 
                                            type="number" 
                                            id="monthlyProfitInput" 
                                            step="0.01"
                                            min="0"
                                            oninput="recalculateFromMonthlyProfit('${request.duration}')"
                                            style="width: 100%; padding: 0.5rem; border: 2px solid #ffc107; border-radius: 4px; font-weight: bold; font-size: 1rem;"
                                            placeholder="Enter final monthly profit"
                                        />
                                        <small style="color: #856404; display: block; margin-top: 0.25rem;">Admin can modify this value. This will be used for calculations.</small>
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Total Profit (${request.duration} months):</span>
                                    <strong id="totalProfitDisplay">৳0</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 2px solid var(--primary-green);">
                                    <span style="font-weight: bold;">Total Amount:</span>
                                    <strong style="color: var(--primary-green); font-size: 1.1rem;" id="totalAmountDisplay">৳0</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; background: #fff3cd; padding: 0.5rem; border-radius: 6px;">
                                    <span style="font-weight: 600; color: #856404;">Per Month Payment:</span>
                                    <strong style="color: #856404; font-size: 1.05rem;" id="perMonthPaymentDisplay">৳0</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                                    <span>End Date:</span>
                                    <strong id="endDateDisplay">-</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Admin Note/Comment -->
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                                Admin Note/Comment <span style="color: var(--text-gray); font-weight: 400; font-size: 0.9rem;">(Optional)</span>
                            </label>
                            <textarea 
                                id="investmentAccountNoteInput" 
                                rows="4" 
                                placeholder="Enter any additional notes or comments about this investment account..."
                                style="width: 100%; 
                                       padding: 0.75rem; 
                                       border: 2px solid var(--border-gray); 
                                       border-radius: 8px; 
                                       font-family: inherit; 
                                       font-size: 0.95rem; 
                                       resize: vertical;
                                       min-height: 100px;
                                       transition: border-color 0.2s;"
                                onfocus="this.style.borderColor='var(--primary-green)'"
                                onblur="this.style.borderColor='var(--border-gray)'"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 1.5rem; border-top: 2px solid var(--border-gray); display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button onclick="closeCreateInvestmentAccountModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Cancel</button>
                    <button onclick="createInvestmentAccount('${request._id}')" class="btn btn-primary" id="createAccountBtn" style="padding: 0.6rem 1.5rem;">Create Investment Account</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

let calculatedProfitData = null;
let previewPrincipalPaisa = 0;

async function calculateProfit(requestId) {
    const profitPercentage = parseFloat(document.getElementById('profitPercentageInput').value);
    
    if (!profitPercentage || profitPercentage <= 0) {
        document.getElementById('profitCalculationResults').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/investment-requests/${requestId}`);
        const request = await response.json();
        
        if (response.ok) {
            const calcResponse = await fetch('http://localhost:5000/api/investment-accounts/calculate-profit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: request.amount,  // Already in paisa from backend
                    profitPercentage: profitPercentage,
                    duration: request.duration
                })
            });
            
            const calcData = await calcResponse.json();
            
            if (calcResponse.ok) {
                calculatedProfitData = calcData;
                
                // Calculate raw monthly profit in taka (with decimals)
                const monthlyProfitTaka = paysaToTaka(calcData.monthlyProfit);
                const roundedMonthlyProfitTaka = Math.round(monthlyProfitTaka);
                
                // Display calculated value (with decimals)
                document.getElementById('monthlyProfitRaw').textContent = `৳${monthlyProfitTaka.toFixed(2)}`;
                
                // Display rounded suggestion (integer)
                document.getElementById('monthlyProfitRounded').textContent = `৳${roundedMonthlyProfitTaka}`;
                
                // Set editable input to rounded value (admin can modify)
                document.getElementById('monthlyProfitInput').value = roundedMonthlyProfitTaka.toFixed(2);
                
                // Initial calculation with rounded value
                recalculateFromMonthlyProfit(request.duration);
                
                document.getElementById('profitCalculationResults').style.display = 'block';
                calculateEndDate(request.duration);
            }
        }
    } catch (error) {
        console.error('Error calculating profit:', error);
    }
}

// Recalculate total profit and total amount based on admin's monthly profit input
function recalculateFromMonthlyProfit(duration) {
    const monthlyProfitTaka = parseFloat(document.getElementById('monthlyProfitInput').value) || 0;
    
    if (!calculatedProfitData) return;
    
    // Convert to paisa
    const monthlyProfitPaisa = takaToPaysa(monthlyProfitTaka);
    
    // Calculate total profit
    const totalProfitPaisa = monthlyProfitPaisa * duration;
    
    // Calculate total amount (principal + total profit)
    const totalAmountPaisa = calculatedProfitData.amount + totalProfitPaisa;
    
    // Calculate per month payment (base installment, remainder goes to last month)
    const baseInstallmentPaisa = Math.floor(totalAmountPaisa / duration);
    
    // Update displays
    document.getElementById('totalProfitDisplay').textContent = formatPaysaAsTaka(totalProfitPaisa, 0);
    document.getElementById('totalAmountDisplay').textContent = formatPaysaAsTaka(totalAmountPaisa);
    document.getElementById('perMonthPaymentDisplay').textContent = formatPaysaAsTaka(baseInstallmentPaisa, 0);
    
    // Update calculatedProfitData for use in account creation
    calculatedProfitData.monthlyProfit = monthlyProfitPaisa;
    calculatedProfitData.totalProfit = totalProfitPaisa;
    calculatedProfitData.totalAmount = totalAmountPaisa;
}

function calculateEndDate(duration) {
    const startDate = document.getElementById('startDateInput').value;
    
    if (!startDate) {
        document.getElementById('endDateDisplay').textContent = '-';
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(duration));
    
    const endDateStr = end.toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
    
    document.getElementById('endDateDisplay').textContent = endDateStr;
}

async function createInvestmentAccount(requestId) {
    const profitPercentage = parseFloat(document.getElementById('profitPercentageInput').value);
    const startDate = document.getElementById('startDateInput').value;
    const adminNote = document.getElementById('investmentAccountNoteInput').value.trim();
    const userId = sessionStorage.getItem('userId');
    
    if (!profitPercentage || profitPercentage <= 0) {
        alert('Please enter a valid profit percentage');
        return;
    }
    
    if (!startDate) {
        alert('Please select a start date');
        return;
    }
    
    if (!calculatedProfitData) {
        alert('Please calculate profit first by entering profit percentage');
        return;
    }
    
    const createBtn = document.getElementById('createAccountBtn');
    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';
    
    try {
        const response = await fetch('http://localhost:5000/api/investment-accounts/create-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                investmentRequestId: requestId,
                profitPercentage: profitPercentage,
                startDate: startDate,
                adminNote: adminNote,
                createdBy: userId,
                // Send admin's modified profit values (in paisa)
                customMonthlyProfit: calculatedProfitData.monthlyProfit,
                customTotalProfit: calculatedProfitData.totalProfit,
                customTotalAmount: calculatedProfitData.totalAmount
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeCreateInvestmentAccountModal();
            dashboard.showNotification(`Investment Account Created Successfully! Account No: ${data.account.investmentAccountNumber}`, 'success');
            loadInvestmentReport();
            updateNavBadges();
        } else {
            alert(data.message || 'Failed to create investment account');
            createBtn.disabled = false;
            createBtn.textContent = 'Create Investment Account';
        }
    } catch (error) {
        console.error('Error creating investment account:', error);
        alert('Error creating investment account');
        createBtn.disabled = false;
        createBtn.textContent = 'Create Investment Account';
    }
}

function closeCreateInvestmentAccountModal() {
    const modal = document.getElementById('createInvestmentAccountModal');
    if (modal) {
        modal.parentElement.remove();
    }
    calculatedProfitData = null;
}

function showInvestmentReportError(message) {
    const tbody = document.getElementById('investmentReportTableBody');
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger-red); padding: 2rem;">${message}</td></tr>`;
}

// ============================================
// INVESTMENT ACCOUNT FUNCTIONS
// ============================================

let allInvestmentAccounts = [];
let currentInvestmentAccountFilter = 'all';
let investmentAccountSearchTerm = '';
let investmentAccountSearchType = '';

async function loadInvestmentAccounts(filter = 'all') {
    currentInvestmentAccountFilter = filter;
    
    try {
        // Load approved requests
        const response = await fetch('http://localhost:5000/api/investment-accounts/approved-requests');
        const data = await response.json();
        
        if (response.ok) {
            allInvestmentAccounts = data;
            investmentAccountSearchTerm = '';
            investmentAccountSearchType = '';
            document.getElementById('investmentAccountSearchInput').value = '';
            displayInvestmentAccounts(filter);
        } else {
            showInvestmentAccountError('Failed to load investment accounts');
        }
    } catch (error) {
        console.error('Error loading investment accounts:', error);
        showInvestmentAccountError('Error loading investment accounts');
    }
}

function displayInvestmentAccounts(filter = 'all') {
    const tbody = document.getElementById('investmentAccountTableBody');
    
    let filteredAccounts = allInvestmentAccounts;
    
    // Apply search filter
    if (investmentAccountSearchTerm && investmentAccountSearchType) {
        if (investmentAccountSearchType === 'memberID') {
            filteredAccounts = filteredAccounts.filter(acc => 
                acc.memberID.toLowerCase().includes(investmentAccountSearchTerm.toLowerCase())
            );
        } else if (investmentAccountSearchType === 'accountNumber') {
            filteredAccounts = filteredAccounts.filter(acc => 
                (acc.investmentAccountNumber || acc.requestId || '').toLowerCase().includes(investmentAccountSearchTerm.toLowerCase())
            );
        }
    }
    
    if (filteredAccounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">No approved investment requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredAccounts.map(request => {
        const hasAccount = request.hasInvestmentAccount;
        const appDate = new Date(request.reviewedAt || request.applicationDate).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
        
        if (hasAccount) {
            // Show account details if account exists
            const requestIdStr = String(request._id || request.id || '');
            
            // Calculate paid and pending amounts from account data if available
            let paidAmount = 0;
            let pendingAmount = 0;
            
            if (request.accountData) {
                paidAmount = request.accountData.monthlyPayments?.reduce((sum, payment) => {
                    return sum + (payment.status === 'paid' ? payment.amountPaid : 0);
                }, 0) || 0;
                pendingAmount = (request.accountData.totalAmount || 0) - paidAmount;
            }
            
            const profitPercentage = request.accountData?.profitPercentage || '-';
            const totalProfit = request.accountData?.totalProfit ? formatPaysaAsTaka(request.accountData.totalProfit) : '-';
            const paidAmountFormatted = paidAmount > 0 ? formatPaysaAsTaka(paidAmount) : '-';
            const pendingAmountFormatted = pendingAmount > 0 ? formatPaysaAsTaka(pendingAmount) : '-';
            
            return `
                <tr>
                    <td>${request.investmentAccountNumber || 'N/A'}</td>
                    <td>${request.memberID}</td>
                    <td>${request.memberName}</td>
                    <td>${formatPaysaAsTaka(request.amount)}</td>
                    <td>${profitPercentage}${profitPercentage !== '-' ? '%' : ''}</td>
                    <td>${totalProfit}</td>
                    <td>${paidAmountFormatted}</td>
                    <td>${pendingAmountFormatted}</td>
                    <td><span style="color: var(--primary-green); font-weight: bold;">CREATED</span></td>
                    <td>
                        <button 
                            onclick="viewInvestmentAccountByRequestId('${requestIdStr}')" 
                            class="btn btn-primary"
                            style="padding: 0.5rem 1rem; font-size: 0.9rem;"
                        >
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        } else {
            // Show create account button if no account yet
            const requestIdStr = String(request._id || request.id || '');
            return `
                <tr>
                    <td>${request.requestId}</td>
                    <td>${request.memberID}</td>
                    <td>${request.memberName}</td>
                    <td>${formatPaysaAsTaka(request.amount)}</td>
                    <td>${request.duration} Months</td>
                    <td>${request.purpose}</td>
                    <td colspan="2">Approved on ${appDate}</td>
                    <td><span style="color: var(--warning-orange); font-weight: bold;">PENDING</span></td>
                    <td>
                        <button 
                            onclick="showCreateInvestmentAccountModal('${requestIdStr}')" 
                            class="btn btn-primary"
                            style="padding: 0.5rem 1rem; font-size: 0.9rem; background: var(--primary-green);"
                        >
                            Create Account
                        </button>
                    </td>
                </tr>
            `;
        }
    }).join('');
}

function filterInvestmentAccounts(filter) {
    currentInvestmentAccountFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    displayInvestmentAccounts(filter);
}

function searchInvestmentAccounts() {
    const searchInput = document.getElementById('investmentAccountSearchInput');
    const searchTypeSelect = document.getElementById('investmentAccountSearchType');
    
    investmentAccountSearchTerm = searchInput.value.trim();
    investmentAccountSearchType = searchTypeSelect.value;
    
    if (!investmentAccountSearchTerm) {
        dashboard.showNotification('Please enter a search value', 'error');
        return;
    }
    
    displayInvestmentAccounts(currentInvestmentAccountFilter);
}

async function viewInvestmentAccountDetails(accountId) {
    try {
        const response = await fetch(`http://localhost:5000/api/investment-accounts/${accountId}`);
        const account = await response.json();
        
        if (response.ok) {
            showInvestmentAccountDetailsModal(account);
        } else {
            alert('Failed to load account details');
        }
    } catch (error) {
        console.error('Error loading account details:', error);
        alert('Error loading account details');
    }
}

function showInvestmentAccountDetailsModal(account) {
    const startDate = new Date(account.startDate).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
    const endDate = new Date(account.endDate).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
    const createdDate = new Date(account.createdAt).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
    
    const paidAmount = account.monthlyPayments.reduce((sum, payment) => {
        return sum + (payment.status === 'paid' ? payment.amountPaid : 0);
    }, 0);
    
    const pendingAmount = account.totalAmount - paidAmount;
    const perMonthPayment = account.totalAmount / account.duration;
    
    const statusColor = account.status === 'active' ? 'var(--primary-green)' : 
                       account.status === 'completed' ? 'var(--primary-blue)' : 'var(--danger-red)';
    
    // Member profile picture
    const memberPicture = account.userId?.profilePicture || '/frontend/logo/default-avatar.png';
    
    const modalHTML = `
        <div class="modal-overlay" id="investmentAccountDetailsModal" onclick="closeInvestmentAccountDetailsModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-green); margin: 0;">Investment Account Details - ${account.investmentAccountNumber}</h3>
                    <button onclick="closeInvestmentAccountDetailsModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-gray);">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <!-- Member Picture and Account Summary -->
                    <div style="display: grid; grid-template-columns: auto 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; align-items: start;">
                        <!-- Member Picture -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                            <img src="${memberPicture}" alt="Member" 
                                 style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 3px solid var(--primary-green);"
                                 onerror="this.src='/frontend/logo/default-avatar.png'">
                            <div style="text-align: center; font-size: 0.85rem; color: #666;">
                                <div style="font-weight: 600;">${account.memberName}</div>
                                <div>ID: ${account.memberID}</div>
                            </div>
                        </div>
                        
                        <!-- Account Number -->
                        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-green);">
                            <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">Account Number</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-green);">${account.investmentAccountNumber}</div>
                        </div>
                        
                        <!-- Transaction ID -->
                        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-blue);">
                            <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">Transaction ID</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-blue);">${account.transactionId}</div>
                        </div>
                    </div>

                    <!-- Member & Investment Details -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div><strong>Invested Amount:</strong> ${formatPaysaAsTaka(account.amount)}</div>
                        <div><strong>Duration:</strong> ${account.duration} Months</div>
                        <div><strong>Profit Percentage:</strong> ${account.profitPercentage}%</div>
                        <div><strong>Monthly Profit:</strong> ${formatPaysaAsTaka(account.monthlyProfit, 0)}</div>
                        <div><strong>Total Profit:</strong> ${formatPaysaAsTaka(account.totalProfit, 0)}</div>
                        <div><strong>Total Amount:</strong> ${formatPaysaAsTaka(account.totalAmount)}</div>
                        <div><strong>Per Month Payment:</strong> ${formatPaysaAsTaka(perMonthPayment)}</div>
                        <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${account.status.toUpperCase()}</span></div>
                        <div><strong>Start Date:</strong> ${startDate}</div>
                        <div><strong>End Date:</strong> ${endDate}</div>
                    </div>

                    <!-- Payment Summary -->
                    <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <h4 style="margin: 0 0 0.75rem 0; color: #856404;">Payment Summary</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                            <div>
                                <div style="font-size: 0.9rem; color: #666;">Paid Amount</div>
                                <div style="font-size: 1.3rem; font-weight: bold; color: var(--primary-green);">${formatPaysaAsTaka(paidAmount)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; color: #666;">Pending Amount</div>
                                <div style="font-size: 1.3rem; font-weight: bold; color: var(--warning-orange);">${formatPaysaAsTaka(pendingAmount)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; color: #666;">Progress</div>
                                <div style="font-size: 1.3rem; font-weight: bold; color: var(--primary-blue);">${Math.round((paidAmount / account.totalAmount) * 100)}%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Purpose & Bank Details -->
                    <div style="margin-bottom: 1.5rem;">
                        <strong>Purpose:</strong>
                        <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                            ${account.purpose}
                        </div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <strong>Bank Details:</strong>
                        <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                            <p><strong>Bank:</strong> ${account.bankDetails.bankName}</p>
                            <p><strong>Branch:</strong> ${account.bankDetails.bankBranch}</p>
                            <p><strong>Account No:</strong> ${account.bankDetails.bankAccountNo}</p>
                            <p><strong>Account Type:</strong> ${account.bankDetails.bankAccountType}</p>
                        </div>
                    </div>

                    ${account.adminNote ? `
                    <div style="margin-bottom: 1.5rem;">
                        <strong>Admin Note:</strong>
                        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; border-left: 4px solid var(--primary-green);">
                            ${account.adminNote}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Monthly Payment Schedule -->
                    <div>
                        <h4 style="color: var(--primary-green); margin-bottom: 1rem;">Monthly Payment Schedule</h4>
                        <div style="max-height: 300px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: var(--light-gray);">
                                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Month</th>
                                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Due Date</th>
                                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Amount Due</th>
                                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Paid Date</th>
                                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${account.monthlyPayments.map(payment => {
                                        const dueDate = new Date(payment.dueDate).toLocaleDateString('en-GB', { 
                                            day: 'numeric', month: 'short', year: 'numeric' 
                                        });
                                        const paidDate = payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-GB', { 
                                            day: 'numeric', month: 'short', year: 'numeric' 
                                        }) : '-';
                                        
                                        const statusColor = payment.status === 'paid' ? 'var(--primary-green)' : 
                                                          payment.status === 'overdue' ? 'var(--danger-red)' : 'var(--warning-orange)';
                                        
                                        return `
                                            <tr>
                                                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">Month ${payment.month}</td>
                                                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">${dueDate}</td>
                                                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">${formatPaysaAsTaka(payment.expectedAmount)}</td>
                                                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">${paidDate}</td>
                                                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">
                                                    <span style="color: ${statusColor}; font-weight: bold;">${payment.status.toUpperCase()}</span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--light-gray); border-radius: 8px;">
                        <small><strong>Created on:</strong> ${createdDate} by ${account.createdBy?.fullName || 'Admin'}</small>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 1.5rem; border-top: 2px solid var(--border-gray); display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button onclick="closeInvestmentAccountDetailsModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

function closeInvestmentAccountDetailsModal() {
    const modal = document.getElementById('investmentAccountDetailsModal');
    if (modal) {
        modal.parentElement.remove();
    }
}

// Show Create Investment Account Modal
async function showCreateInvestmentAccountModal(requestId) {
    try {
        const response = await fetch(`http://localhost:5000/api/investment-requests/${requestId}`);
        const request = await response.json();
        
        if (!response.ok) {
            alert('Failed to load request details');
            return;
        }
        
        const memberPicture = request.memberProfilePicture || '/frontend/logo/default-avatar.png';
        const today = new Date().toISOString().split('T')[0];
        
        const modalHTML = `
            <div class="modal-overlay" id="createAccountModal" onclick="closeCreateAccountModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: var(--primary-green); margin: 0;">Create Investment Account</h3>
                        <button onclick="closeCreateAccountModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-gray);">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem;">
                        <form id="createAccountForm" style="display: grid; gap: 1.5rem;">
                            <!-- Request Details -->
                            <div>
                                <h4 style="color: var(--primary-green); margin-bottom: 1rem; border-bottom: 2px solid var(--border-gray); padding-bottom: 0.5rem;">Request Details</h4>
                                <div style="display: grid; grid-template-columns: auto 1fr; gap: 1rem; align-items: start;">
                                    <img src="${memberPicture}" alt="Member" 
                                         style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 2px solid var(--primary-green);"
                                         onerror="this.src='/frontend/logo/default-avatar.png'">
                                    <div style="display: grid; gap: 0.5rem;">
                                        <div><strong>Request ID:</strong> ${request.requestId}</div>
                                        <div><strong>Member ID:</strong> ${request.memberID}</div>
                                        <div><strong>Member Name:</strong> ${request.memberName}</div>
                                        <div><strong>Amount:</strong> ${formatPaysaAsTaka(request.amount)}</div>
                                        <div><strong>Duration:</strong> ${request.duration} Months</div>
                                        <div><strong>Purpose:</strong> ${request.purpose}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Investment Details Form -->
                            <div>
                                <h4 style="color: var(--primary-green); margin-bottom: 1rem; border-bottom: 2px solid var(--border-gray); padding-bottom: 0.5rem;">Investment Details</h4>
                                
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Profit Percentage (%) *</label>
                                    <input type="number" id="profitPercentage" step="0.1" min="0" max="100" required
                                           placeholder="Enter annual profit percentage (e.g., 10 for 10%)"
                                           oninput="calculateInvestmentPreview(${request.amount}, ${request.duration})"
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;">
                                </div>
                                
                                <!-- Calculation Preview -->
                                <div id="calculationPreview" style="background: #f0f8f5; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: none;">
                                    <h5 style="color: var(--primary-green); margin: 0 0 0.75rem 0; font-size: 0.95rem;">📊 Calculation Preview</h5>
                                    <div style="display: grid; gap: 0.75rem; font-size: 0.9rem;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span>Principal Amount:</span>
                                            <strong id="previewPrincipal">৳0.00</strong>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span>Monthly Profit:</span>
                                            <strong id="previewMonthlyProfit" style="color: var(--primary-green);">৳0.00</strong>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span>Total Profit (${request.duration} months):</span>
                                            <strong id="previewTotalProfit" style="color: var(--primary-green);">৳0.00</strong>
                                        </div>
                                        
                                        <!-- Editable Total Payable Amount -->
                                        <div style="padding-top: 0.5rem; border-top: 2px solid #c8e6d7;">
                                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--primary-green);">Total Payable Amount (Editable):</label>
                                            <input type="number" id="customTotalAmount" step="0.01" min="0"
                                                   placeholder="Auto-calculated (you can modify)"
                                                   oninput="updateMonthlyFromTotal(${request.duration})"
                                                   style="width: 100%; padding: 0.6rem; border: 2px solid var(--primary-green); border-radius: 6px; font-size: 1rem; font-weight: 600;">
                                            <small style="color: #666; display: block; margin-top: 0.25rem;">💡 Modify this if you want a custom total amount</small>
                                        </div>
                                        
                                        <!-- Editable Monthly Installment -->
                                        <div>
                                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2c5f2d;">Monthly Installment (Editable):</label>
                                            <input type="number" id="customMonthlyInstallment" step="0.01" min="0"
                                                   placeholder="Auto-calculated (you can modify)"
                                                   oninput="updateTotalFromMonthly(${request.duration})"
                                                   style="width: 100%; padding: 0.6rem; border: 2px solid #2c5f2d; border-radius: 6px; font-size: 1rem; font-weight: 600;">
                                            <small style="color: #666; display: block; margin-top: 0.25rem;">💡 Modify this if you want a custom monthly installment</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Start Date *</label>
                                    <input type="date" id="startDate" max="${today}" required value="${today}"
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;">
                                    <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 0.25rem;">⚠️ You can select past dates but not future dates</small>
                                </div>
                                
                                <div class="form-group">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Admin Note/Comment (Optional)</label>
                                    <textarea id="adminNote" rows="4"
                                              placeholder="Enter any additional notes or comments about this investment account..."
                                              style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer" style="padding: 1.5rem; border-top: 2px solid var(--border-gray); display: flex; gap: 0.75rem; justify-content: flex-end;">
                        <button onclick="closeCreateAccountModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Cancel</button>
                        <button onclick="createInvestmentAccount('${requestId}')" class="btn btn-primary" style="padding: 0.6rem 1.5rem; background: var(--primary-green);">Create Account</button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Auto-fill profit percentage based on member's selected duration
        fetchAndFillInterestRate(request.duration);
        
    } catch (error) {
        console.error('Error loading request:', error);
        alert('Error loading request details');
    }
}

async function fetchAndFillInterestRate(duration) {
    try {
        const response = await fetch(`http://localhost:5000/api/interest-rates/duration/${duration}`);
        const data = await response.json();
        
        if (response.ok && data.success && data.interestRate) {
            // Auto-fill the profit percentage field
            const profitPercentageInput = document.getElementById('profitPercentage');
            if (profitPercentageInput) {
                profitPercentageInput.value = data.interestRate.interestRate;
                // Trigger the calculation preview
                profitPercentageInput.dispatchEvent(new Event('input'));
            }
        }
    } catch (error) {
        console.error('Error fetching interest rate for duration:', error);
        // Don't show error to user, just let them enter manually
    }
}

function calculateInvestmentPreview(amountPaisa, duration) {
    const profitPercentage = parseFloat(document.getElementById('profitPercentage').value);
    const previewDiv = document.getElementById('calculationPreview');
    
    if (!profitPercentage || profitPercentage <= 0) {
        previewDiv.style.display = 'none';
        return;
    }
    
    // Show preview
    previewDiv.style.display = 'block';
    
    // Store principal for editable preview recalculation
    previewPrincipalPaisa = amountPaisa;
    
    // Calculate (all amounts in paisa)
    const annualProfitPaisa = Math.round((amountPaisa * profitPercentage) / 100);
    const monthlyProfitPaisa = Math.round(annualProfitPaisa / 12);
    
    // Calculate total profit with remainder distribution
    const totalProfitWithoutRemainder = monthlyProfitPaisa * duration;
    const remainder = annualProfitPaisa - (monthlyProfitPaisa * 12);
    const totalProfitPaisa = totalProfitWithoutRemainder + Math.min(remainder, duration);
    
    const totalAmountPaisa = amountPaisa + totalProfitPaisa;
    const monthlyInstallmentPaisa = Math.floor(totalAmountPaisa / duration);
    
    // Convert paisa to taka for display
    const totalAmountTaka = (totalAmountPaisa / 100).toFixed(2);
    const monthlyInstallmentTaka = (monthlyInstallmentPaisa / 100).toFixed(2);
    
    // Update display (read-only fields)
    document.getElementById('previewPrincipal').textContent = formatPaysaAsTaka(amountPaisa);
    document.getElementById('previewMonthlyProfit').textContent = formatPaysaAsTaka(monthlyProfitPaisa);
    document.getElementById('previewTotalProfit').textContent = formatPaysaAsTaka(totalProfitPaisa);
    
    // Update editable input fields with calculated values
    document.getElementById('customTotalAmount').value = totalAmountTaka;
    document.getElementById('customMonthlyInstallment').value = monthlyInstallmentTaka;
}

// Update total amount when monthly installment is changed
function updateTotalFromMonthly(duration) {
    const monthlyInstallment = parseFloat(document.getElementById('customMonthlyInstallment').value);
    if (monthlyInstallment && monthlyInstallment > 0) {
        const approximateTotalTaka = parseFloat((monthlyInstallment * duration).toFixed(2));
        document.getElementById('customTotalAmount').value = approximateTotalTaka.toFixed(2);
        
        // Recalculate and update profit previews
        const principalTaka = previewPrincipalPaisa / 100;
        const totalProfitTaka = approximateTotalTaka - principalTaka;
        const monthlyProfitTaka = monthlyInstallment - (principalTaka / duration);
        
        document.getElementById('previewTotalProfit').textContent = formatPaysaAsTaka(Math.round(Math.max(0, totalProfitTaka) * 100));
        document.getElementById('previewMonthlyProfit').textContent = formatPaysaAsTaka(Math.round(Math.max(0, monthlyProfitTaka) * 100));
    }
}

// Update monthly installment when total amount is changed
function updateMonthlyFromTotal(duration) {
    const totalAmount = parseFloat(document.getElementById('customTotalAmount').value);
    if (totalAmount && totalAmount > 0) {
        const monthlyInstallmentTaka = parseFloat((totalAmount / duration).toFixed(2));
        document.getElementById('customMonthlyInstallment').value = monthlyInstallmentTaka.toFixed(2);
        
        // Recalculate and update profit previews
        const principalTaka = previewPrincipalPaisa / 100;
        const totalProfitTaka = totalAmount - principalTaka;
        const monthlyProfitTaka = monthlyInstallmentTaka - (principalTaka / duration);
        
        document.getElementById('previewTotalProfit').textContent = formatPaysaAsTaka(Math.round(Math.max(0, totalProfitTaka) * 100));
        document.getElementById('previewMonthlyProfit').textContent = formatPaysaAsTaka(Math.round(Math.max(0, monthlyProfitTaka) * 100));
    }
}

function closeCreateAccountModal() {
    const modal = document.getElementById('createAccountModal');
    if (modal) {
        modal.parentElement.remove();
    }
}

async function createInvestmentAccount(requestId) {
    const profitPercentage = document.getElementById('profitPercentage').value;
    const startDate = document.getElementById('startDate').value;
    const adminNote = document.getElementById('adminNote').value;
    const customTotalAmount = document.getElementById('customTotalAmount').value;
    const customMonthlyInstallment = document.getElementById('customMonthlyInstallment').value;
    
    if (!profitPercentage || !startDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    const userId = sessionStorage.getItem('userId');
    const adminName = sessionStorage.getItem('fullName') || 'Admin';
    
    // Prepare request body
    const requestBody = {
        investmentRequestId: requestId,
        profitPercentage: parseFloat(profitPercentage),
        startDate: startDate,
        createdBy: adminName,
        adminNote: adminNote
    };
    
    // Add custom values if provided (convert taka to paisa)
    if (customTotalAmount) {
        requestBody.customTotalAmount = Math.round(parseFloat(customTotalAmount) * 100);
    }
    if (customMonthlyInstallment) {
        requestBody.customMonthlyInstallment = Math.round(parseFloat(customMonthlyInstallment) * 100);
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/investment-accounts/create-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            dashboard.showNotification('Investment account created successfully!', 'success');
            closeCreateAccountModal();
            loadInvestmentAccounts(); // Reload the list
            updateNavBadges();
        } else {
            alert(data.message || 'Failed to create investment account');
        }
    } catch (error) {
        console.error('Error creating account:', error);
        alert('Error creating investment account');
    }
}

async function viewInvestmentAccountByRequestId(requestId) {
    try {
        const response = await fetch('http://localhost:5000/api/investment-accounts/approved-requests');
        const requests = await response.json();
        
        if (response.ok) {
            const request = requests.find(r => r._id === requestId);
            if (request && request.investmentAccountNumber) {
                // Fetch the actual account details
                const accountsResponse = await fetch('http://localhost:5000/api/investment-accounts/all');
                const accounts = await accountsResponse.json();
                
                const account = accounts.find(a => a.investmentAccountNumber === request.investmentAccountNumber);
                if (account) {
                    showInvestmentAccountDetailsModal(account);
                } else {
                    alert('Account details not found');
                }
            } else {
                alert('Account not found');
            }
        } else {
            alert('Failed to load account');
        }
    } catch (error) {
        console.error('Error loading account:', error);
        alert('Error loading account details');
    }
}

function showInvestmentAccountError(message) {
    const tbody = document.getElementById('investmentAccountTableBody');
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--danger-red); padding: 2rem;">${message}</td></tr>`;
}

// ============================================
// INVESTMENT RECOVERY ENTRY FUNCTIONS
// ============================================

let currentInvestmentForRecovery = null;
let pendingRecoveryAccounts = [];

// Load accounts with pending recovery
async function loadPendingRecoveryAccounts() {
    try {
        const response = await fetch('http://localhost:5000/api/investment-recovery/pending-accounts');
        const accounts = await response.json();
        
        if (response.ok) {
            pendingRecoveryAccounts = accounts;
            populatePendingAccountsDropdown(accounts);
        } else {
            dashboard.showNotification('Error loading pending accounts', 'error');
        }
    } catch (error) {
        console.error('Error loading pending accounts:', error);
        dashboard.showNotification('Error loading pending accounts', 'error');
    }
}

// Populate dropdown with pending accounts
function populatePendingAccountsDropdown(accounts) {
    const dropdown = document.getElementById('pendingAccountsDropdown');
    
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">-- Select an account --</option>';
    
    if (accounts.length === 0) {
        dropdown.innerHTML += '<option value="" disabled>No accounts with pending recovery</option>';
        return;
    }
    
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.investmentAccountNumber;
        // Convert paisa to taka for display
        option.textContent = `${account.investmentAccountNumber} - ${account.memberName} (${account.memberID}) - Pending: ${formatPaysaAsTaka(account.pendingAmount)} [${account.pendingMonths}/${account.duration} months]`;
        dropdown.appendChild(option);
    });
}

// Load selected account from dropdown
async function loadSelectedInvestmentAccount() {
    const dropdown = document.getElementById('pendingAccountsDropdown');
    const accountNumber = dropdown.value;
    
    if (!accountNumber) {
        document.getElementById('investmentRecoveryDetails').style.display = 'none';
        document.getElementById('recoveryFormContainer').style.display = 'none';
        return;
    }
    
    // Clear manual search input
    document.getElementById('recoveryInvestmentIdInput').value = accountNumber;
    
    // Search for the account
    await searchInvestmentForRecovery();
}

async function searchInvestmentForRecovery() {
    const accountNumber = document.getElementById('recoveryInvestmentIdInput').value.trim();
    
    if (!accountNumber) {
        dashboard.showNotification('Please enter an investment account number', 'error');
        return;
    }
    
    try {
        // Search by account number
        const response = await fetch(`http://localhost:5000/api/investment-accounts/all`);
        const accounts = await response.json();
        
        if (response.ok) {
            const account = accounts.find(acc => 
                acc.investmentAccountNumber.toLowerCase() === accountNumber.toLowerCase()
            );
            
            if (!account) {
                dashboard.showNotification('Investment account not found', 'error');
                document.getElementById('investmentRecoveryDetails').style.display = 'none';
                document.getElementById('recoveryFormContainer').style.display = 'none';
                return;
            }
            
            currentInvestmentForRecovery = account;
            displayInvestmentForRecovery(account);
        } else {
            dashboard.showNotification('Error searching investment account', 'error');
        }
    } catch (error) {
        console.error('Error searching investment:', error);
        dashboard.showNotification('Error searching investment account', 'error');
    }
}

function displayInvestmentForRecovery(account) {
    // All amounts from backend are in paisa (integer)
    const paidAmountPaisa = account.monthlyPayments.reduce((sum, payment) => {
        return sum + (payment.status === 'paid' ? payment.amountPaid : 0);
    }, 0);
    
    const pendingAmountPaisa = account.totalAmount - paidAmountPaisa;
    
    // Calculate per month payment considering remainder in last installment
    const baseInstallmentPaisa = Math.floor(account.totalAmount / account.duration);
    const remainderPaisa = account.totalAmount - (baseInstallmentPaisa * account.duration);
    
    // For display, we'll show the base amount (the last month will have +remainder)
    const perMonthPaymentPaisa = baseInstallmentPaisa;
    
    // Get profile picture or create default avatar with initials
    const getProfilePictureHTML = () => {
        if (account.userId?.profilePicture) {
            return `<img 
                src="${account.userId.profilePicture}" 
                alt="${account.memberName}" 
                style="width: 100%; height: 100%; object-fit: cover;"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div style="display: none; width: 100%; height: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); align-items: center; justify-content: center; font-size: 3.5rem; font-weight: bold; color: white;">
                ${account.memberName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>`;
        } else {
            // Create default avatar with initials
            const initials = account.memberName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; font-weight: bold; color: white;">
                ${initials}
            </div>`;
        }
    };
    
    // Payment schedule table
    const paymentScheduleHTML = account.monthlyPayments.map((payment, index) => {
        const dueDate = new Date(payment.dueDate).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
        const paidDate = payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        }) : '-';
        
        const statusColor = payment.status === 'paid' ? 'var(--primary-green)' : 
                          payment.status === 'overdue' ? 'var(--danger-red)' : 'var(--warning-orange)';
        
        const statusIcon = payment.status === 'paid' ? '✓' : 
                          payment.status === 'overdue' ? '✗' : '◷';
        
        // Calculate expected amount for this month (last month gets remainder)
        const isLastMonth = (index === account.monthlyPayments.length - 1);
        const expectedAmountPaisa = isLastMonth ? (baseInstallmentPaisa + remainderPaisa) : baseInstallmentPaisa;
        
        return `
            <tr style="background: ${payment.status === 'paid' ? '#e8f5e9' : payment.status === 'overdue' ? '#ffebee' : '#fff'};">
                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">
                    <span style="font-weight: bold;">${statusIcon}</span> Month ${payment.month}
                </td>
                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">${dueDate}</td>
                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">${formatPaysaAsTaka(expectedAmountPaisa)}</td>
                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">${paidDate}</td>
                <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">
                    <span style="color: ${statusColor}; font-weight: bold;">${payment.status.toUpperCase()}</span>
                </td>
            </tr>
        `;
    }).join('');
    
    const detailsHTML = `
        <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border: 2px solid var(--primary-green); margin-bottom: 1.5rem; display: flex; gap: 1.5rem;">
            <!-- Profile Picture Section -->
            <div style="flex-shrink: 0;">
                <div style="width: 150px; height: 150px; border-radius: 8px; overflow: hidden; border: 3px solid var(--primary-green); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ${getProfilePictureHTML()}
                </div>
                <div style="text-align: center; margin-top: 0.5rem; font-weight: bold; color: var(--primary-green);">
                    ${account.memberName}
                </div>
                <div style="text-align: center; font-size: 0.9rem; color: #666;">
                    ${account.memberID}
                </div>
            </div>
            
            <!-- Account Details Section -->
            <div style="flex: 1;">
                <h4 style="color: var(--primary-green); margin: 0 0 1rem 0;">Investment Account Details</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-size: 0.95rem;">
                    <div><strong>Account No:</strong> ${account.investmentAccountNumber}</div>
                    <div><strong>Member ID:</strong> ${account.memberID}</div>
                    <div><strong>Member Name:</strong> ${account.memberName}</div>
                    <div><strong>Invested Amount:</strong> ${formatPaysaAsTaka(account.amount)}</div>
                    <div><strong>Duration:</strong> ${account.duration} Months</div>
                    <div><strong>Profit %:</strong> ${account.profitPercentage}%</div>
                    <div><strong>Monthly Profit:</strong> ${formatPaysaAsTaka(account.monthlyProfit, 0)}</div>
                    <div><strong>Total Amount:</strong> ${formatPaysaAsTaka(account.totalAmount)}</div>
                    <div><strong>Per Month Payment:</strong> ${formatPaysaAsTaka(perMonthPaymentPaisa)}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--primary-green);">
                    <div style="background: white; padding: 1rem; border-radius: 6px;">
                        <div style="font-size: 0.9rem; color: #666;">Paid Amount</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: var(--primary-green);">${formatPaysaAsTaka(paidAmountPaisa)}</div>
                    </div>
                    <div style="background: white; padding: 1rem; border-radius: 6px;">
                        <div style="font-size: 0.9rem; color: #666;">Pending Amount</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: var(--warning-orange);">${formatPaysaAsTaka(pendingAmountPaisa)}</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--primary-green); margin-bottom: 1rem;">Payment Schedule</h4>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-gray); border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="position: sticky; top: 0; background: var(--light-gray); z-index: 1;">
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Month</th>
                            <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Due Date</th>
                            <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Amount Due</th>
                            <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Paid Date</th>
                            <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray);">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentScheduleHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('investmentRecoveryDetails').innerHTML = detailsHTML;
    document.getElementById('investmentRecoveryDetails').style.display = 'block';
    
    // Show recovery form
    showRecoveryForm(account, perMonthPaymentPaisa);
}

function showRecoveryForm(account, perMonthPaymentPaisa) {
    const today = new Date().toISOString().split('T')[0];
    
    // Find next unpaid month
    const nextUnpaidMonth = account.monthlyPayments.find(p => p.status !== 'paid');
    const nextMonthNumber = nextUnpaidMonth ? nextUnpaidMonth.month : 1;
    
    // Calculate expected amount for default display
    const baseInstallmentPaisa = Math.floor(account.totalAmount / account.duration);
    const remainderPaisa = account.totalAmount - (baseInstallmentPaisa * account.duration);
    
    // If next unpaid month is the last month, add remainder
    const isLastMonth = nextMonthNumber === account.duration;
    const defaultInstallmentPaisa = isLastMonth ? (baseInstallmentPaisa + remainderPaisa) : baseInstallmentPaisa;
    
    // Convert to taka for display in input field (rounded to integer)
    const defaultInstallmentTaka = Math.round(paysaToTaka(defaultInstallmentPaisa));
    
    // Calculate pending amount for "Pay for All Months" option
    const paidAmountPaisa = account.monthlyPayments.reduce((sum, payment) => {
        return sum + (payment.status === 'paid' ? payment.amountPaid : 0);
    }, 0);
    const pendingAmountPaisa = account.totalAmount - paidAmountPaisa;
    const pendingAmountTaka = Math.round(paysaToTaka(pendingAmountPaisa));
    
    const formHTML = `
        <div style="background: #fff3cd; padding: 1.5rem; border-radius: 8px; border: 2px solid #856404;">
            <h4 style="color: #856404; margin: 0 0 1rem 0;">Record Recovery Entry</h4>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Month Number *</label>
                    <select 
                        id="recoveryMonthNumber" 
                        style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                        onchange="handleMonthSelectionChange()"
                    >
                        <option value="all" style="font-weight: bold; color: var(--primary-green);">
                            💰 Pay for All Months (Pending: ${formatPaysaAsTaka(pendingAmountPaisa, 0)})
                        </option>
                        ${account.monthlyPayments.filter(p => p.status !== 'paid').map(p => 
                            `<option value="${p.month}" ${p.month === nextMonthNumber ? 'selected' : ''}>
                                Month ${p.month} - ${new Date(p.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Recovery Date *</label>
                    <input 
                        type="date" 
                        id="recoveryDate" 
                        value="${today}"
                        max="${today}"
                        style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                    />
                </div>
            </div>

            <div style="background: white; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; border: 1px solid #e0e0e0;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.25rem; font-size: 0.9rem; color: #666;">Profit/Interest (Per Month)</label>
                        <div style="font-size: 1.1rem; font-weight: bold; color: var(--primary-green);">${formatPaysaAsTaka(account.monthlyProfit, 0)}</div>
                        <small style="color: #666;">This is auto-calculated and will be recorded</small>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Installment Amount (৳) *</label>
                        <input 
                            type="number" 
                            id="recoveryInstallmentAmount" 
                            value="${defaultInstallmentTaka}"
                            step="0.01"
                            min="0"
                            style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                        />
                        <small style="color: #666;">Default per month payment, you can modify</small>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Remarks (Optional)</label>
                <textarea 
                    id="recoveryRemarks" 
                    rows="3" 
                    placeholder="Enter any additional notes..."
                    style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px; font-family: inherit; resize: vertical;"
                ></textarea>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button onclick="clearRecoveryForm()" class="btn btn-secondary" style="padding: 0.75rem 1.5rem;">Clear</button>
                <button onclick="submitRecoveryEntry()" class="btn btn-primary" style="padding: 0.75rem 2rem;">Submit for Authorization</button>
            </div>
        </div>
    `;
    
    document.getElementById('recoveryFormContainer').innerHTML = formHTML;
    document.getElementById('recoveryFormContainer').style.display = 'block';
    
    // Store account data for month selection change handler
    window.currentRecoveryFormData = {
        account: account,
        baseInstallmentPaisa: baseInstallmentPaisa,
        remainderPaisa: remainderPaisa,
        pendingAmountPaisa: pendingAmountPaisa
    };
}

function handleMonthSelectionChange() {
    const monthSelect = document.getElementById('recoveryMonthNumber');
    const installmentInput = document.getElementById('recoveryInstallmentAmount');
    const selectedValue = monthSelect.value;
    
    if (!window.currentRecoveryFormData) return;
    
    const { account, baseInstallmentPaisa, remainderPaisa, pendingAmountPaisa } = window.currentRecoveryFormData;
    
    if (selectedValue === 'all') {
        // Set to total pending amount
        installmentInput.value = Math.round(paysaToTaka(pendingAmountPaisa));
    } else {
        // Calculate amount for selected month
        const monthNumber = parseInt(selectedValue);
        const isLastMonth = monthNumber === account.duration;
        const monthInstallmentPaisa = isLastMonth ? (baseInstallmentPaisa + remainderPaisa) : baseInstallmentPaisa;
        installmentInput.value = Math.round(paysaToTaka(monthInstallmentPaisa));
    }
}

async function submitRecoveryEntry() {
    if (!currentInvestmentForRecovery) {
        dashboard.showNotification('Please search for an investment account first', 'error');
        return;
    }
    
    const monthNumberValue = document.getElementById('recoveryMonthNumber').value;
    const recoveryDate = document.getElementById('recoveryDate').value;
    const installmentAmountInput = document.getElementById('recoveryInstallmentAmount').value;
    const installmentAmount = takaToPaysa(installmentAmountInput);  // Convert taka → paisa
    const remarks = document.getElementById('recoveryRemarks').value.trim();
    const userId = sessionStorage.getItem('userId');
    
    // Handle 'all' months or specific month
    const isPayAll = monthNumberValue === 'all';
    const monthNumber = isPayAll ? 'all' : parseInt(monthNumberValue);
    
    if (!monthNumberValue || !recoveryDate || !installmentAmountInput) {
        dashboard.showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (installmentAmount <= 0) {
        dashboard.showNotification('Installment amount must be greater than 0', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/investment-recovery/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                investmentAccountId: currentInvestmentForRecovery._id,
                installmentAmount,  // In paisa
                monthNumber,
                recoveryDate,
                remarks,
                enteredBy: userId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            dashboard.showNotification(`Recovery entry created successfully! Recovery ID: ${data.recovery.recoveryId}\nGo to "Authorize/Delete Data" section to authorize this entry.`, 'success');
            clearRecoveryForm();
            loadRecentRecoveries();
            // Reload pending accounts dropdown
            loadPendingRecoveryAccounts();
            updateNavBadges();
        } else {
            dashboard.showNotification(data.message || 'Failed to create recovery entry', 'error');
        }
    } catch (error) {
        console.error('Error submitting recovery:', error);
        dashboard.showNotification('Error submitting recovery entry', 'error');
    }
}

function clearRecoveryForm() {
    document.getElementById('recoveryInvestmentIdInput').value = '';
    document.getElementById('investmentRecoveryDetails').style.display = 'none';
    document.getElementById('recoveryFormContainer').style.display = 'none';
    currentInvestmentForRecovery = null;
}

async function loadRecentRecoveries() {
    try {
        const response = await fetch('http://localhost:5000/api/investment-recovery/all?status=pending');
        const recoveries = await response.json();
        
        if (response.ok) {
            displayRecentRecoveries(recoveries);
        }
    } catch (error) {
        console.error('Error loading recent recoveries:', error);
    }
}

function displayRecentRecoveries(recoveries) {
    const tbody = document.getElementById('recentRecoveryTableBody');
    
    if (recoveries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No recent entries</td></tr>';
        return;
    }
    
    tbody.innerHTML = recoveries.slice(0, 10).map(recovery => {
        const recoveryDate = new Date(recovery.recoveryDate).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
        
        const statusColor = recovery.status === 'authorized' ? 'var(--primary-green)' : 
                           recovery.status === 'rejected' ? 'var(--danger-red)' : 'var(--warning-orange)';
        
        return `
            <tr>
                <td>${recovery.recoveryId}</td>
                <td>${recovery.investmentAccountNumber}</td>
                <td>${recovery.memberID}</td>
                <td>${formatPaysaAsTaka(recovery.installmentAmount)}</td>
                <td>${formatPaysaAsTaka(recovery.profitInterest)}</td>
                <td>${recoveryDate}</td>
                <td><span style="color: ${statusColor}; font-weight: bold;">${recovery.status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');
}
  // =========================
  // Authorize/Delete Data Functions (Recovery Entries)
  // =========================

  // Load pending recovery entries
  async function loadPendingRecoveryEntries() {
    try {
      const response = await fetch('http://localhost:5000/api/investment-recovery/all?status=pending', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("userToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load pending entries");

      const entries = await response.json();
      displayPendingRecoveryEntries(entries);
    } catch (error) {
      console.error("Error loading pending entries:", error);
      alert("Failed to load pending recovery entries");
    }
  }

  // Display pending recovery entries in table
  function displayPendingRecoveryEntries(entries) {
    const tbody = document.getElementById("pendingEntriesTableBody");
    if (!entries || entries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: #666;">
            No pending recovery entries
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = entries
      .map(
        (entry) => `
      <tr>
        <td style="padding:12px;">${entry.recoveryId}</td>
        <td style="padding:12px;">${entry.investmentAccountId?.investmentAccountNumber || "N/A"}</td>
        <td style="padding:12px;">${entry.memberID}</td>
        <td style="padding:12px;">${entry.memberName}</td>
        <td style="padding:12px;">Month ${entry.monthNumber}</td>
        <td style="padding:12px;">৳${entry.installmentAmount.toFixed(2)}</td>
        <td style="padding:12px;">${new Date(entry.recoveryDate).toLocaleDateString("en-GB")}</td>
        <td style="padding:12px;">${entry.enteredBy?.name || "Admin"}</td>
        <td style="padding:12px;">
          <button class="btn btn-success btn-sm" onclick="authorizeRecoveryEntry('${entry._id}')" 
                  style="margin-right: 0.5rem;">
            Authorize
          </button>
          <button class="btn btn-danger btn-sm" onclick="rejectRecoveryEntry('${entry._id}')">
            Reject
          </button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  // Authorize recovery entry
  async function authorizeRecoveryEntry(entryId) {
    if (!confirm("Are you sure you want to authorize this recovery entry? This will update the investment account.")) {
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch(`http://localhost:5000/api/investment-recovery/${entryId}/authorize`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ authorizedBy: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to authorize entry");
      }

      const result = await response.json();
      alert("Recovery entry authorized successfully!\nInvestment account has been updated.");
      loadPendingRecoveryEntries(); // Refresh the list
      updateNavBadges();
      // Also reload pending accounts in case account is fully paid
      if (typeof loadPendingRecoveryAccounts === 'function') {
        loadPendingRecoveryAccounts();
      }
    } catch (error) {
      console.error("Error authorizing entry:", error);
      alert(error.message || "Failed to authorize recovery entry");
    }
  }

  // Reject recovery entry
  async function rejectRecoveryEntry(entryId) {
    const reason = prompt("Enter reason for rejection:");
    if (!reason || reason.trim() === "") {
      alert("Rejection reason is required");
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch(`http://localhost:5000/api/investment-recovery/${entryId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ 
          rejectedBy: userId,
          rejectionReason: reason 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject entry");
      }

      alert("Recovery entry rejected successfully");
      loadPendingRecoveryEntries(); // Refresh the list
      // Also reload pending accounts in case this affects the dropdown
      if (typeof loadPendingRecoveryAccounts === 'function') {
        loadPendingRecoveryAccounts();
      }
    } catch (error) {
      console.error("Error rejecting entry:", error);
      alert(error.message || "Failed to reject recovery entry");
    }
  }

  // Delete rejected recovery entry
  async function deleteRecoveryEntry(entryId) {
    if (!confirm("Are you sure you want to delete this rejected entry? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/investment-recovery/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("userToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete entry");

      alert("Recovery entry deleted successfully");
      loadPendingRecoveryEntries(); // Refresh the list
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete recovery entry");
    }
  }

  // Make functions globally accessible
  window.loadPendingRecoveryEntries = loadPendingRecoveryEntries;
  window.authorizeRecoveryEntry = authorizeRecoveryEntry;
  window.rejectRecoveryEntry = rejectRecoveryEntry;
  window.deleteRecoveryEntry = deleteRecoveryEntry;

// ============================================
// AUTHORIZE TAB SWITCHER
// ============================================
function switchAuthorizeTab(tab) {
    const tabs = ['recovery', 'monthly-share', 'expenditure', 'income'];
    tabs.forEach(t => {
        const sec = document.getElementById(`subsection-${t}`);
        const btn = document.getElementById(`tab-${t}`);
        if (sec) sec.style.display = (t === tab) ? 'block' : 'none';
        if (btn) {
            btn.style.background = (t === tab) ? 'var(--primary-green)' : '#e0e0e0';
            btn.style.color = (t === tab) ? '#fff' : '#333';
        }
    });
    // Lazy-load data for the activated tab
    if (tab === 'recovery') loadPendingRecoveryEntries();
    if (tab === 'monthly-share') loadPendingMonthlyShareEntries();
    if (tab === 'expenditure') loadPendingExpenditureEntries();
    if (tab === 'income') loadPendingIncomeEntries();
}
window.switchAuthorizeTab = switchAuthorizeTab;

// ============================================
// AUTHORIZE/DELETE — MONTHLY SHARE DEPOSIT
// ============================================
async function loadPendingMonthlyShareEntries() {
    try {
        const response = await fetch('http://localhost:5000/api/monthlyshare/pending', {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('userToken')}` }
        });
        if (!response.ok) throw new Error('Failed to load pending monthly share entries');
        const entries = await response.json();
        displayPendingMonthlyShareEntries(entries);
    } catch (error) {
        console.error('Error loading pending monthly share entries:', error);
        const tbody = document.getElementById('pendingShareEntriesTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#c00;">Failed to load entries</td></tr>`;
    }
}

function displayPendingMonthlyShareEntries(entries) {
    const tbody = document.getElementById('pendingShareEntriesTableBody');
    if (!tbody) return;

    if (!entries || entries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#666;">No pending monthly share deposit entries</td></tr>`;
        return;
    }

    tbody.innerHTML = entries.map(entry => `
        <tr>
            <td style="padding:12px;">${entry.memberId}</td>
            <td style="padding:12px;">${entry.memberName}</td>
            <td style="padding:12px;">${entry.month}</td>
            <td style="padding:12px;">${formatPaysaAsTaka(entry.amount)}</td>
            <td style="padding:12px;">${new Date(entry.date).toLocaleDateString('en-GB')}</td>
            <td style="padding:12px;">${entry.entryBy || 'Admin'}</td>
            <td style="padding:12px;">
                <button class="btn btn-success btn-sm" onclick="authorizeMonthlyShareEntry('${entry._id}')" style="margin-right:0.5rem;">
                    Authorize
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteMonthlyShareEntry('${entry._id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

async function authorizeMonthlyShareEntry(entryId) {
    if (!confirm('Are you sure you want to authorize this monthly share deposit entry?')) return;
    try {
        const adminName = sessionStorage.getItem('fullName') || 'Admin';
        const response = await fetch(`http://localhost:5000/api/monthlyshare/${entryId}/authorize`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('userToken')}`
            },
            body: JSON.stringify({ authorizedBy: adminName })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to authorize entry');
        }
        dashboard.showNotification('Monthly share deposit entry authorized successfully!', 'success');
        loadPendingMonthlyShareEntries();
        updateNavBadges();
    } catch (error) {
        console.error('Error authorizing monthly share entry:', error);
        alert(error.message || 'Failed to authorize entry');
    }
}

async function deleteMonthlyShareEntry(entryId) {
    if (!confirm('Are you sure you want to delete this pending monthly share deposit entry? This cannot be undone.')) return;
    try {
        const response = await fetch(`http://localhost:5000/api/monthlyshare/${entryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${sessionStorage.getItem('userToken')}` }
        });
        if (!response.ok) throw new Error('Failed to delete entry');
        dashboard.showNotification('Monthly share deposit entry deleted.', 'success');
        loadPendingMonthlyShareEntries();
        updateNavBadges();
    } catch (error) {
        console.error('Error deleting monthly share entry:', error);
        alert('Failed to delete entry');
    }
}

window.loadPendingMonthlyShareEntries = loadPendingMonthlyShareEntries;
window.authorizeMonthlyShareEntry = authorizeMonthlyShareEntry;
window.deleteMonthlyShareEntry = deleteMonthlyShareEntry;

// ============================================================
// AUTHORIZE/DELETE — EXPENDITURE
// ============================================================
async function loadPendingExpenditureEntries() {
    const tbody = document.getElementById('pendingExpenditureTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/pending`);
        const data = await res.json();
        const entries = data.success ? data.entries : [];
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#999;">No pending expenditure entries</td></tr>';
            return;
        }
        tbody.innerHTML = entries.map(e => `
            <tr>
                <td style="padding:12px; font-family:monospace; font-weight:600;">${e.voucherNo}</td>
                <td style="padding:12px;">${e.head}</td>
                <td style="padding:12px;">${e.subHead || '—'}</td>
                <td style="padding:12px; font-weight:600; color:#c0392b;">${formatPaysaAsTaka(e.amount)}</td>
                <td style="padding:12px;">${new Date(e.date).toLocaleDateString('en-GB')}</td>
                <td style="padding:12px; color:#666; font-size:0.9rem;">${e.comment || '—'}</td>
                <td style="padding:12px;">${e.enteredBy}</td>
                <td style="padding:12px;">
                    <button class="btn btn-success btn-sm" style="margin-right:0.4rem;"
                        onclick="authorizePendingExpenditure('${e._id}')">✔ Authorize</button>
                    <button class="btn btn-danger btn-sm"
                        onclick="deletePendingExpenditure('${e._id}')">✕ Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#c00;">Failed to load entries</td></tr>';
    }
}

async function authorizePendingExpenditure(id) {
    if (!confirm('Authorize this expenditure entry? It will appear in the Expenditure section.')) return;
    try {
        const adminName = sessionStorage.getItem('fullName') || 'Admin';
        const res = await fetch(`${API_BASE_URL}/api/expenditure/${id}/authorize`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorizedBy: adminName })
        });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        dashboard.showNotification('Expenditure entry authorized successfully!', 'success');
        loadPendingExpenditureEntries();
        updateNavBadges();
    } catch (err) { alert('Error authorizing entry.'); }
}

async function deletePendingExpenditure(id) {
    if (!confirm('Delete this pending expenditure entry? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        dashboard.showNotification('Pending expenditure entry deleted.', 'success');
        loadPendingExpenditureEntries();
        fetchAndShowNextVoucherNo();
        updateNavBadges();
    } catch (err) { alert('Error deleting entry.'); }
}

window.loadPendingExpenditureEntries = loadPendingExpenditureEntries;
window.authorizePendingExpenditure = authorizePendingExpenditure;
window.deletePendingExpenditure = deletePendingExpenditure;

// ============================================================
// AUTHORIZE/DELETE — INCOME
// ============================================================
async function loadPendingIncomeEntries() {
    const tbody = document.getElementById('pendingIncomeTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">Loading...</td></tr>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/income/pending`);
        const data = await res.json();
        const entries = data.success ? data.entries : [];
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#999;">No pending income entries</td></tr>';
            return;
        }
        tbody.innerHTML = entries.map(e => `
            <tr>
                <td style="padding:12px; font-family:monospace; font-weight:600; color:var(--primary-green);">${e.incomeId}</td>
                <td style="padding:12px;">${e.source}</td>
                <td style="padding:12px; font-weight:600; color:#2e7d32;">${formatPaysaAsTaka(e.amount)}</td>
                <td style="padding:12px;">${new Date(e.date).toLocaleDateString('en-GB')}</td>
                <td style="padding:12px;">${e.enteredBy}</td>
                <td style="padding:12px;">
                    <button class="btn btn-success btn-sm" style="margin-right:0.4rem;"
                        onclick="authorizePendingIncome('${e._id}')">✔ Authorize</button>
                    <button class="btn btn-danger btn-sm"
                        onclick="deletePendingIncome('${e._id}')">✕ Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#c00;">Failed to load entries</td></tr>';
    }
}

async function authorizePendingIncome(id) {
    if (!confirm('Authorize this income entry? It will appear in the Income section.')) return;
    try {
        const adminName = sessionStorage.getItem('fullName') || 'Admin';
        const res = await fetch(`${API_BASE_URL}/api/income/${id}/authorize`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorizedBy: adminName })
        });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        dashboard.showNotification('Income entry authorized successfully!', 'success');
        loadPendingIncomeEntries();
        updateNavBadges();
    } catch (err) { alert('Error authorizing entry.'); }
}

async function deletePendingIncome(id) {
    if (!confirm('Delete this pending income entry? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/income/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        dashboard.showNotification('Pending income entry deleted.', 'success');
        loadPendingIncomeEntries();
        fetchAndShowNextIncomeId();
        updateNavBadges();
    } catch (err) { alert('Error deleting entry.'); }
}

window.loadPendingIncomeEntries = loadPendingIncomeEntries;
window.authorizePendingIncome = authorizePendingIncome;
window.deletePendingIncome = deletePendingIncome;
// ============================================================

let expenditureHeadsCache = []; // In-memory cache of all heads

// Called once when section becomes visible
async function initExpenditureSection() {
    setExpDateToToday();
    await loadExpenditureHeads();
    await fetchAndShowNextVoucherNo();
    filterExpenses();
    loadMonthlyStats();
}

async function fetchAndShowNextVoucherNo() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/next-voucher`);
        const data = await res.json();
        const el = document.getElementById('expVoucherNo');
        if (el && data.success) el.value = data.voucherNo;
    } catch (err) {
        console.error('Error fetching next voucher number:', err);
    }
}

function setExpDateToToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;
    const el = document.getElementById('expDate');
    if (el) { el.value = today; el.max = today; }
}

// ─── HEADS ────────────────────────────────────────────────────
async function loadExpenditureHeads() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/heads`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        expenditureHeadsCache = data.heads;
        renderHeadsList();
        populateAllHeadDropdowns();
    } catch (err) {
        console.error('Error loading expenditure heads:', err);
    }
}

function renderHeadsList() {
    const container = document.getElementById('headsListContainer');
    if (!container) return;
    if (expenditureHeadsCache.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; margin:0;">No heads created yet.</p>';
        return;
    }
    container.innerHTML = expenditureHeadsCache.map(head => `
        <div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; margin-bottom:0.75rem; padding:0.75rem 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <strong style="color: var(--primary-green);">${head.name}</strong>
                <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.7rem; font-size:0.8rem;"
                    onclick="deleteExpenditureHead('${head._id}', '${head.name}')">✕ Delete Head</button>
            </div>
            ${head.subHeads.length > 0
                ? `<div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                    ${head.subHeads.map(sub =>
                        `<span style="background:#f0f8f5; border:1px solid #c8e6d7; border-radius:20px; padding:0.2rem 0.7rem; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.4rem;">
                            ${sub.name}
                            <button onclick="deleteExpenditureSubHead('${head._id}','${sub._id}','${sub.name}')"
                                style="background:none; border:none; color:#c00; cursor:pointer; font-size:0.9rem; padding:0; line-height:1;">✕</button>
                        </span>`
                    ).join('')}
                   </div>`
                : '<span style="color:#999; font-size:0.85rem;">No sub-heads</span>'
            }
        </div>
    `).join('');
}

function populateAllHeadDropdowns() {
    const ids = ['headForSubHead', 'expHead', 'filterExpHead'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const firstOption = el.options[0].outerHTML; // keep the first placeholder
        el.innerHTML = firstOption + expenditureHeadsCache.map(h =>
            `<option value="${h.name}">${h.name}</option>`
        ).join('');
    });
    // Also reset sub-head dropdowns
    ['expSubHead', 'filterExpSubHead'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = el.options[0].outerHTML;
    });
}

function populateExpSubHeadDropdown() {
    const headName = document.getElementById('expHead').value;
    const el = document.getElementById('expSubHead');
    el.innerHTML = '<option value="">-- Select Sub-Head (optional) --</option>';
    if (!headName) return;
    const head = expenditureHeadsCache.find(h => h.name === headName);
    if (head && head.subHeads.length > 0) {
        head.subHeads.forEach(sub => {
            el.innerHTML += `<option value="${sub.name}">${sub.name}</option>`;
        });
    }
}

function populateFilterSubHeadDropdown() {
    const headName = document.getElementById('filterExpHead').value;
    const el = document.getElementById('filterExpSubHead');
    el.innerHTML = '<option value="">All Sub-Heads</option>';
    if (!headName) return;
    const head = expenditureHeadsCache.find(h => h.name === headName);
    if (head && head.subHeads.length > 0) {
        head.subHeads.forEach(sub => {
            el.innerHTML += `<option value="${sub.name}">${sub.name}</option>`;
        });
    }
}

function toggleManageHeadsPanel() {
    const panel = document.getElementById('manageHeadsPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function addExpenditureHead() {
    const input = document.getElementById('newHeadInput');
    const errDiv = document.getElementById('addHeadError');
    errDiv.style.display = 'none';
    const name = input.value.trim();
    if (!name) { errDiv.textContent = 'Head name cannot be empty.'; errDiv.style.display = 'block'; return; }
    const adminName = sessionStorage.getItem('fullName') || 'Admin';
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/heads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, createdBy: adminName })
        });
        const data = await res.json();
        if (!data.success) { errDiv.textContent = data.message; errDiv.style.display = 'block'; return; }
        input.value = '';
        await loadExpenditureHeads();
        dashboard.showNotification(`Head "${name}" created successfully!`, 'success');
    } catch (err) {
        errDiv.textContent = 'Error adding head. Try again.'; errDiv.style.display = 'block';
    }
}

async function addExpenditureSubHead() {
    const headSelect = document.getElementById('headForSubHead');
    const input = document.getElementById('newSubHeadInput');
    const errDiv = document.getElementById('addSubHeadError');
    errDiv.style.display = 'none';
    const headId = expenditureHeadsCache.find(h => h.name === headSelect.value)?._id;
    if (!headId) { errDiv.textContent = 'Please select a head first.'; errDiv.style.display = 'block'; return; }
    const name = input.value.trim();
    if (!name) { errDiv.textContent = 'Sub-head name cannot be empty.'; errDiv.style.display = 'block'; return; }
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/heads/${headId}/subheads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (!data.success) { errDiv.textContent = data.message; errDiv.style.display = 'block'; return; }
        input.value = '';
        await loadExpenditureHeads();
        dashboard.showNotification(`Sub-head "${name}" added!`, 'success');
    } catch (err) {
        errDiv.textContent = 'Error adding sub-head. Try again.'; errDiv.style.display = 'block';
    }
}

async function deleteExpenditureHead(headId, headName) {
    if (!confirm(`Delete head "${headName}" and all its sub-heads?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/heads/${headId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        await loadExpenditureHeads();
        dashboard.showNotification(`Head "${headName}" deleted.`, 'success');
    } catch (err) { alert('Error deleting head.'); }
}

async function deleteExpenditureSubHead(headId, subHeadId, subHeadName) {
    if (!confirm(`Delete sub-head "${subHeadName}"?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/heads/${headId}/subheads/${subHeadId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        await loadExpenditureHeads();
        dashboard.showNotification(`Sub-head "${subHeadName}" deleted.`, 'success');
    } catch (err) { alert('Error deleting sub-head.'); }
}

// ─── RECORD EXPENSE ───────────────────────────────────────────
async function recordExpenditure() {
    const errDiv = document.getElementById('expFormError');
    errDiv.style.display = 'none';
    const voucherNo = document.getElementById('expVoucherNo').value.trim();
    const date = document.getElementById('expDate').value;
    const head = document.getElementById('expHead').value;
    const subHead = document.getElementById('expSubHead').value;
    const amountTaka = parseFloat(document.getElementById('expAmount').value);
    const comment = document.getElementById('expComment').value.trim();
    const enteredBy = sessionStorage.getItem('fullName') || 'Admin';

    if (!date) { errDiv.textContent = 'Date is required.'; errDiv.style.display = 'block'; return; }
    if (!head) { errDiv.textContent = 'Expense Head is required.'; errDiv.style.display = 'block'; return; }
    if (!amountTaka || amountTaka <= 0) { errDiv.textContent = 'Amount must be greater than 0.'; errDiv.style.display = 'block'; return; }

    // Convert payslip image to base64 (optional)
    let payslipImage = null;
    const payslipFile = document.getElementById('expPayslipImage')?.files[0];
    if (payslipFile) {
        payslipImage = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(payslipFile);
        });
    }

    const amountPaisa = takaToPaysa(amountTaka);
    const btn = document.getElementById('recordExpenseBtn');
    btn.disabled = true; btn.textContent = 'Saving...';

    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voucherNo, head, subHead, amount: amountPaisa, date, comment, enteredBy, payslipImage })
        });
        const data = await res.json();
        if (!data.success) { errDiv.textContent = data.message; errDiv.style.display = 'block'; return; }
        // Clear form & refresh voucher number
        await fetchAndShowNextVoucherNo();
        document.getElementById('expAmount').value = '';
        document.getElementById('expComment').value = '';
        document.getElementById('expHead').value = '';
        document.getElementById('expSubHead').innerHTML = '<option value="">-- Select Sub-Head (optional) --</option>';
        clearExpPayslipImage();
        setExpDateToToday();
        dashboard.showNotification('Expense entry submitted for authorization!', 'success');
        // Show inline info banner
        errDiv.style.display = 'block';
        errDiv.style.background = '#e3f2fd';
        errDiv.style.color = '#0d47a1';
        errDiv.style.border = '1px solid #90caf9';
        errDiv.style.borderRadius = '8px';
        errDiv.style.padding = '0.75rem 1rem';
        errDiv.innerHTML = `✅ Expense entry saved and sent for authorization. 
            <button onclick="showSection('authorize-delete-data')" 
                style="margin-left:0.75rem; padding:0.3rem 0.9rem; background:#1565c0; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
                Go to Authorize/Delete Data →
            </button>`;
        setTimeout(() => {
            errDiv.style.display = 'none';
            errDiv.style.cssText = '';
            errDiv.innerHTML = '';
        }, 8000);
        updateNavBadges();
        filterExpenses();
        loadMonthlyStats();
    } catch (err) {
        errDiv.textContent = 'Error saving expense. Try again.';
        errDiv.style.display = 'block';
    } finally {
        btn.disabled = false; btn.textContent = '💾 Record Expense';
    }
}

// ─── TABLE + FILTERS ─────────────────────────────────────────
async function filterExpenses() {
    // Also update filter sub-head dropdown when head changes
    populateFilterSubHeadDropdown();
    const head = document.getElementById('filterExpHead')?.value || '';
    const subHead = document.getElementById('filterExpSubHead')?.value || '';
    const month = document.getElementById('filterExpMonth')?.value || '';
    const sort = document.getElementById('sortExpAmount')?.value || 'desc';
    const params = new URLSearchParams();
    if (head) params.set('head', head);
    if (subHead) params.set('subHead', subHead);
    if (month) params.set('month', month);
    params.set('sort', sort);
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure?${params.toString()}`);
        const data = await res.json();
        const entries = data.success ? data.entries : [];
        const total = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalEl = document.getElementById('expTotalDisplay');
        const countEl = document.getElementById('expTotalCount');
        if (totalEl) totalEl.textContent = formatPaysaAsTaka(total);
        if (countEl) countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
        renderExpenseTable(entries);
    } catch (err) {
        console.error('Error filtering expenses:', err);
        renderExpenseTable([]);
    }
}

function renderExpenseTable(entries) {
    const tbody = document.getElementById('expenseTableBody');
    if (!tbody) return;
    if (!entries || entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#999;">No expense entries found.</td></tr>';
        return;
    }
    tbody.innerHTML = entries.map(e => `
        <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px;">${e.voucherNo}</td>
            <td style="padding:10px;">${e.head}</td>
            <td style="padding:10px;">${e.subHead || '<span style="color:#aaa;">—</span>'}</td>
            <td style="padding:10px; font-weight:600; color:#c0392b;">${formatPaysaAsTaka(e.amount)}</td>
            <td style="padding:10px;">${new Date(e.date).toLocaleDateString('en-GB')}</td>
            <td style="padding:10px; color:#666; font-size:0.9rem;">${e.comment || '—'}</td>
            <td style="padding:10px;">${e.enteredBy}</td>
            <td style="padding:10px;">
                <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.6rem; font-size:0.8rem;"
                    onclick="deleteExpenditureEntry('${e._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function clearExpenseFilters() {
    ['filterExpHead','filterExpSubHead','filterExpMonth'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const sortEl = document.getElementById('sortExpAmount');
    if (sortEl) sortEl.value = 'desc';
    populateFilterSubHeadDropdown();
    filterExpenses();
}

async function deleteExpenditureEntry(entryId) {
    if (!confirm('Delete this expense entry? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/${entryId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        dashboard.showNotification('Expense deleted.', 'success');
        filterExpenses();
        loadMonthlyStats();
    } catch (err) { alert('Error deleting entry.'); }
}

// ─── MONTHLY STATS SIDEBAR ────────────────────────────────────
async function loadMonthlyStats() {
    const container = document.getElementById('monthlyStatsContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/expenditure/stats/monthly`);
        const data = await res.json();
        if (!data.success || data.stats.length === 0) {
            container.innerHTML = '<p style="color:#999; text-align:center;">No data yet.</p>';
            return;
        }
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        // Find max for bar scaling
        const maxTotal = Math.max(...data.stats.map(s => s.total));
        container.innerHTML = data.stats.map(s => {
            const pct = maxTotal > 0 ? Math.round((s.total / maxTotal) * 100) : 0;
            const label = `${monthNames[s._id.month - 1]} ${s._id.year}`;
            return `
            <div style="margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
                    <span style="font-weight:600;">${label}</span>
                    <span style="color:#c0392b; font-weight:700;">${formatPaysaAsTaka(s.total)}</span>
                </div>
                <div style="background:#eee; border-radius:20px; height:8px; overflow:hidden;">
                    <div style="background: var(--primary-green); width:${pct}%; height:100%; border-radius:20px; transition:width 0.4s;"></div>
                </div>
                <div style="font-size:0.78rem; color:#888; margin-top:0.2rem;">${s.count} entr${s.count === 1 ? 'y' : 'ies'}</div>
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Error loading monthly stats:', err);
        container.innerHTML = '<p style="color:#c00; text-align:center;">Failed to load stats.</p>';
    }
}

// Export globals
window.toggleManageHeadsPanel = toggleManageHeadsPanel;
window.addExpenditureHead = addExpenditureHead;
window.addExpenditureSubHead = addExpenditureSubHead;
window.deleteExpenditureHead = deleteExpenditureHead;
window.deleteExpenditureSubHead = deleteExpenditureSubHead;
window.populateExpSubHeadDropdown = populateExpSubHeadDropdown;
window.recordExpenditure = recordExpenditure;
window.filterExpenses = filterExpenses;
window.clearExpenseFilters = clearExpenseFilters;
window.deleteExpenditureEntry = deleteExpenditureEntry;

function previewExpPayslipImage() {
    const file = document.getElementById('expPayslipImage')?.files[0];
    const preview = document.getElementById('expPayslipPreview');
    const img = document.getElementById('expPayslipImg');
    if (file && preview && img) {
        const reader = new FileReader();
        reader.onload = e => { img.src = e.target.result; preview.style.display = 'block'; };
        reader.readAsDataURL(file);
    }
}

function clearExpPayslipImage() {
    const input = document.getElementById('expPayslipImage');
    const preview = document.getElementById('expPayslipPreview');
    const img = document.getElementById('expPayslipImg');
    if (input) input.value = '';
    if (img) img.src = '';
    if (preview) preview.style.display = 'none';
}

window.previewExpPayslipImage = previewExpPayslipImage;
window.clearExpPayslipImage = clearExpPayslipImage;

// ============================================================
// INCOME ENTRY FUNCTIONS
// ============================================================

async function initIncomeSection() {
    setIncomeDateToToday();
    await fetchAndShowNextIncomeId();
    filterIncomeEntries();
    loadIncomeMonthlyStats();
}

function setIncomeDateToToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;
    const el = document.getElementById('incomeDate');
    if (el) { el.value = today; el.max = today; }
}

async function fetchAndShowNextIncomeId() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/income/next-id`);
        const data = await res.json();
        const el = document.getElementById('incomeIdDisplay');
        if (el && data.success) el.value = data.incomeId;
    } catch (err) {
        console.error('Error fetching next income ID:', err);
    }
}

async function recordIncome() {
    const errDiv = document.getElementById('incomeFormError');
    errDiv.style.display = 'none';

    const source = document.getElementById('incomeSource').value.trim();
    const amountTaka = parseFloat(document.getElementById('incomeAmount').value);
    const date = document.getElementById('incomeDate').value;
    const enteredBy = sessionStorage.getItem('fullName') || 'Admin';

    if (!source) { errDiv.textContent = 'Source of income is required.'; errDiv.style.display = 'block'; return; }
    if (!amountTaka || amountTaka <= 0) { errDiv.textContent = 'Amount must be greater than 0.'; errDiv.style.display = 'block'; return; }
    if (!date) { errDiv.textContent = 'Date is required.'; errDiv.style.display = 'block'; return; }

    const amountPaisa = takaToPaysa(amountTaka);
    const btn = document.getElementById('recordIncomeBtn');
    btn.disabled = true; btn.textContent = 'Saving...';

    try {
        const res = await fetch(`${API_BASE_URL}/api/income`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source, amount: amountPaisa, date, enteredBy })
        });
        const data = await res.json();
        if (!data.success) { errDiv.textContent = data.message; errDiv.style.display = 'block'; return; }

        // Clear form & refresh
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
        setIncomeDateToToday();
        await fetchAndShowNextIncomeId(); // show next ID
        dashboard.showNotification('Income entry submitted for authorization!', 'success');
        // Show inline info banner
        errDiv.style.display = 'block';
        errDiv.style.background = '#e8f5e9';
        errDiv.style.color = '#1b5e20';
        errDiv.style.border = '1px solid #a5d6a7';
        errDiv.style.borderRadius = '8px';
        errDiv.style.padding = '0.75rem 1rem';
        errDiv.innerHTML = `✅ Income entry (ID: <strong>${data.entry.incomeId}</strong>) saved and sent for authorization.
            <button onclick="showSection('authorize-delete-data')" 
                style="margin-left:0.75rem; padding:0.3rem 0.9rem; background:#2e7d32; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
                Go to Authorize/Delete Data →
            </button>`;
        setTimeout(() => {
            errDiv.style.display = 'none';
            errDiv.style.cssText = '';
            errDiv.innerHTML = '';
        }, 8000);
        updateNavBadges();
        filterIncomeEntries();
        loadIncomeMonthlyStats();
    } catch (err) {
        errDiv.textContent = 'Error saving income. Try again.';
        errDiv.style.display = 'block';
    } finally {
        btn.disabled = false; btn.textContent = '💰 Save Income';
    }
}

async function filterIncomeEntries() {
    const search = document.getElementById('searchIncomeId')?.value.trim() || '';
    const fromDate = document.getElementById('filterIncomeFrom')?.value || '';
    const toDate = document.getElementById('filterIncomeTo')?.value || '';
    const sort = document.getElementById('sortIncomeAmount')?.value || 'desc';

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    params.set('sort', sort);

    try {
        const res = await fetch(`${API_BASE_URL}/api/income?${params.toString()}`);
        const data = await res.json();
        const entries = data.success ? data.entries : [];
        const total = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalEl = document.getElementById('incomeTotalDisplay');
        const countEl = document.getElementById('incomeTotalCount');
        if (totalEl) totalEl.textContent = formatPaysaAsTaka(total);
        if (countEl) countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
        renderIncomeTable(entries);
    } catch (err) {
        console.error('Error loading income entries:', err);
        renderIncomeTable([]);
    }
}

function renderIncomeTable(entries) {
    const tbody = document.getElementById('incomeTableBody');
    if (!tbody) return;
    if (!entries || entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#999;">No income entries found.</td></tr>';
        return;
    }
    tbody.innerHTML = entries.map(e => `
        <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px; font-family:monospace; color:var(--primary-green); font-weight:600;">${e.incomeId}</td>
            <td style="padding:10px;">${e.source}</td>
            <td style="padding:10px; font-weight:600; color:#2e7d32;">${formatPaysaAsTaka(e.amount)}</td>
            <td style="padding:10px;">${new Date(e.date).toLocaleDateString('en-GB')}</td>
            <td style="padding:10px;">${e.enteredBy}</td>
            <td style="padding:10px;">
                <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.6rem; font-size:0.8rem;"
                    onclick="deleteIncomeEntry('${e._id}')">✕ Delete</button>
            </td>
        </tr>
    `).join('');
}

function clearIncomeFilters() {
    ['searchIncomeId', 'filterIncomeFrom', 'filterIncomeTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const sort = document.getElementById('sortIncomeAmount');
    if (sort) sort.value = 'desc';
    filterIncomeEntries();
}

async function deleteIncomeEntry(id) {
    if (!confirm('Delete this income entry? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/income/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) { alert(data.message); return; }
        dashboard.showNotification('Income entry deleted.', 'success');
        filterIncomeEntries();
        loadIncomeMonthlyStats();
        fetchAndShowNextIncomeId();
    } catch (err) { alert('Error deleting income entry.'); }
}

async function loadIncomeMonthlyStats() {
    const container = document.getElementById('incomeMonthlyStatsContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/income/stats/monthly`);
        const data = await res.json();
        if (!data.success || data.stats.length === 0) {
            container.innerHTML = '<p style="color:#999; text-align:center;">No data yet.</p>';
            return;
        }
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const maxTotal = Math.max(...data.stats.map(s => s.total));
        container.innerHTML = data.stats.map(s => {
            const pct = maxTotal > 0 ? Math.round((s.total / maxTotal) * 100) : 0;
            const label = `${monthNames[s._id.month - 1]} ${s._id.year}`;
            return `
            <div style="margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
                    <span style="font-weight:600;">${label}</span>
                    <span style="color:#2e7d32; font-weight:700;">${formatPaysaAsTaka(s.total)}</span>
                </div>
                <div style="background:#eee; border-radius:20px; height:8px; overflow:hidden;">
                    <div style="background:#2e7d32; width:${pct}%; height:100%; border-radius:20px; transition:width 0.4s;"></div>
                </div>
                <div style="font-size:0.78rem; color:#888; margin-top:0.2rem;">${s.count} entr${s.count === 1 ? 'y' : 'ies'}</div>
            </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:#c00; text-align:center;">Failed to load stats.</p>';
    }
}

window.recordIncome = recordIncome;
window.filterIncomeEntries = filterIncomeEntries;
window.clearIncomeFilters = clearIncomeFilters;
window.deleteIncomeEntry = deleteIncomeEntry;

// ============================================
// INTEREST RATE MANAGEMENT FUNCTIONS
// ============================================

// Load all interest rates
async function loadInterestRates() {
    try {
        const response = await fetch('http://localhost:5000/api/interest-rates/all');
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayInterestRates(data.interestRates);
        } else {
            displayInterestRates([]);
        }
    } catch (error) {
        console.error('Error loading interest rates:', error);
        showInterestRateError('Failed to load interest rates');
    }
}

// Display interest rates in table
function displayInterestRates(rates) {
    const tbody = document.getElementById('interestRateTableBody');
    if (!tbody) return;

    if (!rates || rates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No interest rates configured yet. Click "Add Interest Rate" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = rates.map(rate => {
        const updatedDate = new Date(rate.updatedAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        return `
            <tr>
                <td style="font-weight: 600;">${rate.duration} Months</td>
                <td style="color: var(--primary-green); font-weight: 600;">${rate.interestRate}%</td>
                <td>${rate.createdBy}</td>
                <td>${updatedDate}</td>
                <td>
                    <button class="action-btn edit" onclick="editInterestRate('${rate._id}', ${rate.duration}, ${rate.interestRate})" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteInterestRate('${rate._id}', ${rate.duration})" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Show add interest rate modal
function showAddInterestRateModal() {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div class="modal-overlay" id="addInterestRateModal" onclick="closeAddInterestRateModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-green); margin: 0;">Add Interest Rate</h3>
                    <button onclick="closeAddInterestRateModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-gray);">&times;</button>
                </div>
                <form id="addInterestRateForm" style="padding: 1.5rem;">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Duration (Months) *</label>
                        <input type="number" id="irDuration" step="1" min="1" required
                               placeholder="e.g., 12, 24, 36"
                               style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px; box-sizing: border-box;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Interest Rate (%) *</label>
                        <input type="number" id="irRate" step="0.1" min="0" max="100" required
                               placeholder="e.g., 6.5, 11.5"
                               style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px; box-sizing: border-box;">
                    </div>
                    <div id="irCreateError" style="color: #e53e3e; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #fff5f5; border-radius: 6px; display: none;"></div>
                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                        <button type="button" onclick="closeAddInterestRateModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.5rem; background: var(--primary-green);">Add Rate</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
    document.getElementById('addInterestRateForm').addEventListener('submit', createInterestRate);
}

function closeAddInterestRateModal() {
    const modal = document.getElementById('addInterestRateModal');
    if (modal) modal.parentElement.remove();
}

// Create interest rate
async function createInterestRate(event) {
    event.preventDefault();
    const duration = parseInt(document.getElementById('irDuration').value);
    const interestRate = parseFloat(document.getElementById('irRate').value);
    const createdBy = sessionStorage.getItem('fullName') || 'Admin';

    const submitBtn = event.target.querySelector('[type="submit"]');
    const errorDiv = document.getElementById('irCreateError');
    if (submitBtn) submitBtn.disabled = true;
    if (errorDiv) errorDiv.style.display = 'none';

    try {
        const response = await fetch('http://localhost:5000/api/interest-rates/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration, interestRate, createdBy })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            closeAddInterestRateModal();
            loadInterestRates();
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.message || 'Failed to add interest rate';
                errorDiv.style.display = 'block';
            } else {
                alert(data.message || 'Failed to add interest rate');
            }
        }
    } catch (error) {
        console.error('Error creating interest rate:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.style.display = 'block';
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Edit interest rate — proper modal instead of prompt
function editInterestRate(id, duration, currentRate) {
    const existing = document.getElementById('editInterestRateModal');
    if (existing) existing.parentElement.remove();

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div class="modal-overlay" id="editInterestRateModal" onclick="closeEditInterestRateModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: var(--white); border-radius: 12px; max-width: 420px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-green); margin: 0;">Edit Interest Rate</h3>
                    <button onclick="closeEditInterestRateModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-gray);">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <p style="margin: 0 0 1rem; color: var(--text-gray);">Duration: <strong>${duration} Months</strong></p>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">New Interest Rate (%) *</label>
                        <input type="number" id="irEditRate" step="0.1" min="0" max="100" value="${currentRate}" required
                               style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px; box-sizing: border-box; font-size: 1rem;">
                    </div>
                    <div id="irEditError" style="color: #e53e3e; margin-bottom: 0.75rem; display: none;"></div>
                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                        <button type="button" onclick="closeEditInterestRateModal()" class="btn btn-secondary" style="padding: 0.6rem 1.5rem;">Cancel</button>
                        <button type="button" onclick="submitEditInterestRate('${id}', ${duration})" class="btn btn-primary" style="padding: 0.6rem 1.5rem; background: var(--primary-green);">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
    setTimeout(() => document.getElementById('irEditRate').focus(), 50);
}

function closeEditInterestRateModal() {
    const modal = document.getElementById('editInterestRateModal');
    if (modal) modal.parentElement.remove();
}

async function submitEditInterestRate(id, duration) {
    const input = document.getElementById('irEditRate');
    const errorDiv = document.getElementById('irEditError');
    const parsedRate = parseFloat(input.value);
    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
        errorDiv.textContent = 'Please enter a valid rate between 0 and 100.';
        errorDiv.style.display = 'block';
        return;
    }
    errorDiv.style.display = 'none';
    try {
        const response = await fetch('http://localhost:5000/api/interest-rates/update/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interestRate: parsedRate })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            closeEditInterestRateModal();
            loadInterestRates();
        } else {
            errorDiv.textContent = data.message || 'Failed to update interest rate';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating interest rate:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Delete interest rate
async function deleteInterestRate(id, duration) {
    if (!confirm('Are you sure you want to delete the interest rate for ' + duration + ' months?')) return;
    try {
        const response = await fetch('http://localhost:5000/api/interest-rates/delete/' + id, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (response.ok) {
            alert('Interest rate deleted successfully!');
            loadInterestRates();
        } else {
            alert(data.message || 'Failed to delete interest rate');
        }
    } catch (error) {
        console.error('Error deleting interest rate:', error);
        alert('Error deleting interest rate');
    }
}

function showInterestRateError(message) {
    const tbody = document.getElementById('interestRateTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger-red); padding: 2rem;">' + message + '</td></tr>';
}

// Make functions globally accessible
window.loadInterestRates = loadInterestRates;
window.showAddInterestRateModal = showAddInterestRateModal;
window.closeAddInterestRateModal = closeAddInterestRateModal;
window.editInterestRate = editInterestRate;
window.closeEditInterestRateModal = closeEditInterestRateModal;
window.submitEditInterestRate = submitEditInterestRate;
window.deleteInterestRate = deleteInterestRate;

// ================================================================
// NAVBAR BADGE SYSTEM
// Red dot on sidebar nav items when pending data exists.
// ================================================================
async function updateNavBadges() {
    const counts = {
        'authorize-delete-data': 0,
        'membership-applications': 0,
        'monthly-share-deposit': 0,
        'investment-recovery-entry': 0,
        'investment-monitoring': 0,
        'investment-account': 0
    };

    // Expenditure pending
    try {
        const r = await fetch(`${API_BASE_URL}/api/expenditure/pending`);
        const d = await r.json();
        if (d.success && Array.isArray(d.entries)) counts['authorize-delete-data'] += d.entries.length;
    } catch(e) {}

    // Income pending
    try {
        const r = await fetch(`${API_BASE_URL}/api/income/pending`);
        const d = await r.json();
        if (d.success && Array.isArray(d.entries)) counts['authorize-delete-data'] += d.entries.length;
    } catch(e) {}

    // Monthly share pending
    try {
        const r = await fetch(`${API_BASE_URL}/api/monthlyshare/pending`);
        const d = await r.json();
        if (Array.isArray(d)) {
            counts['authorize-delete-data'] += d.length;
            counts['monthly-share-deposit'] += d.length;
        }
    } catch(e) {}

    // Investment recovery pending
    try {
        const r = await fetch(`${API_BASE_URL}/api/investment-recovery/all?status=pending`);
        const d = await r.json();
        if (Array.isArray(d)) {
            counts['authorize-delete-data'] += d.length;
            counts['investment-recovery-entry'] += d.length;
        }
    } catch(e) {}

    // Membership applications pending
    try {
        const r = await fetch(`${API_BASE_URL}/applications/all`);
        const d = await r.json();
        if (Array.isArray(d)) {
            const pending = d.filter(a => a.status === 'pending').length;
            counts['membership-applications'] += pending;
        }
    } catch(e) {}

    // Investment requests pending (new applications from members)
    try {
        const r = await fetch(`${API_BASE_URL}/api/investment-requests/admin/statistics`);
        const d = await r.json();
        if (typeof d.pendingCount === 'number') counts['investment-monitoring'] += d.pendingCount;
    } catch(e) {}

    // Approved investment requests that don't yet have an account created
    try {
        const r = await fetch(`${API_BASE_URL}/api/investment-accounts/approved-requests`);
        const d = await r.json();
        if (Array.isArray(d)) {
            counts['investment-account'] += d.filter(req => !req.hasInvestmentAccount).length;
        }
    } catch(e) {}

    // Apply child badge visibility
    Object.entries(counts).forEach(([section, count]) => {
        const badge = document.getElementById(`badge-${section}`);
        if (badge) badge.style.display = count > 0 ? 'block' : 'none';
    });

    // Sync parent menu badges based on their children
    const parentChildMap = {
        'badge-parent-data-entry':  ['authorize-delete-data', 'monthly-share-deposit', 'investment-recovery-entry'],
        'badge-parent-members':     ['membership-applications'],
        'badge-parent-monitoring':  ['investment-monitoring'],
        'badge-parent-accounts':    ['investment-account']
    };
    Object.entries(parentChildMap).forEach(([parentId, children]) => {
        const hasActive = children.some(c => (counts[c] || 0) > 0);
        const el = document.getElementById(parentId);
        if (el) el.style.display = hasActive ? 'block' : 'none';
    });
}

function clearNavBadge(sectionId) {
    const badge = document.getElementById(`badge-${sectionId}`);
    if (badge) badge.style.display = 'none';

    // Also clear parent badge if no other child sections still have a badge
    const parentChildMap = {
        'badge-parent-data-entry':  ['authorize-delete-data', 'monthly-share-deposit', 'investment-recovery-entry'],
        'badge-parent-members':     ['membership-applications'],
        'badge-parent-monitoring':  ['investment-monitoring'],
        'badge-parent-accounts':    ['investment-account']
    };
    Object.entries(parentChildMap).forEach(([parentId, children]) => {
        if (!children.includes(sectionId)) return;
        const anyActive = children.some(c => {
            if (c === sectionId) return false; // this one just cleared
            const b = document.getElementById(`badge-${c}`);
            return b && b.style.display !== 'none';
        });
        const parentEl = document.getElementById(parentId);
        if (parentEl && !anyActive) parentEl.style.display = 'none';
    });
}

window.updateNavBadges = updateNavBadges;
window.clearNavBadge = clearNavBadge;

// Initial load + poll every 60 seconds
updateNavBadges();
setInterval(updateNavBadges, 60000);
