/* ===== 自定义光标 ===== */
(function () {
  const dot    = document.getElementById('cursor-dot');
  const trail  = document.getElementById('cursor-trail');
  if (!dot || !trail) return;

  let mx = -100, my = -100, tx = -100, ty = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  // Dot: instant
  (function moveDot() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    requestAnimationFrame(moveDot);
  })();

  // Trail: delayed
  (function moveTrail() {
    tx += (mx - tx) * .15;
    ty += (my - ty) * .15;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(moveTrail);
  })();

  document.addEventListener('mousedown', () => {
    dot.style.transform    = 'translate(-50%,-50%) scale(.6)';
    trail.style.opacity    = '.5';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform    = 'translate(-50%,-50%) scale(1)';
    trail.style.opacity    = '1';
  });
})();
