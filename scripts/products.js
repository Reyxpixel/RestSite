// Products page JavaScript

let currentCategory = "all"
let allProducts = []
let currentHighlightedCard = null
let baseUrl = ""

document.addEventListener("DOMContentLoaded", () => {
  // Set base URL properly
  baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/products.html")

  // Wait for products data to load
  if (window.productsData) {
    initializeProductsPage()
  } else {
    const checkData = setInterval(() => {
      if (window.productsData) {
        initializeProductsPage()
        clearInterval(checkData)
      }
    }, 100)
  }

  // Initialize jump to products button
  initializeJumpToProducts()

  // Handle URL routing
  handleURLRouting()

  // Handle clicks outside highlighted card
  document.addEventListener("click", handleOutsideClick)
})

function initializeProductsPage() {
  // Flatten all products from categories
  allProducts = []
  window.productsData.categories.forEach((category) => {
    category.products.forEach((product) => {
      allProducts.push({
        ...product,
        category: category.slug,
        categoryName: category.name,
      })
    })
  })

  // Load categories sidebar
  loadCategoriesSidebar()

  // Load products
  loadProducts()

  // Setup search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch)
  }

  // Initialize mobile dropdown
  initializeMobileDropdown()

  // Check for category parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const categoryParam = urlParams.get("category")
  if (categoryParam) {
    selectCategory(categoryParam)
  }
}

function initializeMobileDropdown() {
  const sidebar = document.querySelector(".categories-sidebar")
  if (!sidebar) return

  // Make the sidebar clickable to toggle dropdown (only on the ::before pseudo-element area)
  sidebar.addEventListener("click", (e) => {
    // Don't toggle if clicking on a category item
    if (e.target.closest(".category-item")) {
      return
    }

    // Toggle dropdown only on mobile
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("active")
      const categoryList = document.getElementById("categoryList")
      if (categoryList) {
        categoryList.classList.toggle("active")
      }
    }
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target)) {
      sidebar.classList.remove("active")
      const categoryList = document.getElementById("categoryList")
      if (categoryList) {
        categoryList.classList.remove("active")
      }
    }
  })
}

function loadCategoriesSidebar() {
  const categoryList = document.getElementById("categoryList")
  if (!categoryList) return

  const allCategoryItem = `
    <a href="#" class="category-item ${currentCategory === "all" ? "active" : ""}" onclick="selectCategory('all')">
      All Categories
    </a>
  `

  const categoryItems = window.productsData.categories
    .map(
      (category) => `
      <a href="#" class="category-item ${currentCategory === category.slug ? "active" : ""}" onclick="selectCategory('${category.slug}')">
        ${category.name}
      </a>
    `,
    )
    .join("")

  categoryList.innerHTML = allCategoryItem + categoryItems
}

function selectCategory(categorySlug) {
  currentCategory = categorySlug

  // Update active state in sidebar
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("active")
  })

  const activeItem = document.querySelector(`[onclick="selectCategory('${categorySlug}')"]`)
  if (activeItem) {
    activeItem.classList.add("active")
  }

  // Update page title
  const categoryTitle = document.getElementById("categoryTitle")
  if (categoryTitle) {
    if (categorySlug === "all") {
      categoryTitle.textContent = "All Products"
    } else {
      const category = window.productsData.categories.find((cat) => cat.slug === categorySlug)
      categoryTitle.textContent = category ? category.name : "Products"
    }
  }

  // Update URL without page reload - proper URL handling
  const newUrl = categorySlug === "all" ? baseUrl : `${baseUrl}?category=${categorySlug}`
  window.history.pushState({}, "", newUrl)

  // Close mobile dropdown if open
  if (window.innerWidth <= 768) {
    const sidebar = document.querySelector(".categories-sidebar")
    const categoryList = document.getElementById("categoryList")
    if (sidebar) sidebar.classList.remove("active")
    if (categoryList) categoryList.classList.remove("active")
  }

  // Load filtered products
  loadProducts()
}

function loadProducts() {
  const productsGrid = document.getElementById("productsGrid")
  if (!productsGrid) return

  let filteredProducts = allProducts

  // Filter by category
  if (currentCategory !== "all") {
    filteredProducts = allProducts.filter((product) => product.category === currentCategory)
  }

  // Filter by search term
  const searchInput = document.getElementById("searchInput")
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.toLowerCase().trim()
    filteredProducts = filteredProducts.filter((product) => product.name.toLowerCase().includes(searchTerm))
  }

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <h3>No products found</h3>
        <p>Try adjusting your search or selecting a different category.</p>
      </div>
    `
    return
  }

  productsGrid.innerHTML = filteredProducts
    .map(
      (product) => `
      <div class="product-card" data-product-slug="${product.slug}" onclick="highlightProduct(this, '${product.slug}')">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-actions">
            <a href="https://api.whatsapp.com/send?phone=919871124465&text=I%20would%20like%20to%20order%20${encodeURIComponent(product.name)}" 
               target="_blank" 
               class="whatsapp-btn"
               onclick="event.stopPropagation()">
              <i class="fab fa-whatsapp"></i>
              Order on WhatsApp
            </a>
            <button class="share-btn" onclick="shareProduct('${product.slug}', event)" title="Share Product">
              <i class="fas fa-share-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `,
    )
    .join("")
}

function handleSearch() {
  loadProducts()
}

// Product Highlighting Functions
function highlightProduct(cardElement, productSlug) {
  // If already highlighted, unhighlight
  if (currentHighlightedCard === cardElement) {
    unhighlightProduct()
    return
  }

  // Unhighlight any previously highlighted card
  unhighlightProduct()

  // Update URL properly - avoid double appending
  const categoryParam = currentCategory !== "all" ? `?category=${currentCategory}&` : "?"
  const newUrl = `${baseUrl}${categoryParam}product=${productSlug}`
  window.history.pushState({ product: productSlug }, "", newUrl)

  // Add blur overlay
  let overlay = document.querySelector(".products-blur-overlay")
  if (!overlay) {
    overlay = document.createElement("div")
    overlay.className = "products-blur-overlay"
    document.body.appendChild(overlay)
  }
  overlay.classList.add("active")

  // Highlight the card
  cardElement.classList.add("highlighted")
  currentHighlightedCard = cardElement

  // Prevent body scroll
  document.body.style.overflow = "hidden"
}

function unhighlightProduct() {
  if (currentHighlightedCard) {
    currentHighlightedCard.classList.remove("highlighted")
    currentHighlightedCard = null
  }

  // Remove blur overlay
  const overlay = document.querySelector(".products-blur-overlay")
  if (overlay) {
    overlay.classList.remove("active")
  }

  // Restore body scroll
  document.body.style.overflow = "auto"

  // Update URL back to products page properly
  const categoryParam = currentCategory !== "all" ? `?category=${currentCategory}` : ""
  const newUrl = `${baseUrl}${categoryParam}`
  window.history.pushState({}, "", newUrl)
}

function handleOutsideClick(event) {
  if (currentHighlightedCard && !currentHighlightedCard.contains(event.target)) {
    unhighlightProduct()
  }
}

function shareProduct(productSlug, event) {
  event.stopPropagation()

  const product = allProducts.find((p) => p.slug === productSlug)
  if (!product) return

  // Create proper shareable URL
  const categoryParam = currentCategory !== "all" ? `?category=${currentCategory}&` : "?"
  const productUrl = `${baseUrl}${categoryParam}product=${productSlug}`
  const shareText = `Check out this gluten-free product: ${product.name} from Gluten Free India`

  // Check if native sharing is available (Android/iOS)
  if (navigator.share) {
    navigator
      .share({
        title: product.name,
        text: shareText,
        url: productUrl,
      })
      .catch((error) => {
        console.log("Error sharing:", error)
        fallbackShare(productUrl, shareText)
      })
  } else {
    fallbackShare(productUrl, shareText)
  }
}

function fallbackShare(url, text) {
  // Try to copy to clipboard first
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showNotification("Product link copied to clipboard!", "success")
      })
      .catch(() => {
        // If clipboard fails, show share options
        showShareOptions(url, text)
      })
  } else {
    showShareOptions(url, text)
  }
}

function showShareOptions(url, text) {
  // Create a simple share menu
  const shareMenu = document.createElement("div")
  shareMenu.className = "share-menu"
  shareMenu.innerHTML = `
    <div class="share-menu-content">
      <h4>Share Product</h4>
      <div class="share-options">
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}" target="_blank" class="share-option">
          <i class="fab fa-whatsapp"></i>
          WhatsApp
        </a>
        <button onclick="copyToClipboard('${url}')" class="share-option">
          <i class="fas fa-copy"></i>
          Copy Link
        </button>
      </div>
      <button onclick="closeShareMenu()" class="share-close">Close</button>
    </div>
  `

  document.body.appendChild(shareMenu)
  setTimeout(() => shareMenu.classList.add("active"), 10)
}

function copyToClipboard(text) {
  // Fallback for older browsers
  const textArea = document.createElement("textarea")
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
  showNotification("Link copied to clipboard!", "success")
  closeShareMenu()
}

function closeShareMenu() {
  const shareMenu = document.querySelector(".share-menu")
  if (shareMenu) {
    shareMenu.remove()
  }
}

// URL Routing - Fixed to handle proper URL structure
function handleURLRouting() {
  const urlParams = new URLSearchParams(window.location.search)
  const productParam = urlParams.get("product")
  const categoryParam = urlParams.get("category")

  // Handle category first
  if (categoryParam && categoryParam !== currentCategory) {
    selectCategory(categoryParam)
  }

  // Then handle product highlighting
  if (productParam) {
    const product = allProducts.find((p) => p.slug === productParam)
    if (product) {
      setTimeout(() => {
        const productCard = document.querySelector(`[data-product-slug="${productParam}"]`)
        if (productCard) {
          highlightProduct(productCard, productParam)
        }
      }, 100)
    }
  }
}

// Jump to Products Button
function initializeJumpToProducts() {
  const jumpBtn = document.getElementById("jumpToProducts")
  if (jumpBtn) {
    jumpBtn.addEventListener("click", () => {
      const productsGrid = document.getElementById("productsGrid")
      if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: "smooth" })
      }
    })
  }
}

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  unhighlightProduct()
  handleURLRouting()
})

// Make functions globally available
window.selectCategory = selectCategory
window.highlightProduct = highlightProduct
window.shareProduct = shareProduct

// Declare showNotification function
function showNotification(message, type) {
  // Create notification element
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
        z-index: 4000;
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
