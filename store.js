/* =========================================================
   STORE — all data lives in the browser (localStorage).
   Every record: { id, type, title, ...fields, created, updated }
   Our World records are NOT here — they live encrypted in vault.js.
   ========================================================= */
window.NX = window.NX || {};

NX.KEY = 'nexus.data.v1';          // same key as v1, so your old data carries over
NX.PREF = 'nexus.prefs';
NX.uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
NX.today = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); };
NX.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
NX.photoSource = photo => {
  const source = typeof photo?.data === 'string' ? photo.data : '';
  return /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(source) ? source : '';
};
NX.safeLink = value => {
  try { const url = new URL(String(value || '')); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
  catch (e) { return ''; }
};

NX.themes = [
  ['chrome', 'Midnight Chrome', ['#040506', '#cfd8e3', '#7aa2c8']],
  ['ember', 'Obsidian Ember', ['#050505', '#ff6a1a', '#ffb347']],
  ['bloodmoon', 'Blood Moon', ['#050203', '#ff2846', '#ff7a8a']],
  ['abyss', 'Abyss', ['#02050a', '#00e0ff', '#3dffc5']],
  ['venom', 'Venom', ['#030503', '#8cff3c', '#d4ff6a']],
  ['royale', 'Noir Royale', ['#050403', '#e8b84a', '#fff0b8']],
  ['ultraviolet', 'Ultraviolet', ['#040309', '#b46bff', '#ff5fd2']],
  ['arctic', 'Arctic Glass', ['#07121c', '#72d6ff', '#d5f5ff']],
  ['forest', 'Deep Forest', ['#06110d', '#67d6a0', '#c2f2d7']],
  ['copper', 'Burnished Copper', ['#130b08', '#d98b62', '#ffd0a8']],
  ['paper', 'Porcelain Light', ['#f3f5f8', '#3457d5', '#111827']],
  ['sand', 'Warm Sand', ['#f4efe6', '#9a5b2e', '#29231e']],
  ['mint', 'Mint Studio', ['#eaf6f1', '#167c68', '#183b35']],
  ['titanium', 'Titanium', ['#f2f3f5', '#555d68', '#111827']],
  ['glacier', 'Glacier Blue', ['#edf5ff', '#2463a8', '#122b49']],
  ['lavender', 'Soft Lavender', ['#f3efff', '#7256c8', '#30234f']],
  ['rose', 'Rose Quartz', ['#fff0f2', '#bd526b', '#48202d']],
  ['citrus', 'Citrus', ['#f5f7e8', '#6e8524', '#293411']],
  ['ocean', 'Pacific', ['#e9f5f7', '#167d91', '#153b4a']],
];

/* FONT PRESETS — [id, name, heading, body, mono, google-fonts query]
   Add one: pick fonts on fonts.google.com and add a line here. */
NX.fonts = [
  ['apple', 'SF Pro (iPhone native)', '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Tight"', '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter"', 'ui-monospace, "SF Mono", "JetBrains Mono"', 'family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500', true],
  ['grotesk', 'Neo Grotesk', 'Space Grotesk', 'Inter', 'JetBrains Mono', 'family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500'],
  ['sora', 'Sora Studio', 'Sora', 'Manrope', 'IBM Plex Mono', 'family=Sora:wght@300;400;600;700&family=Manrope:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500'],
  ['future', 'Future Wide', 'Unbounded', 'Outfit', 'Space Mono', 'family=Unbounded:wght@400;500;700&family=Outfit:wght@400;500;600&family=Space+Mono'],
  ['cyber', 'Cyber Deck', 'Chakra Petch', 'Chakra Petch', 'Share Tech Mono', 'family=Chakra+Petch:wght@400;500;600;700&family=Share+Tech+Mono'],
  ['swiss', 'Swiss Tight', 'Inter Tight', 'Inter Tight', 'DM Mono', 'family=Inter+Tight:wght@300;400;500;600;700&family=DM+Mono:wght@400;500'],
  ['editorial', 'Editorial', 'Instrument Serif', 'DM Sans', 'DM Mono', 'family=Instrument+Serif&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500'],
  ['oxanium', 'Oxanium HUD', 'Oxanium', 'Exo 2', 'Fira Code', 'family=Oxanium:wght@400;500;600;700&family=Exo+2:wght@400;500;600&family=Fira+Code:wght@400;500'],
  ['lexend', 'Easy Read', 'Lexend', 'Lexend', 'Roboto Mono', 'family=Lexend:wght@300;400;500;600&family=Roboto+Mono:wght@400;500'],
  ['manas', 'MANAS Signature', 'Space Grotesk', 'Manrope', 'IBM Plex Mono', 'family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500'],
  ['geist', 'Precision Sans', 'Geist', 'Geist', 'Geist Mono', 'family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500'],
  ['archivo', 'Archivo Industrial', 'Archivo', 'Archivo', 'Space Mono', 'family=Archivo:wght@400;500;600;700&family=Space+Mono'],
  ['plusjakarta', 'Modern Rounded', 'Plus Jakarta Sans', 'Plus Jakarta Sans', 'DM Mono', 'family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500'],
  ['ibmplex', 'IBM Precision', 'IBM Plex Sans', 'IBM Plex Sans', 'IBM Plex Mono', 'family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500'],
  ['rajdhani', 'Tactical Display', 'Rajdhani', 'Inter', 'Share Tech Mono', 'family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Share+Tech+Mono'],
];
NX.sizes = [['0.9', 'Compact'], ['1', 'Default'], ['1.1', 'Large']];

const seed = () => ({
  version: 1,
  records: [],
});

NX.load = () => {
  try {
    const d = JSON.parse(localStorage.getItem(NX.KEY));
    if (d && Array.isArray(d.records)) return d;
  } catch (e) {}
  return seed();
};
NX.data = NX.load();
NX.save = () => localStorage.setItem(NX.KEY, JSON.stringify(NX.data));

NX.list = type => NX.data.records.filter(r => r.type === type);
NX.get = id => NX.data.records.find(r => r.id === id);
NX.upsert = rec => {
  const now = new Date().toISOString();
  const i = NX.data.records.findIndex(r => r.id === rec.id);
  if (i >= 0) NX.data.records[i] = { ...NX.data.records[i], ...rec, updated: now };
  else NX.data.records.unshift({ id: NX.uid(), created: now, updated: now, ...rec });
  NX.save();
};
NX.remove = id => { NX.data.records = NX.data.records.filter(r => r.id !== id); NX.save(); };

const defaultPrefs = { theme: 'chrome', font: 'swiss', zoom: '1', aura: true, layout: 'classic', backdrop: 'ambient', name: 'Manas', city: '', radius: 20, border: 35, density: 'comfortable', accent: '', navMode: 'top' };
NX.prefs = (() => {
  try { const saved = JSON.parse(localStorage.getItem(NX.PREF) || '{}'); return saved && typeof saved === 'object' && !Array.isArray(saved) ? Object.assign(defaultPrefs, saved) : defaultPrefs; }
  catch (e) { return defaultPrefs; }
})();
if (NX.prefs.theme === 'ember') NX.prefs.theme = 'chrome';
NX.savePrefs = () => localStorage.setItem(NX.PREF, JSON.stringify(NX.prefs));
