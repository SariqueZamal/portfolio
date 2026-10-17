/**
 * Digital Cron — 3D Visual Workflow Engine & Interactive Multi-Industry Switcher
 * Powers realistic 3D isometric mouse tracking, gyro parallax, and spatial depth
 * along with the interactive 5-Industry scenario tab switcher and auto-cycle engine.
 */
(function () {
  // 1. Precise Multi-Billion Dollar Enterprise Industry Scenarios
  const INDUSTRY_SCENARIOS = {
    clinics: {
      id: "clinics",
      tabLabel: "Clinics",
      title: "Inbound Patient to Booked Chair",
      cycleTime: "⚡ 42s Cycle",
      steps: [
        {
          icon: "🌐",
          iconClass: "icon-cyan",
          title: "1. Patient Enquiry Captured",
          pill: "0s Delay • 10:42 PM",
          pillClass: "pill-cyan",
          desc: "After-hours patient reaches out via web concierge or smart voice reception seeking an urgent dental implant consultation."
        },
        {
          icon: "🧠",
          iconClass: "icon-purple",
          title: "2. Autonomous Clinical Triage",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI instantly verifies insurance coverage, treatment scope, and procedure budget with zero waiting time."
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Direct Operatory Booking",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Patient self-books an open consultation slot directly into practice management calendar with Dr. Zamal."
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Automated Confirmation",
          pill: "Instant Dispatch",
          pillClass: "pill-green",
          desc: "WhatsApp & SMS confirmation sent with digital patient intake forms, alerting front desk staff in real time."
        }
      ]
    },
    realestate: {
      id: "realestate",
      tabLabel: "Real Estate",
      title: "Buyer Inquiry to Booked Site Visit",
      cycleTime: "⚡ 35s Cycle",
      steps: [
        {
          icon: "🏢",
          iconClass: "icon-cyan",
          title: "1. Buyer Lead Captured",
          pill: "0s Delay • 9:15 PM",
          pillClass: "pill-cyan",
          desc: "Prospective buyer inquires on a featured listing via website chat or phone requesting floor plans and pricing."
        },
        {
          icon: "🧠",
          iconClass: "icon-purple",
          title: "2. Autonomous Lead Qualification",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI qualifies purchase budget, financing pre-approval, and target move-in timeline before agent handover."
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Private Showing Scheduled",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Buyer books an available weekend showing slot synchronized in real time with the assigned broker's calendar."
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Automated Confirmation",
          pill: "Instant Dispatch",
          pillClass: "pill-green",
          desc: "Instant WhatsApp property brochure, GPS pin, and automated 24-hour reminder sequence dispatched to buyer."
        }
      ]
    },
    solar: {
      id: "solar",
      tabLabel: "Solar",
      title: "Solar Lead to Booked Site Survey",
      cycleTime: "⚡ 48s Cycle",
      steps: [
        {
          icon: "☀️",
          iconClass: "icon-cyan",
          title: "1. Homeowner Inquiry Captured",
          pill: "0s Delay • 8:20 PM",
          pillClass: "pill-cyan",
          desc: "Homeowner requests rooftop solar savings estimate through the custom solar calculator landing page."
        },
        {
          icon: "⚡",
          iconClass: "icon-purple",
          title: "2. Roof & Utility Assessment",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "System validates monthly electricity bill, roof ownership status, and shading viability for installation eligibility."
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Technical Survey Booked",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Qualified homeowner selects a convenient on-site survey window synced directly with engineering dispatch."
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Automated Confirmation",
          pill: "Instant Dispatch",
          pillClass: "pill-green",
          desc: "Automated WhatsApp and email confirmation sent with pre-survey checklist while alerting the engineering team."
        }
      ]
    },
    hospitality: {
      id: "hospitality",
      tabLabel: "Hospitality",
      title: "Guest Inquiry to Direct Booking",
      cycleTime: "⚡ 30s Cycle",
      steps: [
        {
          icon: "🛎️",
          iconClass: "icon-cyan",
          title: "1. Guest Enquiry Captured",
          pill: "0s Delay • 11:50 PM",
          pillClass: "pill-cyan",
          desc: "Traveler connects after-hours via voice concierge or website chat inquiring about suite availability and amenities."
        },
        {
          icon: "✨",
          iconClass: "icon-purple",
          title: "2. Real-Time Concierge Triage",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI checks live room inventory, answers hotel policy questions, and offers an exclusive direct-booking package."
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Direct Reservation Confirmed",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Guest locks in check-in dates with secure deposit payment, avoiding high third-party OTA commissions."
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Automated Confirmation",
          pill: "Instant Dispatch",
          pillClass: "pill-green",
          desc: "Instant WhatsApp welcome itinerary, check-in guide, and direct concierge contact dispatched to the guest."
        }
      ]
    },
    homeservices: {
      id: "homeservices",
      tabLabel: "Home Services",
      title: "Service Call to Dispatched Tech",
      cycleTime: "⚡ 38s Cycle",
      steps: [
        {
          icon: "🛠️",
          iconClass: "icon-cyan",
          title: "1. Emergency Call Answered",
          pill: "0s Delay • 7:45 AM",
          pillClass: "pill-cyan",
          desc: "Homeowner calls with an urgent HVAC or plumbing breakdown during morning rush with zero hold time."
        },
        {
          icon: "⚡",
          iconClass: "icon-purple",
          title: "2. Issue & Location Triage",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI receptionist captures exact equipment failure, service address, and emergency priority in natural dialogue."
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Dispatch Window Booked",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Customer chooses an available arrival window matched with on-duty technician territory and truck stock."
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Automated Confirmation",
          pill: "Instant Dispatch",
          pillClass: "pill-green",
          desc: "Immediate SMS confirmation sent with assigned technician details and GPS tracking link, updating dispatch board."
        }
      ]
    }
  };

  const INDUSTRY_KEYS = ["clinics", "realestate", "solar", "hospitality", "homeservices"];

  // 2. Interactive Industry Tab Switcher Engine
  function initHeroIndustrySwitcher() {
    const tabsContainer = document.getElementById("hwIndustryTabs");
    const titleEl = document.getElementById("hwScenarioTitle");
    const latencyEl = document.getElementById("hwLatencyChip");
    const pipelineEl = document.getElementById("hwPipeline");
    const card = document.getElementById("heroWorkflowCard");
    const stage = document.getElementById("heroWorkflowStage");

    if (!tabsContainer || !titleEl || !latencyEl || !pipelineEl) return;

    const tabs = tabsContainer.querySelectorAll(".hw-tab");
    let currentIndex = 0;
    let autoTimer = null;
    let isPaused = false;
    let userInteracted = false;

    function renderPipelineHTML(steps) {
      return steps
        .map(
          (step) => `
        <div class="hw-node">
          <div class="hw-node-icon ${step.iconClass}">${step.icon}</div>
          <div class="hw-node-body">
            <div class="hw-node-top">
              <span class="hw-node-title">${step.title}</span>
              <span class="hw-node-pill ${step.pillClass}">${step.pill}</span>
            </div>
            <div class="hw-node-desc">${step.desc}</div>
          </div>
        </div>
      `
        )
        .join("");
    }

    function stopAutoCycle() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function switchIndustry(industryKey, animate = true) {
      const data = INDUSTRY_SCENARIOS[industryKey];
      if (!data) return;

      if (pipelineEl.dataset.currentIndustry === industryKey) {
        return; // Already showing this industry
      }
      pipelineEl.dataset.currentIndustry = industryKey;

      const newIndex = INDUSTRY_KEYS.indexOf(industryKey);
      if (newIndex !== -1) currentIndex = newIndex;

      // Update Tab Buttons (both class and accessibility state immediately)
      tabs.forEach((tab) => {
        const isMatch = tab.getAttribute("data-industry") === industryKey;
        tab.classList.toggle("active", isMatch);
        tab.setAttribute("aria-selected", isMatch ? "true" : "false");
      });

      // Synchronous DOM update ensures instant zero-lag response on click
      titleEl.innerHTML = `<span>${data.title}</span>`;
      latencyEl.textContent = data.cycleTime;
      pipelineEl.innerHTML = renderPipelineHTML(data.steps);

      if (animate) {
        pipelineEl.classList.remove("hw-fade");
        void pipelineEl.offsetWidth; // Force reflow to replay micro-animation
        pipelineEl.classList.add("hw-fade");
      }
    }

    function startAutoCycle() {
      stopAutoCycle();
      autoTimer = setInterval(() => {
        if (!isPaused && !userInteracted) {
          currentIndex = (currentIndex + 1) % INDUSTRY_KEYS.length;
          switchIndustry(INDUSTRY_KEYS[currentIndex], true);
        }
      }, 6000);
    }

    // Global function for instant onclick access from HTML buttons
    window.dcSwitchIndustry = function (industryKey) {
      userInteracted = true;
      stopAutoCycle();
      switchIndustry(industryKey, true);
    };

    function triggerTabSelection(target) {
      if (!target) return;
      const tabEl = target.closest(".hw-tab");
      if (!tabEl) return;
      const key = tabEl.getAttribute("data-industry");
      if (key && INDUSTRY_SCENARIOS[key]) {
        userInteracted = true;
        stopAutoCycle();
        switchIndustry(key, true);
      }
    }

    // Direct click listeners on individual tabs
    tabs.forEach((tab) => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        triggerTabSelection(tab);
      });
    });

    // Also support pointerdown for instant responsiveness
    tabsContainer.addEventListener("pointerdown", function (e) {
      const tab = e.target.closest(".hw-tab");
      if (tab) {
        triggerTabSelection(tab);
      }
    });

    // Set initial data attribute
    pipelineEl.dataset.currentIndustry = "clinics";

    // Pause on hover over card
    const hoverTarget = stage || card;
    if (hoverTarget) {
      hoverTarget.addEventListener("mouseenter", () => {
        isPaused = true;
      });
      hoverTarget.addEventListener("mouseleave", () => {
        isPaused = false;
      });
    }

    // Begin ambient auto-cycle until user clicks a tab
    startAutoCycle();
  }

  // 3. 3D Spatial Tilt Engine with Mouse Tracking & Gyro Parallax
  function initHeroWorkflow3D() {
    const stage = document.getElementById("heroWorkflowStage");
    const card = document.getElementById("heroWorkflowCard");
    const tabsContainer = document.getElementById("hwIndustryTabs");
    if (!stage || !card) return;

    // Check for touch / mobile or reduced motion preference
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.style.transform = "none";
      return;
    }

    let isOverTabs = false;
    if (tabsContainer) {
      tabsContainer.addEventListener("mouseenter", () => { isOverTabs = true; });
      tabsContainer.addEventListener("mouseleave", () => { isOverTabs = false; });
    }

    let rafId = null;
    let targetX = 4;
    let targetY = -7;
    let currentX = 4;
    let currentY = -7;

    function onMouseMove(e) {
      // If user cursor is over the interactive tabs, freeze tilt for rock-solid clickability
      if (isOverTabs) return;

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetX = -(y / rect.height) * 14 + 3;
      targetY = (x / rect.width) * 14 - 6;

      if (!rafId) {
        rafId = requestAnimationFrame(updateTilt);
      }
    }

    function updateTilt() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      card.style.transform = `rotateY(${currentY.toFixed(2)}deg) rotateX(${currentX.toFixed(2)}deg)`;

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(updateTilt);
      } else {
        rafId = null;
      }
    }

    function onMouseLeave() {
      targetX = 4;
      targetY = -7;
      if (!rafId) {
        rafId = requestAnimationFrame(updateTilt);
      }
    }

    stage.addEventListener("mousemove", onMouseMove);
    stage.addEventListener("mouseleave", onMouseLeave);
  }

  // Boot on DOM Ready
  function init() {
    initHeroWorkflow3D();
    initHeroIndustrySwitcher();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
