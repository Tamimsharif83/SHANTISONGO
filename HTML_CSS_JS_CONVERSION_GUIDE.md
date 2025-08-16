# SHANTISONGHO - HTML/CSS/JavaScript Conversion Guide

This guide explains how to convert the React-based SHANTISONGHO website to pure HTML, CSS, and JavaScript.

## Project Structure (HTML/CSS/JS Version)

```
shantisongho-website/
├── index.html              # Home page
├── login.html              # Login page  
├── signup.html             # Signup page
├── css/
│   ├── styles.css          # Main styles
│   ├── components.css      # Component styles
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── main.js            # Main JavaScript
│   ├── navigation.js      # Navigation functionality
│   ├── login.js           # Login page logic
│   └── signup.js          # Signup page logic
├── images/
│   └── logo.svg           # Organization logo
└── assets/
    └── fonts/             # Custom fonts if needed
```

## 1. Main HTML Files

### index.html (Home Page)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>শান্তিসংঘ (SHANTISONGHO) - Islamic Finance & Community Welfare</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo" onclick="scrollToTop()">
                <img src="images/logo.svg" alt="SHANTISONGHO Logo" class="logo-img">
                <div class="logo-text">
                    <h1>শান্তিসংঘ</h1>
                    <p>SHANTISONGHO</p>
                </div>
            </div>
            
            <div class="nav-links">
                <button class="nav-btn active" onclick="navigateTo('index.html')">Home</button>
                <button class="nav-btn" onclick="navigateTo('login.html')">Login</button>
                <button class="nav-btn" onclick="navigateTo('signup.html')">Sign Up</button>
                
                <div class="dark-mode-toggle">
                    <span class="sun-icon">🌞</span>
                    <button class="toggle-btn" onclick="toggleDarkMode()">
                        <span class="toggle-slider"></span>
                    </button>
                    <span class="moon-icon">🌙</span>
                </div>
            </div>
        </div>
    </nav>

    <!-- Dynamic Background -->
    <div class="background-container">
        <div class="gradient-bg"></div>
        <div class="animated-patterns">
            <!-- Islamic geometric patterns will be added via CSS -->
        </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <img src="images/logo.svg" alt="SHANTISONGHO" class="hero-logo">
                    <h1 class="hero-title bangla">শান্তিসংঘ</h1>
                    <h2 class="hero-subtitle">SHANTISONGHO</h2>
                    <p class="hero-description">Islamic Finance & Community Welfare Organization</p>
                    
                    <div class="hero-buttons">
                        <button class="btn btn-primary" onclick="navigateTo('signup.html')">
                            <span>Join Our Community</span>
                        </button>
                        <button class="btn btn-secondary" onclick="navigateTo('login.html')">
                            <span>Member Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Services Section -->
        <section class="services-section">
            <div class="container">
                <div class="section-header">
                    <h2>Our Services</h2>
                    <p>Sharia-compliant financial solutions for community prosperity</p>
                </div>
                
                <div class="services-grid">
                    <div class="service-card">
                        <div class="service-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                            </svg>
                        </div>
                        <h3>Halal Investment</h3>
                        <p>Sharia-compliant investment opportunities with profit sharing system</p>
                    </div>
                    
                    <div class="service-card">
                        <div class="service-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <h3>Financial Assistance</h3>
                        <p>Interest-free loans and financial support for members in need</p>
                    </div>
                    
                    <div class="service-card">
                        <div class="service-icon cyan">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a5 5 0 11-11 0 5 5 0 0111 0z"/>
                            </svg>
                        </div>
                        <h3>Community Development</h3>
                        <p>Supporting socio-economic and religious development in our community</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <div class="footer-logo">
                            <img src="images/logo.svg" alt="SHANTISONGHO Logo">
                            <div>
                                <p class="footer-title">শান্তিসংঘ</p>
                                <p class="footer-subtitle">SHANTISONGHO</p>
                            </div>
                        </div>
                        <p>Building a peaceful and prosperous community through Islamic financial principles</p>
                        <p class="established">Established: April 10, 2025</p>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Contact Us</h3>
                        <div class="contact-info">
                            <div class="contact-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <a href="mailto:official@shantisongho.org">official@shantisongho.org</a>
                            </div>
                            <div class="contact-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                <span>+880 1XXX-XXXXXX</span>
                            </div>
                            <div class="contact-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <span>Dhaka, Bangladesh</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <div class="footer-links">
                            <button onclick="navigateTo('signup.html')">Become a Member</button>
                            <button onclick="navigateTo('login.html')">Member Portal</button>
                            <button onclick="showInfo('investment')">Investment Guide</button>
                            <button onclick="showInfo('terms')">Terms & Conditions</button>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-bottom-content">
                        <p>© 2025 SHANTISONGHO. All rights reserved. | Built with Islamic principles in mind.</p>
                        <div class="footer-tags">
                            <span>Follow Islamic Finance Guidelines</span>
                            <span>•</span>
                            <span>Halal Investment Only</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </main>

    <script src="js/main.js"></script>
    <script src="js/navigation.js"></script>
</body>
</html>
```

## 2. CSS Files

### css/styles.css (Main Styles)
```css
/* CSS Custom Properties for Theme Colors */
:root {
  --primary-color: #1e7e34;
  --primary-foreground: #ffffff;
  --secondary-color: #e3f2fd;
  --background: #ffffff;
  --foreground: #333333;
  --card: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --muted-foreground: #666666;
  --green-primary: #4caf50;
  --blue-primary: #2196f3;
  --cyan-primary: #00bcd4;
}

.dark {
  --background: #0d1117;
  --foreground: #ffffff;
  --card: #1a1f2e;
  --border: #333;
  --muted-foreground: #999;
  --primary-color: #4caf50;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.6;
  transition: all 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navigation Styles */
.navbar {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.nav-logo:hover .logo-img {
  transform: scale(1.1) rotate(12deg);
}

.logo-img {
  width: 2.5rem;
  height: 2.5rem;
  transition: all 0.3s ease;
}

.logo-text h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  transition: color 0.3s ease;
}

.logo-text p {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin: 0;
  transition: color 0.3s ease;
}

.nav-logo:hover .logo-text h1 {
  color: var(--green-primary);
}

.nav-logo:hover .logo-text p {
  color: var(--blue-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.nav-btn.active {
  background: var(--primary-color);
  color: var(--primary-foreground);
  box-shadow: 0 4px 12px rgba(30, 126, 52, 0.3);
}

.nav-btn:not(.active):hover {
  background: linear-gradient(135deg, var(--green-primary), var(--primary-color));
  color: white;
}

/* Dark Mode Toggle */
.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sun-icon, .moon-icon {
  font-size: 0.875rem;
  transition: transform 0.3s ease;
}

.sun-icon:hover, .moon-icon:hover {
  transform: scale(1.1);
}

.toggle-btn {
  position: relative;
  width: 3rem;
  height: 1.75rem;
  border: none;
  border-radius: 1rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.dark .toggle-btn {
  background: linear-gradient(135deg, #2563eb, #3730a3);
}

.toggle-slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.dark .toggle-slider {
  transform: translateX(1.25rem) rotate(180deg);
}

/* Background Animations */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%,
    rgba(59, 130, 246, 0.1) 50%,
    rgba(6, 182, 212, 0.1) 100%);
  opacity: 0.6;
}

.dark .gradient-bg {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%,
    rgba(16, 185, 129, 0.2) 50%,
    rgba(59, 130, 246, 0.2) 100%);
}

/* Animated Patterns */
.animated-patterns::before,
.animated-patterns::after {
  content: '';
  position: absolute;
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.animated-patterns::before {
  top: 20%;
  left: 10%;
  width: 8rem;
  height: 8rem;
  animation-delay: 0s;
}

.animated-patterns::after {
  bottom: 20%;
  right: 15%;
  width: 6rem;
  height: 6rem;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Main Content */
.main-content {
  margin-top: 4rem;
  position: relative;
  z-index: 1;
}

/* Hero Section */
.hero-section {
  padding: 4rem 0 5rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-logo {
  width: 8rem;
  height: 8rem;
  margin: 0 auto 2rem;
  animation: float 4s ease-in-out infinite;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.5rem;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--muted-foreground);
  margin-bottom: 3rem;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 640px) {
  .hero-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

/* Button Styles */
.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.btn span {
  position: relative;
  z-index: 10;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.btn:hover::before {
  opacity: 1;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--primary-foreground);
}

.btn-primary::before {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.btn-secondary {
  background: var(--secondary-color);
  color: var(--primary-color);
  border: 1px solid var(--border);
}

.btn-secondary::before {
  background: linear-gradient(135deg, var(--blue-primary), var(--cyan-primary));
}

.btn-secondary:hover span {
  color: white;
}

/* Services Section */
.services-section {
  padding: 5rem 0;
  background: rgba(var(--card), 0.5);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: bold;
  color: var(--foreground);
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--muted-foreground);
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.service-card {
  background: var(--card);
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-card:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.service-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: all 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
}

.service-icon.green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.service-card:hover .service-icon.green {
  background: rgba(16, 185, 129, 0.2);
}

.service-icon.blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.service-card:hover .service-icon.blue {
  background: rgba(59, 130, 246, 0.2);
}

.service-icon.cyan {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.service-card:hover .service-icon.cyan {
  background: rgba(6, 182, 212, 0.2);
}

.service-icon svg {
  width: 2rem;
  height: 2rem;
}

.service-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.service-card:hover h3 {
  color: var(--primary-color);
}

.service-card p {
  color: var(--muted-foreground);
  transition: color 0.3s ease;
}

.service-card:hover p {
  color: var(--foreground);
}

/* Footer */
.footer {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.05) 0%,
    rgba(59, 130, 246, 0.05) 100%);
  border-top: 1px solid var(--border);
  padding: 4rem 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(3, 1fr);
  }
}

.footer-section h3 {
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-logo img {
  width: 2.5rem;
  height: 2.5rem;
  transition: transform 0.3s ease;
}

.footer-logo:hover img {
  transform: scale(1.1);
}

.footer-title {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.footer-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.contact-item:hover {
  transform: scale(1.05);
}

.contact-item svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-color);
}

.contact-item a {
  color: var(--blue-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-item a:hover {
  color: #1976d2;
  text-decoration: underline;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links button {
  background: none;
  border: none;
  color: var(--blue-primary);
  text-align: left;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.footer-links button:hover {
  color: #1976d2;
  text-decoration: underline;
  transform: translateX(5px);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}

.footer-bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-bottom-content {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-bottom p {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.footer-tags {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  .nav-links {
    display: none; /* Implement mobile menu */
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .btn {
    min-width: auto;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 0 3rem;
  }
  
  .hero-logo {
    width: 6rem;
    height: 6rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .service-card {
    padding: 1.5rem;
  }
  
  .footer {
    padding: 3rem 0 1.5rem;
  }
}
```

## 3. JavaScript Files

### js/main.js (Main JavaScript)
```javascript
// Theme Management
let isDarkMode = localStorage.getItem('darkMode') === 'true';

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update toggle button state
    updateDarkModeToggle();
}

function updateDarkModeToggle() {
    const toggleBtn = document.querySelector('.toggle-btn');
    const slider = document.querySelector('.toggle-slider');
    
    if (isDarkMode) {
        toggleBtn.style.background = 'linear-gradient(135deg, #2563eb, #3730a3)';
        slider.style.transform = 'translateX(1.25rem) rotate(180deg)';
    } else {
        toggleBtn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
        slider.style.transform = 'translateX(0) rotate(0deg)';
    }
}

// Navigation Functions
function navigateTo(page) {
    window.location.href = page;
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showInfo(type) {
    let message = '';
    switch(type) {
        case 'investment':
            message = 'Investment information will be available after login';
            break;
        case 'terms':
            message = 'Terms and conditions will be displayed here';
            break;
        default:
            message = 'Information not available';
    }
    alert(message);
}

// Parallax Scroll Effect
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.animated-patterns');
    
    parallaxElements.forEach(element => {
        const speed = 0.1;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
    
    ticking = false;
}

function requestParallaxUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

// Enhanced Animations
function addHoverEffects() {
    // Service cards hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-10px)';
            this.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
    });
}

// Islamic Pattern Animation
function createIslamicPatterns() {
    const patternsContainer = document.querySelector('.animated-patterns');
    
    // Create floating Islamic geometric shapes
    for (let i = 0; i < 5; i++) {
        const pattern = document.createElement('div');
        pattern.className = 'floating-pattern';
        pattern.style.cssText = `
            position: absolute;
            width: ${Math.random() * 60 + 40}px;
            height: ${Math.random() * 60 + 40}px;
            border: 2px solid rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: islamicFloat ${Math.random() * 10 + 15}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        patternsContainer.appendChild(pattern);
    }
}

// Add Islamic float animation to CSS
function addIslamicAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes islamicFloat {
            0%, 100% { 
                transform: translateY(0px) rotate(0deg) scale(1); 
                opacity: 0.3;
            }
            25% { 
                transform: translateY(-30px) rotate(90deg) scale(1.1); 
                opacity: 0.6;
            }
            50% { 
                transform: translateY(-60px) rotate(180deg) scale(1.2); 
                opacity: 0.8;
            }
            75% { 
                transform: translateY(-30px) rotate(270deg) scale(1.1); 
                opacity: 0.6;
            }
        }
        
        .floating-pattern:hover {
            animation-duration: 3s;
            border-color: rgba(16, 185, 129, 0.8) !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme
    document.body.classList.toggle('dark', isDarkMode);
    updateDarkModeToggle();
    
    // Add scroll listener for parallax
    window.addEventListener('scroll', requestParallaxUpdate);
    
    // Add hover effects
    addHoverEffects();
    
    // Create Islamic patterns
    addIslamicAnimation();
    createIslamicPatterns();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Logo refresh animation
function logoRefreshAnimation() {
    const logo = document.querySelector('.nav-logo');
    logo.style.animation = 'logoRefresh 0.8s ease-in-out';
    
    setTimeout(() => {
        logo.style.animation = '';
        scrollToTop();
    }, 800);
}

// Add logo refresh CSS animation
const logoStyle = document.createElement('style');
logoStyle.textContent = `
    @keyframes logoRefresh {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(90deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        75% { transform: scale(1.1) rotate(270deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
`;
document.head.appendChild(logoStyle);

// Update logo click handler
document.addEventListener('DOMContentLoaded', function() {
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', logoRefreshAnimation);
    }
});
```

### js/navigation.js (Navigation Logic)
```javascript
// Mobile Navigation
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const hamburger = document.querySelector('.hamburger');
    
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Active page highlighting
function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        const href = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (href === currentPage) {
            btn.classList.add('active');
        }
    });
}

// Smooth page transitions
function smoothNavigate(page) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

// Enhanced mobile menu (add to HTML)
function createMobileMenu() {
    const nav = document.querySelector('.navbar');
    const mobileMenuHTML = `
        <div class="mobile-menu">
            <div class="mobile-menu-content">
                <button class="mobile-nav-btn" onclick="navigateTo('index.html')">Home</button>
                <button class="mobile-nav-btn" onclick="navigateTo('login.html')">Login</button>
                <button class="mobile-nav-btn" onclick="navigateTo('signup.html')">Sign Up</button>
                <div class="mobile-dark-toggle">
                    <span>🌞</span>
                    <button class="mobile-toggle-btn" onclick="toggleDarkMode()">
                        <span class="mobile-toggle-slider"></span>
                    </button>
                    <span>🌙</span>
                </div>
            </div>
        </div>
        <button class="hamburger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </button>
    `;
    
    nav.innerHTML += mobileMenuHTML;
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    setActivePage();
    
    // Add mobile menu for mobile devices
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
});
```

## 4. Additional Files to Create

### login.html, signup.html
Similar structure to index.html but with form-specific content.

### images/logo.svg
Create the SHANTISONGHO logo SVG file.

### css/responsive.css
Additional mobile-specific styles.

## 5. Deployment Instructions

1. **Upload all files** to your web hosting service
2. **Ensure proper file permissions** (644 for files, 755 for directories)
3. **Test on multiple devices** and browsers
4. **Optimize images** for faster loading
5. **Add meta tags** for SEO
6. **Implement SSL certificate** for security

## Key Differences from React Version

1. **State Management**: Using localStorage and global variables instead of React state
2. **Component Reusability**: Functions and templates instead of React components
3. **Event Handling**: Direct DOM manipulation instead of React event handlers
4. **Styling**: Pure CSS with custom properties instead of Tailwind classes
5. **Navigation**: Page redirects instead of client-side routing

This HTML/CSS/JavaScript version maintains all the functionality and design of the React version while being compatible with any web hosting service.