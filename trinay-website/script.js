/* ========================================================
   SCRIPT.JS – TRINAY 3D Website Interactive Layer
   ======================================================== */

/* ── 1. THREE.JS PARTICLE BACKGROUND ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  // Split particles into three layers for size/opacity variation
  const SMALL_COUNT = 3200; // many fine particles
  const MED_COUNT = 900;    // medium, more visible
  const LARGE_COUNT = 150;  // fewer large particles
  const GLOW_COUNT = 220;   // background glow points

  const geoSmall = new THREE.BufferGeometry();
  const geoMed = new THREE.BufferGeometry();
  const geoLarge = new THREE.BufferGeometry();
  const glowGeo = new THREE.BufferGeometry();

  const posSmall = new Float32Array(SMALL_COUNT * 3);
  const colSmall = new Float32Array(SMALL_COUNT * 3);
  const posMed = new Float32Array(MED_COUNT * 3);
  const colMed = new Float32Array(MED_COUNT * 3);
  const posLarge = new Float32Array(LARGE_COUNT * 3);
  const colLarge = new Float32Array(LARGE_COUNT * 3);
  const glowPos = new Float32Array(GLOW_COUNT * 3);
  const glowCol = new Float32Array(GLOW_COUNT * 3);

  // palettes: mix of bright/light, mid, and darker tones for visible contrast
  const brightPalette = [
    [0.78, 0.86, 1.00],
    [0.56, 0.72, 1.00],
    [0.40, 0.60, 1.00]
  ];
  const midPalette = [
    [0.18, 0.55, 1.00],
    [0.31, 0.68, 1.00],
    [0.50, 0.82, 1.00]
  ];
  const darkPalette = [
    [0.06, 0.10, 0.22],
    [0.09, 0.14, 0.36],
    [0.12, 0.20, 0.48]
  ];
  const glowPalette = [
    [0.06, 0.14, 0.46],
    [0.09, 0.22, 0.62],
    [0.14, 0.34, 0.84],
  ];

  // small particles (mostly bright/mid, some dark sprinkled)
  for (let i = 0; i < SMALL_COUNT; i++) {
    posSmall[i * 3] = (Math.random() - 0.5) * 260;
    posSmall[i * 3 + 1] = (Math.random() - 0.5) * 260;
    posSmall[i * 3 + 2] = (Math.random() - 0.5) * 180;
    const p = Math.random();
    const c = p > 0.07 ? midPalette[i % midPalette.length] : darkPalette[i % darkPalette.length];
    colSmall[i * 3] = c[0];
    colSmall[i * 3 + 1] = c[1];
    colSmall[i * 3 + 2] = c[2];
  }

  // medium particles (more visible, mix of bright and mid)
  for (let i = 0; i < MED_COUNT; i++) {
    posMed[i * 3] = (Math.random() - 0.5) * 240;
    posMed[i * 3 + 1] = (Math.random() - 0.5) * 240;
    posMed[i * 3 + 2] = (Math.random() - 0.5) * 160;
    const c = (i % 4 === 0) ? brightPalette[i % brightPalette.length] : midPalette[i % midPalette.length];
    colMed[i * 3] = c[0];
    colMed[i * 3 + 1] = c[1];
    colMed[i * 3 + 2] = c[2];
  }

  // large particles (few, for subtle focal points)
  for (let i = 0; i < LARGE_COUNT; i++) {
    posLarge[i * 3] = (Math.random() - 0.5) * 200;
    posLarge[i * 3 + 1] = (Math.random() - 0.5) * 200;
    posLarge[i * 3 + 2] = (Math.random() - 0.5) * 140;
    const c = (Math.random() > 0.5) ? brightPalette[i % brightPalette.length] : darkPalette[i % darkPalette.length];
    colLarge[i * 3] = c[0];
    colLarge[i * 3 + 1] = c[1];
    colLarge[i * 3 + 2] = c[2];
  }

  for (let i = 0; i < GLOW_COUNT; i++) {
    glowPos[i * 3] = (Math.random() - 0.5) * 180;
    glowPos[i * 3 + 1] = (Math.random() - 0.5) * 180;
    glowPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    const c = glowPalette[i % glowPalette.length];
    glowCol[i * 3] = c[0];
    glowCol[i * 3 + 1] = c[1];
    glowCol[i * 3 + 2] = c[2];
  }

  geoSmall.setAttribute('position', new THREE.BufferAttribute(posSmall, 3));
  geoSmall.setAttribute('color', new THREE.BufferAttribute(colSmall, 3));
  geoMed.setAttribute('position', new THREE.BufferAttribute(posMed, 3));
  geoMed.setAttribute('color', new THREE.BufferAttribute(colMed, 3));
  geoLarge.setAttribute('position', new THREE.BufferAttribute(posLarge, 3));
  geoLarge.setAttribute('color', new THREE.BufferAttribute(colLarge, 3));
  glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));
  glowGeo.setAttribute('color', new THREE.BufferAttribute(glowCol, 3));

  const matSmall = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.32,
    sizeAttenuation: true,
  });
  const matMed = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const matLarge = new THREE.PointsMaterial({
    size: 0.42,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });
  const glowMat = new THREE.PointsMaterial({
    size: 0.34,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particlesSmall = new THREE.Points(geoSmall, matSmall);
  const particlesMed = new THREE.Points(geoMed, matMed);
  const particlesLarge = new THREE.Points(geoLarge, matLarge);
  const glowParticles = new THREE.Points(glowGeo, glowMat);
  scene.add(particlesSmall);
  scene.add(particlesMed);
  scene.add(particlesLarge);
  scene.add(glowParticles);

  let mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    // speed up time base to make motion faster
    const t = Date.now() * 0.0012;
    // Layered rotations for depth and faster motion parallax
    particlesSmall.rotation.y = t * 0.06 + mouse.x * 0.04;
    particlesSmall.rotation.x = t * 0.03 + mouse.y * 0.02;
    particlesMed.rotation.y = t * 0.09 + mouse.x * 0.06;
    particlesMed.rotation.x = t * 0.045 + mouse.y * 0.04;
    particlesLarge.rotation.y = t * 0.13 + mouse.x * 0.08;
    particlesLarge.rotation.x = t * 0.06 + mouse.y * 0.045;
    glowParticles.rotation.y = t * 0.09 + mouse.x * 0.06;
    glowParticles.rotation.x = t * 0.05 + mouse.y * 0.04;

    // stronger, quicker pulsing for visible intensity changes
    const glowPulse = 0.75 + Math.sin(t * 6.5) * 0.18; // faster, larger amplitude
    glowMat.opacity = Math.min(1.0, Math.max(0.35, glowPulse));
    matLarge.size = 0.36 + Math.sin(t * 2.6) * 0.12; // larger, quicker size variation for large points
    renderer.render(scene, camera);
  }

  animate();
})();

/* ── 2. CUSTOM CURSOR ── */
(function () {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let fx = 0, fy = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });

  function loop() {
    fx += (cx - fx) * 0.14;
    fy += (cy - fy) * 0.14;
    cursor.style.left   = cx + 'px';
    cursor.style.top    = cy + 'px';
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .feat-card, .stat-card, .tech-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '16px'; cursor.style.height = '16px';
      follower.style.width = '56px'; follower.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px'; cursor.style.height = '10px';
      follower.style.width = '36px'; follower.style.height = '36px';
    });
  });
})();

/* ── 3. NAVBAR SCROLL ── */
(function () {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

/* ── 3B. AUTH / ACCOUNT NAV STATE ── */
(function () {
  const cachedEmail = window.localStorage.getItem('trinay_user_email') || '';
  const cachedName = window.localStorage.getItem('trinay_user_name') || '';

  function formatAccountName(email) {
    const base = String(email || '').split('@', 1)[0].replace(/[._-]+/g, ' ').trim();
    if (!base) return 'Account';
    return base.replace(/\b\w/g, (ch) => ch.toUpperCase());
  }

  function setNavState(user) {
    const email = user && user.email ? String(user.email) : '';
    const displayName = user && user.display_name ? String(user.display_name) : formatAccountName(email);
    const isAuthed = Boolean(email);
    const accountLabel = isAuthed ? `Account · ${displayName}` : 'Sign In';
    const accountHref = isAuthed ? 'detect.html' : 'login.html';
    const detectHref = isAuthed ? 'detect.html' : 'login.html?next=detect.html';
    const ctaLabel = isAuthed ? 'Live Detection' : 'Log In';

    document.querySelectorAll('.nav-links a').forEach((link) => {
      const href = (link.getAttribute('href') || '').replace(/^\.?\/?/, '');
      if (href === 'login.html') {
        link.textContent = accountLabel;
        link.setAttribute('href', accountHref);
      }
      if (href === 'detect.html') {
        link.setAttribute('href', detectHref);
      }
    });

    const cta = document.querySelector('.nav-cta');
    if (cta) {
      cta.textContent = ctaLabel;
      cta.setAttribute('href', detectHref);
    }

    if (isAuthed) {
      window.localStorage.setItem('trinay_user_email', email);
      window.localStorage.setItem('trinay_user_name', displayName);
    } else {
      window.localStorage.removeItem('trinay_user_email');
      window.localStorage.removeItem('trinay_user_name');
    }
  }

  async function refreshAuth() {
    if (cachedEmail) {
      setNavState({ email: cachedEmail, display_name: cachedName || formatAccountName(cachedEmail) });
    }

    try {
      const response = await fetch('/api/whoami', { cache: 'no-store' });
      const data = await response.json();
      if (data && data.ok && data.user && data.user.email) {
        setNavState(data.user);
      } else if (!cachedEmail) {
        setNavState(null);
      }
    } catch (_) {
      if (!cachedEmail) {
        setNavState(null);
      }
    }
  }

  if (document.querySelector('.nav-links') || document.querySelector('.nav-cta')) {
    window.addEventListener('DOMContentLoaded', refreshAuth);
  }
})();

/* ── 4. HAMBURGER (MOBILE) ── */
(function () {
  const btn   = document.getElementById('hamburger');
  const links = document.querySelector('.nav-links');
  const cta   = document.querySelector('.nav-cta');
  btn.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.cssText = open ? '' : 'display:flex;flex-direction:column;position:fixed;top:70px;left:0;right:0;background:rgba(13,6,24,0.97);padding:1.5rem;gap:0.5rem;z-index:999;border-bottom:1px solid rgba(181,123,238,0.15);';
    if (cta) cta.style.display = open ? '' : 'none';
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
    links.style.cssText = '';
  }));
})();

/* ── 5. EYE TRACKING ── */
(function () {
  const eye   = document.getElementById('eye-orb');
  const iris  = eye ? eye.querySelector('.eye-iris') : null;
  if (!eye || !iris) return;
  document.addEventListener('mousemove', (e) => {
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    iris.style.transform = `translate(calc(-50% + ${dx * 18}px), calc(-50% + ${dy * 12}px))`;
  });
  /* Blink every ~5 s */
  setInterval(() => {
    const top = eye.querySelector('.eye-lid.top');
    const bot = eye.querySelector('.eye-lid.bottom');
    if (!top) return;
    top.style.cssText = 'position:absolute;top:0;left:0;right:0;height:50%;background:inherit;transition:height 0.12s;z-index:2;';
    bot.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:50%;background:inherit;transition:height 0.12s;z-index:2;';
    top.style.height = '50%'; bot.style.height = '50%';
    setTimeout(() => { top.style.height = '0'; bot.style.height = '0'; }, 130);
  }, 5000);
})();

/* ── 6. SCROLL REVEAL ── */
(function () {
  const els = document.querySelectorAll('.feat-card, .stat-card, .tech-card, .how-step, .section-header, .contact-card');
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();

/* ── 7. COUNTER ANIMATION ── */
(function () {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  const obs  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1600;
      const step   = 16;
      const inc    = target / (dur / step);
      let cur      = 0;
      const timer  = setInterval(() => {
        cur += inc;
        if (cur >= target) { el.textContent = target; clearInterval(timer); return; }
        el.textContent = Math.floor(cur);
      }, step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
})();

/* ── 8. 3D CARD TILT ── */
(function () {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── 9. ACTIVE NAV LINK HIGHLIGHT ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current
        ? 'var(--lavender-lt)' : '';
    });
  });
})();
