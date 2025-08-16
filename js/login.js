// Login Page Enhanced JavaScript
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;
let currentUserType = 'member';
let isLoggingIn = false;
let loginAttempts = 0;
const maxLoginAttempts = 3;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeLogin();
    initializeAnimations();
    loadRememberedCredentials();
    console.log('SHANTISONGHO Login page initialized');
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
    
    // Smooth theme transition
    setTimeout(() => {
        document.body.classList.remove('transitioning');
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

// Login Initialization
function initializeLogin() {
    const form = document.getElementById('loginForm');
    const inputs = form.querySelectorAll('input');
    
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
    form.addEventListener('submit', handleLogin);
    
    // Initialize user type
    setUserType('member');
    
    // Check login attempts
    checkLoginAttempts();
}

// User Type Management
function setUserType(type) {
    currentUserType = type;
    const buttons = document.querySelectorAll('.user-type-btn');
    const identifierLabel = document.getElementById('identifierLabel');
    const identifierInput = document.getElementById('identifier');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const adminNotice = document.getElementById('adminNotice');
    
    // Update button states
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
            btn.classList.add('scale-in');
            setTimeout(() => btn.classList.remove('scale-in'), 300);
        }
    });
    
    // Update form based on user type
    if (type === 'admin') {
        identifierLabel.textContent = 'Admin ID';
        identifierInput.placeholder = 'Enter admin ID';
        btnText.textContent = 'Login as Admin';
        loginBtn.classList.add('admin-mode');
        adminNotice.style.display = 'block';
        adminNotice.classList.add('scale-in');
    } else {
        identifierLabel.textContent = 'Member ID or Email';
        identifierInput.placeholder = 'Enter member ID or email';
        btnText.textContent = 'Login as Member';
        loginBtn.classList.remove('admin-mode');
        adminNotice.style.display = 'none';
    }
    
    // Clear any existing validation
    clearError(identifierInput);
    identifierInput.value = '';
}

// Field Validation
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'identifier':
            if (!value) {
                errorMessage = `${currentUserType === 'admin' ? 'Admin ID' : 'Member ID or Email'} is required`;
                isValid = false;
            } else if (currentUserType === 'admin') {
                // Admin ID validation (format: AD123456)
                if (!/^AD\d{6}$/.test(value)) {
                    errorMessage = 'Admin ID should be in format: AD123456';
                    isValid = false;
                }
            } else {
                // Member validation - either email or member ID
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const isMemberId = /^SS\d{6}$/.test(value);
                
                if (!isEmail && !isMemberId) {
                    errorMessage = 'Enter valid email address or member ID (SS123456)';
                    isValid = false;
                }
            }
            break;
            
        case 'password':
            if (!value) {
                errorMessage = 'Password is required';
                isValid = false;
            } else if (value.length < 6) {
                errorMessage = 'Password must be at least 6 characters';
                isValid = false;
            }
            break;
    }
    
    displayValidationResult(field, isValid, errorMessage);
    return isValid;
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
        field.classList.add('pulse-success');
        setTimeout(() => field.classList.remove('pulse-success'), 600);
        
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        
        // Add error animation
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
function togglePasswordVisibility() {
    const field = document.getElementById('password');
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

// Login Attempts Management
function checkLoginAttempts() {
    const attempts = localStorage.getItem('loginAttempts');
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    
    if (attempts && lastAttempt) {
        const timeDiff = Date.now() - parseInt(lastAttempt);
        const cooldownTime = 15 * 60 * 1000; // 15 minutes
        
        if (parseInt(attempts) >= maxLoginAttempts && timeDiff < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - timeDiff) / 60000);
            lockLoginForm(remainingTime);
        } else if (timeDiff >= cooldownTime) {
            // Reset attempts after cooldown
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastLoginAttempt');
        }
    }
}

function lockLoginForm(minutes) {
    const loginBtn = document.getElementById('loginBtn');
    const form = document.getElementById('loginForm');
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
        <span>Account Locked - ${minutes}m remaining</span>
    `;
    
    form.querySelectorAll('input, button').forEach(element => {
        if (element.id !== 'loginBtn') {
            element.disabled = true;
        }
    });
    
    showNotification(`Too many failed attempts. Please try again in ${minutes} minutes.`, 'error');
    
    // Check every minute
    const interval = setInterval(() => {
        minutes--;
        loginBtn.innerHTML = `<span>Account Locked - ${minutes}m remaining</span>`;
        
        if (minutes <= 0) {
            clearInterval(interval);
            unlockLoginForm();
        }
    }, 60000);
}

function unlockLoginForm() {
    const loginBtn = document.getElementById('loginBtn');
    const form = document.getElementById('loginForm');
    
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span class="btn-text">Login as Member</span>';
    
    form.querySelectorAll('input, button').forEach(element => {
        element.disabled = false;
    });
    
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastLoginAttempt');
    
    showNotification('Account unlocked. You can try logging in again.', 'success');
}

// Form Submission
async function handleLogin(event) {
    event.preventDefault();
    
    if (isLoggingIn) return;
    
    const form = event.target;
    const formData = new FormData(form);
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    
    // Validate all fields
    let isFormValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }
    
    // Start loading state
    isLoggingIn = true;
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    try {
        const credentials = {
            identifier: formData.get('identifier'),
            password: formData.get('password'),
            userType: currentUserType,
            rememberMe: formData.get('rememberMe') === 'on'
        };
        
        // Simulate authentication
        const result = await authenticateUser(credentials);
        
        if (result.success) {
            // Reset login attempts on successful login
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastLoginAttempt');
            
            // Save credentials if remember me is checked
            if (credentials.rememberMe) {
                saveCredentials(credentials);
            } else {
                clearSavedCredentials();
            }
            
            // Show success and redirect
            showNotification('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                if (currentUserType === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'member-dashboard.html';
                }
            }, 1500);
            
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        handleLoginError(error.message);
    } finally {
        // Reset loading state
        isLoggingIn = false;
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Authentication Simulation
async function authenticateUser(credentials) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { identifier, password, userType } = credentials;
            
            // Predefined test accounts
            const testAccounts = {
                admin: {
                    'AD123456': 'admin123',
                    'AD654321': 'admin456'
                },
                member: {
                    'SS123456': 'member123',
                    'user@shantisongho.org': 'user123',
                    'SS654321': 'member456'
                }
            };
            
            // Check credentials
            const accounts = testAccounts[userType];
            
            if (accounts && accounts[identifier] === password) {
                resolve({
                    success: true,
                    user: {
                        id: identifier,
                        type: userType,
                        name: userType === 'admin' ? 'Admin User' : 'Member User'
                    }
                });
            } else {
                // Increment failed attempts
                let attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
                attempts++;
                localStorage.setItem('loginAttempts', attempts.toString());
                localStorage.setItem('lastLoginAttempt', Date.now().toString());
                
                let errorMessage = 'Invalid credentials. Please try again.';
                
                if (attempts >= maxLoginAttempts) {
                    errorMessage = 'Too many failed attempts. Account locked for 15 minutes.';
                } else {
                    errorMessage += ` (${maxLoginAttempts - attempts} attempts remaining)`;
                }
                
                resolve({
                    success: false,
                    message: errorMessage,
                    attempts: attempts
                });
            }
        }, 1500);
    });
}

function handleLoginError(message) {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    
    if (attempts >= maxLoginAttempts) {
        checkLoginAttempts(); // This will lock the form
    } else {
        showNotification(message, 'error');
        
        // Shake the login card
        const loginCard = document.querySelector('.login-card');
        loginCard.classList.add('shake');
        setTimeout(() => loginCard.classList.remove('shake'), 300);
    }
}

// Remember Me Functionality
function saveCredentials(credentials) {
    const credentialsToSave = {
        identifier: credentials.identifier,
        userType: credentials.userType
    };
    
    localStorage.setItem('rememberedCredentials', JSON.stringify(credentialsToSave));
}

function loadRememberedCredentials() {
    const saved = localStorage.getItem('rememberedCredentials');
    
    if (saved) {
        try {
            const credentials = JSON.parse(saved);
            
            // Set user type
            setUserType(credentials.userType);
            
            // Fill identifier
            document.getElementById('identifier').value = credentials.identifier;
            
            // Check remember me
            document.getElementById('rememberMe').checked = true;
            
        } catch (error) {
            console.warn('Error loading saved credentials:', error);
            clearSavedCredentials();
        }
    }
}

function clearSavedCredentials() {
    localStorage.removeItem('rememberedCredentials');
}

// Forgot Password
function forgotPassword() {
    const modal = document.createElement('div');
    modal.className = 'forgot-password-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reset Password</h3>
                    <button class="modal-close" onclick="closeForgotPasswordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>To reset your password, please contact SHANTISONGHO administration with your member ID.</p>
                    <div class="reset-contacts">
                        <div class="reset-contact">
                            <span>📧</span>
                            <div>
                                <strong>Email:</strong>
                                <a href="mailto:support@shantisongho.org">support@shantisongho.org</a>
                            </div>
                        </div>
                        <div class="reset-contact">
                            <span>📞</span>
                            <div>
                                <strong>Phone:</strong>
                                <span>+880 1XXX-XXXXXX</span>
                            </div>
                        </div>
                    </div>
                    <div class="reset-note">
                        <strong>Note:</strong> For security reasons, password reset must be done through official channels.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeForgotPasswordModal()">Understood</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .forgot-password-modal {
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
            max-width: 500px;
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
        
        .modal-body p {
            color: var(--muted-foreground);
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .reset-contacts {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .reset-contact {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(34, 197, 94, 0.05);
            border-radius: 0.5rem;
            align-items: center;
        }
        
        .reset-contact span:first-child {
            font-size: 1.5rem;
            width: 2rem;
            text-align: center;
        }
        
        .reset-contact div {
            flex: 1;
        }
        
        .reset-contact strong {
            display: block;
            color: var(--foreground);
            margin-bottom: 0.25rem;
        }
        
        .reset-contact a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .reset-contact a:hover {
            text-decoration: underline;
        }
        
        .reset-note {
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 0.5rem;
            padding: 1rem;
            font-size: 0.9rem;
            color: var(--muted-foreground);
        }
        
        .reset-note strong {
            color: var(--secondary-color);
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--border);
            text-align: center;
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
            closeForgotPasswordModal();
        }
    });
}

function closeForgotPasswordModal() {
    const modal = document.querySelector('.forgot-password-modal');
    if (modal) {
        modal.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
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
    
    // Add notification styles if not already added
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
            
            @keyframes modalFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
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

// Add animation styles
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(animationStyle);

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

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('user-type-btn')) {
        e.target.click();
    }
});

// Console helper for testing
console.log('🔐 SHANTISONGHO Login System');
console.log('📋 Test Accounts:');
console.log('👤 Member: SS123456 / member123');
console.log('👤 Member: user@shantisongho.org / user123');
console.log('🛡️ Admin: AD123456 / admin123');
console.log('🛡️ Admin: AD654321 / admin456');
