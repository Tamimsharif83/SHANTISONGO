// Member Dashboard JavaScript
class MemberDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.editMode = false;
        this.currentReportTab = 'deposits';
        this.allMembers = [];
        this.boardMembers = [];
        this.currentReportData = null;
        this.currentReportTitle = '';
        this.memberData = {
            name: 'M.M.Tamim Sharif',
            id: 'SS123456',
            shares: 5,
            memberSince: 'January 2025',
            phone: '01788594010',
            email: 'tamimsharif2181@gmail.com',
            address: '123 Main Street, Dhaka, Bangladesh',
            nid: '1234567890123'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadMemberData();
        this.setupDateInputs();
        this.loadMembersList();
        this.loadBoardMembers();
        this.loadProfilePicture();
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('mobileMenuToggle').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('passwordForm').addEventListener('submit', (e) => this.handlePasswordChange(e));
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('profilePictureInput').addEventListener('change', (e) => this.handleProfilePictureUpload(e));
        window.addEventListener('resize', () => this.handleResize());
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

    loadMemberData() {
        document.getElementById('memberName').textContent = this.memberData.name;
        document.getElementById('memberID').textContent = this.memberData.id;
        document.getElementById('memberShares').textContent = this.memberData.shares;
        document.getElementById('memberSince').textContent = this.memberData.memberSince;
        
        document.getElementById('profileName').value = this.memberData.name;
        document.getElementById('profileMemberID').value = this.memberData.id;
        document.getElementById('profilePhone').value = this.memberData.phone;
        document.getElementById('profileEmail').value = this.memberData.email;
        document.getElementById('profileAddress').value = this.memberData.address;
        document.getElementById('profileNID').value = this.memberData.nid;
    }

    setupDateInputs() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.max = today;
        });
    }

    // Profile Picture Management
    handleProfilePictureUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('File size must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                this.setProfilePicture(imageData);
                localStorage.setItem('profilePicture', imageData);
                this.showNotification('Profile picture updated successfully', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    setProfilePicture(imageData) {
        const profileImage = document.getElementById('profileImage');
        const profilePlaceholder = document.getElementById('picturePlaceholder');
        const removeBtn = document.getElementById('removePhotoBtn');
        const dashboardImage = document.getElementById('dashboardProfileImage');
        const dashboardPlaceholder = document.getElementById('dashboardPhotoPlaceholder');
        
        if (imageData) {
            profileImage.src = imageData;
            profileImage.style.display = 'block';
            profilePlaceholder.style.display = 'none';
            removeBtn.style.display = 'inline-flex';
            
            dashboardImage.src = imageData;
            dashboardImage.style.display = 'block';
            dashboardPlaceholder.style.display = 'none';
        } else {
            profileImage.style.display = 'none';
            profilePlaceholder.style.display = 'flex';
            removeBtn.style.display = 'none';
            
            dashboardImage.style.display = 'none';
            dashboardPlaceholder.style.display = 'flex';
        }
    }

    removeProfilePicture() {
        this.setProfilePicture(null);
        localStorage.removeItem('profilePicture');
        document.getElementById('profilePictureInput').value = '';
        this.showNotification('Profile picture removed', 'success');
    }

    loadProfilePicture() {
        const savedPicture = localStorage.getItem('profilePicture');
        if (savedPicture) {
            this.setProfilePicture(savedPicture);
        }
    }

    // Members Management
    async loadMembersList() {
        const membersGrid = document.getElementById('membersGrid');
        
        try {
            // Simulate MongoDB API call
            const members = await this.fetchMembersFromMongoDB();
            this.allMembers = members;
            this.displayMembers(members);
        } catch (error) {
            membersGrid.innerHTML = '<div class="error-message">Failed to load members. Please try again later.</div>';
        }
    }

    async fetchMembersFromMongoDB() {
    // Simulate API call - replace with actual MongoDB API endpoint
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'SS123456', name: 'Mohammad Rahman', status: 'Active', joinDate: '2025-01-15', isBoard: false },
                { id: 'SS123457', name: 'Fatima Begum', status: 'Active', joinDate: '2025-01-10', isBoard: false },
                { id: 'SS123458', name: 'Abdul Karim', status: 'Active', joinDate: '2025-01-12', isBoard: false },
                { id: 'SS123459', name: 'Aminul Islam', status: 'Active', joinDate: '2025-01-18', isBoard: false },
                // New 15 Board Members
                { id: 'SS200001', name: 'Sheikh Ashrafuzzaman', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200002', name: 'S. M. Tariqul Islam', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200003', name: 'Md. Mirajul Islam', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200004', name: 'Abu Bakkar Siddiq', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200005', name: 'Abid Jahangir', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200006', name: 'Ruhul Amin', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200007', name: 'Hanif Sheikh', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200008', name: 'Md. Mostafa Shahriar', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200009', name: 'Kazi Muhammad Ilyas', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200010', name: 'Sohag Hossain', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200011', name: 'Rasel Hossain', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200012', name: 'Sheikh Mahafuzur Rahman', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200013', name: 'Afrin Afroza', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200014', name: 'Md. Didarul Islam', status: 'Active', joinDate: '2025-02-15', isBoard: true },
                { id: 'SS200015', name: 'Rezwanul Haque', status: 'Active', joinDate: '2025-02-15', isBoard: true }
            ]);
        }, 1000);
    });
}


    displayMembers(members) {
        const membersGrid = document.getElementById('membersGrid');
        
        if (members.length === 0) {
            membersGrid.innerHTML = '<div class="no-members">No members found</div>';
            return;
        }

        const membersHTML = members.map(member => `
            <div class="member-card ${member.isBoard ? 'board-member' : ''}">
                <h4>${member.name}</h4>
                <div class="member-id">${member.id}</div>
                <div class="member-status">${member.status}</div>
                ${member.isBoard ? '<div class="member-status" style="background: var(--accent-orange); color: #a232deff;">Board Member</div>' : ''}
                <div style="font-size: 0.8rem; color: var(--text-gray); margin-top: 0.5rem;">
                    Joined: ${new Date(member.joinDate).toLocaleDateString()}
                </div>
            </div>
        `).join('');

        membersGrid.innerHTML = membersHTML;
    }

    filterMembers() {
        const searchTerm = document.getElementById('membersSearch').value.toLowerCase();
        const filteredMembers = this.allMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) || 
            member.id.toLowerCase().includes(searchTerm)
        );
        this.displayMembers(filteredMembers);
    }

    // Board Members Management
    async loadBoardMembers() {
        const boardGrid = document.getElementById('boardGrid');
        
        try {
            // Filter board members from all members (15 total as per policy)
            await this.loadMembersList(); // Ensure members are loaded first
            const boardMembers = this.allMembers.filter(member => member.isBoard);
            this.boardMembers = boardMembers;
            this.displayBoardMembers(boardMembers);
        } catch (error) {
            boardGrid.innerHTML = '<div class="error-message">Failed to load board members. Please try again later.</div>';
        }
    }

    displayBoardMembers(boardMembers) {
        const boardGrid = document.getElementById('boardGrid');
        
        if (boardMembers.length === 0) {
            boardGrid.innerHTML = '<div class="no-board">No board members assigned</div>';
            return;
        }

        const boardHTML = boardMembers.map(member => `
            <div class="board-member">
                <div class="member-avatar">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <h4>${member.name}</h4>
                <span class="member-id">${member.id}</span>
            </div>
        `).join('');

        boardGrid.innerHTML = boardHTML;
    }

    showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        document.getElementById(sectionName).classList.add('active');

        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });

        this.currentSection = sectionName;
        
        if (window.innerWidth <= 1024) {
            this.toggleMobileMenu();
        }
    }

    // Profile Management
    toggleEditProfile() {
        this.editMode = !this.editMode;
        const editableInputs = ['profilePhone', 'profileEmail', 'profileAddress'];
        const editBtn = document.getElementById('editProfileBtn');
        const actions = document.getElementById('profileActions');

        editableInputs.forEach(id => {
            const input = document.getElementById(id);
            if (this.editMode) {
                input.removeAttribute('readonly');
                input.style.background = 'var(--white)';
            } else {
                input.setAttribute('readonly', 'true');
                input.style.background = 'var(--light-gray)';
            }
        });

        editBtn.textContent = this.editMode ? 'Cancel Edit' : 'Edit Profile';
        actions.style.display = this.editMode ? 'flex' : 'none';
    }

    cancelEditProfile() {
        this.toggleEditProfile();
        this.loadMemberData();
        this.showNotification('Changes cancelled', 'info');
    }

    saveProfile() {
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
                                <input type="number" name="amount" min="10000" max="50000" required>
                                <small>Range: ৳10,000 - ৳50,000</small>
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
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="4" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Monthly Income (৳)</label>
                                <input type="number" name="income" required>
                            </div>
                            <div class="form-group">
                                <label>Repayment Period</label>
                                <select name="period" required>
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
                        <button onclick="submitInvestmentApplication()" class="btn btn-primary">Submit</button>
                    </div>
                </div>
            </div>
        `;
        this.showModal(modalHTML);
    }

    viewInvestment(investmentId) {
        const data = {
            id: 'INV-2025-001',
            amount: '৳15,000',
            purpose: 'Small Business',
            description: 'Starting a small grocery store',
            status: 'Approved',
            applicationDate: '15 Jan 2025',
            approvalDate: '20 Jan 2025',
            repaymentPeriod: '12 Months',
            monthlyInstallment: '৳1,350'
        };

        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Investment Details - ${data.id}</h3>
                        <button onclick="closeModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div><strong>Amount:</strong> ${data.amount}</div>
                            <div><strong>Purpose:</strong> ${data.purpose}</div>
                            <div><strong>Status:</strong> <span style="color: var(--primary-green);">${data.status}</span></div>
                            <div><strong>Application Date:</strong> ${data.applicationDate}</div>
                        </div>
                        <div style="margin-top: 1.5rem;">
                            <strong>Description:</strong>
                            <p style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${data.description}</p>
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

    // Reports Management
    showReportTab(tabName) {
        document.querySelectorAll('.report-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-reports`).classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.currentReportTab = tabName;
    }

    generateDepositReport() {
        this.showLoading('Generating report...');
        setTimeout(() => {
            const reportData = [
                { date: '2025-01-15', description: 'Share Deposit', amount: '1,000.00', balance: '5,000.00' },
                { date: '2025-01-20', description: 'Fixed Deposit', amount: '25,000.00', balance: '30,000.00' },
                { date: '2025-02-01', description: 'Monthly Deposit', amount: '2,000.00', balance: '32,000.00' }
            ];
            this.currentReportData = reportData;
            this.currentReportTitle = 'Deposit Report';
            this.displayReport('depositReportResults', reportData, 'Deposit Report');
            this.hideLoading();
        }, 1500);
    }

    generateInvestmentReport() {
        this.showLoading('Generating report...');
        setTimeout(() => {
            const reportData = [
                { date: '2025-01-22', description: 'Investment Disbursement', amount: '15,000.00', installment: '1,350.00' },
                { date: '2025-02-05', description: 'Installment Payment', amount: '1,350.00', remaining: '13,650.00' }
            ];
            this.currentReportData = reportData;
            this.currentReportTitle = 'Investment Report';
            this.displayReport('investmentReportResults', reportData, 'Investment Report');
            this.hideLoading();
        }, 1500);
    }

    generatePersonalReport() {
        this.showLoading('Generating report...');
        setTimeout(() => {
            const reportData = [
                { date: '2025-01-15', type: 'Credit', description: 'Share Deposit', amount: '1,000.00' },
                { date: '2025-01-20', type: 'Credit', description: 'Fixed Deposit', amount: '25,000.00' },
                { date: '2025-01-22', type: 'Debit', description: 'Investment Received', amount: '15,000.00' }
            ];
            this.currentReportData = reportData;
            this.currentReportTitle = 'Personal Book Report';
            this.displayReport('personalReportResults', reportData, 'Personal Book Report');
            this.hideLoading();
        }, 1500);
    }

    displayReport(containerId, data, title) {
        const container = document.getElementById(containerId);
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div style="text-align: center;">No data found</div>';
            return;
        }

        const headers = Object.keys(data[0]);
        const tableHTML = `
            <div id="reportContent">
                <h3 style="margin-bottom: 1rem; color: var(--primary-green);">${title}</h3>
                <table id="reportTable" style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                    <thead>
                        <tr style="background: var(--light-green);">
                            ${headers.map(header => `
                                <th style="padding: 12px; text-align: left; border: 1px solid var(--border-gray); font-weight: 600; color: var(--primary-green);">
                                    ${this.formatHeader(header)}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${headers.map(header => `
                                    <td style="padding: 12px; border: 1px solid var(--border-gray);">
                                        ${this.isAmount(row[header]) ? '৳' + row[header] : row[header]}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="export-actions">
                    <button onclick="printReport()" class="btn btn-secondary">Print</button>
                    <button onclick="downloadReportPDF()" class="btn btn-primary">Download PDF</button>
                    <button onclick="downloadReportExcel()" class="btn" style="background: #28a745; color: white;">Download Excel</button>
                </div>
            </div>
        `;
        container.innerHTML = tableHTML;
    }

    isAmount(value) {
        return /^\d+(\.\d{2})?$/.test(value);
    }

    formatHeader(header) {
        return header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }

    // Enhanced PDF Generation
    generatePDF() {
        if (!this.currentReportData) {
            this.showNotification('No report data available', 'error');
            return;
        }

        // Create a new window for PDF content
        const printWindow = window.open('', '_blank');
        const memberName = this.memberData.name;
        const memberID = this.memberData.id;
        
        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>SHANTISONGHO - ${this.currentReportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                    .letterhead { text-align: center; border-bottom: 3px solid #1e7e34; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo-section { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
                    .logo { width: 60px; height: 60px; margin-right: 15px; }
                    .org-title { margin: 0; }
                    .org-title h1 { color: #1e7e34; margin: 0; font-size: 28px; }
                    .org-title p { color: #666; margin: 5px 0; font-size: 14px; }
                    .member-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    .member-info h3 { color: #1e7e34; margin: 0 0 10px 0; }
                    .member-info p { margin: 5px 0; }
                    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .report-table th, .report-table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .report-table th { background: #dcfce7; color: #1e7e34; font-weight: 600; }
                    .report-table tr:nth-child(even) { background: #f9f9f9; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                    @media print { 
                        body { margin: 0; } 
                        .letterhead { page-break-after: avoid; }
                        .report-table { page-break-inside: auto; }
                        .report-table tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="letterhead">
                    <div class="logo-section">
                        <img
              src="/logo/without_bg_logo.png"
              alt="logo"
              class="logo"
            />
                        <div class="org-title">
                            <h1>শান্তিসংঘ (SHANTISONGHO)</h1>
                            <p>Islamic Finance & Community Welfare Organization</p>
                            <p>Established: April 10, 2025</p>
                        </div>
                    </div>
                </div>

                <div class="member-info">
                    <h3>Member Information</h3>
                    <p><strong>Member Name:</strong> ${memberName}</p>
                    <p><strong>Member ID:</strong> ${memberID}</p>
                    <p><strong>Report Type:</strong> ${this.currentReportTitle}</p>
                    <p><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <table class="report-table">
                    <thead>
                        <tr>
                            ${Object.keys(this.currentReportData[0]).map(header => 
                                `<th>${this.formatHeader(header)}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.currentReportData.map(row => 
                            `<tr>
                                ${Object.keys(row).map(key => 
                                    `<td>${this.isAmount(row[key]) ? '৳' + row[key] : row[key]}</td>`
                                ).join('')}
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This is a computer-generated report from SHANTISONGHO member portal.</p>
                    <p>For any queries, please contact the organization office.</p>
                    <p>© 2025 SHANTISONGHO. All rights reserved.</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 1000);
    }

    // Excel Export with proper amount formatting
    downloadExcel() {
        if (!this.currentReportData) {
            this.showNotification('No report data available', 'error');
            return;
        }

        const headers = Object.keys(this.currentReportData[0]);
        const csvContent = [
            ['SHANTISONGHO - Islamic Finance Organization'],
            [''],
            ['Member Name:', this.memberData.name],
            ['Member ID:', this.memberData.id],
            ['Report Type:', this.currentReportTitle],
            ['Generated On:', new Date().toLocaleDateString()],
            [''],
            headers.map(h => this.formatHeader(h)),
            ...this.currentReportData.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Format amounts properly for Excel
                    if (this.isAmount(value)) {
                        return `="${value}"`;  // Use Excel formula format to preserve formatting
                    }
                    return value;
                })
            )
        ];

        const csvString = csvContent.map(row => 
            Array.isArray(row) ? row.join(',') : [row].join(',')
        ).join('\n');

        const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `SHANTISONGHO_${this.currentReportTitle.replace(/\s+/g, '_')}_${this.memberData.id}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Excel file downloaded successfully', 'success');
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
            this.showNotification('Password must be at least 6 characters', 'error');
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

        setTimeout(() => {
            const responses = [
                "Thank you for your message. We'll get back to you shortly.",
                "Your inquiry has been recorded. Our team will review it.",
                "We appreciate your feedback."
            ];
            this.addMessage(responses[Math.floor(Math.random() * responses.length)], 'received');
        }, 1500);
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

    startNewComplaint() {
        const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>New Complaint</h3>
                        <button onclick="closeModal()" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label>Subject</label>
                                <input type="text" required>
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <select required>
                                    <option value="">Select Category</option>
                                    <option value="account">Account Issues</option>
                                    <option value="investment">Investment Related</option>
                                    <option value="deposit">Deposit Issues</option>
                                    <option value="service">Service Quality</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea rows="4" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                        <button onclick="submitComplaint()" class="btn btn-primary">Submit</button>
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

        if (!document.getElementById('modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
            modalStyles.textContent = `
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; }
                .modal-content { background: var(--white); border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
                .modal-header { padding: 1.5rem; border-bottom: 2px solid var(--border-gray); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h3 { color: var(--primary-green); margin: 0; }
                .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; }
                .modal-body { padding: 1.5rem; }
                .modal-footer { padding: 1.5rem; border-top: 2px solid var(--border-gray); display: flex; gap: 1rem; justify-content: flex-end; }
            `;
            document.head.appendChild(modalStyles);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 2rem; right: 2rem; z-index: 10001; padding: 1rem 1.5rem;
            border-radius: 8px; font-weight: 500; max-width: 300px; animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    showLoading(message = 'Loading...') {
        if (document.getElementById('loadingOverlay')) return;
        
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 10002; color: white;
        `;
        
        loading.innerHTML = `
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1e7e34; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 1rem;">${message}</p>
        `;
        
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.remove();
    }
}

// Global Functions
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new MemberDashboard();
    
    // Add necessary styles for animations
    if (!document.getElementById('animations')) {
        const style = document.createElement('style');
        style.id = 'animations';
        style.textContent = `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
    }
});

// Navigation Functions
function showSection(section) { dashboard.showSection(section); }
function toggleEditProfile() { dashboard.toggleEditProfile(); }
function cancelEditProfile() { dashboard.cancelEditProfile(); }
function saveProfile() { dashboard.saveProfile(); }
function removeProfilePicture() { dashboard.removeProfilePicture(); }
function filterMembers() { dashboard.filterMembers(); }
function showNewInvestmentForm() { dashboard.showNewInvestmentForm(); }
function viewInvestment(id) { dashboard.viewInvestment(id); }
function showReportTab(tab) { dashboard.showReportTab(tab); }
function generateDepositReport() { dashboard.generateDepositReport(); }
function generateInvestmentReport() { dashboard.generateInvestmentReport(); }
function generatePersonalReport() { dashboard.generatePersonalReport(); }
function changePassword() { document.getElementById('passwordForm').dispatchEvent(new Event('submit')); }
function sendMessage() { dashboard.sendMessage(); }
function startNewComplaint() { dashboard.startNewComplaint(); }
function toggleMobileMenu() { dashboard.toggleMobileMenu(); }

// Modal Functions
function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
    document.body.style.overflow = 'auto';
}

function submitInvestmentApplication() {
    dashboard.showLoading('Submitting...');
    setTimeout(() => {
        dashboard.hideLoading();
        closeModal();
        dashboard.showNotification('Application submitted successfully', 'success');
    }, 1500);
}

function submitComplaint() {
    dashboard.showLoading('Submitting...');
    setTimeout(() => {
        dashboard.hideLoading();
        closeModal();
        dashboard.showNotification('Complaint submitted successfully', 'success');
    }, 1500);
}

// Export Functions
function printReport() { window.print(); }
function downloadReportPDF() { dashboard.generatePDF(); }
function downloadReportExcel() { dashboard.downloadExcel(); }

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        dashboard.showLoading('Logging out...');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key >= '1' && e.key <= '8') {
        const sections = ['dashboard', 'profile', 'investment', 'reports', 'board', 'committee', 'password', 'notices', 'chat'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) dashboard.showSection(sections[index]);
    }
    if (e.key === 'Escape') closeModal();
});