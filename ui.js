/* Villafañe & Asociados — capa de interfaz compartida: estado, enrutador, componentes, marca. */
(function () {
'use strict';
const VA = window.VA;
const S = VA.S = { token: null, me: null, route: '', modal: null, tabs: {}, filters: {}, ui: {}, sort: {} };
const esc = VA.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
VA.V = {}; VA.C = {}; VA.ACT = {}; VA.FORM = {}; VA.CHG = {}; VA.INP = {};

/* ── almacenamiento local (simula la base de datos del servidor) ── */
const KEY = 'va_demo_v3';
VA.loadDB = () => { try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); if (d && d.version === 3) { VA.persistOK = true; return d; } } } catch (e) { } return VA.seed(); };
VA.saveDB = () => { try { localStorage.setItem(KEY, JSON.stringify(VA.db)); VA.persistOK = true; } catch (e) { VA.persistOK = false; } };
VA.resetDB = () => { try { localStorage.removeItem(KEY); sessionStorage.clear(); } catch (e) { } VA.db = VA.seed(); VA.server = VA.createApi(VA.db, { persist: VA.saveDB }); VA.saveDB(); S.token = null; S.me = null; S.filters = {}; };
const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { } } };
VA.ss = ss;
VA.A = () => VA.server.as(S.token);
VA.filter = (view, patch) => { S.filters[view] = Object.assign({}, S.filters[view] || {}, patch || {}); ss.set('va_filters', JSON.stringify(S.filters)); return S.filters[view]; };
VA.F = view => S.filters[view] || {};

/* ── íconos de línea ── */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  wallet: '<path d="M4 7h15.5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1.5 1.5 0 0 1-1.5-1.5V6A2 2 0 0 1 5.5 4H17v3"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  file: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="m9 5 7 7-7 7"/>',
  logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6a9.6 9.6 0 0 1 1.4-.1c6 0 9.5 6.1 9.5 6.1a17 17 0 0 1-2.7 3.4M6.2 7.6C3.9 9.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4.4-1.1"/><path d="M9.9 10a2.8 2.8 0 0 0 4 4"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17v.4"/>',
  task: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/>',
  card: '<rect x="2.5" y="5.5" width="19" height="13" rx="1.5"/><path d="M2.5 10h19M6 15h4"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  kanban: '<rect x="3.5" y="4" width="5" height="16" rx="1"/><rect x="9.5" y="4" width="5" height="10" rx="1"/><rect x="15.5" y="4" width="5" height="13" rx="1"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  scale: '<path d="M12 3v18M7 21h10M4 7h16"/><path d="m4 7-2.5 6a3 3 0 0 0 5 0zM20 7l-2.5 6a3 3 0 0 0 5 0z"/>',
  phone: '<path d="M5 4h4l1.5 4.5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5L20 15v4a1.5 1.5 0 0 1-1.5 1.5A16 16 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'
};
const icon = VA.icon = (n, cls) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ' class="' + cls + '"' : ''}>${ICONS[n] || ''}</svg>`;

/* ── marca: monograma VA ──
   La V comparte su trazo derecho con la pierna izquierda de la A: un perfil de techo a dos aguas.
   Trazos gruesos y finos al modo didot; el travesaño de la A es el único acento dorado. */
VA.mark = (size, o) => {
  o = o || {}; const c = o.color || 'currentColor'; const g = o.mono ? c : (o.gold || '#B69A62');
  return `<svg width="${size}" height="${size}" viewBox="0 0 52 52" fill="none" aria-hidden="true" style="flex:none">
<rect x="1" y="1" width="50" height="50" stroke="${c}" stroke-width="1"/>
<rect x="4" y="4" width="44" height="44" stroke="${c}" stroke-width=".5" opacity=".5"/>
<path d="M10.2 12 L19.5 40" stroke="${c}" stroke-width="3.6"/>
<path d="M19.5 40 L29 12" stroke="${c}" stroke-width="1.15"/>
<path d="M29 12 L38.3 40" stroke="${c}" stroke-width="3.6"/>
<path d="M22.9 30 H35.1" stroke="${g}" stroke-width="1.3"/>
<path d="M6.8 12 H14.4 M25.6 12 H32.6 M34.6 40 H42" stroke="${c}" stroke-width="1"/>
</svg>`;
};
VA.wordmark = (o) => { o = o || {}; return `<span class="wordmark"${o.color ? ` style="color:${o.color}"` : ''}>${VA.mark(o.size || 40, o)}<span class="wm-t"><b>VILLAFAÑE</b><small${o.color ? ' style="color:inherit;opacity:.62"' : ''}><i${o.color ? ' style="color:#C6AC76"' : ''}>&amp;</i> ASOCIADOS</small></span></span>`; };
VA.favicon = () => { try { const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><rect width="52" height="52" fill="#0B1726"/>${VA.mark(52, { color: '#F7F4EE' }).replace(/<svg[^>]*>|<\/svg>/g, '')}</svg>`; let l = document.querySelector('link[rel="icon"]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); } l.href = 'data:image/svg+xml,' + encodeURIComponent(svg); } catch (e) { } };

/* ── ilustración arquitectónica: fachada Beaux-Arts porteña (dibujo de línea) ── */
VA.facade = (stroke, opts) => {
  stroke = stroke || '#B69A62'; opts = opts || {};
  const L = 40, R = 360, bay = (R - L) / 5; let s = '';
  const line = (x1, y1, x2, y2, w, o) => `<path d="M${x1} ${y1}L${x2} ${y2}"${w ? ' stroke-width="' + w + '"' : ''}${o ? ' opacity="' + o + '"' : ''}/>`;
  // cúpula y linterna
  s += `<path d="M146 122 Q146 50 200 38 Q254 50 254 122" stroke-width="1.3"/>`;
  for (let i = -2; i <= 2; i++) if (i) s += `<path d="M200 39 Q${200 + i * 26} 64 ${200 + i * 22} 122" opacity=".55"/>`;
  s += line(200, 39, 200, 122, .8, .55);
  s += `<rect x="190" y="18" width="20" height="20"/><path d="M188 18 Q200 4 212 18"/>` + line(200, 0, 200, 8);
  s += line(140, 122, 260, 122, 1.2);
  // mansarda con buhardillas
  s += `<path d="M${L} 162 L${L + 22} 126 L${R - 22} 126 L${R} 162 Z"/>`;
  for (let i = 0; i < 5; i++) { if (i === 2) continue; const cx = L + bay * i + bay / 2; s += `<path d="M${cx - 9} 156 V140 Q${cx} 130 ${cx + 9} 140 V156"/>`; }
  // cornisa
  [162, 167, 173].forEach((y, k) => { s += line(L - 10 + k * 3, y, R + 10 - k * 3, y, k === 0 ? 1.3 : .8); });
  for (let x = L - 6; x <= R + 6; x += 8) s += line(x, 167, x, 173, .6, .6);
  // impostas
  [252, 334, 414].forEach(y => { s += line(L - 4, y, R + 4, y, 1); s += line(L - 4, y + 4, R + 4, y + 4, .5, .6); });
  // pilastras
  for (let i = 0; i <= 5; i++) { const x = L + bay * i; s += line(x - 3, 173, x - 3, 414, .7, .7) + line(x + 3, 173, x + 3, 414, .7, .7); }
  // pisos
  for (let i = 0; i < 5; i++) {
    const cx = L + bay * i + bay / 2, w = 26;
    // ático
    s += `<rect x="${cx - w / 2}" y="186" width="${w}" height="50"/>` + line(cx - w / 2 - 4, 182, cx + w / 2 + 4, 182, .8);
    s += line(cx, 186, cx, 236, .5, .5);
    // segundo piso con frontón
    s += `<rect x="${cx - w / 2}" y="268" width="${w}" height="54"/><path d="M${cx - w / 2 - 5} 266 L${cx} 254.5 L${cx + w / 2 + 5} 266 Z"/>` + line(cx, 268, cx, 322, .5, .5);
    // piso noble: ventanas en arco y balcón
    s += `<path d="M${cx - w / 2} 404 V360 Q${cx - w / 2} 344 ${cx} 344 Q${cx + w / 2} 344 ${cx + w / 2} 360 V404"/>` + line(cx, 350, cx, 404, .5, .5);
    s += line(cx - w / 2 - 7, 398, cx + w / 2 + 7, 398, .9) + line(cx - w / 2 - 7, 410, cx + w / 2 + 7, 410, .9);
    for (let x = cx - w / 2 - 5; x <= cx + w / 2 + 5; x += 4) s += line(x, 398, x, 410, .5, .7);
  }
  // planta baja almohadillada
  for (let y = 426; y < 500; y += 11) s += line(L, y, R, y, .5, .55);
  for (let i = 0; i < 5; i++) {
    const cx = L + bay * i + bay / 2;
    if (i === 2) s += `<path d="M${cx - 19} 500 V454 Q${cx - 19} 432 ${cx} 432 Q${cx + 19} 432 ${cx + 19} 454 V500" stroke-width="1.3"/>` + line(cx, 440, cx, 500, .6, .6);
    else s += `<path d="M${cx - 12} 490 V458 Q${cx - 12} 446 ${cx} 446 Q${cx + 12} 446 ${cx + 12} 458 V490"/>`;
  }
  s += line(L, 500, R, 500, 1.2) + line(L, 173, L, 500, 1) + line(R, 173, R, 500, 1);
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="${opts.slice ? 'xMidYMax slice' : 'xMidYMid meet'}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${stroke}" stroke-width="1" stroke-linecap="square" aria-hidden="true">${s}</svg>`;
};

/* ── componentes ── */
const TONE = {
  ok: ['Activo', 'Pagada', 'Aceptado', 'Aprobado', 'Confirmado', 'Cliente incorporado', 'Verificado manualmente', 'Recibido', 'Disponible', 'Presupuesto aceptado'],
  bad: ['Vencida', 'Rechazado', 'Fallido', 'Urgente', 'Requiere reemplazo', 'Vencido', 'Licencia', 'Desactivado'],
  warn: ['Pendiente de documentación', 'Pendiente de aprobación', 'Pendiente de pago', 'Parcialmente pagada', 'Reprogramación propuesta', 'Pendiente de revisión', 'Pendiente', 'En revisión', 'Pendiente de verificación', 'Alta', 'Reembolso parcial', 'Agenda completa', 'Primer intento de contacto', 'Presupuesto en preparación'],
  info: ['Procesando', 'Emitida', 'Emitido', 'En evaluación', 'Nuevo', 'Nuevo contacto', 'Contactado', 'Reunión solicitada', 'Reunión agendada', 'Solicitado', 'Pago confirmado'],
  gold: ['Enviado', 'Presupuesto enviado']
};
VA.tone = s => { for (const k in TONE) if (TONE[k].includes(s)) return k; return ''; };
VA.pill = (s, label) => `<span class="pill ${VA.tone(s)}">${esc(label || s)}</span>`;
VA.initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
VA.avatar = (name, photo, cls) => photo ? `<img class="avatar ${cls || ''}" src="${esc(photo)}" alt="" loading="lazy">` : `<span class="avatar ${cls || ''}" aria-hidden="true">${esc(VA.initials(name))}</span>`;
VA.empty = (ic, title, text, action) => `<div class="empty">${icon(ic)}<strong>${esc(title)}</strong>${text ? `<p class="small">${esc(text)}</p>` : ''}${action || ''}</div>`;
VA.notice = (ic, html, tone) => `<div class="notice ${tone || ''}">${icon(ic)}<div>${html}</div></div>`;
VA.kv = pairs => `<dl class="kv">${pairs.filter(Boolean).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v == null || v === '' ? '<span class="muted">—</span>' : v}</dd>`).join('')}</dl>`;
VA.money$ = (c, cur) => esc(VA.money(c, cur));
VA.opts = (list, sel, ph) => (ph != null ? `<option value="">${esc(ph)}</option>` : '') + list.map(o => { const v = typeof o === 'object' ? o.v : o, l = typeof o === 'object' ? o.l : o; return `<option value="${esc(v)}"${String(v) === String(sel == null ? '' : sel) ? ' selected' : ''}>${esc(l)}</option>`; }).join('');

/* Tabla responsive: columnas {k,l,cls,sort,lead,fn(row)}. Se vuelve tarjetas en pantallas angostas. */
VA.table = (id, cols, rows, o) => {
  o = o || {}; const st = S.sort[id] || o.defaultSort || null;
  let data = rows.slice();
  if (st) { const col = cols.find(c => c.k === st.k); if (col) { const g = col.sortv || (r => r[col.k]); data.sort((a, b) => { const x = g(a), y = g(b); return (x > y ? 1 : x < y ? -1 : 0) * (st.dir === 'desc' ? -1 : 1); }); } }
  if (!data.length) return o.empty || VA.empty('folder', 'Sin resultados', 'Probá con otros filtros.');
  return `<div class="tw"><table class="t rt"><thead><tr>${cols.map(c => `<th class="${c.cls || ''}" scope="col">${c.sort !== false && !o.nosort ? `<button data-act="sort" data-t="${id}" data-k="${c.k}">${esc(c.l)}${st && st.k === c.k ? (st.dir === 'desc' ? ' ↓' : ' ↑') : ''}</button>` : esc(c.l)}</th>`).join('')}</tr></thead><tbody>${data.map(r => `<tr${o.go ? ` class="click" data-go="${esc(o.go(r))}" tabindex="0"` : ''}>${cols.map(c => `<td class="${c.cls || ''}${c.lead ? ' lead' : ''}" data-l="${esc(c.l)}">${c.fn ? c.fn(r) : esc(r[c.k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
};
VA.ACT.sort = el => { const id = el.dataset.t, k = el.dataset.k; const cur = S.sort[id]; S.sort[id] = { k, dir: cur && cur.k === k && cur.dir === 'asc' ? 'desc' : 'asc' }; VA.refresh(); };

VA.bars = (items, fmt) => { const max = Math.max(1, ...items.map(i => i.value)); return `<div class="bars">${items.map(i => `<div class="bar-row"><span>${esc(i.name)}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${Math.round(i.value * 100 / max)}%"></span></span><span class="small nowrap">${esc(fmt ? fmt(i.value) : i.value)}</span></div>`).join('')}</div>`; };
VA.colChart = (pts, fmt) => {
  const W = 560, H = 210, padL = 8, padB = 26, padT = 24; const n = pts.length; const max = Math.max(1, ...pts.map(p => p.value)); const bw = (W - padL * 2) / n;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ingresos por mes">`;
  [0.5, 1].forEach(f => { const y = H - padB - (H - padB - padT) * f; s += `<line class="grid" x1="0" x2="${W}" y1="${y}" y2="${y}"/>`; });
  s += `<line class="grid" x1="0" x2="${W}" y1="${H - padB}" y2="${H - padB}"/>`;
  pts.forEach((p, i) => { const h = (H - padB - padT) * p.value / max; const x = padL + i * bw + bw * .22; const w = bw * .56; const y = H - padB - h;
    s += `<rect class="colm${i === n - 1 ? ' last' : ''}" x="${x}" y="${y}" width="${w}" height="${Math.max(h, p.value ? 2 : 0)}" rx="2"><title>${esc(p.label + ': ' + (fmt ? fmt(p.value) : p.value))}</title></rect>`;
    s += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${esc(p.label)}</text>`;
    if (p.value) s += `<text class="val" x="${x + w / 2}" y="${y - 7}" text-anchor="middle">${esc(VA.moneyShort(p.value).replace('USD ', ''))}</text>`; });
  return `<div class="chart">${s}</svg></div>`;
};

/* ── toasts, modal, confirmación ── */
VA.toast = (msg, tone) => { const box = document.getElementById('toasts'); const t = document.createElement('div'); t.className = 'toast ' + (tone || ''); t.setAttribute('role', tone === 'bad' ? 'alert' : 'status'); t.innerHTML = icon(tone === 'bad' ? 'alert' : tone === 'ok' ? 'check' : 'info') + '<span>' + esc(msg) + '</span>'; t.querySelector('svg').style.cssText = 'width:18px;height:18px;flex:none;margin-top:1px'; box.appendChild(t); setTimeout(() => t.remove(), tone === 'bad' ? 6500 : 4200); };
VA.openModal = (m) => { S.modal = m; VA.refresh(); setTimeout(() => { const f = document.querySelector('.modal [autofocus], .modal input:not([type=hidden]), .modal select, .modal textarea, .modal button'); if (f) f.focus(); }, 30); };
VA.closeModal = () => { S.modal = null; VA.refresh(); };
VA.ACT.closeModal = () => VA.closeModal();
VA.confirm = (o, fn) => { S.confirmFn = fn; VA.openModal({ title: o.title, body: `<p>${esc(o.text)}</p>${o.extra || ''}`, foot: `<button class="btn" data-act="closeModal">Volver</button><button class="btn ${o.danger ? 'danger' : 'primary'}" data-act="confirmYes">${esc(o.label || 'Confirmar')}</button>` }); };
VA.ACT.confirmYes = () => { const f = S.confirmFn; S.confirmFn = null; S.modal = null; if (f) f(); else VA.refresh(); };
function modalHTML() {
  const m = S.modal; if (!m) return '';
  return `<div class="modal-wrap" data-act="modalBg"><div class="modal ${m.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="modal-h"><h2 id="mt">${esc(m.title)}</h2><button class="btn ghost icon" data-act="closeModal" aria-label="Cerrar">${icon('x')}</button></div>${m.form ? `<form data-form="${m.form}" novalidate>` : ''}<div class="modal-b">${m.body}</div>${m.foot ? `<div class="modal-f">${m.foot}</div>` : ''}${m.form ? '</form>' : ''}</div></div>`;
}
VA.ACT.modalBg = (el, e) => { if (e.target === el) VA.closeModal(); };

/* ── errores de la API ── */
VA.handle = e => {
  if (e && e.code === 'SESSION') { S.token = null; S.me = null; ss.set('va_tok', null); VA.toast(e.message, 'bad'); S.modal = null; VA.go('ingresar'); return; }
  if (e && e.code) { VA.toast(e.message, 'bad'); return; }
  console.error(e); VA.toast('Algo no funcionó como esperábamos. Volvé a intentarlo; si persiste, restablecé los datos de la demo.', 'bad');
};
VA.run = (fn, ok) => { try { const r = fn(); if (ok) VA.toast(ok, 'ok'); VA.refresh(); return r === undefined ? true : r; } catch (e) { VA.handle(e); return undefined; } };

/* ── enrutador ── */
const PUBLIC = ['', 'ingresar', 'privacidad', 'terminos', 'acerca'];
VA.go = r => { S.route = r; S.modal = null; S.ui.navOpen = false; S.ui.searchOpen = false; try { if (decodeURIComponent(location.hash.slice(1)) !== r) location.hash = r; } catch (e) { } VA.render(); window.scrollTo(0, 0); };
window.addEventListener('hashchange', () => { const r = decodeURIComponent(location.hash.slice(1)); if (r !== S.route) { S.route = r; S.modal = null; VA.render(); window.scrollTo(0, 0); } });
VA.split = r => { const i = r.indexOf('.'); return i < 0 ? [r, null] : [r.slice(0, i), r.slice(i + 1)]; };

VA.refresh = () => {
  const y = window.scrollY; const a = document.activeElement; const id = a && a.id; let sel = null;
  try { if (id && a.selectionStart != null) sel = [a.selectionStart, a.selectionEnd]; } catch (e) { }
  VA.render(); window.scrollTo(0, y);
  if (id) { const n = document.getElementById(id); if (n) { n.focus({ preventScroll: true }); if (sel) try { n.setSelectionRange(sel[0], sel[1]); } catch (e) { } } }
};

VA.render = () => {
  const app = document.getElementById('app');
  if (S.token && !S.me) S.token = null;
  if (S.me) { try { VA.server.auth.resolve(S.token) || (S.me = null, S.token = null, ss.set('va_tok', null)); } catch (e) { } }
  const [name, arg] = VA.split(S.route || '');
  let html;
  if (PUBLIC.includes(name) && !(name === 'ingresar' && S.me)) {
    const v = { '': VA.V.home, ingresar: VA.V.login, privacidad: VA.V.privacy, terminos: VA.V.terms, acerca: VA.V.about }[name];
    html = v(arg);
    document.title = 'Villafañe & Asociados';
  } else if (!S.me) {
    S.after = S.route; html = VA.V.login();
  } else {
    const route = name === 'ingresar' ? 'panel' : name;
    if (name === 'ingresar') S.route = 'panel';
    html = VA.shell(route, arg);
  }
  app.innerHTML = html + modalHTML();
  (S.afterRender || []).forEach(f => { try { f(); } catch (e) { console.error(e); } }); S.afterRender = [];
};
VA.after = f => { (S.afterRender = S.afterRender || []).push(f); };

/* ── navegación por rol ── */
function navItems(me) {
  const A = VA.A();
  if (me.role === 'admin') {
    const toApprove = A.can('agenda.gestionar') ? A.meetings({ status: 'Pendiente de aprobación' }).length : 0;
    return [
      { g: 'Operación' }, { r: 'panel', l: 'Panel', i: 'home' },
      { r: 'expedientes', l: 'Expedientes', i: 'folder', p: 'expedientes.todos' },
      { r: 'crm', l: 'CRM', i: 'kanban', p: 'crm.gestionar' },
      { r: 'agenda', l: 'Agenda', i: 'calendar', p: 'agenda.gestionar', n: toApprove },
      { r: 'tareas', l: 'Tareas', i: 'task' },
      { g: 'Finanzas' },
      { r: 'finanzas', l: 'Resumen', i: 'chart', p: 'finanzas.gestionar' },
      { r: 'presupuestos', l: 'Presupuestos', i: 'file', p: 'finanzas.gestionar' },
      { r: 'facturas', l: 'Facturas', i: 'book', p: 'finanzas.gestionar' },
      { r: 'pagos', l: 'Pagos', i: 'wallet', p: 'finanzas.gestionar' },
      { g: 'Firma' },
      { r: 'equipo', l: 'Nuestro equipo', i: 'users' },
      { r: 'clientes', l: 'Clientes', i: 'users' },
      { r: 'plantillas', l: 'Plantillas', i: 'layers', p: 'plantillas.gestionar' },
      { r: 'notificaciones', l: 'Notificaciones', i: 'bell', n: A.unread() },
      { r: 'auditoria', l: 'Auditoría', i: 'shield', p: 'auditoria.ver' },
      { r: 'ajustes', l: 'Ajustes', i: 'settings', p: 'ajustes.gestionar' },
      { r: 'acerca', l: 'Acerca de la demo', i: 'info' }
    ].filter(x => !x.p || A.can(x.p));
  }
  if (me.role === 'lawyer') {
    const toApprove = A.meetings({ status: 'Pendiente de aprobación' }).length;
    return [
      { g: 'Mi trabajo' }, { r: 'panel', l: 'Inicio', i: 'home' }, { r: 'expedientes', l: 'Mis casos', i: 'folder' },
      { r: 'agenda', l: 'Agenda', i: 'calendar', n: toApprove }, { r: 'tareas', l: 'Tareas', i: 'task' },
      { r: 'clientes', l: 'Mis clientes', i: 'users' },
      me.lawyerPerms && me.lawyerPerms.emitirPresupuestos ? { r: 'presupuestos', l: 'Presupuestos', i: 'file' } : null,
      me.lawyerPerms && me.lawyerPerms.verFinanzas ? { r: 'facturas', l: 'Facturación', i: 'book' } : null,
      { g: 'Cuenta' }, { r: 'notificaciones', l: 'Notificaciones', i: 'bell', n: A.unread() },
      { r: 'abogado.' + me.lawyerId, l: 'Mi perfil', i: 'settings' }, { r: 'acerca', l: 'Acerca de la demo', i: 'info' }
    ].filter(Boolean);
  }
  return [
    { g: 'Mi espacio' }, { r: 'panel', l: 'Inicio', i: 'home' }, { r: 'expedientes', l: 'Mis expedientes', i: 'folder' },
    { r: 'documentos', l: 'Documentos', i: 'file' }, { r: 'turnos', l: 'Turnos', i: 'calendar' },
    { r: 'pagos', l: 'Pagos y presupuestos', i: 'wallet' }, { r: 'notificaciones', l: 'Notificaciones', i: 'bell', n: A.unread() },
    { r: 'datos', l: 'Mis datos', i: 'shield' }
  ];
}
const ROLE_LABEL = { admin: 'Administración', lawyer: 'Abogado/a', client: 'Cliente' };

VA.shell = (route, arg) => {
  const me = S.me; let body;
  try {
    const v = VA.V[route];
    body = v ? v(arg) : VA.notFound();
  } catch (e) {
    if (e && (e.code === 'FORBIDDEN' || e.code === 'NOT_FOUND')) body = VA.denied(e);
    else if (e && e.code === 'SESSION') { setTimeout(() => VA.handle(e)); body = ''; }
    else { console.error(e); body = VA.denied({ message: 'No pudimos mostrar esta pantalla. ' + (e && e.message ? e.message : '') }); }
  }
  let items = []; try { items = navItems(me); } catch (e) { }
  const cur = route + (arg ? '.' + arg : '');
  const isCur = r => r === cur || r === route || (route === 'expediente' && r === 'expedientes') || (route === 'presupuesto' && r === 'presupuestos') || (route === 'presupuesto-editar' && r === 'presupuestos') || (route === 'factura' && r === 'facturas') || (route === 'abogado' && r === 'equipo' && me.role === 'admin') || (route === 'cliente' && r === 'clientes') || (route === 'solicitar' && r === 'turnos') || (route === 'contacto' && r === 'crm');
  const nav = items.map(x => x.g ? `<div class="nav-g">${esc(x.g)}</div>` : `<button class="nav" data-go="${x.r}"${isCur(x.r) ? ' aria-current="page"' : ''}>${icon(x.i)}<span>${esc(x.l)}</span>${x.n ? `<span class="count">${x.n}</span>` : ''}</button>`).join('');
  const unread = (() => { try { return VA.A().unread(); } catch (e) { return 0; } })();
  const staff = me.role !== 'client';
  const bottom = me.role === 'client' ? `<nav class="bottom-nav" aria-label="Navegación principal">${[['panel', 'Inicio', 'home'], ['expedientes', 'Casos', 'folder'], ['turnos', 'Turnos', 'calendar'], ['pagos', 'Pagos', 'wallet'], ['notificaciones', 'Avisos', 'bell']].map(([r, l, i]) => `<button data-go="${r}"${isCur(r) ? ' aria-current="page"' : ''}>${icon(i)}<span>${l}</span>${r === 'notificaciones' && unread ? '<span class="dotn"></span>' : ''}</button>`).join('')}</nav>` : '';
  return `<div class="app ${S.ui.navOpen ? 'nav-open' : ''} ${me.role === 'client' ? 'has-bottom' : ''}">
  <div class="scrim" data-act="navClose"></div>
  <aside class="side" aria-label="Menú">
    <button class="brand" data-go="panel" aria-label="Ir al inicio">${VA.mark(34, { color: '#F7F4EE' })}<span><b>VILLAFAÑE</b><small>&amp; ASOCIADOS</small></span></button>
    ${nav}
    <div class="me">${VA.avatar(me.name, me.photo)}<div class="nm">${esc(me.name)}<small>${esc(me.adminScope || me.title || ROLE_LABEL[me.role])}</small></div><button data-act="logout" aria-label="Cerrar sesión" title="Cerrar sesión">${icon('logout')}</button></div>
  </aside>
  <div class="main">
    <header class="top">
      <button class="btn ghost icon menu-btn" data-act="navOpen" aria-label="Abrir menú">${icon('menu')}</button>
      ${staff ? `<div class="search"><label class="sr" for="gsearch">Buscar</label>${icon('search')}<input id="gsearch" class="in" type="search" placeholder="Buscar expedientes, clientes, facturas…" autocomplete="off" data-input="gsearch" value="${esc(S.ui.q || '')}"><div id="search-res" class="search-res"></div></div>` : `<div class="grow"><span class="serif" style="font-size:18px">Portal de clientes</span></div>`}
      <button class="demo-chip hide-sm" data-act="demoInfo" title="Qué es simulado en esta demo">MODO DEMOSTRACIÓN</button>
      <button class="btn ghost icon bell" data-go="notificaciones" aria-label="Notificaciones${unread ? ': ' + unread + ' sin leer' : ''}">${icon('bell')}${unread ? `<span class="dot">${unread > 9 ? '9+' : unread}</span>` : ''}</button>
    </header>
    <main class="content" id="main">${body}</main>
  </div>
  ${bottom}
</div>`;
};
VA.ACT.navOpen = () => { S.ui.navOpen = true; VA.refresh(); };
VA.ACT.navClose = () => { S.ui.navOpen = false; VA.refresh(); };
VA.ACT.logout = () => { try { VA.server.auth.logout(S.token); } catch (e) { } S.token = null; S.me = null; ss.set('va_tok', null); VA.toast('Cerraste la sesión.', 'ok'); VA.go('ingresar'); };
VA.ACT.demoInfo = () => VA.openModal({ title: 'Qué es real y qué es simulado', body: `<div class="prose">
<p>Esta es una demostración navegable. Las reglas de negocio y de acceso se ejecutan en una capa de servidor simulada dentro del navegador, con datos guardados en este dispositivo.</p>
<ul><li><b>Funciona de verdad en la demo:</b> permisos por rol y por expediente, estados de turnos, saldos de facturas, presupuestos, CRM, notificaciones internas y auditoría.</li>
<li><b>Simulado:</b> la pasarela de pagos (modo de prueba, sin cobros), el envío de correos (bandeja de salida sin proveedor) y el almacenamiento de archivos (solo se guardan nombre, tipo y tamaño).</li>
<li><b>No incluido:</b> facturación fiscal (ARCA), firma electrónica con validez legal y generación de PDF en servidor.</li></ul></div>`, foot: `<button class="btn" data-act="closeModal">Entendido</button><button class="btn primary" data-go="acerca">Ver documentación</button>` });

/* búsqueda global (consulta a la API con los permisos del usuario) */
let sT;
VA.INP.gsearch = el => {
  S.ui.q = el.value; clearTimeout(sT);
  sT = setTimeout(() => {
    const box = document.getElementById('search-res'); if (!box) return;
    let res = []; try { res = VA.A().search(el.value); } catch (e) { }
    box.innerHTML = el.value.trim().length < 2 ? '' : `<div class="panel">${res.length ? `<ul class="list tight">${res.map(r => `<li class="click" data-go="${esc(r.link)}" tabindex="0"><span class="tag">${esc(r.kind)}</span><span class="grow"><b style="font-weight:500">${esc(r.title)}</b><br><span class="xs muted">${esc(r.sub || '')}</span></span></li>`).join('')}</ul>` : '<p class="small muted" style="padding:14px 16px">Sin coincidencias dentro de lo que tu usuario puede ver.</p>'}</div>`;
  }, 160);
};

VA.denied = e => `<div class="panel"><div class="empty">${icon('lock')}<strong>No tenés acceso a esta sección</strong><p class="small" style="max-width:48ch">${esc(e.message || 'El servidor rechazó la solicitud.')} El intento quedó registrado en la auditoría.</p><button class="btn" data-go="panel">Volver al inicio</button></div></div>`;
VA.notFound = () => `<div class="panel"><div class="empty">${icon('search')}<strong>Esta página no existe</strong><button class="btn" data-go="panel">Volver al inicio</button></div></div>`;
VA.pageH = (title, sub, actions, crumb) => `<div class="page-h"><div class="grow">${crumb ? `<button class="crumb" data-go="${crumb[0]}">${icon('left')}${esc(crumb[1])}</button>` : ''}<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${actions ? `<div class="row">${actions}</div>` : ''}</div>`;
VA.tabs = (key, list, def) => { const cur = S.tabs[key] || def || list[0][0]; return { cur, html: `<div class="tabs" role="tablist">${list.map(([k, l, n]) => `<button role="tab" aria-selected="${k === cur}" data-act="tab" data-key="${key}" data-v="${k}">${esc(l)}${n != null ? `<span class="n">${n}</span>` : ''}</button>`).join('')}</div>` }; };
VA.ACT.tab = el => { S.tabs[el.dataset.key] = el.dataset.v; VA.refresh(); };

/* lectura de archivos (validación en el cliente; el servidor vuelve a validar) */
VA.fileMeta = input => { const f = input && input.files && input.files[0]; if (!f) return null; return { name: f.name, size: f.size, type: f.type || (f.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : ''), file: f }; };
VA.readImage = (file, max) => new Promise((res, rej) => { if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return rej(new VA.ApiError('VALIDATION', 'La foto debe ser JPG, PNG o WEBP.')); const fr = new FileReader(); fr.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .82)); }; img.onerror = () => rej(new VA.ApiError('VALIDATION', 'No pudimos leer la imagen.')); img.src = fr.result; }; fr.readAsDataURL(file); });
VA.fsize = b => b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

/* ── delegación de eventos ── */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); const g = e.target.closest('[data-go]');
  if (a && (!g || g.contains(a)) && !a.disabled) { const f = VA.ACT[a.dataset.act]; if (f) { if (a.tagName === 'BUTTON' || a.tagName === 'A') e.preventDefault(); f(a, e); if (a.dataset.act !== 'modalBg') return; } }
  if (g) { e.preventDefault(); VA.go(g.dataset.go); return; }
  if (!e.target.closest('.search')) { const b = document.getElementById('search-res'); if (b) b.innerHTML = ''; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.modal) { VA.closeModal(); return; }
  if (e.key === 'Escape' && S.ui.navOpen) { VA.ACT.navClose(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-go], li[data-go]')) { e.preventDefault(); VA.go(e.target.dataset.go); }
});
document.addEventListener('submit', e => {
  const f = e.target; if (!f.dataset.form) return; e.preventDefault();
  const fd = new FormData(f); const data = {};
  for (const [k, v] of fd.entries()) { if (v instanceof File) continue; data[k] = data[k] !== undefined ? [].concat(data[k], v) : v; }
  const h = VA.FORM[f.dataset.form]; if (h) h(data, f, e);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el && VA.CHG[el.dataset.change]) VA.CHG[el.dataset.change](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el && VA.INP[el.dataset.input]) VA.INP[el.dataset.input](el, e); });
})();
