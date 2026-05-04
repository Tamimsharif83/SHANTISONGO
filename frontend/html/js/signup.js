// Application Form Page JavaScript
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;
let isSubmitting = false;

// API Base URL
const API_BASE_URL = 'https://shantisongho-web-d8hzbchtdweadvb3.southeastasia-01.azurewebsites.net';

// Form validation rules for Application Form
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
    },
    nidImage: {
        required: true,
        messages: {
            required: 'National ID image is required'
        }
    },
    profilePicture: {
        required: true,
        messages: {
            required: 'Profile picture is required'
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeForm();
    initializeAnimations();
    initializeFileUpload();
    
    // Handle both mobile and desktop dark mode toggles
    const mobileToggleBtn = document.querySelector('.mobile-toggle-btn');
    const mobileDarkToggle = document.querySelector('.mobile-dark-toggle');
    
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDarkMode();
            requestAnimationFrame(() => updateToggleButton());
        });
    }
    
    if (mobileDarkToggle) {
        mobileDarkToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDarkMode();
            requestAnimationFrame(() => updateToggleButton());
        });
    }
    
    console.log('SHANTISONGHO Application page initialized');
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

    // Update all sun icons (both desktop and mobile)
    document.querySelectorAll('.sun-icon, .mobile-dark-toggle span:first-child').forEach(icon => {
        icon.style.opacity = isDarkMode ? '0.5' : '1';
        icon.style.color = isDarkMode ? '#64748b' : '#fbbf24';
    });

    // Update all moon icons (both desktop and mobile)
    document.querySelectorAll('.moon-icon, .mobile-dark-toggle span:last-child').forEach(icon => {
        icon.style.opacity = isDarkMode ? '1' : '0.5';
        icon.style.color = isDarkMode ? '#4caf50' : '#64748b';
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
    
    if (logo) {
        logo.style.transform = 'scale(1.1) rotate(360deg)';
    }
    if (logoIcon) {
        logoIcon.style.filter = 'drop-shadow(0 8px 16px rgba(30, 126, 52, 0.5))';
    }
    
    setTimeout(() => {
        if (logo) logo.style.transform = '';
        if (logoIcon) logoIcon.style.filter = '';
        window.location.href = 'index.html';
    }, 600);
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
            updateToggleButton();
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

// File Upload Handler
function initializeFileUpload() {
    // Initialize NID Image upload
    initializeFileInput('nidImage', 'fileName');
    // Initialize Profile Picture upload
    initializeFileInput('profilePicture', 'profileFileName');
}

function initializeFileInput(inputId, displayId) {
    const fileInput = document.getElementById(inputId);
    const fileLabel = fileInput ? fileInput.nextElementSibling : null;
    const fileNameDisplay = document.getElementById(displayId);
    
    if (!fileInput || !fileLabel) return;
    
    // Click to upload
    fileLabel.addEventListener('click', () => fileInput.click());
    
    
    // Drag and drop
    fileLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileLabel.style.borderColor = 'var(--primary-hover)';
        fileLabel.style.backgroundColor = 'var(--card-hover)';
    });
    
    fileLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileLabel.style.borderColor = 'var(--primary-color)';
        fileLabel.style.backgroundColor = 'var(--input-bg)';
    });
    
    fileLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileLabel.style.borderColor = 'var(--primary-color)';
        fileLabel.style.backgroundColor = 'var(--input-bg)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0], fileNameDisplay, inputId);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0], fileNameDisplay, inputId);
        }
    });
}

function handleFileSelect(file, fileNameDisplay, inputId) {
    const fileInput = document.getElementById(inputId);
    
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        displayValidationResult(fileInput, false, 'Please upload a valid image file');
        fileNameDisplay.textContent = '';
        return;
    }
    
    if (file.size > maxSize) {
        displayValidationResult(fileInput, false, 'File size must be less than 10MB');
        fileNameDisplay.textContent = '';
        return;
    }
    
    displayValidationResult(fileInput, true, '');
    fileNameDisplay.textContent = `✓ ${file.name}`;
}

// Form Initialization
function initializeForm() {
    const form = document.getElementById('signupForm');
    const inputs = form.querySelectorAll('input:not([type="file"]), textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
    
    form.addEventListener('submit', handleFormSubmission);
}

// Field Validation
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const rules = VALIDATION_RULES[fieldName];
    
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

// Display Validation Results
function displayValidationResult(field, isValid, errorMessage) {
    const errorElement = document.getElementById(field.name + 'Error');
    
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('success');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
        
        field.classList.add('shake');
        setTimeout(() => field.classList.remove('shake'), 300);
    }
}

function clearError(field) {
    if (field.classList.contains('error')) {
        field.classList.remove('error');
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) errorElement.classList.remove('show');
    }
}

// Form Submission - Application Storage
async function handleFormSubmission(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const form = event.target;
    const submitButton = document.getElementById('signupBtn');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    
    // Validate all fields
    let isFormValid = true;
    const inputs = form.querySelectorAll('input:not([type="file"]), textarea');
    
    inputs.forEach(input => {
        if (!validateField(input)) isFormValid = false;
    });
    
    // Validate file uploads
    const nidFileInput = document.getElementById('nidImage');
    if (!nidFileInput.files || nidFileInput.files.length === 0) {
        displayValidationResult(nidFileInput, false, 'National ID image is required');
        isFormValid = false;
    }
    
    const profileFileInput = document.getElementById('profilePicture');
    if (!profileFileInput.files || profileFileInput.files.length === 0) {
        displayValidationResult(profileFileInput, false, 'Profile picture is required');
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
        await submitApplication(form);
        showNotification('Application submitted successfully!', 'success');
        setTimeout(() => {
            form.reset();
            document.querySelectorAll('#fileName').forEach(el => el.textContent = '');
            isSubmitting = false;
            submitButton.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }, 1500);
    } catch (error) {
        showNotification(error.message || 'Application submission failed. Please try again.', 'error');
        isSubmitting = false;
        submitButton.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Submit Application - Store in MongoDB via API
async function submitApplication(form) {
    return new Promise((resolve, reject) => {
        try {
            // Get form data
            const formData = new FormData(form);
            const nidFileInput = document.getElementById('nidImage');
            const profileFileInput = document.getElementById('profilePicture');
            
            // Read NID file as base64
            const nidReader = new FileReader();
            nidReader.onload = function(nidEvent) {
                // Read profile picture as base64
                const profileReader = new FileReader();
                profileReader.onload = async function(profileEvent) {
                    const applicationData = {
                        fullName: formData.get('fullName'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        shareAmount: formData.get('shareAmount') || 0,
                        nid: formData.get('nid'),
                        nidImage: nidEvent.target.result,
                        profilePicture: profileEvent.target.result,
                        address: formData.get('address')
                    };
                
                try {
                    const response = await fetch(`${API_BASE_URL}/applications/submit`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(applicationData)
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        reject(new Error(data.msg || 'Application submission failed'));
                        return;
                    }
                    
                    console.log('Application stored:', data);
                    resolve(data);
                    
                } catch (fetchError) {
                    console.error('API Error:', fetchError);
                    reject(new Error('Failed to connect to server. Please try again.'));
                }
            };
            
            profileReader.onerror = function() {
                reject(new Error('Failed to read profile picture'));
            };
            
            profileReader.readAsDataURL(profileFileInput.files[0]);
        };
        
        nidReader.onerror = function() {
            reject(new Error('Failed to read NID image'));
        };
        
        nidReader.readAsDataURL(nidFileInput.files[0]);
        } catch (error) {
            reject(error);
        }
    });
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
        @media (max-width: 640px) { .notification { right: 1rem; max-width: calc(100% - 2rem); } }
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
    
    .form-input.error, .form-textarea.error {
        border-color: var(--error-color) !important;
        background-color: rgba(239, 68, 68, 0.05);
    }
    
    .form-input.success, .form-textarea.success {
        border-color: var(--success-color) !important;
    }
`;
document.head.appendChild(animationStyle);