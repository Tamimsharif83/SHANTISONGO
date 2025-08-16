// Signup Page Enhanced JavaScript
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;
let isSubmitting = false;

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
    
    // Smooth theme transition
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateToggleButton() {
    const sliders = document.querySelectorAll('.toggle-slider');
    sliders.forEach(slider => {
        slider.style.transform = isDarkMode ? 'translateX(1.5rem)' : 'translateX(0)';
    });
}

// Navigation Functions
function navigateTo(page) {
    if (mobileMenuOpen) {
        toggleMobileMenu();
    }
    
    document.body.style.opacity = '0.9';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

function logoRefreshAnimation() {
    const logo = document.querySelector('.nav-logo');
    const logoSvg = document.querySelector('.logo-placeholder svg');
    
    logo.style.transform = 'scale(1.1) rotate(360deg)';
    logoSvg.style.filter = 'drop-shadow(0 8px 16px rgba(34, 197, 94, 0.5))';
    
    setTimeout(() => {
        logo.style.transform = '';
        logoSvg.style.filter = '';
    }, 600);
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
        
        // Animate hamburger to X
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        
        menuBtn.style.transform = 'rotate(90deg)';
    } else {
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            mobileMenu.style.display = 'none';
        }, 300);
        
        // Reset hamburger
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
        
        menuBtn.style.transform = '';
    }
}

// Form Initialization
function initializeForm() {
    const form = document.getElementById('signupForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    // Add real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
        
        // Add floating label effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmission);
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', updatePasswordStrength);
}

// Field Validation
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'fullName':
            if (!value) {
                errorMessage = 'Full name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            } else if (!/^[a-zA-Z\s\u0980-\u09FF]+$/.test(value)) {
                errorMessage = 'Name should contain only letters';
                isValid = false;
            }
            break;
            
        case 'email':
            if (!value) {
                errorMessage = 'Email address is required';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;
            
        case 'phone':
            if (!value) {
                errorMessage = 'Phone number is required';
                isValid = false;
            } else if (!/^01[3-9]\d{8}$/.test(value)) {
                errorMessage = 'Please enter a valid Bangladesh phone number';
                isValid = false;
            }
            break;
            
        case 'memberId':
            if (!value) {
                errorMessage = 'Member ID is required';
                isValid = false;
            } else if (!/^SS\d{6}$/.test(value)) {
                errorMessage = 'Member ID should be in format: SS123456';
                isValid = false;
            }
            break;
            
        case 'nid':
            if (!value) {
                errorMessage = 'National ID is required';
                isValid = false;
            } else if (!/^\d{10}$|^\d{13}$|^\d{17}$/.test(value)) {
                errorMessage = 'Please enter a valid NID number';
                isValid = false;
            }
            break;
            
        case 'address':
            if (!value) {
                errorMessage = 'Address is required';
                isValid = false;
            } else if (value.length < 10) {
                errorMessage = 'Please provide a complete address';
                isValid = false;
            }
            break;
            
        case 'password':
            const passwordValidation = validatePassword(value);
            if (!passwordValidation.isValid) {
                errorMessage = passwordValidation.message;
                isValid = false;
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (!value) {
                errorMessage = 'Please confirm your password';
                isValid = false;
            } else if (value !== password) {
                errorMessage = 'Passwords do not match';
                isValid = false;
            }
            break;
    }
    
    displayValidationResult(field, isValid, errorMessage);
    return isValid;
}

// Password Validation
function validatePassword(password) {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character' };
    }
    
    return { isValid: true, message: '' };
}

// Password Strength Indicator
function updatePasswordStrength(event) {
    const password = event.target.value;
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (!strengthIndicator) {
        createPasswordStrengthIndicator(event.target);
        return;
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
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">Password strength</div>
    `;
    
    container.appendChild(strengthDiv);
    
    // Add CSS for password strength indicator
    const style = document.createElement('style');
    style.textContent = `
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .strength-bar {
            height: 4px;
            background: var(--border);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 0.25rem;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-text {
            font-size: 0.75rem;
            color: var(--muted-foreground);
        }
    `;
    document.head.appendChild(style);
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = 'Weak';
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;
    
    if (score <= 2) {
        feedback = 'Weak';
    } else if (score <= 4) {
        feedback = 'Medium';
    } else {
        feedback = 'Strong';
    }
    
    return { score, feedback };
}

function updateStrengthDisplay(indicator, strength) {
    const fill = indicator.querySelector('.strength-fill');
    const text = indicator.querySelector('.strength-text');
    
    const percentage = (strength.score / 6) * 100;
    fill.style.width = percentage + '%';
    
    if (strength.feedback === 'Weak') {
        fill.style.background = '#ef4444';
    } else if (strength.feedback === 'Medium') {
        fill.style.background = '#f59e0b';
    } else {
        fill.style.background = '#22c55e';
    }
    
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
        
        // Add success animation
        createSuccessIcon(field);
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        
        // Add error animation
        field.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => {
            field.style.animation = '';
        }, 300);
    }
}

function createSuccessIcon(field) {
    const container = field.closest('.form-group');
    let successIcon = container.querySelector('.success-icon');
    
    if (!successIcon) {
        successIcon = document.createElement('div');
        successIcon.className = 'success-icon';
        successIcon.innerHTML = '✓';
        successIcon.style.cssText = `
            position: absolute;
            right: 1rem;
            top: 3rem;
            color: var(--success-color);
            font-weight: bold;
            font-size: 1.2rem;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
        `;
        container.style.position = 'relative';
        container.appendChild(successIcon);
    }
    
    setTimeout(() => {
        successIcon.style.opacity = '1';
        successIcon.style.transform = 'scale(1)';
    }, 100);
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
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.142 4.142M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.878-6.878L21 3m-6.878 6.878L12 12"/>
        `;
    } else {
        field.type = 'password';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        `;
    }
    
    // Add animation to button
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
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
        if (!validateField(input)) {
            isFormValid = false;
        }
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
        // Simulate API call
        await simulateSignupProcess(formData);
        
        // Success
        showNotification('Account created successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
            navigateTo('login.html');
        }, 2000);
        
    } catch (error) {
        showNotification(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
        // Reset loading state
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
            // Simulate validation checks
            const email = formData.get('email');
            const memberId = formData.get('memberId');
            
            // Simulate server-side validation
            if (email === 'test@shantisongho.org') {
                reject(new Error('Email already exists'));
                return;
            }
            
            if (memberId === 'SS000000') {
                reject(new Error('Invalid member ID'));
                return;
            }
            
            // Simulate successful signup
            const userData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                memberId: formData.get('memberId'),
                nid: formData.get('nid'),
                address: formData.get('address')
            };
            
            // Store in localStorage (simulation)
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
                    <div class="terms-content">
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
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="acceptTerms()">I Accept</button>
                    <button class="btn btn-secondary" onclick="closeTermsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .terms-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            animation: modalFadeIn 0.3s ease;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .modal-content {
            background: var(--card);
            border-radius: 1rem;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease;
            border: 1px solid var(--border);
        }
        
        .modal-header {
            padding: 1.5rem 1.5rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            margin-bottom: 1.5rem;
        }
        
        .modal-header h3 {
            color: var(--primary-color);
            margin: 0;
            font-size: 1.25rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--muted-foreground);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: var(--primary-light);
            color: var(--primary-color);
        }
        
        .modal-body {
            padding: 0 1.5rem 1.5rem;
        }
        
        .terms-content h4 {
            color: var(--primary-color);
            margin: 1.5rem 0 0.5rem 0;
            font-weight: 600;
        }
        
        .terms-content h4:first-child {
            margin-top: 0;
        }
        
        .terms-content p {
            color: var(--muted-foreground);
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--border);
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
            from { transform: translateY(-20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTermsModal();
        }
    });
}

function closeTermsModal() {
    const modal = document.querySelector('.terms-modal');
    if (modal) {
        modal.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function acceptTerms() {
    const checkbox = document.getElementById('agreeTerms');
    checkbox.checked = true;
    closeTermsModal();
    
    // Clear any existing error
    displayValidationResult(checkbox, true, '');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add notification styles
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 2rem;
                z-index: 10001;
                background: var(--card);
                border-radius: 0.75rem;
                padding: 1rem 1.5rem;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                border-left: 4px solid var(--primary-color);
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            }
            
            .notification-success {
                border-left-color: var(--success-color);
            }
            
            .notification-error {
                border-left-color: var(--error-color);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-icon {
                font-size: 1.25rem;
            }
            
            .notification-message {
                color: var(--foreground);
                font-weight: 500;
            }
            
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
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Initialize Animations
function initializeAnimations() {
    // Stagger animation for form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${0.1 * index}s`;
        group.style.animation = 'fadeInUp 0.6s ease-out both';
    });
}

// Add shake animation for validation errors
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes modalFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(shakeStyle);

// Close mobile menu on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenuOpen) {
        toggleMobileMenu();
    }
});

// Initialize theme on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}
