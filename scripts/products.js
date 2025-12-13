// Products page JavaScript

let currentCategory = "all"
let allProducts = []
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

  // Handle URL routing
  handleURLRouting()

  // Initialize product image lightbox
  initializeProductImageLightbox()
})

function initializeProductImageLightbox() {
  const lightbox = document.getElementById("productImageLightbox")
  const lightboxImg = document.getElementById("productImageLightboxImg")
  const closeBtn = document.getElementById("productImageLightboxClose")
  const productsGrid = document.getElementById("productsGrid")

  if (!lightbox || !lightboxImg || !productsGrid) return

  function openLightbox(src, alt) {
    lightboxImg.classList.remove("image-loading")
    lightboxImg.src = src
    lightboxImg.alt = alt || ""
    lightbox.classList.add("active")
    lightbox.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
  }

  function closeLightbox() {
    lightbox.classList.remove("active")
    lightbox.setAttribute("aria-hidden", "true")
    lightboxImg.classList.remove("image-loading")
    lightboxImg.removeAttribute("src")
    document.body.style.overflow = "auto"
  }

  productsGrid.addEventListener("click", (e) => {
    const img = e.target.closest(".product-image img")
    if (!img) return

    e.preventDefault()
    e.stopPropagation()

    openLightbox(img.getAttribute("src") || img.currentSrc || img.src, img.alt)
  })

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      closeLightbox()
    })
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox()
    }
  })
}

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
  updateCategoryTrigger()

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
    selectCategory(categoryParam, { updateUrl: false })
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
  updateCategoryTrigger()
}

function selectCategory(categorySlug, options = {}) {
  const { updateUrl = true } = options
  currentCategory = categorySlug

  // Update active state in sidebar
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("active")
  })

  const activeItem = document.querySelector(`[onclick="selectCategory('${categorySlug}')"]`)
  if (activeItem) {
    activeItem.classList.add("active")
  }

  updateCategoryTrigger()

  // Update URL without page reload - proper URL handling
  if (updateUrl) {
    const newUrl = categorySlug === "all" ? baseUrl : `${baseUrl}?category=${categorySlug}`
    if (window.location.href !== newUrl) {
      window.history.pushState({}, "", newUrl)
    }
  }

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

  const searchInput = document.getElementById("searchInput")
  const searchTerm = searchInput && searchInput.value.trim() ? searchInput.value.toLowerCase().trim() : ""

  let filteredProducts = allProducts

  // If searching, search across all categories; otherwise filter by selected category
  if (searchTerm) {
    filteredProducts = allProducts.filter((product) => product.name.toLowerCase().includes(searchTerm))
  } else if (currentCategory !== "all") {
    filteredProducts = allProducts.filter((product) => product.category === currentCategory)
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
      <div class="product-card" data-product-slug="${product.slug}">
            <button class="share-btn" onclick="shareProduct('${product.slug}', event)" title="Share Product">
              <i class="fas fa-share-nodes"></i>
            </button>
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImageError(this);">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <a href="https://api.whatsapp.com/send?phone=919871124465&text=I%20would%20like%20to%20order%20${encodeURIComponent(product.name)}" 
             target="_blank" 
             class="whatsapp-btn"
             onclick="event.stopPropagation()">
            <i class="fab fa-whatsapp"></i>
            Order
          </a>
        </div>
      </div>
    `,
    )
    .join("")
}

function handleSearch() {
  loadProducts()
}

function initializeMobileDropdown() {
  const sidebar = document.querySelector(".categories-sidebar")
  const trigger = document.getElementById("categoryTrigger")
  if (!sidebar || !trigger) return

  trigger.addEventListener("click", (e) => {
    e.preventDefault()
    sidebar.classList.toggle("active")
    const categoryList = document.getElementById("categoryList")
    if (categoryList) {
      categoryList.classList.toggle("active")
    }
  })

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target)) {
      sidebar.classList.remove("active")
      const categoryList = document.getElementById("categoryList")
      if (categoryList) {
        categoryList.classList.remove("active")
      }
    }
  })
}

function updateCategoryTrigger() {
  const trigger = document.getElementById("categoryTrigger")
  if (!trigger) return
  if (currentCategory === "all") {
    trigger.textContent = "All Categories"
  } else {
    const category = window.productsData.categories.find((cat) => cat.slug === currentCategory)
    trigger.textContent = category ? category.name : "Categories"
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
  const categoryParam = urlParams.get("category")

  // Handle category first
  const targetCategory = categoryParam || "all"
  if (targetCategory !== currentCategory) {
    selectCategory(targetCategory, { updateUrl: false })
  }
}

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  handleURLRouting()
})

// Make functions globally available
window.selectCategory = selectCategory
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
