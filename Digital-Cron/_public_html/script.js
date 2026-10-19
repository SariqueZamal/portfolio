// Brave Shields & Privacy Blocker Safe Polyfill
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };

// Production Domain Guard & One-to-One Redirect from Legacy GitHub Pages URL
if (typeof window !== "undefined" && window.location && window.location.hostname === "sariquezamal.github.io") {
  const cleanPath = window.location.pathname.replace(/^\/portfolio/, "");
  window.location.replace("https://digitalcron.com" + cleanPath + window.location.search + window.location.hash);
}

document.addEventListener("DOMContentLoaded", () => {
  // Guaranteed Chatbot Boot First
  try {
    initFloatingChatbot();
  } catch (err) {
    console.warn("Chatbot boot warning:", err);
  }

  // 1. Mobile Hamburger Menu & Accessible Drawer
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  let overlay = document.querySelector(".mobile-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);
  }

  function openMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
    }
    if (overlay) overlay.classList.add("is-open");
    if (hamburgerBtn) {
      hamburgerBtn.classList.add("is-active");
      hamburgerBtn.setAttribute("aria-expanded", "true");
    }
    document.body.style.overflow = "hidden";

    // Focus first link in mobile menu for keyboard accessibility
    if (mobileMenu) {
      const firstLink = mobileMenu.querySelector("a, button");
      if (firstLink) firstLink.focus();
    }
  }

  function closeMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove("is-open");
      mobileMenu.setAttribute("aria-hidden", "true");
    }
    if (overlay) overlay.classList.remove("is-open");
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove("is-active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    if (mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", toggleMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  // Close mobile menu when clicking any link inside it
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a, button:not(#mobile-menu-close)").forEach((item) => {
      item.addEventListener("click", () => {
        closeMenu();
      });
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
      if (hamburgerBtn) hamburgerBtn.focus();
    }
  });

  // Clean any legacy theme state
  try {
    localStorage.removeItem("theme");
    document.body.classList.remove("light-mode");
  } catch (e) {}

  // 3. Mouse Spotlight Cursor Tracking
  const spotlight = document.getElementById("spotlight");
  if (spotlight) {
    document.addEventListener("mousemove", (e) => {
      spotlight.style.setProperty("--x", `${e.clientX}px`);
      spotlight.style.setProperty("--y", `${e.clientY}px`);
    });
  }

  // Scroll Restoration Management
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "auto";
  }

  // 4. Kinetic Scroll Manager: Header, Progress Bar, Back-To-Top & Parallax
  const header = document.getElementById("site-header");

  // Create Top Scroll Progress Indicator
  let scrollProgressBar = document.getElementById("dc-scroll-progress-bar");
  if (!scrollProgressBar) {
    const progressWrap = document.createElement("div");
    progressWrap.className = "dc-scroll-progress";
    progressWrap.setAttribute("aria-hidden", "true");
    scrollProgressBar = document.createElement("div");
    scrollProgressBar.id = "dc-scroll-progress-bar";
    scrollProgressBar.className = "dc-scroll-progress-bar";
    progressWrap.appendChild(scrollProgressBar);
    document.body.prepend(progressWrap);
  }

  // Create Floating Glassmorphic Back to Top Button
  let backToTopBtn = document.getElementById("dc-back-to-top");
  if (!backToTopBtn) {
    backToTopBtn = document.createElement("button");
    backToTopBtn.id = "dc-back-to-top";
    backToTopBtn.className = "dc-back-to-top";
    backToTopBtn.setAttribute("aria-label", "Scroll back to top");
    backToTopBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
      <span>TOP</span>
    `;
    backToTopBtn.addEventListener("click", () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
    document.body.appendChild(backToTopBtn);
  }

  // Optimized Scroll Loop via requestAnimationFrame
  let isScrolling = false;
  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // A. Header Compact on Scroll
    if (header) {
      if (scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    // B. Progress Bar Scaling with fade-in when scrolling away from top
    if (scrollProgressBar) {
      if (scrollHeight > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / scrollHeight));
        scrollProgressBar.style.transform = `scaleX(${progress})`;
        scrollProgressBar.style.opacity = scrollY > 8 ? "1" : "0";
      } else {
        scrollProgressBar.style.opacity = "0";
      }
    }

    // C. Back To Top Visibility
    if (backToTopBtn) {
      if (scrollY > 380) {
        backToTopBtn.classList.add("is-visible");
      } else {
        backToTopBtn.classList.remove("is-visible");
      }
    }

    // D. Subtle Spotlight Parallax (Desktop Only)
    if (spotlight && window.innerWidth > 992) {
      const offset = Math.min(100, scrollY * 0.04);
      spotlight.style.transform = `translateY(${offset}px)`;
    }

    isScrolling = false;
  }

  window.addEventListener("scroll", () => {
    if (!isScrolling) {
      requestAnimationFrame(onScroll);
      isScrolling = true;
    }
  }, { passive: true });

  // Initial trigger
  onScroll();

  // 5. High-End Optical Scroll Reveal Engine
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealSelectors = [
    "section:not(.page-hero) .container > .section-header",
    "section:not(.page-hero) .container > h2",
    ".service-card",
    ".work-card",
    ".solution-card-nexora",
    ".pricing-card",
    ".package-card",
    ".pathway-card",
    ".blueprint-card-luxury",
    ".bp-capability-card",
    ".bp-process-card",
    ".about-industry-card",
    ".about-standard-card",
    ".contact-channel-card",
    ".deliverable-item",
    ".founder-content-card",
    ".industry-card-ref",
    ".journey-card",
    ".testimonial-card-ref",
    ".workflow-stage-card",
    ".metric-card-nexora",
    ".bento-card",
    ".feature-box",
    ".feature-card",
    ".timeline-item",
    ".faq-item",
    ".tech-category-group",
    ".article-hero-image-wrap",
    ".article-callout-box",
    ".upgrade-cta-card",
    ".table-responsive",
    ".contact-grid > div",
    ".audit-card",
    ".legal-content > h2"
  ];

  const revealCandidates = document.querySelectorAll(revealSelectors.join(", "));
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("dc-revealed");
          observer.unobserve(el);

          // After entrance transition completes, cleanly unbind entrance classes
          // so native hover transforms, 3D tilts, and interactions work 100% unimpeded.
          const delayStr = el.style.getPropertyValue("--dc-delay") || "0ms";
          const delayMs = parseFloat(delayStr) || 0;
          setTimeout(() => {
            el.classList.remove("dc-reveal", "dc-reveal-scale", "dc-revealed");
            el.style.removeProperty("--dc-delay");
            el.classList.add("dc-reveal-complete");
          }, 850 + delayMs);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
  );

  // Group siblings in grids for graceful wave stagger
  const gridSelectors = [
    ".service-grid",
    ".service-grid-2",
    ".service-grid-3",
    ".service-grid-4",
    ".blueprint-grid",
    ".blueprint-luxury-grid",
    ".bp-capabilities-grid",
    ".bp-process-grid",
    ".about-industry-grid",
    ".about-standards-grid",
    ".contact-channels-grid",
    ".deliverables-grid",
    ".founder-equal-grid",
    ".industries-grid-ref",
    ".journey-comparison-grid",
    ".packages-grid",
    ".pathways-grid",
    ".solutions-grid-nexora",
    ".testimonials-grid-3",
    ".workflow-stages-grid",
    ".metrics-grid-nexora",
    ".timeline-list",
    ".faq-list",
    ".features-grid"
  ];

  const gridContainers = document.querySelectorAll(gridSelectors.join(", "));
  gridContainers.forEach((grid) => {
    const items = grid.querySelectorAll([
      ".service-card",
      ".work-card",
      ".solution-card-nexora",
      ".package-card",
      ".pathway-card",
      ".blueprint-card-luxury",
      ".bp-capability-card",
      ".bp-process-card",
      ".about-industry-card",
      ".about-standard-card",
      ".contact-channel-card",
      ".deliverable-item",
      ".founder-content-card",
      ".industry-card-ref",
      ".journey-card",
      ".testimonial-card-ref",
      ".workflow-stage-card",
      ".metric-card-nexora",
      ".timeline-item",
      ".faq-item",
      ".feature-box",
      ".feature-card",
      ".bento-card"
    ].join(", "));

    items.forEach((item, idx) => {
      item.style.setProperty("--dc-delay", `${Math.min(idx * 70, 420)}ms`);
    });
  });

  revealCandidates.forEach((el) => {
    // If reduced motion is requested or mobile screen, keep elements naturally displayed
    if (prefersReducedMotion || window.innerWidth <= 768) {
      el.classList.add("dc-reveal-complete");
      return;
    }

    const rect = el.getBoundingClientRect();
    // Elements already visible above the fold render immediately without entrance delay
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("dc-reveal-complete");
    } else {
      if (el.classList.contains("article-hero-image-wrap")) {
        el.classList.add("dc-reveal-scale", "dc-reveal-staged");
      } else {
        el.classList.add("dc-reveal", "dc-reveal-staged");
      }
      revealObserver.observe(el);
    }
  });

  // Failsafe: After 1500ms, ensure all staged elements become fully visible even if observer is throttled
  setTimeout(() => {
    document.querySelectorAll(".dc-reveal-staged").forEach((el) => {
      el.classList.remove("dc-reveal-staged");
      el.classList.add("dc-reveal-complete");
    });
  }, 1500);

  // 6. Interactive FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (question && answer) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        // Close other open items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
            const otherAnswer = otherItem.querySelector(".faq-answer");
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        if (!isActive) {
          item.classList.add("active");
          answer.style.maxHeight = (answer.scrollHeight + 32) + "px";
        } else {
          item.classList.remove("active");
          answer.style.maxHeight = null;
        }
      });
    }
  });

  // 7. Portfolio Filtering (Work Page)
  const filterTabs = document.querySelectorAll(".filter-tab");
  const workCards = document.querySelectorAll(".work-card");

  if (filterTabs.length > 0 && workCards.length > 0) {
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const filterValue = tab.getAttribute("data-filter");

        workCards.forEach((card) => {
          const category = card.getAttribute("data-category");
          if (filterValue === "all" || category === filterValue) {
            card.style.display = "flex";
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            }, 50);
          } else {
            card.style.opacity = "0";
            card.style.transform = "translateY(10px)";
            setTimeout(() => {
              card.style.display = "none";
            }, 250);
          }
        });
      });
    });
  }

  // 8. Contact & Free Audit Google Sheets Form Handling
  const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxZ2kvd-Z6gw-ua5eHkDG-WST6zL6OetihQ_hdTNyhE8Fl0kxXxkDLhvoVenpQC2DS1Hg/exec";

  const forms = document.querySelectorAll(".interactive-form");
  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const banner = form.parentElement.querySelector(".form-success-banner");
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Submit";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting to Google Sheets...";
      }

      // Determine target tab and extract data
      const isContactForm = form.id === "contact-form";
      const sheetName = isContactForm ? "Book Consultation" : "Free Audit";

      let payload = {
        sheetName: sheetName,
        timestamp: new Date().toLocaleString()
      };

      if (isContactForm) {
        const indSelect = form.querySelector('[name="industry"]');
        const needSelect = form.querySelector('[name="need"]');
        const prefSelect = form.querySelector('[name="preferred_method"]');
        const rawPhone = form.querySelector('[name="phone"]')?.value.trim() || "";
        const phone = rawPhone.startsWith("+") ? "'" + rawPhone : rawPhone;

        payload = {
          ...payload,
          name: form.querySelector('[name="name"]')?.value.trim() || "",
          business: form.querySelector('[name="business"]')?.value.trim() || "",
          email: form.querySelector('[name="email"]')?.value.trim() || "",
          phone: phone,
          website: form.querySelector('[name="website"]')?.value.trim() || "",
          industry: indSelect && indSelect.selectedIndex > 0 ? indSelect.options[indSelect.selectedIndex].text : "",
          need: needSelect && needSelect.selectedIndex > 0 ? needSelect.options[needSelect.selectedIndex].text : "",
          current_process: form.querySelector('[name="current_process"]')?.value.trim() || "",
          preferred_method: prefSelect && prefSelect.selectedIndex >= 0 ? prefSelect.options[prefSelect.selectedIndex].text : "Email"
        };
      } else {
        const indSelect = form.querySelector('[name="industry"]');
        const helpSelect = form.querySelector('[name="primary_help"]');
        const prefContact = form.querySelector('input[name="preferred_contact"]:checked')?.value || "email";
        const rawPhone = form.querySelector('[name="phone"]')?.value.trim() || "";
        const phone = rawPhone.startsWith("+") ? "'" + rawPhone : rawPhone;

        payload = {
          ...payload,
          name: form.querySelector('[name="name"]')?.value.trim() || "",
          business: form.querySelector('[name="business"]')?.value.trim() || "",
          email: form.querySelector('[name="email"]')?.value.trim() || "",
          phone: phone,
          website: form.querySelector('[name="website"]')?.value.trim() || "",
          industry: indSelect && indSelect.selectedIndex > 0 ? indSelect.options[indSelect.selectedIndex].text : "",
          need: helpSelect && helpSelect.selectedIndex > 0 ? helpSelect.options[helpSelect.selectedIndex].text : "",
          current_process: form.querySelector('[name="challenge"]')?.value.trim() || "",
          preferred_method: prefContact.charAt(0).toUpperCase() + prefContact.slice(1)
        };
      }

      try {
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });

        form.reset();
        form.style.display = "none";
        if (banner) {
          banner.style.display = "block";
          banner.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // GA4 Lead Conversion Event (Zero PII sent to analytics)
        if (typeof gtag === "function") {
          gtag("event", isContactForm ? "generate_lead" : "request_audit", {
            event_category: "Conversion",
            event_label: isContactForm ? "Contact & Consultation Form" : "Free Audit Form",
            value: 1
          });
        }
      } catch (err) {
        console.error("Submission error:", err);
        alert("There was an issue submitting your form. Please try again or reach out directly on WhatsApp.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  });

  // 9. 3D Tilt Effect on Desktop
  if (window.innerWidth > 992) {
    const tiltElements = document.querySelectorAll(".service-card, .work-card, .feature-card");
    tiltElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        el.style.transition = "transform 0.1s ease-out";
      });

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = x / rect.width - 0.5;
        const yc = y / rect.height - 0.5;
        const rotateX = -yc * 8;
        const rotateY = xc * 8;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  }

  // 10. Floating AI Chatbot Widget
  function initFloatingChatbot() {
    if (document.getElementById("dc-chatbot-trigger")) return;

    // Create trigger button
    const trigger = document.createElement("button");
    trigger.id = "dc-chatbot-trigger";
    trigger.className = "dc-chatbot-trigger";
    trigger.setAttribute("aria-label", "Open AI Chat Assistant");
    trigger.innerHTML = `
      <span class="dc-chatbot-online-dot"></span>
      <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    // Create chat window
    const win = document.createElement("div");
    win.id = "dc-chatbot-window";
    win.className = "dc-chatbot-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "AI Chat Assistant");
    win.innerHTML = `
      <div class="dc-chatbot-header">
        <div class="dc-chatbot-header-left">
          <div class="dc-chatbot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><rect x="4" y="8" width="16" height="12" rx="4"></rect><circle cx="9" cy="14" r="1.5"></circle><circle cx="15" cy="14" r="1.5"></circle></svg>
            <span class="dc-chatbot-status-dot"></span>
          </div>
          <div class="dc-chatbot-header-info">
            <h4>Digital Cron AI</h4>
            <p>Online • Instant Assistant</p>
          </div>
        </div>
        <button class="dc-chatbot-close-btn" id="dc-chatbot-close-btn" aria-label="Close Chat">&times;</button>
      </div>
      <div class="dc-chatbot-body" id="dc-chatbot-messages">
        <!-- Messages will appear here -->
      </div>
      <form class="dc-chatbot-footer" id="dc-chatbot-form">
        <input type="text" class="dc-chatbot-input" id="dc-chatbot-input" placeholder="Ask a question or select an option..." autocomplete="off" />
        <button type="submit" class="dc-chatbot-send-btn" aria-label="Send Message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    `;

    document.body.appendChild(trigger);
    document.body.appendChild(win);

    const msgsContainer = win.querySelector("#dc-chatbot-messages");
    const form = win.querySelector("#dc-chatbot-form");
    const input = win.querySelector("#dc-chatbot-input");
    const closeBtn = win.querySelector("#dc-chatbot-close-btn");

    let isGreeted = false;

    function openChat() {
      win.classList.add("is-open");
      trigger.classList.add("is-active");
      if (!isGreeted) {
        showGreeting();
        isGreeted = true;
      }
      setTimeout(() => input.focus(), 250);
    }

    function closeChat() {
      win.classList.remove("is-open");
      trigger.classList.remove("is-active");
    }

    trigger.addEventListener("click", () => {
      if (win.classList.contains("is-open")) {
        closeChat();
      } else {
        openChat();
      }
    });

    closeBtn.addEventListener("click", closeChat);

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && win.classList.contains("is-open")) {
        closeChat();
      }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (win.classList.contains("is-open") && !win.contains(e.target) && !trigger.contains(e.target)) {
        closeChat();
      }
    });

    const waSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.472 1.332 4.982l-1.356 4.954 5.074-1.33c1.464.798 3.102 1.218 4.773 1.218.066 0 .132 0 .198-.002 5.505-.062 9.923-4.594 9.923-10.099-.001-5.399-4.386-9.789-9.956-9.711zm5.176 13.914c-.218.618-1.282 1.206-1.766 1.26-.444.048-.992.052-1.611-.144-.383-.12-.871-.274-1.493-.541-2.646-1.139-4.348-3.832-4.48-4.009-.131-.177-1.077-1.433-1.077-2.733 0-1.3.682-1.939.925-2.203.243-.264.53-.33.707-.33.177 0 .354.002.508.01.163.008.383-.062.597.45.218.528.751 1.83.817 1.962.066.132.11.286.022.463-.088.176-.132.286-.264.441-.132.155-.278.347-.397.466-.132.132-.27.276-.115.541.155.265.688 1.132 1.474 1.831.992.883 1.83 1.158 2.095 1.291.265.132.42.11.575-.066.155-.177.663-.772.84-1.037.177-.265.354-.221.597-.132.243.088 1.547.728 1.812.861.265.132.442.198.508.309.067.11.067.638-.151 1.256z"/></svg>`;

    function getWhatsAppCard() {
      return `
        <div class="dc-chat-wa-card">
          <div class="dc-wa-header">
            <div class="dc-wa-icon-box">
              ${waSvg}
            </div>
            <div class="dc-wa-title-area">
              <div class="dc-wa-title">WhatsApp Direct Line</div>
              <div class="dc-wa-sub">Usually replies in minutes • Founder Direct</div>
            </div>
          </div>
          <div class="dc-wa-number-badge">
            ${waSvg}
            <span>+91 73280 37272</span>
          </div>
          <p class="dc-wa-desc">Connect directly with Sarique Zamal (Founder) to discuss your business requirements, project timeline, or pricing.</p>
          <a href="https://wa.me/917328037272" target="_blank" rel="noopener noreferrer" class="dc-wa-action-btn">
            ${waSvg}
            <span>Chat on WhatsApp &rarr;</span>
          </a>
        </div>
      `;
    }

    function getThreeWaysCard(introText = "To discuss your question or project in detail, choose from any of our <strong>3 direct contact ways</strong>:") {
      return `
        <div class="dc-chat-three-ways">
          <p class="dc-three-ways-intro">${introText}</p>
          <div class="dc-three-ways-list">
            <!-- 1. WhatsApp -->
            <a href="https://wa.me/917328037272" target="_blank" rel="noopener noreferrer" class="dc-way-item dc-way-wa">
              <div class="dc-way-icon">
                ${waSvg}
              </div>
              <div class="dc-way-info">
                <span class="dc-way-label">1. WhatsApp Direct</span>
                <span class="dc-way-val">+91 73280 37272</span>
              </div>
              <span class="dc-way-arrow">&rarr;</span>
            </a>

            <!-- 2. Email -->
            <a href="mailto:contact@digitalcron.com" class="dc-way-item dc-way-email">
              <div class="dc-way-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </div>
              <div class="dc-way-info">
                <span class="dc-way-label">2. Email Inquiries</span>
                <span class="dc-way-val">contact@digitalcron.com</span>
              </div>
              <span class="dc-way-arrow">&rarr;</span>
            </a>

            <!-- 3. Book Appointment -->
            <a href="https://cal.com/sariquezamal/30min" target="_blank" rel="noopener noreferrer" class="dc-way-item dc-way-cal" data-cal-link="sariquezamal/30min" data-cal-namespace="30min">
              <div class="dc-way-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="dc-way-info">
                <span class="dc-way-label">3. Book Appointment</span>
                <span class="dc-way-val">Free 30-Min Strategy Call</span>
              </div>
              <span class="dc-way-arrow">&rarr;</span>
            </a>
          </div>
        </div>
      `;
    }

    function showGreeting() {
      appendBotMessage("Hey 👋 Ask Question or select an option above", true, null, true);
    }

    function appendUserMessage(text) {
      const msg = document.createElement("div");
      msg.className = "dc-chat-msg user";
      msg.innerHTML = `<div class="dc-chat-bubble">${escapeHtml(text)}</div>`;
      msgsContainer.appendChild(msg);
      msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }

    function appendBotMessage(html, showChips = false, customChips = null, chipsAbove = false) {
      const msg = document.createElement("div");
      msg.className = "dc-chat-msg bot";
      
      const chipsData = customChips || [
        { query: "services", label: "🚀 Explore AI Services" },
        { query: "consultation", label: "📅 Book Free Consultation" },
        { query: "audit", label: "🔍 Free Website Audit" },
        { query: "whatsapp", label: "💬 Chat on WhatsApp" }
      ];

      let chipsHtml = "";
      if (showChips) {
        chipsHtml += `<div class="dc-chat-chips" style="${chipsAbove ? 'margin-bottom: 10px; margin-top: 0;' : 'margin-top: 6px;'}">`;
        chipsData.forEach(c => {
          chipsHtml += `<button type="button" class="dc-chat-chip" data-query="${c.query}">${c.label}</button>`;
        });
        chipsHtml += `</div>`;
      }

      let bubbleHtml = `<div class="dc-chat-bubble">${html}</div>`;

      msg.innerHTML = chipsAbove ? (chipsHtml + bubbleHtml) : (bubbleHtml + chipsHtml);
      msgsContainer.appendChild(msg);
      msgsContainer.scrollTop = msgsContainer.scrollHeight;

      if (showChips) {
        msg.querySelectorAll(".dc-chat-chip").forEach(chip => {
          chip.addEventListener("click", () => {
            const query = chip.getAttribute("data-query");
            handleQuery(query, chip.innerText);
          });
        });
      }
    }

    function handleQuery(query, displayText) {
      appendUserMessage(displayText);
      setTimeout(() => {
        if (query === "services") {
          appendBotMessage(`We build high-performance systems for growing businesses:<br><br>• <strong>High-Performance Websites</strong><br>• <strong>AI Reception</strong> (24/7 call management)<br>• <strong>Trained AI Chatbots</strong> (Instant enquiry qualification)<br>• <strong>Booking & Follow-Up Automation</strong><br><br>Explore more at our <a href="services.html">Services Page</a> or connect with us directly!`, true, [
            { query: "whatsapp", label: "💬 WhatsApp with Us" },
            { query: "consultation", label: "📅 Book Consultation" },
            { query: "audit", label: "🔍 Free Website Audit" }
          ]);
        } else if (query === "consultation") {
          appendBotMessage(`Schedule a direct 30-minute discovery session with our founder Sarique Zamal to map your digital systems:<br><br>👉 <a href="https://cal.com/sariquezamal/30min" target="_blank" rel="noopener noreferrer" data-cal-link="sariquezamal/30min">Book Free 30-Min Strategy Call &rarr;</a>`, true, [
            { query: "whatsapp", label: "💬 WhatsApp Direct" },
            { query: "email", label: "✉️ Send Email" },
            { query: "services", label: "🚀 View Services" }
          ]);
        } else if (query === "audit") {
          appendBotMessage(`We analyze your website's performance, conversion flow, and automation readiness:<br><br>👉 <a href="free-audit.html">Request Your Free Website Audit &rarr;</a>`, true, [
            { query: "consultation", label: "📅 Book Consultation" },
            { query: "whatsapp", label: "💬 Chat on WhatsApp" }
          ]);
        } else if (query === "whatsapp") {
          appendBotMessage(getWhatsAppCard(), true, [
            { query: "consultation", label: "📅 Book Appointment" },
            { query: "email", label: "✉️ Send Email" },
            { query: "services", label: "🚀 View Services" }
          ]);
        } else if (query === "email") {
          appendBotMessage(`Send your project scope or inquiries to our team:<br><br>✉️ Email: <a href="mailto:contact@digitalcron.com"><strong>contact@digitalcron.com</strong></a><br><br>We reply within 24 business hours.`, true, [
            { query: "whatsapp", label: "💬 Chat on WhatsApp" },
            { query: "consultation", label: "📅 Book Appointment" }
          ]);
        } else {
          respondToText(displayText);
        }
      }, 400);
    }

    function respondToText(raw) {
      const q = raw.toLowerCase();
      if (q.includes("whatsapp") || q.includes("whats app") || q.includes("phone") || q.includes("number") || q.includes("call")) {
        appendBotMessage(getWhatsAppCard(), true, [
          { query: "consultation", label: "📅 Book Appointment" },
          { query: "email", label: "✉️ Send Email" },
          { query: "services", label: "🚀 View Services" }
        ]);
      } else if (q.includes("email") || q.includes("mail")) {
        appendBotMessage(`Send your questions or requirements directly to our founder:<br><br>✉️ Email: <a href="mailto:contact@digitalcron.com"><strong>contact@digitalcron.com</strong></a><br><br>Or choose another preferred channel:`, true, [
          { query: "whatsapp", label: "💬 WhatsApp (+91 73280 37272)" },
          { query: "consultation", label: "📅 Book Free Consultation" }
        ]);
      } else if (q.includes("service") || q.includes("build") || q.includes("website") || q.includes("bot") || q.includes("voice") || q.includes("feature")) {
        appendBotMessage(`We specialize in conversion websites, voice receptionists, trained chatbots, and autonomous workflow pipelines.<br><br>Check out our <a href="services.html">Services</a> or <a href="solutions.html">Solution Blueprints</a>!`, true, [
          { query: "consultation", label: "📅 Book Consultation" },
          { query: "whatsapp", label: "💬 Chat on WhatsApp" }
        ]);
      } else if (q.includes("book") || q.includes("meeting") || q.includes("consult") || q.includes("appointment") || q.includes("schedule")) {
        appendBotMessage(`You can book an architecture strategy call with our founder directly:<br><br>👉 <a href="https://cal.com/sariquezamal/30min" target="_blank" rel="noopener noreferrer" data-cal-link="sariquezamal/30min">Schedule Free 30-Min Call &rarr;</a>`, true, [
          { query: "whatsapp", label: "💬 WhatsApp Direct" },
          { query: "email", label: "✉️ Send Email" }
        ]);
      } else if (q.includes("audit") || q.includes("review")) {
        appendBotMessage(`Want us to review your site? Submit your URL here:<br><br>👉 <a href="free-audit.html">Free Audit Request &rarr;</a>`, true, [
          { query: "consultation", label: "📅 Book Consultation" },
          { query: "whatsapp", label: "💬 Chat on WhatsApp" }
        ]);
      } else if (q.includes("hi") || q.includes("hey") || q.includes("hello")) {
        appendBotMessage("Hey 👋 Ask Question or select an option above", true, null, true);
      } else {
        // Fallback for any unspecified question: give them WhatsApp, Email, and Book Appointment to discuss
        appendBotMessage(getThreeWaysCard("To discuss your specific question or project requirements, choose from any of our <strong>3 direct ways to connect</strong>:"), true, [
          { query: "whatsapp", label: "💬 Chat on WhatsApp" },
          { query: "email", label: "✉️ Send Email" },
          { query: "consultation", label: "📅 Book Appointment" }
        ]);
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      appendUserMessage(val);
      input.value = "";
      setTimeout(() => respondToText(val), 400);
    });

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }

  initFloatingChatbot();

  // 10. Lightweight GA4 Conversion & Engagement Event Listeners
  document.addEventListener("click", (e) => {

    const target = e.target.closest("a, button");
    if (!target) return;

    // A. WhatsApp Direct Click
    const href = target.getAttribute("href") || "";
    if (href.includes("wa.me") || href.includes("whatsapp.com")) {
      gtag("event", "whatsapp_click", {
        event_category: "Contact",
        event_label: "WhatsApp Direct Chat"
      });
      return;
    }

    // B. Cal.com Booking Consultation Trigger Clicks & Cross-Screen Resilience
    const calTarget = target.closest("[data-cal-link], .dc-way-cal, #header-cta-btn, #hero-primary-btn");
    const isCalIntent = !!calTarget || target.hasAttribute("data-cal-link") || (target.innerText && /book\s+a?\s*(?:free\s+)?(?:automation\s+)?consultation|schedule\s+(?:a\s+)?call/i.test(target.innerText));
    
    if (isCalIntent) {
      const btnLabel = (target.innerText || "Book Consultation").trim().slice(0, 50);
      gtag("event", "booking_cta_click", {
        event_category: "Engagement",
        event_label: btnLabel
      });

      const CAL_DIRECT_URL = "https://cal.com/sariquezamal/30min";
      const isMobileScreen = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobileScreen) {
        // Mobile viewports: open direct full-screen booking to eliminate shadow-DOM height clamping, scroll freeze, and iframe cutoff
        e.preventDefault();
        e.stopPropagation();
        window.open(CAL_DIRECT_URL, "_blank", "noopener,noreferrer");
        return;
      }

      // Desktop viewports: if Cal modal fails to render within 700ms (e.g. adblocker, tracking protection), gracefully open direct link
      setTimeout(function() {
        const modal = document.querySelector("cal-modal-box");
        const iframe = document.querySelector("iframe.cal-embed");
        const isVisible = (modal && window.getComputedStyle(modal).display !== "none" && window.getComputedStyle(modal).visibility !== "hidden") ||
                          (iframe && window.getComputedStyle(iframe).display !== "none");
        if (!isVisible) {
          window.open(CAL_DIRECT_URL, "_blank", "noopener,noreferrer");
        }
      }, 700);
      return;
    }

    // C. Free Audit CTA Clicks
    if (href.includes("free-audit.html") || (target.innerText && /free\s+audit|request\s+audit/i.test(target.innerText))) {
      gtag("event", "audit_cta_click", {
        event_category: "Engagement",
        event_label: (target.innerText || "Free Audit").trim().slice(0, 50)
      });
      return;
    }

    // D. Direct Email & Phone Clicks
    if (href.startsWith("mailto:")) {
      gtag("event", "contact_click", {
        event_category: "Contact",
        event_label: "Email Link"
      });
      return;
    }
    if (href.startsWith("tel:")) {
      gtag("event", "contact_click", {
        event_category: "Contact",
        event_label: "Phone Link"
      });
      return;
    }
  });
});
