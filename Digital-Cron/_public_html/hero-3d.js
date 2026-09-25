/**
 * Digital Cron — Interactive 3D Tech Object Engine
 * Renders a gyroscopic quantum chronometer core with orbital rings, wireframe lattice,
 * and particle nebula representing Web Development + AI Automation.
 */

(function () {
  function initHero3D() {
    const container = document.getElementById("hero-3d-container");
    const canvas = document.getElementById("hero-3d-canvas");
    if (!container || !canvas || typeof THREE === "undefined") return;

    // 1. Dimensions & Sizing
    let rect = container.getBoundingClientRect();
    let width = rect.width || 440;
    let height = rect.height || 440;

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Master Group containing all rotating 3D elements
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 3. Central Faceted AI Crystal Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 0); // Flat-shaded tech crystal
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.18,
      metalness: 0.88,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // 4. Inner Glowing Energy Core
    const innerGeo = new THREE.OctahedronGeometry(0.52, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    masterGroup.add(innerMesh);

    // 5. Cybernetic Wireframe Cage with Vertex Points
    const wireGeo = new THREE.IcosahedronGeometry(1.36, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.38
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    masterGroup.add(wireMesh);

    // Glowing Vertex Nodes on Wireframe
    const vertexPointsGeo = new THREE.BufferGeometry();
    vertexPointsGeo.setAttribute("position", wireGeo.attributes.position);
    const vertexPointsMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.075,
      transparent: true,
      opacity: 0.85
    });
    const vertexPoints = new THREE.Points(vertexPointsGeo, vertexPointsMat);
    masterGroup.add(vertexPoints);

    // 6. Gyroscopic Cron Orbital Rings (Automation Cycles)
    // Ring 1: Primary Emerald Orbit
    const ring1Geo = new THREE.TorusGeometry(2.05, 0.024, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.9,
      roughness: 0.15
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3.8;
    ring1.rotation.y = Math.PI / 6;
    masterGroup.add(ring1);

    // Satellite pulse beacon on Ring 1
    const sat1Geo = new THREE.SphereGeometry(0.065, 16, 16);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    ring1.add(sat1);

    // Ring 2: Secondary Cyan Orbit
    const ring2Geo = new THREE.TorusGeometry(1.72, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.85,
      roughness: 0.2
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.z = Math.PI / 4;
    masterGroup.add(ring2);

    // Satellite beacon on Ring 2
    const sat2Geo = new THREE.SphereGeometry(0.055, 16, 16);
    const sat2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
    ring2.add(sat2);

    // Ring 3: Equatorial Halo Ring
    const ring3Geo = new THREE.TorusGeometry(1.48, 0.014, 12, 70);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.55
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 2;
    masterGroup.add(ring3);

    // 7. Floating Cyber Particle Nebula
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 1.6 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // 8. Lighting System
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.6);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 2.2);
    dirLight2.position.set(-4, -3, 3);
    scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0x10b981, 3.5, 4);
    scene.add(coreLight);

    // 9. Pointer Drag & Momentum Physics
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    function onPointerDown(e) {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousPointerX = clientX;
      previousPointerY = clientY;
      rotationVelocityX = 0;
      rotationVelocityY = 0;
      container.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - previousPointerX;
        const deltaY = clientY - previousPointerY;
        rotationVelocityY = deltaX * 0.005;
        rotationVelocityX = deltaY * 0.005;
        masterGroup.rotation.y += rotationVelocityY;
        masterGroup.rotation.x += rotationVelocityX;
        previousPointerX = clientX;
        previousPointerY = clientY;
      }

      // Parallax calculation
      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = (clientY / window.innerHeight) * 2 - 1;
      targetParallaxX = normX * 0.22;
      targetParallaxY = -normY * 0.22;
    }

    function onPointerUp() {
      isDragging = false;
      container.style.cursor = "grab";
    }

    // Event listeners
    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // 10. Responsive Canvas Resize
    function onResize() {
      if (!container || !renderer || !camera) return;
      const r = container.getBoundingClientRect();
      width = r.width || 440;
      height = r.height || 440;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onResize);

    // 11. Intersection Observer (Freezes render loop when out of viewport)
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);

    // 12. Main Render Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Ambient Core Rotation
      if (!isDragging) {
        // Momentum velocity decay
        rotationVelocityX *= 0.94;
        rotationVelocityY *= 0.94;
        masterGroup.rotation.x += rotationVelocityX;
        masterGroup.rotation.y += rotationVelocityY;

        // Continuous ambient rotation
        masterGroup.rotation.y += 0.0035;
        masterGroup.rotation.x += 0.0015;
      }

      // Smooth Parallax
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.06;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.06;
      camera.position.x = currentParallaxX;
      camera.position.y = currentParallaxY;
      camera.lookAt(0, 0, 0);

      // Independent internal mesh movements
      coreMesh.rotation.y += 0.005;
      wireMesh.rotation.y -= 0.0035;
      innerMesh.rotation.z += 0.008;

      // Inner Core Harmonic Breathing Pulse
      const pulseScale = 1 + Math.sin(elapsedTime * 3.2) * 0.08;
      innerMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Orbital Rings Rotation
      ring1.rotation.z += 0.012;
      ring2.rotation.z -= 0.015;
      ring3.rotation.z += 0.008;

      // Satellite Beacons along Orbits
      const satAngle1 = elapsedTime * 1.5;
      sat1.position.set(Math.cos(satAngle1) * 2.05, Math.sin(satAngle1) * 2.05, 0);

      const satAngle2 = -elapsedTime * 1.8;
      sat2.position.set(Math.cos(satAngle2) * 1.72, Math.sin(satAngle2) * 1.72, 0);

      // Particle Nebula Drift
      particles.rotation.y -= 0.001;
      particles.rotation.x += 0.0008;

      renderer.render(scene, camera);
    }

    animate();
  }

  // Self-initialization: check if Three.js is already loaded
  if (typeof THREE === "undefined") {
    const script = document.createElement("script");
    script.src = "three.min.js";
    script.onload = initHero3D;
    document.head.appendChild(script);
  } else {
    // If Three.js is already loaded, init on DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initHero3D);
    } else {
      initHero3D();
    }
  }
})();
