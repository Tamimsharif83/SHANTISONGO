// Change Password Page JavaScript
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;
let isChangingPassword = false;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user came from login
    const userId = sessionStorage.getItem('userId');
    const firstLogin = sessionStorage.getItem('firstLogin');
    
    if (!userId || firstLogin !== 'true') {
        showNotification('Unauthorized access. Redirecting to login...', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }
    
    initializeTheme();
    console.log('Change Password page initialized');
});

// Theme Management
function initializeTheme() {
    document.body.classList.toggle('dark', isDarkMode);
    updateToggleButton();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.add('transitioning');
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    updateToggleButton();
    
    setTimeout(() => document.body.classList.remove('transitioning'), 300);
}

function updateToggleButton() {
    const sliders = document.querySelectorAll('.toggle-slider, .mobile-toggle-slider');
    sliders.forEach(slider => {
        slider.style.transform = isDarkMode ? 'translateX(1.5rem)' : 'translateX(0)';
    });

    document.querySelectorAll('.sun-icon, .mobile-dark-toggle span:first-child').forEach(icon => {
        icon.style.opacity = isDarkMode ? '0.5' : '1';
        icon.style.color = isDarkMode ? '#64748b' : '#fbbf24';
    });

    document.querySelectorAll('.moon-icon, .mobile-dark-toggle span:last-child').forEach(icon => {
        icon.style.opacity = isDarkMode ? '1' : '0.5';
        icon.style.color = isDarkMode ? '#4caf50' : '#64748b';
    });
}

// Navigation Functions
function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active', mobileMenuOpen);
}

function logoRefresh() {
    window.location.reload();
}

// Password Visibility Toggle
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('svg');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.142 4.142M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.878-6.878L21 3m-6.878 6.878L12 12"/>`;
    } else {
        field.type = 'password';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`;
    }
    button.style.transform = 'translateY(-50%)';
}

// Password Validation
function validatePasswordStrength(field) {
    const password = field.value;
    const requirements = {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    // Update requirement list
    document.getElementById('req-length').className = requirements.length ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-uppercase').className = requirements.uppercase ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-lowercase').className = requirements.lowercase ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-number').className = requirements.number ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-special').className = requirements.special ? 'requirement-met' : 'requirement-unmet';
    
    // Check if all requirements are met
    const allMet = Object.values(requirements).every(val => val);
    
    if (allMet) {
        field.classList.remove('error');
        field.classList.add('success');
        document.getElementById('newPasswordError').textContent = '';
    } else {
        field.classList.remove('success');
        if (password.length > 0) {
            field.classList.add('error');
            document.getElementById('newPasswordError').textContent = 'Password does not meet all requirements';
        }
    }
    
    // Also validate match if confirm password has value
    if (document.getElementById('confirmPassword').value) {
        validatePasswordMatch();
    }
    
    return allMet;
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmField = document.getElementById('confirmPassword');
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword.length === 0) {
        confirmField.classList.remove('error', 'success');
        errorElement.textContent = '';
        return false;
    }
    
    if (newPassword === confirmPassword) {
        confirmField.classList.remove('error');
        confirmField.classList.add('success');
        errorElement.textContent = '';
        return true;
    } else {
        confirmField.classList.remove('success');
        confirmField.classList.add('error');
        errorElement.textContent = 'Passwords do not match';
        return false;
    }
}

// Form Submission
async function handleChangePassword(event) {
    event.preventDefault();
    
    if (isChangingPassword) return;
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const btnText = changePasswordBtn.querySelector('.btn-text');
    const btnLoading = changePasswordBtn.querySelector('.btn-loading');
    
    // Validate password strength
    if (!validatePasswordStrength(document.getElementById('newPassword'))) {
        showNotification('Password does not meet all requirements', 'error');
        return;
    }
    
    // Validate password match
    if (!validatePasswordMatch()) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Start loading state
    isChangingPassword = true;
    changePasswordBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    try {
        const userId = sessionStorage.getItem('userId');
        
        const response = await fetch('http://localhost:5000/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Password changed successfully! Please login with your new password...', 'success');
            
            // Clear all session data
            sessionStorage.clear();
            
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            throw new Error(data.msg || 'Failed to change password');
        }
        
    } catch (error) {
        showNotification(error.message, 'error');
        isChangingPassword = false;
        changePasswordBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    const alertIcon = alertBox.querySelector('.alert-icon');
    
    alertText.textContent = message;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ️',
        warning: '⚠'
    };
    
    alertIcon.textContent = icons[type] || icons.info;
    
    alertBox.className = 'alert-box show ' + type;
    
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}
