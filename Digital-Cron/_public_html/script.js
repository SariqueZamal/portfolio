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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
        <input type="text" class="dc-chatbot-input" id="dc-chatbot-input" placeholder="Type how can I help you..." autocomplete="off" />
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

    function showGreeting() {
      appendBotMessage("Hey 👋 How can I help you today?", true);
    }

    function appendUserMessage(text) {
      const msg = document.createElement("div");
      msg.className = "dc-chat-msg user";
      msg.innerHTML = `<div class="dc-chat-bubble">${escapeHtml(text)}</div>`;
      msgsContainer.appendChild(msg);
      msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }

    function appendBotMessage(html, showChips = false) {
      const msg = document.createElement("div");
      msg.className = "dc-chat-msg bot";
      let content = `<div class="dc-chat-bubble">${html}</div>`;
      if (showChips) {
        content += `
          <div class="dc-chat-chips">
            <button type="button" class="dc-chat-chip" data-query="services">🚀 Explore AI Services</button>
            <button type="button" class="dc-chat-chip" data-query="consultation">📅 Book Free Consultation</button>
            <button type="button" class="dc-chat-chip" data-query="audit">🔍 Free Website Audit</button>
            <button type="button" class="dc-chat-chip" data-query="whatsapp">💬 Chat on WhatsApp</button>
          </div>
        `;
      }
      msg.innerHTML = content;
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
          appendBotMessage(`We build high-performance systems for growing businesses:<br><br>• <strong>High-Performance Websites</strong><br>• <strong>AI Reception</strong> (24/7 call management)<br>• <strong>Trained AI Chatbots</strong> (Instant enquiry qualification)<br>• <strong>Booking & Follow-Up Automation</strong><br><br>Explore more at our <a href="services.html">Services Page</a> or tell us your requirement!`, true);
        } else if (query === "consultation") {
          appendBotMessage(`You can schedule a direct 30-minute discovery call with our founder Sarique Zamal to map your digital systems:<br><br>👉 <a href="contact.html">Book a Free Consultation &rarr;</a>`, true);
        } else if (query === "audit") {
          appendBotMessage(`We analyze your website's performance, conversion flow, and automation readiness:<br><br>👉 <a href="free-audit.html">Request Your Free Website Audit &rarr;</a>`, true);
        } else if (query === "whatsapp") {
          appendBotMessage(`Connect directly with our founder on WhatsApp for quick inquiries:<br><br>👉 <a href="https://wa.me/917328037272" target="_blank" rel="noopener noreferrer">Message on WhatsApp (+91 73280 37272) &rarr;</a>`, true);
        } else {
          respondToText(displayText);
        }
      }, 400);
    }

    function respondToText(raw) {
      const q = raw.toLowerCase();
      if (q.includes("hi") || q.includes("hey") || q.includes("hello")) {
        appendBotMessage("Hello! 👋 How can I assist you with your website or AI automation today?", true);
      } else if (q.includes("service") || q.includes("build") || q.includes("website") || q.includes("bot") || q.includes("voice")) {
        appendBotMessage(`We specialize in conversion websites, voice receptionists, and autonomous workflow pipelines.<br><br>Check out our <a href="services.html">Services</a> or <a href="work.html">System Blueprints</a>!`, true);
      } else if (q.includes("book") || q.includes("call") || q.includes("meeting") || q.includes("consult")) {
        appendBotMessage(`You can book an architecture session with our founder directly:<br><br>👉 <a href="contact.html">Schedule 30-Min Call &rarr;</a>`, true);
      } else if (q.includes("audit") || q.includes("free") || q.includes("review")) {
        appendBotMessage(`Want us to review your site? Submit your URL here:<br><br>👉 <a href="free-audit.html">Free Audit Request &rarr;</a>`, true);
      } else if (q.includes("whatsapp") || q.includes("phone") || q.includes("number") || q.includes("contact")) {
        appendBotMessage(`Reach founder Sarique Zamal directly:<br>💬 WhatsApp: <a href="https://wa.me/917328037272" target="_blank">+91 73280 37272</a><br>✉️ Email: <a href="mailto:contact@digitalcron.com">contact@digitalcron.com</a>`, true);
      } else {
        appendBotMessage(`Thanks for your question! We can definitely help. Would you like to <a href="contact.html">schedule a free consultation</a> or chat directly on <a href="https://wa.me/917328037272" target="_blank">WhatsApp</a>?`, true);
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
});
