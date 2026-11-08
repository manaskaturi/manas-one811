/* =========================================================
   APP — router, Orbit navigation, search, quick-add, secret gesture.
   URLs look like  #/tasks  so the browser back button works.
   ========================================================= */
const view = document.getElementById('view');
NX.current = 'home';

NX.go = (id, push = true) => {
  if (push && location.hash !== '#/' + id) history.pushState(null, '', '#/' + id);
  if (NX.current === 'world' && id !== 'world') { clearTimeout(vaultInactivityTimer); NX.vaultLock(); NX.closeSheet(); }
  NX.current = id;
  const m = NX.mod(id);
  document.getElementById('screenTitle').textContent = id === 'world' ? 'Our World' : (m ? m.name : 'Command');
  view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
  if (id === 'world') NX.renderWorld(view);
  else if (!m) return NX.go('home');
  else if (m.render) m.render(view);
  else NX.renderList(m, view);
  document.querySelectorAll('.orbit-item').forEach(b => b.classList.toggle('active', b.dataset.nav === id));
  scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
};
addEventListener('popstate', () => NX.go(location.hash.slice(2) || 'home', false));

let vaultInactivityTimer;
NX.armVaultLock = () => {
  clearTimeout(vaultInactivityTimer);
  if (!NX.vault?.key) return;
  vaultInactivityTimer = setTimeout(() => {
    NX.vaultLock(); NX.closeSheet();
    if (NX.current === 'world') NX.go('home', false);
    NX.toast('Our World locked after inactivity');
  }, 10 * 60 * 1000);
};
['pointerdown', 'keydown', 'touchstart'].forEach(type => addEventListener(type, () => {
  if (NX.current === 'world') NX.armVaultLock();
}, { passive: true }));

/* ---------- Responsive navigation system ----------
   No global pointer dragging: this avoids stuck pointer state on iOS.
*/
const ring = document.getElementById('orbitRing');
  ring.innerHTML = NX.modules.map(m => `<button class="orbit-item" data-nav="${m.id}" aria-label="${NX.esc(m.name)}"><span class="nav-icon">${m.icon}</span><b>${NX.esc(m.name)}</b></button>`).join('');
let menuOpen = false;
const layout = () => {
  const mode = NX.prefs.navMode || 'top';
  document.body.dataset.nav = mode;
  [...ring.children].forEach((el, i) => { el.style.transitionDelay = mode === 'orbit' && menuOpen ? `${i * 18}ms` : '0ms'; });
};
NX.layoutNav = layout;
const toggleOrbit = open => {
  menuOpen = !!open; document.body.classList.toggle('orbit-open', menuOpen);
  document.getElementById('core').setAttribute('aria-expanded', String(menuOpen));
  layout(); NX.haptic(10);
};
document.getElementById('core').onclick = () => toggleOrbit(!menuOpen);
document.getElementById('orbitVeil').onclick = () => toggleOrbit(false);
ring.addEventListener('click', e => { const b=e.target.closest('[data-nav]'); if(!b)return; toggleOrbit(false); NX.go(b.dataset.nav); });
addEventListener('resize', () => NX.layoutNav && NX.layoutNav(), {passive:true});
document.addEventListener('keydown', e => { if(e.key==='Escape' && menuOpen) toggleOrbit(false); });
/* ---------- delegated clicks inside screens ---------- */
view.addEventListener('click', e => {
  const t = e.target;
  const tog = t.closest('[data-toggle]');
  if (tog) { e.stopPropagation(); const r = NX.get(tog.dataset.toggle); NX.upsert({ ...r, status: r.status === 'Completed' ? 'In progress' : 'Completed' }); NX.haptic(15); return NX.go(NX.current, false); }
  const go = t.closest('[data-go]'); if (go) return NX.go(go.dataset.go);
  const add = t.closest('[data-add]'); if (add) return NX.editRecord(NX.mod(add.dataset.add));
  const open = t.closest('[data-open]'); if (open) return NX.editRecord(NX.mod(open.dataset.mod), NX.get(open.dataset.open));
});

/* ---------- Quick add ---------- */
NX.openQuickAdd = () => {
  const cur = NX.mod(NX.current);
  if (cur && cur.type) return NX.editRecord(cur);
  NX.openSheet(`<h3>Create</h3><div class="grid">${NX.modules.filter(m => m.type).map(m => `<button class="shard" data-qa="${m.id}" style="text-align:left"><div style="font-size:22px" class="accent">${m.icon}</div><b>${NX.esc(m.name)}</b></button>`).join('')}</div>`);
  document.querySelectorAll('[data-qa]').forEach(b => b.onclick = () => { NX.closeSheet(); NX.editRecord(NX.mod(b.dataset.qa)); });
};
document.getElementById('quick').onclick = NX.openQuickAdd;
document.getElementById('quickTop').onclick = NX.openQuickAdd;


/* ---------- Search (Our World is never searched) ---------- */
document.getElementById('searchBtn').onclick = () => {
  NX.openSheet(`<h3>Search everything</h3><input class="search-in" id="q" placeholder="type…" autocomplete="off"><div class="rows" id="qr" style="margin-top:12px"></div>`);
  const q = document.getElementById('q'), out = document.getElementById('qr'); setTimeout(() => q.focus(), 300);
  q.oninput = () => {
    const s = q.value.trim().toLowerCase(); if (!s) return out.innerHTML = '';
    const hits = NX.data.records.filter(r => r.type !== 'shared' && JSON.stringify(r).toLowerCase().includes(s)).slice(0, 30);
    out.innerHTML = hits.map(r => { const m = NX.modules.find(x => x.type === r.type); return m ? `<button class="row search-result" data-result="${NX.esc(r.id)}" data-type="${NX.esc(r.type)}"><span class="grow"><span class="t">${NX.esc(r.title)}</span><span class="s">${NX.esc(m.sub ? m.sub(r) : m.name)}</span></span>${r.photos?.length ? `<img class="row-photo" src="${NX.photoSource(r.photos[0])}" alt="">` : ''}</button>` : ''; }).join('') || '<div class="empty">No match.</div>';
    out.querySelectorAll('[data-result]').forEach(el => el.onclick = () => { const record = NX.get(el.dataset.result); if (record) { NX.closeSheet(); NX.go(NX.modules.find(module => module.type === record.type)?.id || 'home'); NX.editRecord(NX.mod(el.dataset.type), record); } });
  };
};

/* ---------- Secret gesture: hold the sigil 2s → Our World ---------- */
const sigil = document.getElementById('sigil'); let holdT, held = false;
const startHold = e => { e.preventDefault(); held = false; sigil.classList.add('charging'); holdT = setTimeout(() => { held = true; sigil.classList.remove('charging'); NX.haptic([20, 40, 20]); NX.go('world'); }, 2000); };
const endHold = () => { sigil.classList.remove('charging'); clearTimeout(holdT); };
sigil.addEventListener('pointerdown', startHold); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => sigil.addEventListener(ev, endHold));
sigil.addEventListener('click', () => { if (!held && NX.current !== 'home') NX.go('home'); });
sigil.addEventListener('contextmenu', e => e.preventDefault());

// lock Our World whenever the app goes to background
document.addEventListener('visibilitychange', () => { if (document.hidden && NX.vault.key) { clearTimeout(vaultInactivityTimer); NX.vaultLock(); NX.closeSheet(); if (NX.current === 'world') NX.go('home'); } });

/* ---------- clock + boot ---------- */
const tick = () => document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
tick(); setInterval(tick, 1000);
NX.setTheme(NX.prefs.theme); NX.applyPrefs();
const start = location.hash.slice(2);
layout();
NX.go(start && start !== 'world' ? start : 'home', false);
NX.runIntro ? NX.runIntro() : document.getElementById('boot').classList.add('gone');
