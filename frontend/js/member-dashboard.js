// Member Dashboard JavaScript

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

class MemberDashboard {
    constructor() {
        // Check if user is logged in and not on first login
        const userId = sessionStorage.getItem('userId');
        const firstLogin = sessionStorage.getItem('firstLogin');
        
        if (!userId) {
            window.location.href = '/frontend/html/login.html';
            return;
        }
        
        if (firstLogin === 'true') {
            window.location.href = '/frontend/html/change-password.html';
            return;
        }
        
        this.currentSection = 'dashboard';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.editMode = false;
        this.currentReportTab = 'deposits';
        this.allMembers = [];
        this.boardMembers = [];
        this.savingsCurveByYear = [];
        this.activeCurveYear = '';
        this.currentReportData = null;
        this.currentReportTitle = '';
        this.memberData = {
            name: sessionStorage.getItem('fullName') || 'Member',
            id: sessionStorage.getItem('memberID') || 'N/A',
            shares: 5,
            memberSince: 'January 2025',
            phone: '01788594010',
            email: sessionStorage.getItem('userEmail') || 'N/A',
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
        this.initializeSavingsCurve();
        this.loadProfilePicture();
        this.loadInvestmentRequests();
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('mobileMenuToggle').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => this.handlePasswordChange(e));
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

    async loadMemberData() {
        // Fetch user data from backend
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            try {
                const response = await fetch(`http://localhost:5000/auth/user-profile/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    this.memberData.name = data.fullName || this.memberData.name;
                    this.memberData.id = data.memberID || this.memberData.id;
                    this.memberData.email = data.email || this.memberData.email;
                    this.memberData.shares = data.numberOfShares || 0;
                }
            } catch (error) {
                console.error('Error loading member data:', error);
            }
        }

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

        await this.loadDashboardStats();
    }

    async loadDashboardStats() {
        const memberId = this.memberData.id;
        if (!memberId || memberId === 'N/A') return;

        try {
            const response = await fetch(`http://localhost:5000/api/monthlyshare/member-summary/${memberId}`);
            if (!response.ok) return;

            const stats = await response.json();
            this.setTextIfExists('statTotalShareValue', this.formatCurrency(stats.totalShareValue || 0));
            this.setTextIfExists('statTotalFixedDeposit', this.formatCurrency(stats.totalFixedDeposit || 0));
            this.setTextIfExists('statMonthlyDeposit', this.formatCurrency(stats.monthlyDeposit || 0));
            this.setTextIfExists('statInvestmentReceived', this.formatCurrency(stats.totalInvestmentReceived || 0));
            this.setTextIfExists('statOutstanding', this.formatCurrency(stats.totalOutstanding || 0));
            this.setTextIfExists('statInstallments', String(stats.numberOfInstallments || 0));
            this.setTextIfExists('statClosingDate', stats.closingDate || 'N/A');
        } catch (error) {
            console.error('Error loading member dashboard stats:', error);
        }
    }

    setTextIfExists(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
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
            reader.onload = async (e) => {
                const imageData = e.target.result;
                
                // Save to backend
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    this.showNotification('User not logged in', 'error');
                    return;
                }

                this.showLoading('Uploading profile picture...');
                
                try {
                    const response = await fetch('http://localhost:5000/auth/update-profile-picture', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: userId,
                            profilePicture: imageData
                        })
                    });

                    const data = await response.json();
                    this.hideLoading();

                    if (response.ok) {
                        this.setProfilePicture(imageData);
                        this.showNotification('Profile picture updated successfully', 'success');
                    } else {
                        this.showNotification(data.msg || 'Failed to update profile picture', 'error');
                    }
                } catch (error) {
                    this.hideLoading();
                    console.error('Error:', error);
                    this.showNotification('Error updating profile picture', 'error');
                }
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

    async removeProfilePicture() {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            this.showNotification('User not logged in', 'error');
            return;
        }

        this.showLoading('Removing profile picture...');
        
        try {
            const response = await fetch('http://localhost:5000/auth/update-profile-picture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    profilePicture: null
                })
            });

            const data = await response.json();
            this.hideLoading();

            if (response.ok) {
                this.setProfilePicture(null);
                document.getElementById('profilePictureInput').value = '';
                this.showNotification('Profile picture removed', 'success');
            } else {
                this.showNotification(data.msg || 'Failed to remove profile picture', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            this.showNotification('Error removing profile picture', 'error');
        }
    }

    async loadProfilePicture() {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;

        try {
            const response = await fetch(`http://localhost:5000/auth/user-profile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.profilePicture) {
                    this.setProfilePicture(data.profilePicture);
                }
            }
        } catch (error) {
            console.error('Error loading profile picture:', error);
        }
    }

    // Members Management
    async loadMembersList() {
        const membersGrid = document.getElementById('membersGrid');
        
        try {
            // Simulate MongoDB API call
            const members = await this.fetchMembersFromMongoDB();
            this.allMembers = members;
            if (membersGrid) {
                this.displayMembers(members);
            }
        } catch (error) {
            if (membersGrid) {
                membersGrid.innerHTML = '<div class="error-message">Failed to load members. Please try again later.</div>';
            }
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
        if (!membersGrid) return;
        
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
        const searchInput = document.getElementById('membersSearch');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        const filteredMembers = this.allMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) || 
            member.id.toLowerCase().includes(searchTerm)
        );
        this.displayMembers(filteredMembers);
    }

    async initializeSavingsCurve() {
        const yearSelect = document.getElementById('financialYearSelect');
        if (!yearSelect) return;

        this.savingsCurveByYear = await this.loadSavingsCurveDataFromApi();
        if (!this.savingsCurveByYear.length) {
            this.savingsCurveByYear = await this.loadSavingsCurveDataFromCsv();
        }
        if (!this.savingsCurveByYear.length) {
            this.savingsCurveByYear = this.getFallbackSavingsData();
        }

        yearSelect.innerHTML = this.savingsCurveByYear
            .map(series => `<option value="${series.yearKey}">${series.yearLabel}</option>`)
            .join('');

        const runningYear = this.savingsCurveByYear.find(series => series.status === 'running');
        this.activeCurveYear = runningYear ? runningYear.yearKey : this.savingsCurveByYear[0].yearKey;
        yearSelect.value = this.activeCurveYear;

        yearSelect.addEventListener('change', (event) => {
            this.activeCurveYear = event.target.value;
            this.renderSavingsCurve(this.activeCurveYear);
        });

        this.renderSavingsCurve(this.activeCurveYear);
    }

    async loadSavingsCurveDataFromApi() {
        const memberId = sessionStorage.getItem('memberID') || this.memberData.id;
        if (!memberId || memberId === 'N/A') return [];

        try {
            const response = await fetch(`http://localhost:5000/api/monthlyshare/member-curve/${memberId}`);
            if (!response.ok) return [];

            const payload = await response.json();
            if (!payload.curveData || payload.curveData.length === 0) {
                return [];
            }

            return payload.curveData;
        } catch (error) {
            console.error('Failed to load curve data from API:', error);
            return [];
        }
    }

    async loadSavingsCurveDataFromCsv() {
        try {
            const response = await fetch('/frontend/js/Share%20collection.csv', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Could not fetch share collection CSV');
            }

            const csvText = await response.text();
            const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
            const headerRowIndex = lines.findIndex(line => line.includes("May'") && line.includes("April'") && line.includes('Total Indivdual Savings'));
            if (headerRowIndex === -1) {
                throw new Error('Monthly header row not found in CSV');
            }

            const headers = this.parseCsvLine(lines[headerRowIndex]).map(item => item.trim());
            const monthRegex = /^(May|June|July|August|Sep|Oct|Nov|Dec|Jan|Feb|March|April)'(\d{2})$/i;
            const monthOrder = ['May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March', 'April'];

            const monthColumns = headers
                .map((label, index) => {
                    const normalized = label.replace(/\s+/g, '');
                    const matched = normalized.match(monthRegex);
                    if (!matched) return null;
                    return {
                        index,
                        rawLabel: label,
                        monthName: matched[1],
                        shortYear: parseInt(matched[2], 10)
                    };
                })
                .filter(Boolean);

            if (!monthColumns.length) {
                throw new Error('No monthly columns found');
            }

            const monthColumnsByFiscalYear = new Map();
            monthColumns.forEach(column => {
                const startYear = ['Jan', 'Feb', 'March', 'April'].includes(column.monthName)
                    ? 2000 + column.shortYear - 1
                    : 2000 + column.shortYear;

                if (!monthColumnsByFiscalYear.has(startYear)) {
                    monthColumnsByFiscalYear.set(startYear, {});
                }

                monthColumnsByFiscalYear.get(startYear)[column.monthName] = column;
            });

            const numberOfMonthsIndex = headers.findIndex(label => label.toLowerCase().replace(/\s+/g, '') === 'numberofmonths');
            const totalSavingsIndex = headers.findIndex(label => label.toLowerCase().replace(/\s+/g, '') === 'totalindivdualsavings');

            const rows = lines.slice(headerRowIndex + 1)
                .map(line => this.parseCsvLine(line))
                .filter(row => row.some(cell => (cell || '').trim() !== ''));

            const totalsRow = rows.find(row => {
                const firstCell = (row[0] || '').trim();
                const secondCell = (row[1] || '').trim();
                const hasMonthValue = monthColumns.some(col => this.parseAmount(row[col.index]) > 0);
                const hasTotalValue = totalSavingsIndex !== -1 && this.parseAmount(row[totalSavingsIndex]) > 0;
                return !firstCell && !secondCell && (hasMonthValue || hasTotalValue);
            });

            const series = Array.from(monthColumnsByFiscalYear.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([startYear, columnsByMonth]) => {
                    const endYear = startYear + 1;
                    const values = monthOrder.map(monthName => {
                        const monthColumn = columnsByMonth[monthName];
                        if (!monthColumn) return 0;

                        if (totalsRow) {
                            return this.parseAmount(totalsRow[monthColumn.index]);
                        }

                        return rows.reduce((sum, row) => sum + this.parseAmount(row[monthColumn.index]), 0);
                    });

                    const numberOfMonths = totalsRow && numberOfMonthsIndex !== -1
                        ? this.parseAmount(totalsRow[numberOfMonthsIndex])
                        : values.filter(value => value > 0).length;

                    const totalSavings = totalsRow && totalSavingsIndex !== -1
                        ? this.parseAmount(totalsRow[totalSavingsIndex])
                        : values.reduce((sum, value) => sum + value, 0);

                    const status = this.getFiscalYearStatus(startYear, endYear);

                    return {
                        yearKey: `${startYear}-${endYear}`,
                        yearLabel: `${startYear}-${endYear} (${status.label})`,
                        status: status.key,
                        monthLabels: monthOrder.map(monthName => {
                            const col = columnsByMonth[monthName];
                            return col ? col.rawLabel.trim() : `${monthName}'${String(startYear).slice(2)}`;
                        }),
                        values,
                        numberOfMonths,
                        totalSavings
                    };
                });

            return series;
        } catch (error) {
            console.error('Failed to parse savings CSV:', error);
            return [];
        }
    }

    parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const character = line[i];

            if (character === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (character === ',' && !inQuotes) {
                values.push(current);
                current = '';
                continue;
            }

            current += character;
        }

        values.push(current);
        return values;
    }

    parseAmount(value) {
        const normalized = String(value || '')
            .replace(/,/g, '')
            .replace(/[^0-9.-]/g, '');

        if (!normalized || normalized === '-') return 0;

        const amount = Number.parseFloat(normalized);
        return Number.isFinite(amount) ? amount : 0;
    }

    getFiscalYearStatus(startYear, endYear) {
        const now = new Date();
        const fiscalStart = new Date(startYear, 4, 1); // May 1
        const fiscalEnd = new Date(endYear, 3, 30, 23, 59, 59, 999); // April 30

        if (now >= fiscalStart && now <= fiscalEnd) {
            return { key: 'running', label: 'Running' };
        }
        if (now > fiscalEnd) {
            return { key: 'past', label: 'Past' };
        }

        return { key: 'upcoming', label: 'Upcoming' };
    }

    getFallbackSavingsData() {
        const values = [117000, 121000, 134000, 114000, 142000, 160000, 162000, 154000, 123000, 151000, 187000, 203000];
        return [
            {
                yearKey: '2025-2026',
                yearLabel: '2025-2026 (Running)',
                status: 'running',
                monthLabels: ["May'25", "June'25", "July'25", "August'25", "Sep'25", "Oct'25", "Nov'25", "Dec'25", "Jan'26", "Feb'26", "March'26", "April'26"],
                values,
                numberOfMonths: 12,
                totalSavings: values.reduce((sum, value) => sum + value, 0)
            }
        ];
    }

    renderSavingsCurve(yearKey) {
        const selectedSeries = this.savingsCurveByYear.find(series => series.yearKey === yearKey);
        if (!selectedSeries) return;

        document.getElementById('curveMonthCount').textContent = selectedSeries.numberOfMonths;
        document.getElementById('curveTotalSavings').textContent = this.formatCurrency(selectedSeries.totalSavings);

        this.drawCurveOnSvg(selectedSeries);
    }

    drawCurveOnSvg(series) {
        const svg = document.getElementById('savingsCurveSvg');
        if (!svg) return;

        const width = 960;
        const height = 320;
        const margin = { top: 20, right: 24, bottom: 70, left: 90 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const maxValue = Math.max(...series.values, 1);
        const niceMax = Math.max(10000, Math.ceil(maxValue / 10000) * 10000);
        const tickCount = 5;

        const xStep = chartWidth / (series.values.length - 1 || 1);
        const getX = index => margin.left + (index * xStep);
        const getY = value => margin.top + chartHeight - ((value / niceMax) * chartHeight);

        const points = series.values.map((value, index) => ({ x: getX(index), y: getY(value), value }));

        let curvePath = '';
        points.forEach((point, index) => {
            if (index === 0) {
                curvePath = `M ${point.x} ${point.y}`;
                return;
            }

            const prevPoint = points[index - 1];
            const controlX = (prevPoint.x + point.x) / 2;
            curvePath += ` C ${controlX} ${prevPoint.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
        });

        const areaPath = `${curvePath} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`;

        const yGridLines = Array.from({ length: tickCount + 1 }, (_, i) => {
            const value = (niceMax / tickCount) * i;
            const y = getY(value);
            const label = this.formatAxisValue(value);

            return `
                <line x1="${margin.left}" y1="${y}" x2="${margin.left + chartWidth}" y2="${y}" class="curve-grid-line"></line>
                <text x="${margin.left - 12}" y="${y}" class="curve-y-label" text-anchor="end" dominant-baseline="middle">${label}</text>
            `;
        }).join('');

        const xLabels = series.monthLabels.map((monthLabel, index) => {
            const x = getX(index);
            const y = margin.top + chartHeight + 20;
            return `<text x="${x}" y="${y}" class="curve-x-label" transform="rotate(-20 ${x} ${y})">${monthLabel}</text>`;
        }).join('');

        const pointsMarkup = points.map(point => `
            <circle cx="${point.x}" cy="${point.y}" r="3" class="curve-point"></circle>
            <title>${this.formatCurrency(point.value)}</title>
        `).join('');

        svg.innerHTML = `
            <defs>
                <linearGradient id="curveAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#22c55e" stop-opacity="0.2"></stop>
                    <stop offset="100%" stop-color="#22c55e" stop-opacity="0.02"></stop>
                </linearGradient>
            </defs>

            ${yGridLines}

            <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" class="curve-axis"></line>
            <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" class="curve-axis"></line>

            <path d="${areaPath}" class="curve-area"></path>
            <path d="${curvePath}" class="curve-line"></path>
            ${pointsMarkup}

            ${xLabels}
        `;
    }

    formatAxisValue(value) {
        if (value >= 1000000) {
            return `৳${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `৳${Math.round(value / 1000)}k`;
        }
        return `৳${Math.round(value)}`;
    }
    
    formatPaisaAxisValue(paisaValue) {
        const taka = paysaToTaka(paisaValue);
        if (taka >= 1000000) {
            return `৳${(taka / 1000000).toFixed(1)}M`;
        }
        if (taka >= 1000) {
            return `৳${Math.round(taka / 1000)}k`;
        }
        return `৳${Math.round(taka)}`;
    }

    formatCurrency(value) {
        return `৳${Math.round(value).toLocaleString('en-US')}`;
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

        if (sectionName === 'fixed-deposit') {
            loadFDRatesForMember();
            loadMyFDRequests();
        }

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
    async loadInvestmentRequests() {
        const investmentList = document.getElementById('investmentList');
        const userId = sessionStorage.getItem('userId');
        
        if (!userId) {
            investmentList.innerHTML = '<div class="error-message">User not logged in</div>';
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/investment-requests/my-requests/${userId}`);
            const data = await response.json();
            
            if (response.ok) {
                if (data.length === 0) {
                    investmentList.innerHTML = '<div class="no-data-message">No investment requests found. Click "New Application" to submit one.</div>';
                } else {
                    this.renderInvestmentTableWithCurve(data);
                }
            } else {
                investmentList.innerHTML = '<div class="error-message">Failed to load investment requests</div>';
            }
        } catch (error) {
            console.error('Error loading investment requests:', error);
            investmentList.innerHTML = '<div class="error-message">Error loading investment requests</div>';
        }
    }

    createInvestmentCard(request) {
        const statusClass = request.status === 'approved' ? 'approved' : request.status === 'rejected' ? 'rejected' : 'pending';
        const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
        const appDate = new Date(request.applicationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const reviewDate = request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
        
        return `
            <div class="investment-item">
                <div class="investment-header">
                    <span class="investment-id">${request.requestId}</span>
                    <span class="investment-status ${statusClass}">${statusText}</span>
                </div>
                <div class="investment-details">
                    <div class="detail-item">
                        <label>Amount Requested:</label>
                        <span>${formatPaysaAsTaka(request.amount || 0)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Purpose:</label>
                        <span>${request.purpose}</span>
                    </div>
                    <div class="detail-item">
                        <label>Duration:</label>
                        <span>${request.duration} Months</span>
                    </div>
                    <div class="detail-item">
                        <label>Application Date:</label>
                        <span>${appDate}</span>
                    </div>
                    ${request.status !== 'pending' ? `
                    <div class="detail-item">
                        <label>Status Date:</label>
                        <span>${reviewDate}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="investment-actions">
                    <button class="btn btn-sm" onclick="viewInvestment('${request._id}')">
                        View Details
                    </button>
                    ${request.status === 'pending' ? `
                    <button class="btn btn-sm" onclick="deleteInvestmentRequest('${request._id}')" style="background: var(--danger-red); margin-left: 0.5rem;">
                        Delete
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    parseImportedInvestmentMeta(adminNote = '') {
        const text = String(adminNote || '');
        const parsePaisa = (key) => {
            const match = text.match(new RegExp(`${key}=([0-9]+)`));
            return match ? parseInt(match[1], 10) : 0;
        };

        return {
            totalRecoveryPaisa: parsePaisa('totalRecoveryPaisa'),
            outstandingPaisa: parsePaisa('outstandingPaisa'),
            totalPayablePaisa: parsePaisa('totalPayablePaisa'),
            monthlyInstallmentPaisa: parsePaisa('monthlyInstallmentPaisa')
        };
    }

    renderInvestmentTableWithCurve(requests) {
        const investmentList = document.getElementById('investmentList');
        if (!investmentList) return;

        const sorted = [...requests].sort(
            (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
        );

        const rowsHtml = sorted.map(request => {
            const statusClass = request.status === 'approved' ? 'approved' : request.status === 'rejected' ? 'rejected' : 'pending';
            const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
            const appDate = new Date(request.applicationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const meta = this.parseImportedInvestmentMeta(request.adminNote);

            return `
                <tr>
                    <td>${request.requestId || '-'}</td>
                    <td>${appDate}</td>
                    <td>${request.purpose || '-'}</td>
                    <td>${formatPaysaAsTaka(request.amount || 0)}</td>
                    <td>${request.duration || 0}</td>
                    <td><span class="investment-status ${statusClass}">${statusText}</span></td>
                    <td>${formatPaysaAsTaka(meta.totalRecoveryPaisa)}</td>
                    <td>${formatPaysaAsTaka(meta.outstandingPaisa)}</td>
                    <td>
                        <button class="btn btn-sm" onclick="viewInvestment('${request._id}')">View</button>
                    </td>
                </tr>
            `;
        }).join('');

        investmentList.innerHTML = `
            <div class="investment-table-wrap">
                <table class="investment-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Approval Amount</th>
                            <th>Installments</th>
                            <th>Status</th>
                            <th>Total Recovery</th>
                            <th>Outstanding</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            <div class="investment-curve-wrap">
                <h3>Investment Trend</h3>
                <svg id="investmentCurveSvg" viewBox="0 0 960 280" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
        `;

        this.drawInvestmentCurve(sorted);
    }

    drawInvestmentCurve(requests) {
        const svg = document.getElementById('investmentCurveSvg');
        if (!svg) return;

        const byMonth = new Map();
        requests.forEach(request => {
            const date = new Date(request.applicationDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            byMonth.set(key, (byMonth.get(key) || 0) + (request.amount || 0));
        });

        const pointsData = Array.from(byMonth.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value]) => {
                const [year, month] = key.split('-').map(Number);
                const date = new Date(year, month - 1, 1);
                const label = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
                return { label, value };
            });

        if (pointsData.length === 0) {
            svg.innerHTML = '';
            return;
        }

        const width = 960;
        const height = 280;
        const margin = { top: 20, right: 24, bottom: 56, left: 86 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const max = Math.max(...pointsData.map(item => item.value), 1);
        const niceMax = Math.ceil(max / 100000) * 100000;
        const xStep = chartWidth / (pointsData.length - 1 || 1);

        const getX = (index) => margin.left + index * xStep;
        const getY = (value) => margin.top + chartHeight - ((value / niceMax) * chartHeight);

        const points = pointsData.map((item, index) => ({
            x: getX(index),
            y: getY(item.value),
            label: item.label,
            value: item.value
        }));

        let path = '';
        points.forEach((point, index) => {
            if (index === 0) {
                path = `M ${point.x} ${point.y}`;
            } else {
                const prev = points[index - 1];
                const controlX = (prev.x + point.x) / 2;
                path += ` C ${controlX} ${prev.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
            }
        });

        const areaPath = `${path} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`;
        const yTicks = 4;
        const yGrid = Array.from({ length: yTicks + 1 }, (_, i) => {
            const value = (niceMax / yTicks) * i;
            const y = getY(value);
            return `
                <line x1="${margin.left}" y1="${y}" x2="${margin.left + chartWidth}" y2="${y}" class="curve-grid-line"></line>
                <text x="${margin.left - 10}" y="${y}" class="curve-y-label" text-anchor="end" dominant-baseline="middle">${this.formatPaisaAxisValue(value)}</text>
            `;
        }).join('');

        const xLabels = points.map(point => `
            <text x="${point.x}" y="${margin.top + chartHeight + 20}" class="curve-x-label" text-anchor="middle">${point.label}</text>
        `).join('');

        const circles = points.map(point => `
            <circle cx="${point.x}" cy="${point.y}" r="3" class="curve-point"></circle>
            <title>${formatPaysaAsTaka(point.value)}</title>
        `).join('');

        svg.innerHTML = `
            <defs>
                <linearGradient id="investmentCurveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.22"></stop>
                    <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.03"></stop>
                </linearGradient>
            </defs>
            ${yGrid}
            <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" class="curve-axis"></line>
            <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" class="curve-axis"></line>
            <path d="${areaPath}" fill="url(#investmentCurveFill)"></path>
            <path d="${path}" class="curve-line" style="stroke:#0ea5e9;"></path>
            ${circles}
            ${xLabels}
        `;
    }

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
                                <input type="number" id="investmentAmount" name="amount" min="1000" required>
                            </div>
                            <div class="form-group">
                                <label>Purpose</label>
                                <input type="text" id="investmentPurpose" name="purpose" required>
                            </div>
                            <div class="form-group">
                                <label>Duration (Months)</label>
                                <select id="investmentDuration" name="duration" required>
                                    <option value="">Loading durations...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Bank Name</label>
                                <input type="text" id="bankName" name="bankName" required>
                            </div>
                            <div class="form-group">
                                <label>Bank Branch</label>
                                <input type="text" id="bankBranch" name="bankBranch" required>
                            </div>
                            <div class="form-group">
                                <label>Bank Account No.</label>
                                <input type="text" id="bankAccountNo" name="bankAccountNo" required>
                            </div>
                            <div class="form-group">
                                <label>Bank Account Type</label>
                                <select id="bankAccountType" name="bankAccountType" required>
                                    <option value="">Select Account Type</option>
                                    <option value="Savings">Savings</option>
                                    <option value="Current">Current</option>
                                    <option value="Fixed Deposit">Fixed Deposit</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Guarantor Name</label>
                                <input type="text" id="guarantorName" name="guarantorName" required>
                            </div>
                            <div class="form-group">
                                <label>Guarantor Phone</label>
                                <input type="tel" id="guarantorPhone" name="guarantorPhone" required>
                            </div>
                            <div class="form-group">
                                <label>Guarantor Relationship</label>
                                <input type="text" id="guarantorRelationship" name="guarantorRelationship" required>
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
        
        // Load interest rates and populate duration dropdown
        this.loadInterestRatesForDropdown();
    }

    async loadInterestRatesForDropdown() {
        try {
            const response = await fetch('http://localhost:5000/api/interest-rates/all');
            const data = await response.json();
            
            const durationDropdown = document.getElementById('investmentDuration');
            
            if (response.ok && data.success && data.interestRates.length > 0) {
                // Clear loading message
                durationDropdown.innerHTML = '<option value="">Select Duration</option>';
                
                // Add options for each interest rate
                data.interestRates.forEach(rate => {
                    const option = document.createElement('option');
                    option.value = rate.duration;
                    option.setAttribute('data-interest-rate', rate.interestRate);
                    option.textContent = `${rate.duration} Months (${rate.interestRate}%)`;
                    durationDropdown.appendChild(option);
                });
            } else {
                // If no interest rates configured, show error
                durationDropdown.innerHTML = '<option value="">No durations configured by admin</option>';
                this.showError('No investment durations have been configured. Please contact administrator.');
            }
        } catch (error) {
            console.error('Error loading interest rates:', error);
            const durationDropdown = document.getElementById('investmentDuration');
            durationDropdown.innerHTML = '<option value="">Error loading durations</option>';
            this.showError('Failed to load duration options. Please try again.');
        }
    }

    async viewInvestment(investmentId) {
        this.showLoading('Loading details...');
        
        try {
            const response = await fetch(`http://localhost:5000/api/investment-requests/${investmentId}`);
            const data = await response.json();
            
            this.hideLoading();
            
            if (response.ok) {
                const appDate = new Date(data.applicationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const reviewDate = data.reviewedAt ? new Date(data.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                const statusColor = data.status === 'approved' ? 'var(--primary-green)' : data.status === 'rejected' ? 'var(--danger-red)' : 'var(--warning-orange)';
                
                const modalHTML = `
                    <div class="modal-overlay" onclick="closeModal()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h3>Investment Details - ${data.requestId}</h3>
                                <button onclick="closeModal()" class="modal-close">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                    <div><strong>Amount:</strong> ৳${data.amount.toLocaleString()}</div>
                                    <div><strong>Purpose:</strong> ${data.purpose}</div>
                                    <div><strong>Status:</strong> <span style="color: ${statusColor};">${data.status.toUpperCase()}</span></div>
                                    <div><strong>Duration:</strong> ${data.duration} Months</div>
                                    <div><strong>Application Date:</strong> ${appDate}</div>
                                    ${data.reviewedAt ? `<div><strong>Review Date:</strong> ${reviewDate}</div>` : ''}
                                </div>
                                <div style="margin-top: 1.5rem;">
                                    <strong>Bank Details:</strong>
                                    <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                                        <p><strong>Bank Name:</strong> ${data.bankName}</p>
                                        <p><strong>Branch:</strong> ${data.bankBranch}</p>
                                        <p><strong>Account No:</strong> ${data.bankAccountNo}</p>
                                        <p><strong>Account Type:</strong> ${data.bankAccountType}</p>
                                    </div>
                                </div>
                                <div style="margin-top: 1rem;">
                                    <strong>Guarantor Information:</strong>
                                    <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                                        <p><strong>Name:</strong> ${data.guarantor.name}</p>
                                        <p><strong>Phone:</strong> ${data.guarantor.phone}</p>
                                        <p><strong>Relationship:</strong> ${data.guarantor.relationship}</p>
                                    </div>
                                </div>
                                ${data.adminNote ? `
                                <div style="margin-top: 1rem;">
                                    <strong>Admin Note:</strong>
                                    <p style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${data.adminNote}</p>
                                </div>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button onclick="closeModal()" class="btn btn-primary">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                this.showModal(modalHTML);
            } else {
                this.showNotification('Failed to load investment details', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error viewing investment:', error);
            this.showNotification('Error loading investment details', 'error');
        }
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
    async handlePasswordChange(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('modalCurrentPassword').value;
        const newPassword = document.getElementById('modalNewPassword').value;
        const confirmPassword = document.getElementById('modalConfirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            this.showNotification('User not logged in', 'error');
            return;
        }

        this.showLoading('Changing password...');
        
        try {
            const response = await fetch('http://localhost:5000/auth/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    oldPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const data = await response.json();
            this.hideLoading();

            if (response.ok) {
                this.showNotification('Password changed successfully', 'success');
                document.getElementById('changePasswordForm').reset();
                closeChangePasswordModal();
            } else {
                this.showNotification(data.msg || 'Failed to change password', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error:', error);
            this.showNotification('Error changing password', 'error');
        }
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
function sendMessage() { dashboard.sendMessage(); }
function startNewComplaint() { dashboard.startNewComplaint(); }
function toggleMobileMenu() { dashboard.toggleMobileMenu(); }

// Change Password Modal Functions
function openChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('changePasswordForm').reset();
}

// Modal Functions
function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
    document.body.style.overflow = 'auto';
}

function submitInvestmentApplication() {
    const form = document.getElementById('newInvestmentForm');
    const formData = new FormData(form);
    
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
        dashboard.showNotification('User not logged in', 'error');
        return;
    }
    
    const requestData = {
        userId: userId,
        amount: takaToPaysa(formData.get('amount')),  // Convert taka → paisa
        purpose: formData.get('purpose'),
        duration: parseInt(formData.get('duration')),
        bankName: formData.get('bankName'),
        bankBranch: formData.get('bankBranch'),
        bankAccountNo: formData.get('bankAccountNo'),
        bankAccountType: formData.get('bankAccountType'),
        guarantor: {
            name: formData.get('guarantorName'),
            phone: formData.get('guarantorPhone'),
            relationship: formData.get('guarantorRelationship')
        }
    };
    
    dashboard.showLoading('Submitting application...');
    
    fetch('http://localhost:5000/api/investment-requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        dashboard.hideLoading();
        if (data.message) {
            closeModal();
            dashboard.showNotification(data.message, 'success');
            dashboard.loadInvestmentRequests();
        } else {
            dashboard.showNotification('Failed to submit application', 'error');
        }
    })
    .catch(error => {
        dashboard.hideLoading();
        console.error('Error:', error);
        dashboard.showNotification('Error submitting application', 'error');
    });
}

function deleteInvestmentRequest(requestId) {
    if (!confirm('Are you sure you want to delete this investment application? This action cannot be undone.')) {
        return;
    }

    dashboard.showLoading('Deleting application...');
    
    fetch(`http://localhost:5000/api/investment-requests/${requestId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        dashboard.hideLoading();
        if (data.message) {
            dashboard.showNotification('Application deleted successfully', 'success');
            // Reload investment list
            dashboard.loadInvestmentRequests();
        } else {
            dashboard.showNotification('Failed to delete application', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting application:', error);
        dashboard.hideLoading();
        dashboard.showNotification('Error deleting application', 'error');
    });
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
    if (e.altKey && e.key >= '1' && e.key <= '7') {
        const sections = ['dashboard', 'profile', 'investment', 'reports', 'board', 'committee', 'notices', 'chat'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) dashboard.showSection(sections[index]);
    }
    if (e.key === 'Escape') {
        closeModal();
        closeChangePasswordModal();
    }
});

function logoRefresh() {
    window.location.href = 'index.html';
}

// ================================================================
// FIXED DEPOSIT — MEMBER SIDE
// ================================================================
const FD_API = 'http://localhost:5000/api/fixed-deposit';
const FDR_RATES_API = 'http://localhost:5000/api/fdr-rates';
let _fdrRatesCache = [];

async function loadFDRatesForMember() {
    const sel = document.getElementById('fdProposedDuration');
    if (!sel) return;
    try {
        const res  = await fetch(FDR_RATES_API);
        const data = await res.json();
        _fdrRatesCache = data.success ? data.rates : [];
    } catch(e) {
        _fdrRatesCache = [];
    }
    const currentVal = sel.value;
    if (_fdrRatesCache.length === 0) {
        sel.innerHTML = '<option value="">-- No durations configured yet --</option>';
    } else {
        sel.innerHTML = '<option value="">-- Select Duration --</option>' +
            _fdrRatesCache.map(r => `<option value="${r.months}" data-rate="${r.rate}">${r.months} Months (${r.rate}% p.a.)</option>`).join('');
        if (currentVal) sel.value = currentVal;
    }
    updateFDPreview();
}

function updateFDPreview() {
    const sel     = document.getElementById('fdProposedDuration');
    const amtInp  = document.getElementById('fdAmount');
    const preview = document.getElementById('fdInterestPreview');
    if (!sel || !amtInp || !preview) return;

    const months  = parseInt(sel.value);
    const amount  = parseFloat(amtInp.value);
    const opt     = sel.options[sel.selectedIndex];
    const rate    = opt ? parseFloat(opt.getAttribute('data-rate')) : NaN;

    if (!months || !amount || amount <= 0 || isNaN(rate)) {
        preview.style.display = 'none';
        return;
    }

    const interest = amount * (rate / 100) * (months / 12);
    const total    = amount + interest;
    const fmt = n => '৳' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('fdPreviewInterest').textContent = fmt(interest);
    document.getElementById('fdPreviewTotal').textContent    = fmt(total);
    document.getElementById('fdPreviewMeta').textContent     = `Based on ${rate}% p.a. for ${months} months (simple interest)`;
    preview.style.display = 'block';
}

window.updateFDPreview = updateFDPreview;

function fdStatusBadge(status) {
    const map = {
        pending:           { label: 'Pending',           color: '#f59e0b', bg: '#fef3c7' },
        acknowledged:      { label: 'Acknowledged',      color: '#2563eb', bg: '#dbeafe' },
        rejected:          { label: 'Rejected',          color: '#dc2626', bg: '#fee2e2' },
        payment_submitted: { label: 'Payment Submitted', color: '#7c3aed', bg: '#ede9fe' },
        entry_confirmed:   { label: 'Waiting for Authorization', color: '#b45309', bg: '#fef9c3' },
        completed:         { label: 'Completed',         color: '#16a34a', bg: '#dcfce7' },
        cancelled:         { label: 'Cancelled',         color: '#dc2626', bg: '#fee2e2' },
    };
    const s = map[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
    return `<span style="background:${s.bg};color:${s.color};padding:3px 10px;border-radius:99px;font-size:0.8rem;font-weight:600;">${s.label}</span>`;
}

async function submitFDRequest() {
    const errDiv = document.getElementById('fdFormError');
    errDiv.style.display = 'none';
    const duration = document.getElementById('fdProposedDuration').value.trim();
    const amountTaka = document.getElementById('fdAmount').value.trim();
    const comment = document.getElementById('fdMemberComment').value.trim();
    const userId = sessionStorage.getItem('userId');

    if (!duration || parseInt(duration) < 1) { errDiv.textContent = 'Please select a duration.'; errDiv.style.display = 'block'; return; }
    if (!amountTaka || parseFloat(amountTaka) <= 0) { errDiv.textContent = 'Amount is required and must be greater than 0.'; errDiv.style.display = 'block'; return; }

    try {
        const res = await fetch(FD_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, proposedDuration: parseInt(duration), amount: takaToPaysa(parseFloat(amountTaka)), memberComment: comment })
        });
        const data = await res.json();
        if (!data.success) { errDiv.textContent = data.message; errDiv.style.display = 'block'; return; }
        document.getElementById('fdProposedDuration').value = '';
        document.getElementById('fdAmount').value = '';
        document.getElementById('fdMemberComment').value = '';
        const preview = document.getElementById('fdInterestPreview');
        if (preview) preview.style.display = 'none';
        dashboard.showNotification('Fixed deposit request submitted successfully!', 'success');
        loadMyFDRequests();
    } catch (err) {
        errDiv.textContent = 'Error submitting request. Please try again.';
        errDiv.style.display = 'block';
    }
}

async function loadMyFDRequests() {
    const container = document.getElementById('fdMyRequestsList');
    if (!container) return;
    container.innerHTML = '<p style="color:#999;">Loading...</p>';
    const userId = sessionStorage.getItem('userId');
    try {
        const res = await fetch(`${FD_API}/member/${userId}`);
        const data = await res.json();
        if (!data.success || data.requests.length === 0) {
            container.innerHTML = '<p style="color:#999;">No fixed deposit requests yet.</p>';
            return;
        }
        container.innerHTML = data.requests.map(r => {
            const amountTaka = (r.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const date = new Date(r.createdAt).toLocaleDateString('en-GB');

            // Acknowledgement info box
            let ackBox = '';
            if (r.status === 'acknowledged' || r.status === 'payment_submitted' || r.status === 'entry_confirmed' || r.status === 'completed') {
                ackBox = `
                <div style="background:#dbeafe;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #2563eb;">
                  <strong style="color:#1d4ed8;">✅ Admin Acknowledged</strong><br>
                  <span>Approved Duration: <b>${r.acknowledgedDuration} months</b></span> &nbsp;|&nbsp;
                  <span>Interest Rate: <b>${r.interestRate}%</b></span>
                  ${r.adminComment ? `<br><span style="color:#374151;">Admin Note: ${r.adminComment}</span>` : ''}
                </div>`;
            }
            if (r.status === 'rejected') {
                ackBox = `
                <div style="background:#fee2e2;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #dc2626;">
                  <strong style="color:#dc2626;">❌ Rejected</strong>
                  ${r.rejectionReason ? `<br><span style="color:#374151;">Reason: ${r.rejectionReason}</span>` : ''}
                </div>`;
            }
            if (r.status === 'cancelled') {
                ackBox = `
                <div style="background:#fee2e2;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #dc2626;">
                  <strong style="color:#dc2626;">🚫 Your Fixed Deposit has been Cancelled</strong>
                  <br><span style="color:#374151;">This FD request was cancelled by the admin after data entry. Please contact the office for more information.</span>
                </div>`;
            }

            // Payment form (only if acknowledged and not yet submitted)
            let paymentSection = '';
            if (r.status === 'acknowledged') {
                paymentSection = `
                <div style="background:#f0fdf4;border-radius:8px;padding:14px 16px;margin-top:12px;border:1px solid #bbf7d0;">
                  <strong style="color:#15803d;">💳 Submit Payment Details</strong>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;" class="fd-form-grid">
                    <div>
                      <label style="font-size:0.85rem;font-weight:600;">Payment Method <span style="color:red;">*</span></label>
                      <select id="fdPayMethod_${r._id}" onchange="_fdToggleDocReq('${r._id}')" style="width:100%;padding:6px;border:1px solid #d1d5db;border-radius:6px;margin-top:4px;">
                        <option value="">-- Select --</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="hand_cash">Hand Cash</option>
                        <option value="mobile_banking">Mobile Banking</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size:0.85rem;font-weight:600;">Transaction ID</label>
                      <input type="text" id="fdTransId_${r._id}" placeholder="Optional" style="width:100%;padding:6px;border:1px solid #d1d5db;border-radius:6px;margin-top:4px;" />
                    </div>
                    <div style="grid-column:1/-1;">
                      <label style="font-size:0.85rem;font-weight:600;">Comment</label>
                      <input type="text" id="fdPayComment_${r._id}" placeholder="Optional" style="width:100%;padding:6px;border:1px solid #d1d5db;border-radius:6px;margin-top:4px;" />
                    </div>
                    <div style="grid-column:1/-1;" id="fdPayDocWrap_${r._id}">
                      <label style="font-size:0.85rem;font-weight:600;">Payment Document / Screenshot <span id="fdPayDocReqMark_${r._id}" style="color:red;">*</span></label>
                      <div id="fdPayDocNote_${r._id}" style="display:none;font-size:0.8rem;color:#6b7280;margin-top:2px;">(Not required for hand cash)</div>
                      <input type="file" id="fdPayDoc_${r._id}" accept="image/*,.pdf" style="width:100%;margin-top:4px;" />
                    </div>
                  </div>
                  <div id="fdPayError_${r._id}" style="display:none;color:red;font-size:0.85rem;margin-top:6px;"></div>
                  <button class="btn btn-primary" onclick="submitFDPayment('${r._id}')" style="margin-top:10px;">📤 Submit Payment</button>
                </div>`;
            }
            if (r.status === 'payment_submitted') {
                const methodLabel = { bank: 'Bank Transfer', hand_cash: 'Hand Cash', mobile_banking: 'Mobile Banking' }[r.paymentMethod] || r.paymentMethod;
                paymentSection = `
                <div style="background:#ede9fe;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #7c3aed;">
                  <strong style="color:#6d28d9;">🕐 Payment Submitted — Awaiting Admin Confirmation</strong><br>
                  Method: <b>${methodLabel}</b>
                  ${r.transactionId ? ` | Transaction ID: <b>${r.transactionId}</b>` : ''}
                  ${r.paymentComment ? `<br>Comment: ${r.paymentComment}` : ''}
                </div>`;
            }
            if (r.status === 'entry_confirmed') {
                const methodLabel = { bank: 'Bank Transfer', hand_cash: 'Hand Cash', mobile_banking: 'Mobile Banking' }[r.paymentMethod] || r.paymentMethod;
                paymentSection = `
                <div style="background:#ede9fe;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #7c3aed;">
                  <strong style="color:#6d28d9;">✅ Payment Confirmed</strong><br>
                  Method: <b>${methodLabel}</b>
                  ${r.transactionId ? ` | Transaction ID: <b>${r.transactionId}</b>` : ''}
                </div>
                <div style="background:#fef9c3;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #ca8a04;">
                  <strong style="color:#b45309;">⏳ Waiting for Authorization</strong><br>
                  <span style="color:#78350f;">Your payment has been entered in the system and is awaiting final authorization by the admin.</span>
                </div>`;
            }
            if (r.status === 'completed') {
                paymentSection = `
                <div style="background:#dcfce7;border-radius:8px;padding:12px 16px;margin-top:10px;border-left:4px solid #16a34a;">
                  <strong style="color:#15803d;">✅ Completed — Your Fixed Deposit is active!</strong>
                </div>`;
            }

            return `
            <div style="background:var(--white);border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1rem;box-shadow:0 2px 8px var(--shadow);border-left:4px solid #2563eb;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                <div>
                  <span style="font-family:monospace;color:#2563eb;font-weight:700;">${r.requestId}</span>
                  <span style="margin-left:10px;">${fdStatusBadge(r.status)}</span>
                </div>
                <span style="color:#6b7280;font-size:0.85rem;">${date}</span>
              </div>
              <div style="margin-top:8px;display:flex;gap:24px;flex-wrap:wrap;">
                <span>Amount: <b>৳${amountTaka}</b></span>
                <span>Proposed Duration: <b>${r.proposedDuration} months</b></span>
              </div>
              ${r.memberComment ? `<p style="margin-top:6px;color:#6b7280;font-size:0.85rem;">Your note: ${r.memberComment}</p>` : ''}
              ${ackBox}
              ${paymentSection}
            </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:#c00;">Failed to load requests.</p>';
    }
}

async function submitFDPayment(requestId) {
    const errDiv = document.getElementById(`fdPayError_${requestId}`);
    errDiv.style.display = 'none';
    const method = document.getElementById(`fdPayMethod_${requestId}`).value;
    const transId = document.getElementById(`fdTransId_${requestId}`).value.trim();
    const comment = document.getElementById(`fdPayComment_${requestId}`).value.trim();
    const fileInput = document.getElementById(`fdPayDoc_${requestId}`);

    if (!method) { errDiv.textContent = 'Payment method is required.'; errDiv.style.display = 'block'; return; }
    if (method !== 'hand_cash' && !fileInput.files[0]) { errDiv.textContent = 'Payment document / screenshot is required.'; errDiv.style.display = 'block'; return; }

    const docBase64 = fileInput.files[0] ? await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(fileInput.files[0]);
    }) : null;

    try {
        const res = await fetch(`${FD_API}/${requestId}/payment`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentMethod: method, transactionId: transId, paymentComment: comment, paymentDocument: docBase64 })
        });
        const data = await res.json();
        if (!data.success) { errDiv.textContent = data.message; errDiv.style.display = 'block'; return; }
        dashboard.showNotification('Payment details submitted successfully!', 'success');
        loadMyFDRequests();
    } catch (err) {
        errDiv.textContent = 'Error submitting payment. Please try again.';
        errDiv.style.display = 'block';
    }
}

function _fdToggleDocReq(id) {
    const method  = document.getElementById(`fdPayMethod_${id}`)?.value;
    const mark    = document.getElementById(`fdPayDocReqMark_${id}`);
    const note    = document.getElementById(`fdPayDocNote_${id}`);
    const isHand  = method === 'hand_cash';
    if (mark) mark.style.display = isHand ? 'none' : 'inline';
    if (note) note.style.display = isHand ? 'block' : 'none';
}
window._fdToggleDocReq = _fdToggleDocReq;

window.submitFDRequest = submitFDRequest;
window.loadMyFDRequests = loadMyFDRequests;
window.submitFDPayment = submitFDPayment;
window.loadFDRatesForMember = loadFDRatesForMember;
