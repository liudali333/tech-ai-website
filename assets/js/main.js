/* ===== 页面主逻辑 — v1.1 ===== */
(function () {
  'use strict';

  // ---- 页面路由 ----
  const pages    = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-links a');

  function showPage(id) {
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 切换页面时重新触发 reveal 动画
    document.querySelectorAll('.reveal').forEach(el => el.classList.remove('visible'));
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        if (isElementInView(el)) el.classList.add('visible');
      });
    }, 100);
  }

  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showPage(a.dataset.page);
    });
  });

  // ---- IntersectionObserver 滚动动效 ----
  function isElementInView(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * .88 && rect.bottom > 0;
  }
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  // ---- 新闻 JSON 加载（带去重 + 错误处理）----
  let newsLoaded = false;
  async function loadNews() {
    if (newsLoaded) return;
    newsLoaded = true;
    const list = document.getElementById('news-list');
    if (!list) return;
    try {
      const res  = await fetch('api/news.php', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.news || !Array.isArray(data.news)) return;
      list.innerHTML = data.news.map(n => `
        <div class="news-item">
          <h3>${esc(n.title)}</h3>
          <div class="meta">${esc(n.date)}</div>
          <div class="news-detail">${esc(n.content)}</div>
        </div>
      `).join('');
      list.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('open'));
      });
    } catch (e) {
      list.innerHTML = '<p style="color:var(--muted)">新闻加载失败，请稍后刷新。</p>';
    }
  }
  // 当用户切换到新闻页时再加载
  document.querySelector('[data-page="news"]')?.addEventListener('click', loadNews);
  // 首次已显示新闻页则立即加载
  if (document.getElementById('news')?.classList.contains('active')) loadNews();

  // ---- 联系表单提交（防抖 + 按钮 loading）----
  let formSubmitting = false;
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', debounce(async e => {
      if (formSubmitting) return;
      formSubmitting = true;
      const btn  = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>⏳ 发送中…</span>';
      btn.disabled = true;

      e.preventDefault();
      // 验证码校验
    const captchaAns = document.getElementById('captcha-ans')?.value;
    const captchaQ   = document.getElementById('captcha-ans');
    if (!captchaAns || captchaAns !== (captchaQ?._ans ?? '')) {
      msg.textContent = '❌ 验证码错误或已过期，请刷新重试';
      msg.style.color = '#ff4444';
      btn.innerHTML = orig;
      btn.disabled = false;
      formSubmitting = false;
      return;
    }
    const fd = new FormData(form);
      try {
        const res = await fetch('api/contact.php', { method:'POST', body: fd });
        const d   = await res.json();
        const msg = document.getElementById('form-msg');
        if (d.ok) {
          msg.textContent = '✅ 提交成功！我们会尽快联系你。';
          msg.style.color = '#00f0ff';
          form.reset();
        } else {
          msg.textContent = '❌ ' + (d.msg || '提交失败');
          msg.style.color = '#ff4444';
        }
      } catch (e) {
        document.getElementById('form-msg').textContent = '❌ 网络错误，请检查网络后重试';
      } finally {
        btn.innerHTML = orig;
        btn.disabled   = false;
        formSubmitting = false;
      }
    }, 400));
  }

  // ---- 访问统计（无感上报，失败静默）----
  try {
    const page = location.pathname.split('/').pop() || 'index.html';
    navigator.sendBeacon('api/stats.php', 'page=' + encodeURIComponent(page));
  } catch (e) {}

  // ---- 工具函数 ----
  function debounce(fn, ms) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
