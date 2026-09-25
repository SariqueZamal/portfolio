document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Hamburger Menu
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
    if (mobileMenu) mobileMenu.classList.add("is-open");
    if (overlay) overlay.classList.add("is-open");
    if (hamburgerBtn) {
      hamburgerBtn.classList.add("is-active");
      hamburgerBtn.setAttribute("aria-expanded", "true");
    }
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (mobileMenu) mobileMenu.classList.remove("is-open");
    if (overlay) overlay.classList.remove("is-open");
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove("is-active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }
    document.body.style.overflow = "";
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // 2. Theme Toggle (Light / Dark Mode)
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light-mode");
    updateToggleIcon(true);
  } else {
    updateToggleIcon(false);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isLight = body.classList.toggle("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      updateToggleIcon(isLight);
    });
  }

  function updateToggleIcon(isLight) {
    if (!themeToggleBtn) return;
    if (isLight) {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    } else {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }
  }

  // 3. Mouse Spotlight Cursor Tracking
  const spotlight = document.getElementById("spotlight");
  if (spotlight) {
    document.addEventListener("mousemove", (e) => {
      spotlight.style.setProperty("--x", `${e.clientX}px`);
      spotlight.style.setProperty("--y", `${e.clientY}px`);
    });
  }

  // 4. Header Shrink on Scroll
  const header = document.getElementById("site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  // 5. Scroll Reveal Intersection Observer
  const revealElements = document.querySelectorAll("section, .service-card, .work-card, .solution-block, .insight-card");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    revealObserver.observe(el);
  });

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
          answer.style.maxHeight = answer.scrollHeight + "px";
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

  // 8. Contact & Free Audit Form Handling
  const forms = document.querySelectorAll(".interactive-form");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const banner = form.parentElement.querySelector(".form-success-banner");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting Request...";
      }

      setTimeout(() => {
        form.style.display = "none";
        if (banner) {
          banner.style.display = "block";
          banner.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 800);
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
});
