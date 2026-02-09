// Monthly Share Deposit Functions with Dropdown & Search
// Note: API_BASE_URL is declared in admindashboard.js

// ========================================
// PAISA CONVERSION UTILITIES
// ========================================
function takaToPaysa(taka) {
    return Math.round(parseFloat(taka) * 100);
}

function paysaToTaka(paisa) {
    return paisa / 100;
}

function formatPaysaAsTaka(paisa, decimals = 2) {
    const taka = paysaToTaka(paisa);
    return `৳${taka.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}
// ========================================

// Share price constant (1000 paisa per share = ৳10.00)
const SHARE_PRICE_PAISA = 100000; // ৳1000 in paisa

let currentSelectedMember = null;
let allMembers = [];

// Load all members into dropdown
async function loadMembersDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/monthlyshare/all-members`);
        const members = await response.json();
        allMembers = members;
        
        const dropdown = document.getElementById('memberShareDropdown');
        dropdown.innerHTML = '<option value="">-- Select a Member --</option>';
        
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.memberID;
            option.textContent = `${member.memberID} - ${member.fullName} (${member.numberOfShares} shares)`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading members:', error);
        showShareNotification('Failed to load members list', 'error');
    }
}

// Select member from dropdown
function selectMemberFromDropdown() {
    const dropdown = document.getElementById('memberShareDropdown');
    const memberId = dropdown.value;
    
    if (!memberId) {
        // Clear displays
        document.getElementById('memberDetailsDisplay').style.display = 'none';
        document.getElementById('monthlyShareFormContainer').style.display = 'none';
        document.getElementById('memberIdSearch').value = '';
        currentSelectedMember = null;
        return;
    }
    
    // Find member in allMembers array
    const member = allMembers.find(m => m.memberID === memberId);
    if (member) {
        currentSelectedMember = member;
        displayMemberDetails(member);
        showShareForm(member);
        // Clear manual search
        document.getElementById('memberIdSearch').value = '';
    }
}

// Search member by ID
async function searchMemberById() {
    const memberId = document.getElementById('memberIdSearch').value.trim();
    
    if (!memberId) {
        showShareNotification('Please enter a Member ID', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/monthlyshare/validate-member/${memberId}`);
        
        if (response.ok) {
            const member = await response.json();
            currentSelectedMember = member;
            displayMemberDetails(member);
            showShareForm(member);
            
            // Select in dropdown if exists
            const dropdown = document.getElementById('memberShareDropdown');
            dropdown.value = memberId;
        } else {
            showShareNotification('Member ID not found', 'error');
            document.getElementById('memberDetailsDisplay').style.display = 'none';
            document.getElementById('monthlyShareFormContainer').style.display = 'none';
        }
    } catch (error) {
        console.error('Error searching member:', error);
        showShareNotification('Error searching for member', 'error');
    }
}

// Display member details with picture
function displayMemberDetails(member) {
    const profilePictureHTML = member.profilePicture 
        ? `<img src="${member.profilePicture}" alt="${member.fullName}" style="width: 100%; height: 100%; object-fit: cover;" />`
        : `<div style="width: 100%; height: 100%; background: var(--primary-green); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold;">
               ${member.fullName.charAt(0).toUpperCase()}
           </div>`;
    
    const shareValue = member.numberOfShares * SHARE_PRICE_PAISA;
    
    const detailsHTML = `
        <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border: 2px solid var(--primary-green); margin-bottom: 1.5rem; display: flex; gap: 1.5rem;">
            <!-- Profile Picture -->
            <div style="flex-shrink: 0;">
                <div style="width: 150px; height: 150px; border-radius: 8px; overflow: hidden; border: 3px solid var(--primary-green); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ${profilePictureHTML}
                </div>
                <div style="text-align: center; margin-top: 0.5rem; font-weight: bold; color: var(--primary-green);">
                    ${member.fullName}
                </div>
                <div style="text-align: center; font-size: 0.9rem; color: #666;">
                    ${member.memberID}
                </div>
            </div>
            
            <!-- Member Details -->
            <div style="flex: 1;">
                <h4 style="color: var(--primary-green); margin: 0 0 1rem 0;">Member Share Information</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 0.95rem;">
                    <div><strong>Member ID:</strong> ${member.memberID}</div>
                    <div><strong>Full Name:</strong> ${member.fullName}</div>
                    <div><strong>Number of Shares:</strong> ${member.numberOfShares} shares</div>
                    <div><strong>Share Price:</strong> ${formatPaysaAsTaka(SHARE_PRICE_PAISA, 0)} per share</div>
                    <div style="grid-column: 1 / -1;">
                        <strong>Total Share Value:</strong> 
                        <span style="color: var(--primary-green); font-size: 1.2rem; font-weight: bold;">
                            ${formatPaysaAsTaka(shareValue)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('memberDetailsDisplay').innerHTML = detailsHTML;
    document.getElementById('memberDetailsDisplay').style.display = 'block';
}

// Show share deposit form
function showShareForm(member) {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Calculate default amount (share value in taka)
    const shareValuePaisa = member.numberOfShares * SHARE_PRICE_PAISA;
    const shareValueTaka = Math.round(paysaToTaka(shareValuePaisa));
    
    const formHTML = `
        <div style="background: #fff3cd; padding: 1.5rem; border-radius: 8px; border: 2px solid #856404;">
            <h4 style="color: #856404; margin: 0 0 1rem 0;">Record Share Deposit</h4>
            
            <form id="monthlyShareForm" onsubmit="submitShareDeposit(event)">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Month *</label>
                        <input 
                            type="month" 
                            id="shareMonth" 
                            value="${currentMonth}"
                            max="${currentMonth}"
                            required
                            style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                        />
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Date *</label>
                        <input 
                            type="date" 
                            id="shareDate" 
                            value="${today}"
                            max="${today}"
                            required
                            style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                        />
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Amount (৳) *</label>
                    <input 
                        type="number" 
                        id="shareAmount" 
                        value="${shareValueTaka}"
                        min="1"
                        step="1"
                        required
                        style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px;"
                    />
                    <small style="color: #666;">Default: ${member.numberOfShares} shares × ৳1,000 = ৳${shareValueTaka.toLocaleString()}, you can modify</small>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Remarks (Optional)</label>
                    <textarea 
                        id="shareRemarks" 
                        rows="3" 
                        placeholder="Enter any additional notes..."
                        style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-gray); border-radius: 8px; font-family: inherit; resize: vertical;"
                    ></textarea>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" onclick="clearShareForm()" class="btn btn-secondary" style="padding: 0.75rem 1.5rem;">Clear</button>
                    <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">Submit for Authorization</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('monthlyShareFormContainer').innerHTML = formHTML;
    document.getElementById('monthlyShareFormContainer').style.display = 'block';
}

// Submit share deposit
async function submitShareDeposit(event) {
    event.preventDefault();
    
    if (!currentSelectedMember) {
        showShareNotification('Please select a member first', 'error');
        return;
    }
    
    const month = document.getElementById('shareMonth').value;
    const date = document.getElementById('shareDate').value;
    const amountInput = document.getElementById('shareAmount').value;
    const amount = takaToPaysa(amountInput); // Convert to paisa
    const remarks = document.getElementById('shareRemarks')?.value.trim() || '';
    
    if (!month || !date || !amountInput) {
        showShareNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showShareNotification('Amount must be greater than 0', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/monthlyshare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: currentSelectedMember.memberID,
                amount: amount,  // In paisa
                month: month,
                date: date,
                remarks: remarks,
                entryBy: sessionStorage.getItem('userName') || 'Admin'
            })
        });
        
        if (response.ok) {
            showShareNotification('Share deposit entry created successfully! Status: Pending', 'success');
            clearShareForm();
            loadMonthlyShareEntries();
        } else {
            const error = await response.json();
            showShareNotification('Failed to save entry: ' + error.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting share deposit:', error);
        showShareNotification('Error submitting entry', 'error');
    }
}

// Clear form
function clearShareForm() {
    currentSelectedMember = null;
    document.getElementById('memberShareDropdown').value = '';
    document.getElementById('memberIdSearch').value = '';
    document.getElementById('memberDetailsDisplay').style.display = 'none';
    document.getElementById('monthlyShareFormContainer').style.display = 'none';
}

// Load monthly share entries when section is shown
function loadMonthlyShareEntries() {
    fetch(`${API_BASE_URL}/api/monthlyshare`)
        .then(response => response.json())
        .then(data => {
            displayMonthlyShareEntries(data);
        })
        .catch(error => {
            console.error('Error loading monthly share entries:', error);
            showShareNotification('Failed to load entries', 'error');
        });
}

// Display monthly share entries in table
function displayMonthlyShareEntries(entries) {
    const tbody = document.getElementById('monthlyShareTableBody');
    if (!tbody) return;

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No entries found</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-GB');
        const statusColor = entry.status === 'Authorized' ? 'green' : 'orange';
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding:10px;">${entry.memberName}</td>
                <td style="padding:10px;">${entry.memberId}</td>
                <td style="padding:10px;">${formatPaysaAsTaka(entry.amount)}</td>
                <td style="padding:10px;">${entry.month}</td>
                <td style="padding:10px;">${date}</td>
                <td style="padding:10px;">
                    <span style="color:${statusColor}; font-weight:600;">${entry.status}</span>
                </td>
            </tr>
        `;
    }).join('');
}

// Helper function to show notifications
function showShareNotification(message, type) {
    if (typeof dashboard !== 'undefined' && dashboard.showNotification) {
        dashboard.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Initialize when monthly share section is shown
document.addEventListener('DOMContentLoaded', function() {
    // Load members when page loads
    loadMembersDropdown();
    
    // Override showSection to load data when section changes
    const originalShowSection = window.showSection;
    if (originalShowSection) {
        window.showSection = function(sectionId) {
            originalShowSection(sectionId);
            
            if (sectionId === 'monthly-share-deposit') {
                loadMembersDropdown();
                loadMonthlyShareEntries();
            }
        };
    }
});
