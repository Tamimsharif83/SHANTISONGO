// Global Variables
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let mobileMenuOpen = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeAnimations();
    initializeScrollEffects();
    initializeMobileMenu();
    console.log('SHANTISONGHO website initialized');
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

// Navigation
function navigateTo(page) {
    // Close mobile menu if open
    if (mobileMenuOpen) {
        toggleMobileMenu();
    }
    
    // Add loading effect
    document.body.style.opacity = '0.9';
    document.body.style.transition = 'opacity 0.3s ease';
    
    // Create ripple effect
    createRippleEffect(event.target);
    
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

function logoRefresh() {
    const logo = document.querySelector('.nav-logo');
    const logoIcon = document.querySelector('.logo-icon');
    
    // Add refresh animation
    logo.style.transform = 'scale(1.1) rotate(360deg)';
    logoIcon.style.filter = 'drop-shadow(0 8px 16px rgba(34, 197, 94, 0.5))';
    
    setTimeout(() => {
        logo.style.transform = '';
        logoIcon.style.filter = '';
    }, 600);
    
    // Smooth scroll to top with easing
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Add particles effect
    createParticles();
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                toggleMobileMenu();
            }
        });
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const spans = menuBtn.querySelectorAll('span');
    
    mobileMenuOpen = !mobileMenuOpen;
    
    if (mobileMenuOpen) {
        mobileMenu.style.display = 'block';
        setTimeout(() => {
            mobileMenu.classList.add('active');
            mobileMenu.style.opacity = '1';
            mobileMenu.style.transform = 'translateY(0)';
        }, 10);
        
        // Animate hamburger to X
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        
        menuBtn.style.transform = 'rotate(90deg)';
    } else {
        mobileMenu.classList.remove('active');
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

// Information Modal with enhanced styling
function showInfo(type) {
    let title, message, icon;
    
    switch(type) {
        case 'investment':
            title = '🏦 Investment Information';
            message = 'Our Sharia-compliant investment plans offer transparent profit-sharing with no hidden fees. All investments follow strict Islamic guidelines and are supervised by our renowned Sharia board.\n\n✅ 100% Halal Investment\n✅ Transparent Profit Sharing\n✅ No Hidden Fees\n✅ Sharia Board Supervised';
            break;
        case 'terms':
            title = '📋 Terms & Conditions';
            message = 'Our terms are based on Islamic financial principles. All transactions are interest-free, transparent, and follow Sharia compliance guidelines established by renowned Islamic scholars.\n\n✅ Interest-Free Operations\n✅ Full Transparency\n✅ Islamic Compliance\n✅ Member Protection';
            break;
        case 'privacy':
            title = '🔒 Privacy Policy';
            message = 'We protect your personal information according to Islamic privacy principles and modern data protection standards. Your data is never shared without consent.\n\n✅ Data Protection\n✅ Privacy Compliance\n✅ Secure Storage\n✅ No Unauthorized Sharing';
            break;
        default:
            title = 'ℹ️ Information';
            message = 'For more detailed information, please contact us directly or visit our member portal.';
    }
    
    // Create custom modal
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
    document.querySelectorAll('.service-card, .feature, .stat-item').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Add stagger animation to hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach((btn, index) => {
        btn.style.animationDelay = `${0.8 + (index * 0.2)}s`;
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
                'rgba(15, 23, 42, 0.98)' : 
                'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(34, 197, 94, 0.2)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = isDarkMode ? 
                'rgba(15, 23, 42, 0.95)' : 
                'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(34, 197, 94, 0.1)';
        }
        
        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const parallaxSpeed = currentScrollY * 0.5;
            heroSection.style.transform = `translateY(${parallaxSpeed}px)`;
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// Create ripple effect
function createRippleEffect(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(34, 197, 94, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Counter Animation Function
function animateCounters() {
  const counters = document.querySelectorAll('.stat-item h3');
  
  counters.forEach(counter => {
    const target = counter.textContent;
    let finalValue, suffix = '';
    
    // Extract numeric value and suffix
    if (target.includes('৳') && target.includes('L')) {
      // Handle currency with L (Lakh)
      finalValue = parseFloat(target.replace('৳', '').replace('L+', '').replace('+', ''));
      suffix = 'L+';
    } else if (target.includes('৳')) {
      // Handle currency only
      finalValue = parseFloat(target.replace('৳', '').replace('+', ''));
      suffix = '+';
    } else if (target.includes('+')) {
      // Handle numbers with +
      finalValue = parseFloat(target.replace('+', ''));
      suffix = '+';
    } else if (target.includes('%')) {
      // Handle percentage
      finalValue = parseFloat(target.replace('%', ''));
      suffix = '%';
    } else if (target.includes('/')) {
      // Handle 24/7 format
      finalValue = target;
      suffix = '';
    } else {
      // Handle plain numbers
      finalValue = parseFloat(target);
    }
    
    // Special handling for 24/7
    if (target === '24/7') {
      animateSpecialText(counter, '24/7');
      return;
    }
    
    // Reset counter to 0
    counter.textContent = target.includes('৳') ? '৳0' + (suffix.includes('L') ? 'L' : '') : '0' + suffix;
    
    // Animation parameters
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;
    const increment = finalValue / steps;
    
    let currentValue = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      currentValue += increment;
      
      if (step >= steps) {
        currentValue = finalValue;
        clearInterval(timer);
      }
      
      // Format the display value
      let displayValue;
      if (target.includes('৳')) {
        if (suffix.includes('L')) {
          displayValue = `৳${currentValue.toFixed(1)}${suffix}`;
        } else {
          displayValue = `৳${Math.floor(currentValue)}${suffix}`;
        }
      } else {
        displayValue = `${currentValue % 1 === 0 ? Math.floor(currentValue) : currentValue.toFixed(1)}${suffix}`;
      }
      
      counter.textContent = displayValue;
    }, stepDuration);
  });
}

// Special animation for 24/7 text
function animateSpecialText(element, finalText) {
  element.textContent = '0/0';
  
  setTimeout(() => {
    element.textContent = '12/3';
  }, 500);
  
  setTimeout(() => {
    element.textContent = '18/5';
  }, 1000);
  
  setTimeout(() => {
    element.textContent = '22/6';
  }, 1500);
  
  setTimeout(() => {
    element.textContent = finalText;
  }, 2000);
}

// Intersection Observer for triggering animation when section comes into view
function setupScrollTrigger() {
  const statsSection = document.querySelector('.stats-section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.5 // Trigger when 50% of the section is visible
  });
  
  if (statsSection) {
    observer.observe(statsSection);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Option 1: Trigger animation immediately
  // animateCounters();
  
  // Option 2: Trigger animation when section comes into view (recommended)
  setupScrollTrigger();
  
  // Option 3: Trigger animation after a delay
  // setTimeout(animateCounters, 500);
});

// Optional: Function to restart animation (useful for testing)
function restartAnimation() {
  animateCounters();
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
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#22c55e';
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

// Add CSS animations for particles and ripples
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
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

// Performance optimization - pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    const animatedElements = document.querySelectorAll('[style*="animation"]');
    
    if (document.hidden) {
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

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

// Add smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize everything when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}