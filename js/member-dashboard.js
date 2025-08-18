// Member Dashboard JavaScript
class MemberDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.editMode = false;
        this.currentReportTab = 'deposits';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadMemberData();
        this.setupDateInputs();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Mobile menu toggle
        document.getElementById('mobileMenuToggle').addEventListener('click', () => this.toggleMobileMenu());
        
        // Form submissions
        document.getElementById('passwordForm').addEventListener('submit', (e) => this.handlePasswordChange(e));
        
        // Chat input
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    initializeTheme() {
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '🌙';
        } else {
            document.body.classList.remove('dark-theme');
            document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '🌞';
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('darkTheme', this.isDarkTheme);
        this.initializeTheme();
        this.showNotification('Theme changed successfully', 'success');
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('mobileMenuToggle');
        
        sidebar.classList.toggle('open');
        toggleBtn.classList.toggle('active');
    }

    handleResize() {
        if (window.innerWidth > 1024) {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('mobileMenuToggle').classList.remove('active');
        }
    }

    loadMemberData() {
        // Simulate loading member data from API
        const memberData = {
            name: 'Mohammad Rahman',
            id: 'SS123456',
            shares: 5,
            memberSince: 'January 2025',
            phone: '01712345678',
            email: 'mohammad@example.com',
            address: '123 Main Street, Dhaka, Bangladesh',
            nid: '1234567890123'
        };

        this.populateMemberData(memberData);
    }

    populateMemberData(data) {
        document.getElementById('memberName').textContent = data.name;
        document.getElementById('memberID').textContent = data.id;
        document.getElementById('memberShares').textContent = data.shares;
        document.getElementById('memberSince').textContent = data.memberSince;
        
        // Populate profile form
        document.getElementById('profileName').value = data.name;
        document.getElementById('profileMemberID').value = data.id;
        document.getElementById('profilePhone').value = data.phone;
        document.getElementById('profileEmail').value = data.email;
        document.getElementById('profileAddress').value = data.address;
        document.getElementById('profileNID').value = data.nid;
    }

    setupDateInputs() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        
        dateInputs.forEach(input => {
            input.max = today;
        });
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const activeSection = document.getElementById(sectionName);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Update menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });

        this.currentSection = sectionName;
        
        // Close mobile menu
        if (window.innerWidth <= 1024) {
            this.toggleMobileMenu();
        }
    }

    // Profile Management
    toggleEditProfile() {
        this.editMode = !this.editMode;
        const form = document.getElementById('profileForm');
        const inputs = form.querySelectorAll('input:not([readonly]), textarea:not([readonly])');
        const editableInputs = ['profilePhone', 'profileEmail', 'profileAddress'];
        const editBtn = document.getElementById('editProfileBtn');
        const actions = document.getElementById('profileActions');

        if (this.editMode) {
            editableInputs.forEach(id => {
                const input = document.getElementById(id);
                input.removeAttribute('readonly');
                input.style.background = 'var(--white)';
                input.style.borderColor = 'var(--primary-green)';
            });
            editBtn.textContent = 'Cancel Edit';
            actions.style.display = 'flex';
        } else {
            editableInputs.forEach(id => {
                const input = document.getElementById(id);
                input.setAttribute('readonly', 'true');
                input.style.background = 'var(--light-gray)';
                input.style.borderColor = 'var(--border-gray)';
            });
            editBtn.textContent = 'Edit Profile';
            actions.style.display = 'none';
        }
    }

    cancelEditProfile() {
        this.toggleEditProfile();
        this.loadMemberData(); // Reset form data
        this.showNotification('Changes cancelled', 'info');
    }

    saveProfile() {
        // Simulate API call
        const formData = new FormData(document.getElementById('profileForm'));
        
        this.showLoading('Saving profile...');
        
        setTimeout(() => {
            this.hideLoading();
            this.toggleEditProfile();
            this.showNotification('Profile updated successfully', 'success');
        }, 1500);
    }

    // Investment Management
    showNewInvestmentForm() {
        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>New Investment Application</h3>
                        <button onclick="closeModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="newInvestmentForm">
                            <div class="form-group">
                                <label>Investment Amount (৳)</label>
                                <input type="number" name="amount" min="5000" max="50000" required>
                                <small>Minimum: ৳5,000 | Maximum: ৳50,000</small>
                            </div>
                            <div class="form-group">
                                <label>Purpose</label>
                                <select name="purpose" required>
                                    <option value="">Select Purpose</option>
                                    <option value="business">Small Business</option>
                                    <option value="education">Education</option>
                                    <option value="medical">Medical Emergency</option>
                                    <option value="home">Home Improvement</option>
                                    <option value="agriculture">Agriculture</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Detailed Description</label>
                                <textarea name="description" rows="4" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Monthly Income (৳)</label>
                                <input type="number" name="income" required>
                            </div>
                            <div class="form-group">
                                <label>Preferred Repayment Period (Months)</label>
                                <select name="repaymentPeriod" required>
                                    <option value="">Select Period</option>
                                    <option value="6">6 Months</option>
                                    <option value="12">12 Months</option>
                                    <option value="18">18 Months</option>
                                    <option value="24">24 Months</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                        <button onclick="submitInvestmentApplication()" class="btn btn-primary">Submit Application</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
    }

    viewInvestment(investmentId) {
        // Simulate fetching investment details
        const investmentData = {
            'INV-2025-001': {
                id: 'INV-2025-001',
                amount: '৳15,000',
                purpose: 'Small Business',
                description: 'Starting a small grocery store in local market',
                status: 'Approved',
                applicationDate: '15 Jan 2025',
                approvalDate: '20 Jan 2025',
                disbursementDate: '22 Jan 2025',
                repaymentPeriod: '12 Months',
                monthlyInstallment: '৳1,350',
                remainingAmount: '৳10,500'
            },
            'INV-2025-002': {
                id: 'INV-2025-002',
                amount: '৳25,000',
                purpose: 'Home Improvement',
                description: 'Renovating house roof and bathroom',
                status: 'Under Consideration',
                applicationDate: '28 Jan 2025',
                repaymentPeriod: '18 Months'
            }
        };

        const data = investmentData[investmentId];
        if (!data) return;

        const statusColor = data.status === 'Approved' ? 'var(--primary-green)' : 
                          data.status === 'Under Consideration' ? '#856404' : '#721c24';

        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Investment Details - ${data.id}</h3>
                        <button onclick="closeModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div class="detail-card">
                                <label>Amount:</label>
                                <span>${data.amount}</span>
                            </div>
                            <div class="detail-card">
                                <label>Purpose:</label>
                                <span>${data.purpose}</span>
                            </div>
                            <div class="detail-card">
                                <label>Status:</label>
                                <span style="color: ${statusColor}; font-weight: 600;">${data.status}</span>
                            </div>
                            <div class="detail-card">
                                <label>Application Date:</label>
                                <span>${data.applicationDate}</span>
                            </div>
                            ${data.approvalDate ? `
                                <div class="detail-card">
                                    <label>Approval Date:</label>
                                    <span>${data.approvalDate}</span>
                                </div>
                            ` : ''}
                            ${data.disbursementDate ? `
                                <div class="detail-card">
                                    <label>Disbursement Date:</label>
                                    <span>${data.disbursementDate}</span>
                                </div>
                            ` : ''}
                            <div class="detail-card">
                                <label>Repayment Period:</label>
                                <span>${data.repaymentPeriod}</span>
                            </div>
                            ${data.monthlyInstallment ? `
                                <div class="detail-card">
                                    <label>Monthly Installment:</label>
                                    <span>${data.monthlyInstallment}</span>
                                </div>
                                <div class="detail-card">
                                    <label>Remaining Amount:</label>
                                    <span>${data.remainingAmount}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Description:</label>
                            <p style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin: 0;">${data.description}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeModal()" class="btn btn-primary">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
    }

    editInvestment(investmentId) {
        this.showNotification('Edit functionality will be available for applications under consideration', 'info');
    }

    // Reports Management
    showReportTab(tabName) {
        // Hide all tabs
        const tabs = document.querySelectorAll('.report-tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        // Show selected tab
        document.getElementById(`${tabName}-reports`).classList.add('active');

        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        this.currentReportTab = tabName;
    }

    generateDepositReport() {
        const reportType = document.getElementById('depositReportType').value;
        const fromDate = document.getElementById('depositFromDate').value;
        const toDate = document.getElementById('depositToDate').value;
        const accountNo = document.getElementById('depositAccountNo').value;

        this.showLoading('Generating report...');

        setTimeout(() => {
            const reportData = this.getDepositReportData(reportType, fromDate, toDate, accountNo);
            this.displayReport('depositReportResults', reportData, 'Deposit Report');
            this.hideLoading();
        }, 1500);
    }

    generateInvestmentReport() {
        const reportType = document.getElementById('investmentReportType').value;
        const fromDate = document.getElementById('investmentFromDate').value;
        const toDate = document.getElementById('investmentToDate').value;
        const accountNo = document.getElementById('investmentAccountNo').value;

        this.showLoading('Generating report...');

        setTimeout(() => {
            const reportData = this.getInvestmentReportData(reportType, fromDate, toDate, accountNo);
            this.displayReport('investmentReportResults', reportData, 'Investment Report');
            this.hideLoading();
        }, 1500);
    }

    generatePersonalReport() {
        const fromDate = document.getElementById('personalFromDate').value;
        const toDate = document.getElementById('personalToDate').value;
        const accountNo = document.getElementById('personalAccountNo').value;

        this.showLoading('Generating report...');

        setTimeout(() => {
            const reportData = this.getPersonalReportData(fromDate, toDate, accountNo);
            this.displayReport('personalReportResults', reportData, 'Personal Book Report');
            this.hideLoading();
        }, 1500);
    }

    getDepositReportData(type, fromDate, toDate, accountNo) {
        // Simulate API response
        return [
            { date: '2025-01-15', description: 'Share Deposit', amount: '৳1,000', balance: '৳5,000' },
            { date: '2025-01-20', description: 'Fixed Deposit', amount: '৳25,000', balance: '৳30,000' },
            { date: '2025-02-01', description: 'Monthly Deposit', amount: '৳2,000', balance: '৳32,000' }
        ];
    }

    getInvestmentReportData(type, fromDate, toDate, accountNo) {
        // Simulate API response
        return [
            { date: '2025-01-22', description: 'Investment Disbursement', amount: '৳15,000', installment: '৳1,350' },
            { date: '2025-02-05', description: 'Installment Payment', amount: '-৳1,350', remaining: '৳13,650' }
        ];
    }

    getPersonalReportData(fromDate, toDate, accountNo) {
        // Simulate API response
        return [
            { date: '2025-01-15', type: 'Credit', description: 'Share Deposit', amount: '৳1,000' },
            { date: '2025-01-20', type: 'Credit', description: 'Fixed Deposit', amount: '৳25,000' },
            { date: '2025-01-22', type: 'Debit', description: 'Investment Received', amount: '৳15,000' },
            { date: '2025-02-05', type: 'Credit', description: 'Installment Payment', amount: '৳1,350' }
        ];
    }

    displayReport(containerId, data, title) {
        const container = document.getElementById(containerId);
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-gray);">
                    <p>No data found for the selected criteria</p>
                </div>
            `;
            return;
        }

        const headers = Object.keys(data[0]);
        const tableHTML = `
            <div style="overflow-x: auto;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-green);">${title}</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                    <thead>
                        <tr style="background: var(--light-green);">
                            ${headers.map(header => `
                                <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-gray); font-weight: 600; color: var(--primary-green);">
                                    ${this.formatHeader(header)}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr style="border-bottom: 1px solid var(--border-gray);">
                                ${headers.map(header => `
                                    <td style="padding: 0.75rem; border: 1px solid var(--border-gray);">
                                        ${row[header]}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="printReport()" class="btn btn-secondary">Print</button>
                    <button onclick="downloadReport()" class="btn btn-primary">Download</button>
                </div>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    formatHeader(header) {
        return header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }

    // Password Change
    handlePasswordChange(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        this.showLoading('Changing password...');

        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Password changed successfully', 'success');
            document.getElementById('passwordForm').reset();
        }, 1500);
    }

    // Chat System
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'sent');
        input.value = '';

        // Simulate admin response
        setTimeout(() => {
            const responses = [
                "Thank you for your message. We'll get back to you shortly.",
                "Your complaint has been registered. Our team will review it.",
                "We appreciate your feedback. Is there anything else we can help with?",
                "Our support team is looking into your query. Please allow 24-48 hours for response."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage(randomResponse, 'received');
        }, 2000);
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageHTML = `
            <div class="message ${type}">
                <div class="message-content">
                    <p>${content}</p>
                    <span class="message-time">${timestamp}</span>
                </div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    attachFile() {
        // Simulate file attachment
        this.showNotification('File attachment feature will be available soon', 'info');
    }

    startNewComplaint() {
        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>New Complaint</h3>
                        <button onclick="closeModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="complaintForm">
                            <div class="form-group">
                                <label>Subject</label>
                                <input type="text" name="subject" required>
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <select name="category" required>
                                    <option value="">Select Category</option>
                                    <option value="account">Account Issues</option>
                                    <option value="investment">Investment Related</option>
                                    <option value="deposit">Deposit Issues</option>
                                    <option value="service">Service Quality</option>
                                    <option value="technical">Technical Issues</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select name="priority" required>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="5" required placeholder="Please provide detailed information about your complaint..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                        <button onclick="submitComplaint()" class="btn btn-primary">Submit Complaint</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
    }

    // Utility Functions
    showModal(html) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = html;
        document.body.style.overflow = 'hidden';

        // Add modal styles dynamically
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
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: modalFadeIn 0.3s ease;
                }
                .modal-content {
                    background: var(--white);
                    border-radius: var(--border-radius-lg);
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    animation: modalSlideIn 0.3s ease;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 2px solid var(--border-gray);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    color: var(--primary-green);
                    margin: 0;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-gray);
                    padding: 0.25rem;
                    border-radius: 50%;
                    width: 2rem;
                    height: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-close:hover {
                    background: var(--light-gray);
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
                .detail-card {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .detail-card label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-gray);
                }
                .detail-card span {
                    font-weight: 500;
                    color: var(--text-dark);
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideIn {
                    from { transform: translateY(-30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .dark-theme .modal-content {
                    background: var(--dark-card);
                    color: var(--dark-text);
                }
                .dark-theme .detail-card span {
                    color: var(--dark-text);
                }
            `;
            document.head.appendChild(modalStyles);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px var(--shadow);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
            font-weight: 500;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Add animation styles if not exist
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
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
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            color: white;
        `;
        
        loading.innerHTML = `
            <div class="loading"></div>
            <p style="margin-top: 1rem; font-weight: 500;">${message}</p>
        `;
        
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.remove();
    }
}

// Global Functions (called from HTML)
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new MemberDashboard();
});

function showSection(section) {
    dashboard.showSection(section);
}

function toggleEditProfile() {
    dashboard.toggleEditProfile();
}

function cancelEditProfile() {
    dashboard.cancelEditProfile();
}

function saveProfile() {
    dashboard.saveProfile();
}

function showNewInvestmentForm() {
    dashboard.showNewInvestmentForm();
}

function viewInvestment(id) {
    dashboard.viewInvestment(id);
}

function editInvestment(id) {
    dashboard.editInvestment(id);
}

function showReportTab(tab) {
    dashboard.showReportTab(tab);
}

function generateDepositReport() {
    dashboard.generateDepositReport();
}

function generateInvestmentReport() {
    dashboard.generateInvestmentReport();
}

function generatePersonalReport() {
    dashboard.generatePersonalReport();
}

function changePassword() {
    const form = document.getElementById('passwordForm');
    const event = new Event('submit');
    form.dispatchEvent(event);
}

function sendMessage() {
    dashboard.sendMessage();
}

function attachFile() {
    dashboard.attachFile();
}

function startNewComplaint() {
    dashboard.startNewComplaint();
}

function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = '';
    document.body.style.overflow = 'auto';
}

function submitInvestmentApplication() {
    const form = document.getElementById('newInvestmentForm');
    const formData = new FormData(form);
    
    dashboard.showLoading('Submitting application...');
    
    setTimeout(() => {
        dashboard.hideLoading();
        closeModal();
        dashboard.showNotification('Investment application submitted successfully', 'success');
        
        // Refresh investment list (in real app, this would fetch from API)
        setTimeout(() => {
            location.reload();
        }, 2000);
    }, 1500);
}

function submitComplaint() {
    const form = document.getElementById('complaintForm');
    const formData = new FormData(form);
    
    dashboard.showLoading('Submitting complaint...');
    
    setTimeout(() => {
        dashboard.hideLoading();
        closeModal();
        dashboard.showNotification('Complaint submitted successfully. Ticket ID: CMP-2025-001', 'success');
    }, 1500);
}

function printReport() {
    window.print();
}

function downloadReport() {
    dashboard.showNotification('Report download will be available soon', 'info');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        dashboard.showLoading('Logging out...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + 1-9 for quick navigation
    if (e.altKey && e.key >= '1' && e.key <= '9') {
        const sections = ['dashboard', 'profile', 'investment', 'reports', 'board', 'committee', 'password', 'notices', 'chat'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) {
            dashboard.showSection(sections[index]);
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Auto-save feature for forms
let autoSaveTimeout;
document.addEventListener('input', (e) => {
    if (e.target.matches('#profileForm input, #profileForm textarea')) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            const formData = new FormData(document.getElementById('profileForm'));
            localStorage.setItem('profileDraft', JSON.stringify(Object.fromEntries(formData)));
        }, 2000);
    }
});

// Load draft data on page load
document.addEventListener('DOMContentLoaded', () => {
    const profileDraft = localStorage.getItem('profileDraft');
    if (profileDraft) {
        try {
            const data = JSON.parse(profileDraft);
            // Apply draft data if in edit mode
        } catch (e) {
            console.warn('Could not load profile draft');
        }
    }
});