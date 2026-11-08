/* =========================================================
   DASHBOARD — the home screen. Pure SVG charts, no libraries.
   Helpers: spark(values), bars(values,labels), donut(parts), ring(pct)
   ========================================================= */
const dayKey = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const lastDays = n => [...Array(n)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return dayKey(d); });

NX.spark = vals => {
  const max = Math.max(...vals, 1), w = 100, h = 30, step = w / (vals.length - 1 || 1);
  const pts = vals.map((v, i) => [i * step, h - (v / max) * (h - 3) - 1.5]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none"><path class="f" d="${d} L100 30 L0 30Z"/><path class="l" d="${d}" vector-effect="non-scaling-stroke"/></svg>`;
};
NX.bars = (vals, labels, todayIdx) => {
  const max = Math.max(...vals, 1);
  return `<div class="chart-bars">${vals.map((v, i) => `<div class="${i === todayIdx ? 'today' : ''}"><i style="height:${(v / max) * 100}%;animation-delay:${i * 40}ms"></i><span>${labels[i]}</span></div>`).join('')}</div>`;
};
NX.donut = parts => {
  const total = parts.reduce((a, p) => a + p.v, 0) || 1, C = 2 * Math.PI * 38; let off = 0;
  const op = [1, .75, .55, .4, .28, .18];
  const segs = parts.map((p, i) => { const len = p.v / total * C; const s = `<circle r="38" cx="50" cy="50" fill="none" stroke="var(--a${i % 2 ? 2 : 1})" stroke-opacity="${op[i] || .15}" stroke-width="14" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}"/>`; off += len; return s; }).join('');
  return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 100 100"><circle r="38" cx="50" cy="50" fill="none" stroke="var(--line)" stroke-width="14"/>${segs}</svg>
    <div class="legend">${parts.map((p, i) => `<div><i style="background:var(--a${i % 2 ? 2 : 1});opacity:${op[i] || .15}"></i><span>${NX.esc(p.k)}</span><b>${NX.money(p.v)}</b></div>`).join('') || '<span>No spending yet</span>'}</div></div>`;
};
NX.ring = (pct, label) => {
  const C = 2 * Math.PI * 44;
  return `<div class="ring"><svg viewBox="0 0 100 100"><circle class="bg" r="44" cx="50" cy="50"/><circle class="fg" r="44" cx="50" cy="50" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-to="${C * (1 - pct / 100)}"/></svg>
    <div class="lbl"><b>${pct}</b><span class="mono dim">${label}</span></div></div>`;
};

NX.renderHome = v => {
  const days = lastDays(14), t = NX.today(), ym = t.slice(0, 7);
  const tasks = NX.list('task'), open = tasks.filter(x => !['Completed', 'Cancelled'].includes(x.status));
  const doneN = tasks.filter(x => x.status === 'Completed').length;
  const overdue = open.filter(x => x.dueDate && x.dueDate < t).length;
  const goals = NX.list('goal'), gAvg = goals.length ? Math.round(goals.reduce((a, g) => a + (+g.progress || 0), 0) / goals.length) : 0;
  const wo = NX.list('workout'), woDays = days.map(d => wo.filter(w => w.date === d).length);
  const tx = NX.list('transaction'), exp = tx.filter(x => x.kind === 'Expense');
  const spendDays = days.map(d => exp.filter(x => x.date === d).reduce((a, x) => a + (+x.amount || 0), 0));
  const monthExp = exp.filter(x => (x.date || '').startsWith(ym)).reduce((a, x) => a + (+x.amount || 0), 0);
  const monthInc = tx.filter(x => x.kind === 'Income' && (x.date || '').startsWith(ym)).reduce((a, x) => a + (+x.amount || 0), 0);
  const cats = {}; exp.filter(x => (x.date || '').startsWith(ym)).forEach(x => cats[x.category || 'Other'] = (cats[x.category || 'Other'] || 0) + (+x.amount || 0));
  const catParts = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ k, v }));
  const created = days.map(d => NX.data.records.filter(r => (r.created || '').startsWith(d) || r.date === d).length);
  const taskRate = tasks.length ? doneN / tasks.length * 100 : 0;
  const fitScore = Math.min(100, woDays.slice(-7).filter(Boolean).length / 5 * 100);
  const money = monthInc ? Math.max(0, Math.min(100, (1 - monthExp / monthInc) * 100 + 40)) : 50;
  const score = Math.round(taskRate * .3 + gAvg * .3 + fitScore * .25 + money * .15);
  const h = new Date().getHours(), greet = h < 5 ? 'Still in motion' : h < 12 ? 'A new day' : h < 17 ? 'Keep the momentum' : 'The night is yours';
  const wd = days.slice(-7), wdL = wd.map(d => 'SMTWTFS'[new Date(d + 'T00:00').getDay()]);
  const low = NX.list('supplement').filter(s => s.remaining !== '' && s.remaining !== undefined && +s.remaining <= 10);

  v.innerHTML = `
    <section class="hero" style="padding-bottom:4px"><div class="mono dim">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <h1>${greet}, <em>${NX.esc(NX.prefs.name)}.</em></h1></section>
    ${NX.data.records.some(r => r.demo) ? '<div class="sample-notice"><span><b>EXAMPLE DATA</b> · these starter entries are fictional and saved only in this browser.</span><button class="btn small" id="clearSamples">Remove examples</button></div>' : ''}
    <div class="dashboard-tools"><button class="btn small" id="editDashboard">Arrange dashboard</button><button class="btn small" data-go="insights">Review priorities</button></div>
    <div class="dash">
      <div class="shard span-all" data-widget="pulse"><div class="top">${NX.ring(score, 'life score')}
        <div style="min-width:0"><div class="mono dim">Today’s pulse</div><div style="font-size:15px;margin:6px 0 8px;line-height:1.4" id="thought">Loading a thought…</div>
        <div class="dim" style="font-size:12px">${open.length} open tasks · ${overdue} overdue · ${woDays.slice(-7).filter(Boolean).length}/7 active days</div></div></div></div>

      <div class="shard kpi" data-widget="tasks" data-go="tasks"><div class="mono dim">Tasks done</div><div class="stat">${doneN}<span class="dim" style="font-size:14px">/${tasks.length}</span></div><div class="delta">${Math.round(taskRate)}% completion</div>${NX.spark(created)}</div>
      <div class="shard kpi" data-widget="goals" data-go="goals"><div class="mono dim">Goal momentum</div><div class="stat">${gAvg}%</div><div class="delta">${goals.length} goals tracked</div>${NX.bar(gAvg)}</div>
      <div class="shard kpi" data-widget="spending" data-go="finance"><div class="mono dim">Spent · month</div><div class="stat">${NX.money(monthExp)}</div><div class="delta">of ${NX.money(monthInc)} in</div>${NX.spark(spendDays)}</div>
      <div class="shard kpi" data-widget="fitness" data-go="fitness"><div class="mono dim">Training · 14d</div><div class="stat">${woDays.reduce((a, b) => a + b, 0)}</div><div class="delta">sessions logged</div>${NX.spark(woDays)}</div>

      <div class="shard span2" data-widget="trainingWeek" data-go="fitness"><div class="card-h"><div class="mono dim">Training this week</div><span class="pill">${Math.round(fitScore)}%</span></div>${NX.bars(woDays.slice(-7), wdL, 6)}</div>
      <div class="shard span2" data-widget="spendingCategories" data-go="finance"><div class="card-h"><div class="mono dim">Where money went</div><span class="pill">${new Date().toLocaleDateString('en-IN', { month: 'short' })}</span></div>${NX.donut(catParts)}</div>

      <div class="shard span2" data-widget="spendingHistory" data-go="finance"><div class="card-h"><div class="mono dim">Daily spend · 14 days</div></div>${NX.bars(spendDays, days.map(d => d.slice(8)), 13)}</div>
      <div class="shard span2" data-widget="activity"><div class="card-h"><div class="mono dim">Activity heatmap</div><span class="mono dim">14d</span></div>
        <div class="heat">${created.map(c => `<i style="opacity:${c ? .25 + Math.min(c, 6) / 8 : .07}"></i>`).join('')}</div>
        <div class="dim" style="font-size:11px;margin-top:8px">${created.reduce((a, b) => a + b, 0)} things logged in two weeks</div></div>

      <div class="shard span2" data-widget="goalList" data-go="goals"><div class="mono dim">Goals</div><div class="mini-list">${goals.slice(0, 4).map(g => `<div><div class="t"><span>${NX.esc(g.title)}</span><span class="mono dim">${+g.progress || 0}%</span></div>${NX.bar(g.progress)}</div>`).join('') || '<span class="dim">No goals yet</span>'}</div></div>
      <div class="shard span2" id="wx" data-widget="weather"><div class="mono dim">Sky</div><div class="dim" style="margin-top:8px">Reading the atmosphere…</div></div>
    </div>
    <div class="section-h"><h2>Focus now</h2><button class="mono accent" data-go="tasks">all →</button></div>
    <div class="rows">${open.sort((a, b) => (a.dueDate || '9') > (b.dueDate || '9') ? 1 : -1).slice(0, 4).map(r => NX.rowHTML(NX.mod('tasks'), r)).join('') || '<div class="empty">Clear horizon.</div>'}</div>
    ${low.length ? `<div class="section-h"><h2>Restock soon</h2></div><div class="rows">${low.map(r => NX.rowHTML(NX.mod('supplements'), r)).join('')}</div>` : ''}`;

  requestAnimationFrame(() => setTimeout(() => v.querySelectorAll('.ring .fg').forEach(c => c.style.strokeDashoffset = c.dataset.to), 120));
  NX.applyDashboardLayout(v);
  v.querySelector('#editDashboard')?.addEventListener('click', NX.editDashboardLayout);
  v.querySelector('#clearSamples')?.addEventListener('click', () => { NX.clearDemo(); NX.go('home', false); NX.toast('Example entries removed'); });
  NX.api.weather(NX.prefs.city).then(w => { const el = document.getElementById('wx'); if (!el) return; el.innerHTML = w ? `<div class="mono dim">Sky · ${NX.esc(w.city)}</div><div class="weather" style="margin-top:10px"><div class="big">${Number(w.temp)}°</div><div><b>${NX.esc(w.desc)}</b><div class="dim" style="font-size:12px">H ${Number(w.hi)}° · L ${Number(w.lo)}°<br>wind ${Number(w.wind)} km/h</div></div></div>` : '<div class="mono dim">Sky</div><div class="dim" style="margin-top:8px">Offline</div>'; });
  NX.api.thought().then(a => { const el = document.getElementById('thought'); if (el) el.textContent = a ? '“' + a + '”' : 'Build the life you want.'; });
};

/* ---------- DEMO DATA (so the dashboard looks alive). Remove from Aura → "Clear demo data". ---------- */
NX.demo = () => {
  const d = n => { const x = new Date(); x.setDate(x.getDate() - n); return dayKey(x); }, R = [];
  const add = o => R.push({ id: NX.uid(), demo: true, created: d(Math.floor(Math.random() * 13)) + 'T10:00:00Z', ...o });
  [['Finish MANAS-ONE811 dashboard', 'In progress', 'High', d(-1)], ['Book flight tickets', 'Not started', 'Medium', d(-3)], ['Renew gym membership', 'Not started', 'High', d(1)], ['Client call — Aurora Labs', 'Waiting', 'High', d(0)],
   ['Learn JavaScript arrays', 'Completed', 'Medium'], ['Clean desk setup', 'Completed', 'Low'], ['Plan Sunday meal prep', 'Completed', 'Medium'], ['Send invoice #014', 'Completed', 'High']]
    .forEach(([title, status, priority, dueDate]) => add({ type: 'task', title, status, priority, dueDate }));
  [['Bench 100 kg', 'Fitness', 72], ['Save ₹2,00,000', 'Financial', 46], ['Ship 3 client projects', 'Business', 33], ['Master JavaScript', 'Learning', 58]]
    .forEach(([title, category, progress]) => add({ type: 'goal', title, category, progress, status: 'In progress' }));
  [['MANAS-ONE811 Workspace', 'Coding', 45], ['Portfolio v3', 'Personal', 70], ['Aurora Labs website', 'Business', 30]].forEach(([title, category, progress]) => add({ type: 'project', title, category, progress, status: 'Active' }));
  const splits = ['Push', 'Pull', 'Legs', 'Upper', 'Cardio'];
  [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].forEach((n, i) => add({ type: 'workout', title: splits[i % 5] + ' day', category: splits[i % 5], date: d(n), weight: 60 + i * 3, sets: 16 }));
  add({ type: 'transaction', title: 'Salary', amount: 85000, kind: 'Income', category: 'Salary', date: d(new Date().getDate() - 1) });
  add({ type: 'transaction', title: 'Freelance — logo', amount: 12000, kind: 'Income', category: 'Freelance', date: d(2) });
  [['Swiggy', 420, 'Food'], ['Whey protein', 3200, 'Supplements'], ['Uber', 260, 'Travel'], ['Netflix', 649, 'Bills'], ['Dinner date', 2100, 'Dates'], ['Keyboard', 4500, 'Tech'], ['Groceries', 1350, 'Food'], ['Electricity', 1800, 'Bills'], ['Coffee', 240, 'Food'], ['Shirt', 1600, 'Shopping'], ['Creatine', 900, 'Supplements'], ['Metro card', 500, 'Travel']]
    .forEach(([title, amount, category], i) => add({ type: 'transaction', title, amount, kind: 'Expense', category, date: d(i % 13) }));
  [['Whey Isolate', 'MuscleBlaze', 6], ['Creatine', 'ON', 40], ['Omega-3', 'HealthKart', 9]].forEach(([title, brand, remaining]) => add({ type: 'supplement', title, brand, remaining }));
  [['Blinding Lights', 'The Weeknd', 'Hype'], ['Kesariya', 'Arijit Singh', 'Love'], ['Starboy', 'The Weeknd', 'Gym']].forEach(([title, artist, mood]) => add({ type: 'music', title, artist, mood }));
  add({ type: 'learning', title: 'JavaScript — The Odin Project', category: 'Coding', status: 'Learning', progress: 40 });
  add({ type: 'client', title: 'Aurora Labs', status: 'Active', value: 45000, nextStep: 'Send homepage draft' });
  add({ type: 'note', title: 'Ideas for MANAS-ONE811', description: 'Sync with Adithri, habit tracker, AI weekly review.' });
  return R;
};
NX.loadDemo = () => { NX.data.records = NX.data.records.filter(r => !r.demo).concat(NX.demo()); NX.prefs.demoLoaded = true; NX.save(); NX.savePrefs(); };
NX.clearDemo = () => { NX.data.records = NX.data.records.filter(r => !r.demo); NX.save(); };
