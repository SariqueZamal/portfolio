/**
 * Digital Cron — 3D Visual Workflow Engine & Interactive Multi-Industry Switcher
 * Powers realistic 3D isometric mouse tracking, gyro parallax, and spatial depth
 * along with the interactive 5-Industry scenario tab switcher and auto-cycle engine.
 */
(function () {
  // 1. Data Definitions for 5 High-Impact Business Industries
  const INDUSTRY_SCENARIOS = {
    clinics: {
      id: "clinics",
      tabLabel: "Clinics",
      title: "Inbound Patient to Booked Chair",
      cycleTime: "⚡ 42s Full Cycle",
      steps: [
        {
          icon: "🌐",
          iconClass: "icon-cyan",
          title: "1. Patient Enquiry Captured",
          pill: "0s Delay • 10:42 PM",
          pillClass: "pill-cyan",
          desc: "Patient reaches out after-hours via web chat & WhatsApp seeking an implant consultation.",
          meta: "Channel: AI Web Concierge + Smart Voice Intake"
        },
        {
          icon: "🧠",
          iconClass: "icon-purple",
          title: "2. Autonomous AI Triage",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI verifies treatment requirements, budget eligibility, and consultation urgency.",
          meta: "Matched: High-Intent Clinical Consultation"
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Self-Service Booking",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Patient selects tomorrow at 10:30 AM with Dr. Zamal (Consultation Room 2).",
          meta: "Integrated: Real-Time Cal.com & Clinic Calendar Sync"
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Multi-Touch Confirmation",
          pill: "Automated",
          pillClass: "pill-green",
          desc: "Instant WhatsApp & SMS confirmation sent with digital patient intake form.",
          meta: "Dispatched: Webhook • Front Desk Alerted"
        }
      ]
    },
    realestate: {
      id: "realestate",
      tabLabel: "Real Estate",
      title: "Property Inquiry to Booked Site Visit",
      cycleTime: "⚡ 35s Full Cycle",
      steps: [
        {
          icon: "🏢",
          iconClass: "icon-cyan",
          title: "1. Buyer Lead Captured",
          pill: "0s Delay • 9:15 PM",
          pillClass: "pill-cyan",
          desc: "Prospect inquiries from listing page asking for 3BHK floor plans and pricing.",
          meta: "Channel: AI Voice Reception + Web Concierge"
        },
        {
          icon: "🧠",
          iconClass: "icon-purple",
          title: "2. Autonomous Lead Qualification",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI qualifies budget range, financing status, and preferred move-in timeline.",
          meta: "Matched: Pre-Qualified High-Intent Buyer"
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Automated Site Visit Booking",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Buyer books a Saturday 11:00 AM property tour directly into the assigned agent's calendar.",
          meta: "Integrated: 2-Way Google Calendar & CRM Sync"
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Multi-Touch Confirmation",
          pill: "Automated",
          pillClass: "pill-green",
          desc: "Instant WhatsApp brochure, location pin, and 24-hour reminder sequence triggered.",
          meta: "Dispatched: CRM Pipeline Updated"
        }
      ]
    },
    solar: {
      id: "solar",
      tabLabel: "Solar",
      title: "Homeowner Inquiry to Booked Site Survey",
      cycleTime: "⚡ 48s Full Cycle",
      steps: [
        {
          icon: "☀️",
          iconClass: "icon-cyan",
          title: "1. Solar Lead Captured",
          pill: "0s Delay • 8:20 PM",
          pillClass: "pill-cyan",
          desc: "Homeowner requests rooftop solar savings estimate via landing page.",
          meta: "Channel: AI Qualification Chat + Voice Callback"
        },
        {
          icon: "⚡",
          iconClass: "icon-purple",
          title: "2. Roof & Bill Triage",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI collects monthly electricity bill, roof ownership status, and pin code/zip.",
          meta: "Matched: Commercial-Ready Residential Install"
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Engineer Survey Scheduled",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Homeowner selects Thursday at 2:00 PM for an on-site solar assessment.",
          meta: "Integrated: Field Team Calendar & Dispatch Sync"
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Multi-Touch Confirmation",
          pill: "Automated",
          pillClass: "pill-green",
          desc: "Automated WhatsApp & email confirmation sent with pre-survey checklist.",
          meta: "Dispatched: Sales Engineer Notified"
        }
      ]
    },
    hospitality: {
      id: "hospitality",
      tabLabel: "Hospitality",
      title: "Guest Inquiry to Direct Room Booking",
      cycleTime: "⚡ 30s Full Cycle",
      steps: [
        {
          icon: "🛎️",
          iconClass: "icon-cyan",
          title: "1. Guest Enquiry Captured",
          pill: "0s Delay • 11:50 PM",
          pillClass: "pill-cyan",
          desc: "Traveler calls and messages after-hours asking about suite availability and airport transfer.",
          meta: "Channel: 24/7 AI Voice Concierge + Web Chat"
        },
        {
          icon: "✨",
          iconClass: "icon-purple",
          title: "2. Instant Concierge Resolution",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI checks live dates, answers amenity FAQs, and offers a direct-booking package.",
          meta: "Matched: 4-Night Direct Suite Reservation"
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Direct Reservation Confirmed",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Guest completes booking deposit and locks in check-in dates without OTA fees.",
          meta: "Integrated: Booking Engine & Calendar Sync"
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Multi-Touch Confirmation",
          pill: "Automated",
          pillClass: "pill-green",
          desc: "Instant WhatsApp itinerary, check-in guide, and concierge contact dispatched.",
          meta: "Dispatched: Front Desk & Housekeeping Synced"
        }
      ]
    },
    homeservices: {
      id: "homeservices",
      tabLabel: "Home Services",
      title: "Emergency Call to Dispatched Technician",
      cycleTime: "⚡ 38s Full Cycle",
      steps: [
        {
          icon: "🛠️",
          iconClass: "icon-cyan",
          title: "1. Service Call Answered",
          pill: "0s Delay • 7:45 AM",
          pillClass: "pill-cyan",
          desc: "Homeowner calls regarding urgent AC/HVAC repair while technicians are on-site.",
          meta: "Channel: 24/7 AI Voice Receptionist"
        },
        {
          icon: "⚡",
          iconClass: "icon-purple",
          title: "2. Issue & Location Triage",
          pill: "100% Qualified",
          pillClass: "pill-purple",
          desc: "AI captures system issue, service address, and urgency level with zero hold time.",
          meta: "Matched: Priority Residential Service Call"
        },
        {
          icon: "📅",
          iconClass: "icon-indigo",
          title: "3. Dispatch Slot Booked",
          pill: "Calendar Synced",
          pillClass: "pill-indigo",
          desc: "Customer books the 1:00 PM–3:00 PM arrival window from live technician availability.",
          meta: "Integrated: Dispatch Calendar & Job Board Sync"
        },
        {
          icon: "📲",
          iconClass: "icon-green",
          title: "4. Multi-Touch Confirmation",
          pill: "Automated",
          pillClass: "pill-green",
          desc: "Instant SMS & WhatsApp booking confirmation sent with technician arrival alerts.",
          meta: "Dispatched: Field Tech Assigned"
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
            <div class="hw-node-meta">${step.meta}</div>
          </div>
        </div>
      `
        )
        .join("");
    }

    function switchIndustry(industryKey, animate = true) {
      const data = INDUSTRY_SCENARIOS[industryKey];
      if (!data) return;

      const newIndex = INDUSTRY_KEYS.indexOf(industryKey);
      if (newIndex !== -1) currentIndex = newIndex;

      // Update Tab Buttons
      tabs.forEach((tab) => {
        const isMatch = tab.getAttribute("data-industry") === industryKey;
        tab.classList.toggle("active", isMatch);
        tab.setAttribute("aria-selected", isMatch ? "true" : "false");
      });

      if (!animate) {
        titleEl.innerHTML = `<span>${data.title}</span>`;
        latencyEl.textContent = data.cycleTime;
        pipelineEl.innerHTML = renderPipelineHTML(data.steps);
        return;
      }

      // Smooth Fade Out -> Update -> Fade In
      titleEl.style.opacity = "0";
      titleEl.style.transform = "translateY(3px)";
      latencyEl.style.opacity = "0";
      pipelineEl.style.opacity = "0";
      pipelineEl.style.transform = "translateY(4px)";

      setTimeout(() => {
        titleEl.innerHTML = `<span>${data.title}</span>`;
        latencyEl.textContent = data.cycleTime;
        pipelineEl.innerHTML = renderPipelineHTML(data.steps);

        titleEl.style.opacity = "1";
        titleEl.style.transform = "translateY(0)";
        latencyEl.style.opacity = "1";
        pipelineEl.style.opacity = "1";
        pipelineEl.style.transform = "translateY(0)";
      }, 160);
    }

    function startAutoCycle() {
      stopAutoCycle();
      autoTimer = setInterval(() => {
        if (!isPaused) {
          currentIndex = (currentIndex + 1) % INDUSTRY_KEYS.length;
          switchIndustry(INDUSTRY_KEYS[currentIndex], true);
        }
      }, 6000);
    }

    function stopAutoCycle() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    // Attach click events to tabs
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const industryKey = tab.getAttribute("data-industry");
        if (industryKey) {
          switchIndustry(industryKey, true);
          // Restart cycle from newly selected tab
          startAutoCycle();
        }
      });
    });

    // Pause on hover over stage or card
    const hoverTarget = stage || card;
    if (hoverTarget) {
      hoverTarget.addEventListener("mouseenter", () => {
        isPaused = true;
      });
      hoverTarget.addEventListener("mouseleave", () => {
        isPaused = false;
      });
    }

    // Initialize auto-cycling
    startAutoCycle();
  }

  // 3. 3D Spatial Tilt Engine with Mouse Tracking & Gyro Parallax
  function initHeroWorkflow3D() {
    const stage = document.getElementById("heroWorkflowStage");
    const card = document.getElementById("heroWorkflowCard");
    if (!stage || !card) return;

    // Check for touch / mobile or reduced motion preference
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.style.transform = "none";
      return;
    }

    let rafId = null;
    let targetX = 4;
    let targetY = -7;
    let currentX = 4;
    let currentY = -7;

    function onMouseMove(e) {
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
