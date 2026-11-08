/* =========================================================
   WORLDS — complete website experiences living inside MANAS-ONE811.
   Each world = its own palette, type, navigation, card system,
   background atmosphere and page transition. Plus: custom pages,
   wallpapers, motion engine, animated reactor dashboard, cinematic intro.
   ========================================================= */
(function () {
  const MX_KEY = 'manas.mx', WALL_KEY = 'manas.walls';
  const defaults = { world: 'obsidian', wnav: '', motion: 'full', tilt: true, droid: true, sound: true, accent: '', pages: [], pageLayout: {}, wallBlur: 0, wallDim: 45, wallOn: true, hostGap: null };
  NX.mx = (() => { try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(MX_KEY) || '{}')); } catch (e) { return { ...defaults }; } })();
  // Space kept free at the bottom for a host banner (e.g. Netlify). Auto-on for netlify hosts.
  NX.autoGap = () => (/netlify/i.test(location.hostname) ? 170 : 0);
  NX.applyGap = () => { const g = NX.mx.hostGap ?? NX.autoGap(); document.documentElement.style.setProperty('--hg', g + 'px'); document.documentElement.style.setProperty('--host-clearance', g + 'px'); };
  NX.saveMx = () => localStorage.setItem(MX_KEY, JSON.stringify(NX.mx));
  NX.applyGap();
  NX.walls = (() => { try { return JSON.parse(localStorage.getItem(WALL_KEY) || '{}') || {}; } catch (e) { return {}; } })();
  NX.saveWalls = () => { try { localStorage.setItem(WALL_KEY, JSON.stringify(NX.walls)); return true; } catch (e) { NX.toast('Storage full — try a smaller image'); return false; } };

  /* ---------- 13 worlds ---------- */
  // [id, name, tagline, vars{bg,bg2,surface,line,text,dim,a1,a2,glow}, font, nav, fx, card, transition, light]
  const W = (id, name, tag, v, font, nav, fx, card, tr, light) => ({ id, name, tag, v, font, nav, fx, card, tr, light: !!light });
  NX.worlds = [
    W('obsidian', 'Obsidian Glass', 'Layered dark glass, drifting light', { bg: '#07080b', bg2: '#0e1016', surface: 'rgba(255,255,255,.045)', line: 'rgba(255,255,255,.1)', text: '#eef1f6', dim: '#7d8494', a1: '#7ee0ff', a2: '#a3ffcf', glow: 'rgba(126,224,255,.35)' }, 'geist', 'dock', 'orbs', 'glass', 'zoom'),
    W('cupertino', 'Cupertino', 'Calm, airy, precise — light', { bg: '#f5f5f7', bg2: '#ffffff', surface: 'rgba(255,255,255,.85)', line: 'rgba(0,0,0,.07)', text: '#1d1d1f', dim: '#6e6e73', a1: '#0071e3', a2: '#34c759', glow: 'rgba(0,113,227,.18)' }, 'apple', 'island', 'soft', 'soft', 'rise', 1),
    W('luxury', 'Luxury Noir', 'Black, gold hairlines, serif drama', { bg: '#000000', bg2: '#0a0907', surface: 'rgba(20,17,12,.6)', line: 'rgba(212,175,55,.28)', text: '#f4ead7', dim: '#8f846f', a1: '#d4af37', a2: '#f6e3a1', glow: 'rgba(212,175,55,.3)' }, 'editorial', 'concierge', 'gold', 'hairline', 'curtain'),
    W('cyber', 'Cyberpunk 2088', 'Neon HUD, glitch, synth grid', { bg: '#07000f', bg2: '#12001f', surface: 'rgba(25,0,45,.62)', line: 'rgba(255,43,214,.45)', text: '#f6e8ff', dim: '#9a7fb2', a1: '#ff2bd6', a2: '#00f0ff', glow: 'rgba(255,43,214,.55)' }, 'cyber', 'hud', 'synth', 'clip', 'glitch'),
    W('editorial', 'The Editorial', 'Magazine type, rules & columns — light', { bg: '#f2ede3', bg2: '#ebe4d6', surface: 'transparent', line: 'rgba(20,18,16,.85)', text: '#141210', dim: '#6b645a', a1: '#c8102e', a2: '#141210', glow: 'rgba(200,16,46,.15)' }, 'editorial', 'masthead', 'paper', 'paper', 'flip', 1),
    W('minimal', 'Minimal White', 'Pure, quiet, distraction-free — light', { bg: '#ffffff', bg2: '#fafafa', surface: '#ffffff', line: 'rgba(0,0,0,.1)', text: '#0f0f0f', dim: '#8a8a8a', a1: '#ff4d00', a2: '#0f0f0f', glow: 'rgba(255,77,0,.12)' }, 'swiss', 'tabs', 'none', 'flat', 'fade', 1),
    W('midnight', 'Midnight Aurora', 'Navy skies, aurora, falling stars', { bg: '#050817', bg2: '#0b1030', surface: 'rgba(20,26,70,.45)', line: 'rgba(140,160,255,.2)', text: '#e9ecff', dim: '#8189b8', a1: '#8b9dff', a2: '#ff7ac6', glow: 'rgba(139,157,255,.45)' }, 'sora', 'radial', 'aurora', 'glow', 'blur'),
    W('cinematic', 'Cinematic', 'Letterbox, film grain, big frames', { bg: '#050403', bg2: '#100c07', surface: 'rgba(25,19,12,.55)', line: 'rgba(255,176,0,.22)', text: '#fff4e0', dim: '#9a8a70', a1: '#ffb000', a2: '#ff5a1f', glow: 'rgba(255,176,0,.35)' }, 'future', 'reel', 'film', 'cine', 'iris'),
    W('brutal', 'Brutalist', 'Thick lines, loud type, raw blocks — light', { bg: '#f1eee4', bg2: '#ffffff', surface: '#ffffff', line: '#000000', text: '#000000', dim: '#4a4a4a', a1: '#ff3b00', a2: '#2e5bff', glow: 'rgba(0,0,0,.0)' }, 'archivo', 'blocks', 'none', 'brutal', 'slam', 1),
    W('studio', 'Creative Studio', 'Playful blobs, stickers, colour', { bg: '#0f0d14', bg2: '#17141f', surface: 'rgba(30,26,42,.75)', line: 'rgba(255,255,255,.12)', text: '#fff8f0', dim: '#a59cb5', a1: '#ff7a59', a2: '#2ee6c5', glow: 'rgba(255,122,89,.4)' }, 'plusjakarta', 'fan', 'blobs', 'sticker', 'bounce'),
    W('terminal', 'Terminal', 'Green phosphor, CRT, command line', { bg: '#010a04', bg2: '#03140a', surface: 'rgba(0,30,12,.55)', line: 'rgba(0,255,156,.35)', text: '#c8ffe4', dim: '#4fa47a', a1: '#00ff9c', a2: '#b6ff00', glow: 'rgba(0,255,156,.4)' }, 'oxanium', 'command', 'crt', 'ascii', 'type'),
    W('daylight', 'Daylight Mesh', 'Soft pastel mesh, breezy — light', { bg: '#eef4f7', bg2: '#ffffff', surface: 'rgba(255,255,255,.62)', line: 'rgba(14,90,110,.12)', text: '#0f2a33', dim: '#5f7a83', a1: '#0ea5a4', a2: '#ff7a59', glow: 'rgba(14,165,164,.25)' }, 'lexend', 'side', 'mesh', 'glass', 'slide', 1),
    W('ember', 'Molten Ember', 'Lava glow, heat haze, embers', { bg: '#080302', bg2: '#140604', surface: 'rgba(40,12,6,.55)', line: 'rgba(255,106,26,.25)', text: '#fff0e6', dim: '#a1786a', a1: '#ff6a1a', a2: '#ffd166', glow: 'rgba(255,106,26,.5)' }, 'grotesk', 'ticker', 'embers', 'neon', 'rise'),
  ];
  NX.navStyles = [
    ['dock', 'Magnetic Dock', 'Bottom dock that magnifies under your finger'],
    ['island', 'Dynamic Island', 'Floating pill that expands into a menu'],
    ['concierge', 'Concierge', 'Monogram centre, links split left & right'],
    ['hud', 'HUD Brackets', 'Sci-fi bracketed top bar with live readout'],
    ['masthead', 'Masthead', 'Newspaper title with ruled section links'],
    ['tabs', 'Underline Tabs', 'Bottom text tabs with sliding underline'],
    ['radial', 'Radial Wheel', 'One button blooms into a ring of pages'],
    ['reel', 'Film Reel', 'Numbered film frames scrolling along the top'],
    ['blocks', 'Giant Blocks', 'Huge stacked words — brutal and bold'],
    ['fan', 'Card Fan', 'Corner button fans pages out like cards'],
    ['command', 'Command Line', 'Type where to go: > tasks'],
    ['side', 'Expanding Rail', 'Side rail that opens with labels'],
    ['ticker', 'Marquee Ticker', 'Endless scrolling strip of pages'],
    ['spine', 'Book Spine', 'Vertical rotated labels down the edge'],
  ];
  NX.world = () => NX.worlds.find(w => w.id === NX.mx.world) || NX.worlds[0];

  /* ---------- custom pages ---------- */
  NX.fieldKinds = [['text', 'Short text'], ['textarea', 'Long text'], ['number', 'Number'], ['date', 'Date'], ['url', 'Link'], ['select', 'Choice list'], ['progress', 'Progress %'], ['rating', 'Rating 1–5'], ['check', 'Done tick']];
  NX.buildPage = p => {
    const fields = [['title', p.titleLabel || 'Title', 'text', 1]];
    let progress = false, check = false;
    (p.fields || []).forEach((f, i) => {
      const key = 'f' + i;
      if (f.kind === 'progress') { fields.push(['progress', f.label || 'Progress %', 'number']); progress = true; }
      else if (f.kind === 'check') { fields.push(['status', f.label || 'Status', 'select', ['Not started', 'In progress', 'Completed']]); check = true; }
      else if (f.kind === 'rating') fields.push([key, f.label || 'Rating', 'select', ['', '1', '2', '3', '4', '5']]);
      else if (f.kind === 'select') fields.push([key, f.label || 'Choice', 'select', ['', ...String(f.options || '').split(',').map(s => s.trim()).filter(Boolean)]]);
      else fields.push([key, f.label || 'Field', f.kind]);
    });
    const firstSelect = fields.find(f => f[2] === 'select' && f[0] !== 'status');
    return { id: p.id, name: p.name, icon: p.icon || '✦', type: p.id, custom: true, fields, progress, check, filter: firstSelect ? firstSelect[0] : undefined,
      sub: r => fields.slice(1).map(f => r[f[0]]).filter(x => x !== '' && x !== undefined && x !== null).slice(0, 3).join(' · ') };
  };
  NX.syncPages = () => {
    NX.modules = NX.modules.filter(m => !m.custom);
    const at = NX.modules.findIndex(m => m.id === 'gallery');
    NX.modules.splice(at < 0 ? NX.modules.length : at, 0, ...(NX.mx.pages || []).map(NX.buildPage));
  };
  NX.syncPages();
  if (!NX.mod('worlds')) NX.modules.splice(1, 0, { id: 'worlds', name: 'Worlds', icon: '❖', render: v => NX.renderWorlds(v) });

  /* ---------- apply world ---------- */
  const fxLayer = document.createElement('div'); fxLayer.id = 'wfx'; fxLayer.setAttribute('aria-hidden', 'true');
  const wall = document.createElement('div'); wall.id = 'wwall'; wall.setAttribute('aria-hidden', 'true');
  document.body.prepend(wall, fxLayer);
  const fxHTML = {
    orbs: '<i class="o1"></i><i class="o2"></i><i class="o3"></i>',
    aurora: '<i class="au1"></i><i class="au2"></i><b class="stars"></b><b class="stars s2"></b><em class="shoot"></em><em class="shoot d2"></em>',
    synth: '<i class="sun"></i><i class="floor"></i><b class="scan"></b>',
    gold: '<i class="gl1"></i><i class="gl2"></i>',
    film: '<i class="lb top"></i><i class="lb bot"></i><b class="vig"></b><b class="dust"></b>',
    blobs: '<i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i>',
    crt: '<b class="scan"></b><b class="flick"></b><i class="rain"></i>',
    mesh: '<i class="m1"></i><i class="m2"></i><i class="m3"></i>',
    embers: '<i class="lava"></i>' + Array.from({ length: 18 }, (_, i) => `<em style="--x:${(i * 53) % 100}%;--d:${4 + (i % 5)}s;--dl:${(i * .37) % 4}s"></em>`).join(''),
    soft: '<i class="s1"></i><i class="s2"></i>', paper: '', none: '',
  };
  NX.applyWorld = () => {
    const w = NX.world(), b = document.body, s = b.style;
    NX.prefs.font = w.font; NX.prefs.theme = w.light ? 'paper' : 'chrome'; NX.prefs.accent = ''; NX.prefs.layout = 'classic'; NX.prefs.navMode = 'top'; NX.prefs.backdrop = 'plain';
    NX.applyPrefs();
    Object.entries(w.v).forEach(([k, val]) => s.setProperty('--' + k, val));
    if (NX.mx.accent) { s.setProperty('--a1', NX.mx.accent); s.setProperty('--glow', NX.mx.accent + '66'); }
    b.dataset.world = w.id; b.dataset.card = w.card; b.dataset.fx = w.fx; b.dataset.tr = w.tr; b.dataset.light = w.light ? '1' : '0';
    b.dataset.motion = NX.mx.motion;
    fxLayer.innerHTML = NX.mx.motion === 'off' ? '' : (fxHTML[w.fx] || '');
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', w.v.bg);
    NX.refreshAuraColor && NX.refreshAuraColor();
    NX.renderNav(); NX.applyWall(); NX.applyGap();
  };
  NX.applyWall = () => {
    const src = (NX.mx.wallOn && (NX.walls[NX.current] || NX.walls.all)) || '';
    wall.style.backgroundImage = src ? `url("${src}")` : 'none';
    wall.classList.toggle('on', !!src);
    wall.style.setProperty('--wb', (NX.mx.wallBlur || 0) + 'px'); wall.style.setProperty('--wd', (NX.mx.wallDim ?? 45) / 100);
  };

  /* ---------- navigation engines ---------- */
  const nav = document.createElement('nav'); nav.id = 'wnav'; nav.setAttribute('aria-label', 'Main navigation');
  document.body.append(nav);
  const navItems = () => [...NX.modules.filter(m => m.id !== 'world'), { id: '__studio', name: 'Studio', icon: '✦' }];
  NX.renderNav = () => {
    const style = NX.mx.wnav || NX.world().nav; document.body.dataset.wnav = style;
    const strip = document.querySelector('.strip');
    if ((style === 'masthead' || style === 'blocks') && strip) { if (nav.nextElementSibling !== strip) strip.before(nav); }
    else if (nav.parentElement !== document.body || nav.nextElementSibling) document.body.append(nav);
    const items = navItems();
    const btn = (m, i) => `<button class="wn-i ${NX.current === m.id ? 'on' : ''}" data-wgo="${m.id}" style="--k:${i}" aria-label="${NX.esc(m.name)}"><span class="wn-ico">${m.icon}</span><span class="wn-l">${NX.esc(m.name)}</span><span class="wn-n">${String(i + 1).padStart(2, '0')}</span></button>`;
    const list = items.map(btn).join('');
    const cur = NX.mod(NX.current)?.name || 'Command';
    let html = '';
    if (style === 'radial' || style === 'fan' || style === 'island') html = `<button class="wn-toggle" data-wtoggle aria-label="Open navigation"><span class="wn-ico">${style === 'island' ? '' : '✦'}</span><span class="wn-cur">${NX.esc(cur)}</span></button><div class="wn-track">${list}</div>`;
    else if (style === 'command') html = `<form class="wn-cmd"><span class="wn-prompt">manas@one811:~$</span><input id="wnCmd" autocomplete="off" spellcheck="false" placeholder="go ${NX.esc(cur.toLowerCase())}  ·  try: tasks, music, studio" aria-label="Type a page to open"></form><div class="wn-track">${list}</div>`;
    else if (style === 'ticker') html = `<div class="wn-track"><div class="wn-run">${list}${list}</div></div>`;
    else if (style === 'concierge') { const h = Math.ceil(items.length / 2); html = `<div class="wn-track"><div class="wn-half">${items.slice(0, h).map(btn).join('')}</div><button class="wn-mono" data-wgo="home">M<span>·</span>811</button><div class="wn-half">${items.slice(h).map((m, i) => btn(m, i + h)).join('')}</div></div>`; }
    else if (style === 'masthead') html = `<div class="wn-mast"><span class="mono">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><b>The Manas Times</b><span class="mono">Vol. 811</span></div><div class="wn-track">${list}</div>`;
    else if (style === 'hud') html = `<div class="wn-read mono"><span>SYS://ONE811</span><span id="wnHud">ONLINE</span></div><div class="wn-track">${list}</div>`;
    else html = `<div class="wn-track">${list}</div>`;
    nav.innerHTML = html + '<i class="wn-glider"></i>'; nav.style.setProperty('--n', items.length);
    nav.classList.remove('open');
    requestAnimationFrame(placeGlider);
  };
  const placeGlider = () => {
    const on = nav.querySelector('.wn-i.on'), g = nav.querySelector('.wn-glider');
    if (!on || !g) return; const r = on.getBoundingClientRect(), n = nav.getBoundingClientRect();
    g.style.cssText = `--gx:${r.left - n.left}px;--gy:${r.top - n.top}px;--gw:${r.width}px;--gh:${r.height}px`;
  };
  addEventListener('resize', placeGlider, { passive: true });
  nav.addEventListener('click', e => {
    if (e.target.closest('[data-wtoggle]')) { nav.classList.toggle('open'); NX.haptic && NX.haptic(8); return; }
    const b = e.target.closest('[data-wgo]'); if (!b) return;
    nav.classList.remove('open');
    if (b.dataset.wgo === '__studio') return NX.openStudio();
    NX.go(b.dataset.wgo);
  });
  nav.addEventListener('submit', e => {
    e.preventDefault(); const q = (nav.querySelector('#wnCmd').value || '').replace(/^(go|cd|open)\s+/i, '').trim().toLowerCase();
    if (!q) return; if ('studio'.startsWith(q)) return NX.openStudio();
    const m = NX.modules.filter(x => x.id !== 'world').find(x => x.name.toLowerCase().startsWith(q) || x.id.startsWith(q));
    if (m) NX.go(m.id); else NX.toast(`command not found: ${q}`);
  });
  document.addEventListener('click', e => { if (nav.classList.contains('open') && !nav.contains(e.target)) nav.classList.remove('open'); });
  // magnetic dock
  nav.addEventListener('pointermove', e => {
    if (document.body.dataset.wnav !== 'dock' || e.pointerType !== 'mouse') return;
    nav.querySelectorAll('.wn-i').forEach(b => { const r = b.getBoundingClientRect(); const d = Math.abs(e.clientX - (r.left + r.width / 2)); b.style.setProperty('--mag', Math.max(0, 1 - d / 160).toFixed(3)); });
  });
  nav.addEventListener('pointerleave', () => nav.querySelectorAll('.wn-i').forEach(b => b.style.setProperty('--mag', 0)));

  /* ---------- motion engine: reveal, tilt, spotlight, counters ---------- */
  const reduced = () => NX.mx.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CARD_SEL = '.shard, .row, .memory-photo, .rx-tile, .kpi, .ws-card, .np-card';
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('wx-seen'); io.unobserve(en.target); } }), { threshold: .08 }) : null;
  NX.animateView = root => {
    if (!root) return;
    const cards = root.querySelectorAll(CARD_SEL);
    cards.forEach((c, i) => { c.style.setProperty('--wi', Math.min(i, 14)); c.classList.add('wx-card'); if (io && !reduced()) io.observe(c); else c.classList.add('wx-seen'); });
    root.querySelectorAll('.hero h1').forEach(h => {
      if (h.dataset.split) return; h.dataset.split = 1; let k = 0;
      [...h.childNodes].forEach(n => {
        if (n.nodeType === 3) { const frag = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(part => { if (!part) return; if (/^\s+$/.test(part)) frag.append(part); else { const s = document.createElement('span'); s.className = 'wx-word'; s.style.setProperty('--wk', k++); s.textContent = part; frag.append(s); } }); n.replaceWith(frag); }
        else if (n.nodeType === 1) { n.classList.add('wx-word'); n.style.setProperty('--wk', k++); }
      });
    });
    if (!reduced()) root.querySelectorAll('.stat, [data-count]').forEach(el => {
      if (el.dataset.counted) return; el.dataset.counted = 1;
      const txt = el.dataset.count ?? el.textContent, m = String(txt).match(/-?[\d,]+(\.\d+)?/); if (!m) return;
      const target = parseFloat(m[0].replace(/,/g, '')); if (!isFinite(target) || target === 0) return;
      const pre = String(txt).slice(0, m.index), post = String(txt).slice(m.index + m[0].length), dec = (m[1] || '').length - 1;
      const t0 = performance.now(), dur = 1100;
      const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4), v = target * e; el.textContent = pre + (dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + post; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  };
  let tiltEl = null;
  addEventListener('pointermove', e => {
    if (!NX.mx.tilt || reduced() || e.pointerType !== 'mouse') return;
    const c = e.target.closest && e.target.closest('.wx-card');
    if (tiltEl && tiltEl !== c) { tiltEl.style.removeProperty('--rx'); tiltEl.style.removeProperty('--ry'); tiltEl.classList.remove('wx-tilt'); }
    tiltEl = c; if (!c) return;
    const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const amt = c.classList.contains('row') ? 3 : 9;
    c.classList.add('wx-tilt'); c.style.setProperty('--rx', ((.5 - py) * amt).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((px - .5) * amt).toFixed(2) + 'deg');
    c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
  }, { passive: true });
  // ripple on press
  addEventListener('pointerdown', e => {
    const c = e.target.closest && e.target.closest('.wx-card, .btn, .chip, .wn-i'); if (!c || reduced()) return;
    const r = c.getBoundingClientRect(), rp = document.createElement('i'); rp.className = 'wx-ripple';
    rp.style.left = e.clientX - r.left + 'px'; rp.style.top = e.clientY - r.top + 'px';
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    c.append(rp); setTimeout(() => rp.remove(), 700);
  }, { passive: true });

  /* ---------- reactor (animated dashboard core) ---------- */
  NX.reactorHTML = () => {
    const t = NX.today(), tasks = NX.list('task'), open = tasks.filter(x => !['Completed', 'Cancelled'].includes(x.status));
    const done = tasks.length - open.length, goals = NX.list('goal');
    const gAvg = goals.length ? Math.round(goals.reduce((a, g) => a + (+g.progress || 0), 0) / goals.length) : 0;
    const wk = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d.toISOString().slice(0, 10); });
    const wo = NX.list('workout'), woWeek = wo.filter(w => wk.includes(w.date)).length;
    const ym = t.slice(0, 7), spend = NX.list('transaction').filter(x => x.kind === 'Expense' && (x.date || '').startsWith(ym)).reduce((a, x) => a + (+x.amount || 0), 0);
    const inc = NX.list('transaction').filter(x => x.kind === 'Income' && (x.date || '').startsWith(ym)).reduce((a, x) => a + (+x.amount || 0), 0);
    const woDays = wk.filter(d => wo.some(w => w.date === d)).length, money = inc ? Math.max(0, Math.min(100, (1 - spend / inc) * 100 + 40)) : 50;
    const score = Math.round((tasks.length ? done / tasks.length * 100 : 0) * .3 + gAvg * .3 + Math.min(100, woDays / 5 * 100) * .25 + money * .15);
    const C = 2 * Math.PI * 96, act = wk.map(d => NX.data.records.filter(r => (r.created || '').startsWith(d) || r.date === d).length), mx = Math.max(1, ...act);
    const sats = [['◇', open.length, 'open tasks', 'tasks'], ['◎', gAvg + '%', 'goal avg', 'goals'], ['⚡', woWeek, 'workouts/wk', 'fitness'], ['₹', NX.money(spend), 'spent', 'finance'], ['♫', NX.list('music').length, 'tracks', 'music'], ['✧', NX.list('memory').length, 'memories', 'memories']];
    const ticks = Array.from({ length: 60 }, (_, i) => `<line x1="140" y1="${i % 5 ? 30 : 24}" x2="140" y2="36" transform="rotate(${i * 6} 140 140)"/>`).join('');
    return `<section class="rx" aria-label="Life reactor">
      <div class="rx-core-wrap">
        <svg class="rx-svg" viewBox="0 0 280 280" aria-hidden="true">
          <defs><radialGradient id="rxg"><stop offset="0" stop-color="var(--a1)" stop-opacity=".55"/><stop offset=".6" stop-color="var(--a1)" stop-opacity=".08"/><stop offset="1" stop-color="var(--a1)" stop-opacity="0"/></radialGradient>
          <linearGradient id="rxl" x1="0" x2="1"><stop offset="0" stop-color="var(--a1)"/><stop offset="1" stop-color="var(--a2)"/></linearGradient></defs>
          <g class="rx-r1">${ticks}</g>
          <circle class="rx-r2" cx="140" cy="140" r="118" fill="none" stroke-dasharray="40 14 4 14"/>
          <circle class="rx-r3" cx="140" cy="140" r="106" fill="none" stroke-dasharray="2 7"/>
          <circle class="rx-track" cx="140" cy="140" r="96" fill="none"/>
          <circle class="rx-prog" cx="140" cy="140" r="96" fill="none" stroke="url(#rxl)" stroke-dasharray="${C}" stroke-dashoffset="${C}" style="--to:${C * (1 - score / 100)}"/>
          <circle class="rx-r4" cx="140" cy="140" r="80" fill="none" stroke-dasharray="70 30 20 30"/>
          <circle class="rx-glow" cx="140" cy="140" r="78" fill="url(#rxg)"/>
          <g class="rx-scan"><path d="M140 140 L140 44 A96 96 0 0 1 207 72 Z"/></g>
        </svg>
        <div class="rx-center"><b data-count="${score}">${score}</b><span class="mono">life index</span></div>
        <div class="rx-orbit">${sats.map((s, i) => `<button class="rx-sat" data-go="${s[3]}" style="--a:${i * 60}deg" aria-label="${s[2]}"><span><i>${s[0]}</i><b>${NX.esc(String(s[1]))}</b><small>${s[2]}</small></span></button>`).join('')}</div>
      </div>
      <div class="rx-side">
        <div class="rx-clock"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" class="cf"/>${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="7" x2="50" y2="13" transform="rotate(${i * 30} 50 50)"/>`).join('')}<line id="rxH" class="h" x1="50" y1="50" x2="50" y2="28"/><line id="rxM" class="m" x1="50" y1="50" x2="50" y2="16"/><line id="rxS" class="s" x1="50" y1="56" x2="50" y2="10"/><circle cx="50" cy="50" r="2.5" class="dot"/></svg>
          <div><div class="rx-time display" id="rxTime"></div><div class="mono dim">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div></div></div>
        <div class="rx-eq" aria-label="Activity this week">${act.map((a, i) => `<i style="--h:${a ? Math.max(22, a / mx * 100) : 18 + ((i * 37) % 40)}%;--k:${i}"><em></em></i>`).join('')}</div>
        <div class="rx-tiles">
          <div class="rx-tile"><span class="mono dim">Done</span><b data-count="${done}">${done}</b></div>
          <div class="rx-tile"><span class="mono dim">Goals</span><b data-count="${goals.length}">${goals.length}</b></div>
          <div class="rx-tile"><span class="mono dim">Records</span><b data-count="${NX.data.records.length}">${NX.data.records.length}</b></div>
        </div>
      </div></section>`;
  };
  const clockTick = () => {
    const d = new Date(), H = document.getElementById('rxH'); if (!H) return;
    const s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
    H.setAttribute('transform', `rotate(${h * 30} 50 50)`); document.getElementById('rxM').setAttribute('transform', `rotate(${m * 6} 50 50)`); document.getElementById('rxS').setAttribute('transform', `rotate(${s * 6} 50 50)`);
    const t = document.getElementById('rxTime'); if (t) t.textContent = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hud = document.getElementById('wnHud'); if (hud) hud.textContent = 'T+' + d.toLocaleTimeString('en-GB');
  };
  setInterval(clockTick, 1000);

  /* ---------- Worlds page: every world, one tap away ---------- */
  NX.previewCard = (w, big) => { const f = NX.fonts.find(x => x[0] === w.font) || NX.fonts[0]; const navName = NX.navStyles.find(n => n[0] === w.nav)?.[1] || w.nav;
    return `<button class="ws-card ${big ? 'ws-big' : ''} ${NX.mx.world === w.id ? 'on' : ''}" data-world-pick="${w.id}" style="--pb:${w.v.bg};--pb2:${w.v.bg2};--pa:${w.v.a1};--pa2:${w.v.a2};--pt:${w.v.text};--pl:${w.v.line};--pf:${f[6] ? f[2] : `'${f[2]}'`}" aria-label="Enter ${w.name}">
      <div class="ws-prev ws-${w.card}"><i class="ws-nav ws-nav-${w.nav}"></i><b>${big ? NX.esc(w.name.split(' ')[0]) : 'Aa'}</b><span></span><span></span><span></span>${NX.mx.world === w.id ? '<em class="ws-badge">You are here</em>' : ''}</div>
      <div class="ws-meta"><b>${w.name}</b><small>${w.tag}</small>${big ? `<div class="ws-tags"><span>${w.light ? '☀ Light' : '☾ Dark'}</span><span>☰ ${navName}</span><span>${f[1]}</span></div>` : ''}</div></button>`; };
  const wireWorldPicks = root => root.querySelectorAll('[data-world-pick]').forEach(b => b.onclick = () => { if (NX.mx.world === b.dataset.worldPick) return NX.toast('You are already in ' + NX.world().name); NX.mx.world = b.dataset.worldPick; NX.saveMx(); NX.closeSheet(); NX.worldSwitch(); });
  NX.cycleWorld = dir => { const i = NX.worlds.findIndex(w => w.id === NX.mx.world); NX.mx.world = NX.worlds[(i + dir + NX.worlds.length) % NX.worlds.length].id; NX.saveMx(); NX.worldSwitch(); };
  NX.renderWorlds = v => {
    if (!document.getElementById('fontPreview')) document.head.insertAdjacentHTML('beforeend', `<link id="fontPreview" rel="stylesheet" href="https://fonts.googleapis.com/css2?${NX.fonts.map(f => f[5]).join('&')}&display=swap">`);
    const cur = NX.world();
    v.innerHTML = `<section class="hero"><div class="mono dim">${NX.worlds.length} complete websites · tap one to step inside</div><h1>Every <em>world.</em></h1></section>
      <div class="wsw-now"><button class="btn" data-cycle="-1" aria-label="Previous world">‹ Prev</button><div class="wsw-cur"><span class="mono dim">Now in</span><b>${cur.name}</b></div><button class="btn" data-cycle="1" aria-label="Next world">Next ›</button></div>
      <div class="section-h"><h2>Dark worlds</h2></div><div class="ws-grid ws-grid-big">${NX.worlds.filter(w => !w.light).map(w => NX.previewCard(w, true)).join('')}</div>
      <div class="section-h"><h2>Light worlds</h2></div><div class="ws-grid ws-grid-big">${NX.worlds.filter(w => w.light).map(w => NX.previewCard(w, true)).join('')}</div>
      <div class="section-h"><h2>Mix &amp; match</h2></div><div class="chips"><button class="chip" data-st-open="nav">☰ Change navigation</button><button class="chip" data-st-open="look">▧ Wallpaper &amp; colour</button><button class="chip" data-st-open="motion">✺ Motion</button><button class="chip" data-st-open="pages">＋ Create a page</button></div>
      <p class="dim tiny" style="margin-top:14px">Tip: press <b>[</b> or <b>]</b> on your keyboard to flip between worlds from any page.</p>`;
    wireWorldPicks(v);
    v.querySelectorAll('[data-cycle]').forEach(b => b.onclick = () => NX.cycleWorld(+b.dataset.cycle));
    v.querySelectorAll('[data-st-open]').forEach(b => b.onclick = () => NX.openStudio(b.dataset.stOpen));
  };
  addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return; if (document.body.classList.contains('sheet-open')) return; if (e.key === ']') NX.cycleWorld(1); if (e.key === '[') NX.cycleWorld(-1); });

  /* ---------- Studio (worlds, nav, pages, motion, wallpaper) ---------- */
  NX.studioTab = 'worlds';
  NX.openStudio = (tab) => {
    if (tab) NX.studioTab = tab;
    if (!document.getElementById('fontPreview')) document.head.insertAdjacentHTML('beforeend', `<link id="fontPreview" rel="stylesheet" href="https://fonts.googleapis.com/css2?${NX.fonts.map(f => f[5]).join('&')}&display=swap">`);
    const tabs = [['worlds', 'Worlds'], ['nav', 'Navigation'], ['pages', 'Pages'], ['look', 'Wallpaper & colour'], ['motion', 'Motion']];
    const T = NX.studioTab;
    let body = '';
    if (T === 'worlds') body = `<p class="dim tiny">Each world is a whole different website — layout, navigation, type, cards, atmosphere and transitions.</p><div class="ws-grid">${NX.worlds.map(w => NX.previewCard(w)).join('')}</div><div class="actions" style="margin-top:12px"><span></span><button class="btn solid" id="stAllWorlds">Open the Worlds page ›</button></div>`;
    if (T === 'nav') body = `<p class="dim tiny">Mix any navigation with any world. “World default” follows the current world.</p><div class="np-grid"><button class="np-card ${!NX.mx.wnav ? 'on' : ''}" data-nav-pick=""><div class="np-sch np-auto"><i></i></div><b>World default</b><small>${NX.navStyles.find(n => n[0] === NX.world().nav)?.[1]}</small></button>${NX.navStyles.map(n => `<button class="np-card ${NX.mx.wnav === n[0] ? 'on' : ''}" data-nav-pick="${n[0]}"><div class="np-sch np-${n[0]}"><i></i><i></i><i></i><i></i></div><b>${n[1]}</b><small>${n[2]}</small></button>`).join('')}</div>`;
    if (T === 'pages') body = `<p class="dim tiny">Create your own pages with your own fields. They appear in navigation, search and the + button.</p>
      <div class="rows">${(NX.mx.pages || []).map(p => `<div class="row"><span style="font-size:20px">${NX.esc(p.icon)}</span><div class="grow"><div class="t">${NX.esc(p.name)}</div><div class="s">${(p.fields || []).length + 1} fields · ${NX.list(p.id).length} items</div></div><button class="btn small" data-page-edit="${p.id}">Edit</button><button class="btn small" data-page-open="${p.id}">Open</button></div>`).join('') || '<div class="empty">No custom pages yet.</div>'}</div>
      <div class="actions" style="margin-top:12px"><span></span><button class="btn solid" id="pgNew">＋ Create a page</button></div>
      <div class="section-h"><h2>Page layout</h2></div><p class="dim tiny">How items show on each list page.</p>
      <div class="rows">${NX.modules.filter(m => m.type && !m.render).map(m => `<div class="row"><span>${m.icon}</span><div class="grow"><div class="t">${NX.esc(m.name)}</div></div><select data-pl="${m.id}">${['list', 'grid', 'masonry', 'big'].map(o => `<option ${(NX.mx.pageLayout[m.id] || 'list') === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`).join('')}</div>`;
    if (T === 'look') body = `<p class="dim tiny">Wallpapers sit behind everything. Set one for the whole site, or a different one per page.</p>
      <div class="field"><span class="mono dim">Accent colour</span><div style="display:flex;gap:10px;align-items:center"><input type="color" id="mxAccent" value="${NX.mx.accent || NX.world().v.a1}" style="width:60px;height:40px;padding:0"><button class="btn small" id="mxAccentReset">Use world colour</button></div></div>
      <div class="field"><span class="mono dim">Wallpaper for</span><select id="wallTarget"><option value="all">Whole website</option>${NX.modules.filter(m => m.id !== 'world').map(m => `<option value="${m.id}" ${NX.current === m.id ? 'selected' : ''}>${NX.esc(m.name)} page</option>`).join('')}</select></div>
      <div class="actions"><label class="btn small photo-pick">＋ Upload image<input id="wallFile" type="file" accept="image/*" hidden></label><button class="btn small" id="wallClear">Remove</button></div>
      <div class="wall-thumbs">${Object.entries(NX.walls).map(([k, v]) => `<figure><img src="${v}" alt=""><figcaption class="mono">${k === 'all' ? 'Everywhere' : NX.esc(NX.mod(k)?.name || k)}</figcaption></figure>`).join('')}</div>
      <label class="field"><span class="mono dim">Wallpaper blur · <b id="vb">${NX.mx.wallBlur}</b>px</span><input type="range" id="mxBlur" min="0" max="30" value="${NX.mx.wallBlur}"></label>
      <label class="field"><span class="mono dim">Darken / fade · <b id="vd">${NX.mx.wallDim}</b>%</span><input type="range" id="mxDim" min="0" max="90" value="${NX.mx.wallDim}"></label>
      <div class="section-h"><h2>Bottom banner space</h2></div><p class="dim tiny">If a hosting banner (like Netlify's) covers the bottom of the screen, raise this until everything sits above it.</p>
      <label class="field"><span class="mono dim">Keep free at bottom · <b id="vg">${NX.mx.hostGap ?? NX.autoGap()}</b>px</span><input type="range" id="mxGap" min="0" max="300" step="5" value="${NX.mx.hostGap ?? NX.autoGap()}"></label>
      <div class="actions"><button class="btn small" id="mxGapAuto">Automatic</button><button class="btn small" id="mxGapOff">None</button></div>
      <label class="field"><span class="mono dim">Card corners · <b id="vr">${NX.prefs.radius ?? 20}</b>px</span><input type="range" id="mxRad" min="0" max="40" value="${NX.prefs.radius ?? 20}"></label>
      <label class="field"><span class="mono dim">Text size</span><select id="mxZoom">${[['0.9', 'Compact'], ['1', 'Default'], ['1.1', 'Large'], ['1.2', 'Extra large']].map(([v, l]) => `<option value="${v}" ${String(NX.prefs.zoom) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span class="mono dim">Your name</span><input id="mxName" value="${NX.esc(NX.prefs.name)}"></label>`;
    if (T === 'motion') body = `<div class="field"><span class="mono dim">Animation level</span><div class="chips">${[['full', 'Full cinematic'], ['subtle', 'Subtle'], ['off', 'Off']].map(([v, l]) => `<button class="chip ${NX.mx.motion === v ? 'on' : ''}" data-motion="${v}">${l}</button>`).join('')}</div></div>
      <div class="rows"><label class="row"><div class="grow"><div class="t">3D card tilt & spotlight</div><div class="s">Cards lean toward your cursor</div></div><input type="checkbox" id="mxTilt" ${NX.mx.tilt ? 'checked' : ''}></label>
      <label class="row"><div class="grow"><div class="t">ONE-811 droid</div><div class="s">Your robot companion</div></div><input type="checkbox" id="mxDroid" ${NX.mx.droid ? 'checked' : ''}></label>
      <label class="row"><div class="grow"><div class="t">Droid sounds</div><div class="s">Beeps and chirps when you talk to it</div></div><input type="checkbox" id="mxSound" ${NX.mx.sound ? 'checked' : ''}></label>
      <button class="row" id="mxReplay"><div class="grow"><div class="t">Replay intro</div><div class="s">Watch the MANAS-ONE811 opening again</div></div><span>▶</span></button></div>`;
    NX.openSheet(`<h3>Studio</h3><div class="chips st-tabs">${tabs.map(([k, l]) => `<button class="chip ${T === k ? 'on' : ''}" data-st="${k}">${l}</button>`).join('')}</div><div class="st-body">${body}</div>`);
    const sb = document.getElementById('sheetBody'), re = () => NX.openStudio();
    NX.animateView(sb);
    sb.querySelectorAll('[data-st]').forEach(b => b.onclick = () => NX.openStudio(b.dataset.st));
    wireWorldPicks(sb); on0(sb, 'stAllWorlds', () => { NX.closeSheet(); NX.go('worlds'); });
    sb.querySelectorAll('[data-nav-pick]').forEach(b => b.onclick = () => { NX.mx.wnav = b.dataset.navPick; NX.saveMx(); NX.renderNav(); re(); NX.toast('Navigation changed ✦'); });
    sb.querySelectorAll('[data-motion]').forEach(b => b.onclick = () => { NX.mx.motion = b.dataset.motion; NX.saveMx(); NX.applyWorld(); re(); });
    sb.querySelectorAll('[data-pl]').forEach(s => s.onchange = () => { NX.mx.pageLayout[s.dataset.pl] = s.value; NX.saveMx(); NX.toast('Layout saved'); });
    sb.querySelectorAll('[data-page-edit]').forEach(b => b.onclick = () => NX.editPage(NX.mx.pages.find(p => p.id === b.dataset.pageEdit)));
    sb.querySelectorAll('[data-page-open]').forEach(b => b.onclick = () => { NX.closeSheet(); NX.go(b.dataset.pageOpen); });
    const on = (id, ev, fn) => { const el = sb.querySelector('#' + id); if (el) el[ev] = fn; };
    on('pgNew', 'onclick', () => NX.editPage());
    on('mxAccent', 'oninput', e => { NX.mx.accent = e.target.value; NX.saveMx(); NX.applyWorld(); });
    on('mxAccentReset', 'onclick', () => { NX.mx.accent = ''; NX.saveMx(); NX.applyWorld(); re(); });
    on('wallFile', 'onchange', async e => { const f = e.target.files[0]; if (!f) return; try { const p = await NX.photoData(f); NX.walls[sb.querySelector('#wallTarget').value] = p.data; NX.mx.wallOn = true; NX.saveMx(); if (NX.saveWalls()) { NX.applyWall(); NX.toast('Wallpaper set ✦'); re(); } } catch (err) { NX.toast(err.message || 'Could not read image'); } });
    on('wallClear', 'onclick', () => { delete NX.walls[sb.querySelector('#wallTarget').value]; NX.saveWalls(); NX.applyWall(); re(); });
    on('mxBlur', 'oninput', e => { NX.mx.wallBlur = +e.target.value; sb.querySelector('#vb').textContent = e.target.value; NX.saveMx(); NX.applyWall(); });
    on('mxDim', 'oninput', e => { NX.mx.wallDim = +e.target.value; sb.querySelector('#vd').textContent = e.target.value; NX.saveMx(); NX.applyWall(); });
    on('mxGap', 'oninput', e => { NX.mx.hostGap = +e.target.value; sb.querySelector('#vg').textContent = e.target.value; NX.saveMx(); NX.applyGap(); });
    on('mxGapAuto', 'onclick', () => { NX.mx.hostGap = null; NX.saveMx(); NX.applyGap(); re(); NX.toast('Bottom space: automatic'); });
    on('mxGapOff', 'onclick', () => { NX.mx.hostGap = 0; NX.saveMx(); NX.applyGap(); re(); });
    on('mxRad', 'oninput', e => { NX.prefs.radius = +e.target.value; sb.querySelector('#vr').textContent = e.target.value; NX.applyWorld(); });
    on('mxZoom', 'onchange', e => { NX.prefs.zoom = e.target.value; NX.applyWorld(); });
    on('mxName', 'onchange', e => { NX.prefs.name = e.target.value || 'Manas'; NX.savePrefs(); NX.go(NX.current, false); });
    on('mxTilt', 'onchange', e => { NX.mx.tilt = e.target.checked; NX.saveMx(); });
    on('mxDroid', 'onchange', e => { NX.mx.droid = e.target.checked; NX.saveMx(); NX.droid && NX.droid.toggle(NX.mx.droid); });
    on('mxSound', 'onchange', e => { NX.mx.sound = e.target.checked; NX.saveMx(); });
    on('mxReplay', 'onclick', () => { NX.closeSheet(); NX.runIntro(true); });
  };
  const on0 = (root, id, fn) => { const el = root.querySelector('#' + id); if (el) el.onclick = fn; };
  NX.editPage = (p) => {
    const page = p ? JSON.parse(JSON.stringify(p)) : { id: 'pg-' + Date.now().toString(36), name: '', icon: '✦', titleLabel: 'Title', fields: [{ label: 'Notes', kind: 'textarea' }] };
    const icons = ['✦', '★', '♛', '☕', '✈', '⚽', '🎮', '📚', '🎬', '🍳', '💡', '🛒', '🎯', '🏠', '🐾', '💎', '🌿', '🔥', '🎨', '🧠'];
    const paint = () => {
      NX.openSheet(`<h3>${p ? 'Edit page' : 'Create a page'}</h3>
        <label class="field"><span class="mono dim">Page name</span><input id="pgName" value="${NX.esc(page.name)}" placeholder="e.g. Recipes, Travel, Watchlist" required></label>
        <div class="field"><span class="mono dim">Icon</span><div class="pg-icons">${icons.map(i => `<button type="button" class="chip ${page.icon === i ? 'on' : ''}" data-ic="${i}">${i}</button>`).join('')}</div></div>
        <label class="field"><span class="mono dim">Name of the main title field</span><input id="pgTitle" value="${NX.esc(page.titleLabel)}"></label>
        <div class="section-h"><h2>Fields</h2></div>
        <div class="rows" id="pgFields">${page.fields.map((f, i) => `<div class="row pg-f"><input data-fl="${i}" value="${NX.esc(f.label)}" placeholder="Field name"><select data-fk="${i}">${NX.fieldKinds.map(([k, l]) => `<option value="${k}" ${f.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select>${f.kind === 'select' ? `<input data-fo="${i}" value="${NX.esc(f.options || '')}" placeholder="Options, comma separated">` : ''}<button type="button" class="btn small" data-fx="${i}" aria-label="Remove field">×</button></div>`).join('')}</div>
        <div class="actions" style="margin-top:10px"><button type="button" class="btn small" id="pgAddF">＋ Add field</button><span></span></div>
        <div class="actions" style="margin-top:18px">${p ? '<button type="button" class="btn small" id="pgDel">Delete page</button>' : '<span></span>'}<button class="btn solid" id="pgSave">${p ? 'Save page' : 'Create page'}</button></div>`);
      const sb = document.getElementById('sheetBody'), read = () => { page.name = sb.querySelector('#pgName').value.trim(); page.titleLabel = sb.querySelector('#pgTitle').value.trim() || 'Title'; sb.querySelectorAll('[data-fl]').forEach(el => page.fields[+el.dataset.fl].label = el.value); sb.querySelectorAll('[data-fo]').forEach(el => page.fields[+el.dataset.fo].options = el.value); };
      sb.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => { read(); page.icon = b.dataset.ic; paint(); });
      sb.querySelectorAll('[data-fk]').forEach(s => s.onchange = () => { read(); page.fields[+s.dataset.fk].kind = s.value; paint(); });
      sb.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { read(); page.fields.splice(+b.dataset.fx, 1); paint(); });
      sb.querySelector('#pgAddF').onclick = () => { read(); page.fields.push({ label: '', kind: 'text' }); paint(); };
      sb.querySelector('#pgSave').onclick = () => {
        read(); if (!page.name) return NX.toast('Give your page a name');
        page.fields = page.fields.filter(f => f.label.trim() || f.kind === 'progress' || f.kind === 'check');
        const i = NX.mx.pages.findIndex(x => x.id === page.id); if (i >= 0) NX.mx.pages[i] = page; else NX.mx.pages.push(page);
        NX.saveMx(); NX.syncPages(); NX.renderNav(); NX.closeSheet(); NX.go(page.id); NX.toast(p ? 'Page saved ✦' : 'New page created ✦'); NX.droid && NX.droid.say(`New page “${page.name}” is live!`);
      };
      const del = sb.querySelector('#pgDel'); if (del) del.onclick = () => { if (!confirm(`Delete the “${page.name}” page and its ${NX.list(page.id).length} items?`)) return; NX.mx.pages = NX.mx.pages.filter(x => x.id !== page.id); NX.data.records = NX.data.records.filter(r => r.type !== page.id); NX.save(); NX.saveMx(); NX.syncPages(); NX.renderNav(); NX.closeSheet(); NX.go('home'); };
    };
    paint();
  };

  /* world switch with a wipe */
  NX.worldSwitch = () => {
    const wipe = document.createElement('div'); wipe.className = 'wx-wipe'; document.body.append(wipe);
    setTimeout(() => { NX.applyWorld(); NX.go(NX.current, false); }, reduced() ? 0 : 380);
    setTimeout(() => wipe.remove(), 1100);
    NX.droid && setTimeout(() => NX.droid.say(`Welcome to ${NX.world().name}.`, true), 700);
  };

  /* ---------- intro ---------- */
  NX.runIntro = (replay) => {
    NX.worldsInit();
    const boot = document.getElementById('boot');
    const word = 'MANAS-ONE811';
    boot.className = ''; boot.innerHTML = `<div class="in-stage">
      <svg class="in-rings" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="160"/><circle cx="200" cy="200" r="130"/><circle cx="200" cy="200" r="100"/></svg>
      <div class="in-word" aria-label="${word}">${[...word].map((c, i) => `<span style="--i:${i};--rx:${(Math.sin(i * 7.3) * 220).toFixed(0)}px;--ry:${(Math.cos(i * 3.1) * 160).toFixed(0)}px;--rr:${(Math.sin(i * 5) * 90).toFixed(0)}deg">${c}</span>`).join('')}</div>
      <div class="in-sub mono">personal universe · booting worlds</div>
      <div class="in-bar"><i></i></div><div class="in-code mono" id="inCode"></div>
      <button class="in-skip mono" type="button">tap to skip ›</button></div><i class="in-cur l"></i><i class="in-cur r"></i>`;
    const lines = ['init core.811', 'mount worlds[13]', 'calibrate droid ONE-811', 'sync memories', 'ready.'];
    let li = 0; const code = boot.querySelector('#inCode'); const ci = setInterval(() => { if (code) code.textContent = '> ' + lines[Math.min(li++, lines.length - 1)]; }, 520);
    let done = false;
    const finish = () => {
      if (done) return; done = true; clearInterval(ci);
      boot.classList.add('out');
      setTimeout(() => { boot.classList.add('gone'); boot.innerHTML = ''; }, 1000);
      NX.opening();
    };
    boot.querySelector('.in-skip').onclick = finish; boot.onclick = finish;
    setTimeout(finish, reduced() ? 300 : 3300);
  };
  NX.opening = () => {
    document.body.classList.add('wx-opening');
    NX.go(NX.current, false);
    setTimeout(() => document.body.classList.remove('wx-opening'), 2600);
    NX.droid && NX.droid.arrive();
  };

  /* ---------- init: hooks into router, secret entry ---------- */
  let inited = false;
  NX.worldsInit = () => {
    if (inited) return; inited = true;
    const view = document.getElementById('view');
    const origGo = NX.go, origHome = NX.renderHome;
    NX.renderHome = v => { origHome(v); const hero = v.querySelector('.hero'); (hero || v.firstChild)?.insertAdjacentHTML(hero ? 'afterend' : 'beforebegin', NX.reactorHTML()); clockTick(); };
    NX.mod('home').render = v => NX.renderHome(v);
    NX.go = (id, push = true) => {
      if (id === '__studio') return NX.openStudio();
      origGo(id, push);
      const m = NX.mod(NX.current);
      view.dataset.pl = (m && NX.mx.pageLayout[m.id]) || 'list';
      view.dataset.page = NX.current;
      view.classList.remove('wx-go'); void view.offsetWidth; view.classList.add('wx-go');
      NX.animateView(view);
      nav.querySelectorAll('.wn-i').forEach(b => b.classList.toggle('on', b.dataset.wgo === NX.current));
      const cur = nav.querySelector('.wn-cur'); if (cur) cur.textContent = m?.name || 'Command';
      const ci = nav.querySelector('#wnCmd'); if (ci) { ci.value = ''; ci.placeholder = `go ${(m?.name || 'command').toLowerCase()}  ·  try: tasks, music, studio`; }
      placeGlider(); NX.applyWall();
      NX.droid && NX.droid.onPage(NX.current);
    };
    // Reliable, hidden Secret Vault entry: long-press the top emblem (no text selection / copy), or type 811.
    const old = document.getElementById('sigil'), sig = old.cloneNode(true); old.replaceWith(sig);
    let ht, held = false;
    const start = e => { if (e.button > 0) return; e.preventDefault(); held = false; sig.classList.add('charging'); ht = setTimeout(() => { held = true; sig.classList.remove('charging'); NX.haptic && NX.haptic([20, 40, 20]); NX.go('world'); }, 1500); };
    const stop = () => { sig.classList.remove('charging'); clearTimeout(ht); };
    sig.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => sig.addEventListener(ev, stop));
    sig.addEventListener('click', () => { if (!held && NX.current !== 'home') NX.go('home'); held = false; });
    ['contextmenu', 'selectstart', 'dragstart'].forEach(ev => sig.addEventListener(ev, e => e.preventDefault()));
    let buf = '';
    addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return; buf = (buf + e.key).slice(-3); if (buf === '811') { buf = ''; NX.go('world'); } });
    document.getElementById('worldsTop')?.addEventListener('click', () => NX.go('worlds'));
    // hide the old navigation ring permanently
    document.getElementById('orbit')?.setAttribute('hidden', '');
    document.getElementById('orbitVeil')?.setAttribute('hidden', '');
    NX.layoutNav = () => {};
    NX.applyWorld();
  };
})();
