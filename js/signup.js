// Signup Page JavaScript
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;
let isSubmitting = false;

// Form validation rules
const VALIDATION_RULES = {
    fullName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s\u0980-\u09FF]+$/,
        messages: {
            required: 'Full name is required',
            minLength: 'Name must be at least 2 characters',
            pattern: 'Name should contain only letters'
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
            required: 'Email address is required',
            pattern: 'Please enter a valid email address'
        }
    },
    phone: {
        required: true,
        pattern: /^01[3-9]\d{8}$/,
        messages: {
            required: 'Phone number is required',
            pattern: 'Please enter a valid Bangladesh phone number'
        }
    },
    memberId: {
        required: true,
        pattern: /^SS\d{6}$/,
        messages: {
            required: 'Member ID is required',
            pattern: 'Member ID should be in format: SS123456'
        }
    },
    nid: {
        required: true,
        pattern: /^\d{10}$|^\d{13}$|^\d{17}$/,
        messages: {
            required: 'National ID is required',
            pattern: 'Please enter a valid NID number'
        }
    },
    address: {
        required: true,
        minLength: 10,
        messages: {
            required: 'Address is required',
            minLength: 'Please provide a complete address'
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeForm();
    initializeAnimations();
    console.log('SHANTISONGHO Signup page initialized');
});

// Theme Management
function initializeTheme() {
    document.body.classList.toggle('dark', isDarkMode);
    updateToggleButton();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    updateToggleButton();
    
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => document.body.style.transition = '', 300);
}

function updateToggleButton() {
    const sliders = document.querySelectorAll('.toggle-slider, .mobile-toggle-slider');
    sliders.forEach(slider => {
        slider.style.transform = isDarkMode ? 'translateX(1.5rem)' : 'translateX(0)';
    });
}

// Navigation Functions
function navigateTo(page) {
    if (mobileMenuOpen) toggleMobileMenu();
    
    document.body.style.opacity = '0.9';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => window.location.href = page, 300);
}

function logoRefresh() {
    const logo = document.querySelector('.nav-logo');
    const logoIcon = document.querySelector('.logo-icon svg');
    
    logo.style.transform = 'scale(1.1) rotate(360deg)';
    logoIcon.style.filter = 'drop-shadow(0 8px 16px rgba(30, 126, 52, 0.5))';
    
    setTimeout(() => {
        logo.style.transform = '';
        logoIcon.style.filter = '';
    }, 600);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const spans = menuBtn.querySelectorAll('span');
    
    mobileMenuOpen = !mobileMenuOpen;
    
    if (mobileMenuOpen) {
        mobileMenu.style.display = 'block';
        setTimeout(() => {
            mobileMenu.style.opacity = '1';
            mobileMenu.style.transform = 'translateY(0)';
        }, 10);
        
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        menuBtn.style.transform = 'rotate(90deg)';
    } else {
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-10px)';
        
        setTimeout(() => mobileMenu.style.display = 'none', 300);
        
        spans.forEach(span => span.style.transform = '');
        spans[1].style.opacity = '';
        menuBtn.style.transform = '';
    }
}

// Form Initialization
function initializeForm() {
    const form = document.getElementById('signupForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
    
    form.addEventListener('submit', handleFormSubmission);
    
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', updatePasswordStrength);
}

// Field Validation
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const rules = VALIDATION_RULES[fieldName];
    
    if (fieldName === 'password') {
        const result = validatePassword(value);
        displayValidationResult(field, result.isValid, result.message);
        return result.isValid;
    }
    
    if (fieldName === 'confirmPassword') {
        const password = document.getElementById('password').value;
        const isValid = value && value === password;
        const message = !value ? 'Please confirm your password' : !isValid ? 'Passwords do not match' : '';
        displayValidationResult(field, isValid, message);
        return isValid;
    }
    
    if (!rules) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    if (rules.required && !value) {
        isValid = false;
        errorMessage = rules.messages.required;
    } else if (value && rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errorMessage = rules.messages.minLength;
    } else if (value && rules.pattern && !rules.pattern.test(value)) {
        isValid = false;
        errorMessage = rules.messages.pattern;
    }
    
    displayValidationResult(field, isValid, errorMessage);
    return isValid;
}

// Password Validation
function validatePassword(password) {
    if (!password) return { isValid: false, message: 'Password is required' };
    if (password.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
    if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    if (!/(?=.*\d)/.test(password)) return { isValid: false, message: 'Password must contain at least one number' };
    
    return { isValid: true, message: '' };
}

// Password Strength
function updatePasswordStrength(event) {
    const password = event.target.value;
    let strengthIndicator = document.getElementById('passwordStrength');
    
    if (!strengthIndicator) {
        strengthIndicator = createPasswordStrengthIndicator(event.target);
    }
    
    const strength = calculatePasswordStrength(password);
    updateStrengthDisplay(strengthIndicator, strength);
}

function createPasswordStrengthIndicator(passwordInput) {
    const container = passwordInput.closest('.form-group');
    const strengthDiv = document.createElement('div');
    strengthDiv.id = 'passwordStrength';
    strengthDiv.className = 'password-strength';
    strengthDiv.innerHTML = `
        <div class="strength-bar"><div class="strength-fill"></div></div>
        <div class="strength-text">Password strength</div>
    `;
    
    container.appendChild(strengthDiv);
    
    if (!document.getElementById('strength-styles')) {
        const style = document.createElement('style');
        style.id = 'strength-styles';
        style.textContent = `
            .password-strength { margin-top: 0.5rem; }
            .strength-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 0.25rem; }
            .strength-fill { height: 100%; transition: all 0.3s ease; border-radius: 2px; }
            .strength-text { font-size: 0.75rem; color: var(--muted-foreground); }
        `;
        document.head.appendChild(style);
    }
    
    return strengthDiv;
}

function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;
    
    const feedback = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
    return { score, feedback };
}

function updateStrengthDisplay(indicator, strength) {
    const fill = indicator.querySelector('.strength-fill');
    const text = indicator.querySelector('.strength-text');
    
    const percentage = (strength.score / 6) * 100;
    fill.style.width = percentage + '%';
    
    const colors = { Weak: '#ef4444', Medium: '#f59e0b', Strong: '#4caf50' };
    fill.style.background = colors[strength.feedback];
    text.textContent = `Password strength: ${strength.feedback}`;
}

// Display Validation Results
function displayValidationResult(field, isValid, errorMessage) {
    const errorElement = document.getElementById(field.name + 'Error');
    
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('success');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        
        field.classList.add('shake');
        setTimeout(() => field.classList.remove('shake'), 300);
    }
}

function clearError(field) {
    if (field.classList.contains('error')) {
        field.classList.remove('error');
        const errorElement = document.getElementById(field.name + 'Error');
        errorElement.classList.remove('show');
    }
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
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`;
    }
    
    button.style.transform = 'scale(0.9)';
    setTimeout(() => button.style.transform = 'scale(1)', 150);
}

// Form Submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = document.getElementById('signupBtn');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    
    // Validate all fields
    let isFormValid = true;
    const inputs = form.querySelectorAll('input:not([type="checkbox"]), textarea');
    
    inputs.forEach(input => {
        if (!validateField(input)) isFormValid = false;
    });
    
    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        displayValidationResult(agreeTerms, false, 'You must agree to the terms and conditions');
        isFormValid = false;
    }
    
    if (!isFormValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }
    
    // Start loading state
    isSubmitting = true;
    submitButton.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    try {
        await simulateSignupProcess(formData);
        showNotification('Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => navigateTo('login.html'), 2000);
    } catch (error) {
        showNotification(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Simulate Signup Process
async function simulateSignupProcess(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const email = formData.get('email');
            const memberId = formData.get('memberId');
            
            if (email === 'test@shantisongho.org') {
                reject(new Error('Email already exists'));
                return;
            }
            
            if (memberId === 'SS000000') {
                reject(new Error('Invalid member ID'));
                return;
            }
            
            const userData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                memberId: formData.get('memberId'),
                nid: formData.get('nid'),
                address: formData.get('address')
            };
            
            localStorage.setItem('pendingUser', JSON.stringify(userData));
            resolve(userData);
        }, 2000);
    });
}

// Show Terms Modal
function showTerms() {
    const modal = document.createElement('div');
    modal.className = 'terms-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Terms & Conditions - SHANTISONGHO</h3>
                    <button class="modal-close" onclick="closeTermsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>1. Membership Agreement</h4>
                    <p>By joining SHANTISONGHO, you agree to abide by Islamic financial principles and our organizational guidelines.</p>
                    <h4>2. Sharia Compliance</h4>
                    <p>All financial transactions and investments will strictly follow Sharia-compliant principles as verified by our Islamic scholars.</p>
                    <h4>3. Member Responsibilities</h4>
                    <p>Members must provide accurate information and maintain ethical conduct in all dealings with the organization.</p>
                    <h4>4. Financial Obligations</h4>
                    <p>Members are expected to fulfill their financial commitments and participate in profit-sharing arrangements transparently.</p>
                    <h4>5. Privacy & Data Protection</h4>
                    <p>Your personal information will be protected according to Islamic privacy principles and modern data protection standards.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="acceptTerms()">I Accept</button>
                    <button class="btn btn-secondary" onclick="closeTermsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    addModalStyles();
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) closeTermsModal();
    });
}

function addModalStyles() {
    if (document.getElementById('terms-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'terms-modal-styles';
    style.textContent = `
        .terms-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; animation: modalFadeIn 0.3s ease; }
        .modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-content { background: var(--card); border-radius: 1rem; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); animation: modalSlideIn 0.3s ease; border: 1px solid var(--border); }
        .modal-header { padding: 1.5rem 1.5rem 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
        .modal-header h3 { color: var(--primary-color); margin: 0; font-size: 1.25rem; }
        .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--muted-foreground); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .modal-close:hover { background: var(--primary-light); color: var(--primary-color); }
        .modal-body { padding: 0 1.5rem 1.5rem; }
        .modal-body h4 { color: var(--primary-color); margin: 1.5rem 0 0.5rem 0; font-weight: 600; }
        .modal-body h4:first-child { margin-top: 0; }
        .modal-body p { color: var(--muted-foreground); line-height: 1.6; margin-bottom: 1rem; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid var(--border); display: flex; gap: 1rem; justify-content: flex-end; }
        .btn-secondary { background: transparent; color: var(--primary-color); border: 2px solid var(--primary-color); }
        .btn-secondary:hover { background: var(--primary-color); color: white; }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn { from { transform: translateY(-20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes modalFadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
}

function closeTermsModal() {
    const modal = document.querySelector('.terms-modal');
    if (modal) {
        modal.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function acceptTerms() {
    const checkbox = document.getElementById('agreeTerms');
    checkbox.checked = true;
    closeTermsModal();
    displayValidationResult(checkbox, true, '');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    addNotificationStyles();
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification { position: fixed; top: 100px; right: 2rem; z-index: 10001; background: var(--card); border-radius: 0.75rem; padding: 1rem 1.5rem; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); border-left: 4px solid var(--primary-color); animation: slideInRight 0.3s ease; max-width: 400px; }
        .notification-success { border-left-color: var(--success-color); }
        .notification-error { border-left-color: var(--error-color); }
        .notification-content { display: flex; align-items: center; gap: 0.75rem; }
        .notification-icon { font-size: 1.25rem; }
        .notification-message { color: var(--foreground); font-weight: 500; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}

// Initialize Animations
function initializeAnimations() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${0.1 * index}s`;
        group.style.animation = 'fadeInUp 0.6s ease-out both';
    });
}

// Close mobile menu on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenuOpen) {
        toggleMobileMenu();
    }
});

// Add animation styles
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
    .shake { animation: shake 0.3s ease-in-out; }
`;
document.head.appendChild(animationStyle);