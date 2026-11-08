/* =========================================================
   OUR WORLD — hidden & password-protected space for Manas & Adithri.
   - Not in the navigation, not in search.
   - Open it: press and HOLD the sigil (top-left) for 2 seconds.
   - First time: you create the password. After that: enter it to unlock.
   - Locks automatically when you leave the screen or the app.
   ========================================================= */
NX.worldTabs = [['overview', 'Overview', '◉'], ['dream', 'Dreams', '✦'], ['goals', 'Shared goals', '◎'], ['wishlist', 'Wishlist', '♢'], ['plan', 'Future plans', '➶'], ['date', 'Our dates', '◷'], ['build', 'Things to build', '▲'], ['memory', 'Memories', '♡'], ['note', 'Letters & notes', '✉'], ['photos', 'Our gallery', '▧']];
NX.worldFields = [['title', 'Title', 'text', 1], ['description', 'Details', 'textarea'], ['owner', 'Whose', 'select', ['Together', 'Manas', 'Adithri']], ['date', 'Date', 'date'], ['url', 'Link', 'url']];
NX.worldTab = 'overview';
NX.worldOwnerFilter = 'All';
NX.worldFieldsFor = (section, record = {}) => {
  if (section === 'wishlist') return [['title', 'Product / idea', 'text', 1], ['description', 'Notes', 'textarea'], ['brand', 'Brand', 'text'], ['category', 'Category', 'text'], ['owner', 'Whose', 'select', ['Together', 'Manas', 'Adithri']], ['price', 'Estimated price ₹', 'number'], ['priority', 'Priority', 'select', ['Low', 'Medium', 'High']], ['status', 'Status', 'select', ['Interested', 'Researching', 'Planned', 'Saving', 'Purchased', 'Cancelled']], ['savings', 'Savings progress ₹', 'number'], ['date', 'Desired date', 'date'], ['url', 'Product link', 'url']];
  if (section === 'dream' || section === 'goals' || section === 'build') return [['title', 'Title', 'text', 1], ['description', 'What matters', 'textarea'], ['owner', 'Whose', 'select', ['Together', 'Manas', 'Adithri']], ['category', 'Category', 'text'], ['priority', 'Priority', 'select', ['Low', 'Medium', 'High']], ['progress', 'Progress %', 'number'], ['status', 'Status', 'select', ['Not started', 'In progress', 'Completed', 'Paused']], ['date', 'Target date', 'date'], ['milestones', 'Milestones / next steps', 'textarea'], ['url', 'Link', 'url']];
  if (section === 'plan' || section === 'date') return [['title', 'Title', 'text', 1], ['description', 'Details', 'textarea'], ['owner', 'Whose', 'select', ['Together', 'Manas', 'Adithri']], ['date', 'Date', 'date'], ['budget', 'Estimated budget ₹', 'number'], ['url', 'Link', 'url']];
  return [['title', 'Title', 'text', 1], ['description', 'Details', 'textarea'], ['owner', 'Whose', 'select', ['Together', 'Manas', 'Adithri']], ['date', 'Date', 'date'], ['url', 'Link', 'url']];
};

NX.renderWorld = v => {
  if (!NX.vault.key) return NX.renderVaultGate(v);
  if (!Array.isArray(NX.vault.records)) { NX.vaultLock(); return NX.renderVaultGate(v); }
  const allSectionRecords = NX.vault.records.filter(r => r.section === NX.worldTab);
  const recs = NX.worldTab === 'photos' ? NX.vault.records.filter(r => (r.photos || []).length) : allSectionRecords.filter(r => NX.worldTab !== 'goals' || NX.worldOwnerFilter === 'All' || r.owner === NX.worldOwnerFilter);
  const tab = NX.worldTabs.find(t => t[0] === NX.worldTab);
  const dates = NX.vault.records.filter(r => r.section === 'date' && r.date).map(r => ({ ...r, days: daysUntil(r.date) })).sort((a, b) => a.days - b.days);
  const wishlistTotal = NX.vault.records.filter(r => r.section === 'wishlist' && r.status !== 'Purchased' && r.status !== 'Cancelled').reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const overview = NX.worldTab === 'overview';
  v.innerHTML = `
    <section class="hero"><div class="mono dim">Manas <span class="heart">♥</span> Adithri</div><h1>Our<br><em>World.</em></h1></section>
    ${overview ? `<div class="world-overview"><article class="shard world-date"><div class="mono dim">A shared space</div><h2>Two people.<br><em>One future.</em></h2><p class="dim">Keep personal and shared plans distinct; each entry shows who it belongs to.</p></article><article class="shard"><div class="mono dim">Dreams & goals</div><div class="stat">${NX.vault.records.filter(r => ['dream','goals'].includes(r.section)).length}</div><button class="chip" data-wjump="goals">Open goals →</button></article><article class="shard"><div class="mono dim">Wishlist ideas</div><div class="stat">${NX.money(wishlistTotal)}</div><button class="chip" data-wjump="wishlist">View wishlist →</button></article><article class="shard"><div class="mono dim">Dates saved</div><div class="stat">${dates.length}</div><button class="chip" data-wjump="date">Plan a date →</button></article><article class="shard span-all"><div class="card-h"><div class="mono dim">Next saved date</div><span class="pill">${dates[0] ? NX.esc(dates[0].date) : 'No date added'}</span></div><div class="t" style="margin-top:10px">${dates[0] ? `${NX.esc(dates[0].title)} · ${dates[0].days === 0 ? 'Today' : dates[0].days + ' days'}` : 'Save a date when you are ready.'}</div></article></div>` : ''}
    <div class="chips" style="margin-top:14px">${NX.worldTabs.map(([id, n, i]) => `<button class="chip ${id === NX.worldTab ? 'on' : ''}" data-wtab="${id}">${i} ${n}</button>`).join('')}</div>
    ${overview ? `<div class="world-section-links">${NX.worldTabs.filter(([id]) => id !== 'overview').map(([id, label, icon]) => `<button class="shard" data-wjump="${id}"><span class="world-link-icon">${icon}</span><b>${NX.esc(label)}</b></button>`).join('')}</div>` : ''}
    ${NX.worldTab === 'goals' ? `<div class="chips" aria-label="Filter goals by owner">${['All', 'Manas', 'Adithri', 'Together'].map(owner => `<button class="chip ${NX.worldOwnerFilter === owner ? 'on' : ''}" data-owner="${owner}">${owner === 'All' ? 'Everyone' : owner}</button>`).join('')}</div>` : ''}
    ${NX.worldTab === 'photos' ? `<div class="memory-gallery">${recs.flatMap(r => (r.photos || []).map((p, index) => `<button class="memory-photo" data-wopen="${NX.esc(r.id)}" data-photo-index="${index}"><img src="${NX.photoSource(p)}" alt="${NX.esc(r.title)}"><span>${NX.esc(r.title)}</span></button>`)).join('') || '<div class="empty">Your shared photo memories will live here.</div>'}</div>` : !overview ? `<div class="rows">${recs.length ? recs.map(r => `<div class="row" data-wopen="${NX.esc(r.id)}">${r.photos?.[0] ? `<img class="row-photo" src="${NX.photoSource(r.photos[0])}" alt="">` : ''}<div class="grow"><div class="t">${NX.esc(r.title)}</div><div class="s">${NX.esc([r.owner, r.status, r.date && NX.fmtDate(r.date), r.price && NX.money(r.price), (r.description || '').slice(0, 60)].filter(Boolean).join(' · '))}</div>${r.progress !== undefined ? NX.bar(r.progress) : ''}</div></div>`).join('') : `<div class="empty">No ${tab[1].toLowerCase()} yet.</div>`}</div>` : ''}
    <div class="actions"><button class="btn small" id="wLock">Lock ⊘</button><button class="btn small" id="wChangePass">Change password</button>${!overview ? `<button class="btn solid" id="wAdd">+ Add to ${tab[1]}</button>` : ''}</div>`;
  v.querySelectorAll('[data-wtab]').forEach(b => b.onclick = () => { NX.worldTab = b.dataset.wtab; NX.renderWorld(v); });
  v.querySelectorAll('[data-wjump]').forEach(b => b.onclick = () => { NX.worldTab = b.dataset.wjump; NX.renderWorld(v); });
  v.querySelectorAll('[data-owner]').forEach(b => b.onclick = () => { NX.worldOwnerFilter = b.dataset.owner; NX.renderWorld(v); });
  v.querySelectorAll('[data-wopen]').forEach(b => b.onclick = () => { const record = NX.vault.records.find(r => r.id === b.dataset.wopen); if (record) worldEdit(record); });
  v.querySelector('#wAdd')?.addEventListener('click', () => worldEdit({ section: NX.worldTab }));
  v.querySelector('#wChangePass').onclick = () => { NX.openSheet(`<h3>Change OUR WORLD password</h3><form id="changeVaultPass"><label class="field"><span class="mono dim">CURRENT PASSWORD</span><input name="old" type="password" required></label><label class="field"><span class="mono dim">NEW PASSWORD (8+ CHARACTERS)</span><input name="next" type="password" minlength="8" required></label><label class="field"><span class="mono dim">CONFIRM NEW PASSWORD</span><input name="confirm" type="password" minlength="8" required></label><button class="btn solid">Update password</button></form>`); const f=document.getElementById('changeVaultPass'); f.onsubmit=async e=>{e.preventDefault();if(f.next.value!==f.confirm.value)return NX.toast('Passwords do not match');try{const ok=await NX.vaultChangePassword(f.old.value,f.next.value);if(!ok)return NX.toast('Current password is incorrect');NX.closeSheet();NX.toast('OUR WORLD password updated');}catch(error){NX.toast('Could not save the new password');}}; };
  v.querySelector('#wLock').onclick = () => { NX.vaultLock(); NX.go('home'); NX.toast('Our World sealed'); };
  NX.armVaultLock();
};

function daysUntil(d) {
  const t = new Date(NX.today() + 'T00:00'), x = new Date(d + 'T00:00');
  return Math.round((x - t) / 864e5);
}

function worldEdit(r) {
NX.form({ title: r.id ? 'Edit' : 'New memory in our world', fields: NX.worldFieldsFor(r.section || NX.worldTab, r), record: r,
    onSave: async rec => {
      const i = NX.vault.records.findIndex(x => x.id === rec.id);
      if (i >= 0) NX.vault.records[i] = rec; else NX.vault.records.unshift({ ...rec, id: NX.uid(), type: 'shared', section: NX.worldTab, created: new Date().toISOString() });
      await NX.vaultWrite(); NX.renderWorld(document.getElementById('view'));
    },
    onDelete: r.id ? async () => { NX.vault.records = NX.vault.records.filter(x => x.id !== r.id); await NX.vaultWrite(); NX.renderWorld(document.getElementById('view')); } : null });
}

NX.renderVaultGate = v => {
  const first = !NX.vaultExists();
  v.innerHTML = `<div class="vault"><div class="vault-lock"></div>
    <div class="display" style="font-size:28px">${first ? 'Seal this world' : 'Restricted'}</div>
    <div class="dim" style="max-width:300px">${first ? 'Create a password. It encrypts everything in here. It cannot be recovered — remember it.' : 'Enter the key.'}</div>
    <form id="vf" style="display:grid;gap:10px;justify-items:center;width:100%">
      <input class="search-in" type="password" name="p" placeholder="Create a private password" autocomplete="off" required minlength="${first ? 8 : 4}">
      ${first ? '<input class="search-in" type="password" name="p2" placeholder="confirm password" autocomplete="off" required minlength="8">' : ''}
      <button class="btn solid">${first ? 'Create & enter' : 'Unlock'}</button></form></div>`;
  const f = v.querySelector('#vf'); f.p.focus();
  f.onsubmit = async e => {
    e.preventDefault();
    if (first) {
      if (f.p.value !== f.p2.value) return fail();
      await NX.vaultCreate(f.p.value);
    } else if (!(await NX.vaultUnlock(f.p.value))) return fail();
    NX.haptic(30); NX.armVaultLock(); NX.renderWorld(v);
  };
  function fail() { NX.haptic(80); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); f.p.value = ''; }
};
