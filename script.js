(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  var themeBtn = document.getElementById('theme-toggle');
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* Mobile menu */
  var menuBtn = document.getElementById('menu-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    links.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!links.classList.contains('is-open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (links.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
  });

  /* Scroll: nav border + progress bar */
  var nav = document.querySelector('.nav');
  var bar = document.getElementById('progress-bar');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* Active section + reveal */
  var navLinks = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'work', 'skills', 'experience', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) sectionObs.observe(el);
    });

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Spotlight on case cards */
  document.querySelectorAll('.case').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Copy email */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }
  var copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.dataset.email;
    function done() {
      copyBtn.classList.add('is-copied'); copyBtn.querySelector('span').textContent = 'Copied';
      showToast('Email copied to clipboard');
      setTimeout(function () { copyBtn.classList.remove('is-copied'); copyBtn.querySelector('span').textContent = 'Copy'; }, 2000);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(done, function () { window.location.href = 'mailto:' + email; });
    } else {
      var ta = document.createElement('textarea'); ta.value = email; ta.setAttribute('readonly', '');
      ta.style.position = 'absolute'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { window.location.href = 'mailto:' + email; }
      document.body.removeChild(ta);
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* Hero payment trace */
  var steps = Array.prototype.slice.call(document.querySelectorAll('#txn-steps li'));
  var statusEl = document.getElementById('txn-status');
  var idEl = document.getElementById('txn-id');
  var barEl = document.getElementById('txn-bar');
  var chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  function newId() { var s = 'PY_'; for (var i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }
  function setStatus(ok) {
    statusEl.textContent = ok ? 'approved' : 'processing';
    statusEl.className = 'pill ' + (ok ? 'pill--ok' : 'pill--wait');
  }
  function render(n) {
    steps.forEach(function (li, i) {
      li.classList.toggle('is-done', i < n);
      li.classList.toggle('is-active', i === n);
    });
    barEl.style.width = (n / steps.length * 100) + '%';
  }

  if (reduce) { render(steps.length); setStatus(true); return; }

  var n = 0;
  function tick() {
    if (n === 0) { idEl.textContent = newId(); setStatus(false); }
    render(n);
    if (n === steps.length) { setStatus(true); n = 0; setTimeout(tick, 2600); return; }
    n++;
    setTimeout(tick, 650 + Math.random() * 350);
  }
  tick();
})();
