/**
 * Digital Cron — 3D Visual Workflow Spatial Tilt Engine
 * Powers realistic 3D isometric mouse tracking, gyro parallax, and spatial depth
 * for the Hero Visual Workflow Card representing real business scenarios.
 */
(function () {
  function initHeroWorkflow3D() {
    const stage = document.getElementById("heroWorkflowStage");
    const card = document.getElementById("heroWorkflowCard");
    if (!stage || !card) return;

    // Check for touch / mobile or reduced motion preference
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.style.transform = "rotateY(-4deg) rotateX(2deg)";
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroWorkflow3D);
  } else {
    initHeroWorkflow3D();
  }
})();
