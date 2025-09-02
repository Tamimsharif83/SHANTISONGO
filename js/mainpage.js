// Global Variables
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeAnimations();
    initializeScrollEffects();
    initializeCounters();
    
    // Handle both mobile and desktop dark mode toggles
    const mobileToggleBtn = document.querySelector('.mobile-toggle-btn');
    const mobileDarkToggle = document.querySelector('.mobile-dark-toggle');
    
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDarkMode();
            // Force update after toggle
            requestAnimationFrame(() => updateToggleButton());
        });
    }
    
    if (mobileDarkToggle) {
        mobileDarkToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDarkMode();
            // Force update after toggle
            requestAnimationFrame(() => updateToggleButton());
        });
    }
    
    console.log('SHANTISONGHO mainpage initialized');
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
    if (mobileMenuOpen) {
        toggleMobileMenu();
    }
    
    document.body.style.opacity = '0.9';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = page;
    }, 300);
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
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Add particles effect
    createParticles();
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

// Information Modal
function showInfo(type) {
    let title, message;
    
    switch(type) {
        case 'investment':
            title = '🏦 Investment Information';
            message = 'Our Sharia-compliant investment plans offer transparent profit-sharing with no hidden fees. All investments follow strict Islamic guidelines and are supervised by our renowned Sharia board.\n\n✅ 100% Halal Investment\n✅ Transparent Profit Sharing\n✅ No Hidden Fees\n✅ Sharia Board Supervised';
            break;
        case 'terms':
            title = '📋 Terms & Conditions';
            message = 'Our terms are based on Islamic financial principles. All transactions are interest-free, transparent, and follow Sharia compliance guidelines established by renowned Islamic scholars.\n\n✅ Interest-Free Operations\n✅ Full Transparency\n✅ Islamic Compliance\n✅ Member Protection';
            break;
        default:
            title = 'ℹ️ Information';
            message = 'For more detailed information, please contact us directly or visit our member portal.';
    }
    
    createCustomModal(title, message);
}

function createCustomModal(title, message) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeCustomModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeCustomModal()">Got it!</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
        .custom-modal {
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
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease;
            border: 1px solid var(--border);
        }
        
        .modal-header {
            padding: 1.5rem 1.5rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
            padding: 1rem 1.5rem;
        }
        
        .modal-body p {
            color: var(--muted-foreground);
            line-height: 1.6;
            margin: 0;
        }
        
        .modal-footer {
            padding: 0 1.5rem 1.5rem;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
            from { transform: translateY(-20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        </style>
    `;
    
    // Add styles to head
    if (!document.querySelector('#modal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'modal-styles';
        styleElement.innerHTML = modalStyles;
        document.head.appendChild(styleElement);
    }
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCustomModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCustomModal();
        }
    });
}

function closeCustomModal() {
    const modal = document.querySelector('.custom-modal');
    if (modal) {
        modal.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Initialize Animations
function initializeAnimations() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observe service cards and features
    document.querySelectorAll('.service-card, .about-list li, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Enhanced scroll effects
function initializeScrollEffects() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        // Enhanced navbar scroll effect
        if (currentScrollY > 100) {
            navbar.style.background = isDarkMode ? 
                'rgba(13, 17, 23, 0.98)' : 
                'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(30, 126, 52, 0.2)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = isDarkMode ? 
                'rgba(13, 17, 23, 0.95)' : 
                'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(30, 126, 52, 0.1)';
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// Counter Animation Function
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-item h3[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(counter) {
    const target = parseFloat(counter.dataset.count);
    const isDecimal = target % 1 !== 0;
    const isCurrency = counter.textContent.includes('৳');
    const hasL = counter.textContent.includes('L');
    
    let current = 0;
    const increment = target / 100;
    const duration = 2000;
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        let displayValue = isDecimal ? current.toFixed(1) : Math.floor(current);
        
        if (isCurrency) {
            counter.textContent = `৳${displayValue}${hasL ? 'L+' : '+'}`;
        } else {
            counter.textContent = `${displayValue}+`;
        }
    }, stepTime);
}

// Create particles effect
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '9999';
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#4caf50';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = 'particleFloat 2s ease-out forwards';
        
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
    
    setTimeout(() => {
        particlesContainer.remove();
    }, 2000);
}

// Add CSS animations for particles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0);
        }
    }
    
    @keyframes modalFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(additionalStyles);

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

// Add button hover effects
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn, .nav-btn, .service-card');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
});