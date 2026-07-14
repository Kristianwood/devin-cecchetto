/* Devin Cecchetto — portfolio site */
(function () {
  'use strict';

  var DATA = {
    vevo: 'https://www.youtube.com/@DevinCecchettoVEVO',
    imdb: 'https://www.imdb.com/name/nm9816160/',
    projects: [
      {
        title: 'New Single — Video One',
        youtube: '',
        released: false,
        img: 'assets/home-04.jpg',
        desc: 'Devin’s next single, shot in a sun-soaked mid-century house above Los Angeles. Full video and story premiere soon.'
      },
      {
        title: 'New Single — Video Two',
        youtube: '',
        released: false,
        img: 'assets/road-14.jpg',
        desc: 'A top-down drive through the canyons at golden hour. Full video and story premiere soon.'
      }
    ],
    /* Released videos — [title, YouTube ID, caption]; first entry is featured */
    releases: [
      ['Super Sonic Girl', 'odZ8sekou60', '2025 · Official Music Video · Vevo'],
      ['Ships in the Night', 'cwEaXO7ndes', '2025 · Official Music Video'],
      ['So Obvious', 'IvfGw3QONY0', '2025 · Official Music Video'],
      ['Fantasy', '2pg2z2ca8is', '2024 · Official Music Video'],
      ['OFF MY MIND!', 'wQkJ5TQ6b28', '2024 · Official Music Video'],
      ['Phase', 'nwg8OAoz4Tc', '2023 · Official Music Video'],
      ['A Christmas Special You Didn’t Know You Needed', 'Vgfmsqeo208', '2025 · Holiday Special']
    ],
    credits: [
      ['The Way Home', 'Evelyn Goodwin — Hallmark Channel, 2025–2026'],
      ['Wayward', 'Jess — Netflix, 2025'],
      ['Ginny & Georgia', 'Netflix, 2021'],
      ['The Craft: Legacy', 'Columbia Pictures, 2020'],
      ['Bad Influence', 'Lily Miller — TV movie, 2021'],
      ['The Parker Andersons / Amelia Parker', 'Victoria Anderson — 2021'],
      ['Don’t Sell My Baby', 'Nicolette (lead) — Lifetime, 2023'],
      ['Who Killed Our Father?', 'Violet — Lifetime, 2022'],
      ['Marry F*** Kill', 'Beth — Lifetime, 2023']
    ],
    press: [
      ['Naluda Magazine', 'Interview with actress and singer Devin Cecchetto', 'https://www.naludamagazine.com/interview-with-actress-and-singer-devin-cecchetto/'],
      ['Drive Music Media', 'From a personal story to a summer track', 'https://drivemusicmedia.co.uk/ships-in-the-night-and-so-obvious-devin-cecchetto-from-a-personal-story-to-a-summer-track-03-08-2025/'],
      ['Drive Music Media', 'I’m so honored to be part of The Way Home — its story is truly healing', 'https://drivemusicmedia.co.uk/devin-cecchetto-i-m-so-honored-to-be-part-of-the-way-home-as-its-roots-are-deep-and-its-story-is-truly-healing-30-03-2025/'],
      ['Fangirlish', 'The Way Home cast on what they would tell their younger selves', 'https://fangirlish.com/2026/06/24/julia-tomasone-jordan-doww-devin-cecchetto-kelsey-falconer-talk-about-what-they-would-tell-their-younger-selves-about-the-way-home/'],
      ['Stay2uned', 'Behind the scenes with Devin Cecchetto — exploring The Way Home', 'https://stay2uned.com/2025/02/06/behind-the-scenes-with-devin-cecchetto-exploring-the-way-home-a-stay2uned-exclusive-interview/']
    ],
    bio: 'Devin Cecchetto is a singer-songwriter and actress from Toronto, moving between Canada and Los Angeles.\n\nShe began singing in operas at age six, trained in musical theatre, and grew up on stages in Toronto’s east end. On screen she is known for The Way Home (Hallmark), Wayward and Ginny & Georgia (Netflix), and a string of leading roles in Lifetime features.\n\nHer own music — dreamy, cinematic pop — brings both halves of her life together, from “Ships in the Night” and “So Obvious” to “Super Sonic Girl” and a Christmas special of her very own.',
    email: 'hello@devincecchetto.com',
    contactNote: 'For bookings, press, casting and collaborations — or just to say hi.',
    socials: [
      ['YouTube', 'https://www.youtube.com/@Devin_cecchetto'],
      ['Vevo', 'https://www.youtube.com/@DevinCecchettoVEVO'],
      ['Instagram', 'https://www.instagram.com/devin_cecchetto/'],
      ['TikTok', 'https://www.tiktok.com/@devin_cecchetto'],
      ['Spotify', 'https://open.spotify.com/artist/2Rt3h2vXiM9AIDkJ0agHEp'],
      ['Apple Music', 'https://music.apple.com/us/artist/devin-cecchetto/1665352801']
    ],
    montage: [
      'assets/home-03.jpg', 'assets/road-06.jpg', 'assets/home-13.jpg', 'assets/road-08.jpg',
      'assets/home-05.jpg', 'assets/road-05.jpg', 'assets/home-12.jpg', 'assets/road-01.jpg',
      'assets/road-15.jpg', 'assets/home-18.jpg', 'assets/road-04.jpg', 'assets/home-09.jpg'
    ],
    actingHero: 'assets/press.jpg',
    aboutPortrait: 'assets/home-06.jpg'
  };

  var PAGES = ['home', 'videos', 'acting', 'press', 'about', 'contact'];
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
    return m ? m[1] : '';
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
    var head = el('div', { style: 'padding:40px 24px 10px;text-align:center' });
    head.appendChild(el('p', { 'class': 'kicker', style: 'animation:none' }, 'From the catalogue'));
    head.appendChild(el('h1', { 'class': 'title', style: 'animation:none;font-size:clamp(34px,4.5vw,60px)' }, 'Released'));
    list.appendChild(head);
    var grid = el('div', { 'class': 'mv-grid' });
    DATA.releases.forEach(function (r, i) {
      var card = el('div', { 'class': 'mv-card reveal' + (i === 0 ? ' featured' : '') });
      var frame = el('div', { 'class': 'frame' });
      frame.appendChild(el('iframe', {
        src: 'https://www.youtube-nocookie.com/embed/' + r[1],
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

  /* ---- ACTING ---- */
  function renderActing() {
    document.getElementById('acting-hero').style.backgroundImage = "url('" + DATA.actingHero + "')";
    var wrap = document.getElementById('credits');
    wrap.innerHTML = '';
    DATA.credits.forEach(function (c, i) {
      var d = el('div', { 'class': 'credit' });
      d.style.animationDelay = (0.45 + i * 0.09).toFixed(2) + 's';
      d.appendChild(el('h3', null, esc(c[0])));
      d.appendChild(el('p', null, esc(c[1])));
      wrap.appendChild(d);
    });
    var imdb = document.getElementById('imdb-link');
    if (DATA.imdb) imdb.href = DATA.imdb; else imdb.parentElement.style.display = 'none';
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
    if (DATA.vevo) vevo.href = DATA.vevo; else vevo.parentElement.style.display = 'none';
  }

  /* ---- Router ---- */
  function pageFromHash() {
    var h = (location.hash || '').replace('#', '').trim();
    return PAGES.indexOf(h) > -1 ? h : 'home';
  }
  function show(page) {
    PAGES.forEach(function (p) {
      var node = document.getElementById('p-' + p);
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
    if (page === 'home') renderMontage(); /* replay montage zoom */
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { show(pageFromHash()); });

  /* ---- Petal click effect ---- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('input, textarea, select, iframe, a, button')) return;
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

  /* ---- Init ---- */
  renderVideos();
  renderActing();
  renderPress();
  renderRest();
  show(pageFromHash());
})();
