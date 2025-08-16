// SHANTISONGHO Website - Main JavaScript File
// Enhanced with Islamic themes, animations, and mobile optimizations

// Global Variables
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentPage = window.location.pathname.split('/').pop() || 'index.html';
let scrollY = 0;
let ticking = false;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeAnimations();
    initializeScrollEffects();
    initializeIslamicPatterns();
    initializeMobileOptimizations();
    setActivePage();
    
    console.log('SHANTISONGHO website initialized successfully');
});

// Theme Management
function initializeTheme() {
    document.body.classList.toggle('dark', isDarkMode);
    updateDarkModeToggle();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggle();
    
    // Animate the transition
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateDarkModeToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn, .mobile-toggle-btn');
    const sliders = document.querySelectorAll('.toggle-slider, .mobile-toggle-slider');
    
    toggleBtns.forEach((btn, index) => {
        const slider = sliders[index];
        
        if (isDarkMode) {
            btn.style.background = 'linear-gradient(135deg, #3b82f6, #1e40af)';
            if (slider) {
                slider.style.transform = 'translateX(1.5rem) rotate(180deg)';
            }
        } else {
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            if (slider) {
                slider.style.transform = 'translateX(0) rotate(0deg)';
            }
        }
    });
}

// Navigation Functions
function navigateTo(page) {
    // Smooth transition effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

function setActivePage() {
    const navBtns = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(currentPage)) {
            btn.classList.add('active');
        }
    });
}

// Logo Animation and Scroll to Top
function logoRefreshAnimation() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;
    
    logo.classList.add('logo-refresh');
    logo.style.animation = 'logoRefresh 0.8s ease-in-out';
    
    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        logo.classList.remove('logo-refresh');
        logo.style.animation = '';
    }, 800);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Information Dialogs
function showInfo(type) {
    let title, message;
    
    switch(type) {
        case 'investment':
            title = 'Investment Information';
            message = 'Detailed investment guides and opportunities will be available after login. Our investment plans are 100% Sharia-compliant with transparent profit-sharing systems.';
            break;
        case 'terms':
            title = 'Terms & Conditions';
            message = 'Our terms and conditions are based on Islamic financial principles. All transactions are interest-free and follow strict Sharia compliance guidelines.';
            break;
        default:
            title = 'Information';
            message = 'Information not available at the moment.';
    }
    
    showCustomModal(title, message);
}

function showTerms() {
    const termsContent = `
        <h3>SHANTISONGHO Terms and Conditions</h3>
        <br>
        <p><strong>1. Islamic Principles:</strong> All financial services are 100% Sharia-compliant and interest-free.</p>
        <br>
        <p><strong>2. Member Obligations:</strong> Members must provide accurate information and follow Islamic financial ethics.</p>
        <br>
        <p><strong>3. Investment Guidelines:</strong> All investments are subject to profit-sharing and risk-sharing principles.</p>
        <br>
        <p><strong>4. Community Responsibility:</strong> Members are expected to contribute to community welfare and development.</p>
        <br>
        <p><strong>5. Privacy:</strong> Member information is protected according to Islamic privacy principles and modern data protection standards.</p>
    `;
    
    showCustomModal('Terms & Conditions', termsContent);
}

function showCustomModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = createCustomModal();
    }
    
    const modalTitle = modal.querySelector('.modal-title');
    const modalContent = modal.querySelector('.modal-content-body');
    
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Animation
    setTimeout(() => {
        modal.classList.add('modal-show');
    }, 10);
}

function createCustomModal() {
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeCustomModal()"></div>
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title"></h4>
                    <button class="modal-close" onclick="closeCustomModal()">&times;</button>
                </div>
                <div class="modal-content-body"></div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeCustomModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .custom-modal.modal-show {
            opacity: 1;
        }
        
        .modal-backdrop {
            position: absolute;
            width: 100%;
            height: 100%;
        }
        
        .modal-dialog {
            position: relative;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }
        
        .modal-show .modal-dialog {
            transform: scale(1);
        }
        
        .modal-content {
            background: var(--card);
            border-radius: 1rem;
            border: 1px solid var(--border);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            margin: 0;
            color: var(--primary-color);
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--muted-foreground);
            transition: color 0.3s ease;
        }
        
        .modal-close:hover {
            color: var(--foreground);
        }
        
        .modal-content-body {
            padding: 1.5rem;
            color: var(--foreground);
            line-height: 1.6;
        }
        
        .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border);
            text-align: right;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    return modal;
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('modal-show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Scroll Effects and Parallax
function initializeScrollEffects() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
}

function onScroll() {
    scrollY = window.pageYOffset;
    requestTick();
}

function onResize() {
    requestTick();
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

function updateParallax() {
    updateScrollAnimations();
    updateNavbarOnScroll();
    ticking = false;
}

function updateScrollAnimations() {
    const patterns = document.querySelector('.animated-patterns');
    if (patterns) {
        const speed = 0.1;
        const yPos = -(scrollY * speed);
        patterns.style.transform = `translateY(${yPos}px)`;
    }
    
    // Reveal animations
    const elements = document.querySelectorAll('.service-card, .about-text, .footer-section');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
            element.classList.add('fade-in-up');
        }
    });
}

function updateNavbarOnScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (scrollY > 100) {
        navbar.style.background = isDarkMode ? 
            'rgba(15, 20, 25, 0.98)' : 
            'rgba(255, 255, 255, 0.98)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.15)';
    } else {
        navbar.style.background = isDarkMode ? 
            'rgba(30, 41, 54, 0.95)' : 
            'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.1)';
    }
}

// Enhanced Animations
function initializeAnimations() {
    addHoverEffects();
    addButtonAnimations();
    addCardAnimations();
    addFormAnimations();
}

function addHoverEffects() {
    // Service cards enhanced hover
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(34, 197, 94, 0.2)';
            
            const icon = this.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'scale(1.15) rotate(10deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.1)';
            
            const icon = this.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Logo hover effect
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.addEventListener('mouseenter', function() {
            const logoImg = this.querySelector('.logo-placeholder, .logo-img');
            const logoText = this.querySelector('.logo-text');
            
            if (logoImg) {
                logoImg.style.transform = 'scale(1.1) rotate(12deg)';
            }
            if (logoText) {
                logoText.style.transform = 'scale(1.05)';
            }
        });
        
        navLogo.addEventListener('mouseleave', function() {
            const logoImg = this.querySelector('.logo-placeholder, .logo-img');
            const logoText = this.querySelector('.logo-text');
            
            if (logoImg) {
                logoImg.style.transform = 'scale(1) rotate(0deg)';
            }
            if (logoText) {
                logoText.style.transform = 'scale(1)';
            }
        });
    }
}

function addButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-3px) scale(1.02)';
                this.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }
        });
        
        btn.addEventListener('mousedown', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0) scale(0.98)';
            }
        });
        
        btn.addEventListener('mouseup', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            }
        });
    });
}

function addCardAnimations() {
    const cards = document.querySelectorAll('.login-card, .signup-card, .help-card, .info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 40px rgba(34, 197, 94, 0.15)';
        });
    });
}

function addFormAnimations() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary-color)';
            this.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
            this.style.transform = 'scale(1.01)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border)';
            this.style.boxShadow = 'none';
            this.style.transform = 'scale(1)';
        });
    });
}

// Islamic Patterns and Background
function initializeIslamicPatterns() {
    createFloatingPatterns();
    createIslamicGeometry();
    animatePatterns();
}

function createFloatingPatterns() {
    const patternsContainer = document.querySelector('.animated-patterns');
    if (!patternsContainer) return;
    
    // Clear existing patterns
    patternsContainer.innerHTML = '';
    
    // Create various Islamic geometric shapes
    const patterns = [
        { type: 'circle', count: 3 },
        { type: 'star', count: 2 },
        { type: 'octagon', count: 2 },
        { type: 'diamond', count: 3 }
    ];
    
    patterns.forEach(patternType => {
        for (let i = 0; i < patternType.count; i++) {
            const element = createPatternElement(patternType.type);
            patternsContainer.appendChild(element);
        }
    });
}

function createPatternElement(type) {
    const element = document.createElement('div');
    element.className = `floating-pattern pattern-${type}`;
    
    const size = Math.random() * 60 + 40;
    const opacity = Math.random() * 0.3 + 0.1;
    const duration = Math.random() * 10 + 15;
    const delay = Math.random() * 5;
    
    element.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        opacity: ${opacity};
        animation: islamicFloat ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        pointer-events: none;
        z-index: 1;
    `;
    
    // Create the shape based on type
    switch (type) {
        case 'circle':
            element.style.border = '2px solid rgba(34, 197, 94, 0.6)';
            element.style.borderRadius = '50%';
            break;
        case 'star':
            element.innerHTML = createStarSVG();
            break;
        case 'octagon':
            element.style.border = '2px solid rgba(59, 130, 246, 0.6)';
            element.style.clipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
            break;
        case 'diamond':
            element.style.border = '2px solid rgba(6, 182, 212, 0.6)';
            element.style.transform = 'rotate(45deg)';
            break;
    }
    
    return element;
}

function createStarSVG() {
    return `
        <svg width="100%" height="100%" viewBox="0 0 60 60" style="color: rgba(34, 197, 94, 0.6);">
            <path d="M30,5 L35,20 L50,20 L40,30 L45,45 L30,35 L15,45 L20,30 L10,20 L25,20 Z" 
                  fill="currentColor" opacity="0.6"/>
        </svg>
    `;
}

function createIslamicGeometry() {
    // Add more complex Islamic geometric patterns
    const patternsContainer = document.querySelector('.animated-patterns');
    if (!patternsContainer) return;
    
    // Create mosque silhouette
    const mosque = document.createElement('div');
    mosque.className = 'mosque-silhouette';
    mosque.style.cssText = `
        position: absolute;
        top: 60%;
        left: 5%;
        opacity: 0.1;
        z-index: 1;
    `;
    mosque.innerHTML = createMosqueSVG();
    patternsContainer.appendChild(mosque);
    
    // Create peaceful people silhouettes
    const people = document.createElement('div');
    people.className = 'people-silhouette';
    people.style.cssText = `
        position: absolute;
        bottom: 20%;
        right: 10%;
        opacity: 0.08;
        z-index: 1;
    `;
    people.innerHTML = createPeopleSVG();
    patternsContainer.appendChild(people);
    
    // Create financial growth symbol
    const finance = document.createElement('div');
    finance.className = 'finance-symbol';
    finance.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0.12;
        z-index: 1;
        animation: pulse 4s ease-in-out infinite;
    `;
    finance.innerHTML = createFinanceSVG();
    patternsContainer.appendChild(finance);
}

function createMosqueSVG() {
    return `
        <svg width="120" height="90" viewBox="0 0 80 60" style="color: var(--primary-color);">
            <path d="M20 50 L20 30 C20 25 25 20 30 20 L50 20 C55 20 60 25 60 30 L60 50 Z" fill="currentColor"/>
            <circle cx="40" cy="15" r="8" fill="currentColor"/>
            <rect x="38" y="5" width="4" height="15" fill="currentColor"/>
            <circle cx="25" cy="25" r="3" fill="currentColor"/>
            <circle cx="55" cy="25" r="3" fill="currentColor"/>
        </svg>
    `;
}

function createPeopleSVG() {
    return `
        <svg width="150" height="60" viewBox="0 0 100 40" style="color: var(--blue-primary);">
            <ellipse cx="20" cy="35" rx="15" ry="5" fill="currentColor" opacity="0.3"/>
            <ellipse cx="50" cy="35" rx="15" ry="5" fill="currentColor" opacity="0.3"/>
            <ellipse cx="80" cy="35" rx="15" ry="5" fill="currentColor" opacity="0.3"/>
            <circle cx="20" cy="15" r="6" fill="currentColor"/>
            <rect x="17" y="20" width="6" height="15" fill="currentColor"/>
            <circle cx="50" cy="15" r="6" fill="currentColor"/>
            <rect x="47" y="20" width="6" height="15" fill="currentColor"/>
            <circle cx="80" cy="15" r="6" fill="currentColor"/>
            <rect x="77" y="20" width="6" height="15" fill="currentColor"/>
        </svg>
    `;
}

function createFinanceSVG() {
    return `
        <svg width="80" height="80" viewBox="0 0 60 60" style="color: var(--green-primary);">
            <path d="M10 40 Q20 20 30 30 Q40 10 50 25" stroke="currentColor" stroke-width="3" fill="none"/>
            <circle cx="30" cy="30" r="12" fill="currentColor" opacity="0.6"/>
            <text x="30" y="37" text-anchor="middle" font-size="14" font-weight="bold" fill="white">৳</text>
        </svg>
    `;
}

function animatePatterns() {
    // Add CSS animations for Islamic patterns
    const style = document.createElement('style');
    style.textContent = `
        @keyframes islamicFloat {
            0%, 100% { 
                transform: translateY(0px) rotate(0deg) scale(1); 
                opacity: var(--start-opacity, 0.3);
            }
            25% { 
                transform: translateY(-30px) rotate(90deg) scale(1.1); 
                opacity: calc(var(--start-opacity, 0.3) * 1.5);
            }
            50% { 
                transform: translateY(-60px) rotate(180deg) scale(1.2); 
                opacity: calc(var(--start-opacity, 0.3) * 2);
            }
            75% { 
                transform: translateY(-30px) rotate(270deg) scale(1.1); 
                opacity: calc(var(--start-opacity, 0.3) * 1.5);
            }
        }
        
        .floating-pattern:hover {
            animation-duration: 3s !important;
            opacity: 0.8 !important;
        }
        
        @keyframes pulse {
            0%, 100% { 
                transform: translateX(-50%) scale(1); 
                opacity: 0.12; 
            }
            50% { 
                transform: translateX(-50%) scale(1.1); 
                opacity: 0.2; 
            }
        }
        
        .mosque-silhouette,
        .people-silhouette,
        .finance-symbol {
            transition: opacity 0.3s ease;
        }
        
        .mosque-silhouette:hover,
        .people-silhouette:hover,
        .finance-symbol:hover {
            opacity: 0.3 !important;
        }
    `;
    document.head.appendChild(style);
}

// Mobile Optimizations
function initializeMobileOptimizations() {
    if (window.innerWidth <= 768) {
        optimizeForMobile();
    }
    
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            optimizeForMobile();
        } else {
            removeOptimizations();
        }
    });
}

function optimizeForMobile() {
    // Reduce animation complexity for mobile
    const patterns = document.querySelectorAll('.floating-pattern');
    patterns.forEach(pattern => {
        pattern.style.animationDuration = '8s';
    });
    
    // Optimize touch interactions
    const touchElements = document.querySelectorAll('.btn, .nav-btn, .service-card, .user-type-btn');
    touchElements.forEach(element => {
        element.style.touchAction = 'manipulation';
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        }, { passive: true });
    });
    
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.style.fontSize = '16px';
    });
}

function removeOptimizations() {
    // Remove mobile-specific optimizations when on desktop
    const patterns = document.querySelectorAll('.floating-pattern');
    patterns.forEach(pattern => {
        pattern.style.animationDuration = '';
    });
}

// Performance Monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`SHANTISONGHO website loaded in ${loadTime}ms`);
            
            // Log performance metrics
            if (loadTime > 3000) {
                console.warn('Website loading slowly, consider optimizations');
            }
        });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Error Handling
window.addEventListener('error', function(e) {
    console.error('SHANTISONGHO Website Error:', e.error);
});

// Service Worker Registration (for offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be implemented for production
        console.log('Service worker support detected');
    });
}

// Mobile Menu Toggle (backup function in case navigation.js doesn't load)
function toggleMobileMenu() {
    if (window.SHANTISONGHO_NAV && window.SHANTISONGHO_NAV.toggleMobileMenu) {
        return window.SHANTISONGHO_NAV.toggleMobileMenu();
    }
    
    // Fallback implementation
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (!mobileMenu || !menuBtn) return;
    
    const isOpen = mobileMenu.classList.contains('active');
    
    if (isOpen) {
        mobileMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        setTimeout(() => {
            mobileMenu.style.display = 'none';
        }, 300);
    } else {
        mobileMenu.style.display = 'block';
        setTimeout(() => {
            mobileMenu.classList.add('active');
            menuBtn.classList.add('active');
        }, 10);
    }
}

// Ensure mobile menu works on window resize
function handleMobileMenuResize() {
    if (window.innerWidth > 768) {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            if (menuBtn) menuBtn.classList.remove('active');
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 300);
        }
    }
}

// Add resize listener for mobile menu
window.addEventListener('resize', handleMobileMenuResize);

// Ensure navbar stays fixed at all times
function enforceNavbarPosition() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Force fixed positioning
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.left = '0';
        navbar.style.right = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '1000';
        navbar.style.transform = 'none';
    }
    
    // Ensure main content has proper spacing
    const mainContent = document.querySelector('.main-content, .login-main, .signup-main');
    if (mainContent) {
        const navbarHeight = navbar ? navbar.offsetHeight : 70;
        mainContent.style.marginTop = Math.max(navbarHeight, 70) + 'px';
    }
}

// Run navbar position enforcement regularly
setInterval(enforceNavbarPosition, 1000);

// Run on scroll to maintain position
window.addEventListener('scroll', enforceNavbarPosition, { passive: true });

// Run on any user interaction
document.addEventListener('click', enforceNavbarPosition);
document.addEventListener('touchstart', enforceNavbarPosition, { passive: true });

// Export functions for use in other files
window.SHANTISONGHO = {
    toggleDarkMode,
    navigateTo,
    logoRefreshAnimation,
    scrollToTop,
    showInfo,
    showTerms,
    setActivePage,
    toggleMobileMenu
};