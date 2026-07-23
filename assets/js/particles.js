/* ===== Canvas 粒子星空 — v1.1 性能优化版 ===== */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  let animId = null;
  let running = true;

  // ---- Page Visibility API：后台暂停动画 ----
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) loop(); else cancelAnimationFrame(animId);
  });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    // 响应窗口大小变化，重新计算粒子数
    const target = Math.min(150, Math.floor(W * H / 10000));
    if (particles.length < target) {
      while (particles.length < target) particles.push(new Particle());
    } else if (particles.length > target) {
      particles.length = target;
    }
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- 粒子数随屏幕尺寸动态调整，移动端自动降采样 ----
  const IS_MOBILE = window.matchMedia('(max-width:768px)').matches;
  const BASE_COUNT = IS_MOBILE ? 60 : 150;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + .3;
      this.vx = (Math.random() - .5) * .3;
      this.vy = (Math.random() - .5) * .3;
      this.alpha = Math.random() * .5 + .2;
      this.hue = Math.random() > .5 ? 180 : 300;
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const f = (120 - dist) / 120 * .8;
        this.vx += (dx / dist) * f;
        this.vy += (dy / dist) * f;
      }
      this.vx *= .98; this.vy *= .98;
      this.x  += this.vx;
      this.y  += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},100%,70%,${this.alpha})`;
      ctx.fill();
    }
  }

  // 初始化粒子
  for (let i = 0; i < BASE_COUNT; i++) particles.push(new Particle());

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function drawLines() {
    // 动态距离阈值，粒子多时缩小连接距离，减少 draw call
    const threshold = particles.length > 120 ? 85 : 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < threshold) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,240,255,${(1 - d/threshold) * .18})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }
  loop();
})();
