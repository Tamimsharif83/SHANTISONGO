// Monthly Share Deposit Functions
// Note: API_BASE_URL is declared in admindashboard.js

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
                <td style="padding:10px;">৳${entry.amount.toLocaleString()}</td>
                <td style="padding:10px;">${entry.month}</td>
                <td style="padding:10px;">${date}</td>
                <td style="padding:10px;">
                    <span style="color:${statusColor}; font-weight:600;">${entry.status}</span>
                </td>
            </tr>
        `;
    }).join('');
}

// Validate member ID and show member name
async function validateMemberId(memberId) {
    const memberNameDisplay = document.getElementById('memberNameDisplay');
    const submitBtn = document.getElementById('submitShareBtn');
    
    if (!memberId) {
        memberNameDisplay.textContent = '';
        memberNameDisplay.style.color = '#666';
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/monthlyshare/validate-member/${memberId}`);
        
        if (response.ok) {
            const data = await response.json();
            memberNameDisplay.textContent = `✓ ${data.fullName}`;
            memberNameDisplay.style.color = 'green';
            submitBtn.disabled = false;
            return true;
        } else {
            memberNameDisplay.textContent = '✗ Member ID not found';
            memberNameDisplay.style.color = 'red';
            submitBtn.disabled = true;
            return false;
        }
    } catch (error) {
        console.error('Error validating member ID:', error);
        memberNameDisplay.textContent = '✗ Validation failed';
        memberNameDisplay.style.color = 'red';
        submitBtn.disabled = true;
        return false;
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('monthlyShareForm');
    const memberIdInput = document.getElementById('memberId');
    
    // Add member ID validation on input
    if (memberIdInput) {
        memberIdInput.addEventListener('blur', function() {
            validateMemberId(this.value);
        });
        
        memberIdInput.addEventListener('input', function() {
            if (this.value.length >= 4) {
                validateMemberId(this.value);
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const memberId = document.getElementById('memberId').value;
            
            // Validate member ID before submission
            const isValid = await validateMemberId(memberId);
            if (!isValid) {
                showShareNotification('Please enter a valid Member ID', 'error');
                return;
            }

            const formData = {
                memberId: memberId,
                amount: parseFloat(document.getElementById('shareAmount').value),
                month: document.getElementById('shareMonth').value,
                date: document.getElementById('shareDate').value,
                entryBy: sessionStorage.getItem('userName') || 'Admin'
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/monthlyshare`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showShareNotification('Entry saved successfully! Status: Pending', 'success');
                    form.reset();
                    document.getElementById('memberNameDisplay').textContent = '';
                    loadMonthlyShareEntries();
                    loadPendingEntries();
                } else {
                    const error = await response.json();
                    showShareNotification('Failed to save entry: ' + error.message, 'error');
                }
            } catch (error) {
                console.error('Error saving entry:', error);
                showShareNotification('Failed to save entry', 'error');
            }
        });
    }
});

// Load pending entries for authorization
function loadPendingEntries() {
    fetch(`${API_BASE_URL}/api/monthlyshare/pending`)
        .then(response => response.json())
        .then(data => {
            displayPendingEntries(data);
        })
        .catch(error => {
            console.error('Error loading pending entries:', error);
            showNotification('Failed to load pending entries', 'error');
        });
}

// Display pending entries in authorize section
function displayPendingEntries(entries) {
    const tbody = document.getElementById('pendingEntriesTableBody');
    if (!tbody) return;

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No pending entries</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-GB');
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding:12px;">${date}</td>
                <td style="padding:12px;">Share Deposit</td>
                <td style="padding:12px;">${entry.memberName} (${entry.memberId})</td>
                <td style="padding:12px;">৳${entry.amount.toLocaleString()}</td>
                <td style="padding:12px;">${entry.entryBy}</td>
                <td style="padding:12px;">
                    <button onclick="authorizeEntry('${entry._id}')" style="padding:5px 10px; background:green; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">Authorize</button>
                    <button onclick="deleteEntry('${entry._id}')" style="padding:5px 10px; background:red; color:white; border:none; border-radius:4px; cursor:pointer;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Authorize an entry
async function authorizeEntry(entryId) {
    if (!confirm('Are you sure you want to authorize this entry?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/monthlyshare/${entryId}/authorize`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authorizedBy: sessionStorage.getItem('userName') || 'Admin'
            })
        });

        if (response.ok) {
            showShareNotification('Entry authorized successfully!', 'success');
            loadPendingEntries();
            loadMonthlyShareEntries();
        } else {
            const error = await response.json();
            showShareNotification('Failed to authorize: ' + error.message, 'error');
        }
    } catch (error) {
        console.error('Error authorizing entry:', error);
        showShareNotification('Failed to authorize entry', 'error');
    }
}

// Delete an entry
async function deleteEntry(entryId) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/monthlyshare/${entryId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showShareNotification('Entry deleted successfully!', 'success');
            loadPendingEntries();
            loadMonthlyShareEntries();
        } else {
            const error = await response.json();
            showShareNotification('Failed to delete: ' + error.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        showShareNotification('Failed to delete entry', 'error');
    }
}

// Helper function to show notifications
function showShareNotification(message, type) {
    // Use dashboard showNotification if available
    if (typeof AdminDashboard !== 'undefined' && AdminDashboard.prototype && AdminDashboard.prototype.showNotification) {
        const dashboard = new AdminDashboard();
        dashboard.showNotification(message, type);
    } else {
        // Fallback to alert
        alert(message);
    }
}

// Load data when monthly share section is shown
document.addEventListener('DOMContentLoaded', function() {
    // Override showSection to load data when section changes
    const originalShowSection = window.showSection;
    if (originalShowSection) {
        window.showSection = function(sectionId) {
            originalShowSection(sectionId);
            
            if (sectionId === 'monthly-share-deposit') {
                loadMonthlyShareEntries();
            } else if (sectionId === 'authorize-delete-data') {
                loadPendingEntries();
            }
        };
    }
});