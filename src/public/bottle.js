/* =============================================================
   bottle.js — Hydra 3D can (Red Bull-style design)
   ============================================================= */

(function () {
  'use strict';

  /* ── WebGL detection ─────────────────────────────────────── */
  var canvas   = document.getElementById('bottle-canvas');
  var fallback = document.getElementById('bottle-fallback');
  if (!canvas) return;

  function checkWebGL() {
    try {
      var t = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (t.getContext('webgl') || t.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (!checkWebGL() || typeof THREE === 'undefined') {
    canvas.hidden = true;
    if (fallback) { fallback.hidden = false; fallback.removeAttribute('aria-hidden'); }
    return;
  }

  /* ── prefers-reduced-motion ──────────────────────────────── */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Renderer ────────────────────────────────────────────── */
  var wrap = canvas.parentElement;
  var W = canvas.clientWidth  || wrap.clientWidth  || 480;
  var H = canvas.clientHeight || wrap.clientHeight || 560;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ── Scene + Camera ──────────────────────────────────────── */
  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 50);
  camera.position.set(0, 0, 6.5);

  /* ── Lighting ────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  var key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 6, 5);
  scene.add(key);

  var front = new THREE.DirectionalLight(0xffffff, 1.0);
  front.position.set(0, 0, 6);
  scene.add(front);

  var fill = new THREE.DirectionalLight(0xffffff, 1.6);
  fill.position.set(-5, 1, 3);
  scene.add(fill);

  var rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(0, 2, -6);
  scene.add(rim);

  var topLight = new THREE.PointLight(0xffffff, 0.6, 5);
  topLight.position.set(0, 4, 2.5);
  scene.add(topLight);

  /* ── Canvas label texture (Red Bull-style) ───────────────── */
  function buildLabel() {
    var lc = document.createElement('canvas');
    lc.width  = 1024;
    lc.height = 1024;
    var ctx = lc.getContext('2d');

    /* ── Silver/aluminum base */
    var base = ctx.createLinearGradient(0, 0, 1024, 0);
    base.addColorStop(0,    '#7A8490');
    base.addColorStop(0.08, '#A8B2BC');
    base.addColorStop(0.20, '#C8D0D8');
    base.addColorStop(0.38, '#E8EDF2');
    base.addColorStop(0.50, '#F5F8FA');
    base.addColorStop(0.62, '#E0E6EC');
    base.addColorStop(0.80, '#C0C8D0');
    base.addColorStop(0.92, '#9AA4AE');
    base.addColorStop(1,    '#7A8490');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 1024, 1024);

    /* ── Blue upper panel (top ~55%) */
    var blueGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    blueGrad.addColorStop(0,    '#6E0D0D');
    blueGrad.addColorStop(0.08, '#A01515');
    blueGrad.addColorStop(0.22, '#C81E1E');
    blueGrad.addColorStop(0.40, '#E02525');
    blueGrad.addColorStop(0.50, '#EA2A2A');
    blueGrad.addColorStop(0.60, '#D02222');
    blueGrad.addColorStop(0.78, '#B01818');
    blueGrad.addColorStop(0.92, '#A01212');
    blueGrad.addColorStop(1,    '#6E0D0D');
    ctx.fillStyle = blueGrad;
    ctx.fillRect(0, 0, 1024, 560);

    /* ── Wave divider between blue and silver */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 530);
    ctx.bezierCurveTo(256, 490, 512, 590, 768, 540);
    ctx.bezierCurveTo(896, 515, 960, 560, 1024, 545);
    ctx.lineTo(1024, 580);
    ctx.bezierCurveTo(960, 595, 896, 550, 768, 575);
    ctx.bezierCurveTo(512, 625, 256, 525, 0, 565);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
    ctx.restore();


    /* ── Top silver band */
    var topBand = ctx.createLinearGradient(0, 0, 0, 60);
    topBand.addColorStop(0, 'rgba(255,255,255,0.25)');
    topBand.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topBand;
    ctx.fillRect(0, 0, 1024, 60);

    /* ── "HYDRA BEVERAGES" small header in blue section */
    ctx.font = '500 26px "Arial", sans-serif';
    ctx.fillStyle = 'rgba(255,180,180,0.75)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HYDRA BEVERAGES', 512, 120);

    /* ── Thin rule under header */
    ctx.strokeStyle = 'rgba(255,180,180,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, 148); ctx.lineTo(824, 148); ctx.stroke();

    /* ── Main wordmark — HYDRA */
    ctx.font = 'bold 210px "Arial Black", "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Shadow
    ctx.shadowColor = 'rgba(80,0,0,0.7)';
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = '#FFFFFF';
    ctx.fillText('HYDRA', 512, 340);
    ctx.shadowBlur = 0;

    /* ── Tagline in silver section */
    ctx.font = 'bold 36px "Arial", sans-serif';
    ctx.fillStyle = '#2A2A2A';
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur  = 4;
    ctx.fillText('ELECTROLYTE ENHANCED', 512, 670);
    ctx.shadowBlur = 0;

    /* ── Thin rule */
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(150, 710); ctx.lineTo(874, 710); ctx.stroke();

    /* ── ABV + drink type */
    ctx.font = '600 30px "Arial", sans-serif';
    ctx.fillStyle = 'rgba(30,30,30,0.75)';
    ctx.fillText('5% ABV  ·  ALCOHOLIC ENERGY DRINK', 512, 760);

    /* ── Volume */
    ctx.font = '400 22px "Arial", sans-serif';
    ctx.fillStyle = 'rgba(40,40,40,0.50)';
    ctx.fillText('8.4 FL OZ  ·  250 mL', 512, 940);

    return lc;
  }

  var labelTex = new THREE.CanvasTexture(buildLabel());
  labelTex.needsUpdate = true;

  /* ── Materials ───────────────────────────────────────────── */
  var bodyMat = new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color(0xDDDDDD),
    metalness:          0.85,
    roughness:          0.18,
    clearcoat:          0.6,
    clearcoatRoughness: 0.08,
    map:                labelTex,
  });

  var aluminumMat = new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color(0xC8C8C8),
    metalness:          0.97,
    roughness:          0.05,
    clearcoat:          0.4,
    clearcoatRoughness: 0.04,
  });

  /* ── Can geometry ────────────────────────────────────────── */
  // Red Bull 250ml proportions: H≈134mm, D≈66mm, ratio ~2.03:1
  var R      = 0.42;
  var bodyH  = 2.10;
  var rimH   = 0.08;
  var baseH  = 0.06;

  var can = new THREE.Group();

  /* Body */
  can.add(new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, bodyH, 64, 1, false),
    bodyMat
  ));

  /* Bottom flare */
  var bFlare = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R * 0.92, baseH, 64, 1, false),
    aluminumMat
  );
  bFlare.position.y = -(bodyH / 2) - (baseH / 2);
  can.add(bFlare);

  /* Bottom cap */
  var bCap = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.92, 64),
    aluminumMat
  );
  bCap.rotation.x = Math.PI / 2;
  bCap.position.y = -(bodyH / 2) - baseH;
  can.add(bCap);

  /* Seam bead — rolled edge where lid meets body */
  var seamBead = new THREE.Mesh(
    new THREE.TorusGeometry(R * 1.005, 0.024, 16, 64),
    aluminumMat
  );
  seamBead.rotation.x = Math.PI / 2;
  seamBead.position.y = bodyH / 2;
  can.add(seamBead);

  var lidY = (bodyH / 2) + 0.014;

  /* Lid — full flat circle */
  var lid = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.97, 64),
    aluminumMat
  );
  lid.rotation.x = -Math.PI / 2;
  lid.position.y = lidY;
  can.add(lid);

  /* Scored opening oval */
  var scoreOval = new THREE.Mesh(
    new THREE.TorusGeometry(0.095, 0.007, 8, 48),
    aluminumMat
  );
  scoreOval.rotation.x = Math.PI / 2;
  scoreOval.scale.z = 1.9;
  scoreOval.position.set(0, lidY + 0.003, 0.04);
  can.add(scoreOval);

  /* Tab body — wide flat paddle, z-axis aligned */
  var tabBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.105, 0.011, 0.24),
    aluminumMat
  );
  tabBody.position.set(0, lidY + 0.013, -0.02);
  can.add(tabBody);

  /* Tab rounded cap — near-side end (over pour opening) */
  var tabCapA = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.011, 32),
    aluminumMat
  );
  tabCapA.position.set(0, lidY + 0.013, 0.10);
  can.add(tabCapA);

  /* Tab rounded cap — far-side end (finger ring side) */
  var tabCapB = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.011, 32),
    aluminumMat
  );
  tabCapB.position.set(0, lidY + 0.013, -0.14);
  can.add(tabCapB);

  /* Rivet — dome nub connecting tab to lid */
  var rivet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.023, 0.020, 16),
    aluminumMat
  );
  rivet.position.set(0, lidY + 0.018, 0.05);
  can.add(rivet);

  /* Finger ring — D-ring loop at far end */
  var fingerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.052, 0.015, 12, 32),
    aluminumMat
  );
  fingerRing.rotation.x = -Math.PI / 2;
  fingerRing.position.set(0, lidY + 0.026, -0.185);
  can.add(fingerRing);

  /* Vertical centering */
  var totalH = bodyH + rimH + baseH;
  can.position.y = -(totalH * 0.08);
  scene.add(can);

  /* ── Drag rotation ───────────────────────────────────────── */
  var isDragging  = false;
  var prev        = { x: 0, y: 0 };
  var vel         = { x: 0, y: 0 };
  var autoRotate  = !reducedMotion;
  var resumeTimer = null;

  function dragStart(x, y) {
    isDragging = true;
    prev.x = x; prev.y = y;
    vel.x = 0;  vel.y = 0;
    autoRotate = false;
    if (resumeTimer) clearTimeout(resumeTimer);
  }
  function dragMove(x, y) {
    if (!isDragging) return;
    var dx = x - prev.x, dy = y - prev.y;
    can.rotation.y += dx * 0.010;
    can.rotation.x += dy * 0.007;
    can.rotation.x = Math.max(-0.75, Math.min(0.75, can.rotation.x));
    vel.y = dx * 0.010;
    vel.x = dy * 0.007;
    prev.x = x; prev.y = y;
  }
  function dragEnd() {
    isDragging = false;
    if (!reducedMotion) {
      resumeTimer = setTimeout(function () {
        autoRotate = true; vel.x = 0; vel.y = 0;
      }, 2000);
    }
  }

  /* Mouse */
  canvas.addEventListener('mousedown',  function (e) { dragStart(e.clientX, e.clientY); });
  window.addEventListener('mousemove',  function (e) { dragMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup',    dragEnd);

  /* Touch */
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    dragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    dragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  canvas.addEventListener('touchend', dragEnd);

  /* ── Resize ──────────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    W = canvas.clientWidth  || wrap.clientWidth  || 480;
    H = canvas.clientHeight || wrap.clientHeight || 560;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /* ── Animation loop ──────────────────────────────────────── */
  var clock = new THREE.Clock();
  var baseY = can.position.y;

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    if (autoRotate && !isDragging) {
      can.rotation.y += 0.004;
      can.position.y  = baseY + Math.sin(t * 0.65) * 0.045;
    } else if (!isDragging) {
      can.rotation.y += vel.y;
      can.rotation.x += vel.x;
      vel.x *= 0.90;
      vel.y *= 0.90;
    }

    renderer.render(scene, camera);
  }

  animate();

}());
