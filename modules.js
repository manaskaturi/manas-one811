/* =========================================================
   MODULES — the whole app is described here.
   To add a new module, add one object to NX.modules:
     { id, name, icon, type, fields, sub(record), filter }
   It instantly appears in the Orbit nav, search, and quick-add.
   Modules with a custom render(view) draw their own screen.
   ========================================================= */
const P = ['Low', 'Medium', 'High'];

NX.modules = [
  { id: 'home', name: 'Command', icon: '◉', render: v => NX.renderHome(v) },
  { id: 'tasks', name: 'Tasks', icon: '◇', type: 'task', filter: 'status', check: true,
    fields: [['title', 'Task', 'text', 1], ['description', 'Details', 'textarea'], ['status', 'Status', 'select', ['Not started', 'In progress', 'Waiting', 'Completed', 'Cancelled']],
      ['priority', 'Priority', 'select', P], ['dueDate', 'Due', 'date'], ['category', 'Category', 'text'], ['project', 'Project', 'text']],
    sub: r => [r.priority, r.dueDate && 'due ' + NX.fmtDate(r.dueDate), r.project].filter(Boolean).join(' · ') },
  { id: 'goals', name: 'Goals', icon: '◎', type: 'goal', filter: 'category', progress: true,
    fields: [['title', 'Goal', 'text', 1], ['description', 'Why it matters', 'textarea'], ['category', 'Category', 'select', ['Personal', 'Fitness', 'Career', 'Financial', 'Learning', 'Business', 'Lifestyle']],
      ['status', 'Status', 'select', ['Not started', 'In progress', 'Completed', 'Paused']], ['progress', 'Progress %', 'number'], ['targetDate', 'Target date', 'date'], ['notes', 'Milestones / notes', 'textarea']],
    sub: r => [r.category, r.targetDate && 'by ' + NX.fmtDate(r.targetDate)].filter(Boolean).join(' · ') },
  { id: 'projects', name: 'Projects', icon: '▲', type: 'project', filter: 'category', progress: true,
    fields: [['title', 'Project', 'text', 1], ['description', 'Description', 'textarea'], ['category', 'Type', 'select', ['Personal', 'Coding', 'Business', 'Lifestyle']],
      ['status', 'Status', 'select', ['Planning', 'Active', 'On hold', 'Completed', 'Archived']], ['priority', 'Priority', 'select', P], ['progress', 'Progress %', 'number'], ['dueDate', 'Deadline', 'date'], ['url', 'Link', 'url'], ['notes', 'Notes', 'textarea']],
    sub: r => [r.category, r.status].filter(Boolean).join(' · ') },
  { id: 'notes', name: 'Notes', icon: '≡', type: 'note', filter: 'category',
    fields: [['title', 'Title', 'text', 1], ['description', 'Write…', 'textarea'], ['category', 'Category', 'text'], ['tags', 'Tags', 'text'], ['url', 'Link', 'url']],
    sub: r => (r.description || '').slice(0, 70) },
  { id: 'fitness', name: 'Fitness', icon: '⚡', type: 'workout', filter: 'category',
    fields: [['title', 'Session', 'text', 1], ['category', 'Split / focus', 'select', ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full body', 'Cardio', 'Mobility']], ['date', 'Date', 'date'],
      ['exercise', 'Exercises', 'textarea'], ['sets', 'Sets', 'number'], ['reps', 'Reps', 'number'], ['weight', 'Top weight (kg)', 'number'], ['bodyweight', 'Bodyweight (kg)', 'number'], ['notes', 'Notes', 'textarea']],
    sub: r => [NX.fmtDate(r.date), r.category, r.weight && r.weight + 'kg'].filter(Boolean).join(' · ') },
  { id: 'supplements', name: 'Stack', icon: '✚', type: 'supplement',
    fields: [['title', 'Supplement', 'text', 1], ['brand', 'Brand', 'text'], ['dose', 'Daily dose', 'text'], ['purchaseDate', 'Bought on', 'date'], ['price', 'Price ₹', 'number'], ['remaining', 'Servings left', 'number'], ['url', 'Reorder link', 'url'], ['notes', 'Notes', 'textarea']],
    sub: r => [r.brand, r.remaining !== undefined && r.remaining !== '' && r.remaining + ' left', r.price && NX.money(r.price)].filter(Boolean).join(' · ') },
  { id: 'finance', name: 'Money', icon: '₹', type: 'transaction', filter: 'kind',
    fields: [['title', 'Description', 'text', 1], ['amount', 'Amount ₹', 'number', 1], ['kind', 'Type', 'select', ['Expense', 'Income']], ['category', 'Category', 'select', ['Food', 'Gym', 'Supplements', 'Tech', 'Travel', 'Bills', 'Shopping', 'Dates', 'Salary', 'Freelance', 'Other']], ['date', 'Date', 'date'], ['notes', 'Notes', 'textarea']],
    sub: r => [r.kind, r.category, NX.fmtDate(r.date)].filter(Boolean).join(' · '), right: r => `<span class="pill" style="color:${r.kind === 'Income' ? 'var(--a2)' : 'var(--text)'}">${r.kind === 'Income' ? '+' : '−'}${NX.money(r.amount)}</span>`,
    head: v => NX.financeHead() },
  { id: 'music', name: 'Music', icon: '♫', type: 'music', render: v => NX.renderMusic(v),
    fields: [['title', 'Track / album', 'text', 1], ['artist', 'Artist', 'text'], ['mood', 'Mood', 'select', ['Hype', 'Focus', 'Chill', 'Love', 'Sad', 'Gym']], ['genre', 'Genre', 'text'], ['rating', 'Personal rating (1–5)', 'number'], ['favourite', 'Favourite', 'select', ['No', 'Yes']], ['playlist', 'Playlist', 'text'], ['url', 'Spotify / YouTube link', 'url'], ['memory', 'Memory attached', 'textarea']],
    sub: r => [r.artist, r.mood].filter(Boolean).join(' · ') },
  { id: 'memories', name: 'Memories', icon: '✧', type: 'memory',
    fields: [['title', 'Moment', 'text', 1], ['date', 'Date', 'date'], ['place', 'Place', 'text'], ['url', 'Photo / album link', 'url'], ['description', 'Story', 'textarea']],
    sub: r => [NX.fmtDate(r.date), r.place].filter(Boolean).join(' · ') },
  { id: 'learning', name: 'Learn', icon: '⌘', type: 'learning', filter: 'status', progress: true,
    fields: [['title', 'Topic / course', 'text', 1], ['category', 'Area', 'select', ['Coding', 'Design', 'Business', 'Fitness', 'Other']], ['status', 'Status', 'select', ['Queued', 'Learning', 'Done']], ['progress', 'Progress %', 'number'], ['url', 'Resource link', 'url'], ['notes', 'Notes', 'textarea']],
    sub: r => [r.category, r.status].filter(Boolean).join(' · ') },
  { id: 'business', name: 'Clients', icon: '◈', type: 'client', filter: 'status',
    fields: [['title', 'Client / lead', 'text', 1], ['contact', 'Contact', 'text'], ['status', 'Stage', 'select', ['Lead', 'Talking', 'Proposal', 'Active', 'Done', 'Lost']], ['value', 'Deal value ₹', 'number'], ['nextStep', 'Next step', 'text'], ['notes', 'Notes', 'textarea']],
    sub: r => [r.status, r.value && NX.money(r.value), r.nextStep].filter(Boolean).join(' · ') },
  { id: 'gallery', name: 'Gallery', icon: '▧', render: v => NX.renderGallery(v) },
  { id: 'world', name: 'Our World', icon: '♡', render: v => NX.renderWorld(v) },
  { id: 'insights', name: 'Insights', icon: '⌁', render: v => NX.renderInsights(v) },
  { id: 'guide', name: 'Learning Centre', icon: '☉', render: v => NX.renderGuide(v) },
  { id: 'settings', name: 'Aura', icon: '✺', render: v => NX.renderSettings(v) },
];
NX.mod = id => NX.modules.find(m => m.id === id);

/* ---------- generic list screen used by every data module ---------- */
NX.state = { filter: {} };
NX.renderList = (m, v) => {
  let items = NX.list(m.type);
  const f = NX.state.filter[m.id];
  const opts = m.filter ? [...new Set(items.map(r => r[m.filter]).filter(Boolean))] : [];
  if (f) items = items.filter(r => r[m.filter] === f);
  v.innerHTML = `
    <section class="hero"><div class="mono dim">${NX.list(m.type).length} records</div><h1>${m.name}<em>.</em></h1></section>
    ${m.head ? m.head(v) : ''}
    ${opts.length ? `<div class="chips"><button class="chip ${!f ? 'on' : ''}" data-filter="">All</button>${opts.map(o => `<button class="chip ${f === o ? 'on' : ''}" data-filter="${NX.esc(o)}">${NX.esc(o)}</button>`).join('')}</div>` : '<div></div>'}
    <div class="rows">${items.length ? items.map(r => NX.rowHTML(m, r)).join('') : `<div class="empty">Nothing here yet.<br><br><button class="btn small" data-add="${m.id}">+ Add first</button></div>`}</div>`;
  v.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { NX.state.filter[m.id] = b.dataset.filter; NX.go(m.id); });
};
NX.rowHTML = (m, r) => {
  const done = m.check && r.status === 'Completed';
  return `<div class="row ${done ? 'done' : ''}" data-open="${r.id}" data-mod="${m.id}">
    ${m.check ? `<button class="check ${done ? 'on' : ''}" data-toggle="${r.id}" aria-label="Complete"></button>` : ''}
    ${r.photos?.length ? `<img class="row-photo" src="${NX.photoSource(r.photos[0])}" alt="">` : ''}<div class="grow"><div class="t">${NX.esc(r.title)}</div><div class="s">${NX.esc(m.sub ? m.sub(r) : '')}</div>${m.progress ? NX.bar(r.progress) : ''}</div>
    ${m.right ? m.right(r) : (NX.safeLink(r.url) ? `<a class="pill" href="${NX.esc(NX.safeLink(r.url))}" target="_blank" rel="noopener" onclick="event.stopPropagation()">open ↗</a>` : '')}
  </div>`;
};
NX.editRecord = (m, r = {}) => NX.form({
  title: (r.id ? 'Edit ' : 'New ') + m.name.toLowerCase(), fields: m.fields, record: r,
  onSave: rec => { NX.upsert({ ...rec, type: m.type }); NX.go(NX.current); },
  onDelete: r.id ? () => { NX.remove(r.id); NX.go(NX.current); } : null,
});

NX.monthTotals = () => {
  const ym = NX.today().slice(0, 7); let inc = 0, exp = 0;
  NX.list('transaction').filter(t => (t.date || '').startsWith(ym)).forEach(t => t.kind === 'Income' ? inc += +t.amount || 0 : exp += +t.amount || 0);
  return { inc, exp };
};
NX.financeHead = () => {
  const { inc, exp } = NX.monthTotals();
  setTimeout(async () => {
    const r = await NX.api.rates(), el = document.getElementById('fxBox');
    if (el && r) el.innerHTML = `<div class="mono dim">Live rates · ₹1 =</div><div style="margin-top:8px">$${r.USD.toFixed(4)} · €${r.EUR.toFixed(4)} · £${r.GBP.toFixed(4)} · AED ${r.AED.toFixed(3)}</div>`;
  });
  return `<div class="grid" style="margin-bottom:14px"><div class="shard"><div class="mono dim">In · this month</div><div class="stat">${NX.money(inc)}</div></div>
    <div class="shard"><div class="mono dim">Out · this month</div><div class="stat">${NX.money(exp)}</div></div>
    <div class="shard wide" id="fxBox"><div class="mono dim">Fetching live rates…</div></div></div>`;
};

/* Home dashboard lives in js/dashboard.js */

/* ---------- Settings / Aura ---------- */
NX.renderSettings = v => {
  if (!document.getElementById('fontPreview')) document.head.insertAdjacentHTML('beforeend', `<link id="fontPreview" rel="stylesheet" href="https://fonts.googleapis.com/css2?${NX.fonts.map(f => f[5]).join('&')}&display=swap">`);
  v.innerHTML = `
    <section class="hero"><div class="mono dim">Personalise</div><h1>Aura<em>.</em></h1></section>
    <div class="section-h"><h2>Theme</h2></div>
    <div class="swatches">${NX.themes.map(([id, name, c]) => `<button class="swatch ${NX.prefs.theme === id ? 'on' : ''}" data-theme-pick="${id}" style="background:${c[0]}">
      <div class="dots">${c.slice(1).map(x => `<i style="background:${x};box-shadow:0 0 12px ${x}"></i>`).join('')}</div><b style="color:${c[1]}">${name}</b></button>`).join('')}</div>
    <div class="section-h"><h2>Design systems</h2></div>
    <p class="dim tiny">Original MANAS-ONE811 interface presets, each with its own color, type, and layout character.</p>
    <div class="preset-grid">
      <button class="preset-card" data-preset="apple"><b>Cupertino</b><small>Apple-inspired · airy precision</small></button>
      <button class="preset-card" data-preset="linear"><b>Linear</b><small>Dense dark · sharp hierarchy</small></button>
      <button class="preset-card" data-preset="notion"><b>Paperline</b><small>Notion-inspired · calm modular</small></button>
      <button class="preset-card" data-preset="arc"><b>Arc</b><small>Layered glass · playful surfaces</small></button>
      <button class="preset-card" data-preset="vercel"><b>Vercel</b><small>Monochrome · technical clarity</small></button>
      <button class="preset-card" data-preset="raycast"><b>Raycast</b><small>Command-first · compact controls</small></button>
    </div>
    <div class="section-h"><h2>Layout mode</h2></div>
    <div class="layout-choices">
      <button class="layout-choice ${NX.prefs.layout === 'classic' ? 'on' : ''}" data-layout="classic"><span class="layout-preview classic-preview"><i></i><i></i><i></i></span><b>Orbit</b><small>Original balanced layout</small></button>
      <button class="layout-choice ${NX.prefs.layout === 'light' ? 'on' : ''}" data-layout="light"><span class="layout-preview light-preview"><i></i><i></i><i></i></span><b>Studio</b><small>Bright, clean workspace</small></button>
      <button class="layout-choice ${NX.prefs.layout === 'sleek' ? 'on' : ''}" data-layout="sleek"><span class="layout-preview sleek-preview"><i></i><i></i><i></i></span><b>Monolith</b><small>Minimal black · soft-edge cards</small></button>
      <button class="layout-choice ${NX.prefs.layout === 'bento' ? 'on' : ''}" data-layout="bento"><span class="layout-preview bento-preview"><i></i><i></i><i></i></span><b>Bento</b><small>Modular, compact card grid</small></button>
      <button class="layout-choice ${NX.prefs.layout === 'editorial' ? 'on' : ''}" data-layout="editorial"><span class="layout-preview editorial-preview"><i></i><i></i><i></i></span><b>Editorial</b><small>Quiet typography, spacious lists</small></button>
    </div>
    <div class="section-h"><h2>Shape & surfaces</h2></div>
    <div class="shard wide"><label class="field"><span class="mono dim">CARD CORNER ROUNDING</span><input id="radiusControl" type="range" min="8" max="34" value="${NX.prefs.radius ?? 20}"></label>
    <label class="field"><span class="mono dim">BORDER INTENSITY</span><input id="borderControl" type="range" min="0" max="100" value="${NX.prefs.border ?? 35}"></label>
    <label class="field"><span class="mono dim">CARD DENSITY</span><select id="densityControl"><option value="comfortable" ${NX.prefs.density !== 'compact' ? 'selected' : ''}>Comfortable</option><option value="compact" ${NX.prefs.density === 'compact' ? 'selected' : ''}>Compact</option></select></label>
    <label class="field"><span class="mono dim">CUSTOM ACCENT COLOUR</span><input id="accentControl" type="color" value="${NX.prefs.accent || '#8da8c8'}"></label></div>
    <div class="section-h"><h2>Navigation style</h2></div>
    <div class="nav-mode-grid">
      <button class="layout-choice" data-navmode="dock"><b>Dock</b><small>Horizontal navigation</small></button>
      <button class="layout-choice" data-navmode="rail"><b>Side rail</b><small>Vertical icon navigation</small></button>
      <button class="layout-choice" data-navmode="top"><b>Command bar</b><small>Top horizontal menu</small></button>
      <button class="layout-choice" data-navmode="orbit"><b>Orbit menu</b><small>Expandable module grid</small></button>
    </div>
    <div class="section-h"><h2>Background treatment</h2></div>
    <div class="chips">
      <button class="chip ${NX.prefs.backdrop === 'ambient' ? 'on' : ''}" data-backdrop="ambient">Ambient</button>
      <button class="chip ${NX.prefs.backdrop === 'grid' ? 'on' : ''}" data-backdrop="grid">Architectural grid</button>
      <button class="chip ${NX.prefs.backdrop === 'plain' ? 'on' : ''}" data-backdrop="plain">Plain</button>
    </div>
    <div class="section-h"><h2>Typeface</h2></div>
    <div class="opt-grid">${NX.fonts.map(([id, name, h, b]) => `<button class="opt ${NX.prefs.font === id ? 'on' : ''}" data-font-pick="${id}"><div class="big" style="font-family:${h.includes(',') ? h : `'${h}'`}">Aa 42</div><b style="font-family:${b.includes(',') ? b : `'${b}'`}">${name}</b><div class="dim" style="font-size:11px">${h.includes(',') ? 'System font' : h + ' + ' + b}</div></button>`).join('')}</div>
    <div class="section-h"><h2>Text size</h2></div>
    <div class="chips">${NX.sizes.map(([z, n]) => `<button class="chip ${NX.prefs.zoom === z ? 'on' : ''}" data-zoom="${z}">${n}</button>`).join('')}</div>
    <div class="section-h"><h2>Background particles</h2></div>
    <div class="chips"><button class="chip ${NX.prefs.aura ? 'on' : ''}" data-aura="1">On</button><button class="chip ${!NX.prefs.aura ? 'on' : ''}" data-aura="0">Off</button></div>
    <div class="section-h"><h2>You</h2></div>
    <div class="shard wide"><form id="prefForm">${NX.fieldHTML(['name', 'Your name', 'text'], NX.prefs.name)}${NX.fieldHTML(['city', 'City for weather', 'text'], NX.prefs.city)}<button class="btn solid">Save</button></form></div>
    <div class="section-h"><h2>Your data</h2></div>
    <div class="shard wide"><p class="dim" style="margin-top:0">Everything is stored only on this device. Export a backup regularly.</p>
      <div class="actions" style="justify-content:flex-start"><button class="btn small" id="exp">Export backup</button><button class="btn small" id="demoOn">Load demo data</button><button class="btn small" id="demoOff">Clear demo data</button><button class="btn small" id="resetAppearance">Reset appearance</button><button class="btn small" id="resetWorkspace">Safe reset workspace</button><label class="btn small">Import<input type="file" id="imp" accept=".json" hidden></label></div></div>
    <p class="mono dim" style="text-align:center;margin-top:30px">MANAS-ONE811 · workspace</p>`;
  v.querySelectorAll('[data-theme-pick]').forEach(b => b.onclick = () => { NX.setTheme(b.dataset.themePick); NX.go('settings', false); });
  v.querySelectorAll('[data-layout]').forEach(b => b.onclick = () => { NX.prefs.layout = b.dataset.layout; NX.applyPrefs(); NX.go('settings', false); });
  v.querySelectorAll('[data-backdrop]').forEach(b => b.onclick = () => { NX.prefs.backdrop = b.dataset.backdrop; NX.applyPrefs(); NX.go('settings', false); });
  const visualPresets = {
    apple:{theme:'chrome',layout:'light',font:'apple',navMode:'top',backdrop:'plain',radius:24,border:18,density:'comfortable',accent:'#8da8c8'},
    linear:{theme:'chrome',layout:'sleek',font:'geist',navMode:'rail',backdrop:'plain',radius:14,border:24,density:'compact',accent:'#9b9ba8'},
    notion:{theme:'paper',layout:'editorial',font:'plusjakarta',navMode:'rail',backdrop:'plain',radius:12,border:20,density:'comfortable',accent:'#77746c'},
    arc:{theme:'abyss',layout:'bento',font:'manas',navMode:'top',backdrop:'ambient',radius:28,border:38,density:'comfortable',accent:'#68d9d0'},
    vercel:{theme:'chrome',layout:'sleek',font:'geist',navMode:'top',backdrop:'grid',radius:12,border:30,density:'compact',accent:'#d8e0ec'},
    raycast:{theme:'ultraviolet',layout:'bento',font:'ibmplex',navMode:'top',backdrop:'plain',radius:16,border:32,density:'compact',accent:'#b68cff'}
  };
  v.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => { Object.assign(NX.prefs,visualPresets[b.dataset.preset]); NX.setTheme(NX.prefs.theme); NX.applyPrefs(); NX.go('settings',false); NX.toast(b.querySelector('b').textContent+' system applied'); });
  v.querySelectorAll('[data-navmode]').forEach(b => b.onclick = () => { NX.prefs.navMode = b.dataset.navmode; NX.applyPrefs(); NX.go('settings', false); });
  ['radiusControl','borderControl','densityControl','accentControl'].forEach(id => v.querySelector('#'+id).addEventListener('input', e => { const k={radiusControl:'radius',borderControl:'border',densityControl:'density',accentControl:'accent'}[id]; NX.prefs[k] = id==='radiusControl'||id==='borderControl' ? +e.target.value : e.target.value; NX.applyPrefs(); }));
  v.querySelectorAll('[data-font-pick]').forEach(b => b.onclick = () => { NX.setFont(b.dataset.fontPick); NX.go('settings', false); });
  v.querySelectorAll('[data-zoom]').forEach(b => b.onclick = () => { NX.prefs.zoom = b.dataset.zoom; NX.applyPrefs(); NX.go('settings', false); });
  v.querySelectorAll('[data-aura]').forEach(b => b.onclick = () => { NX.prefs.aura = b.dataset.aura === '1'; NX.applyPrefs(); NX.go('settings', false); });
  v.querySelector('#prefForm').onsubmit = e => { e.preventDefault(); const f = e.target.elements; NX.prefs.name = f.name.value || 'Manas'; NX.prefs.city = f.city.value; NX.savePrefs(); NX.toast('Saved ✦'); };
  v.querySelector('#demoOn').onclick = () => { if (NX.data.records.some(r => r.demo) && !confirm('Replace the current example entries? Your real entries will remain.')) return; NX.loadDemo(); NX.go('settings', false); NX.toast('Example entries loaded'); };
  v.querySelector('#demoOff').onclick = () => { NX.clearDemo(); NX.toast('Demo data cleared'); };
  v.querySelector('#resetAppearance').onclick = () => { if (!confirm('Reset all visual preferences to defaults? Your records and Secret Space will remain.')) return; NX.prefs = { theme:'chrome',font:'swiss',zoom:'1',aura:true,layout:'classic',backdrop:'ambient',name:'Manas',city:'',radius:20,border:35,density:'comfortable',accent:'',navMode:'top' }; NX.applyPrefs(); NX.go('settings',false); NX.toast('Appearance restored'); };
  v.querySelector('#resetWorkspace').onclick = () => { if (prompt('This removes regular workspace records only. Type RESET to continue. Backup first if needed.') !== 'RESET') return; const blob = new Blob([JSON.stringify({ ...NX.data, prefs:NX.prefs, vault:localStorage.getItem(NX.VAULT) },null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='nexus-safety-backup-'+NX.today()+'.json'; a.click(); NX.data.records=[]; NX.save(); NX.go('home'); NX.toast('Workspace reset · backup downloaded'); };
  v.querySelector('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify({ ...NX.data, prefs: NX.prefs, vault: localStorage.getItem(NX.VAULT) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nexus-backup-' + NX.today() + '.json'; a.click();
  };
  v.querySelector('#imp').onchange = async e => {
    try { const file = e.target.files?.[0]; if (!file) return; const d = JSON.parse(await file.text()); if (!Array.isArray(d.records)) throw 0;
      const allowed = new Set(NX.modules.map(m => m.type).filter(Boolean));
      const records = d.records.filter(r => r && typeof r === 'object' && !Array.isArray(r) && typeof r.id === 'string' && /^[\w-]{1,80}$/.test(r.id) && typeof r.type === 'string' && allowed.has(r.type))
        .map(r => {
          const attachments = Array.isArray(r.attachments) ? r.attachments.slice(0, NX.filePolicy.maxAttachments).map(file => ({ name: String(file?.name || 'Attachment').slice(0, 200), type: String(file?.type || ''), size: NX.filePolicy.storedBytes(file?.data), data: file?.data })).filter(file => NX.filePolicy.allowedAttachmentType(file.type) && NX.filePolicy.validateAttachments([], [file]) === null) : [];
          let accepted = [];
          for (const file of attachments) { if (NX.filePolicy.validateAttachments(accepted, [file])) break; accepted.push(file); }
          const audio = r.type === 'music' && typeof r.audio?.data === 'string' && /^data:audio\/[\w.+-]+;base64,[A-Za-z0-9+/=]+$/.test(r.audio.data) && NX.filePolicy.validateAudio(r.audio.type, NX.filePolicy.storedBytes(r.audio.data)) === null ? { name: String(r.audio.name || 'Audio').slice(0, 200), type: String(r.audio.type), data: r.audio.data } : null;
          return { ...r, title: String(r.title ?? '').slice(0, 500), url: NX.safeLink(r.url), photos: Array.isArray(r.photos) ? r.photos.slice(0, 8).map(p => ({ name: String(p?.name ?? 'Photo').slice(0, 200), type: 'image/jpeg', data: NX.photoSource(p) })).filter(p => p.data) : [], attachments: accepted, audio };
        });
      let restoredVault = undefined;
      if (typeof d.vault === 'string') {
        const vault = JSON.parse(d.vault);
        if (!vault || typeof vault !== 'object' || typeof vault.salt !== 'string' || (vault.data && (typeof vault.iv !== 'string' || typeof vault.data !== 'string'))) throw 0;
        restoredVault = JSON.stringify(vault);
      } else if (d.vault !== undefined && d.vault !== null) throw 0;
      const savedRecords = NX.data;
      const savedPrefs = { ...NX.prefs };
      const previousVault = localStorage.getItem(NX.VAULT);
      const previousData = localStorage.getItem(NX.KEY);
      const previousPrefs = localStorage.getItem(NX.PREF);
      try {
        NX.data = { version: 1, records };
        NX.save();
        if (d.prefs && typeof d.prefs === 'object' && !Array.isArray(d.prefs)) {
          const imported = d.prefs;
          const theme = NX.themes.some(([id]) => id === imported.theme) ? imported.theme : savedPrefs.theme;
          const font = NX.fonts.some(([id]) => id === imported.font) ? imported.font : savedPrefs.font;
          const layouts = ['classic', 'light', 'sleek', 'bento', 'editorial'];
          const navModes = ['dock', 'rail', 'top', 'orbit'];
          const backdrops = ['ambient', 'grid', 'plain'];
          NX.prefs = {
            ...savedPrefs,
            name: typeof imported.name === 'string' ? imported.name.slice(0, 80) : savedPrefs.name,
            city: typeof imported.city === 'string' ? imported.city.slice(0, 100) : savedPrefs.city,
            theme, font,
            zoom: ['0.9', '1', '1.1'].includes(String(imported.zoom)) ? String(imported.zoom) : savedPrefs.zoom,
            layout: layouts.includes(imported.layout) ? imported.layout : savedPrefs.layout,
            navMode: navModes.includes(imported.navMode) ? imported.navMode : savedPrefs.navMode,
            backdrop: backdrops.includes(imported.backdrop) ? imported.backdrop : savedPrefs.backdrop,
            radius: Number.isFinite(Number(imported.radius)) ? Math.max(8, Math.min(34, Number(imported.radius))) : savedPrefs.radius,
            border: Number.isFinite(Number(imported.border)) ? Math.max(0, Math.min(100, Number(imported.border))) : savedPrefs.border,
            density: ['comfortable', 'compact'].includes(imported.density) ? imported.density : savedPrefs.density,
            accent: /^#[0-9a-f]{6}$/i.test(imported.accent) ? imported.accent : '',
          };
          if (imported.dashboardLayout && typeof imported.dashboardLayout === 'object') {
            const available = new Set(NX.dashboardWidgets.map(([id]) => id));
            NX.prefs.dashboardLayout = {
              order: Array.isArray(imported.dashboardLayout.order) ? [...new Set(imported.dashboardLayout.order.filter(id => available.has(id)))] : [],
              hidden: Array.isArray(imported.dashboardLayout.hidden) ? [...new Set(imported.dashboardLayout.hidden.filter(id => available.has(id)))] : [],
            };
          }
          NX.applyPrefs();
        }
        if (restoredVault !== undefined) localStorage.setItem(NX.VAULT, restoredVault);
        else if (d.vault === null) localStorage.removeItem(NX.VAULT);
      } catch (error) {
        NX.data = savedRecords; NX.prefs = savedPrefs;
        if (previousVault === null) localStorage.removeItem(NX.VAULT); else localStorage.setItem(NX.VAULT, previousVault);
        if (previousData === null) localStorage.removeItem(NX.KEY); else localStorage.setItem(NX.KEY, previousData);
        if (previousPrefs === null) localStorage.removeItem(NX.PREF); else localStorage.setItem(NX.PREF, previousPrefs);
        try { NX.applyPrefs(); } catch (restoreError) { /* preserve the prior persisted settings */ }
        if (previousPrefs === null) localStorage.removeItem(NX.PREF); else localStorage.setItem(NX.PREF, previousPrefs);
        throw error;
      }
      NX.toast(records.length === d.records.length ? 'Backup restored' : 'Backup restored · unsafe entries skipped'); NX.go('home');
    } catch (err) { NX.toast('That file is not a valid MANAS-ONE811 backup'); }
  };
};

NX.setTheme = id => { NX.prefs.theme = id; NX.savePrefs(); document.documentElement.dataset.theme = id; NX.refreshAuraColor(); NX.applyPrefs(); };

NX.setFont = id => { NX.prefs.font = id; NX.applyPrefs(); };
NX.applyPrefs = () => {
  NX.savePrefs();
  const f = NX.fonts.find(x => x[0] === NX.prefs.font) || NX.fonts[0], r = document.documentElement.style;
  document.documentElement.dataset.theme = NX.prefs.theme || 'chrome';
  document.getElementById('fontLink').href = 'https://fonts.googleapis.com/css2?' + f[5] + '&display=swap';
  const q = x => f[6] ? x : `'${x}'`; r.setProperty('--font-head', q(f[2])); r.setProperty('--font-body', q(f[3])); r.setProperty('--font-mono', q(f[4]));
  r.setProperty('--zoom', NX.prefs.zoom);
  r.setProperty('--card-radius', (NX.prefs.radius ?? 20) + 'px');
  r.setProperty('--line-alpha', ((NX.prefs.border ?? 35) / 100).toFixed(2));
  if (NX.prefs.accent) r.setProperty('--a1', NX.prefs.accent); else r.removeProperty('--a1');
  document.body.classList.toggle('no-aura', !NX.prefs.aura);
  document.body.dataset.layout = NX.prefs.layout || 'classic';
  document.body.dataset.backdrop = NX.prefs.backdrop || 'ambient';
  document.body.dataset.density = NX.prefs.density || 'comfortable';
  document.body.dataset.nav = NX.prefs.navMode || 'orbit';
  if (NX.layoutNav) NX.layoutNav();
};
