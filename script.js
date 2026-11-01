(function () {
  var root = document.documentElement;

  // Theme toggle
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

  // Mobile menu
  var menuBtn = document.getElementById('menu-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    links.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!links.classList.contains('is-open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Nav border on scroll + active section
  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  var navLinks = Array.prototype.slice.call(links.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'stack', 'journey', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) sectionObs.observe(el);
    });

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  // Hero trace animation
  var log = document.getElementById('trace-log');
  var idEl = document.getElementById('trace-id');
  var statusEl = document.getElementById('trace-status');
  var steps = [
    ['order', 'create <b>merchant=AC_…</b>', 42],
    ['session', 'issue ECDH key <b>kid</b>', 18],
    ['card', 'encrypt AES-GCM <b>in browser</b>', 6],
    ['fraud', 'score <b>pass</b>', 31],
    ['route', 'acquirer <b>VISA → bank</b>', 12],
    ['3ds', 'challenge <b>frictionless</b>', 640],
    ['capture', 'status <b>APPROVED</b>', 210],
    ['ipn', 'signed webhook <b>200 OK</b>', 88]
  ];
  var chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  function newId() { var s = 'PY_'; for (var i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0;
  function row(step) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="t">' + step[0] + '</span><span class="s">' + step[1] + '</span><span class="ms">' + step[2] + 'ms</span>';
    return li;
  }
  function done() { statusEl.textContent = 'approved'; statusEl.className = 'pill pill--ok'; }

  if (reduce) {
    steps.forEach(function (s) { log.appendChild(row(s)); });
    done();
    return;
  }
  function tick() {
    if (i === 0) {
      log.innerHTML = ''; idEl.textContent = newId();
      statusEl.textContent = 'pending'; statusEl.className = 'pill pill--wait';
    }
    log.appendChild(row(steps[i]));
    i++;
    if (i === steps.length) { done(); i = 0; setTimeout(tick, 3200); }
    else setTimeout(tick, 520 + Math.random() * 380);
  }
  tick();
})();
