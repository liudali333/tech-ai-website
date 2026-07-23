/* ===== Three.js 3D 粒子球 — v1.1 性能优化版 ===== */
(function () {
  const container = document.getElementById('three-container');
  if (!container || typeof THREE === 'undefined') return;

  const IS_MOBILE = window.matchMedia('(max-width:768px)').matches;
  const N = IS_MOBILE ? 800 : 2000;  // 移动端粒子减半

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, .1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !IS_MOBILE });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1 : 2));
  container.appendChild(renderer.domElement);

  camera.position.z = 5;

  // Particle sphere — 用 TypedArray 预分配，避免 GC 抖动
  const N3 = N * 3;
  const pos = new Float32Array(N3);
  const col = new Float32Array(N3);
  for (let i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 1.8 + (Math.random() - .5) * .3;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
    const t = Math.random();
    col[i*3]   = t < .5 ? 0 : 1;
    col[i*3+1] = t < .5 ? .94 : 0;
    col[i*3+2] = t < .5 ? 1 : .92;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  // 标记静态属性，减少每帧更新开销
  geo.attributes.position.needsUpdate = false;
  geo.attributes.color.needsUpdate    = false;

  const mat = new THREE.PointsMaterial({
    size: IS_MOBILE ? .04 : .025,
    vertexColors: true,
    transparent: true, opacity: .85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Mouse drag rotation
  let dragging = false, prevX = 0, prevY = 0;
  renderer.domElement.addEventListener('mousedown', e => { dragging = true; prevX = e.clientX; prevY = e.clientY; });
  window.addEventListener('mouseup',   ()  => { dragging = false; });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - prevX, dy = e.clientY - prevY;
    points.rotation.y += dx * .005;
    points.rotation.x += dy * .005;
    prevX = e.clientX; prevY = e.clientY;
  });
  // Touch support for mobile
  renderer.domElement.addEventListener('touchstart', e => {
    dragging = true;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
  window.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - prevX, dy = e.touches[0].clientY - prevY;
    points.rotation.y += dx * .005;
    points.rotation.x += dy * .005;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });

  // Auto rotate when idle
  let autoRotate = true;
  renderer.domElement.addEventListener('mousemove', () => { autoRotate = false; });
  renderer.domElement.addEventListener('touchstart', () => { autoRotate = false; });
  renderer.domElement.addEventListener('mouseleave', () => { autoRotate = true; });

  // Page Visibility API
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  });

  function loop() {
    if (!running) return;
    if (autoRotate) points.rotation.y += .002;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
})();
