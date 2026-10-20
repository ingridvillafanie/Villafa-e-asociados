/* Arranque: base de datos local, servidor simulado, sesión y primera pantalla. */
(function () {
'use strict';
const VA = window.VA, S = VA.S;
VA.db = VA.loadDB();
VA.server = VA.createApi(VA.db, { persist: VA.saveDB });
VA.saveDB();
try { const f = VA.ss.get('va_filters'); if (f) S.filters = JSON.parse(f) || {}; } catch (e) { }
const tok = VA.ss.get('va_tok');
if (tok) { const u = VA.server.auth.resolve(tok); if (u) { S.token = tok; S.me = VA.server.as(tok).me(); } else VA.ss.set('va_tok', null); }
try { VA.server.runScheduler(); } catch (e) { }
VA.favicon();
S.route = decodeURIComponent((location.hash || '').slice(1));
VA.render();
// recordatorios programados mientras la pestaña está abierta (en producción: tarea del servidor)
setInterval(() => { try { const r = VA.server.runScheduler(); if (r.created && S.me) VA.refresh(); } catch (e) { } }, 60000);
// si otra pestaña cambia los datos, se recargan
window.addEventListener('storage', e => { if (e.key === 'va_demo_v3' && e.newValue) { try { const d = JSON.parse(e.newValue); Object.keys(VA.db).forEach(k => delete VA.db[k]); Object.assign(VA.db, d); VA.refresh(); } catch (er) { } } });
})();
