/* Devin Cecchetto — portfolio site
   All content lives in content.json and is editable at /admin.html */
(function () {
  'use strict';

  var DATA = null;
  var PAGES = ['home', 'videos', 'listen', 'acting', 'press', 'news', 'about', 'contact', 'presskit'];
  var MONTAGE_DELAYS = [0.8, 0.45, 1.25, 0.65, 1.1, 0, 0.55, 1.4, 0.9, 1.3, 0.7, 1.5];

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ytId(u) {
    var m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/.exec(u || '');
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(u || '') ? u : '');
  }
  /* Vimeo (incl. unlisted /id/hash) or YouTube link -> embeddable player URL */
  function embedSrc(u) {
    var v = /vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/.exec(u || '');
    if (v) return 'https://player.vimeo.com/video/' + v[1] + (v[2] ? '?h=' + v[2] + '&' : '?') + 'dnt=1';
    var y = ytId(u);
    return y ? 'https://www.youtube-nocookie.com/embed/' + y : '';
  }

  /* ---- HOME montage ---- */
  function renderMontage() {
    var wrap = document.getElementById('montage');
    wrap.innerHTML = '';
    DATA.montage.forEach(function (src, i) {
      var d = el('div');
      d.style.backgroundImage = "url('" + src + "')";
      if (i === 5) { d.style.opacity = '1'; d.style.animation = 'none'; }
      else d.style.animationDelay = MONTAGE_DELAYS[i] + 's';
      wrap.appendChild(d);
    });
  }

  /* ---- VIDEOS ---- */
  function renderVideos() {
    var list = document.getElementById('mv-list');
    list.innerHTML = '';
    DATA.projects.forEach(function (p) {
      var vid = ytId(p.youtube);
      var sec = el('section', { style: 'margin-top:40px' });
      var hero = el('div', { 'class': 'mv-hero' });
      hero.style.backgroundImage = "url('" + p.img + "')";
      hero.appendChild(el('div', { 'class': 'shade' }));
      var cap = el('div', { 'class': 'cap reveal' });
      if (!p.released) cap.appendChild(el('span', { 'class': 'chip' }, 'Coming soon'));
      cap.appendChild(el('h2', null, esc(p.title)));
      hero.appendChild(cap);
      sec.appendChild(hero);

      var body = el('div', { 'class': 'mv-body' });
      var media = el('div', { 'class': 'reveal' });
      if (vid) {
        var frame = el('div', { 'class': 'frame' });
        frame.appendChild(el('iframe', {
          src: 'https://www.youtube-nocookie.com/embed/' + vid,
          title: p.title,
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: ''
        }));
        media.appendChild(frame);
      } else {
        var soon = el('div', { 'class': 'soon' });
        soon.appendChild(el('span', { 'class': 'big' }, 'video premieres soon'));
        soon.appendChild(el('span', { 'class': 'small' }, 'subscribe on YouTube to catch the premiere'));
        media.appendChild(soon);
      }
      body.appendChild(media);
      body.appendChild(el('p', { 'class': 'mv-desc reveal' }, esc(p.desc)));
      sec.appendChild(body);
      list.appendChild(sec);
    });

    /* Released videos */
    if (DATA.releases.length) {
      var head = el('div', { style: 'padding:40px 24px 10px;text-align:center' });
      head.appendChild(el('p', { 'class': 'kicker', style: 'animation:none' }, 'From the catalogue'));
      head.appendChild(el('h1', { 'class': 'title', style: 'animation:none;font-size:clamp(34px,4.5vw,60px)' }, 'Released'));
      list.appendChild(head);
      var grid = el('div', { 'class': 'mv-grid' });
      DATA.releases.forEach(function (r, i) {
        var card = el('div', { 'class': 'mv-card reveal' + (i === 0 ? ' featured' : '') });
        var frame = el('div', { 'class': 'frame' });
        frame.appendChild(el('iframe', {
          src: 'https://www.youtube-nocookie.com/embed/' + ytId(r[1]),
          title: r[0],
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: ''
        }));
        card.appendChild(frame);
        card.appendChild(el('h3', null, esc(r[0])));
        card.appendChild(el('p', null, esc(r[2])));
        grid.appendChild(card);
      });
      list.appendChild(grid);
    }
  }

  /* ---- ACTING ---- */
  function renderActing() {
    /* demo reel takes the hero spot when set; the wide photo is the fallback */
    var mount = document.getElementById('reel-mount');
    mount.innerHTML = '';
    var reel = embedSrc(DATA.reel);
    document.querySelector('.acting-hero').style.display = reel ? 'none' : '';
    document.querySelectorAll('.cta-reel-btn').forEach(function (b) { b.style.display = reel ? '' : 'none'; });
    if (reel) {
      var block = el('div', { 'class': 'reel-block' });
      block.appendChild(el('p', { 'class': 'kick' }, 'Demo reel'));
      var frame = el('div', { 'class': 'frame' });
      frame.appendChild(el('iframe', {
        id: 'reel-iframe',
        src: reel,
        title: 'Demo reel',
        allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
        allowfullscreen: ''
      }));
      block.appendChild(frame);
      mount.appendChild(block);
    }
    document.getElementById('acting-hero').style.backgroundImage = "url('" + DATA.actingHero + "')";
    var wrap = document.getElementById('credits');
    wrap.innerHTML = '';
    DATA.credits.forEach(function (c, i) {
      var d = c[2]
        ? el('a', { 'class': 'credit', href: c[2], target: '_blank', rel: 'noopener' })
        : el('div', { 'class': 'credit' });
      d.style.animationDelay = (0.45 + i * 0.09).toFixed(2) + 's';
      d.appendChild(el('h3', null, esc(c[0])));
      d.appendChild(el('p', null, esc(c[1])));
      if (c[2]) d.appendChild(el('p', { 'class': 'go' }, 'IMDb &rarr;'));
      wrap.appendChild(d);
    });
    var imdb = document.getElementById('imdb-link');
    if (DATA.imdb) { imdb.href = DATA.imdb; imdb.parentElement.style.display = ''; }
    else imdb.parentElement.style.display = 'none';
  }

  /* ---- PRESS ---- */
  function renderPress() {
    var wrap = document.getElementById('press-list');
    wrap.innerHTML = '';
    DATA.press.forEach(function (q, i) {
      var a = el('a', { 'class': 'quote', href: q[2], target: '_blank', rel: 'noopener' });
      a.style.animationDelay = (0.45 + i * 0.12).toFixed(2) + 's';
      a.appendChild(el('p', { 'class': 'q' }, '&ldquo;' + esc(q[1]) + '&rdquo;'));
      a.appendChild(el('p', { 'class': 'o' }, esc(q[0]) + ' &rarr;'));
      wrap.appendChild(a);
    });
  }

  /* ---- NEWS (posts) ---- */
  function fmtDate(iso) {
    try {
      var d = new Date(iso + 'T12:00:00');
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return iso; }
  }
  function renderNews() {
    var posts = DATA.posts || [];
    var navLink = document.querySelector('nav.main a[href="#news"]');
    navLink.style.display = posts.length ? '' : 'none';
    var wrap = document.getElementById('news-list');
    wrap.innerHTML = '';
    posts.forEach(function (p, i) {
      var card = el('article', { 'class': 'post' });
      card.style.animationDelay = (0.45 + i * 0.12).toFixed(2) + 's';
      if (p.img) card.appendChild(el('div', { 'class': 'post-img', style: "background-image:url('" + p.img + "')" }));
      var inner = el('div', { 'class': 'post-body' });
      if (p.date) inner.appendChild(el('p', { 'class': 'post-date' }, esc(fmtDate(p.date))));
      inner.appendChild(el('h3', null, esc(p.title || '')));
      if (p.body) inner.appendChild(el('p', { 'class': 'post-text' }, esc(p.body)));
      var vid = ytId(p.youtube);
      if (vid) {
        var frame = el('div', { 'class': 'frame', style: 'margin-top:18px' });
        frame.appendChild(el('iframe', {
          src: 'https://www.youtube-nocookie.com/embed/' + vid, title: p.title || 'video', loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: ''
        }));
        inner.appendChild(frame);
      }
      if (p.link) inner.appendChild(el('p', { 'class': 'post-link' }, '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">Read more &rarr;</a>'));
      card.appendChild(inner);
      wrap.appendChild(card);
    });
  }

  /* ---- TIMELINE (About page) ---- */
  var tlObserver = null;
  function renderTimeline() {
    var items = DATA.timeline || [];
    document.getElementById('timeline-sec').style.display = items.length ? '' : 'none';
    var wrap = document.getElementById('timeline');
    wrap.innerHTML = '';
    if (tlObserver) tlObserver.disconnect();
    if (!items.length) return;
    items.forEach(function (t) {
      var it = el('div', { 'class': 'tl-item' });
      it.appendChild(el('span', { 'class': 'tl-dot' }));
      it.appendChild(el('p', { 'class': 'tl-year' }, esc(t.year || '')));
      if (t.title) it.appendChild(el('h3', null, esc(t.title)));
      if (t.text) it.appendChild(el('p', { 'class': 'txt' }, esc(t.text)));
      if (t.img) {
        it.appendChild(el('div', { 'class': 'tl-ph', style: "background-image:url('" + t.img + "')" }));
        if (t.cap) it.appendChild(el('p', { 'class': 'tl-cap' }, esc(t.cap)));
      }
      wrap.appendChild(it);
    });
    /* fade each entry in as it scrolls into view */
    if ('IntersectionObserver' in window) {
      tlObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); tlObserver.unobserve(en.target); }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      wrap.querySelectorAll('.tl-item').forEach(function (n) { tlObserver.observe(n); });
    } else {
      wrap.querySelectorAll('.tl-item').forEach(function (n) { n.classList.add('in'); });
    }
  }

  /* ---- Newsletter block (Listen + Contact) — hidden until a form action is configured ---- */
  function newsletterBlock() {
    var n = DATA.newsletter || {};
    if (!n.action) return null;
    var card = el('div', { 'class': 'news-card' });
    card.appendChild(el('h3', null, 'First listen'));
    card.appendChild(el('p', null, esc(n.note || 'New music first — straight to your inbox.')));
    var form = el('form', { action: n.action, method: 'post', target: '_blank' });
    form.appendChild(el('input', { type: 'email', name: 'email', required: '', placeholder: 'your@email.com', 'aria-label': 'Email address' }));
    form.appendChild(el('button', { type: 'submit' }, 'Sign up'));
    card.appendChild(form);
    return card;
  }

  /* ---- LISTEN ---- */
  function renderListen() {
    var navLink = document.querySelector('nav.main a[href="#listen"]');
    var m = /open\.spotify\.com\/(?:intl-[a-z]+\/)?artist\/([A-Za-z0-9]+)/.exec(DATA.spotify || '');
    navLink.style.display = m ? '' : 'none';
    if (!m) return;
    var mount = document.getElementById('spotify-mount');
    mount.innerHTML = '';
    mount.appendChild(el('iframe', {
      src: 'https://open.spotify.com/embed/artist/' + m[1] + '?utm_source=generator',
      title: 'Devin Cecchetto on Spotify',
      loading: 'lazy',
      allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
    }));
    var btns = document.getElementById('plat-btns');
    btns.innerHTML = '';
    (DATA.socials || []).forEach(function (s) {
      if (!s[1]) return;
      btns.appendChild(el('a', { href: s[1], target: '_blank', rel: 'noopener' }, esc(s[0])));
    });
    var news = document.getElementById('listen-news');
    news.innerHTML = '';
    var card = newsletterBlock();
    if (card) news.appendChild(card);
  }

  /* ---- PRESS KIT ---- */
  function renderEPK() {
    var k = DATA.epk || {};
    document.getElementById('epk-tagline').textContent = k.tagline || '';
    var acts = document.getElementById('epk-actions');
    acts.innerHTML = '';
    var links = [];
    if (DATA.reel) links.push(['Watch the demo reel', DATA.reel]);
    if (k.resumeUrl) links.push(['Résumé (PDF)', k.resumeUrl]);
    if (DATA.imdb) links.push(['IMDb', DATA.imdb]);
    if (DATA.vevo) links.push(['Vevo', DATA.vevo]);
    if (DATA.spotify) links.push(['Spotify', DATA.spotify]);
    links.forEach(function (l) {
      acts.appendChild(el('a', { href: l[1], target: '_blank', rel: 'noopener' }, esc(l[0])));
    });
    var facts = document.getElementById('epk-facts');
    facts.innerHTML = '';
    (k.facts || []).forEach(function (f) { facts.appendChild(el('li', null, esc(f))); });
    var ph = document.getElementById('epk-photos');
    ph.innerHTML = '';
    (k.photos || []).forEach(function (p) {
      var a = el('a', { href: p.img, download: '', target: '_blank' });
      a.appendChild(el('div', { 'class': 'im', style: "background-image:url('" + p.img + "')" }));
      a.appendChild(el('span', { 'class': 'lb' }, esc(p.label || 'Photo') + ' &darr;'));
      ph.appendChild(a);
    });
    var bios = document.getElementById('epk-bios');
    bios.innerHTML = '';
    [['Short bio', k.bioShort], ['Medium bio', k.bioMed], ['Long bio', k.bioLong]].forEach(function (b) {
      if (!b[1]) return;
      var box = el('div', { 'class': 'epk-bio' });
      var top = el('div', { 'class': 'top' });
      top.appendChild(el('h3', null, esc(b[0])));
      var btn = el('button', null, 'Copy');
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(b[1]).then(function () {
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
        });
      });
      top.appendChild(btn);
      box.appendChild(top);
      box.appendChild(el('p', null, esc(b[1])));
      bios.appendChild(box);
    });
    var em = document.getElementById('epk-email');
    em.textContent = DATA.email;
    em.href = 'mailto:' + DATA.email;
  }

  /* ---- ABOUT / CONTACT ---- */
  function renderRest() {
    document.getElementById('about-portrait').style.backgroundImage = "url('" + DATA.aboutPortrait + "')";
    document.getElementById('bio').textContent = DATA.bio;
    document.getElementById('contact-note').textContent = DATA.contactNote;
    var eb = document.getElementById('email-btn');
    eb.textContent = DATA.email;
    eb.href = 'mailto:' + DATA.email;
    var soc = document.getElementById('socials');
    soc.innerHTML = '';
    DATA.socials.forEach(function (s) {
      if (!s[1]) return;
      soc.appendChild(el('a', { href: s[1], target: '_blank', rel: 'noopener' }, esc(s[0])));
    });
    var vevo = document.getElementById('vevo-link');
    if (DATA.vevo) { vevo.href = DATA.vevo; vevo.parentElement.style.display = ''; }
    else vevo.parentElement.style.display = 'none';
    var cn = document.getElementById('contact-news');
    cn.innerHTML = '';
    var card = newsletterBlock();
    if (card) { card.style.animation = 'riseUp .9s ease .85s both'; cn.appendChild(card); }
  }

  /* ---- Router ---- */
  function pageFromHash() {
    var h = (location.hash || '').replace('#', '').trim();
    return PAGES.indexOf(h) > -1 ? h : 'home';
  }
  function nodeFor(p) {
    /* while the DESERT COLD teaser runs, "home" is the landing page;
       the photo-wall home stays archived in the DOM for later */
    if (p === 'home' && DATA.teaserLanding) return document.getElementById('p-landing');
    return document.getElementById('p-' + p);
  }
  function show(page) {
    document.getElementById('p-home').classList.remove('on');
    document.getElementById('p-landing').classList.remove('on');
    PAGES.forEach(function (p) {
      var node = nodeFor(p);
      var on = p === page;
      if (on && !node.classList.contains('on')) {
        node.classList.remove('on');
        void node.offsetWidth; /* restart entry animations */
        node.classList.add('on');
      } else if (!on) node.classList.remove('on');
    });
    document.querySelectorAll('nav.main a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + page);
    });
    if (page === 'home' && !DATA.teaserLanding) renderMontage(); /* replay montage zoom */
    /* arriving via the home Demo Reel button: start the reel (muted, per browser rules) */
    if (page === 'acting' && window.__playReel) {
      window.__playReel = false;
      var fr = document.getElementById('reel-iframe');
      if (fr) fr.src = fr.src + (fr.src.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1&muted=1';
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { if (DATA) show(pageFromHash()); });

  /* ---- Petal click effect (fires on nav clicks too, like the original design) ---- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('input, textarea, select, iframe')) return;
    var colors = ['#e8d5c8', '#d9c2b8', '#f0e3d4', '#cdb6a8'];
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('span');
      var a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 70, sz = 9 + Math.random() * 12;
      s.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:' + sz + 'px;height:' + (sz * 0.8) +
        'px;border-radius:62% 38% 55% 45%;pointer-events:none;z-index:9999;background:' + colors[i % 4] +
        ';--dx:' + (Math.cos(a) * r) + 'px;--dy:' + (Math.sin(a) * r - 50) + 'px;animation:petal ' + (0.9 + Math.random() * 0.5) + 's ease-out forwards';
      document.body.appendChild(s);
      (function (n) { setTimeout(function () { n.remove(); }, 1500); })(s);
    }
  });

  /* ---- Fun: the DESERT COLD red convertible (illustrated Buick, Devin driving) ----
     Real mouse: the cursor becomes the car and faces wherever you're heading.
     Everyone: the car drives across the screen every 5 seconds.
     Debug: ?car=none disables, ?car=drive / ?car=cursor forces one part. */
  (function funCar() {
    var CAR_URL = 'assets/car.png'; /* faces LEFT */
    var force = new URLSearchParams(location.search).get('car');
    if (force === 'none') return;
    var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* cursor: two prerendered PNGs (left / right), swapped by mouse direction */
    if ((fine || force === 'cursor') && force !== 'drive') {
      var img = new Image();
      img.onload = function () {
        function cursorCss(flip) {
          var w = 84, hgt = Math.max(1, Math.round(w * img.height / img.width));
          var c = document.createElement('canvas');
          c.width = w; c.height = hgt;
          var x = c.getContext('2d');
          if (flip) { x.translate(w, 0); x.scale(-1, 1); }
          x.drawImage(img, 0, 0, w, hgt);
          return '*{cursor:url(' + c.toDataURL('image/png') + ') ' + (w >> 1) + ' ' + Math.round(hgt * 0.55) + ', auto !important}';
        }
        var css = { left: cursorCss(false), right: cursorCss(true) };
        var style = document.createElement('style');
        document.head.appendChild(style);
        var facing = '';
        function face(dir) { if (facing !== dir) { facing = dir; style.textContent = css[dir]; } }
        face('left');
        var lastX = null, drift = 0;
        document.addEventListener('mousemove', function (e) {
          if (lastX !== null) {
            drift = drift * 0.7 + (e.clientX - lastX);
            if (drift > 6) face('right');
            else if (drift < -6) face('left');
          }
          lastX = e.clientX;
        }, { passive: true });
      };
      img.src = CAR_URL;
    }

    /* drive-by: every 5 seconds, alternating direction */
    if (force !== 'cursor') {
      var el = document.createElement('div');
      el.id = 'drive-car';
      el.setAttribute('aria-hidden', 'true');
      /* wheel hubs are circular crops of the same image, layered exactly over
         the painted wheels so they can spin while the body bobs */
      el.innerHTML = '<div class="flip">' +
        '<div class="shadow"></div>' +
        '<div class="body">' +
        '<img src="' + CAR_URL + '" alt="">' +
        '<div class="wheel" style="left:16.21%;top:73.67%;background-position:12.58% 83.86%"></div>' +
        '<div class="wheel rear" style="left:73.21%;top:73.67%;background-position:75.71% 83.86%"></div>' +
        '</div></div>';
      document.body.appendChild(el);
      var dir = -1; /* first pass drives left->right feels natural reading-wise */
      setInterval(function () {
        el.classList.remove('drive-right', 'drive-left');
        void el.offsetWidth;
        el.classList.add(dir > 0 ? 'drive-left' : 'drive-right');
        dir = -dir;
      }, 5000);
    }
  })();

  /* ---- TEASER LANDING + canyon mini-game ---- */
  function renderLanding() {
    var bg = DATA.landingBg || (DATA.projects[1] && DATA.projects[1].img) || (DATA.projects[0] && DATA.projects[0].img) || DATA.montage[0];
    document.getElementById('landing-bg').style.backgroundImage = "url('" + bg + "')";
    document.getElementById('btn-peek').addEventListener('click', openCanyonGame);
  }

  var gameOpen = false;
  function openCanyonGame() {
    if (gameOpen) return;
    gameOpen = true;
    var modal = el('div', { 'class': 'game-modal' });
    modal.innerHTML =
      '<div class="game-top"><h2>The road to Desert Cold</h2>' +
      '<span class="hint-t">Drag the car &middot; stay on the road</span>' +
      '<button id="game-close">Close</button></div>' +
      '<div class="game-wrap" id="game-wrap"><canvas id="game-canvas"></canvas><div class="game-toast" id="game-toast"></div></div>';
    document.body.appendChild(modal);

    var wrap = document.getElementById('game-wrap');
    var canvas = document.getElementById('game-canvas');
    var toastEl = document.getElementById('game-toast');
    var ctx = canvas.getContext('2d');
    var carImg = new Image();
    carImg.src = 'assets/car.png';

    /* winding canyon road, climbing left to right (normalized control points) */
    var CTRL = [[0.06, 0.88], [0.13, 0.84], [0.2, 0.58], [0.31, 0.82], [0.43, 0.5],
                [0.54, 0.76], [0.66, 0.4], [0.77, 0.62], [0.87, 0.3], [0.94, 0.13]];
    var path = [], rocks = [], roadHalf = 40, W = 0, H = 0, dpr = 1;
    var progress = 0, dragging = false, started = false, won = false, raf = 0;

    function catmull(p0, p1, p2, p3, t) {
      var t2 = t * t, t3 = t2 * t;
      return [
        0.5 * (2*p1[0] + (p2[0]-p0[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (3*p1[0]-p0[0]-3*p2[0]+p3[0])*t3),
        0.5 * (2*p1[1] + (p2[1]-p0[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (3*p1[1]-p0[1]-3*p2[1]+p3[1])*t3)
      ];
    }
    function rebuild() {
      W = wrap.clientWidth; H = wrap.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      roadHalf = Math.max(30, Math.min(56, Math.min(W, H) * 0.075));
      path = [];
      var pts = CTRL.map(function (c) { return [c[0] * W, c[1] * H]; });
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1, i+2)];
        for (var t = 0; t < 1; t += 0.02) path.push(catmull(p0, p1, p2, p3, t));
      }
      path.push(pts[pts.length-1]);
      /* scatter canyon rocks + cacti away from the road (deterministic) */
      rocks = [];
      var seed = 42;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var r = 0; r < 90; r++) {
        var x = rnd() * W, y = rnd() * H, ok = true;
        for (var k = 0; k < path.length; k += 6) {
          var dx = x - path[k][0], dy = y - path[k][1];
          if (dx*dx + dy*dy < Math.pow(roadHalf * 2.1, 2)) { ok = false; break; }
        }
        if (ok) rocks.push([x, y, 3 + rnd() * 14, rnd()]);
      }
    }
    function nearestIdx(p, from, to) {
      var best = from, bd = Infinity;
      for (var i = Math.max(0, from); i <= Math.min(path.length - 1, to); i++) {
        var dx = p[0] - path[i][0], dy = p[1] - path[i][1], d = dx*dx + dy*dy;
        if (d < bd) { bd = d; best = i; }
      }
      return [best, Math.sqrt(bd)];
    }
    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('on');
      clearTimeout(toastEl._t);
      toastEl._t = setTimeout(function () { toastEl.classList.remove('on'); }, 1600);
    }
    function draw() {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#e6c193'); g.addColorStop(1, '#d3a06c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      rocks.forEach(function (r) {
        if (r[3] > 0.82) { /* cactus */
          ctx.fillStyle = 'rgba(106,124,80,.75)';
          ctx.fillRect(r[0] - 1.5, r[1] - r[2] * 0.7, 3, r[2] * 0.9);
          ctx.fillRect(r[0] - r[2] * 0.32, r[1] - r[2] * 0.4, r[2] * 0.3, 2.4);
        } else {
          ctx.fillStyle = r[3] > 0.4 ? 'rgba(178,120,74,.45)' : 'rgba(140,90,55,.38)';
          ctx.beginPath();
          ctx.ellipse(r[0], r[1], r[2], r[2] * 0.62, r[3] * 3, 0, 7);
          ctx.fill();
        }
      });
      function strokePath(width, color, dash) {
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (var i = 1; i < path.length; i++) ctx.lineTo(path[i][0], path[i][1]);
        ctx.lineWidth = width; ctx.strokeStyle = color;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.setLineDash(dash || []);
        ctx.stroke(); ctx.setLineDash([]);
      }
      strokePath(roadHalf * 2 + 7, '#8a6f5f');
      strokePath(roadHalf * 2, '#3d332c');
      strokePath(2, 'rgba(232,213,200,.85)', [13, 15]);
      /* start + finish markers */
      ctx.font = '600 11px Karla, sans-serif';
      ctx.textAlign = 'center';
      var s = path[0], f = path[path.length - 1];
      ctx.fillStyle = 'rgba(247,242,236,.92)';
      ctx.beginPath(); ctx.arc(f[0], f[1], roadHalf * 0.55, 0, 7); ctx.fill();
      ctx.fillStyle = '#4a3c32';
      ctx.fillText('END', f[0], f[1] + 3.5);
      ctx.fillStyle = '#4a3c32';
      ctx.fillText('START', s[0], s[1] - roadHalf - 10);
      /* car */
      var idx = Math.round(progress), p = path[idx];
      var p2 = path[Math.min(path.length - 1, idx + 4)];
      var ang = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
      var len = roadHalf * 2.9, hgt = len * 226 / 700;
      ctx.save();
      ctx.translate(p[0], p[1]);
      /* side-view artwork faces left: mirror when heading rightward so
         the car never appears upside down */
      if (Math.cos(ang) > 0) { ctx.rotate(ang); ctx.scale(-1, 1); }
      else { ctx.rotate(ang - Math.PI); }
      if (carImg.complete) ctx.drawImage(carImg, -len / 2, -hgt / 2, len, hgt);
      ctx.restore();
      if (!started && !won) { /* pulsing grab hint */
        var pulse = 1 + Math.sin(Date.now() / 300) * 0.12;
        ctx.strokeStyle = 'rgba(247,242,236,.8)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p[0], p[1], roadHalf * 1.5 * pulse, 0, 7); ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    }
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    canvas.addEventListener('pointerdown', function (e) {
      var p = pos(e), car = path[Math.round(progress)];
      var dx = p[0] - car[0], dy = p[1] - car[1];
      if (Math.sqrt(dx*dx + dy*dy) < roadHalf * 2.4) {
        dragging = true; started = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging || won) return;
      var p = pos(e);
      var cur = Math.round(progress);
      var res = nearestIdx(p, cur - 30, cur + 26);
      if (res[1] > roadHalf * 1.3) {
        dragging = false;
        progress = 0; started = false;
        wrap.classList.add('shake');
        setTimeout(function () { wrap.classList.remove('shake'); }, 380);
        toast('Off the road — back to the start!');
        return;
      }
      progress = res[0];
      if (progress >= path.length - 5) {
        won = true; dragging = false;
        toast('You made it ✦');
        setTimeout(function () { location.href = 'desertcold.html'; }, 700);
      }
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      canvas.addEventListener(ev, function () { dragging = false; });
    });
    window.addEventListener('resize', onResize);
    function onResize() { var frac = progress / path.length; rebuild(); progress = Math.round(frac * path.length); }
    document.getElementById('game-close').addEventListener('click', function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      modal.remove();
      gameOpen = false;
    });
    rebuild();
    draw();
  }

  /* ---- Init: load content (draft preview from admin panel wins) ---- */
  function boot(content) {
    DATA = content;
    renderLanding();
    renderVideos();
    renderListen();
    renderActing();
    renderPress();
    renderNews();
    renderTimeline();
    renderEPK();
    renderRest();
    show(pageFromHash());
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.cta-reel-btn')) window.__playReel = true;
  });

  var draft = null;
  if (new URLSearchParams(location.search).has('preview')) {
    try { draft = JSON.parse(localStorage.getItem('dc-draft-preview')); } catch (e) {}
    if (draft) {
      var banner = el('div', { style: 'position:fixed;bottom:14px;left:14px;z-index:80;padding:8px 16px;border-radius:999px;background:#4a3c32;color:#f7f2ec;font-size:11px;letter-spacing:.18em;text-transform:uppercase;box-shadow:0 10px 26px rgba(74,60,50,.3)' }, 'Draft preview — not published');
      document.body.appendChild(banner);
    }
  }
  if (draft) boot(draft);
  else fetch('content.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(boot);
})();
