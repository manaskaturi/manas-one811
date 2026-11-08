/* =========================================================
   ONE-811 — your astromech-style droid companion.
   Rolls in after the intro, tracks your cursor, swivels its dome,
   chirps, talks about your day and gives shortcuts. Drag it anywhere.
   ========================================================= */
(function () {
  const POS = 'manas.droidpos';
  const el = document.createElement('div');
  el.id = 'droid'; el.className = 'dr hidden';
  el.innerHTML = `
  <div class="dr-bubble" role="status" aria-live="polite"><p id="drText"></p><div class="dr-menu" id="drMenu"></div></div>
  <button class="dr-bot" type="button" aria-label="ONE-811 droid — tap to talk">
  <svg viewBox="0 0 120 160" aria-hidden="true">
    <defs>
      <linearGradient id="drMetal" x1="0" x2="1"><stop offset="0" stop-color="var(--dr-shade)"/><stop offset=".35" stop-color="var(--dr-body)"/><stop offset=".7" stop-color="var(--dr-body)"/><stop offset="1" stop-color="var(--dr-shade)"/></linearGradient>
      <linearGradient id="drDome" x1="0" x2="1"><stop offset="0" stop-color="var(--dr-shade)"/><stop offset=".4" stop-color="var(--dr-chrome)"/><stop offset="1" stop-color="var(--dr-shade)"/></linearGradient>
      <radialGradient id="drLens"><stop offset="0" stop-color="var(--a1)"/><stop offset=".45" stop-color="#0b0f18"/><stop offset="1" stop-color="#000"/></radialGradient>
      <clipPath id="drDomeClip"><path d="M26 64 A34 34 0 0 1 94 64 Z"/></clipPath>
    </defs>
    <ellipse class="dr-shadow" cx="60" cy="152" rx="44" ry="5"/>
    <g class="dr-legs">
      <path class="dr-leg" d="M8 70 h14 v66 l6 12 h-26 l6 -12 z"/>
      <path class="dr-leg" d="M98 70 h14 v66 l6 12 h-26 l6 -12 z"/>
      <rect class="dr-acc" x="11" y="78" width="8" height="18" rx="2"/><rect class="dr-acc" x="101" y="78" width="8" height="18" rx="2"/>
      <circle class="dr-bolt" cx="15" cy="72" r="3"/><circle class="dr-bolt" cx="105" cy="72" r="3"/>
    </g>
    <g class="dr-body-g">
      <path d="M50 134 h20 l4 14 h-28 z" class="dr-leg"/>
      <rect x="26" y="62" width="68" height="74" rx="9" fill="url(#drMetal)" class="dr-hull"/>
      <rect class="dr-acc" x="34" y="72" width="22" height="10" rx="2"/>
      <rect class="dr-acc" x="62" y="72" width="24" height="5" rx="2"/><rect class="dr-acc soft" x="62" y="80" width="24" height="3" rx="1.5"/>
      <rect class="dr-acc" x="34" y="90" width="10" height="34" rx="2"/>
      <rect class="dr-vent" x="48" y="90" width="38" height="3" rx="1.5"/><rect class="dr-vent" x="48" y="96" width="38" height="3" rx="1.5"/><rect class="dr-vent" x="48" y="102" width="38" height="3" rx="1.5"/>
      <circle class="dr-led l1" cx="54" cy="116" r="3"/><circle class="dr-led l2" cx="63" cy="116" r="3"/><circle class="dr-led l3" cx="72" cy="116" r="3"/>
      <text x="60" y="131" class="dr-tag">811</text>
    </g>
    <g class="dr-head">
      <path d="M26 64 A34 34 0 0 1 94 64 Z" fill="url(#drDome)" class="dr-domeshape"/>
      <g clip-path="url(#drDomeClip)"><g class="dr-panels">
        <rect class="dr-acc" x="20" y="44" width="12" height="9" rx="1"/><rect class="dr-acc" x="88" y="44" width="12" height="9" rx="1"/>
        <rect class="dr-acc" x="36" y="56" width="10" height="7"/><rect class="dr-acc" x="74" y="56" width="10" height="7"/>
        <rect class="dr-acc" x="51" y="30" width="18" height="5" rx="1"/>
        <circle cx="60" cy="47" r="9" class="dr-eyering"/><circle cx="60" cy="47" r="6.5" fill="url(#drLens)" class="dr-eye"/><circle cx="57.6" cy="44.6" r="1.8" class="dr-glint"/>
        <circle cx="80" cy="54" r="2.6" class="dr-holo"/><circle cx="41" cy="40" r="2" class="dr-red"/>
        <rect class="dr-acc" x="-12" y="44" width="12" height="9" rx="1"/><rect class="dr-acc" x="120" y="44" width="12" height="9" rx="1"/>
      </g></g>
      <rect x="25" y="62" width="70" height="4" rx="2" class="dr-collar"/>
    </g>
  </svg></button>`;
  document.body.append(el);
  const bot = el.querySelector('.dr-bot'), panels = el.querySelector('.dr-panels'), bubble = el.querySelector('.dr-bubble'), text = el.querySelector('#drText'), menu = el.querySelector('#drMenu');
  try { const p = JSON.parse(localStorage.getItem(POS) || 'null'); if (p) { el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.classList.add('placed'); } } catch (e) {}

  addEventListener('resize', () => { if (!el.classList.contains('placed')) return; const x = Math.min(parseInt(el.style.left) || 0, innerWidth - 90), y = Math.min(parseInt(el.style.top) || 0, innerHeight - 110); el.style.left = Math.max(4, x) + 'px'; el.style.top = Math.max(4, y) + 'px'; }, { passive: true });
  /* sound — chirps synthesised live, only after you interact */
  let ac = null;
  const chirp = (n = 5 + Math.floor(Math.random() * 4)) => {
    if (!NX.mx.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      let t = ac.currentTime;
      for (let i = 0; i < n; i++) {
        const o = ac.createOscillator(), g = ac.createGain(), d = .05 + Math.random() * .09;
        o.type = Math.random() > .5 ? 'square' : 'sine';
        const f0 = 700 + Math.random() * 2200, f1 = 700 + Math.random() * 2600;
        o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + d);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .02); t += d + Math.random() * .04;
      }
    } catch (e) {}
  };

  /* dome swivel + eye tracking */
  let look = 0, target = 0, spinning = false;
  const frame = () => { look += (target - look) * .12; panels.setAttribute('transform', `translate(${look.toFixed(2)} 0)`); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  addEventListener('pointermove', e => {
    if (spinning) return; const r = bot.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2);
    target = Math.max(-16, Math.min(16, dx / 22));
    el.classList.toggle('near', Math.hypot(dx, e.clientY - (r.top + r.height / 2)) < 140);
  }, { passive: true });
  const spin = () => { if (spinning) return; spinning = true; let k = 0; const iv = setInterval(() => { target = Math.sin(k / 3) * 26; k++; if (k > 30) { clearInterval(iv); spinning = false; target = 0; } }, 50); };
  setInterval(() => { if (!spinning && Math.random() > .55) target = (Math.random() - .5) * 30; if (Math.random() > .93) { spin(); } }, 2600);

  /* keep the speech bubble on the side of the screen that has room */
  const place = () => {
    const r = bot.getBoundingClientRect();
    el.dataset.side = r.left + r.width / 2 > innerWidth / 2 ? 'left' : 'right';
    el.dataset.v = r.top < 300 ? 'below' : 'above';
  };
  addEventListener('resize', place, { passive: true });
  /* talking */
  let hideT;
  const say = (msg, beep, actions) => {
    if (!NX.mx.droid) return;
    text.textContent = ''; menu.innerHTML = ''; place();
    bubble.classList.add('show'); el.classList.add('talk'); clearTimeout(hideT);
    let i = 0; const typer = setInterval(() => { text.textContent = msg.slice(0, ++i); if (i >= msg.length) { clearInterval(typer); el.classList.remove('talk'); } }, 18);
    if (actions) menu.innerHTML = actions.map(([k, l]) => `<button type="button" data-dr="${k}">${l}</button>`).join('');
    if (beep) chirp();
    hideT = setTimeout(() => bubble.classList.remove('show'), actions ? 9000 : 4200);
  };
  const greet = () => { const h = new Date().getHours(), n = NX.prefs.name || 'Manas'; return h < 5 ? `Bweep! Still up, ${n}? Let's make the night count.` : h < 12 ? `Good morning, ${n}! Systems green. Ready to roll.` : h < 17 ? `Afternoon, ${n}. Momentum looks good from here.` : `Evening, ${n}. Want me to line up tomorrow?`; };
  const pageLine = id => {
    const t = NX.today(), open = NX.list('task').filter(x => !['Completed', 'Cancelled'].includes(x.status));
    const over = open.filter(x => x.dueDate && x.dueDate < t).length;
    const L = {
      home: `${open.length} open tasks${over ? `, ${over} overdue` : ''}. The reactor is spinning.`,
      tasks: open.length ? `${open.length} to go. Tap the circle to complete one!` : 'Zero open tasks. Bee-doo! Add one with +.',
      goals: 'Goals locked on target. Update progress to charge the reactor.',
      fitness: `${NX.list('workout').length} workouts logged. Strength levels rising.`,
      music: 'Ooh, music! Play something and I will dance.',
      gallery: 'Photo memories loaded. Tap any photo for full screen.',
      finance: 'Counting rupees… beep boop. Spending is on screen.',
      memories: 'Memories are my favourite data type.',
      settings: 'Psst — the Studio has 13 worlds and 14 navigations.',
    };
    return L[id] || (NX.mod(id)?.custom ? `Your custom page “${NX.mod(id).name}”. Add something with +.` : '');
  };
  const actions = [['all', '❖ All worlds'], ['world', '🎲 Surprise world'], ['studio', '✺ Studio'], ['page', '＋ New page'], ['add', '✚ Quick add'], ['nav', '☰ Change nav'], ['hide', 'Sleep']];
  menu.addEventListener('click', e => {
    const b = e.target.closest('[data-dr]'); if (!b) return; e.stopPropagation(); bubble.classList.remove('show'); chirp(3);
    const k = b.dataset.dr;
    if (k === 'world') { const others = NX.worlds.filter(w => w.id !== NX.mx.world); NX.mx.world = others[Math.floor(Math.random() * others.length)].id; NX.saveMx(); NX.worldSwitch(); spin(); }
    if (k === 'all') NX.go('worlds');
    if (k === 'studio') NX.openStudio('worlds');
    if (k === 'nav') NX.openStudio('nav');
    if (k === 'page') NX.editPage();
    if (k === 'add') NX.openQuickAdd();
    if (k === 'hide') { NX.mx.droid = false; NX.saveMx(); api.toggle(false); NX.toast('ONE-811 is sleeping — wake it in Studio › Motion'); }
  });

  /* drag + tap + hidden hold */
  let drag = null, holdT = null;
  bot.addEventListener('pointerdown', e => {
    e.preventDefault(); bot.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(); drag = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    holdT = setTimeout(() => { if (drag && !drag.moved) { drag.held = true; chirp(8); spin(); NX.go('world'); } }, 2200);
  });
  bot.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return; drag.moved = true; clearTimeout(holdT);
    const x = Math.max(4, Math.min(innerWidth - 90, drag.ox + dx)), y = Math.max(4, Math.min(innerHeight - 110 - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hg')) || 0), drag.oy + dy));
    el.classList.add('placed', 'dragging'); el.style.left = x + 'px'; el.style.top = y + 'px'; place();
  });
  const up = () => {
    clearTimeout(holdT); if (!drag) return; const d = drag; drag = null; el.classList.remove('dragging');
    if (d.moved) { localStorage.setItem(POS, JSON.stringify({ x: parseInt(el.style.left), y: parseInt(el.style.top) })); return; }
    if (d.held) return;
    el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop');
    if (bubble.classList.contains('show') && menu.children.length) { bubble.classList.remove('show'); return; }
    const lines = [greet(), 'What should we do next?', 'Beep-bwoop! Pick a mission:', 'I can change the whole website. Try a surprise world!'];
    say(lines[Math.floor(Math.random() * lines.length)], true, actions);
  };
  bot.addEventListener('pointerup', up); bot.addEventListener('pointercancel', up);
  ['contextmenu', 'selectstart'].forEach(ev => bot.addEventListener(ev, e => e.preventDefault()));

  let lastPage = '';
  const api = {
    say,
    toggle(on) { el.classList.toggle('hidden', !on); if (on) api.arrive(); },
    arrive() {
      if (!NX.mx.droid) return;
      el.classList.remove('hidden', 'arrive'); void el.offsetWidth; el.classList.add('arrive');
      setTimeout(() => { spin(); say(greet(), false, actions); }, 1500);
    },
    onPage(id) {
      if (id === lastPage || !NX.mx.droid || el.classList.contains('hidden')) return; lastPage = id;
      el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop');
      if (id === 'world') { bubble.classList.remove('show'); return; }
      const l = pageLine(id); if (l && document.getElementById('boot')?.classList.contains('gone')) say(l);
    },
  };
  NX.droid = api;
})();
