// Main JavaScript file for common functionality

let productsData = null

document.addEventListener("DOMContentLoaded", () => {
  // Load products data first
  loadProductsData().then(() => {
    // Load header and footer
    loadHeader()
    loadFooter()
  })

  // Show temporary maintenance notice (one-time until dismissed)
  showMaintenanceNotice()

  // Header scroll effect
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header")
    if (window.scrollY > 100) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }
  })

  // Mobile menu toggle - Fixed implementation
  initializeMobileMenu()

  // Global image error handler for purple loading animation
  initializeImageErrorHandling()
})

// Global image error handler
function handleImageError(img) {
  img.onerror = null
  img.classList.add('image-loading')
  img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'
  
  // Add loading spinner if parent supports it (only if :has() is not supported)
  const parent = img.parentElement
  if (parent && (parent.classList.contains('category-image') || parent.classList.contains('product-image'))) {
    // Check if browser supports :has() selector
    if (!CSS.supports('selector(:has(*))')) {
      // Fallback: add spinner element for browsers without :has() support
      if (!parent.querySelector('.loading-spinner')) {
        const spinner = document.createElement('div')
        spinner.className = 'loading-spinner'
        parent.appendChild(spinner)
      }
    }
  }
}

function initializeImageErrorHandling() {
  // Handle existing images
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('onerror')) {
      img.addEventListener('error', function() {
        handleImageError(this)
      })
    }
  })

  // Handle dynamically added images
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const images = node.querySelectorAll ? node.querySelectorAll('img') : []
          images.forEach(img => {
            if (!img.hasAttribute('onerror')) {
              img.addEventListener('error', function() {
                handleImageError(this)
              })
            }
          })
          if (node.tagName === 'IMG' && !node.hasAttribute('onerror')) {
            node.addEventListener('error', function() {
              handleImageError(this)
            })
          }
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Make handleImageError globally available
window.handleImageError = handleImageError

// Fixed mobile menu functionality
function initializeMobileMenu() {
  const menuToggle = document.getElementById("menuToggle")
  const nav = document.querySelector(".nav")

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      nav.classList.toggle("active")
      menuToggle.classList.toggle("active")

      // Prevent body scroll when menu is open
      if (nav.classList.contains("active")) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = "auto"
      }
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove("active")
        menuToggle.classList.remove("active")
        document.body.style.overflow = "auto"
      }
    })

    // Close menu when clicking on nav links
    const navLinks = nav.querySelectorAll(".nav-link")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active")
        menuToggle.classList.remove("active")
        document.body.style.overflow = "auto"
      })
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        nav.classList.remove("active")
        menuToggle.classList.remove("active")
        document.body.style.overflow = "auto"
      }
    })
  }
}

// Temporary maintenance notice (remove when no longer needed)
function showMaintenanceNotice() {
  if (localStorage.getItem("gfi_maintenance_dismissed") === "1") return

  const notice = document.createElement("div")
  notice.className = "maintenance-modal"
  notice.innerHTML = `
    <div class="maintenance-content">
      <button class="maintenance-close" aria-label="Close maintenance notice">&times;</button>
      <h3>Site is under maintenance</h3>
      <p>We are currently working on remaking and updating the entire site. Please check back later.</p>
    </div>
  `

  const close = notice.querySelector(".maintenance-close")
  close.addEventListener("click", () => {
    notice.remove()
    localStorage.setItem("gfi_maintenance_dismissed", "1")
  })

  document.body.appendChild(notice)
}

// Load products data from JSON
async function loadProductsData() {
  try {
    const response = await fetch("data/products.json")
    productsData = await response.json()
    window.productsData = productsData // Make it globally available
  } catch (error) {
    console.error("Error loading products data:", error)
    // Fallback data if JSON fails to load
    productsData = { categories: [] }
    window.productsData = productsData
  }
}

// Load header function
function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder")
  if (headerPlaceholder) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html"

    headerPlaceholder.innerHTML = `
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <button class="back-button" id="backButton" onclick="window.history.back()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <a href="index.html" class="logo">
                            <img src="logo.png" alt="Gluten Free India Logo">
                            <span class="logo-text">Gluten Free India</span>
                        </a>
                        
                        <nav class="nav">
                            <ul class="nav-list">
                                <li><a href="index.html" class="nav-link ${currentPage === "index.html" ? "active" : ""}">Home</a></li>
                                <li class="dropdown">
                                    <a href="products.html" class="nav-link ${currentPage === "products.html" ? "active" : ""}">Products <i class="fas fa-chevron-down"></i></a>
                                    <div class="dropdown-content">
                                        <div class="categories-dropdown" id="categoriesDropdown">
                                            <!-- Categories will be loaded here -->
                                        </div>
                                    </div>
                                </li>
                                <li><a href="about.html" class="nav-link ${currentPage === "about.html" ? "active" : ""}">About Us</a></li>
                                <li><a href="contact.html" class="nav-link ${currentPage === "contact.html" ? "active" : ""}">Contact</a></li>
                            </ul>
                        </nav>

                        <div class="contact-info">
                            <a href="https://wa.me/919871124465" target="_blank" class="contact-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                                <span>+91-9871124465</span>
                            </a>
                            <a href="https://maps.app.goo.gl/D6g1eMd2KnswvQMr9" target="_blank" class="contact-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Location</span>
                            </a>
                        </div>

                        <button class="menu-toggle" id="menuToggle">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
                <div class="mobile-contact-bar">
                    <a href="tel:+919871124465">
                        <i class="fas fa-phone"></i>
                        <span>+91-9871124465</span>
                    </a>
                    <a href="https://maps.app.goo.gl/D6g1eMd2KnswvQMr9" target="_blank">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Location</span>
                    </a>
                </div>
            </header>
        `

    // Load categories dropdown after header is created
    loadCategoriesDropdown()

    // Re-initialize mobile menu after header is loaded
    setTimeout(() => {
      initializeMobileMenu()
      initializeBackButton()
    }, 100)
  }
}

// Initialize back button (mobile only, not on home page)
function initializeBackButton() {
  const backButton = document.getElementById("backButton")
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  
  if (backButton) {
    function updateBackButton() {
      if (currentPage !== "index.html" && window.innerWidth <= 768) {
        backButton.classList.add("show")
      } else {
        backButton.classList.remove("show")
      }
    }

    // Initial check
    updateBackButton()

    // Handle window resize
    window.addEventListener("resize", updateBackButton)
  }
}

// Load categories for dropdown
function loadCategoriesDropdown() {
  const categoriesDropdown = document.getElementById("categoriesDropdown")
  if (categoriesDropdown && productsData) {
    categoriesDropdown.innerHTML = productsData.categories
      .map(
        (category) => `
            <a href="products.html?category=${category.slug}" class="category-dropdown-item">
                ${category.name}
            </a>
        `,
      )
      .join("")
  }
}

// Load footer function
function loadFooter() {
  const footerPlaceholder = document.getElementById("footer-placeholder")
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <a href="index.html" class="footer-logo">
                                <img src="logo.png" alt="Gluten Free India Logo">
                                <span class="footer-logo-text">Gluten Free India</span>
                            </a>
                            <p>Your trusted partner in healthy, gluten-free living. We provide premium quality gluten-free products made with all-natural ingredients for a healthier lifestyle.</p>
                            <div class="footer-social">
                                <a href="https://www.instagram.com/glutenfree_india/" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>
                                <a href="https://wa.me/919871124465" target="_blank" class="social-link"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="index.html"><i class="fas fa-home"></i> Home</a></li>
                                <li><a href="products.html"><i class="fas fa-shopping-bag"></i> Products</a></li>
                                <li><a href="about.html"><i class="fas fa-info-circle"></i> About Us</a></li>
                                <li><a href="contact.html"><i class="fas fa-envelope"></i> Contact</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h3>Contact Info</h3>
                            <p><i class="fab fa-whatsapp"></i> +91-9871124465</p>
                            <p><i class="fas fa-envelope"></i> glutenfreeindiainfo@gmail.com</p>
                            <p><a href="https://maps.app.goo.gl/D6g1eMd2KnswvQMr9" target="_blank" style="color: rgba(255, 255, 255, 0.9); text-decoration: none; transition: color 0.3s ease;"><i class="fas fa-map-marker-alt"></i> M-300, SPS Heights, Ahinsa Khand-2, Indirapuram, Ghaziabad, U.P. 201014</a></p>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>&copy; ${new Date().getFullYear()} Gluten Free India. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `
  }
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
            <span>${message}</span>
        </div>
    `

  // Add notification styles if not already present
  if (!document.querySelector("#notification-styles")) {
    const styles = document.createElement("style")
    styles.id = "notification-styles"
    styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
                z-index: 3000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid var(--primary-color);
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-success {
                border-left-color: #10b981;
            }
            .notification-error {
                border-left-color: #ef4444;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification-success i {
                color: #10b981;
            }
            .notification-error i {
                color: #ef4444;
            }
        `
    document.head.appendChild(styles)
  }

  document.body.appendChild(notification)

  setTimeout(() => notification.classList.add("show"), 100)
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}
