/* ===== 霓虹交互特效 ===== */
(function () {
  // Hover glow for buttons
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('mouseenter', () => {
      b.style.boxShadow = '0 0 20px #00f0ff, 0 0 40px rgba(0,240,255,.35), 0 0 80px rgba(0,240,255,.15)';
    });
    b.addEventListener('mouseleave', () => {
      b.style.boxShadow = '';
    });
  });

  // Card neon border pulse
  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('mouseenter', () => {
      c.style.borderColor = '#00f0ff';
      c.style.boxShadow   = '0 0 24px rgba(0,240,255,.25), inset 0 0 20px rgba(0,240,255,.05)';
    });
    c.addEventListener('mouseleave', () => {
      c.style.borderColor = '';
      c.style.boxShadow   = '';
    });
  });
})();
