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
            <a href="contact.html" class="dc-way-item dc-way-cal" data-cal-link="sariquezamal/30min" data-cal-namespace="30min">
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
      appendBotMessage("Hey 👋 How can I help you today?", true);
    }

    function appendUserMessage(text) {
      const msg = document.createElement("div");
      msg.className = "dc-chat-msg user";
      msg.innerHTML = `<div class="dc-chat-bubble">${escapeHtml(text)}</div>`;
      msgsContainer.appendChild(msg);
      msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }

    function appendBotMessage(html, showChips = false, customChips = null) {
      const msg = document.createElement("div");
      msg.className = "dc-chat-msg bot";
      let content = `<div class="dc-chat-bubble">${html}</div>`;
      
      const chipsData = customChips || [
        { query: "services", label: "🚀 Explore AI Services" },
        { query: "consultation", label: "📅 Book Free Consultation" },
        { query: "audit", label: "🔍 Free Website Audit" },
        { query: "whatsapp", label: "💬 Chat on WhatsApp" }
      ];

      if (showChips) {
        content += `<div class="dc-chat-chips">`;
        chipsData.forEach(c => {
          content += `<button type="button" class="dc-chat-chip" data-query="${c.query}">${c.label}</button>`;
        });
        content += `</div>`;
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
          appendBotMessage(`We build high-performance systems for growing businesses:<br><br>• <strong>High-Performance Websites</strong><br>• <strong>AI Reception</strong> (24/7 call management)<br>• <strong>Trained AI Chatbots</strong> (Instant enquiry qualification)<br>• <strong>Booking & Follow-Up Automation</strong><br><br>Explore more at our <a href="services.html">Services Page</a> or connect with us directly!`, true, [
            { query: "whatsapp", label: "💬 WhatsApp with Us" },
            { query: "consultation", label: "📅 Book Consultation" },
            { query: "audit", label: "🔍 Free Website Audit" }
          ]);
        } else if (query === "consultation") {
          appendBotMessage(`Schedule a direct 30-minute discovery session with our founder Sarique Zamal to map your digital systems:<br><br>👉 <a href="contact.html">Book Free 30-Min Strategy Call &rarr;</a>`, true, [
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
        appendBotMessage(`We specialize in conversion websites, voice receptionists, trained chatbots, and autonomous workflow pipelines.<br><br>Check out our <a href="services.html">Services</a> or <a href="work.html">System Blueprints</a>!`, true, [
          { query: "consultation", label: "📅 Book Consultation" },
          { query: "whatsapp", label: "💬 Chat on WhatsApp" }
        ]);
      } else if (q.includes("book") || q.includes("meeting") || q.includes("consult") || q.includes("appointment") || q.includes("schedule")) {
        appendBotMessage(`You can book an architecture strategy call with our founder directly:<br><br>👉 <a href="contact.html">Schedule Free 30-Min Call &rarr;</a>`, true, [
          { query: "whatsapp", label: "💬 WhatsApp Direct" },
          { query: "email", label: "✉️ Send Email" }
        ]);
      } else if (q.includes("audit") || q.includes("review")) {
        appendBotMessage(`Want us to review your site? Submit your URL here:<br><br>👉 <a href="free-audit.html">Free Audit Request &rarr;</a>`, true, [
          { query: "consultation", label: "📅 Book Consultation" },
          { query: "whatsapp", label: "💬 Chat on WhatsApp" }
        ]);
      } else if (q.includes("hi") || q.includes("hey") || q.includes("hello")) {
        appendBotMessage("Hello! 👋 How can I assist you with your website or AI automation today?", true);
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
});
