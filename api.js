/* =========================================================
   FREE APIs — no keys, no cost.
   - Open-Meteo: weather       https://open-meteo.com
   - Open-Meteo geocoding: city → coordinates
   - open.er-api.com: currency rates
   - Advice Slip: a daily thought
   Results are cached in localStorage so the app stays fast & works offline.
   ========================================================= */
NX.cached = async (key, ttlMin, fn) => {
  let c = null;
  try { c = JSON.parse(localStorage.getItem('nx.cache.' + key) || 'null'); } catch (e) { localStorage.removeItem('nx.cache.' + key); }
  if (c && Date.now() - c.t < ttlMin * 60000) return c.v;
  try {
    const v = await fn();
    localStorage.setItem('nx.cache.' + key, JSON.stringify({ t: Date.now(), v }));
    return v;
  } catch (e) { return c ? c.v : null; }
};
const getJSON = url => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

const WMO = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
  61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Snow', 80: 'Showers', 81: 'Showers', 82: 'Storm showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' };

NX.api = {
  async weather(city) {
    city = city || 'Hyderabad';
    return NX.cached('wx.' + city, 30, async () => {
      const g = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(city)}`);
      const p = g.results && g.results[0]; if (!p) throw new Error('city');
      const w = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`);
      return { city: p.name, temp: Math.round(w.current.temperature_2m), wind: w.current.wind_speed_10m, desc: WMO[w.current.weather_code] || '—',
        hi: Math.round(w.daily.temperature_2m_max[0]), lo: Math.round(w.daily.temperature_2m_min[0]) };
    });
  },
  rates() {
    return NX.cached('fx', 720, async () => (await getJSON('https://open.er-api.com/v6/latest/INR')).rates);
  },
  thought() {
    return NX.cached('advice', 360, async () => (await getJSON('https://api.adviceslip.com/advice?t=' + Date.now())).slip.advice);
  },
};
