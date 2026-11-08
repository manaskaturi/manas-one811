/* =========================================================
   UI helpers — toast, bottom sheet, auto-generated forms, generic lists.
   A "field" is: [key, label, kind, required|options]
   kinds: text, textarea, number, date, url, select
   ========================================================= */
NX.toast = msg => {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); NX.haptic(12);
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
};

NX.openSheet = html => {
  document.getElementById('sheetBody').innerHTML = `<button class="sheet-back" type="button" aria-label="Close dialog">← <span>Back</span></button>` + html;
  const sheet = document.getElementById('sheet'); sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); sheet.removeAttribute('inert');
  document.body.classList.add('sheet-open');
  document.getElementById('sheetBody').querySelector('.sheet-back').onclick = NX.closeSheet;
};
NX.closeSheet = () => { const sheet = document.getElementById('sheet'); sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); sheet.setAttribute('inert', ''); document.body.classList.remove('sheet-open'); document.getElementById('sheetBody').replaceChildren(); };
document.getElementById('sheet').addEventListener('click', e => { if (e.target.id === 'sheet') NX.closeSheet(); });

NX.fieldHTML = ([key, label, kind, opt], val = '') => {
  const v = NX.esc(val), req = opt === 1 ? 'required' : '';
  let input;
  if (kind === 'textarea') input = `<textarea name="${key}" ${req}>${v}</textarea>`;
  else if (kind === 'select') input = `<select name="${key}">${opt.map(o => `<option ${o == val ? 'selected' : ''}>${NX.esc(o)}</option>`).join('')}</select>`;
  else input = `<input name="${key}" type="${kind}" value="${v}" ${req} ${kind === 'number' ? 'step="any" inputmode="decimal"' : ''}>`;
  return `<label class="field"><span class="mono dim">${NX.esc(label)}</span>${input}</label>`;
};

/* Opens a form for a module; onSave receives the record object */
NX.photoData = async file => {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose an image file');
  if (file.size > 12 * 1024 * 1024) throw new Error('Each photo must be under 12 MB');
  const src = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
  const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });
  const scale = Math.min(1, 1500 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return { name: file.name, type: 'image/jpeg', data: c.toDataURL('image/jpeg', .78) };
};
NX.form = ({ title, fields, record = {}, onSave, onDelete }) => {
  NX.openSheet(`<h3>${NX.esc(title)}</h3><form id="nxForm">
    ${fields.map(f => NX.fieldHTML(f, record[f[0]] ?? '')).join('')}
    <section class="photo-field"><div class="mono dim">PHOTOS & IMAGES</div><p class="dim tiny">Attach up to 8 photos. Images are resized for storage.</p>
      <label class="btn small photo-pick">＋ Add photos<input id="nxPhotos" type="file" accept="image/*" multiple hidden></label>
      <div class="photo-grid" id="nxPhotoGrid"></div></section>
    <section class="photo-field"><div class="mono dim">ATTACHMENTS</div><p class="dim tiny">Optional · PDFs, documents, audio, and video. Up to 8 files, 2 MB each, 2.5 MB total per item.</p><label class="btn small photo-pick">＋ Add files<input id="nxFiles" type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,audio/*,video/*" hidden></label><div class="attachment-list" id="nxAttachmentList"></div></section>
    ${record.type === 'music' ? `<section class="photo-field"><div class="mono dim">AUDIO FILE</div><p class="dim tiny">Optional · MP3, WAV, M4A, or another browser-supported format. Stored on this device.</p><label class="btn small photo-pick">♫ Choose audio<input id="nxAudio" type="file" accept="audio/*" hidden></label><div id="nxAudioPreview" class="audio-preview"></div></section>` : ''}
    <div class="actions">
      ${onDelete ? '<button type="button" class="btn small" id="nxDel">Delete</button>' : '<span></span>'}
      <button class="btn solid" id="nxSave">Save</button>
    </div></form>`);
  const form = document.getElementById('nxForm');
  let photos = [...(record.photos || [])];
  let attachments = [...(record.attachments || [])].filter(file => typeof file?.data === 'string' && /^data:[\w.+-]+\/[\w.+-]+;base64,[A-Za-z0-9+/=]+$/.test(file.data));
  let audio = record.audio || null;
  const grid = form.querySelector('#nxPhotoGrid');
  const paint = () => { grid.innerHTML = photos.map((p,i) => `<div class="photo-thumb"><img src="${NX.photoSource(p)}" alt="Attached photo"><button type="button" data-photo-remove="${i}" aria-label="Remove photo">×</button></div>`).join(''); grid.querySelectorAll('[data-photo-remove]').forEach(b => b.onclick = () => { photos.splice(+b.dataset.photoRemove,1); paint(); }); };
  paint();
  const filesInput = form.querySelector('#nxFiles');
  const filesList = form.querySelector('#nxAttachmentList');
  const paintFiles = () => {
    filesList.innerHTML = attachments.map((file, index) => `<div class="audio-file"><a class="attachment-link" href="${NX.esc(file.data)}" download="${NX.esc(file.name || 'Attachment')}" target="_blank" rel="noopener">${NX.esc(file.name || 'Attachment')} · ${NX.esc(file.type || 'file')} · Open / download</a><button type="button" class="btn small" data-file-remove="${index}" aria-label="Remove ${NX.esc(file.name || 'attachment')}">Remove</button></div>`).join('') || '<div class="dim tiny">No files attached.</div>';
    filesList.querySelectorAll('[data-file-remove]').forEach(button => button.onclick = () => { attachments.splice(Number(button.dataset.fileRemove), 1); paintFiles(); });
  };
  paintFiles();
  filesInput.onchange = async event => {
    const selected = [...(event.target.files || [])];
    const rejection = NX.filePolicy.validateAttachments(attachments, selected);
    if (rejection) { NX.toast({ count: 'Maximum 8 attachments per item', type: 'Choose a supported image, document, audio, or video file', 'file-size': 'Each file must be 2 MB or smaller', 'total-size': 'Keep total attachments under 2.5 MB per item' }[rejection]); event.target.value = ''; return; }
    const saveButton = form.querySelector('#nxSave'); saveButton.disabled = true; saveButton.textContent = 'Preparing files…';
    try {
      for (const file of selected) {
        const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        if (typeof data === 'string') attachments.push({ name: file.name, type: file.type, size: file.size, data });
      }
      paintFiles();
    } catch (error) { NX.toast('Could not read the selected file'); }
    finally { saveButton.disabled = false; saveButton.textContent = 'Save'; event.target.value = ''; }
  };
  const audioInput = form.querySelector('#nxAudio');
  if (audioInput) {
    const audioPreview = form.querySelector('#nxAudioPreview');
    const paintAudio = () => { audioPreview.replaceChildren(); if (!audio) { audioPreview.innerHTML = '<div class="dim tiny">No audio attached.</div>'; return; } const row = document.createElement('div'); row.className = 'audio-file'; const name = document.createElement('span'); name.textContent = audio.name; const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn small'; remove.setAttribute('aria-label', 'Remove audio'); remove.textContent = 'Remove'; remove.onclick = () => { audio = null; paintAudio(); }; row.append(name, remove); const player = document.createElement('audio'); player.controls = true; player.preload = 'none'; player.src = audio.data; audioPreview.append(row, player); };
    paintAudio();
    audioInput.onchange = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const rejection = NX.filePolicy.validateAudio(file.type, file.size);
      if (rejection) { NX.toast(rejection === 'type' ? 'Choose a supported audio file' : 'Audio must be 2 MB or smaller'); event.target.value = ''; return; }
      const reader = new FileReader();
      reader.onload = () => { audio = { name: file.name, type: file.type, data: typeof reader.result === 'string' ? reader.result : '' }; paintAudio(); };
      reader.onerror = () => NX.toast('Could not read audio file');
      reader.readAsDataURL(file);
    };
  }
  form.querySelector('#nxPhotos').onchange = async e => {
    const files = [...e.target.files];
    if (photos.length + files.length > 8) { NX.toast('Maximum 8 photos per item'); e.target.value=''; return; }
    const saveBtn = form.querySelector('#nxSave'); saveBtn.disabled = true; saveBtn.textContent = 'Preparing photos…';
    try { for (const file of files) photos.push(await NX.photoData(file)); paint(); }
    catch (err) { NX.toast(err.message || 'Could not read photo'); }
    finally { saveBtn.disabled = false; saveBtn.textContent = 'Save'; e.target.value=''; }
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const out = { ...record, photos, attachments, ...(record.type === 'music' ? { audio } : {}) };
    fields.forEach(([k, , kind]) => { const v = form.elements[k].value; out[k] = kind === 'number' && v !== '' ? Number(v) : v; });
    const saveBtn = form.querySelector('#nxSave'); saveBtn.disabled = true;
    try { await onSave(out); NX.closeSheet(); NX.toast('Saved ✦'); }
    catch (err) { saveBtn.disabled = false; NX.toast(err.message || 'Could not save'); }
  };
  if (onDelete) document.getElementById('nxDel').onclick = async () => { if (confirm('Delete this forever?')) { const button = document.getElementById('nxDel'); button.disabled = true; try { await onDelete(); NX.closeSheet(); NX.toast('Deleted'); } catch (error) { button.disabled = false; NX.toast('Could not save the deletion'); } } };
};

NX.bar = p => `<div class="bar"><i style="width:${Math.max(0, Math.min(100, +p || 0))}%"></i></div>`;
NX.money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
NX.fmtDate = d => d ? new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

// Dialogs can always be dismissed with Escape or the visible Back control.
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('sheet').classList.contains('open')) NX.closeSheet(); });
