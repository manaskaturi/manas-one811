/* Extra first-party MANAS-ONE811 experiences built on the archive's local records. */
NX.dashboardWidgets = [
  ['pulse', 'Today’s pulse'], ['tasks', 'Task progress'], ['goals', 'Goal momentum'], ['spending', 'Monthly spending'], ['fitness', 'Training sessions'],
  ['trainingWeek', 'Training this week'], ['spendingCategories', 'Spending categories'], ['spendingHistory', 'Recent spending'], ['activity', 'Activity'], ['goalList', 'Goals'], ['weather', 'Weather'],
];
NX.readDashboardLayout = () => {
  const saved = NX.prefs.dashboardLayout || {};
  const available = NX.dashboardWidgets.map(([id]) => id);
  return { order: [...new Set([...(Array.isArray(saved.order) ? saved.order : []), ...available])].filter(id => available.includes(id)), hidden: Array.isArray(saved.hidden) ? saved.hidden.filter(id => available.includes(id)) : [] };
};
NX.applyDashboardLayout = view => {
  const grid = view.querySelector('.dash');
  if (!grid) return;
  const layout = NX.readDashboardLayout();
  const cards = [...grid.children];
  const keyed = new Map(cards.map(card => [card.dataset.widget, card]));
  layout.order.forEach(id => { const card = keyed.get(id); if (card) grid.append(card); });
  cards.forEach(card => { card.hidden = layout.hidden.includes(card.dataset.widget); });
};
NX.editDashboardLayout = () => {
  const layout = NX.readDashboardLayout();
  const draw = () => {
    NX.openSheet(`<h3>Arrange your dashboard</h3><p class="dim tiny">Move cards or hide the sections you do not need. Your choices stay in this browser.</p><div class="rows layout-widget-list">${layout.order.map((id, index) => {
      const title = NX.dashboardWidgets.find(widget => widget[0] === id)?.[1] || id;
      const visible = !layout.hidden.includes(id);
      return `<div class="row"><div class="grow"><div class="t">${NX.esc(title)}</div><div class="s">${visible ? 'Visible' : 'Hidden'}</div></div><button class="icon-action" data-move="-1" data-index="${index}" aria-label="Move ${NX.esc(title)} up" title="Move up" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-action" data-move="1" data-index="${index}" aria-label="Move ${NX.esc(title)} down" title="Move down" ${index === layout.order.length - 1 ? 'disabled' : ''}>↓</button><button class="icon-action" data-visible="${NX.esc(id)}" aria-label="${visible ? 'Hide' : 'Show'} ${NX.esc(title)}" title="${visible ? 'Hide section' : 'Show section'}">${visible ? '◉' : '○'}</button></div>`;
    }).join('')}</div><div class="actions"><button type="button" class="btn small" id="layoutDefault">Restore default</button><button type="button" class="btn solid" id="layoutSave">Save layout</button></div>`);
    const sheet = document.getElementById('sheetBody');
    sheet.querySelectorAll('[data-move]').forEach(button => button.onclick = () => {
      const index = Number(button.dataset.index), target = index + Number(button.dataset.move);
      if (target < 0 || target >= layout.order.length) return;
      [layout.order[index], layout.order[target]] = [layout.order[target], layout.order[index]];
      draw();
    });
    sheet.querySelectorAll('[data-visible]').forEach(button => button.onclick = () => {
      const id = button.dataset.visible;
      layout.hidden = layout.hidden.includes(id) ? layout.hidden.filter(item => item !== id) : [...layout.hidden, id];
      draw();
    });
    sheet.querySelector('#layoutDefault').onclick = () => {
      layout.order = NX.dashboardWidgets.map(([id]) => id); layout.hidden = []; draw();
    };
    sheet.querySelector('#layoutSave').onclick = () => {
      NX.prefs.dashboardLayout = layout; NX.savePrefs(); NX.closeSheet(); NX.renderHome(document.getElementById('view')); NX.toast('Dashboard layout saved');
    };
  };
  draw();
};

NX.renderGallery = view => {
  const entries = NX.data.records.flatMap(record => (record.photos || []).map((photo, index) => ({ record, photo, index, src: NX.photoSource(photo) }))).filter(entry => entry.src);
  view.innerHTML = `
    <section class="hero"><div class="mono dim">Your moments, all together</div><h1>Gallery<em>.</em></h1><p class="dim">${entries.length} photos · stored on this device</p></section>
    <div class="actions"><button class="btn solid" id="galleryAdd">＋ Add photos</button><label class="field" style="flex:1;min-width:180px;margin:0"><input id="gallerySearch" type="search" placeholder="Find a memory…" aria-label="Search gallery"></label></div>
    <div class="memory-gallery nexus-gallery" id="galleryGrid">${entries.map(({ record, photo, index, src }) => `<button class="memory-photo" data-photo="${NX.esc(record.id)}" data-photo-index="${index}" data-search="${NX.esc([record.title, record.type, photo.name].join(' ').toLowerCase())}" aria-label="Open ${NX.esc(record.title || 'photo')}"><img loading="lazy" src="${src}" alt="${NX.esc(record.title || 'Memory photo')}"><span>${NX.esc(record.title || 'Untitled')}<small>${NX.esc(NX.mod(record.type)?.name || record.type)}</small></span></button>`).join('') || '<div class="empty">Your photo memories will appear here. Add photos to a memory, workout, song, or project.</div>'}</div>`;
  view.querySelector('#galleryAdd').onclick = () => NX.editRecord(NX.mod('memories'));
  view.querySelector('#gallerySearch').oninput = event => {
    const query = event.target.value.trim().toLowerCase();
    const shown = [...view.querySelectorAll('[data-photo]')].filter(item => { const match = item.dataset.search.includes(query); item.hidden = !match; return match; });
    const empty = view.querySelector('.gallery-no-results');
    if (!shown.length && entries.length) {
      if (!empty) view.querySelector('#galleryGrid').insertAdjacentHTML('beforeend', '<div class="empty gallery-no-results">No photos match that search.</div>');
    } else empty?.remove();
  };
  view.querySelectorAll('[data-photo]').forEach(button => button.onclick = () => {
    const record = NX.get(button.dataset.photo);
    if (record) NX.editRecord(NX.mod(record.type), record);
  });
};

NX.renderMusic = view => {
  const tracks = NX.list('music').slice().sort((a, b) => Number(b.favourite === 'Yes') - Number(a.favourite === 'Yes'));
  const playlists = [...new Set(tracks.map(track => track.playlist).filter(Boolean))];
  view.innerHTML = `<section class="hero"><div class="mono dim">A library of songs and moments</div><h1>Music<em>.</em></h1><p class="dim">Your tracks, albums, playlists and listening notes.</p></section>
    <div class="music-toolbar"><input class="search-in" id="musicSearch" type="search" placeholder="Search songs, artists or playlists…" aria-label="Search music"><button class="btn solid" id="musicAdd">＋ Add track</button></div>
    ${playlists.length ? `<div class="chips" id="playlistFilters"><button class="chip on" data-playlist="">All music</button>${playlists.map(playlist => `<button class="chip" data-playlist="${NX.esc(playlist)}">${NX.esc(playlist)}</button>`).join('')}</div>` : ''}
    <div class="music-grid" id="musicGrid">${tracks.map(track => {
      const cover = NX.photoSource(track.photos?.[0]);
      const source = typeof track.audio?.data === 'string' && /^data:audio\/[\w.+-]+;base64,[A-Za-z0-9+/=]+$/.test(track.audio.data) && NX.filePolicy.validateAudio(track.audio.type, NX.filePolicy.storedBytes(track.audio.data)) === null ? track.audio.data : '';
      return `<article class="music-track" data-search="${NX.esc([track.title, track.artist, track.genre, track.playlist, track.mood].join(' ').toLowerCase())}" data-track-playlist="${NX.esc(track.playlist || '')}">
        <button class="music-cover" data-track="${NX.esc(track.id)}" aria-label="Edit ${NX.esc(track.title)}">${cover ? `<img loading="lazy" src="${cover}" alt="${NX.esc(track.title)} cover">` : `<span class="music-cover-placeholder">♫</span>`}</button>
        <div class="music-track-info"><button class="music-title" data-track="${NX.esc(track.id)}">${NX.esc(track.title)}</button><div class="dim">${NX.esc(track.artist || 'Artist not set')}</div><div class="music-tags">${NX.esc([track.genre, track.mood, track.playlist, track.rating ? `${track.rating}/5` : ''].filter(Boolean).join(' · '))}</div>
        ${source ? `<audio controls preload="none" src="${NX.esc(source)}" aria-label="Play ${NX.esc(track.title)}"></audio>` : track.url && NX.safeLink(track.url) ? `<a class="pill" href="${NX.esc(NX.safeLink(track.url))}" target="_blank" rel="noopener">Listen ↗</a>` : '<span class="dim tiny">No audio or listening link</span>'}</div>
        <button class="music-favourite" data-favourite="${NX.esc(track.id)}" aria-label="${track.favourite === 'Yes' ? 'Remove favourite' : 'Add favourite'}" title="${track.favourite === 'Yes' ? 'Remove favourite' : 'Add favourite'}">${track.favourite === 'Yes' ? '♥' : '♡'}</button></article>`;
    }).join('') || '<div class="empty music-empty">Your music library is ready for its first track. Add a song, album, image, and optional audio file.</div>'}</div>`;
  view.querySelector('#musicAdd').onclick = () => NX.editRecord(NX.mod('music'));
  view.querySelectorAll('[data-track]').forEach(button => button.onclick = () => { const track = NX.get(button.dataset.track); if (track) NX.editRecord(NX.mod('music'), track); });
  view.querySelectorAll('[data-favourite]').forEach(button => button.onclick = event => { event.stopPropagation(); const track = NX.get(button.dataset.favourite); if (!track) return; NX.upsert({ ...track, favourite: track.favourite === 'Yes' ? 'No' : 'Yes' }); NX.renderMusic(view); });
  const filter = () => {
    const term = view.querySelector('#musicSearch').value.trim().toLowerCase();
    const playlist = view.querySelector('[data-playlist].on')?.dataset.playlist || '';
    view.querySelectorAll('[data-search]').forEach(item => { item.hidden = !(item.dataset.search.includes(term) && (!playlist || item.dataset.trackPlaylist === playlist)); });
  };
  view.querySelector('#musicSearch').oninput = filter;
  view.querySelectorAll('[data-playlist]').forEach(button => button.onclick = () => { view.querySelectorAll('[data-playlist]').forEach(item => item.classList.toggle('on', item === button)); filter(); });
};

NX.renderInsights = view => {
  const today = NX.today();
  const tasks = NX.list('task');
  const open = tasks.filter(task => !['Completed', 'Cancelled'].includes(task.status));
  const overdue = open.filter(task => task.dueDate && task.dueDate < today);
  const dueToday = open.filter(task => task.dueDate === today);
  const goals = NX.list('goal');
  const stalled = goals.filter(goal => !['Completed', 'Paused'].includes(goal.status) && Number(goal.progress || 0) < 10);
  const projects = NX.list('project').filter(project => !['Completed', 'Archived'].includes(project.status));
  const transactions = NX.list('transaction');
  const month = today.slice(0, 7);
  const spending = transactions.filter(tx => tx.kind === 'Expense' && (tx.date || '').startsWith(month)).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const income = transactions.filter(tx => tx.kind === 'Income' && (tx.date || '').startsWith(month)).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const rows = [
    overdue.length && { title: `${overdue.length} overdue ${overdue.length === 1 ? 'task' : 'tasks'}`, text: overdue.slice(0, 3).map(task => task.title).join(' · '), go: 'tasks' },
    dueToday.length && { title: `${dueToday.length} due today`, text: dueToday.slice(0, 3).map(task => task.title).join(' · '), go: 'tasks' },
    stalled.length && { title: `${stalled.length} goal${stalled.length === 1 ? '' : 's'} need a first step`, text: stalled.slice(0, 3).map(goal => goal.title).join(' · '), go: 'goals' },
    projects.length && { title: `${projects.length} active projects`, text: `${projects.filter(project => project.dueDate && project.dueDate < today).length} have passed their deadline.`, go: 'projects' },
    { title: `This month · ${NX.money(spending)} out`, text: income ? `${NX.money(income)} recorded as income.` : 'No income entries recorded this month.', go: 'finance' },
  ].filter(Boolean);
  view.innerHTML = `<section class="hero"><div class="mono dim">Only patterns in your saved records</div><h1>Insights<em>.</em></h1><p class="dim">A private, rule-based review. Nothing is sent to an AI service.</p></section>
    <div class="rows">${rows.map(row => `<button class="row insight-row" data-go="${row.go}"><div class="grow"><div class="t">${NX.esc(row.title)}</div><div class="s">${NX.esc(row.text)}</div></div><span class="pill">View →</span></button>`).join('')}
      ${rows.length ? '' : '<div class="empty">No priorities found in your records. Add a task, goal, project, or transaction to start a personal review.</div>'}</div>`;
};

NX.renderGuide = view => {
  const lessons = [
    ['How MANAS-ONE811 works', 'A set of personal workspaces—tasks, goals, projects, learning, fitness, finances, music, memories, and clients—built around a private local dashboard.'],
    ['Your records and privacy', 'Regular records and appearance settings are saved in this browser on this website. They do not sync to another device. Export a backup before changing browsers or website addresses.'],
    ['Photos and storage', 'Photos are resized in the browser and attached to records. They count against browser storage limits. Export backups regularly; large photo collections can exceed those limits.'],
    ['Weather and other free services', 'The dashboard may request weather, exchange rates, and a daily thought from public services. They are optional and can be unavailable offline. Your stored records remain local.'],
    ['Add a module', 'A module is a record type with fields and a list screen in js/modules.js. The shared form, filters, attachments, search, and backup handle most of the interaction.'],
    ['Run the project', 'This preview is hosted inside TanStack Start; the original client remains plain HTML, CSS, and JavaScript under public/nexus. Run bun install, then bun run dev for local development; use the project’s production publish flow when ready.'],
  ];
  view.innerHTML = `<section class="hero"><div class="mono dim">A guide to your workspace</div><h1>Learning<br><em>Centre.</em></h1><p class="dim">Straightforward notes on how your personal information is handled.</p></section>
    <div class="rows">${lessons.map(([title, text]) => `<article class="row guide-row"><div class="grow"><div class="t">${NX.esc(title)}</div><div class="s">${NX.esc(text)}</div></div></article>`).join('')}</div>
    <div class="section-h"><h2>Where things live</h2></div><div class="shard wide learning-diagram"><span>Browser</span><span aria-hidden="true">→</span><span>MANAS-ONE811 workspace</span><span aria-hidden="true">→</span><span>Local records + encrypted OUR WORLD</span></div>`;
};