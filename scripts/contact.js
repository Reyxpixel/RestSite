// Contact page specific JavaScript

document.addEventListener("DOMContentLoaded", () => {
  // Initialize contact form
  initializeContactForm()

  // Initialize FAQ functionality
  initializeFAQ()
})

// Contact form functionality
function initializeContactForm() {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Validate form
      const nameInput = document.getElementById("name")
      const phoneInput = document.getElementById("phone")
      let isValid = true

      if (!nameInput.value.trim()) {
        isValid = false
        nameInput.style.borderColor = "#ef4444"
      } else {
        nameInput.style.borderColor = "rgba(255, 255, 255, 0.5)"
      }

      if (!phoneInput.value.trim()) {
        isValid = false
        phoneInput.style.borderColor = "#ef4444"
      } else {
        phoneInput.style.borderColor = "rgba(255, 255, 255, 0.5)"
      }

      if (isValid) {
        // Submit the form using fetch API to prevent page redirect
        const formData = new FormData(this)

        fetch("https://getform.io/f/ajjmozma", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              showNotification("Thank you for your message! We will get back to you within 24 hours.", "success")
              this.reset()
            } else {
              showNotification("There was an error submitting the form. Please try again.", "error")
            }
          })
          .catch((error) => {
            showNotification("There was an error submitting the form. Please try again.", "error")
            console.error("Error:", error)
          })
      } else {
        showNotification("Please fill in all required fields.", "error")
      }
    })

    // Reset border color on input
    const inputs = contactForm.querySelectorAll("input")
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        this.style.borderColor = "rgba(255, 255, 255, 0.5)"
      })
    })
  }
}

// Popup form functionality
function initializePopupForm() {
  const popupModal = document.getElementById("popupForm")
  const popupClose = document.getElementById("popupClose")
  const popupContactForm = document.getElementById("popupContactForm")
  const dontShowAgainCheckbox = document.getElementById("dontShowAgain")

  // Check if user has opted to not show the popup
  const dontShowPopup = localStorage.getItem("dontShowPopup") === "true"

  // Show popup after 15 seconds if user hasn't opted out
  if (!dontShowPopup) {
    setTimeout(() => {
      if (popupModal) {
        popupModal.classList.add("active")
      }
    }, 15000)
  }

  // Close popup when clicking the close button
  if (popupClose) {
    popupClose.addEventListener("click", () => {
      popupModal.classList.remove("active")

      // If checkbox is checked, save preference
      if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
        localStorage.setItem("dontShowPopup", "true")
      }
    })
  }

  // Close popup when clicking outside
  if (popupModal) {
    popupModal.addEventListener("click", (e) => {
      if (e.target === popupModal) {
        popupModal.classList.remove("active")

        // If checkbox is checked, save preference
        if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
          localStorage.setItem("dontShowPopup", "true")
        }
      }
    })
  }

  // Handle form submission
  if (popupContactForm) {
    popupContactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Validate form
      const nameInput = document.getElementById("popupName")
      const phoneInput = document.getElementById("popupPhone")
      let isValid = true

      if (!nameInput.value.trim()) {
        isValid = false
        nameInput.style.borderColor = "#ef4444"
      } else {
        nameInput.style.borderColor = "rgba(255, 255, 255, 0.5)"
      }

      if (!phoneInput.value.trim()) {
        isValid = false
        phoneInput.style.borderColor = "#ef4444"
      } else {
        phoneInput.style.borderColor = "rgba(255, 255, 255, 0.5)"
      }

      if (isValid) {
        // Submit the form using fetch API to prevent page redirect
        const formData = new FormData(this)

        fetch("https://getform.io/f/ajjmozma", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              showNotification("Thank you for your message! We will get back to you within 24 hours.", "success")
              this.reset()
              popupModal.classList.remove("active")

              // If checkbox is checked, save preference
              if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
                localStorage.setItem("dontShowPopup", "true")
              }
            } else {
              showNotification("There was an error submitting the form. Please try again.", "error")
            }
          })
          .catch((error) => {
            showNotification("There was an error submitting the form. Please try again.", "error")
            console.error("Error:", error)
          })
      } else {
        showNotification("Please fill in all required fields.", "error")
      }
    })

    // Reset border color on input
    const inputs = popupContactForm.querySelectorAll("input")
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (this.type !== "checkbox") {
          this.style.borderColor = "rgba(255, 255, 255, 0.5)"
        }
      })
    })
  }
}

// FAQ functionality
function initializeFAQ() {
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

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
  })
}

// Show notification function
function showNotification(message, type) {
  if (typeof window.showNotification === "function") {
    window.showNotification(message, type)
  } else {
    alert(message)
  }
}
