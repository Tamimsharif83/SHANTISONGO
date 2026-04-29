// Savings Account Deposit Functions
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

// Load savings account entries when section is shown
function loadSavingsAccountEntries() {
    fetch(`${API_BASE_URL}/api/savings`)
        .then(response => response.json())
        .then(data => {
            displaySavingsAccountEntries(data);
        })
        .catch(error => {
            console.error('Error loading savings account entries:', error);
            showSavingsNotification('Failed to load entries', 'error');
        });
}

// Display savings account entries in table
function displaySavingsAccountEntries(entries) {
    const tbody = document.getElementById('savingsAccountTableBody');
    if (!tbody) return;

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No entries found</td></tr>';
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
                <td style="padding:10px;">${date}</td>
                <td style="padding:10px;">
                    <span style="color:${statusColor}; font-weight:600;">${entry.status}</span>
                </td>
            </tr>
        `;
    }).join('');
}

// Validate member ID and show member name for savings
async function validateSavingsMemberId(memberId) {
    const memberNameDisplay = document.getElementById('savingsMemberNameDisplay');
    const submitBtn = document.getElementById('submitSavingsBtn');
    
    if (!memberId) {
        memberNameDisplay.textContent = '';
        memberNameDisplay.style.color = '#666';
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/savings/validate-member/${memberId}`);
        
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

// Handle form submission for savings account
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('savingsAccountForm');
    const memberIdInput = document.getElementById('savingsMemberId');
    const savingsDateInput = document.getElementById('savingsDate');
    
    // Set today's date as default and max date to today (disable future dates)
    if (savingsDateInput) {
        const today = new Date().toISOString().split('T')[0];
        savingsDateInput.value = today;
        savingsDateInput.max = today;
    }
    
    // Add member ID validation on input
    if (memberIdInput) {
        memberIdInput.addEventListener('blur', function() {
            validateSavingsMemberId(this.value);
        });
        
        memberIdInput.addEventListener('input', function() {
            if (this.value.length >= 4) {
                validateSavingsMemberId(this.value);
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const memberId = document.getElementById('savingsMemberId').value;
            
            // Validate member ID before submission
            const isValid = await validateSavingsMemberId(memberId);
            if (!isValid) {
                showSavingsNotification('Please enter a valid Member ID', 'error');
                return;
            }

            const formData = {
                memberId: memberId,
                amount: takaToPaysa(document.getElementById('savingsAmount').value),  // Convert to paisa
                date: document.getElementById('savingsDate').value,
                entryBy: sessionStorage.getItem('userName') || 'Admin'
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/savings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showSavingsNotification('Entry saved successfully! Status: Pending', 'success');
                    form.reset();
                    document.getElementById('savingsMemberNameDisplay').textContent = '';
                    loadSavingsAccountEntries();
                    if (typeof loadPendingEntries === 'function') {
                        loadPendingEntries();
                    }
                } else {
                    const error = await response.json();
                    showSavingsNotification('Failed to save entry: ' + error.message, 'error');
                }
            } catch (error) {
                console.error('Error saving entry:', error);
                showSavingsNotification('Failed to save entry', 'error');
            }
        });
    }
});

// Load pending savings entries for authorization
function loadPendingSavingsEntries() {
    fetch(`${API_BASE_URL}/api/savings/pending`)
        .then(response => response.json())
        .then(data => {
            displayPendingSavingsEntries(data);
        })
        .catch(error => {
            console.error('Error loading pending savings entries:', error);
        });
}

// Display pending savings entries in authorization section
function displayPendingSavingsEntries(entries) {
    const tbody = document.getElementById('pendingSavingsTableBody');
    if (!tbody) return;

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No pending entries</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-GB');
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding:10px;">${entry.memberName}</td>
                <td style="padding:10px;">${entry.memberId}</td>
                <td style="padding:10px;">৳${entry.amount.toLocaleString()}</td>
                <td style="padding:10px;">${date}</td>
                <td style="padding:10px;">${entry.entryBy}</td>
                <td style="padding:10px;">
                    <button class="btn btn-sm btn-success" onclick="authorizeSavingsEntry('${entry._id}')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSavingsEntry('${entry._id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Authorize savings entry
async function authorizeSavingsEntry(entryId) {
    if (!confirm('Are you sure you want to authorize this savings deposit?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/savings/${entryId}/authorize`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authorizedBy: sessionStorage.getItem('userName') || 'Admin'
            })
        });

        if (response.ok) {
            showSavingsNotification('Entry authorized successfully!', 'success');
            loadSavingsAccountEntries();
            if (typeof loadPendingEntries === 'function') {
                loadPendingEntries();
            }
        } else {
            showSavingsNotification('Failed to authorize entry', 'error');
        }
    } catch (error) {
        console.error('Error authorizing entry:', error);
        showSavingsNotification('Failed to authorize entry', 'error');
    }
}

// Delete savings entry
async function deleteSavingsEntry(entryId) {
    if (!confirm('Are you sure you want to delete this savings deposit?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/savings/${entryId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showSavingsNotification('Entry deleted successfully!', 'success');
            loadSavingsAccountEntries();
            if (typeof loadPendingEntries === 'function') {
                loadPendingEntries();
            }
        } else {
            showSavingsNotification('Failed to delete entry', 'error');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        showSavingsNotification('Failed to delete entry', 'error');
    }
}

// Show notification for savings account
function showSavingsNotification(message, type) {
    // Check if a global notification function exists
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
