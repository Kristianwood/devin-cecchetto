/* Devin Cecchetto — admin panel
   Edits content.json + assets/ in the GitHub repo via the GitHub API.
   Publishing commits to main; GitHub Pages redeploys automatically. */
(function () {
  'use strict';

  var OWNER = 'Kristianwood', REPO = 'devin-cecchetto', BRANCH = 'main';
  var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO;
  var RAW = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + BRANCH + '/';
  var TOKEN_KEY = 'dc-admin-token';

  var token = localStorage.getItem(TOKEN_KEY) || '';
  var content = null;           // working copy of content.json
  var canPush = false;          // token verified to have write access
  var library = [];             // [{path, sha}] photos in assets/ (repo)
  var uploads = {};             // path -> {b64, dataUrl} pending new photos
  var publishedThumbs = {};     // path -> dataUrl for photos published this session (CDN may lag)
  var deletes = {};             // path -> true pending photo deletions
  var dirty = false;

  /* ---------- tiny DOM helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function h(tag, props, kids) {
    var e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === 'onclick') e.addEventListener('click', props[k]);
      else if (k === 'oninput') e.addEventListener('input', props[k]);
      else if (k === 'onchange') e.addEventListener('change', props[k]);
      else if (k === 'style') e.style.cssText = props[k];
      else if (k === 'text') e.textContent = props[k];
      else if (k === 'checked') e.checked = props[k];
      else if (k === 'value') e.value = props[k];
      else e.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function field(labelText, inputEl) {
    var w = document.createDocumentFragment();
    var l = document.createElement('label'); l.textContent = labelText;
    w.appendChild(l); w.appendChild(inputEl);
    return w;
  }
  function status(msg, isErr) {
    var s = $('status'); s.textContent = msg || '';
    s.style.color = isErr ? '#8a4a3c' : '';
  }
  function log(msg) {
    var el = $('log'); el.style.display = 'block';
    el.textContent += msg + '\n'; el.scrollTop = el.scrollHeight;
  }
  function markDirty() { dirty = true; status('Unpublished changes'); }
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- GitHub API ---------- */
  function gh(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }, opts.headers || {});
    return fetch(API + path, opts).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) {
        throw new Error(r.status + ' ' + (j.message || r.statusText));
      });
      return r.status === 204 ? null : r.json();
    });
  }
  function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64DecodeUnicode(b64) {
    return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
  }

  /* ---------- photo URL resolution (pending uploads use data URLs) ---------- */
  function photoUrl(path) {
    if (uploads[path]) return uploads[path].dataUrl;
    if (publishedThumbs[path]) return publishedThumbs[path];
    return RAW + encodeURI(path);
  }

  /* ---------- login ---------- */
  function boot() {
    if (!token) { $('login').style.display = 'block'; return; }
    $('login').style.display = 'none';
    status('Loading…');
    Promise.all([
      gh(''),
      gh('/contents/content.json?ref=' + BRANCH),
      gh('/contents/assets?ref=' + BRANCH)
    ]).then(function (res) {
      canPush = !!(res[0].permissions && res[0].permissions.push);
      if (!canPush) {
        throw new Error('NO_WRITE');
      }
      content = JSON.parse(b64DecodeUnicode(res[1].content));
      library = res[2].filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f.name); })
        .map(function (f) { return { path: 'assets/' + f.name, sha: f.sha }; });
      $('panel').style.display = 'block';
      renderAll();
      status('Loaded — no unpublished changes');
    }).catch(function (e) {
      $('login').style.display = 'block';
      $('panel').style.display = 'none';
      $('login-err').innerHTML = e.message === 'NO_WRITE'
        ? 'This token can <b>read</b> the site but not <b>publish</b> to it. Usually one of these:<br>' +
          '&bull; the token’s <b>Contents</b> permission was left on “Read-only” — re-create it with <b>Read and write</b>;<br>' +
          '&bull; a fine-grained token was created on an account that doesn’t <b>own</b> the site — if you were added as a collaborator, use a <b>classic token</b> instead (see step 2 above);<br>' +
          '&bull; the account hasn’t been added as a collaborator on the repository yet.'
        : 'Could not load the site with this token (' + e.message + '). Check the token and try again.';
    });
  }
  $('token-save').addEventListener('click', function () {
    token = $('token-input').value.trim();
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    boot();
  });
  $('btn-logout').addEventListener('click', function () {
    localStorage.removeItem(TOKEN_KEY);
    location.reload();
  });

  /* ---------- generic list editor ---------- */
  function listEditor(mountId, arr, fields, onAdd) {
    var mount = $(mountId);
    function redraw() {
      mount.innerHTML = '';
      arr.forEach(function (item, i) {
        var box = h('div', { 'class': 'item' });
        fields(box, item, i);
        var bar = h('div', { 'class': 'bar' }, [
          h('button', { 'class': 'small', text: '↑', onclick: function () { if (i > 0) { arr.splice(i, 1); arr.splice(i - 1, 0, item); markDirty(); redraw(); } } }),
          h('button', { 'class': 'small', text: '↓', onclick: function () { if (i < arr.length - 1) { arr.splice(i, 1); arr.splice(i + 1, 0, item); markDirty(); redraw(); } } }),
          h('button', { 'class': 'small danger', text: 'Remove', onclick: function () { if (confirm('Remove this entry?')) { arr.splice(i, 1); markDirty(); redraw(); } } })
        ]);
        box.appendChild(bar);
        mount.appendChild(box);
      });
    }
    redraw();
    return redraw;
  }
  function textInput(item, key, opts) {
    return h('input', Object.assign({
      type: 'text', value: item[key] || '',
      oninput: function (e) { item[key] = e.target.value; markDirty(); }
    }, opts || {}));
  }
  function arrInput(item, idx, opts) {
    return h('input', Object.assign({
      type: 'text', value: item[idx] || '',
      oninput: function (e) { item[idx] = e.target.value; markDirty(); }
    }, opts || {}));
  }

  /* ---------- section renderers ---------- */
  var redrawProjects, redrawReleases, redrawPosts, redrawCredits, redrawPress, redrawSocials;

  var rearranging = false;
  function renderMontageGrid() {
    var g = $('montage-grid');
    g.innerHTML = '';
    g.classList.toggle('rearranging', rearranging);
    content.montage.forEach(function (src, i) {
      var tile = h('div', { 'class': 'mont', 'data-idx': i }, [
        h('div', { 'class': 'im', style: 'background-image:url(' + JSON.stringify(photoUrl(src)) + ')', title: rearranging ? 'Drag onto another tile to swap' : 'Click to change the photo' }),
        h('span', { 'class': 'tag', text: i === 5 ? '6 · zoom focus' : String(i + 1) })
      ]);
      if (rearranging) attachTileDrag(tile, i);
      else tile.querySelector('.im').addEventListener('click', function () {
        pickPhoto('tile', function (p) { content.montage[i] = p; markDirty(); renderMontageGrid(); });
      });
      g.appendChild(tile);
    });
  }
  $('btn-rearrange').addEventListener('click', function () {
    if (!content) return;
    rearranging = !rearranging;
    this.textContent = rearranging ? 'Done' : 'Rearrange';
    this.classList.toggle('on', rearranging);
    $('wall-hint').innerHTML = rearranging
      ? '<b>Drag any tile onto another to swap the two photos.</b> Press <b>Done</b> when you like the layout, then Publish.'
      : 'Twelve tiles. Tile 6 is the one the opening zoom lands on — use a strong close-up there. Click a tile to change its photo, or press <b>Rearrange</b> to drag tiles around.';
    renderMontageGrid();
  });

  /* rearrange mode: drag a tile onto another to swap the two photos */
  function attachTileDrag(tile, i) {
    var im = tile.querySelector('.im');
    im.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      e.preventDefault();
      var startX = e.clientX, startY = e.clientY;
      var ghost = null, target = null;

      function findTile(x, y) {
        var el = document.elementFromPoint(x, y);
        var t = el && el.closest ? el.closest('.mont') : null;
        return (t && t !== tile && t.parentElement === tile.parentElement) ? t : null;
      }
      function onMove(ev) {
        if (!ghost) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4) return;
          ghost = tile.cloneNode(true);
          ghost.className = 'mont ghost';
          ghost.style.width = tile.offsetWidth + 'px';
          document.body.appendChild(ghost);
          tile.classList.add('dragging');
        }
        ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px';
        ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px';
        var t = findTile(ev.clientX, ev.clientY);
        if (target && target !== t) target.classList.remove('drop-target');
        target = t;
        if (target) target.classList.add('drop-target');
        ev.preventDefault();
      }
      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (ghost) ghost.remove();
        tile.classList.remove('dragging');
        if (target) {
          target.classList.remove('drop-target');
          var j = Number(target.getAttribute('data-idx'));
          var tmp = content.montage[i];
          content.montage[i] = content.montage[j];
          content.montage[j] = tmp;
          markDirty();
          renderMontageGrid();
        }
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  }

  function slotThumb(id, key, aspect) {
    var t = $(id);
    t.style.backgroundImage = 'url(' + JSON.stringify(photoUrl(content[key])) + ')';
    t.onclick = function () { pickPhoto(aspect, function (p) { content[key] = p; markDirty(); slotThumb(id, key, aspect); }); };
  }

  function renderAll() {
    renderMontageGrid();
    slotThumb('acting-hero-thumb', 'actingHero', 'xwide');
    slotThumb('about-portrait-thumb', 'aboutPortrait', 'portrait');
    document.querySelectorAll('button[data-slot]').forEach(function (b) {
      var key = b.getAttribute('data-slot');
      b.onclick = function () {
        var aspect = key === 'aboutPortrait' ? 'portrait' : 'xwide';
        pickPhoto(aspect, function (p) {
          content[key] = p; markDirty();
          slotThumb(key === 'aboutPortrait' ? 'about-portrait-thumb' : 'acting-hero-thumb', key, aspect);
        });
      };
    });

    redrawProjects = listEditor('projects', content.projects, function (box, p) {
      box.appendChild(field('Title', textInput(p, 'title')));
      box.appendChild(field('YouTube link (leave empty until it premieres)', textInput(p, 'youtube', { placeholder: 'https://youtu.be/…' })));
      box.appendChild(field('Description', h('textarea', { rows: 3, value: p.desc || '', oninput: function (e) { p.desc = e.target.value; markDirty(); } })));
      var thumb = h('div', { 'class': 'thumb', style: 'background-image:url(' + JSON.stringify(photoUrl(p.img)) + ')' });
      box.appendChild(h('div', { 'class': 'slot', style: 'margin-top:12px' }, [
        thumb,
        h('span', { 'class': 'name', text: 'Backdrop photo' }),
        h('button', { 'class': 'small', text: 'Change', onclick: function () { pickPhoto('wide', function (path) { p.img = path; markDirty(); thumb.style.backgroundImage = 'url(' + JSON.stringify(photoUrl(path)) + ')'; }); } })
      ]));
      var cb = h('input', { type: 'checkbox', onchange: function (e) { p.released = e.target.checked; markDirty(); } });
      cb.checked = !!p.released;
      box.appendChild(h('label', { 'class': 'checkline' }, [cb, h('span', { text: 'Released (unchecked shows the “Coming soon” ribbon)' })]));
    });
    $('add-project').onclick = function () {
      content.projects.push({ title: 'New video', youtube: '', released: false, img: content.montage[0], desc: '' });
      markDirty(); redrawProjects();
    };

    redrawReleases = listEditor('releases', content.releases, function (box, r) {
      box.appendChild(field('Song title', arrInput(r, 0)));
      box.appendChild(field('YouTube link or video ID', arrInput(r, 1, { placeholder: 'https://youtu.be/… or the 11-character ID' })));
      box.appendChild(field('Caption (year · type)', arrInput(r, 2, { placeholder: '2026 · Official Music Video' })));
    });
    $('add-release').onclick = function () { content.releases.push(['', '', '']); markDirty(); redrawReleases(); };

    redrawPosts = listEditor('posts', content.posts, function (box, p) {
      box.appendChild(field('Date', h('input', { type: 'date', value: p.date || '', onchange: function (e) { p.date = e.target.value; markDirty(); } })));
      box.appendChild(field('Title', textInput(p, 'title')));
      box.appendChild(field('Text', h('textarea', { rows: 4, value: p.body || '', oninput: function (e) { p.body = e.target.value; markDirty(); } })));
      var thumb = h('div', { 'class': 'thumb', style: 'background-image:url(' + JSON.stringify(p.img ? photoUrl(p.img) : '') + ')' });
      box.appendChild(h('div', { 'class': 'slot', style: 'margin-top:12px' }, [
        thumb,
        h('span', { 'class': 'name', text: p.img ? 'Photo' : 'No photo (optional)' }),
        h('button', { 'class': 'small', text: 'Change', onclick: function () { pickPhoto('wide', function (path) { p.img = path; markDirty(); thumb.style.backgroundImage = 'url(' + JSON.stringify(photoUrl(path)) + ')'; }); } }),
        h('button', { 'class': 'small', text: 'None', onclick: function () { p.img = ''; markDirty(); thumb.style.backgroundImage = ''; } })
      ]));
      box.appendChild(field('YouTube link (optional, embeds a player)', textInput(p, 'youtube', { placeholder: 'https://youtu.be/…' })));
      box.appendChild(field('External link (optional, adds “Read more”)', textInput(p, 'link', { placeholder: 'https://…' })));
    });
    $('add-post').onclick = function () {
      var today = new Date().toISOString().slice(0, 10);
      content.posts.unshift({ date: today, title: '', body: '', img: '', youtube: '', link: '' });
      markDirty(); redrawPosts();
    };

    if (!content.timeline) content.timeline = [];
    var redrawTimeline = listEditor('timeline-ed', content.timeline, function (box, t) {
      box.appendChild(field('Year', textInput(t, 'year', { placeholder: '2026' })));
      box.appendChild(field('Title', textInput(t, 'title')));
      box.appendChild(field('Text', h('textarea', { rows: 3, value: t.text || '', oninput: function (e) { t.text = e.target.value; markDirty(); } })));
      var thumb = h('div', { 'class': 'thumb', style: 'background-image:url(' + JSON.stringify(t.img ? photoUrl(t.img) : '') + ')' });
      box.appendChild(h('div', { 'class': 'slot', style: 'margin-top:12px' }, [
        thumb,
        h('span', { 'class': 'name', text: t.img ? 'Photo' : 'No photo (optional)' }),
        h('button', { 'class': 'small', text: 'Change', onclick: function () { pickPhoto('wide', function (path) { t.img = path; markDirty(); thumb.style.backgroundImage = 'url(' + JSON.stringify(photoUrl(path)) + ')'; }); } }),
        h('button', { 'class': 'small', text: 'None', onclick: function () { t.img = ''; markDirty(); thumb.style.backgroundImage = ''; } })
      ]));
      box.appendChild(field('Photo caption (e.g. the production it is from)', textInput(t, 'cap', { placeholder: 'In The Way Home (2023)' })));
    });
    $('add-timeline').onclick = function () {
      content.timeline.push({ year: '', title: '', text: '', img: '', cap: '' });
      markDirty(); redrawTimeline();
    };

    redrawCredits = listEditor('credits', content.credits, function (box, c) {
      box.appendChild(field('Title', arrInput(c, 0)));
      box.appendChild(field('Role / network / year', arrInput(c, 1)));
      box.appendChild(field('IMDb page of the show/movie (optional — makes the card clickable)', arrInput(c, 2, { type: 'url', placeholder: 'https://www.imdb.com/title/tt…' })));
    });
    $('add-credit').onclick = function () { content.credits.push(['', '', '']); markDirty(); redrawCredits(); };

    redrawPress = listEditor('press', content.press, function (box, q) {
      box.appendChild(field('Outlet', arrInput(q, 0)));
      box.appendChild(field('Headline / quote', arrInput(q, 1)));
      box.appendChild(field('Link', arrInput(q, 2, { type: 'url' })));
    });
    $('add-press').onclick = function () { content.press.push(['', '', '']); markDirty(); redrawPress(); };

    redrawSocials = listEditor('socials', content.socials, function (box, s) {
      box.appendChild(field('Label', arrInput(s, 0)));
      box.appendChild(field('Link', arrInput(s, 1, { type: 'url' })));
    });
    $('add-social').onclick = function () { content.socials.push(['', '']); markDirty(); redrawSocials(); };

    $('f-imdb').value = content.imdb || '';
    $('f-imdb').oninput = function (e) { content.imdb = e.target.value; markDirty(); };
    $('f-reel').value = content.reel || '';
    $('f-reel').oninput = function (e) { content.reel = e.target.value; markDirty(); };
    $('f-bio').value = content.bio || '';
    $('f-bio').oninput = function (e) { content.bio = e.target.value; markDirty(); };
    $('f-email').value = content.email || '';
    $('f-email').oninput = function (e) { content.email = e.target.value; markDirty(); };
    $('f-note').value = content.contactNote || '';
    $('f-note').oninput = function (e) { content.contactNote = e.target.value; markDirty(); };
    $('f-vevo').value = content.vevo || '';
    $('f-vevo').oninput = function (e) { content.vevo = e.target.value; markDirty(); };
  }

  /* ---------- photo picker ---------- */
  var pickCallback = null, pickAspect = 'free';
  function usedPaths() {
    var used = {};
    content.montage.forEach(function (p) { used[p] = 1; });
    [content.actingHero, content.aboutPortrait].forEach(function (p) { used[p] = 1; });
    content.projects.forEach(function (p) { used[p.img] = 1; });
    content.posts.forEach(function (p) { if (p.img) used[p.img] = 1; });
    return used;
  }
  function pickPhoto(aspect, cb) {
    pickCallback = cb; pickAspect = aspect;
    renderLibrary();
    $('lib-modal').style.display = 'flex';
  }
  function renderLibrary() {
    var g = $('lib-grid'); g.innerHTML = '';
    var used = usedPaths();
    var all = Object.keys(uploads).map(function (p) { return { path: p, pending: true }; }).concat(library.filter(function (f) { return !deletes[f.path]; }));
    all.forEach(function (f) {
      var ph = h('div', { 'class': 'ph' }, [
        h('div', { 'class': 'im', style: 'background-image:url(' + JSON.stringify(photoUrl(f.path)) + ')' }),
        h('div', { 'class': 'nm', text: f.path.replace('assets/', '') }),
        f.pending ? h('span', { 'class': 'badge', text: 'new' }) : null
      ]);
      ph.addEventListener('click', function () {
        openCropper(photoUrl(f.path), f.path);
      });
      if (!used[f.path] && !f.pending) {
        var del = h('span', { 'class': 'badge', style: 'top:auto;bottom:22px;right:4px;background:#8a4a3c;cursor:pointer', text: '✕ delete', title: 'Delete this unused photo from the site' });
        del.addEventListener('click', function (e) {
          e.stopPropagation();
          if (confirm('Delete ' + f.path + ' from the site? (It is not used anywhere right now.)')) {
            deletes[f.path] = true; markDirty(); renderLibrary();
          }
        });
        ph.appendChild(del);
      }
      g.appendChild(ph);
    });
  }
  $('lib-close').addEventListener('click', function () { $('lib-modal').style.display = 'none'; pickCallback = null; });

  /* upload via drop zone / click */
  var drop = $('drop');
  drop.addEventListener('click', function () {
    var inp = h('input', { type: 'file', accept: 'image/*' });
    inp.addEventListener('change', function () { if (inp.files[0]) readUpload(inp.files[0]); });
    inp.click();
  });
  ['dragover', 'dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.toggle('over', ev === 'dragover');
      if (ev === 'drop' && e.dataTransfer.files[0]) readUpload(e.dataTransfer.files[0]);
    });
  });
  function readUpload(file) {
    var rd = new FileReader();
    rd.onload = function () { openCropper(rd.result, null); };
    rd.readAsDataURL(file);
  }

  /* ---------- cropper ---------- */
  var ASPECTS = { wide: 16 / 9, xwide: 16 / 7, tile: 4 / 3, portrait: 4 / 5, square: 1, free: 0 };
  var ASPECT_LABELS = { wide: 'Wide 16:9', xwide: 'Extra wide 16:7', tile: 'Tile 4:3', portrait: 'Portrait 4:5', square: 'Square', free: 'Original' };
  var cropImg = null, cropSrcPath = null, cropState = null;

  function openCropper(src, existingPath) {
    $('lib-modal').style.display = 'none';
    cropSrcPath = existingPath;
    cropImg = new Image();
    cropImg.crossOrigin = 'anonymous';
    cropImg.onload = function () {
      $('crop-modal').style.display = 'flex';
      buildAspectButtons();
      setAspect(pickAspect in ASPECTS ? pickAspect : 'free');
    };
    cropImg.onerror = function () { alert('Could not load that photo for cropping.'); };
    cropImg.src = src;
  }
  function buildAspectButtons() {
    var box = $('aspect-btns'); box.innerHTML = '';
    Object.keys(ASPECTS).forEach(function (k) {
      box.appendChild(h('button', { 'class': 'small', id: 'asp-' + k, text: ASPECT_LABELS[k], onclick: function () { setAspect(k); } }));
    });
  }
  function setAspect(k) {
    document.querySelectorAll('.aspect-btns button').forEach(function (b) { b.classList.toggle('on', b.id === 'asp-' + k); });
    var iw = cropImg.naturalWidth, ih = cropImg.naturalHeight;
    var aspect = ASPECTS[k] || iw / ih;
    var stageW = Math.min(740, window.innerWidth - 90);
    var stageH = Math.round(stageW / aspect);
    if (stageH > window.innerHeight * 0.5) { stageH = Math.round(window.innerHeight * 0.5); stageW = Math.round(stageH * aspect); }
    var cv = $('crop-canvas');
    cv.width = stageW * 2; cv.height = stageH * 2; /* retina */
    $('crop-stage').style.width = stageW + 'px';
    var cover = Math.max(cv.width / iw, cv.height / ih);
    cropState = { aspectKey: k, cover: cover, zoom: 1, ox: (cv.width - iw * cover) / 2, oy: (cv.height - ih * cover) / 2 };
    $('crop-zoom').value = 100;
    drawCrop();
  }
  function drawCrop() {
    var cv = $('crop-canvas'), cx = cv.getContext('2d');
    var s = cropState.cover * cropState.zoom;
    /* clamp offsets so the frame is always covered */
    cropState.ox = Math.min(0, Math.max(cv.width - cropImg.naturalWidth * s, cropState.ox));
    cropState.oy = Math.min(0, Math.max(cv.height - cropImg.naturalHeight * s, cropState.oy));
    cx.fillStyle = '#26201c'; cx.fillRect(0, 0, cv.width, cv.height);
    cx.drawImage(cropImg, cropState.ox, cropState.oy, cropImg.naturalWidth * s, cropImg.naturalHeight * s);
  }
  $('crop-zoom').addEventListener('input', function (e) {
    var cv = $('crop-canvas');
    var old = cropState.cover * cropState.zoom;
    cropState.zoom = e.target.value / 100;
    var s = cropState.cover * cropState.zoom;
    /* zoom around center */
    cropState.ox = cv.width / 2 - (cv.width / 2 - cropState.ox) * (s / old);
    cropState.oy = cv.height / 2 - (cv.height / 2 - cropState.oy) * (s / old);
    drawCrop();
  });
  (function dragging() {
    var st = $('crop-stage'), last = null;
    st.addEventListener('pointerdown', function (e) { last = [e.clientX, e.clientY]; st.setPointerCapture(e.pointerId); });
    st.addEventListener('pointermove', function (e) {
      if (!last) return;
      var cv = $('crop-canvas');
      var scale = cv.width / st.clientWidth;
      cropState.ox += (e.clientX - last[0]) * scale;
      cropState.oy += (e.clientY - last[1]) * scale;
      last = [e.clientX, e.clientY];
      drawCrop();
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) { st.addEventListener(ev, function () { last = null; }); });
    st.addEventListener('wheel', function (e) {
      e.preventDefault();
      var z = Math.min(400, Math.max(100, Number($('crop-zoom').value) - e.deltaY * 0.2));
      $('crop-zoom').value = z;
      $('crop-zoom').dispatchEvent(new Event('input'));
    }, { passive: false });
  })();
  $('crop-cancel').addEventListener('click', function () { $('crop-modal').style.display = 'none'; });

  function finishPick(path) {
    $('crop-modal').style.display = 'none';
    $('lib-modal').style.display = 'none';
    if (pickCallback) pickCallback(path);
    pickCallback = null;
    renderLibrary();
  }
  $('crop-skip').addEventListener('click', function () {
    /* use the photo as-is; new uploads still get resized to sane web size */
    if (cropSrcPath) return finishPick(cropSrcPath);
    var out = resampleFull(cropImg, 1920);
    finishPick(addUpload(out));
  });
  $('crop-apply').addEventListener('click', function () {
    var cv = $('crop-canvas');
    var s = cropState.cover * cropState.zoom;
    var srcX = -cropState.ox / s, srcY = -cropState.oy / s, srcW = cv.width / s, srcH = cv.height / s;
    var outW = Math.min(1920, Math.round(srcW));
    var outH = Math.round(outW * (srcH / srcW));
    var out = document.createElement('canvas');
    out.width = outW; out.height = outH;
    out.getContext('2d').drawImage(cropImg, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    finishPick(addUpload(out.toDataURL('image/jpeg', 0.82)));
  });
  function resampleFull(img, maxDim) {
    var w = img.naturalWidth, hgt = img.naturalHeight;
    var k = Math.min(1, maxDim / Math.max(w, hgt));
    var out = document.createElement('canvas');
    out.width = Math.round(w * k); out.height = Math.round(hgt * k);
    out.getContext('2d').drawImage(img, 0, 0, out.width, out.height);
    return out.toDataURL('image/jpeg', 0.82);
  }
  function addUpload(dataUrl) {
    var ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    var path = 'assets/u-' + ts + '-' + Math.floor(Math.random() * 900 + 100) + '.jpg';
    uploads[path] = { b64: dataUrl.split(',')[1], dataUrl: dataUrl };
    markDirty();
    return path;
  }

  /* ---------- preview ---------- */
  $('btn-preview').addEventListener('click', function () {
    var draft = JSON.parse(JSON.stringify(content));
    var swap = function (p) { return uploads[p] ? uploads[p].dataUrl : p; };
    draft.montage = draft.montage.map(swap);
    draft.actingHero = swap(draft.actingHero);
    draft.aboutPortrait = swap(draft.aboutPortrait);
    draft.projects.forEach(function (p) { p.img = swap(p.img); });
    draft.posts.forEach(function (p) { if (p.img) p.img = swap(p.img); });
    try {
      localStorage.setItem('dc-draft-preview', JSON.stringify(draft));
      window.open('index.html?preview=1#home', '_blank');
    } catch (e) {
      alert('Preview is too large for this browser (too many new photos at once). Publish instead, or preview with fewer new photos.');
    }
  });

  /* ---------- publish ---------- */
  /* Primary path: Git Data API — one commit for everything.
     Fallback: Contents API (one commit per file) — some token types can
     read/write contents but are not allowed on the git-data endpoints. */
  function publishGitData() {
    var parentSha, baseTree;
    return gh('/git/ref/heads/' + BRANCH).then(function (ref) {
      parentSha = ref.object.sha;
      return gh('/git/commits/' + parentSha);
    }).then(function (commit) {
      baseTree = commit.tree.sha;
      var blobs = [];
      blobs.push(gh('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: b64EncodeUnicode(JSON.stringify(content, null, 2) + '\n'), encoding: 'base64' })
      }).then(function (b) { return { path: 'content.json', mode: '100644', type: 'blob', sha: b.sha }; }));
      Object.keys(uploads).forEach(function (p) {
        log('uploading ' + p);
        blobs.push(gh('/git/blobs', {
          method: 'POST',
          body: JSON.stringify({ content: uploads[p].b64, encoding: 'base64' })
        }).then(function (b) { return { path: p, mode: '100644', type: 'blob', sha: b.sha }; }));
      });
      Object.keys(deletes).forEach(function (p) {
        log('deleting ' + p);
        blobs.push(Promise.resolve({ path: p, mode: '100644', type: 'blob', sha: null }));
      });
      return Promise.all(blobs);
    }).then(function (entries) {
      return gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: baseTree, tree: entries }) });
    }).then(function (tree) {
      return gh('/git/commits', {
        method: 'POST',
        body: JSON.stringify({ message: 'Site update via admin panel', tree: tree.sha, parents: [parentSha] })
      });
    }).then(function (commit) {
      return gh('/git/refs/heads/' + BRANCH, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
    });
  }
  function publishContentsApi() {
    var chain = Promise.resolve();
    Object.keys(uploads).forEach(function (p) {
      chain = chain.then(function () {
        log('uploading ' + p + ' (compatible mode)');
        return gh('/contents/' + p, {
          method: 'PUT',
          body: JSON.stringify({ message: 'Add photo via admin panel', content: uploads[p].b64, branch: BRANCH })
        });
      });
    });
    Object.keys(deletes).forEach(function (p) {
      var entry = library.filter(function (f) { return f.path === p; })[0];
      if (!entry) return;
      chain = chain.then(function () {
        log('deleting ' + p + ' (compatible mode)');
        return gh('/contents/' + p, {
          method: 'DELETE',
          body: JSON.stringify({ message: 'Delete photo via admin panel', sha: entry.sha, branch: BRANCH })
        });
      });
    });
    chain = chain.then(function () {
      /* fetch the freshest sha for content.json, then update it */
      return gh('/contents/content.json?ref=' + BRANCH).then(function (f) {
        log('saving content.json (compatible mode)');
        return gh('/contents/content.json', {
          method: 'PUT',
          body: JSON.stringify({
            message: 'Site update via admin panel',
            content: b64EncodeUnicode(JSON.stringify(content, null, 2) + '\n'),
            sha: f.sha,
            branch: BRANCH
          })
        });
      });
    });
    return chain;
  }
  $('btn-publish').addEventListener('click', function () {
    if (!dirty && !Object.keys(uploads).length && !Object.keys(deletes).length) { status('Nothing to publish'); return; }
    $('btn-publish').disabled = true;
    status('Publishing…');
    log('— publish started —');
    publishGitData().catch(function (e) {
      if (!/403/.test(e.message)) throw e;
      log('standard publish not allowed for this token (' + e.message + ') — retrying in compatible mode');
      return publishContentsApi();
    }).then(function () {
      Object.keys(uploads).forEach(function (p) {
        publishedThumbs[p] = uploads[p].dataUrl; /* CDN may lag a minute; keep local thumb */
      });
      uploads = {};
      deletes = {};
      dirty = false;
      /* refresh the photo library so new files carry their real shas */
      return gh('/contents/assets?ref=' + BRANCH).then(function (files) {
        library = files.filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f.name); })
          .map(function (f) { return { path: 'assets/' + f.name, sha: f.sha }; });
      }).catch(function () { /* non-fatal */ }).then(function () {
        log('— published —');
        status('Published! The live site updates in about a minute.');
        $('btn-publish').disabled = false;
      });
    }).catch(function (e) {
      log('ERROR: ' + e.message);
      if (/403/.test(e.message)) {
        log('The token is not allowed to write to the site. Re-create it with');
        log('Contents: Read and write — and note that a fine-grained token only');
        log('works when created on the account that OWNS the repo. Collaborators');
        log('should use a classic token (github.com/settings/tokens/new, scope: repo).');
      }
      status('Publish failed — see log below', true);
      $('btn-publish').disabled = false;
    });
  });

  boot();
})();
