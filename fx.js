/* =========================================================
   FX — the living particle "aura" behind everything + spotlight on shards.
   Particles drift, link to each other, and flee from your finger.
   ========================================================= */
(function () {
  const cv = document.getElementById('aura'), ctx = cv.getContext('2d');
  let W, H, pts = [], touch = { x: -999, y: -999 }, color = '255,106,26';
  const resize = () => { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; };
  resize(); addEventListener('resize', resize);
  const N = Math.min(36, Math.floor(innerWidth / 24));
  for (let i = 0; i < N; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .4 });

  NX.refreshAuraColor = () => {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--a1').trim();
    const m = c.match(/^#(..)(..)(..)$/); if (m) color = m.slice(1).map(h => parseInt(h, 16)).join(',');
  };
  const move = e => { const p = e.touches ? e.touches[0] : e; touch.x = p.clientX * devicePixelRatio; touch.y = p.clientY * devicePixelRatio;
    document.querySelectorAll('.shard').forEach(s => { const r = s.getBoundingClientRect(); s.style.setProperty('--mx', p.clientX - r.left + 'px'); s.style.setProperty('--my', p.clientY - r.top + 'px'); }); };
  addEventListener('pointermove', move, { passive: true }); addEventListener('touchmove', move, { passive: true });

  let frame;
  const loop = () => {
    if (document.hidden || document.body.classList.contains('no-aura') || matchMedia('(prefers-reduced-motion: reduce)').matches) { frame = 0; return; }
    ctx.clearRect(0, 0, W, H);
    const D = 120 * devicePixelRatio;
    for (const p of pts) {
      const dx = p.x - touch.x, dy = p.y - touch.y, d = Math.hypot(dx, dy);
      if (d < D) { p.vx += dx / d * .06; p.vy += dy / d * .06; }
      p.vx *= .985; p.vy *= .985; p.x += p.vx + .05; p.y += p.vy - .04;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.fillStyle = `rgba(${color},.7)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, 7); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D) { ctx.strokeStyle = `rgba(${color},${.14 * (1 - d / D)})`; ctx.lineWidth = devicePixelRatio * .6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    frame = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !frame) frame = requestAnimationFrame(loop); });
  frame = requestAnimationFrame(loop);
})();

NX.haptic = (ms = 8) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
