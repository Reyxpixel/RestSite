// Home page specific JavaScript

document.addEventListener("DOMContentLoaded", () => {
  // Initialize slideshow
  initializeSlideshow()

  // Load categories after products data is available
  if (window.productsData) {
    loadHomeCategories()
  } else {
    // Wait for products data to load
    const checkData = setInterval(() => {
      if (window.productsData) {
        loadHomeCategories()
        clearInterval(checkData)
      }
    }, 100)
  }

  // Initialize contact modal
  initializeContactModal()

  // Initialize FAQ functionality
  initializeFAQ()

  // Add scroll animations
  initializeScrollAnimations()

  // Add parallax effect to hero shapes
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const shapes = document.querySelectorAll(".shape")

    shapes.forEach((shape, index) => {
      const speed = 0.5 + index * 0.1
      shape.style.transform = `translateY(${scrolled * speed}px)`
    })
  })

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll(".btn")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = x + "px"
      ripple.style.top = y + "px"
      ripple.classList.add("ripple")

      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })
})

// Slideshow functionality
function initializeSlideshow() {
  const slides = document.querySelectorAll(".slide")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.querySelector(".prev-btn")
  const nextBtn = document.querySelector(".next-btn")
  let currentSlide = 0

  if (!slides.length) return

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"))
    dots.forEach((dot) => dot.classList.remove("active"))

    slides[index].classList.add("active")
    dots[index].classList.add("active")
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length
    showSlide(currentSlide)
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length
    showSlide(currentSlide)
  }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener("click", nextSlide)
  if (prevBtn) prevBtn.addEventListener("click", prevSlide)

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index
      showSlide(currentSlide)
    })
  })

  // Auto-play slideshow
  setInterval(nextSlide, 5000)
}

// Load categories for home page
function loadHomeCategories() {
  const categoriesGrid = document.getElementById("categoriesGrid")
  if (!categoriesGrid || !window.productsData) return

  // Create "All Categories" card first
  const allCategoriesCard = `
    <div class="category-card" onclick="window.location.href='products.html'">
        <div class="category-content">
            <h3 class="category-name">All Product Categories</h3>
            <p class="category-description">Browse our complete range of premium gluten-free products</p>
            <button class="category-button">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
        <div class="category-image">
            <img src="https://www.wheafree.com/cdn/shop/files/01_92bc07bc-e461-46d0-b8dd-17da83c50e13.jpg?v=1699080819" alt="All Categories" loading="lazy" onerror="handleImageError(this);">
        </div>
    </div>
  `

  // Create category cards
  const categoryCards = window.productsData.categories
    .map(
      (category) => `
        <div class="category-card" onclick="window.location.href='products.html?category=${category.slug}'">
            <div class="category-content">
                <h3 class="category-name">${category.name}</h3>
                <p class="category-description">Premium gluten-free ${category.name.toLowerCase()} for your healthy lifestyle</p>
                <button class="category-button">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            <div class="category-image">
                <img src="${category.image}" alt="${category.name}" loading="lazy" onerror="handleImageError(this);">
            </div>
        </div>
    `,
    )
    .join("")

  categoriesGrid.innerHTML = allCategoriesCard + categoryCards
}

// Contact modal functionality
function initializeContactModal() {
  const contactBtn = document.getElementById("contactBtn")
  const contactModal = document.getElementById("contactModal")
  const modalClose = document.getElementById("modalClose")
  const contactForm = document.getElementById("contactForm")

  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      contactModal.classList.add("active")
      document.body.style.overflow = "hidden"
    })
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      contactModal.classList.remove("active")
      document.body.style.overflow = "auto"
    })
  }

  // Close modal when clicking outside
  if (contactModal) {
    contactModal.addEventListener("click", (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove("active")
        document.body.style.overflow = "auto"
      }
    })
  }

  // Handle form submission
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const inputs = this.querySelectorAll("input, textarea")
      let isValid = true
      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false
          input.style.borderColor = "#ef4444"
        } else {
          input.style.borderColor = "#e2e8f0"
        }
      })

      if (isValid) {
        showNotification("Thank you for your message! We will get back to you soon.", "success")
        this.reset()
        contactModal.classList.remove("active")
        document.body.style.overflow = "auto"
      } else {
        showNotification("Please fill in all required fields.", "error")
      }
    })
  }
}

// Scroll animations
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(".category-card, .feature-card, .testimonial-card")
  animateElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })
}

// Add ripple effect styles
const rippleStyles = document.createElement("style")
rippleStyles.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`
document.head.appendChild(rippleStyles)

// FAQ functionality
function initializeFAQ() {
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active")

        // Close all FAQ items
        faqItems.forEach((faq) => {
          faq.classList.remove("active")
        })

        // Open clicked item if it wasn't active
        if (!isActive) {
          item.classList.add("active")
        }
      })
    }
  })
}

// Placeholder function for showNotification
function showNotification(message, type) {
  alert(message) // This is a placeholder. Implement your own notification system.
}
