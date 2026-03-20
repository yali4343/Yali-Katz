/**
 * Main JavaScript for Yali Katz's Portfolio
 */

/**
 * UTM Parameter Tracking
 * Captures and stores UTM parameters for Google Analytics
 */
function initUTMTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    source: urlParams.get("source") || urlParams.get("utm_source"),
    medium: urlParams.get("medium") || urlParams.get("utm_medium"),
    campaign: urlParams.get("campaign") || urlParams.get("utm_campaign"),
    term: urlParams.get("term") || urlParams.get("utm_term"),
    content: urlParams.get("content") || urlParams.get("utm_content"),
  };

  // Store UTM parameters in sessionStorage for tracking across pages
  const hasUTMParams = Object.values(utmParams).some((value) => value !== null);

  if (hasUTMParams) {
    sessionStorage.setItem("utm_params", JSON.stringify(utmParams));

    // Send to Google Analytics
    if (typeof gtag !== "undefined") {
      // Send custom event for tracking (appears in Events section)
      gtag("event", "utm_capture", {
        event_category: "UTM Tracking",
        event_label: `Source: ${utmParams.source || "direct"}`,
        // Custom parameters (useful for reports and explorations)
        campaign_source: utmParams.source,
        campaign_medium: utmParams.medium,
        campaign_name: utmParams.campaign,
        campaign_term: utmParams.term,
        campaign_content: utmParams.content,
      });
    }
  } else {
    // Check if we have stored UTMs from previous page
    const storedParams = sessionStorage.getItem("utm_params");
    if (storedParams) {
      console.log(
        "📌 Using stored UTM parameters from earlier in session:",
        JSON.parse(storedParams),
      );
    }
  }

  return utmParams;
}

/**
 * Get stored UTM parameters
 */
function getUTMParams() {
  try {
    const stored = sessionStorage.getItem("utm_params");
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Track event with UTM parameters
 */
function trackEventWithUTM(
  eventName,
  eventCategory,
  eventLabel,
  additionalParams = {},
) {
  if (typeof gtag !== "undefined") {
    const utmParams = getUTMParams();

    gtag("event", eventName, {
      event_category: eventCategory,
      event_label: eventLabel,
      // Add UTM context as custom parameters (if available)
      ...(utmParams && {
        campaign_source: utmParams.source,
        campaign_medium: utmParams.medium,
        campaign_name: utmParams.campaign,
      }),
      ...additionalParams,
    });
  }
}

// Initialize UTM tracking on page load
const currentUTMParams = initUTMTracking();

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMain = document.querySelector(".nav-main");

  if (menuToggle && navMain) {
    menuToggle.addEventListener("click", () => {
      navMain.classList.toggle("collapsed");

      // Change aria-expanded attribute for accessibility
      const isExpanded = navMain.classList.contains("collapsed")
        ? "false"
        : "true";
      menuToggle.setAttribute("aria-expanded", isExpanded);
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Update URL without page reload
        history.pushState(null, null, targetId);
      }
    });
  });

  // Expandable sections (like FAQ accordions)
  const expandableTriggers = document.querySelectorAll(".expandable-trigger");

  expandableTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const target = document.querySelector(
        trigger.getAttribute("data-target"),
      );

      if (target) {
        target.classList.toggle("active");

        // Update aria-expanded for accessibility
        const isExpanded = target.classList.contains("active")
          ? "true"
          : "false";
        trigger.setAttribute("aria-expanded", isExpanded);
      }
    });
  });

  // Form validation
  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      let isValid = true;
      const requiredFields = contactForm.querySelectorAll("[required]");

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("error");

          // Add error message if it doesn't exist
          const errorMsgId = `${field.id}-error`;
          let errorMsg = document.getElementById(errorMsgId);

          if (!errorMsg) {
            errorMsg = document.createElement("span");
            errorMsg.id = errorMsgId;
            errorMsg.className = "error-message";
            errorMsg.textContent = "This field is required";
            field.parentNode.appendChild(errorMsg);
          }
        } else {
          field.classList.remove("error");
          const errorMsg = document.getElementById(`${field.id}-error`);
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
    });
  }

  // Add animations when elements come into view
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const animateOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.8;

    animatedElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        element.classList.add("animated");
      }
    });
  };

  // Run once on page load
  animateOnScroll();

  // Run on scroll
  window.addEventListener("scroll", animateOnScroll);

  // Setup dark mode toggle if present
  const darkModeToggle = document.querySelector(".dark-mode-toggle");

  if (darkModeToggle) {
    // Check for user preference
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const storedTheme = localStorage.getItem("theme");

    // Set initial state based on user preference or stored setting
    if (storedTheme === "dark" || (!storedTheme && prefersDarkMode)) {
      document.body.classList.add("dark-theme");
      darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener("change", () => {
      if (darkModeToggle.checked) {
        document.body.classList.add("dark-theme");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-theme");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // Popup Ad Management
  function initPopupAd() {
    const hasShownPopup = sessionStorage.getItem("popupShown");

    // Only show popup once per session
    if (hasShownPopup) return;

    // Wait 3 seconds before showing popup
    setTimeout(() => {
      showPopupAd();
      sessionStorage.setItem("popupShown", "true");
    }, 3000);
  }

  function createPopupAd() {
    const popupHTML = `
      <div class="popup-overlay" id="popupOverlay">
        <div class="popup-content">
          <button class="popup-close" id="popupClose" aria-label="Close popup">×</button>
          
          <div class="popup-header">
            <h2 class="popup-title">צריכים עזרה?</h2>
            <p class="popup-subtitle">בואו נדבר!</p>
          </div>
          
          <div class="popup-actions">
            <a href="https://wa.me/972586669888?text=שלום%2C%20אני%20מעוניין%20לשמוע%20עליך%20ועל%20איך%20אתה%20יכול%20לעזור%20לי" 
               class="popup-btn popup-btn-primary" 
               id="popupWhatsAppBtn"
               target="_blank" rel="noopener">
              <i class="fab fa-whatsapp"></i>
              שלח הודעה 
            </a>
            <button class="popup-btn popup-btn-secondary" id="popupLater">
              אולי מאוחר יותר
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", popupHTML);

    // Add event listeners
    const overlay = document.getElementById("popupOverlay");
    const closeBtn = document.getElementById("popupClose");
    const laterBtn = document.getElementById("popupLater");
    const whatsappPopupBtn = document.getElementById("popupWhatsAppBtn");

    function closePopup() {
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }

    // Track WhatsApp popup button click with UTM parameters
    if (whatsappPopupBtn) {
      whatsappPopupBtn.addEventListener("click", function () {
        trackEventWithUTM("click", "WhatsApp", "Popup Ad - Contact Request", {
          page_path: window.location.pathname,
        });
      });
    }

    closeBtn.addEventListener("click", closePopup);
    laterBtn.addEventListener("click", closePopup);

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("show")) {
        closePopup();
      }
    });
  }

  function showPopupAd() {
    createPopupAd();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const overlay = document.getElementById("popupOverlay");
      if (overlay) {
        overlay.classList.add("show");
      }
    }, 100);
  }

  // Initialize all features
  createWhatsAppButton();
  initPopupAd();
});
