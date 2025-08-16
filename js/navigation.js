// SHANTISONGHO Website - Navigation JavaScript
// Enhanced mobile navigation with animations

// Mobile Menu State
let isMobileMenuOpen = false;

// Initialize Navigation
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeNavigationAnimations();
    handleNavigationResize();
});

// Mobile Menu Functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (!mobileMenu || !menuBtn) return;
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        openMobileMenu(mobileMenu, menuBtn);
    } else {
        closeMobileMenu(mobileMenu, menuBtn);
    }
}

function openMobileMenu(menu, btn) {
    menu.classList.add('active');
    menu.style.display = 'block';
    btn.classList.add('active');
    
    // Animate menu items
    const menuItems = menu.querySelectorAll('.mobile-nav-btn');
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
    
    // Animate hamburger to X
    const spans = btn.querySelectorAll('span');
    if (spans.length === 3) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    }
    
    // Add backdrop click listener
    setTimeout(() => {
        document.addEventListener('click', handleBackdropClick);
    }, 100);
}

function closeMobileMenu(menu, btn) {
    menu.classList.remove('active');
    btn.classList.remove('active');
    
    // Animate menu items out
    const menuItems = menu.querySelectorAll('.mobile-nav-btn');
    menuItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'all 0.2s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
        }, index * 50);
    });
    
    // Reset hamburger
    const spans = btn.querySelectorAll('span');
    if (spans.length === 3) {
        spans[0].style.transform = 'rotate(0) translate(0, 0)';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'rotate(0) translate(0, 0)';
    }
    
    // Hide menu after animation
    setTimeout(() => {
        menu.style.display = 'none';
    }, 300);
    
    // Remove backdrop click listener
    document.removeEventListener('click', handleBackdropClick);
}

function handleBackdropClick(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (!mobileMenu.contains(event.target) && 
        !menuBtn.contains(event.target) && 
        isMobileMenuOpen) {
        toggleMobileMenu();
    }
}

// Initialize Mobile Menu
function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!menuBtn) return;
    
    // Ensure mobile menu starts hidden
    if (mobileMenu) {
        mobileMenu.style.display = 'none';
        mobileMenu.classList.remove('active');
    }
    
    // Reset menu button state
    menuBtn.classList.remove('active');
    
    // Add hamburger animation styles
    const spans = menuBtn.querySelectorAll('span');
    spans.forEach(span => {
        span.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        span.style.transformOrigin = 'center';
        span.style.width = '24px';
        span.style.height = '3px';
        span.style.background = 'var(--foreground)';
        span.style.display = 'block';
        span.style.borderRadius = '2px';
        span.style.margin = '2px 0';
    });
    
    // Add click event listener as backup
    menuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Force mobile menu visibility on mobile screens
    updateMobileMenuVisibility();
}

function updateMobileMenuVisibility() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (window.innerWidth <= 768) {
        if (menuBtn) {
            menuBtn.style.display = 'flex';
        }
        if (navLinks) {
            navLinks.style.display = 'none';
        }
    } else {
        if (menuBtn) {
            menuBtn.style.display = 'none';
        }
        if (navLinks) {
            navLinks.style.display = 'flex';
        }
        
        // Close mobile menu if open
        if (isMobileMenuOpen) {
            toggleMobileMenu();
        }
    }
}

// Navigation Animations
function initializeNavigationAnimations() {
    addNavigationHoverEffects();
    addActiveStateAnimations();
    addLogoAnimations();
}

function addNavigationHoverEffects() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.2)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            }
        });
        
        // Add click animation
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = this.classList.contains('active') ? '' : 'translateY(-2px)';
        });
    });
}

function addActiveStateAnimations() {
    const navBtns = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    
    navBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            btn.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
        }
    });
}

function addLogoAnimations() {
    const navLogo = document.querySelector('.nav-logo');
    if (!navLogo) return;
    
    // Enhanced logo hover animation
    navLogo.addEventListener('mouseenter', function() {
        const logoImg = this.querySelector('.logo-placeholder svg, .logo-img');
        const logoText = this.querySelector('.logo-text');
        
        if (logoImg) {
            logoImg.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            logoImg.style.transform = 'scale(1.1) rotate(12deg)';
            logoImg.style.filter = 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3))';
        }
        
        if (logoText) {
            logoText.style.transition = 'all 0.3s ease';
            logoText.style.transform = 'scale(1.05)';
            
            const h1 = logoText.querySelector('h1');
            const p = logoText.querySelector('p');
            
            if (h1) h1.style.textShadow = '0 2px 4px rgba(34, 197, 94, 0.2)';
            if (p) p.style.color = 'var(--blue-primary)';
        }
    });
    
    navLogo.addEventListener('mouseleave', function() {
        const logoImg = this.querySelector('.logo-placeholder svg, .logo-img');
        const logoText = this.querySelector('.logo-text');
        
        if (logoImg) {
            logoImg.style.transform = 'scale(1) rotate(0deg)';
            logoImg.style.filter = '';
        }
        
        if (logoText) {
            logoText.style.transform = 'scale(1)';
            
            const h1 = logoText.querySelector('h1');
            const p = logoText.querySelector('p');
            
            if (h1) h1.style.textShadow = '';
            if (p) p.style.color = 'var(--muted-foreground)';
        }
    });
}

// Enhanced Logo Refresh Animation
function logoRefreshAnimation() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;
    
    // Add multiple animation phases
    logo.style.animation = 'logoRefreshComplex 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Add sparkle effect
    createSparkleEffect(logo);
    
    // Smooth scroll to top with easing
    smoothScrollToTop();
    
    // Reset animation after completion
    setTimeout(() => {
        logo.style.animation = '';
    }, 1200);
}

function createSparkleEffect(element) {
    const sparkles = [];
    const sparkleCount = 6;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'logo-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: sparkleAnimation 0.8s ease-out forwards;
            animation-delay: ${i * 0.1}s;
        `;
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (rect.left + rect.width / 2) + 'px';
        sparkle.style.top = (rect.top + rect.height / 2) + 'px';
        
        document.body.appendChild(sparkle);
        sparkles.push(sparkle);
        
        // Random direction for each sparkle
        const angle = (i * 60) * Math.PI / 180;
        const distance = 30 + Math.random() * 20;
        
        sparkle.style.setProperty('--end-x', Math.cos(angle) * distance + 'px');
        sparkle.style.setProperty('--end-y', Math.sin(angle) * distance + 'px');
    }
    
    // Clean up sparkles
    setTimeout(() => {
        sparkles.forEach(sparkle => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        });
    }, 1000);
}

function smoothScrollToTop() {
    const startY = window.pageYOffset;
    const duration = 800;
    const startTime = performance.now();
    
    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (cubic-bezier)
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        window.scrollTo(0, startY * (1 - ease));
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }
    
    requestAnimationFrame(animateScroll);
}

// Page Navigation with Smooth Transitions
function navigateToWithTransition(page) {
    // Add page exit animation
    document.body.classList.add('page-transition-exit');
    
    // Navigate after animation
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

// Handle Window Resize
function handleNavigationResize() {
    let resizeTimer;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && isMobileMenuOpen) {
                // Close mobile menu when resizing to desktop
                toggleMobileMenu();
            }
            
            // Re-initialize navigation elements
            updateNavigationForScreenSize();
        }, 250);
    });
}

function updateNavigationForScreenSize() {
    const navbar = document.querySelector('.navbar');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Update menu visibility
    updateMobileMenuVisibility();
    
    if (window.innerWidth <= 768) {
        // Mobile view
        navbar?.classList.add('mobile-nav');
        if (mobileMenu && !mobileMenu.querySelector('.mobile-dark-toggle')) {
            addMobileDarkModeToggle();
        }
    } else {
        // Desktop view
        navbar?.classList.remove('mobile-nav');
        if (isMobileMenuOpen) {
            const menuBtn = document.querySelector('.mobile-menu-btn');
            const mobileMenuEl = document.getElementById('mobileMenu');
            if (mobileMenuEl && menuBtn) {
                closeMobileMenu(mobileMenuEl, menuBtn);
            }
        }
    }
}

function addMobileDarkModeToggle() {
    const mobileMenuContent = document.querySelector('.mobile-menu-content');
    if (!mobileMenuContent) return;
    
    const darkToggle = document.createElement('div');
    darkToggle.className = 'mobile-dark-toggle';
    darkToggle.innerHTML = `
        <span>🌞</span>
        <button class="mobile-toggle-btn" onclick="toggleDarkMode()">
            <span class="mobile-toggle-slider"></span>
        </button>
        <span>🌙</span>
    `;
    
    mobileMenuContent.appendChild(darkToggle);
}

// Breadcrumb Navigation (for future use)
function updateBreadcrumb() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let breadcrumbText = 'Home';
    
    switch (currentPage) {
        case 'login.html':
            breadcrumbText = 'Home > Login';
            break;
        case 'signup.html':
            breadcrumbText = 'Home > Sign Up';
            break;
    }
    
    breadcrumb.textContent = breadcrumbText;
}

// Keyboard Navigation Support
document.addEventListener('keydown', function(event) {
    // ESC key to close mobile menu
    if (event.key === 'Escape' && isMobileMenuOpen) {
        toggleMobileMenu();
    }
    
    // Tab navigation enhancement
    if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

// Remove keyboard navigation class on mouse use
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Add CSS for navigation animations
const navigationStyles = document.createElement('style');
navigationStyles.textContent = `
    /* Enhanced Logo Refresh Animation */
    @keyframes logoRefreshComplex {
        0% { transform: scale(1) rotate(0deg); opacity: 1; }
        15% { transform: scale(1.1) rotate(45deg); opacity: 0.9; }
        30% { transform: scale(1.3) rotate(90deg); opacity: 0.8; }
        45% { transform: scale(1.2) rotate(135deg); opacity: 0.9; }
        60% { transform: scale(1.4) rotate(180deg); opacity: 0.7; }
        75% { transform: scale(1.2) rotate(225deg); opacity: 0.9; }
        90% { transform: scale(1.1) rotate(315deg); opacity: 0.95; }
        100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
    
    /* Sparkle Animation */
    @keyframes sparkleAnimation {
        0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)) scale(1);
            opacity: 0.8;
        }
        100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0);
            opacity: 0;
        }
    }
    
    /* Page Transition */
    .page-transition-exit {
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease-out;
    }
    
    /* Mobile Menu Base Styles */
    .mobile-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--card);
        border-top: 1px solid var(--border);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 0;
        overflow: hidden;
    }
    
    .mobile-menu.active {
        opacity: 1;
        transform: translateY(0);
        max-height: 500px;
    }
    
    .mobile-menu-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .mobile-nav-btn {
        padding: 0.75rem 1rem;
        border: none;
        background: none;
        color: var(--foreground);
        text-align: left;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
        font-weight: 500;
        font-size: 1rem;
    }
    
    .mobile-nav-btn:hover,
    .mobile-nav-btn.active {
        background: var(--gradient-green-start);
        color: var(--primary-color);
        transform: translateX(5px);
    }
    
    .mobile-nav-btn:active {
        transform: scale(0.98) translateX(5px);
    }
    
    /* Mobile Menu Button Styles */
    .mobile-menu-btn {
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.375rem;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-btn:hover {
        background: var(--gradient-green-start);
    }
    
    .mobile-menu-btn span {
        width: 24px;
        height: 3px;
        background: var(--foreground);
        display: block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 2px;
        margin: 2px 0;
        transform-origin: center;
    }
    
    .mobile-menu-btn:hover span {
        background: var(--primary-color);
    }
    
    /* Mobile Menu Button Animation */
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
        transform: translateX(-20px);
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
    }
    
    /* Keyboard Navigation */
    .keyboard-navigation .nav-btn:focus,
    .keyboard-navigation .mobile-nav-btn:focus,
    .keyboard-navigation .btn:focus {
        outline: 3px solid var(--primary-color);
        outline-offset: 2px;
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.2);
    }
    
    /* Enhanced Dark Mode Toggle for Mobile */
    .mobile-dark-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem 0;
        margin-top: 1rem;
        border-top: 1px solid var(--border);
    }
    
    .mobile-toggle-btn {
        position: relative;
        width: 3rem;
        height: 1.75rem;
        border: none;
        border-radius: 1rem;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .mobile-toggle-slider {
        position: absolute;
        top: 0.125rem;
        left: 0.125rem;
        width: 1.5rem;
        height: 1.5rem;
        background: white;
        border-radius: 50%;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .dark .mobile-toggle-slider {
        transform: translateX(1.25rem) rotate(180deg);
    }
    
    /* Navigation responsiveness improvements */
    @media (max-width: 768px) {
        .nav-links {
            display: none !important;
        }
        
        .mobile-menu-btn {
            display: flex !important;
        }
        
        .navbar {
            padding: 0.75rem 1rem;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 1000 !important;
        }
        
        .nav-container {
            position: relative;
        }
    }
    
    /* Additional navbar fixed positioning rules */
    .navbar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        z-index: 1000 !important;
        transform: none !important;
    }
    
    /* Ensure main content is below navbar */
    .main-content,
    .login-main,
    .signup-main {
        margin-top: 5rem !important;
        padding-top: 1rem;
    }
    
    /* Mobile specific navbar fixes */
    @media (max-width: 768px) {
        .main-content,
        .login-main,
        .signup-main {
            margin-top: 4rem !important;
        }
        
        .navbar {
            height: auto;
            min-height: 60px;
        }
        
        .nav-container {
            min-height: 60px;
        }
    }
    
    /* Dark mode styles for mobile menu */
    .dark .mobile-menu {
        background: var(--card);
        border-top-color: var(--border);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .dark .mobile-nav-btn {
        color: var(--foreground);
    }
    
    .dark .mobile-nav-btn:hover,
    .dark .mobile-nav-btn.active {
        background: var(--gradient-green-start);
        color: var(--primary-color);
    }
    
    .dark .mobile-menu-btn span {
        background: var(--foreground);
    }
    
    .dark .mobile-menu-btn:hover span {
        background: var(--primary-color);
    }
`;

document.head.appendChild(navigationStyles);

// Navbar scroll behavior
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        // Always keep navbar fixed at top
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.left = '0';
        navbar.style.right = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '1000';
        
        // Optional: Add shadow when scrolled
        if (currentScrollY > 10) {
            navbar.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.2)';
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        
        // Update dark mode styles if active
        if (document.body.classList.contains('dark')) {
            navbar.style.background = currentScrollY > 10 ? 
                'rgba(30, 41, 54, 0.98)' : 
                'rgba(30, 41, 54, 0.95)';
            navbar.style.boxShadow = currentScrollY > 10 ? 
                '0 4px 20px rgba(0, 0, 0, 0.4)' : 
                '0 4px 20px rgba(0, 0, 0, 0.3)';
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// Initialize on page load
window.addEventListener('load', function() {
    updateNavigationForScreenSize();
    updateBreadcrumb();
    handleNavbarScroll();
    
    // Double-check mobile menu initialization
    setTimeout(() => {
        initializeMobileMenu();
    }, 100);
});

// Also initialize on resize
window.addEventListener('resize', function() {
    setTimeout(() => {
        updateNavigationForScreenSize();
    }, 100);
});

// Ensure navbar stays fixed on DOM content load
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.left = '0';
        navbar.style.right = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '1000';
    }
    
    // Ensure main content has proper margin
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.marginTop = '5rem';
    }
});

// Export navigation functions for global use
window.SHANTISONGHO_NAV = {
    toggleMobileMenu,
    logoRefreshAnimation,
    navigateToWithTransition,
    updateBreadcrumb
};