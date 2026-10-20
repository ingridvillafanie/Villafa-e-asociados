/* Plataforma privada: administración y abogados (y despacho de rutas compartidas con el portal del cliente). */
(function () {
'use strict';
const VA = window.VA, S = VA.S, esc = VA.esc, icon = VA.icon, V = VA.V, C = VA.C, ACT = VA.ACT, FORM = VA.FORM, CHG = VA.CHG, INP = VA.INP;
const A = () => VA.A();
const role = () => S.me.role;
const m$ = VA.money$;
const fd = VA.fDate, fdt = VA.fDT;
const today = () => VA.ymd(VA.now());

/* ════════ PANEL ════════ */
V.panel = () => role() === 'admin' ? adminPanel() : role() === 'lawyer' ? lawyerPanel() : C.home();
const greet = () => { const h = VA.now().getHours(); return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches'; };
const fig = (v, k, go, cls, money) => `<button class="fig ${cls || ''}" data-go="${go}"><span class="v ${money ? 'money' : ''}">${v}</span><span class="k">${esc(k)}</span></button>`;

function adminPanel() {
  const a = A(), d = a.adminDashboard(), fin = a.can('finanzas.gestionar');
  const meetRow = m => `<li class="click" data-act="openMeeting" data-id="${m.id}" tabindex="0">${VA.avatar(m.lawyerName, m.lawyerPhoto)}<div class="grow"><b style="font-weight:500">${esc(m.clientName)}</b> <span class="muted small">con ${esc(m.lawyerName)}</span><div class="xs muted">${esc(m.type)} · ${VA.fTime(m.start)}–${VA.fTime(m.end)}</div></div>${VA.pill(m.status)}</li>`;
  return `${VA.pageH(greet() + ', ' + esc(S.me.name.split(' ')[0]), esc(VA.fDay(VA.now())) + ' · ' + esc(S.me.adminScope), a.can('expedientes.gestionar') ? `<button class="btn primary" data-act="newCase">${icon('plus')}Nuevo expediente</button>` : '')}
  <div><p class="fig-group">Operación</p><div class="figures">
    ${fig(d.clients, 'Clientes', 'clientes')}${fig(d.activeCases, 'Expedientes activos', 'expedientes')}${fig(d.newCasesMonth, 'Casos nuevos del mes', 'expedientes')}
    ${fig(d.pendingInquiries, 'Consultas pendientes', 'crm', d.pendingInquiries ? 'attn' : '')}${fig(d.toApprove, 'Turnos por aprobar', 'agenda', d.toApprove ? 'attn' : '')}${fig(d.todayMeetings.length, 'Reuniones de hoy', 'agenda')}
  </div></div>
  ${fin ? `<div><p class="fig-group">Finanzas</p><div class="figures">
    ${fig(d.quotesSent, 'Presupuestos enviados', 'presupuestos')}${fig(d.quotesPending, 'Pendientes de aceptación', 'presupuestos', d.quotesPending ? 'attn' : '')}${fig(d.invoicesIssued, 'Facturas emitidas', 'facturas')}
    ${fig(m$(d.collectedMonth), 'Pagos recibidos este mes', 'pagos', '', 1)}${fig(m$(d.receivable), 'Saldo pendiente de cobro', 'facturas', '', 1)}${fig(d.debtors.length, 'Clientes con deuda vencida', 'facturas', d.debtors.length ? 'alert' : '')}
  </div></div>` : ''}
  <div class="split">
    <div class="stack lg">
      ${fin ? `<section class="panel"><div class="panel-h"><h2>Ingresos cobrados</h2><span class="small muted">Últimos 6 meses · total ${m$(d.collectedTotal)}</span></div><div class="panel-b">${VA.colChart(d.months.map(x => ({ label: x.label, value: x.value })), v => VA.money(v))}</div></section>` : ''}
      <section class="panel"><div class="panel-h"><h2>Reuniones de hoy</h2><button class="btn sm" data-go="agenda">Ver agenda</button></div>${d.todayMeetings.length ? `<ul class="list">${d.todayMeetings.map(meetRow).join('')}</ul>` : VA.empty('calendar', 'Sin reuniones hoy', 'Las reuniones aprobadas aparecen acá.')}</section>
      <section class="panel"><div class="panel-h"><h2>Próximos vencimientos</h2></div>${d.upcoming.length ? `<ul class="list">${d.upcoming.map(u => `<li class="click" data-go="${u.link}" tabindex="0"><span class="nowrap" style="min-width:78px"><b class="serif" style="font-size:20px;font-weight:500">${VA.toD(u.date).getDate()}</b> <span class="small muted">${VA.MES[VA.toD(u.date).getMonth()]}</span></span><div class="grow"><span>${esc(u.label)}</span><div class="xs muted">${esc(u.ref)}</div></div><span class="tag">${esc(u.kind)}</span></li>`).join('')}</ul>` : VA.empty('clock', 'Sin vencimientos próximos')}</section>
    </div>
    <div class="stack lg">
      <section class="panel"><div class="panel-h"><h2>Carga de trabajo</h2><button class="btn sm" data-go="equipo">Equipo</button></div><div class="panel-b">${VA.bars(d.workload.map(w => ({ name: w.name, value: w.active })), v => v + (v === 1 ? ' caso' : ' casos'))}</div></section>
      ${a.can('crm.gestionar') ? `<section class="panel"><div class="panel-h"><h2>Pipeline comercial</h2><button class="btn sm" data-go="crm">CRM</button></div><div class="panel-b">${VA.bars(d.pipeline.filter(p => p.count && p.stage !== 'Cliente incorporado'), v => v)}</div></section>` : ''}
      ${fin ? `<section class="panel"><div class="panel-h"><h2>Clientes con deuda</h2></div>${d.debtors.length ? `<ul class="list">${d.debtors.map(x => `<li class="click" data-go="cliente.${x.id}" tabindex="0">${VA.avatar(x.name)}<span class="grow">${esc(x.name)}</span><b style="color:var(--bad);font-weight:600" class="nowrap">${m$(x.amount)}</b></li>`).join('')}</ul>` : VA.empty('check', 'Nadie tiene deuda vencida')}</section>` : ''}
      <section class="panel"><div class="panel-h"><h2>Actividad reciente</h2>${a.can('auditoria.ver') ? '<button class="btn sm" data-go="auditoria">Auditoría</button>' : ''}</div><ul class="list tight">${d.activity.map(x => `<li><div class="grow small"><b style="font-weight:600">${esc(x.userName)}</b> <span class="muted">· ${esc(VA.rel(x.at))}</span><div style="color:var(--ink-2)">${esc(x.detail || x.action)}</div></div></li>`).join('')}</ul></section>
    </div>
  </div>`;
}

function lawyerPanel() {
  const a = A(), d = a.lawyerDashboard();
  return `${VA.pageH(greet() + ', ' + esc(S.me.name.split(' ')[0]), esc(VA.fDay(VA.now())) + ' · ' + esc(S.me.title || ''))}
  <div class="figures">${fig(d.cases, 'Casos asignados', 'expedientes')}${fig(d.newCases.length, 'Casos nuevos (14 días)', 'expedientes')}${fig(d.today.length, 'Reuniones de hoy', 'agenda')}${fig(d.toApprove, 'Turnos por aprobar', 'agenda', d.toApprove ? 'attn' : '')}${fig(d.tasks.length, 'Tareas pendientes', 'tareas')}</div>
  <div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h2>Próximos turnos</h2><button class="btn sm" data-go="agenda">Agenda</button></div>${d.upcoming.length ? `<ul class="list">${d.upcoming.map(m => `<li class="click" data-act="openMeeting" data-id="${m.id}" tabindex="0"><span class="nowrap" style="min-width:92px"><b style="font-weight:600">${VA.fTime(m.start)}</b><div class="xs muted">${fd(m.start)}</div></span><div class="grow">${esc(m.clientName)}<div class="xs muted">${esc(m.type)} · ${m.durationMin} min · ${m$(m.totalCents)}</div></div>${VA.pill(m.status)}</li>`).join('')}</ul>` : VA.empty('calendar', 'Sin turnos próximos')}</section>
    <section class="panel"><div class="panel-h"><h2>Vencimientos de mis expedientes</h2></div>${d.deadlines.length ? `<ul class="list">${d.deadlines.map(c => `<li class="click" data-go="expediente.${c.id}" tabindex="0"><span class="nowrap" style="min-width:78px"><b class="serif" style="font-size:20px;font-weight:500">${VA.toD(c.next.date).getDate()}</b> <span class="small muted">${VA.MES[VA.toD(c.next.date).getMonth()]}</span></span><div class="grow">${esc(c.next.label)}<div class="xs muted"><span class="mono">${esc(c.number)}</span> · ${esc(c.clientName)}</div></div>${VA.daysUntil(c.next.date) <= 7 ? VA.pill('Alta', 'En ' + VA.daysUntil(c.next.date) + ' días') : ''}</li>`).join('')}</ul>` : VA.empty('clock', 'Sin vencimientos')}</section>
    <section class="panel"><div class="panel-h"><h2>Documentos recibidos</h2></div>${d.recentDocs.length ? `<ul class="list">${d.recentDocs.map(x => `<li class="click" data-go="expediente.${x.caseId}" tabindex="0">${icon('file')}<div class="grow">${esc(x.name)}<div class="xs muted">${esc(x.uploaderName)} · <span class="mono">${esc(x.caseNumber)}</span> · ${VA.rel(x.at)}</div></div>${VA.pill(x.status)}</li>`).join('')}</ul>` : VA.empty('file', 'Sin documentos nuevos')}</section>
  </div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h2>Tareas</h2><button class="btn sm" data-go="tareas">Ver todas</button></div>${d.tasks.length ? `<ul class="list">${d.tasks.map(taskLi).join('')}</ul>` : VA.empty('task', 'Sin tareas pendientes')}</section>
    <section class="panel"><div class="panel-h"><h2>Casos nuevos</h2></div>${d.newCases.length ? `<ul class="list">${d.newCases.map(c => `<li class="click" data-go="expediente.${c.id}" tabindex="0"><div class="grow"><span class="mono xs muted">${esc(c.number)}</span><div>${esc(c.title)}</div></div>${VA.pill(c.status)}</li>`).join('')}</ul>` : VA.empty('folder', 'Sin casos nuevos')}</section>
    <section class="panel"><div class="panel-h"><h2>Notificaciones</h2><button class="btn sm" data-go="notificaciones">Todas</button></div>${d.notifications.length ? `<ul class="list tight">${d.notifications.map(notifLi).join('')}</ul>` : VA.empty('bell', 'Estás al día')}</section>
  </div></div>`;
}
const taskLi = t => `<li><label class="check grow" style="align-items:flex-start"><input type="checkbox" data-act="toggleTask" data-id="${t.id}"${t.done ? ' checked' : ''}><span class="grow"><span style="${t.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(t.title)}</span><span class="xs muted" style="display:block">${t.caseNumber ? `<span class="mono">${esc(t.caseNumber)}</span> · ` : ''}${t.contactName ? esc(t.contactName) + ' · ' : ''}${esc(t.assigneeName || '')} · vence ${fd(t.due)}</span></span></label>${!t.done && t.due < today() ? VA.pill('Vencida') : ''}</li>`;
ACT.toggleTask = el => VA.run(() => A().toggleTask(el.dataset.id));
const notifLi = n => `<li class="click" data-act="openNotif" data-id="${n.id}" data-link="${esc(n.link || '')}" tabindex="0"><span style="width:8px;height:8px;border-radius:50%;flex:none;background:${n.read ? 'transparent' : 'var(--gold)'}"></span><div class="grow"><b style="font-weight:${n.read ? 400 : 600}">${esc(n.title)}</b><div class="small muted">${esc(n.body)}</div><div class="xs muted">${esc(n.type)} · ${VA.rel(n.at)}</div></div></li>`;
VA.notifLi = notifLi;
ACT.openNotif = el => { try { A().markRead(el.dataset.id); } catch (e) { } let l = el.dataset.link; if (!l) return VA.refresh(); if (l === 'turnos' && role() !== 'client') l = 'agenda'; if (l === 'agenda' && role() === 'client') l = 'turnos'; VA.go(l); };

/* ════════ EXPEDIENTES ════════ */
V.expedientes = () => {
  if (role() === 'client') return C.cases();
  const a = A(), f = VA.F('cases'); const rows = a.cases(f);
  const lawyers = role() === 'admin' ? a.lawyers() : [];
  return `${VA.pageH(role() === 'lawyer' ? 'Mis casos' : 'Expedientes', rows.length + ' expedientes' + (role() === 'lawyer' ? ' asignados a vos' : ''), a.can('expedientes.gestionar') ? `<button class="btn primary" data-act="newCase">${icon('plus')}Nuevo expediente</button>` : '')}
  <div class="row">
    <div class="search" style="max-width:320px">${icon('search')}<label class="sr" for="cf-q">Buscar expediente</label><input id="cf-q" class="in" type="search" placeholder="N°, asunto o cliente" value="${esc(f.q || '')}" data-input="caseQ"></div>
    <label class="sr" for="cf-st">Estado</label><select id="cf-st" class="in" style="width:auto" data-change="caseF" data-k="status">${VA.opts(VA.CASE_STATES, f.status, 'Todos los estados')}</select>
    <label class="sr" for="cf-ar">Área</label><select id="cf-ar" class="in" style="width:auto" data-change="caseF" data-k="area">${VA.opts(VA.AREAS, f.area, 'Todas las áreas')}</select>
    ${role() === 'admin' ? `<label class="sr" for="cf-l">Abogado</label><select id="cf-l" class="in" style="width:auto" data-change="caseF" data-k="lawyerId">${VA.opts(lawyers.map(l => ({ v: l.id, l: l.name })), f.lawyerId, 'Todos los abogados')}</select>` : ''}
    ${Object.values(f).some(Boolean) ? '<button class="btn ghost sm" data-act="caseClear">Limpiar filtros</button>' : ''}
  </div>
  <div class="panel">${VA.table('cases', [
    { k: 'number', l: 'Expediente', lead: true, fn: r => `<span class="mono xs muted">${esc(r.number)}</span><div style="font-weight:500">${esc(r.title)}</div><div class="xs muted">${esc(r.clientName)}</div>` },
    { k: 'area', l: 'Área' },
    role() === 'admin' ? { k: 'lawyerName', l: 'Responsable', fn: r => `<span class="row" style="gap:8px;flex-wrap:nowrap">${VA.avatar(r.lawyerName, r.lawyerPhoto)}<span>${esc(r.lawyerName)}</span></span>` } : null,
    { k: 'status', l: 'Estado', fn: r => VA.pill(r.status) },
    { k: 'priority', l: 'Prioridad', fn: r => VA.pill(r.priority), sortv: r => VA.PRIORITIES.indexOf(r.priority) },
    { k: 'openedAt', l: 'Apertura', fn: r => fd(r.openedAt) },
    { k: 'next', l: 'Próximo vencimiento', fn: r => r.next ? `${fd(r.next.date)}<div class="xs muted">${esc(r.next.label)}</div>` : '<span class="muted">—</span>', sortv: r => r.next ? r.next.date : '9999' },
    { k: 'lastUpdate', l: 'Última actualización', fn: r => `<span class="small">${VA.rel(r.lastUpdate)}</span>` }
  ].filter(Boolean), rows, { go: r => 'expediente.' + r.id, defaultSort: { k: 'lastUpdate', dir: 'desc' }, empty: VA.empty('folder', 'No hay expedientes con estos filtros', 'Probá limpiar los filtros.') })}</div>`;
};
let cq; INP.caseQ = el => { clearTimeout(cq); cq = setTimeout(() => { VA.filter('cases', { q: el.value }); VA.refresh(); }, 220); };
CHG.caseF = el => { VA.filter('cases', { [el.dataset.k]: el.value }); VA.refresh(); };
ACT.caseClear = () => { S.filters.cases = {}; VA.filter('cases', {}); VA.refresh(); };

ACT.newCase = (el) => {
  const a = A(); const clients = a.clients(); const lawyers = a.lawyers().filter(l => l.active);
  const pre = el && el.dataset.client;
  VA.openModal({ title: 'Nuevo expediente', wide: true, form: 'newCase', body: `
  <div class="form-grid">
    <label class="field full"><span>Título del asunto</span><input class="in" id="nc-title" name="title" required maxlength="200"></label>
    <label class="field"><span>Cliente</span><select class="in" id="nc-client" name="clientId" required>${VA.opts(clients.map(c => ({ v: c.id, l: c.name })), pre, 'Elegí un cliente')}</select></label>
    <label class="field"><span>Área jurídica</span><select class="in" id="nc-area" name="area" required data-change="ncArea">${VA.opts(VA.AREAS, '', 'Elegí un área')}</select></label>
    <label class="field"><span>Prioridad</span><select class="in" name="priority">${VA.opts(VA.PRIORITIES, 'Media')}</select></label>
    <label class="field"><span>Próxima fecha importante</span><input class="in" type="date" name="nextDate"></label>
    <label class="field full"><span>Descripción interna</span><textarea class="in" name="description" placeholder="Solo visible para el equipo."></textarea></label>
    <label class="field full"><span>Resumen para el cliente <span class="hint">· lenguaje claro, sin tecnicismos</span></span><textarea class="in" name="clientSummary" style="min-height:70px"></textarea></label>
  </div>
  <fieldset style="border:0;padding:0;margin:0" class="stack"><legend class="lbl" style="margin-bottom:8px">Abogado responsable · carga de trabajo actual</legend><div class="choice" id="nc-lawyers">${lawyerChoices(lawyers, '')}</div></fieldset>
  <div id="nc-err" class="err" role="alert"></div>`,
    foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary" type="submit">Crear expediente</button>` });
};
function lawyerChoices(lawyers, area, sel) {
  const list = lawyers.filter(l => !area || l.areas.includes(area)).sort((x, y) => x.activeCases - y.activeCases);
  if (!list.length) return '<p class="small muted">Ningún profesional activo atiende esta área.</p>';
  return list.map(l => `<label class="opt" style="cursor:pointer"><input type="radio" name="lawyerId" value="${l.id}"${sel === l.id ? ' checked' : ''} style="margin-top:4px;accent-color:var(--navy)">${VA.avatar(l.name, l.photo)}<span class="grow"><span class="t">${esc(l.name)}</span><span class="xs muted" style="display:block">${esc(l.specialty)}</span><span class="xs" style="display:block;margin-top:4px">${l.activeCases} activos · ${VA.pill(l.availability)}</span></span></label>`).join('');
}
CHG.ncArea = el => { const box = document.getElementById('nc-lawyers'); if (box) box.innerHTML = lawyerChoices(A().lawyers().filter(l => l.active), el.value); };
FORM.newCase = (d, form) => { try { const r = A().createCase(d); S.modal = null; VA.toast('Expediente creado y asignado.', 'ok'); VA.go('expediente.' + r.id); } catch (e) { if (e.code === 'SESSION') return VA.handle(e); form.querySelector('#nc-err').textContent = e.message; } };

/* ── ficha del expediente ── */
V.expediente = id => {
  if (role() === 'client') return C.case(id);
  const a = A(); const c = a.case(id);
  const canManage = a.can('expedientes.gestionar'); const own = role() === 'lawyer' && c.lawyerId === S.me.lawyerId;
  const canEdit = canManage || own;
  const tabs = VA.tabs('case:' + id, [['resumen', 'Resumen'], ['actividad', 'Actividad', c.activities.filter(x => x.kind !== 'sistema').length], ['documentos', 'Documentos', c.documents.length], ['tareas', 'Tareas', c.tasks.filter(t => !t.done).length], ['reuniones', 'Reuniones', c.meetings.length], ['finanzas', 'Finanzas']]);
  let body = '';
  if (tabs.cur === 'resumen') body = caseSummary(c, canEdit, a);
  if (tabs.cur === 'actividad') body = caseActivity(c);
  if (tabs.cur === 'documentos') body = caseDocs(c);
  if (tabs.cur === 'tareas') body = caseTasks(c);
  if (tabs.cur === 'reuniones') body = caseMeetings(c, a);
  if (tabs.cur === 'finanzas') body = caseFinance(c, a);
  return `${VA.pageH(`<span class="mono" style="font-size:14px;color:var(--muted);display:block;margin-bottom:6px;font-family:var(--f-mono)">${esc(c.number)} · ${esc(c.area)}</span>${esc(c.title)}`, '', `${canEdit ? `<label class="sr" for="cs-st">Estado</label><select id="cs-st" class="in" style="width:auto" data-change="caseStatus" data-id="${c.id}">${VA.opts(VA.CASE_STATES, c.status)}</select>` : VA.pill(c.status)}<button class="btn" data-act="sendTpl" data-id="${c.id}">${icon('send')}Comunicar</button>`, ['expedientes', role() === 'lawyer' ? 'Mis casos' : 'Expedientes'])}
  <div class="row" style="gap:20px">
    <span class="row" style="gap:8px">${VA.avatar(c.client.name)}<span><span class="xs muted">Cliente</span><br>${a.can('expedientes.todos') || role() === 'lawyer' ? `<button class="link" data-go="cliente.${c.client.id}">${esc(c.client.name)}</button>` : esc(c.client.name)}</span></span>
    <span class="row" style="gap:8px">${VA.avatar(c.lawyer.name, c.lawyer.photo)}<span><span class="xs muted">Responsable</span><br>${esc(c.lawyer.name)}</span></span>
    <span><span class="xs muted">Prioridad</span><br>${VA.pill(c.priority)}</span>
    <span><span class="xs muted">Próxima fecha</span><br>${c.next ? fd(c.next.date) + ' · ' + esc(c.next.label) : '—'}</span>
    ${c.extraLawyers.length ? `<span><span class="xs muted">Acceso adicional</span><br>${esc(c.extraLawyers.join(', '))}</span>` : ''}
  </div>
  ${tabs.html}${body}`;
};
CHG.caseStatus = el => VA.run(() => A().updateCase(el.dataset.id, { status: el.value }), 'Estado actualizado. El cliente recibió el aviso.');

function caseSummary(c, canEdit, a) {
  return `<div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Descripción interna</h3>${canEdit ? `<button class="btn sm" data-act="editCase" data-id="${c.id}">${icon('edit')}Editar</button>` : ''}</div><div class="panel-b"><p style="white-space:pre-wrap">${esc(c.description) || '<span class="muted">Sin descripción.</span>'}</p></div></section>
    <section class="panel"><div class="panel-h"><h3>Lo que ve el cliente</h3><span class="vis cli">${icon('eye')}Visible en el portal</span></div><div class="panel-b stack"><p><b style="font-weight:600">${esc(VA.CASE_CLIENT_LABEL[c.status])}</b></p><p style="color:var(--ink-2)">${esc(c.clientSummary)}</p></div></section>
    <section class="panel"><div class="panel-h"><h3>Últimos movimientos</h3><button class="btn sm" data-act="tab" data-key="case:${c.id}" data-v="actividad">Ver actividad</button></div><div class="panel-b">${timeline(c.activities.slice(0, 4))}</div></section>
  </div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Datos del expediente</h3></div><div class="panel-b">${VA.kv([['Identificador', `<span class="mono">${esc(c.number)}</span>`], ['Área', esc(c.area)], ['Apertura', fd(c.openedAt)], ['Estado', VA.pill(c.status)], ['Prioridad', VA.pill(c.priority)], ['Honorarios acordados', c.feesCents ? m$(c.feesCents) : '<span class="muted">Sin acuerdo</span>'], ['Documentos', c.documents.length], ['Tareas abiertas', c.tasks.filter(t => !t.done).length]])}</div></section>
    ${a.can('expedientes.gestionar') ? `<section class="panel"><div class="panel-h"><h3>Asignación</h3></div><div class="panel-b stack"><p class="small muted">Un abogado accede solo a sus expedientes, salvo permiso explícito.</p><div class="row"><button class="btn sm" data-act="reassign" data-id="${c.id}">Reasignar responsable</button><button class="btn sm" data-act="extraAccess" data-id="${c.id}">Permisos adicionales</button></div></div></section>` : ''}
    <section class="panel"><div class="panel-h"><h3>Contacto del cliente</h3></div><div class="panel-b">${VA.kv([['Correo', esc(c.client.email)], ['Teléfono', esc(c.client.phone)]])}</div></section>
  </div></div>`;
}
function timeline(list) {
  if (!list.length) return VA.empty('clock', 'Sin movimientos todavía');
  return `<ol class="tl">${list.map(x => `<li class="${x.kind}"><div class="meta">${x.kind === 'interna' ? `<span class="vis int">${icon('lock')}Nota interna</span>` : x.kind === 'cliente' ? `<span class="vis cli">${icon('eye')}El cliente ve esto</span>` : ''}<span>${esc(x.authorName)}</span><span>${fdt(x.at)}</span></div><p style="white-space:pre-wrap">${esc(x.text)}</p></li>`).join('')}</ol>`;
}
function caseActivity(c) {
  const mode = S.ui.compose || 'interna';
  return `<div class="split"><div class="stack lg">
    <form class="composer" data-form="activity" data-mode="${mode}" data-id="${c.id}" novalidate>
      <div class="modes" role="group" aria-label="Tipo de registro"><button type="button" data-act="compose" data-v="interna" aria-pressed="${mode === 'interna'}">${icon('lock')}Nota interna</button><button type="button" data-act="compose" data-v="cliente" aria-pressed="${mode === 'cliente'}">${icon('eye')}Actualización para el cliente</button></div>
      <div class="cbody">
        <p class="explain">${mode === 'interna' ? icon('lock') + '<span><b>Solo el equipo</b> la ve. Nunca aparece en el portal del cliente.</span>' : icon('eye') + `<span><b>${esc(c.client.name)} la va a leer</b> en su portal y recibirá un aviso.</span>`}</p>
        <label class="sr" for="act-text">Texto</label><textarea class="in" id="act-text" name="text" placeholder="${mode === 'interna' ? 'Estrategia, pendientes, observaciones…' : 'Explicá la novedad en lenguaje claro.'}" required></textarea>
        <div class="row between"><span class="xs muted">Queda registrado con tu nombre, fecha y hora.</span><button class="btn ${mode === 'cliente' ? 'gold' : 'primary'}" type="submit">${mode === 'cliente' ? 'Publicar al cliente' : 'Guardar nota interna'}</button></div>
      </div>
    </form>
    ${timeline(c.activities)}
  </div><div class="stack lg"><section class="panel"><div class="panel-h"><h3>Referencias</h3></div><div class="panel-b stack small"><div class="row"><span class="vis int">${icon('lock')}Nota interna</span><span class="muted">fondo rayado, borde punteado</span></div><div class="row"><span class="vis cli">${icon('eye')}El cliente ve esto</span><span class="muted">borde dorado</span></div><p class="muted">Los cambios de estado y asignación se registran automáticamente.</p></div></section></div></div>`;
}
ACT.compose = el => { S.ui.compose = el.dataset.v; VA.refresh(); };
FORM.activity = (d, form) => { const kind = form.dataset.mode; if (!String(d.text || '').trim()) { VA.toast('Escribí el texto antes de guardar.', 'bad'); return; } VA.run(() => A().addActivity(form.dataset.id, kind, d.text), kind === 'cliente' ? 'Actualización publicada en el portal del cliente.' : 'Nota interna guardada.'); };

function caseDocs(c) {
  const reqs = c.requests;
  return `<div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Documentos del expediente</h3></div>${c.documents.length ? VA.table('docs:' + c.id, [
      { k: 'name', l: 'Archivo', lead: true, fn: d => `<span class="row" style="gap:8px;flex-wrap:nowrap">${icon('file')}<span><span style="font-weight:500">${esc(d.name)}</span><span class="xs muted" style="display:block">${esc(d.category)} · ${VA.fsize(d.size)} · ${esc(d.uploaderName)}</span></span></span>` },
      { k: 'at', l: 'Fecha', fn: d => fd(d.at) },
      { k: 'visibility', l: 'Visibilidad', fn: d => d.status === 'Reemplazado' ? '<span class="muted small">Reemplazado</span>' : `<button class="btn sm" data-act="docVis" data-id="${d.id}" data-v="${d.visibility === 'interna' ? 'compartido' : 'interna'}" title="Cambiar visibilidad">${d.visibility === 'interna' ? `<span class="vis int">${icon('lock')}Interno</span>` : `<span class="vis cli">${icon('eye')}Compartido</span>`}</button>` },
      { k: 'status', l: 'Revisión', fn: d => VA.pill(d.status) + (d.reviewNote ? `<div class="xs muted" style="margin-top:4px;max-width:220px">${esc(d.reviewNote)}</div>` : '') },
      { k: 'x', l: '', sort: false, fn: d => `<span class="row" style="gap:6px;justify-content:flex-end">${d.status === 'Pendiente de revisión' ? `<button class="btn sm" data-act="docReview" data-id="${d.id}" data-v="Aprobado">Aprobar</button><button class="btn sm" data-act="docReject" data-id="${d.id}">Pedir reemplazo</button>` : ''}<button class="btn sm ghost" data-act="docDownload" aria-label="Descargar">${icon('download')}</button></span>` }
    ], c.documents, { defaultSort: { k: 'at', dir: 'desc' } }) : VA.empty('file', 'Todavía no hay documentos')}</section>
  </div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Subir documento</h3></div><div class="panel-b"><form data-form="docUpload" data-id="${c.id}" class="stack" novalidate>
      <label class="field"><span>Archivo <span class="hint">· PDF, JPG, PNG o DOCX · máx. 10 MB</span></span><input class="in" type="file" id="du-file" accept=".pdf,.jpg,.jpeg,.png,.docx" required></label>
      <label class="field"><span>Categoría</span><select class="in" name="category">${VA.opts(VA.DOC_CATS, 'Documentación del caso')}</select></label>
      <fieldset style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:6px">Visibilidad</legend><label class="check"><input type="radio" name="visibility" value="interna" checked> <span>Solo interno</span></label><label class="check"><input type="radio" name="visibility" value="compartido"> <span>Compartir con el cliente</span></label></fieldset>
      <button class="btn primary" type="submit">${icon('upload')}Subir</button></form></div></section>
    <section class="panel"><div class="panel-h"><h3>Documentación solicitada</h3><button class="btn sm" data-act="reqDoc" data-id="${c.id}">${icon('plus')}Solicitar</button></div>${reqs.length ? `<ul class="list tight">${reqs.map(r => `<li><div class="grow">${esc(r.title)}<div class="xs muted">Antes del ${fd(r.due)}</div></div>${VA.pill(r.status)}</li>`).join('')}</ul>` : VA.empty('file', 'Sin solicitudes')}</section>
  </div></div>`;
}
ACT.docVis = el => { const v = el.dataset.v; const go = () => VA.run(() => A().setDocVisibility(el.dataset.id, v), v === 'compartido' ? 'Documento compartido con el cliente.' : 'El documento quedó como interno.'); if (v === 'compartido') VA.confirm({ title: 'Compartir con el cliente', text: 'El cliente va a ver y poder descargar este documento desde su portal, y recibirá un aviso. ¿Continuar?', label: 'Compartir' }, go); else go(); };
ACT.docReview = el => VA.run(() => A().reviewDocument(el.dataset.id, el.dataset.v), 'Documento aprobado.');
ACT.docReject = el => VA.openModal({ title: 'Pedir reemplazo', form: 'docReject', body: `<input type="hidden" name="id" value="${el.dataset.id}"><label class="field"><span>Motivo para el cliente</span><textarea class="in" name="note" required placeholder="Por ejemplo: la imagen está borrosa; subila de nuevo con buena luz."></textarea></label>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Enviar pedido</button>` });
FORM.docReject = d => { S.modal = null; VA.run(() => A().reviewDocument(d.id, 'Requiere reemplazo', d.note), 'Pedido de reemplazo enviado al cliente.'); };
ACT.docDownload = () => VA.toast('Demo: solo se guardan los datos del archivo. En producción se descarga con un enlace privado que vence en minutos.');
FORM.docUpload = (d, form) => { const f = VA.fileMeta(form.querySelector('#du-file')); if (!f) { VA.toast('Elegí un archivo para subir.', 'bad'); return; } VA.run(() => A().uploadDocument({ caseId: form.dataset.id, name: f.name, size: f.size, type: f.type, category: d.category, visibility: d.visibility }), d.visibility === 'compartido' ? 'Documento subido y compartido con el cliente.' : 'Documento subido (solo interno).'); };
ACT.reqDoc = el => VA.openModal({ title: 'Solicitar documentación', form: 'reqDoc', body: `<input type="hidden" name="caseId" value="${el.dataset.id}"><label class="field"><span>Documento solicitado</span><input class="in" name="title" required placeholder="Ej.: Partida de nacimiento"></label><div class="form-grid"><label class="field"><span>Categoría</span><select class="in" name="category">${VA.opts(VA.DOC_CATS, 'Documentación del caso')}</select></label><label class="field"><span>Fecha límite</span><input class="in" type="date" name="due" value="${VA.dateOnly(VA.now(), 7)}"></label></div>${VA.notice('info', 'El cliente recibe un aviso y ve la solicitud en su sección Documentos.')}`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Solicitar</button>` });
FORM.reqDoc = d => { S.modal = null; VA.run(() => A().requestDocument(d.caseId, d), 'Solicitud enviada al cliente.'); };

function caseTasks(c) {
  return `<div class="split"><section class="panel"><div class="panel-h"><h3>Tareas y recordatorios</h3></div>${c.tasks.length ? `<ul class="list">${c.tasks.sort((x, y) => (x.done - y.done) || x.due.localeCompare(y.due)).map(taskLi).join('')}</ul>` : VA.empty('task', 'Sin tareas')}</section>
  <section class="panel"><div class="panel-h"><h3>Nueva tarea</h3></div><div class="panel-b">${taskForm(c.id)}</div></section></div>`;
}
function taskForm(caseId) {
  const a = A(); const staff = role() === 'admin' && a.can('expedientes.gestionar') ? VA.db.users.filter(u => u.role !== 'client' && u.active).map(u => ({ v: u.id, l: u.name })) : [{ v: S.me.id, l: S.me.name + ' (vos)' }];
  const cases = caseId ? null : a.cases().filter(c => !['Cerrado', 'Archivado'].includes(c.status));
  return `<form data-form="task" class="stack" novalidate>${caseId ? `<input type="hidden" name="caseId" value="${caseId}">` : ''}
  <label class="field"><span>Tarea o recordatorio</span><input class="in" id="tk-title" name="title" required maxlength="200"></label>
  ${cases ? `<label class="field"><span>Expediente (opcional)</span><select class="in" name="caseId">${VA.opts(cases.map(c => ({ v: c.id, l: c.number + ' · ' + c.title })), '', 'Sin expediente')}</select></label>` : ''}
  <div class="form-grid"><label class="field"><span>Responsable</span><select class="in" name="assigneeId">${VA.opts(staff, S.me.id)}</select></label><label class="field"><span>Vence</span><input class="in" type="date" name="due" value="${VA.dateOnly(VA.now(), 2)}"></label></div>
  <button class="btn primary" type="submit">${icon('plus')}Agregar tarea</button></form>`;
}
FORM.task = (d, form) => { VA.run(() => A().addTask(d), 'Tarea creada.'); };

function caseMeetings(c, a) {
  return `<section class="panel"><div class="panel-h"><h3>Reuniones del expediente</h3><button class="btn sm primary" data-act="proposeMeeting" data-case="${c.id}" data-lawyer="${c.lawyerId}">${icon('plus')}Proponer reunión</button></div>${c.meetings.length ? `<ul class="list">${c.meetings.map(m => `<li class="click" data-act="openMeeting" data-id="${m.id}" tabindex="0"><span class="nowrap" style="min-width:110px"><b style="font-weight:600">${fd(m.start)}</b><div class="xs muted">${VA.fTime(m.start)} · ${m.durationMin} min</div></span><div class="grow">${esc(m.type)}<div class="xs muted">${esc(m.lawyerName)} · ${m$(m.totalCents)}</div></div>${VA.pill(m.status)}</li>`).join('')}</ul>` : VA.empty('calendar', 'Sin reuniones')}</section>`;
}
function caseFinance(c, a) {
  if (!c.finance) return `<div class="panel">${VA.empty('lock', 'Sin acceso a la información financiera', 'Tu perfil no tiene habilitada la consulta de facturación. Pedilo a la administración.')}</div>`;
  const canQ = a.can('finanzas.gestionar') || (S.me.lawyerPerms && S.me.lawyerPerms.emitirPresupuestos);
  const inv = c.finance.invoices; const bal = inv.filter(i => i.status !== 'Anulada' && i.status !== 'Borrador').reduce((s, i) => s + i.balance, 0);
  return `<div class="figures"><div class="fig" style="cursor:default"><span class="v money">${m$(c.feesCents)}</span><span class="k">Honorarios acordados</span></div><div class="fig" style="cursor:default"><span class="v money">${m$(inv.filter(i => i.status !== 'Anulada').reduce((s, i) => s + i.paid, 0))}</span><span class="k">Cobrado</span></div><div class="fig ${bal ? 'alert' : ''}" style="cursor:default"><span class="v money">${m$(bal)}</span><span class="k">Saldo pendiente</span></div></div>
  <section class="panel"><div class="panel-h"><h3>Facturas</h3>${a.can('finanzas.gestionar') ? `<button class="btn sm" data-act="newInvoice" data-case="${c.id}">${icon('plus')}Nueva factura</button>` : ''}</div>${VA.table('cinv:' + c.id, [{ k: 'number', l: 'N°', lead: true, fn: i => `<span class="mono">${esc(i.number)}</span><div class="xs muted">${esc(i.concept)}</div>` }, { k: 'dueAt', l: 'Vence', fn: i => fd(i.dueAt) }, { k: 'total', l: 'Importe', cls: 'num', fn: i => m$(i.total) }, { k: 'balance', l: 'Saldo', cls: 'num', fn: i => m$(i.balance) }, { k: 'status', l: 'Estado', fn: i => VA.pill(i.status) }], inv, { go: a.can('finanzas.gestionar') || S.me.lawyerPerms?.verFinanzas ? i => 'factura.' + i.id : null, empty: VA.empty('book', 'Sin facturas') })}</section>
  <section class="panel"><div class="panel-h"><h3>Presupuestos</h3>${canQ ? `<button class="btn sm" data-act="newQuote" data-case="${c.id}">${icon('plus')}Nuevo presupuesto</button>` : ''}</div>${VA.table('cq:' + c.id, [{ k: 'number', l: 'N°', lead: true, fn: q => `<span class="mono">${esc(q.number)}</span> <span class="xs muted">v${q.version}</span><div class="xs muted">${esc(q.service)}</div>` }, { k: 'total', l: 'Total', cls: 'num', fn: q => m$(q.total) }, { k: 'status', l: 'Estado', fn: q => VA.pill(q.status) }], c.quotes, { go: q => 'presupuesto.' + q.id, empty: VA.empty('file', 'Sin presupuestos') })}</section>
  <section class="panel"><div class="panel-h"><h3>Pagos</h3></div>${paymentsTable(c.finance.payments.map(p => Object.assign({}, p)), 'cpay:' + c.id)}</section>`;
}
ACT.editCase = el => {
  const c = A().case(el.dataset.id); const fin = A().can('finanzas.gestionar');
  VA.openModal({ title: 'Editar expediente', wide: true, form: 'editCase', body: `<input type="hidden" name="id" value="${c.id}"><div class="form-grid">
  <label class="field full"><span>Título</span><input class="in" name="title" value="${esc(c.title)}" required></label>
  <label class="field"><span>Prioridad</span><select class="in" name="priority">${VA.opts(VA.PRIORITIES, c.priority)}</select></label>
  <label class="field"><span>Próxima fecha</span><input class="in" type="date" name="nextDate" value="${c.next ? c.next.date : ''}"></label>
  <label class="field"><span>Qué ocurre ese día</span><input class="in" name="nextLabel" value="${esc(c.next ? c.next.label : '')}"></label>
  ${fin ? `<label class="field"><span>Honorarios acordados (USD)</span><input class="in" name="fees" inputmode="decimal" value="${VA.centsInput(c.feesCents)}"></label>` : ''}
  <label class="field full"><span>Descripción interna</span><textarea class="in" name="description">${esc(c.description)}</textarea></label>
  <label class="field full"><span>Resumen para el cliente</span><textarea class="in" name="clientSummary">${esc(c.clientSummary)}</textarea></label></div><div id="ec-err" class="err" role="alert"></div>`,
    foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Guardar cambios</button>` });
};
FORM.editCase = (d, form) => { const patch = { title: d.title, priority: d.priority, nextDate: d.nextDate || null, nextLabel: d.nextLabel, description: d.description, clientSummary: d.clientSummary }; if (d.fees !== undefined) { const v = VA.parseMoney(d.fees); if (isNaN(v)) { form.querySelector('#ec-err').textContent = 'Revisá el importe de honorarios (ejemplo: 3.500,00).'; return; } patch.feesCents = v; } try { A().updateCase(d.id, patch); S.modal = null; VA.toast('Expediente actualizado.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#ec-err').textContent = e.message; } };
ACT.reassign = el => { const c = A().case(el.dataset.id); const ls = A().lawyers().filter(l => l.active); VA.openModal({ title: 'Reasignar responsable', wide: true, form: 'reassign', body: `<input type="hidden" name="id" value="${c.id}"><p class="small muted">Ordenados por carga de trabajo. Se notifica al nuevo responsable y al cliente.</p><div class="choice">${lawyerChoices(ls, '', c.lawyerId)}</div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Reasignar</button>` }); };
FORM.reassign = d => { S.modal = null; VA.run(() => A().assignCase(d.id, d.lawyerId), 'Expediente reasignado.'); };
ACT.extraAccess = el => { const c = A().case(el.dataset.id); const ls = A().lawyers().filter(l => l.id !== c.lawyerId); VA.openModal({ title: 'Permisos adicionales', form: 'extraAccess', body: `<input type="hidden" name="id" value="${c.id}"><p class="small muted">Habilitá a otros profesionales a consultar este expediente. El cambio queda en la auditoría.</p>${ls.map(l => `<label class="check"><input type="checkbox" name="l" value="${l.id}"${c.extraLawyerIds.includes(l.id) ? ' checked' : ''}> <span>${esc(l.name)} <span class="muted small">· ${esc(l.specialty)}</span></span></label>`).join('')}`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Guardar permisos</button>` }); };
FORM.extraAccess = d => { S.modal = null; VA.run(() => A().setExtraAccess(d.id, [].concat(d.l || [])), 'Permisos actualizados.'); };

/* comunicación con plantilla */
ACT.sendTpl = el => { const tps = A().templates(); const id = tps[0].id; S.ui.tpl = { caseId: el.dataset.id, id }; tplModal(); };
function tplModal() {
  const t = S.ui.tpl; const tps = A().templates(); const r = A().renderTemplate(t.id, t.caseId);
  VA.openModal({ title: 'Enviar comunicación', wide: true, form: 'sendTpl', body: `
  <label class="field"><span>Plantilla</span><select class="in" id="tp-sel" data-change="tplPick">${VA.opts(tps.map(x => ({ v: x.id, l: x.category + ' · ' + x.name })), t.id)}</select></label>
  <label class="field"><span>Asunto</span><input class="in" name="subject" value="${esc(r.subject)}"></label>
  <label class="field"><span>Mensaje <span class="hint">· podés ajustarlo antes de enviar</span></span><textarea class="in" name="body" style="min-height:220px">${esc(r.body)}</textarea></label>
  ${VA.notice('mail', 'Se publica en las notificaciones del cliente y se encola para correo. <b>Modo demostración:</b> sin proveedor de correo, el envío queda en la bandeja de salida simulada.', 'gold')}`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">${icon('send')}Enviar al cliente</button>` });
}
CHG.tplPick = el => { S.ui.tpl.id = el.value; tplModal(); };
FORM.sendTpl = d => { const t = S.ui.tpl; S.modal = null; VA.run(() => A().sendTemplate(t.id, t.caseId, { subject: d.subject, body: d.body }), 'Comunicación enviada.'); };

/* ════════ TAREAS ════════ */
V.tareas = () => {
  const f = VA.F('tasks'); const list = A().tasks({ mine: f.mine !== false && role() === 'lawyer' ? true : !!f.mine });
  const open = list.filter(t => !t.done), done = list.filter(t => t.done);
  return `${VA.pageH('Tareas', open.length + ' pendientes', `<div class="seg" role="group" aria-label="Alcance"><button data-act="taskScope" data-v="1" aria-pressed="${!!(f.mine || role() === 'lawyer' && f.mine !== false)}">Mías</button><button data-act="taskScope" data-v="0" aria-pressed="${!(f.mine || role() === 'lawyer' && f.mine !== false)}">Todas las visibles</button></div>`)}
  <div class="split"><div class="stack lg"><section class="panel"><div class="panel-h"><h3>Pendientes</h3></div>${open.length ? `<ul class="list">${open.map(taskLi).join('')}</ul>` : VA.empty('task', 'Sin tareas pendientes')}</section>
  ${done.length ? `<section class="panel"><div class="panel-h"><h3>Completadas</h3></div><ul class="list">${done.slice(0, 12).map(taskLi).join('')}</ul></section>` : ''}</div>
  <section class="panel"><div class="panel-h"><h3>Nueva tarea</h3></div><div class="panel-b">${taskForm(null)}</div></section></div>`;
};
ACT.taskScope = el => { VA.filter('tasks', { mine: el.dataset.v === '1' }); VA.refresh(); };

/* ════════ CRM ════════ */
V.crm = id => {
  if (id) return contactView(id);
  const a = A(); const f = VA.F('crm'); const view = f.view || 'kanban';
  const rows = a.contacts(f); const alerts = a.alerts(); const lawyers = a.lawyers();
  const staff = VA.db.users.filter(u => u.role !== 'client' && u.active);
  const alertsHTML = `<section class="panel"><div class="panel-h"><h3>Seguimiento comercial</h3><span class="small muted">${alerts.length} alertas</span></div>${alerts.length ? `<ul class="list">${alerts.map(x => `<li><span class="pill ${x.severity === 'alta' ? 'bad' : x.severity === 'media' ? 'warn' : 'info'} plain">${esc(x.kind)}</span><button class="link grow" style="text-align:left;color:var(--ink);text-decoration:none;font-weight:400" data-go="${esc(x.link)}">${esc(x.text)}</button>${x.tasked ? '<span class="xs muted nowrap">Tarea creada</span>' : `<span class="row" style="gap:6px;flex-wrap:nowrap"><label class="sr" for="al-${esc(x.key)}">Asignar a</label><select class="in" id="al-${esc(x.key).replace(/[^a-z0-9]/gi, '')}" style="width:auto;min-height:30px;padding:2px 8px;font-size:13px" data-al="${esc(x.key)}">${VA.opts(staff.map(u => ({ v: u.id, l: u.name })), S.me.id)}</select><button class="btn sm" data-act="alertTask" data-key="${esc(x.key)}">Convertir en tarea</button></span>`}</li>`).join('')}</ul>` : VA.empty('check', 'Sin alertas', 'Todo el seguimiento está al día.')}</section>`;
  const filters = `<div class="row">
    <div class="search" style="max-width:260px">${icon('search')}<label class="sr" for="crm-q">Buscar contacto</label><input id="crm-q" class="in" type="search" placeholder="Nombre, correo o etiqueta" value="${esc(f.q || '')}" data-input="crmQ"></div>
    <select class="in" style="width:auto" data-change="crmF" data-k="stage" aria-label="Estado comercial">${VA.opts(VA.PIPELINE, f.stage, 'Todos los estados')}</select>
    <select class="in" style="width:auto" data-change="crmF" data-k="area" aria-label="Especialidad">${VA.opts(VA.AREAS, f.area, 'Todas las áreas')}</select>
    <select class="in" style="width:auto" data-change="crmF" data-k="lawyerId" aria-label="Abogado asignado">${VA.opts(lawyers.map(l => ({ v: l.id, l: l.name })), f.lawyerId, 'Cualquier abogado')}</select>
    <select class="in" style="width:auto" data-change="crmF" data-k="source" aria-label="Fuente">${VA.opts(VA.SOURCES, f.source, 'Todas las fuentes')}</select>
    <select class="in" style="width:auto" data-change="crmF" data-k="debt" aria-label="Deuda">${VA.opts([{ v: 'si', l: 'Con deuda pendiente' }], f.debt, 'Con o sin deuda')}</select>
    <select class="in" style="width:auto" data-change="crmF" data-k="quotes" aria-label="Presupuestos">${VA.opts([{ v: 'aceptados', l: 'Con presupuestos aceptados' }, { v: 'rechazados', l: 'Con presupuestos rechazados' }], f.quotes, 'Todos los presupuestos')}</select>
    <label class="row small" style="gap:6px">Ingreso desde <input class="in" type="date" style="width:auto" data-change="crmF" data-k="from" value="${esc(f.from || '')}"></label>
    ${Object.keys(f).some(k => k !== 'view' && f[k]) ? '<button class="btn ghost sm" data-act="crmClear">Limpiar</button>' : ''}</div>`;
  const kanban = `<div class="kanban">${VA.PIPELINE.map(st => { const items = rows.filter(r => r.stage === st); return `<div class="kcol" data-stage="${esc(st)}"><h4><span>${esc(st)}</span><span>${items.length}</span></h4>${items.map(r => `<div class="kcard" draggable="true" data-cid="${r.id}"><button class="link nm" style="text-align:left;color:var(--ink);text-decoration:none" data-go="crm.${r.id}">${esc(r.name)}</button><span class="xs muted">${esc(r.area)} · ${esc(r.source)}</span>${r.nextAction ? `<span class="xs ${r.nextAction.date < today() ? '' : 'muted'}" style="${r.nextAction.date < today() ? 'color:var(--bad)' : ''}">${icon('clock').replace('<svg', '<svg style="width:12px;height:12px;vertical-align:-2px"')} ${esc(r.nextAction.text)} · ${fd(r.nextAction.date)}</span>` : ''}${r.debt ? `<span class="xs" style="color:var(--bad)">Deuda ${m$(r.debt)}</span>` : ''}<label class="sr" for="mv-${r.id}">Mover a</label><select class="in" id="mv-${r.id}" data-change="crmStage" data-id="${r.id}">${VA.opts(VA.PIPELINE, r.stage)}</select></div>`).join('') || '<p class="xs muted" style="padding:6px">Sin contactos</p>'}</div>`; }).join('')}</div>`;
  const table = `<div class="panel">${VA.table('crm', [
    { k: 'name', l: 'Contacto', lead: true, fn: r => `<b style="font-weight:500">${esc(r.name)}</b><div class="xs muted">${esc(r.email)}</div>` },
    { k: 'kind', l: 'Tipo', fn: r => `<span class="small">${esc(r.kind)}</span>` },
    { k: 'stage', l: 'Estado comercial', fn: r => VA.pill(r.stage), sortv: r => VA.PIPELINE.indexOf(r.stage) },
    { k: 'area', l: 'Área' }, { k: 'source', l: 'Fuente' },
    { k: 'lawyerName', l: 'Abogado', fn: r => esc(r.lawyerName || '—') },
    { k: 'firstContact', l: 'Ingreso', fn: r => fd(r.firstContact) },
    { k: 'debt', l: 'Deuda', cls: 'num', fn: r => r.debt ? `<span style="color:var(--bad)">${m$(r.debt)}</span>` : '—' },
    { k: 'lastActivity', l: 'Última actividad', fn: r => `<span class="small">${VA.rel(r.lastActivity)}</span>` }
  ], rows, { go: r => 'crm.' + r.id, defaultSort: { k: 'lastActivity', dir: 'desc' } })}</div>`;
  if (view === 'kanban') VA.after(bindKanban);
  return `${VA.pageH('CRM jurídico', rows.length + ' contactos · potenciales, clientes registrados y clientes con asuntos activos', `<div class="seg" role="group" aria-label="Vista"><button data-act="crmView" data-v="kanban" aria-pressed="${view === 'kanban'}">${icon('kanban').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} Kanban</button><button data-act="crmView" data-v="tabla" aria-pressed="${view === 'tabla'}">${icon('list').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} Tabla</button></div><button class="btn primary" data-act="newContact">${icon('plus')}Nuevo contacto</button>`)}
  ${alertsHTML}${filters}${view === 'kanban' ? kanban : table}`;
};
function bindKanban() {
  document.querySelectorAll('.kcard').forEach(c => c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.dataset.cid); }));
  document.querySelectorAll('.kcol').forEach(col => { col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drop'); }); col.addEventListener('dragleave', () => col.classList.remove('drop')); col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('drop'); const id = e.dataTransfer.getData('text/plain'); if (id) VA.run(() => A().setStage(id, col.dataset.stage), 'Etapa actualizada.'); }); });
}
let crq; INP.crmQ = el => { clearTimeout(crq); crq = setTimeout(() => { VA.filter('crm', { q: el.value }); VA.refresh(); }, 220); };
CHG.crmF = el => { VA.filter('crm', { [el.dataset.k]: el.value }); VA.refresh(); };
ACT.crmClear = () => { S.filters.crm = { view: VA.F('crm').view }; VA.filter('crm', {}); VA.refresh(); };
ACT.crmView = el => { VA.filter('crm', { view: el.dataset.v }); VA.refresh(); };
CHG.crmStage = el => VA.run(() => A().setStage(el.dataset.id, el.value), 'Etapa actualizada.');
ACT.alertTask = el => { const key = el.dataset.key; const sel = document.querySelector(`select[data-al="${CSS.escape(key)}"]`); VA.run(() => A().alertToTask(key, sel ? sel.value : S.me.id), 'Tarea creada y asignada.'); };
ACT.newContact = () => contactForm(null);
function contactForm(c) {
  const ls = A().lawyers(); const staff = VA.db.users.filter(u => u.role === 'admin' && u.active);
  c = c || { name: '', email: '', phone: '', area: 'Derecho de Familia', source: 'Sitio web', tags: [], notes: '', nextAction: null, ownerId: S.me.id };
  VA.openModal({ title: c.id ? 'Editar contacto' : 'Nuevo contacto', wide: true, form: 'contact', body: `<input type="hidden" name="id" value="${c.id || ''}"><div class="form-grid">
  <label class="field"><span>Nombre y apellido</span><input class="in" name="name" value="${esc(c.name)}" required></label>
  <label class="field"><span>Correo</span><input class="in" name="email" type="email" value="${esc(c.email)}"></label>
  <label class="field"><span>Teléfono</span><input class="in" name="phone" value="${esc(c.phone)}"></label>
  <label class="field"><span>Área consultada</span><select class="in" name="area">${VA.opts(VA.AREAS, c.area)}</select></label>
  <label class="field"><span>Fuente de adquisición</span><select class="in" name="source">${VA.opts(VA.SOURCES, c.source)}</select></label>
  <label class="field"><span>Abogado asignado</span><select class="in" name="lawyerId">${VA.opts(ls.map(l => ({ v: l.id, l: l.name })), c.lawyerId, 'Sin asignar')}</select></label>
  <label class="field"><span>Responsable comercial</span><select class="in" name="ownerId">${VA.opts(staff.map(u => ({ v: u.id, l: u.name })), c.ownerId)}</select></label>
  <label class="field"><span>Etiquetas <span class="hint">· separadas por coma</span></span><input class="in" name="tags" value="${esc((c.tags || []).join(', '))}"></label>
  <label class="field"><span>Próxima acción</span><input class="in" name="nextText" value="${esc(c.nextAction ? c.nextAction.text : '')}"></label>
  <label class="field"><span>Fecha de la próxima acción</span><input class="in" type="date" name="nextDate" value="${c.nextAction ? c.nextAction.date : ''}"></label>
  <label class="field full"><span>Notas internas <span class="hint">· nunca visibles para el cliente</span></span><textarea class="in" name="notes" style="background:var(--hatch),var(--paper)">${esc(c.notes)}</textarea></label></div><div id="ct-err" class="err" role="alert"></div>`,
    foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Guardar</button>` });
}
FORM.contact = (d, form) => { try { const id = A().saveContact(d.id || null, d); S.modal = null; VA.toast('Contacto guardado.', 'ok'); if (!d.id) VA.go('crm.' + id); else VA.refresh(); } catch (e) { form.querySelector('#ct-err').textContent = e.message; } };
function contactView(id) {
  const a = A(); const c = a.contact(id);
  return `${VA.pageH(esc(c.name), `${esc(c.clientId ? (c.cases.some(k => !['Cerrado', 'Archivado'].includes(k.status)) ? 'Cliente con asuntos activos' : 'Cliente registrado') : 'Contacto potencial')} · desde ${fd(c.firstContact)} · ${esc(c.source)}`, `<label class="sr" for="ct-stage">Estado comercial</label><select class="in" id="ct-stage" style="width:auto" data-change="crmStage" data-id="${c.id}">${VA.opts(VA.PIPELINE, c.stage)}</select><button class="btn" data-act="editContact" data-id="${c.id}">${icon('edit')}Editar</button>${c.clientId ? `<button class="btn" data-go="cliente.${c.clientId}">Ficha de cliente</button>` : `<button class="btn" data-act="onboard" data-id="${c.id}">Incorporar como cliente</button>`}${a.can('finanzas.gestionar') ? `<button class="btn primary" data-act="newQuote" data-contact="${c.id}">${icon('file')}Crear presupuesto</button>` : ''}`, ['crm', 'CRM'])}
  <div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Historial de comunicaciones</h3></div><div class="panel-b stack">
      <form data-form="comm" data-id="${c.id}" class="row top" novalidate><label class="sr" for="cm-ch">Canal</label><select class="in" id="cm-ch" name="channel" style="width:auto">${VA.opts(['Teléfono', 'Correo', 'WhatsApp', 'Reunión', 'Nota'])}</select><label class="sr" for="cm-s">Resumen</label><input class="in grow" id="cm-s" name="summary" placeholder="Qué se habló o qué se acordó" required><button class="btn primary" type="submit">Registrar</button></form>
      <ol class="tl">${c.communications.map(m => `<li class="${m.channel === 'Sistema' ? 'sistema' : ''}"><div class="meta"><span class="tag">${esc(m.channel)}</span><span>${esc(m.byName)}</span><span>${fdt(m.at)}</span></div><p>${esc(m.summary)}</p></li>`).join('')}</ol>
    </div></section>
    ${c.cases.length ? `<section class="panel"><div class="panel-h"><h3>Casos relacionados</h3></div><ul class="list">${c.cases.map(k => `<li class="click" data-go="expediente.${k.id}" tabindex="0"><div class="grow"><span class="mono xs muted">${esc(k.number)}</span><div>${esc(k.title)}</div></div>${VA.pill(k.status)}</li>`).join('')}</ul></section>` : ''}
    <section class="panel"><div class="panel-h"><h3>Presupuestos</h3></div>${c.quotes.length ? `<ul class="list">${c.quotes.map(q => `<li class="click" data-go="presupuesto.${q.id}" tabindex="0"><div class="grow"><span class="mono xs muted">${esc(q.number)} · v${q.version}</span><div>${esc(q.service)}</div></div><span class="nowrap">${m$(q.total)}</span>${VA.pill(q.status)}</li>`).join('')}</ul>` : VA.empty('file', 'Sin presupuestos')}</section>
    ${c.invoices.length ? `<section class="panel"><div class="panel-h"><h3>Facturas y pagos</h3><span class="small ${c.debt ? '' : 'muted'}" style="${c.debt ? 'color:var(--bad);font-weight:600' : ''}">Deuda pendiente: ${m$(c.debt)}</span></div><ul class="list">${c.invoices.map(i => `<li class="click" data-go="factura.${i.id}" tabindex="0"><div class="grow"><span class="mono">${esc(i.number)}</span><div class="xs muted">${esc(i.concept)} · vence ${fd(i.dueAt)}</div></div><span class="nowrap">${m$(i.total)}</span>${VA.pill(i.status)}</li>`).join('')}</ul><div class="panel-b" style="border-top:1px solid var(--line)"><span class="small muted">Pagos recibidos: ${m$(c.payments.filter(p => ['Confirmado', 'Reembolso parcial', 'Reembolsado'].includes(p.status)).reduce((s, p) => s + p.amountCents - (p.refundedCents || 0), 0))} en ${c.payments.length} operaciones</span></div></section>` : ''}
  </div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Datos</h3></div><div class="panel-b">${VA.kv([['Correo', esc(c.email)], ['Teléfono', esc(c.phone)], ['Área consultada', esc(c.area)], ['Fuente', esc(c.source)], ['Primer contacto', fd(c.firstContact)], ['Abogado asignado', esc(c.lawyerName || '—')], ['Responsable comercial', esc(c.ownerName)], ['Última actividad', VA.rel(c.lastActivity)], ['Etiquetas', c.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(' ')]])}</div></section>
    <section class="panel"><div class="panel-h"><h3>Próxima acción</h3></div><div class="panel-b">${c.nextAction ? `<p><b style="font-weight:600">${esc(c.nextAction.text)}</b></p><p class="small ${c.nextAction.date < today() ? '' : 'muted'}" style="${c.nextAction.date < today() ? 'color:var(--bad)' : ''}">${fd(c.nextAction.date)}${c.nextAction.date < today() ? ' · vencida' : ''}</p>` : '<p class="muted small">Sin próxima acción definida.</p>'}</div></section>
    <section class="panel" style="background:var(--hatch),var(--paper)"><div class="panel-h"><h3>Notas internas</h3><span class="vis int">${icon('lock')}No visible para el cliente</span></div><div class="panel-b"><p style="white-space:pre-wrap">${esc(c.notes) || '<span class="muted">Sin notas.</span>'}</p></div></section>
    <section class="panel"><div class="panel-h"><h3>Reuniones</h3></div>${c.meetings.length ? `<ul class="list tight">${c.meetings.map(m => `<li class="click" data-act="openMeeting" data-id="${m.id}"><div class="grow small">${fdt(m.start)}<div class="xs muted">${esc(m.type)} · ${esc(m.lawyerName)}</div></div>${VA.pill(m.status)}</li>`).join('')}</ul>` : VA.empty('calendar', 'Sin reuniones')}</section>
  </div></div>`;
}
ACT.editContact = el => contactForm(A().contact(el.dataset.id));
FORM.comm = (d, form) => VA.run(() => A().addComm(form.dataset.id, d.channel, d.summary), 'Comunicación registrada.');
ACT.onboard = el => VA.confirm({ title: 'Incorporar como cliente', text: 'Se crea la cuenta de cliente y se envía la invitación al portal (simulada en la demo). Sus presupuestos quedan vinculados a la cuenta.', label: 'Crear cuenta de cliente' }, () => VA.run(() => A().onboardContact(el.dataset.id), 'Cliente creado. Invitación encolada en la bandeja de salida.'));

/* ════════ AGENDA ════════ */
V.turnos = arg => role() === 'client' ? C.turns(arg) : V.agenda();
V.agenda = () => {
  if (role() === 'client') return C.turns();
  const a = A(); const cal = S.ui.cal = S.ui.cal || { view: 'semana', date: today(), lawyer: role() === 'lawyer' ? S.me.lawyerId : '' };
  if (role() === 'lawyer') cal.lawyer = S.me.lawyerId;
  const lawyers = a.lawyers();
  const all = a.meetings(cal.lawyer ? { lawyerId: cal.lawyer } : {});
  const pend = all.filter(m => m.status === 'Pendiente de aprobación' || m.status === 'Reprogramación propuesta');
  const visible = all.filter(m => !['Rechazado', 'Cancelado'].includes(m.status));
  const blocks = a.blocks(cal.lawyer || undefined);
  const d0 = VA.toD(cal.date);
  let title = '', grid = '';
  if (cal.view === 'mes') { title = VA.MESL[d0.getMonth()] + ' ' + d0.getFullYear(); grid = monthGrid(d0, visible); }
  else if (cal.view === 'lista') { title = 'Todas las reuniones'; grid = `<div class="panel">${VA.table('meet', [{ k: 'start', l: 'Fecha', lead: true, fn: m => `<b style="font-weight:600">${fd(m.start)}</b> <span class="muted small">${VA.fTime(m.start)}–${VA.fTime(m.end)}</span>` }, { k: 'clientName', l: 'Cliente' }, { k: 'lawyerName', l: 'Profesional' }, { k: 'type', l: 'Tipo' }, { k: 'totalCents', l: 'Costo', cls: 'num', fn: m => m$(m.totalCents) + `<div class="xs muted">${m.durationMin} min · ${m$(m.rateCents)}/h</div>` }, { k: 'status', l: 'Estado', fn: m => VA.pill(m.status) }, { k: 'x', l: '', sort: false, fn: m => `<button class="btn sm" data-act="openMeeting" data-id="${m.id}">Abrir</button>` }], all, { defaultSort: { k: 'start', dir: 'desc' } })}</div>`; }
  else {
    const days = cal.view === 'dia' ? [d0] : weekDays(d0);
    title = cal.view === 'dia' ? VA.fDay(d0) : 'Semana del ' + days[0].getDate() + ' de ' + VA.MESL[days[0].getMonth()];
    grid = `<div class="tw">${weekGrid(days, visible, blocks, cal.lawyer ? null : lawyers)}</div>`;
  }
  return `${VA.pageH('Agenda', role() === 'lawyer' ? 'Tus reuniones, solicitudes y bloqueos' : 'Reuniones de todo el equipo', `<button class="btn" data-act="newBlock">${icon('lock')}Bloquear horario</button><button class="btn primary" data-act="proposeMeeting" data-lawyer="${role() === 'lawyer' ? S.me.lawyerId : (cal.lawyer || '')}">${icon('plus')}Agendar reunión</button>`)}
  ${pend.length ? `<section class="panel"><div class="panel-h"><h3>Solicitudes por resolver</h3><span class="small muted">El pago ya está confirmado; el turno se confirma al aprobarlo.</span></div><ul class="list">${pend.map(m => `<li>${VA.avatar(m.lawyerName, m.lawyerPhoto)}<div class="grow"><b style="font-weight:500">${esc(m.clientName)}</b> <span class="small muted">con ${esc(m.lawyerName)}</span><div class="xs muted">${esc(m.type)} · ${fdt(m.start)} · ${m.durationMin} min · ${m$(m.totalCents)}${m.proposedStart ? ' · propuesto: ' + fdt(m.proposedStart) : ''}</div>${m.description ? `<div class="small" style="margin-top:4px;color:var(--ink-2)">«${esc(m.description)}»</div>` : ''}</div>${VA.pill(m.status)}<span class="row" style="gap:6px">${m.status === 'Pendiente de aprobación' ? `<button class="btn sm primary" data-act="mAct" data-a="approve" data-id="${m.id}">Aprobar</button>` : ''}<button class="btn sm" data-act="openMeeting" data-id="${m.id}">Gestionar</button></span></li>`).join('')}</ul></section>` : ''}
  <div class="row between">
    <div class="row"><button class="btn icon" data-act="calNav" data-d="-1" aria-label="Anterior">${icon('left')}</button><button class="btn sm" data-act="calNav" data-d="0">Hoy</button><button class="btn icon" data-act="calNav" data-d="1" aria-label="Siguiente">${icon('right')}</button><h2 class="serif" style="font-size:20px">${esc(title.charAt(0).toUpperCase() + title.slice(1))}</h2></div>
    <div class="row">${role() === 'admin' ? `<label class="sr" for="cal-l">Profesional</label><select id="cal-l" class="in" style="width:auto" data-change="calLawyer">${VA.opts(lawyers.map(l => ({ v: l.id, l: l.name })), cal.lawyer, 'Todo el equipo')}</select>` : ''}
    <div class="seg" role="group" aria-label="Vista">${[['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes'], ['lista', 'Lista']].map(([v, l]) => `<button data-act="calView" data-v="${v}" aria-pressed="${cal.view === v}">${l}</button>`).join('')}</div></div>
  </div>
  ${grid}
  <div class="row small muted"><span class="cal-ev s-ok" style="position:static;display:inline-block">Aprobada</span><span class="cal-ev s-warn" style="position:static;display:inline-block">Pendiente</span><span class="cal-ev s-gold" style="position:static;display:inline-block">Reprogramación propuesta</span><span class="cal-ev s-done" style="position:static;display:inline-block">Realizada</span><span style="display:inline-block;padding:2px 8px;background:var(--hatch);border:1px solid var(--line-2)">Bloqueado</span></div>`;
};
const weekDays = d => { const x = new Date(d); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return [0, 1, 2, 3, 4].map(i => VA.addDays(x, i)); };
const evClass = s => s === 'Aprobado' ? 's-ok' : s === 'Realizado' ? 's-done' : s === 'Reprogramación propuesta' ? 's-gold' : 's-warn';
function weekGrid(days, meetings, blocks, lawyers) {
  const H0 = 9, H1 = 18, ROW = 52; const t0 = today();
  let html = `<div class="cal" style="grid-template-columns:56px repeat(${days.length},minmax(0,1fr))"><div class="cal-h"><div></div>${days.map(d => `<div class="${VA.ymd(d) === t0 ? 'today' : ''}">${VA.DIA[d.getDay()]} ${d.getDate()}</div>`).join('')}</div>`;
  html += `<div>${Array.from({ length: H1 - H0 }, (_, i) => `<div class="cal-time" style="height:${ROW}px">${H0 + i}:00</div>`).join('')}</div>`;
  days.forEach(d => {
    const key = VA.ymd(d);
    let col = `<div class="cal-col" style="height:${(H1 - H0) * ROW}px">${Array.from({ length: H1 - H0 }, () => `<div class="cal-slot" style="height:${ROW}px"></div>`).join('')}`;
    blocks.filter(b => VA.ymd(new Date(b.start)) === key).forEach(b => { const s = new Date(b.start), e = new Date(b.end); const top = ((s.getHours() + s.getMinutes() / 60) - H0) * ROW; const h = ((e - s) / 3600e3) * ROW; col += `<div class="cal-block" style="top:${top}px;height:${h}px">${esc(b.reason)}${lawyers ? ' · ' + esc((lawyers.find(l => l.id === b.lawyerId) || {}).name || '') : ''} <button class="link xs" data-act="rmBlock" data-id="${b.id}" style="pointer-events:auto">Quitar</button></div>`; });
    meetings.filter(m => VA.ymd(new Date(m.start)) === key || (m.proposedStart && VA.ymd(new Date(m.proposedStart)) === key)).forEach(m => {
      const st = m.proposedStart && VA.ymd(new Date(m.proposedStart)) === key && VA.ymd(new Date(m.start)) !== key ? new Date(m.proposedStart) : new Date(m.start);
      const top = ((st.getHours() + st.getMinutes() / 60) - H0) * ROW; const h = Math.max(24, m.durationMin / 60 * ROW - 3);
      col += `<button class="cal-ev ${evClass(m.status)}" style="top:${top + 1}px;height:${h}px" data-act="openMeeting" data-id="${m.id}"><b>${VA.fTime(st)} ${esc(m.clientName)}</b>${esc(lawyers ? m.lawyerName : m.type)}</button>`;
    });
    html += col + '</div>';
  });
  return html + '</div>';
}
function monthGrid(d0, meetings) {
  const first = new Date(d0.getFullYear(), d0.getMonth(), 1); const start = VA.addDays(first, -((first.getDay() + 6) % 7)); const t0 = today();
  let html = `<div class="month">${['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(x => `<div class="mh">${x}</div>`).join('')}`;
  for (let i = 0; i < 42; i++) { const d = VA.addDays(start, i); const key = VA.ymd(d); const evs = meetings.filter(m => VA.ymd(new Date(m.start)) === key);
    html += `<div class="md ${d.getMonth() !== d0.getMonth() ? 'out' : ''} ${key === t0 ? 'today' : ''}"><span class="dn">${d.getDate()}</span>${evs.map(m => `<button class="mev cal-ev ${evClass(m.status)}" style="position:static" data-act="openMeeting" data-id="${m.id}" title="${esc(VA.fTime(m.start) + ' ' + m.clientName)}">${VA.fTime(m.start)} ${esc(m.clientName)}</button>`).join('')}</div>`; }
  return html + '</div>';
}
ACT.calNav = el => { const c = S.ui.cal; const n = +el.dataset.d; if (!n) c.date = today(); else { const d = VA.toD(c.date); if (c.view === 'mes') d.setMonth(d.getMonth() + n); else d.setDate(d.getDate() + n * (c.view === 'dia' ? 1 : 7)); c.date = VA.ymd(d); } VA.refresh(); };
ACT.calView = el => { S.ui.cal.view = el.dataset.v; VA.refresh(); };
CHG.calLawyer = el => { S.ui.cal.lawyer = el.value; VA.refresh(); };
ACT.rmBlock = el => VA.confirm({ title: 'Quitar bloqueo', text: 'El horario vuelve a estar disponible para turnos.', label: 'Quitar bloqueo' }, () => VA.run(() => A().removeBlock(el.dataset.id), 'Bloqueo eliminado.'));
ACT.newBlock = () => { const ls = A().lawyers(); VA.openModal({ title: 'Bloquear horario', form: 'block', body: `<div class="form-grid">${role() === 'admin' ? `<label class="field full"><span>Profesional</span><select class="in" name="lawyerId">${VA.opts(ls.map(l => ({ v: l.id, l: l.name })), S.ui.cal.lawyer)}</select></label>` : `<input type="hidden" name="lawyerId" value="${S.me.lawyerId}">`}<label class="field"><span>Día</span><input class="in" type="date" name="date" value="${VA.dateOnly(VA.now(), 1)}" required></label><label class="field"><span>Desde</span><input class="in" type="time" name="from" value="09:00" step="1800"></label><label class="field"><span>Hasta</span><input class="in" type="time" name="to" value="13:00" step="1800"></label><label class="field full"><span>Motivo</span><input class="in" name="reason" placeholder="Audiencia, licencia, trámite…"></label></div><div id="bk-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Bloquear</button>` }); };
FORM.block = (d, form) => { try { A().addBlock({ lawyerId: d.lawyerId, start: new Date(d.date + 'T' + d.from).toISOString(), end: new Date(d.date + 'T' + d.to).toISOString(), reason: d.reason }); S.modal = null; VA.toast('Horario bloqueado.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#bk-err').textContent = e.message; } };

/* agendar / proponer reunión desde el estudio */
ACT.proposeMeeting = el => { S.ui.pm = { caseId: el.dataset.case || '', lawyerId: el.dataset.lawyer || (role() === 'lawyer' ? S.me.lawyerId : ''), date: VA.dateOnly(VA.now(), 1), dur: 60 }; pmModal(); };
function pmModal() {
  const p = S.ui.pm; const a = A(); const ls = a.lawyers().filter(l => l.active); const cases = a.cases().filter(c => !['Cerrado', 'Archivado'].includes(c.status) && (!p.lawyerId || c.lawyerId === p.lawyerId || role() === 'admin'));
  const slots = p.lawyerId ? a.slots(p.lawyerId, p.date, p.dur) : [];
  const l = ls.find(x => x.id === p.lawyerId);
  VA.openModal({ title: 'Agendar reunión', wide: true, form: 'pm', body: `<div class="form-grid">
  ${role() === 'admin' ? `<label class="field"><span>Profesional</span><select class="in" name="lawyerId" data-change="pmField" data-k="lawyerId">${VA.opts(ls.map(x => ({ v: x.id, l: x.name + ' · ' + VA.money(x.rateCents) + '/h' })), p.lawyerId, 'Elegí')}</select></label>` : `<input type="hidden" name="lawyerId" value="${p.lawyerId}">`}
  <label class="field"><span>Expediente</span><select class="in" name="caseId" data-change="pmField" data-k="caseId">${VA.opts(cases.map(c => ({ v: c.id, l: c.number + ' · ' + c.clientName })), p.caseId, 'Sin expediente (reunión interna)')}</select></label>
  <label class="field"><span>Tipo</span><select class="in" name="type">${VA.opts(VA.MEETING_TYPES.map(t => t.name), 'Seguimiento de expediente')}</select></label>
  <label class="field"><span>Duración</span><select class="in" name="durationMin" data-change="pmField" data-k="dur">${VA.opts([{ v: 30, l: '30 minutos' }, { v: 60, l: '60 minutos' }, { v: 90, l: '90 minutos' }], p.dur)}</select></label>
  <label class="field"><span>Día</span><input class="in" type="date" name="date" value="${p.date}" min="${today()}" data-change="pmField" data-k="date"></label>
  <label class="field full"><span>Descripción</span><input class="in" name="description" placeholder="Tema de la reunión"></label></div>
  <div class="field"><span>Horarios disponibles</span>${p.lawyerId ? (slots.length ? `<div class="slots">${slots.map(s => `<label style="display:contents"><input type="radio" name="start" value="${s}" class="sr"><button type="button" data-act="pickSlot" data-v="${s}" aria-pressed="${p.start === s}">${VA.fTime(s)}</button></label>`).join('')}</div>` : '<p class="small muted">No hay horarios libres ese día. Probá otra fecha.</p>') : '<p class="small muted">Elegí un profesional.</p>'}</div>
  ${l ? `<div class="summary small">Costo: <b>${VA.money(Math.round(l.rateCents * p.dur / 60))}</b> (${VA.money(l.rateCents)}/h · ${p.dur} min). ${p.caseId ? 'El cliente recibe la propuesta y debe pagarla para reservar.' : 'Sin cliente: queda aprobada en la agenda.'}</div>` : ''}
  <div id="pm-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Agendar</button>` });
}
CHG.pmField = el => { const k = el.dataset.k; S.ui.pm[k] = k === 'dur' ? +el.value : el.value; S.ui.pm.start = null; if (k === 'caseId' && el.value && role() === 'admin') { try { S.ui.pm.lawyerId = A().case(el.value).lawyerId; } catch (e) { } } pmModal(); };
ACT.pickSlot = el => { S.ui.pm.start = el.dataset.v; document.querySelectorAll('.slots button').forEach(b => b.setAttribute('aria-pressed', b === el)); };
FORM.pm = (d, form) => { const p = S.ui.pm; if (!p.start) { form.querySelector('#pm-err').textContent = 'Elegí un horario disponible.'; return; } try { A().scheduleMeeting({ lawyerId: d.lawyerId || p.lawyerId, caseId: d.caseId, type: d.type, durationMin: p.dur, start: p.start, description: d.description }); S.modal = null; VA.toast(d.caseId ? 'Reunión propuesta. El cliente debe pagarla para reservar.' : 'Reunión agendada.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#pm-err').textContent = e.message; } };

/* ficha de la reunión (estudio) */
ACT.openMeeting = el => { S.ui.mm = { id: el.dataset.id, mode: null }; mmModal(); };
function mmModal() {
  const st = S.ui.mm; const a = A(); const m = a.meetings().find(x => x.id === st.id);
  if (!m) { VA.toast('La reunión ya no está disponible.', 'bad'); return; }
  if (role() === 'client') return C.meetingModal(m);
  const can = role() === 'admin' ? a.can('agenda.gestionar') : (m.lawyerId === S.me.lawyerId && S.me.lawyerPerms.aprobarTurnos);
  const past = new Date(m.start) < VA.now();
  let actions = '';
  if (can) {
    if (m.status === 'Pendiente de aprobación') actions = `<button class="btn primary" data-act="mAct" data-a="approve" data-id="${m.id}">${icon('check')}Aprobar</button><button class="btn" data-act="mMode" data-v="propose">Proponer otro horario</button><button class="btn danger" data-act="mMode" data-v="reject">Rechazar</button>`;
    else if (m.status === 'Aprobado') actions = `${past ? `<button class="btn primary" data-act="mAct" data-a="done" data-id="${m.id}">Marcar realizada</button>` : ''}<button class="btn" data-act="mMode" data-v="propose">Reprogramar</button><button class="btn danger" data-act="mMode" data-v="cancel">Cancelar</button>`;
    else if (['Reprogramación propuesta', 'Pendiente de pago'].includes(m.status)) actions = `<button class="btn danger" data-act="mMode" data-v="cancel">Cancelar</button>`;
  }
  let sub = '';
  if (st.mode === 'propose') { st.date = st.date || VA.ymd(new Date(m.start)); const slots = a.slots(m.lawyerId, st.date, m.durationMin); sub = `<div class="panel"><div class="panel-b stack"><b>Proponer un nuevo horario</b><label class="field"><span>Día</span><input class="in" type="date" value="${st.date}" min="${today()}" data-change="mmDate"></label>${slots.length ? `<div class="slots">${slots.map(s => `<button type="button" data-act="mmSlot" data-v="${s}" aria-pressed="${st.start === s}">${VA.fTime(s)}</button>`).join('')}</div>` : '<p class="small muted">Sin horarios libres ese día.</p>'}<p class="small muted">El cliente debe aceptar el nuevo horario. Si no lo acepta, se le reintegra el 100 %.</p><div class="row"><button class="btn primary" data-act="mAct" data-a="propose" data-id="${m.id}"${st.start ? '' : ' disabled'}>Enviar propuesta</button><button class="btn ghost" data-act="mMode" data-v="">Volver</button></div></div></div>`; }
  if (st.mode === 'reject' || st.mode === 'cancel') sub = `<div class="panel"><div class="panel-b stack"><b>${st.mode === 'reject' ? 'Rechazar la solicitud' : 'Cancelar la reunión'}</b><label class="field"><span>Mensaje para el cliente</span><textarea class="in" id="mm-reason" style="min-height:70px" placeholder="Explicá brevemente el motivo."></textarea></label><p class="small muted">${m.paymentId ? 'Se reintegra el 100 % del pago al cliente.' : 'No hay pagos para reintegrar.'}</p><div class="row"><button class="btn danger" data-act="mAct" data-a="${st.mode}" data-id="${m.id}">${st.mode === 'reject' ? 'Rechazar y reintegrar' : 'Cancelar reunión'}</button><button class="btn ghost" data-act="mMode" data-v="">Volver</button></div></div></div>`;
  VA.openModal({ title: m.type, wide: true, body: `
  <div class="row between"><div>${VA.pill(m.status)}${m.holdExpired ? ' <span class="small muted">Reserva vencida</span>' : ''}</div><span class="small muted">${m.caseNumber ? `<button class="link" data-go="expediente.${m.caseId}">${esc(m.caseNumber)}</button>` : 'Sin expediente'}</span></div>
  <div class="grid2"><div>${VA.kv([['Cliente', esc(m.clientName)], ['Profesional', esc(m.lawyerName)], ['Fecha', esc(VA.fDay(m.start))], ['Horario', VA.fTime(m.start) + ' a ' + VA.fTime(m.end) + ' (' + m.durationMin + ' min)'], m.proposedStart ? ['Horario propuesto', fdt(m.proposedStart)] : null, ['Área', esc(m.area)]])}</div>
  <div>${VA.kv([['Tarifa', m$(m.rateCents) + ' por hora'], ['Costo total', '<b>' + m$(m.totalCents) + '</b>'], ['Pago', m.payment ? VA.pill(m.payment.status) + ` <span class="xs muted mono">${esc(m.payment.providerId)}</span>` + (m.payment.refundedCents ? `<div class="xs">Reintegrado ${m$(m.payment.refundedCents)}</div>` : '') : '<span class="muted">Sin pago registrado</span>']])}</div></div>
  ${m.description ? `<div class="summary small"><span class="xs muted">Motivo indicado</span><p>${esc(m.description)}</p></div>` : ''}
  ${actions ? `<div class="row">${actions}</div>` : ''}${sub}
  <div class="grid2"><div class="field"><label class="lbl" for="mm-note">Notas privadas <span class="hint">· solo el equipo</span></label><textarea class="in" id="mm-note" style="background:var(--hatch),var(--paper);min-height:80px">${esc(m.privateNotes || '')}</textarea><div class="row"><button class="btn sm" data-act="mNote" data-id="${m.id}">Guardar nota</button>${m.caseId ? `<button class="btn sm" data-act="mTask" data-id="${m.id}" data-case="${m.caseId}">Crear tarea de seguimiento</button>` : ''}</div></div>
  <div><span class="lbl">Historial</span><ol class="tl" style="margin-top:6px">${m.history.slice().reverse().map(h => `<li class="sistema" style="padding:2px 0">${fdt(h.at)} · <b style="font-weight:600">${esc(h.to)}</b>${h.note ? ' — ' + esc(h.note) : ''}</li>`).join('')}</ol></div></div>` });
}
VA.mmModal = mmModal;
ACT.mMode = el => { S.ui.mm.mode = el.dataset.v || null; S.ui.mm.start = null; mmModal(); };
CHG.mmDate = el => { S.ui.mm.date = el.value; S.ui.mm.start = null; mmModal(); };
ACT.mmSlot = el => { S.ui.mm.start = el.dataset.v; mmModal(); };
ACT.mAct = el => {
  const id = el.dataset.id, act = el.dataset.a; const reason = (document.getElementById('mm-reason') || {}).value;
  const msgs = { approve: 'Turno aprobado. El cliente recibió la confirmación.', reject: 'Solicitud rechazada. Se reintegró el pago.', propose: 'Propuesta enviada al cliente.', cancel: 'Reunión cancelada.', done: 'Reunión marcada como realizada.' };
  try { A().meetingAction(id, act, { reason, start: S.ui.mm && S.ui.mm.start }); S.modal = null; VA.toast(msgs[act], 'ok'); VA.refresh(); } catch (e) { VA.handle(e); }
};
ACT.mNote = el => { try { A().meetingAction(el.dataset.id, 'note', { text: document.getElementById('mm-note').value }); VA.toast('Nota privada guardada.', 'ok'); } catch (e) { VA.handle(e); } };
ACT.mTask = el => { try { A().addTask({ title: 'Seguimiento de la reunión del ' + fd(A().meetings().find(x => x.id === el.dataset.id).start), caseId: el.dataset.case, assigneeId: S.me.id, due: VA.dateOnly(VA.now(), 3) }); VA.toast('Tarea de seguimiento creada.', 'ok'); } catch (e) { VA.handle(e); } };

/* ════════ FINANZAS ════════ */
V.finanzas = () => {
  const a = A(); const per = S.ui.period || 'anio'; const d = a.financeDashboard(per);
  return `${VA.pageH('Resumen financiero', 'Cobros, facturación y presupuestos', `<div class="seg" role="group" aria-label="Período">${[['mes', 'Este mes'], ['trimestre', '90 días'], ['anio', 'Este año'], ['todo', 'Todo']].map(([v, l]) => `<button data-act="period" data-v="${v}" aria-pressed="${per === v}">${l}</button>`).join('')}</div>`)}
  <div class="figures">
    ${fig(m$(d.collected), 'Ingresos cobrados', 'pagos', '', 1)}${fig(m$(d.pending), 'Ingresos pendientes', 'facturas', '', 1)}${fig(m$(d.issued), 'Facturación emitida (' + d.issuedCount + ')', 'facturas', '', 1)}
    ${fig(d.overdue.length, 'Facturas vencidas', 'facturas', d.overdue.length ? 'alert' : '')}${fig(m$(d.overdueTotal), 'Total adeudado vencido', 'facturas', d.overdueTotal ? 'alert' : '', 1)}
    ${fig(d.quotesSent, 'Presupuestos enviados', 'presupuestos')}${fig(d.quotesAccepted, 'Presupuestos aceptados', 'presupuestos')}${fig(d.acceptance == null ? '—' : d.acceptance + ' %', 'Tasa de aceptación', 'presupuestos')}
  </div>
  ${VA.notice('info', `Comisiones de pasarela del período: <b>${m$(d.fees)}</b> · reintegros: <b>${m$(d.refunds)}</b>. Los importes se calculan sobre pagos confirmados por la pasarela o verificados por la administración.`)}
  <div class="grid2">
    <section class="panel"><div class="panel-h"><h3>Ingresos por abogado</h3></div><div class="panel-b">${VA.bars(d.byLawyer, v => VA.money(v))}</div></section>
    <section class="panel"><div class="panel-h"><h3>Ingresos por tipo de servicio</h3></div><div class="panel-b">${d.byArea.length ? VA.bars(d.byArea, v => VA.money(v)) : VA.empty('chart', 'Sin cobros en el período')}</div></section>
  </div>
  <div class="grid2">
    <section class="panel"><div class="panel-h"><h3>Facturas vencidas</h3></div>${d.overdue.length ? `<ul class="list">${d.overdue.map(i => `<li class="click" data-go="factura.${i.id}" tabindex="0"><div class="grow"><span class="mono">${esc(i.number)}</span> · ${esc(i.clientName)}<div class="xs muted">Venció el ${fd(i.dueAt)} (hace ${-VA.daysUntil(i.dueAt)} días)</div></div><b style="color:var(--bad);font-weight:600" class="nowrap">${m$(i.balance)}</b></li>`).join('')}</ul>` : VA.empty('check', 'Sin facturas vencidas')}</section>
    <section class="panel"><div class="panel-h"><h3>Pagos por verificar</h3></div>${d.pendingVerification.length ? `<ul class="list">${d.pendingVerification.map(p => verifyLi(p)).join('')}</ul>` : VA.empty('check', 'No hay pagos manuales pendientes', 'Las transferencias registradas a mano se confirman acá.')}</section>
  </div>`;
};
const verifyLi = p => `<li><div class="grow">${esc(p.clientName)} · ${esc(p.concept)}<div class="xs muted">${esc(p.method)} · ref. <span class="mono">${esc(p.providerId)}</span> · ${fdt(p.at)}</div></div><b class="nowrap" style="font-weight:600">${m$(p.amountCents)}</b><span class="row" style="gap:6px"><button class="btn sm primary" data-act="verifyPay" data-id="${p.id}" data-ok="1">Confirmar acreditación</button><button class="btn sm danger" data-act="verifyPay" data-id="${p.id}" data-ok="0">No acreditado</button></span></li>`;
ACT.period = el => { S.ui.period = el.dataset.v; VA.refresh(); };
ACT.verifyPay = el => VA.run(() => A().confirmManualPayment(el.dataset.id, el.dataset.ok === '1'), el.dataset.ok === '1' ? 'Pago confirmado. El saldo de la factura se actualizó.' : 'Pago marcado como no acreditado.');

/* ── presupuestos ── */
V.presupuestos = () => {
  if (role() === 'client') return C.pay();
  const a = A(); const f = VA.F('quotes'); const rows = a.quotes(f);
  const canNew = a.can('finanzas.gestionar') || (S.me.lawyerPerms && S.me.lawyerPerms.emitirPresupuestos);
  return `${VA.pageH('Presupuestos', 'Propuestas de honorarios para nuevos casos', canNew ? `<button class="btn primary" data-act="newQuote">${icon('plus')}Nuevo presupuesto</button>` : '')}
  <div class="row"><select class="in" style="width:auto" data-change="quoteF" aria-label="Estado">${VA.opts(VA.QUOTE_STATES, f.status, 'Todos los estados')}</select></div>
  <div class="panel">${VA.table('quotes', [
    { k: 'number', l: 'Presupuesto', lead: true, fn: q => `<span class="mono">${esc(q.number)}</span> <span class="xs muted">v${q.version}</span><div style="font-weight:500">${esc(q.service)}</div>` },
    { k: 'recipientName', l: 'Destinatario', fn: q => esc(q.recipientName) + (q.clientId ? '' : '<div class="xs muted">Contacto del CRM</div>') },
    { k: 'lawyerName', l: 'Abogado' }, { k: 'total', l: 'Total', cls: 'num', fn: q => m$(q.total) },
    { k: 'validUntil', l: 'Vigencia', fn: q => fd(q.validUntil) }, { k: 'status', l: 'Estado', fn: q => VA.pill(q.status) + (q.convertedAt ? '<div class="xs muted">Convertido</div>' : '') }
  ], rows, { go: q => 'presupuesto.' + q.id, empty: VA.empty('file', 'No hay presupuestos', 'Creá uno desde un expediente, desde el CRM o con el botón «Nuevo presupuesto».') })}</div>`;
};
CHG.quoteF = el => { VA.filter('quotes', { status: el.value }); VA.refresh(); };
ACT.newQuote = el => { S.ui.qdraft = { caseId: el.dataset.case || '', contactId: el.dataset.contact || '' }; VA.go('presupuesto-editar.nuevo'); };

VA.quoteDoc = (q, firm, opts) => {
  opts = opts || {};
  const rows = q.items.map(i => `<tr><td>${esc(i.desc)}<div class="muted" style="font-size:12px">${i.kind === 'gastos' ? 'Gastos estimados' : 'Honorarios profesionales'}</div></td><td class="num">${m$(i.amountCents)}</td></tr>`).join('');
  return `<article class="doc" aria-label="Documento del presupuesto">
  <div class="dh"><div style="display:flex;gap:14px;align-items:center;color:#14263D">${VA.mark(48, { color: '#14263D', mono: true })}<div><div style="font-family:var(--f-display);letter-spacing:.24em;font-size:18px">VILLAFAÑE</div><div style="font-size:9.5px;letter-spacing:.42em;color:#687386;margin-top:4px">&amp; ASOCIADOS</div></div></div>
  <div style="text-align:right;font-size:12.5px" class="muted">${esc(firm.address)}<br>${esc(firm.phone)} · ${esc(firm.email)}</div></div>
  <div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;margin:28px 0 20px"><div><div class="muted" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase">Propuesta de honorarios</div><h2 style="margin-top:6px">${esc(q.service)}</h2></div>
  <div style="font-size:13px;text-align:right"><div style="font-family:var(--f-mono)">${esc(q.number)} · versión ${q.version}</div><div class="muted">Emisión: ${q.issuedAt ? fd(q.issuedAt) : 'borrador'}</div><div class="muted">Válido hasta: ${fd(q.validUntil)}</div></div></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;font-size:13.5px;margin-bottom:20px"><div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Para</div><b style="font-weight:600">${esc(q.recipientName)}</b><br><span class="muted">${esc(q.recipientEmail || '')}</span>${q.caseNumber ? `<br><span class="muted">Expediente ${esc(q.caseNumber)}</span>` : ''}</div><div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Profesional responsable</div><b style="font-weight:600">${esc(q.lawyerName)}</b></div></div>
  <div style="font-size:13.5px"><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px">Alcance del trabajo</div><p style="white-space:pre-wrap">${esc(q.scope)}</p></div>
  <table style="margin-top:20px"><thead><tr><th>Concepto</th><th class="num">Importe</th></tr></thead><tbody>${rows}</tbody></table>
  <table style="margin-top:4px"><tbody>
  <tr class="tot"><td class="muted">Honorarios</td><td class="num">${m$(q.fees)}</td></tr>
  <tr class="tot"><td class="muted">Gastos estimados</td><td class="num">${m$(q.expenses)}</td></tr>
  ${q.taxRate ? `<tr class="tot"><td class="muted">IVA ${(q.taxRate / 100).toString().replace('.', ',')} % sobre honorarios</td><td class="num">${m$(q.tax)}</td></tr>` : ''}
  <tr class="tot grand"><td>Total</td><td class="num">${m$(q.total)}</td></tr></tbody></table>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:22px;font-size:13.5px">
  <div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Forma de pago</div>${esc(q.paymentMethod)}</div>
  <div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Anticipo</div>${q.advancePct} % · ${m$(q.advance)}</div>
  <div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Saldo</div>${q.installments ? q.installments + ' cuotas de ' + m$(q.installmentCents) : 'Contra entrega'}</div></div>
  ${q.conditions ? `<div style="font-size:12.5px;margin-top:22px"><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px">Condiciones</div><p style="white-space:pre-wrap;color:#3A4A60">${esc(q.conditions)}</p></div>` : ''}
  <div class="sign">${q.acceptance ? `<span class="stamp">Aceptado</span><p style="font-size:12.5px;margin-top:10px">Aceptación digital registrada el ${fdt(q.acceptance.at)} por ${esc(q.acceptance.userName || '')}${q.acceptance.onBehalf ? ' (registrada por el estudio)' : ' desde el portal'} · versión ${q.acceptance.version}<br><span style="font-family:var(--f-mono);font-size:11px;color:#687386">Huella del documento: ${esc(String(q.acceptance.checksum).slice(0, 32))}</span></p>` : q.rejection ? `<span class="stamp" style="border-color:#9B2F2F;color:#9B2F2F">Rechazado</span><p style="font-size:12.5px;margin-top:10px">${fdt(q.rejection.at)}${q.rejection.reason ? ' · ' + esc(q.rejection.reason) : ''}</p>` : `<b style="font-weight:600;font-size:13px">Espacio para la aceptación</b><p style="font-size:12.5px;color:#687386;margin-top:4px">La aceptación desde el portal registra fecha, usuario y versión del documento.</p>`}
  <p style="font-size:11px;color:#687386;margin-top:10px">Este registro de aceptación no constituye una firma electrónica o digital con validez legal.</p></div>
  </article>`;
};
V.presupuesto = id => {
  if (role() === 'client') return C.quote(id);
  const a = A(); const q = a.quote(id); const firm = VA.server.pub.firm();
  const fin = a.can('finanzas.gestionar'); const staffOk = fin || (role() === 'lawyer' && q.lawyerId === S.me.lawyerId && S.me.lawyerPerms.emitirPresupuestos);
  const acts = [];
  if (staffOk) {
    if (q.status === 'Borrador') acts.push(`<button class="btn" data-go="presupuesto-editar.${q.id}">${icon('edit')}Editar borrador</button>`, `<button class="btn primary" data-act="qAct" data-a="issue" data-id="${q.id}">Emitir presupuesto</button>`);
    if (q.status === 'Emitido') acts.push(`<button class="btn primary" data-act="qAct" data-a="send" data-id="${q.id}">${icon('send')}Enviar al cliente</button>`);
    if (q.status === 'Enviado') acts.push(`<button class="btn" data-act="qAccept" data-id="${q.id}" data-v="${q.version}">Registrar aceptación</button>`, `<button class="btn danger" data-act="qReject" data-id="${q.id}">Registrar rechazo</button>`);
    if (['Emitido', 'Enviado', 'Rechazado', 'Vencido'].includes(q.status)) acts.push(`<button class="btn" data-act="qAct" data-a="newVersion" data-id="${q.id}">Nueva versión</button>`);
    if (q.status === 'Aceptado' && !q.convertedAt && fin) acts.push(`<button class="btn gold" data-act="qConvert" data-id="${q.id}">Convertir en acuerdo</button>`);
  }
  return `${VA.pageH(`<span class="mono" style="font-size:14px;color:var(--muted);display:block;margin-bottom:6px;font-family:var(--f-mono)">${esc(q.number)} · v${q.version}</span>${esc(q.service)}`, `Para ${esc(q.recipientName)} · ${VA.pill(q.status)}${q.convertedAt ? ' · convertido en acuerdo' : ''}`, acts.join(''), ['presupuestos', 'Presupuestos'])}
  ${q.status === 'Aceptado' && !q.convertedAt ? VA.notice('info', 'Aceptado. Al convertirlo en acuerdo, el expediente pasa a Activo, se registran los honorarios y se emite la factura de anticipo.', 'gold') : ''}
  <div class="split"><div>${VA.quoteDoc(q, firm)}</div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Resumen</h3></div><div class="panel-b">${VA.kv([['Total', '<b>' + m$(q.total) + '</b>'], ['Anticipo', q.advancePct + ' % · ' + m$(q.advance)], ['Cuotas', q.installments ? q.installments + ' × ' + m$(q.installmentCents) : '—'], ['Vigencia', fd(q.validUntil)], ['Expediente', q.caseId ? `<button class="link" data-go="expediente.${q.caseId}">${esc(q.caseNumber)}</button>` : '—'], ['Contacto CRM', q.contactId && a.can('crm.gestionar') ? `<button class="link" data-go="crm.${q.contactId}">Ver ficha</button>` : '—']])}</div></section>
    <section class="panel"><div class="panel-h"><h3>Exportar</h3></div><div class="panel-b stack small"><p class="muted">La generación de PDF se activa al configurar el servicio de documentos en el servidor.</p><button class="btn" disabled title="Pendiente de configurar">${icon('download')}Descargar PDF</button></div></section>
    ${q.notes ? `<section class="panel" style="background:var(--hatch),var(--paper)"><div class="panel-h"><h3>Notas internas</h3><span class="vis int">${icon('lock')}Interno</span></div><div class="panel-b"><p>${esc(q.notes)}</p></div></section>` : ''}
    <section class="panel"><div class="panel-h"><h3>Historial</h3></div><ol class="tl panel-b">${(q.history || []).slice().reverse().map(h => `<li class="sistema" style="padding:2px 0">${fdt(h.at)} · <b style="font-weight:600">${esc(h.action)}</b> · ${esc(h.byName)}</li>`).join('') || '<li class="sistema">Sin movimientos</li>'}</ol></section>
  </div></div>`;
};
ACT.qAct = el => { const msgs = { issue: 'Presupuesto emitido. Ya no se puede editar esta versión.', send: 'Presupuesto enviado. El cliente lo ve en su portal.', newVersion: 'Se creó una nueva versión en borrador.' }; VA.run(() => A().quoteAction(el.dataset.id, el.dataset.a), msgs[el.dataset.a]); };
ACT.qAccept = el => VA.confirm({ title: 'Registrar aceptación', text: 'Usá esta opción solo si el cliente aceptó por otro medio (por ejemplo, en una reunión). Queda registrado que la aceptación la cargó el estudio.', label: 'Registrar aceptación' }, () => VA.run(() => A().quoteAction(el.dataset.id, 'accept', { version: +el.dataset.v }), 'Aceptación registrada. El CRM se actualizó.'));
ACT.qReject = el => VA.openModal({ title: 'Registrar rechazo', form: 'qReject', body: `<input type="hidden" name="id" value="${el.dataset.id}"><label class="field"><span>Motivo (opcional)</span><textarea class="in" name="reason"></textarea></label>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn danger">Registrar rechazo</button>` });
FORM.qReject = d => { S.modal = null; VA.run(() => A().quoteAction(d.id, 'reject', { reason: d.reason }), 'Rechazo registrado.'); };
ACT.qConvert = el => VA.confirm({ title: 'Convertir en acuerdo', text: 'El expediente pasa a Activo con los honorarios del presupuesto, se emite la factura de anticipo y el contacto queda como cliente incorporado.', label: 'Convertir' }, () => { try { const r = A().quoteAction(el.dataset.id, 'convert'); VA.toast('Acuerdo registrado' + (r.invoiceId ? ' y factura de anticipo emitida.' : '.'), 'ok'); VA.go('expediente.' + r.caseId); } catch (e) { VA.handle(e); } });

/* editor de presupuesto */
V['presupuesto-editar'] = id => {
  const a = A(); const fin = a.can('finanzas.gestionar');
  if (!fin && !(S.me.lawyerPerms && S.me.lawyerPerms.emitirPresupuestos)) throw new VA.ApiError('FORBIDDEN', 'No tenés permiso para preparar presupuestos.');
  let q = null; if (id && id !== 'nuevo') { q = a.quote(id); if (q.status !== 'Borrador') return VA.notice('info', 'Solo se edita un borrador. <button class="link" data-go="presupuesto.' + q.id + '">Volver al presupuesto</button>'); }
  const dr = S.ui.qdraft || {};
  const cases = a.cases().filter(c => !['Cerrado', 'Archivado'].includes(c.status));
  const contacts = fin && a.can('crm.gestionar') ? a.contacts().filter(c => !c.clientId) : [];
  const lawyers = a.lawyers().filter(l => l.active);
  const preCase = q ? q.caseId : dr.caseId; const preContact = q ? (q.caseId ? '' : q.contactId) : dr.contactId;
  const preCaseObj = preCase ? cases.find(c => c.id === preCase) : null;
  const items = q ? q.items : [{ kind: 'honorarios', desc: 'Honorarios profesionales', amountCents: 0 }, { kind: 'gastos', desc: 'Gastos estimados', amountCents: 0 }];
  const target = preContact ? 'contact:' + preContact : preCase ? 'case:' + preCase : '';
  return `${VA.pageH(q ? 'Editar ' + esc(q.number) : 'Nuevo presupuesto', 'Se guarda como borrador. Emitilo cuando esté listo para enviar.', '', [q ? 'presupuesto.' + q.id : 'presupuestos', q ? 'Volver al presupuesto' : 'Presupuestos'])}
  <form data-form="quote" data-id="${q ? q.id : ''}" class="split" novalidate data-input="quoteCalc">
    <div class="stack lg">
      <section class="panel"><div class="panel-h"><h3>Destinatario</h3></div><div class="panel-b form-grid">
        <label class="field full"><span>Cliente / expediente o contacto del CRM</span><select class="in" name="target" required>${'<option value="">Elegí</option>'}<optgroup label="Expedientes">${cases.map(c => `<option value="case:${c.id}"${target === 'case:' + c.id ? ' selected' : ''}>${esc(c.number + ' · ' + c.clientName + ' · ' + c.title)}</option>`).join('')}</optgroup>${contacts.length ? `<optgroup label="Contactos potenciales (CRM)">${contacts.map(c => `<option value="contact:${c.id}"${target === 'contact:' + c.id ? ' selected' : ''}>${esc(c.name + ' · ' + c.area)}</option>`).join('')}</optgroup>` : ''}</select></label>
        ${role() === 'admin' ? `<label class="field"><span>Abogado responsable</span><select class="in" name="lawyerId" required>${VA.opts(lawyers.map(l => ({ v: l.id, l: l.name })), q ? q.lawyerId : preCaseObj ? preCaseObj.lawyerId : '', 'Elegí')}</select></label>` : ''}
        <label class="field"><span>Vigencia de la propuesta</span><input class="in" type="date" name="validUntil" value="${q ? q.validUntil : VA.dateOnly(VA.now(), 15)}" min="${today()}" required></label>
      </div></section>
      <section class="panel"><div class="panel-h"><h3>Servicio</h3></div><div class="panel-b form-grid">
        <label class="field full"><span>Descripción del servicio</span><input class="in" name="service" value="${esc(q ? q.service : preCaseObj ? preCaseObj.title : '')}" required></label>
        <label class="field full"><span>Alcance del trabajo</span><textarea class="in" name="scope" required>${esc(q ? q.scope : '')}</textarea></label>
      </div></section>
      <section class="panel"><div class="panel-h"><h3>Importes</h3><button type="button" class="btn sm" data-act="qItemAdd">${icon('plus')}Agregar concepto</button></div><div class="panel-b stack" id="q-items">${items.map(qItemRow).join('')}</div></section>
      <section class="panel"><div class="panel-h"><h3>Pago y condiciones</h3></div><div class="panel-b form-grid">
        <label class="field"><span>Impuestos</span><select class="in" name="taxRate">${VA.opts([{ v: 0, l: 'Sin impuestos' }, { v: 1050, l: 'IVA 10,5 % sobre honorarios' }, { v: 2100, l: 'IVA 21 % sobre honorarios' }], q ? q.taxRate : 0)}</select></label>
        <label class="field"><span>Forma de pago</span><input class="in" name="paymentMethod" value="${esc(q ? q.paymentMethod : 'Transferencia bancaria o tarjeta')}"></label>
        <label class="field"><span>Anticipo (%)</span><input class="in" type="number" min="0" max="100" name="advancePct" value="${q ? q.advancePct : 40}"></label>
        <label class="field"><span>Cuotas del saldo</span><input class="in" type="number" min="0" max="24" name="installments" value="${q ? q.installments : 3}"></label>
        <label class="field full"><span>Condiciones</span><textarea class="in" name="conditions">${esc(q ? q.conditions : 'Los honorarios no incluyen tasas judiciales ni gastos de peritos oficiales. Los gastos se rinden con comprobante. La propuesta puede ajustarse si cambia el alcance del trabajo.')}</textarea></label>
        <label class="field full"><span>Notas internas <span class="hint">· no se muestran al cliente</span></span><textarea class="in" name="notes" style="min-height:64px;background:var(--hatch),var(--paper)">${esc(q ? q.notes || '' : '')}</textarea></label>
      </div></section>
    </div>
    <div class="stack lg" style="position:sticky;top:76px">
      <section class="panel"><div class="panel-h"><h3>Totales</h3></div><div class="panel-b" id="q-totals"></div></section>
      <div id="q-err" class="err" role="alert"></div>
      <div class="row"><button class="btn primary" type="submit">Guardar borrador</button><button type="button" class="btn" data-go="${q ? 'presupuesto.' + q.id : 'presupuestos'}">Cancelar</button></div>
    </div>
  </form>`;
};
const qItemRow = i => `<div class="row q-item" style="flex-wrap:nowrap;align-items:flex-end"><label class="field" style="width:150px;flex:none"><span>Tipo</span><select class="in" name="kind">${VA.opts([{ v: 'honorarios', l: 'Honorarios' }, { v: 'gastos', l: 'Gastos' }], i.kind)}</select></label><label class="field grow"><span>Concepto</span><input class="in" name="desc" value="${esc(i.desc)}"></label><label class="field" style="width:140px;flex:none"><span>Importe USD</span><input class="in" name="amount" inputmode="decimal" value="${i.amountCents ? VA.centsInput(i.amountCents) : ''}" placeholder="0,00" style="text-align:right"></label><button type="button" class="btn ghost icon" data-act="qItemDel" aria-label="Quitar concepto">${icon('trash')}</button></div>`;
VA.after && 0;
ACT.qItemAdd = () => { const box = document.getElementById('q-items'); box.insertAdjacentHTML('beforeend', qItemRow({ kind: 'honorarios', desc: '', amountCents: 0 })); box.lastElementChild.querySelector('input[name=desc]').focus(); qCalc(); };
ACT.qItemDel = el => { const rows = document.querySelectorAll('.q-item'); if (rows.length <= 1) { VA.toast('El presupuesto necesita al menos un concepto.', 'bad'); return; } el.closest('.q-item').remove(); qCalc(); };
function qCalc() {
  const form = document.querySelector('form[data-form="quote"]'); if (!form) return;
  let fees = 0, exp = 0, bad = false;
  form.querySelectorAll('.q-item').forEach(r => { const v = r.querySelector('[name=amount]').value; const c = v ? VA.parseMoney(v) : 0; r.querySelector('[name=amount]').setAttribute('aria-invalid', isNaN(c) ? 'true' : 'false'); if (isNaN(c)) { bad = true; return; } if (r.querySelector('[name=kind]').value === 'gastos') exp += c; else fees += c; });
  const tax = Math.round(fees * (+form.taxRate.value) / 10000); const total = fees + exp + tax; const adv = Math.round(total * (+form.advancePct.value || 0) / 100); const n = +form.installments.value || 0;
  document.getElementById('q-totals').innerHTML = VA.kv([['Honorarios', m$(fees)], ['Gastos', m$(exp)], ['Impuestos', m$(tax)], ['Total', '<b class="serif" style="font-size:22px;font-weight:500">' + m$(total) + '</b>'], ['Anticipo', m$(adv)], ['Cuotas', n ? n + ' × ' + m$(Math.floor((total - adv) / n)) : '—']]) + (bad ? '<p class="err" style="margin-top:8px">Hay un importe con formato inválido. Usá, por ejemplo, 1.500,00.</p>' : '');
}
INP.quoteCalc = () => qCalc();
CHG.qcalc = () => qCalc();
document.addEventListener('change', e => { if (e.target.closest('form[data-form="quote"]')) qCalc(); });
const _render = VA.render; VA.render = function () { _render(); if (document.querySelector('form[data-form="quote"]')) qCalc(); };
FORM.quote = (d, form) => {
  const err = form.querySelector('#q-err'); const arr = v => [].concat(v == null ? [] : v);
  const kinds = arr(d.kind), descs = arr(d.desc), amts = arr(d.amount);
  const items = descs.map((desc, i) => ({ kind: kinds[i], desc, amountCents: amts[i] ? VA.parseMoney(amts[i]) : NaN })).filter(x => String(x.desc).trim() || !isNaN(x.amountCents));
  if (items.some(x => isNaN(x.amountCents))) { err.textContent = 'Revisá los importes: cada concepto necesita un importe (ejemplo: 1.500,00).'; return; }
  const [tk, tid] = String(d.target || '').split(':');
  const payload = { caseId: tk === 'case' ? tid : null, contactId: tk === 'contact' ? tid : null, lawyerId: d.lawyerId, service: d.service, scope: d.scope, items, taxRate: d.taxRate, paymentMethod: d.paymentMethod, advancePct: d.advancePct, installments: d.installments, validUntil: d.validUntil, conditions: d.conditions, notes: d.notes };
  try { const id = A().saveQuote(form.dataset.id || null, payload); S.ui.qdraft = null; VA.toast('Borrador guardado.', 'ok'); VA.go('presupuesto.' + id); } catch (e) { if (e.code === 'SESSION') return VA.handle(e); err.textContent = e.message; }
};

/* ── facturas ── */
V.facturas = () => {
  if (role() === 'client') return C.pay();
  const a = A(); const f = VA.F('inv'); const rows = a.invoices(f); const fin = a.can('finanzas.gestionar');
  return `${VA.pageH('Facturas', 'Comprobantes internos de gestión', fin ? `<button class="btn primary" data-act="newInvoice">${icon('plus')}Nueva factura</button>` : '')}
  ${VA.notice('alert', '<b>Comprobantes internos.</b> No son facturas fiscales válidas. La emisión de factura electrónica requiere la integración con ARCA (ex AFIP), pendiente de configurar.', 'gold')}
  <div class="row"><select class="in" style="width:auto" data-change="invF" aria-label="Estado">${VA.opts(VA.INVOICE_STATES, f.status, 'Todos los estados')}</select></div>
  <div class="panel">${VA.table('inv', [
    { k: 'number', l: 'Factura', lead: true, fn: i => `<span class="mono">${esc(i.number)}</span><div class="xs muted">${esc(i.concept)}</div>` },
    { k: 'clientName', l: 'Cliente' }, { k: 'caseNumber', l: 'Expediente', fn: i => `<span class="mono xs">${esc(i.caseNumber)}</span>` },
    { k: 'issuedAt', l: 'Emisión', fn: i => fd(i.issuedAt) }, { k: 'dueAt', l: 'Vencimiento', fn: i => fd(i.dueAt) },
    { k: 'total', l: 'Importe', cls: 'num', fn: i => m$(i.total) }, { k: 'paid', l: 'Pagado', cls: 'num', fn: i => m$(i.paid) },
    { k: 'balance', l: 'Saldo', cls: 'num', fn: i => i.balance ? `<b style="font-weight:600;${i.status === 'Vencida' ? 'color:var(--bad)' : ''}">${m$(i.balance)}</b>` : m$(0) },
    { k: 'status', l: 'Estado', fn: i => VA.pill(i.status) }
  ], rows, { go: i => 'factura.' + i.id, defaultSort: { k: 'number', dir: 'desc' } })}</div>`;
};
CHG.invF = el => { VA.filter('inv', { status: el.value }); VA.refresh(); };
ACT.newInvoice = el => { const cases = A().cases(); VA.openModal({ title: 'Nueva factura', form: 'newInvoice', body: `<label class="field"><span>Expediente</span><select class="in" name="caseId" required>${VA.opts(cases.map(c => ({ v: c.id, l: c.number + ' · ' + c.clientName })), el.dataset.case || '', 'Elegí')}</select></label><label class="field"><span>Concepto</span><input class="in" name="concept" required placeholder="Ej.: Cuota 2 de 3"></label><div class="form-grid"><label class="field"><span>Detalle</span><input class="in" name="desc" required></label><label class="field"><span>Importe USD</span><input class="in" name="amount" inputmode="decimal" placeholder="0,00" required></label><label class="field"><span>Vencimiento</span><input class="in" type="date" name="dueAt" value="${VA.dateOnly(VA.now(), 10)}" required></label></div><label class="check"><input type="checkbox" name="issue" checked> <span>Emitir ahora y avisar al cliente</span></label><div id="ni-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Crear factura</button>` }); };
FORM.newInvoice = (d, form) => { const c = VA.parseMoney(d.amount); if (isNaN(c)) { form.querySelector('#ni-err').textContent = 'Revisá el importe (ejemplo: 1.200,00).'; return; } try { const id = A().createInvoice({ caseId: d.caseId, concept: d.concept, items: [{ desc: d.desc, amountCents: c }], dueAt: d.dueAt, issue: d.issue === 'on' }); S.modal = null; VA.toast('Factura creada.', 'ok'); VA.go('factura.' + id); } catch (e) { form.querySelector('#ni-err').textContent = e.message; } };
VA.invoiceDoc = (i, firm) => `<article class="doc"><div class="dh"><div style="display:flex;gap:14px;align-items:center">${VA.mark(44, { color: '#14263D', mono: true })}<div><div style="font-family:var(--f-display);letter-spacing:.24em;font-size:17px">VILLAFAÑE</div><div style="font-size:9.5px;letter-spacing:.42em;color:#687386;margin-top:4px">&amp; ASOCIADOS</div></div></div><div style="text-align:right"><div class="wm">Comprobante interno · no válido como factura fiscal</div><div style="font-family:var(--f-mono);margin-top:6px">${esc(i.number)}</div><div class="muted" style="font-size:12.5px">Emisión ${i.issuedAt ? fd(i.issuedAt) : '— (borrador)'} · Vence ${fd(i.dueAt)}</div></div></div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:22px 0;font-size:13.5px"><div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Cliente</div><b style="font-weight:600">${esc(i.clientName)}</b></div><div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Expediente</div>${esc(i.caseNumber)}</div><div><div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Concepto</div>${esc(i.concept)}</div></div>
<table><thead><tr><th>Detalle</th><th class="num">Importe</th></tr></thead><tbody>${i.items.map(x => `<tr><td>${esc(x.desc)}</td><td class="num">${m$(x.amountCents)}</td></tr>`).join('')}</tbody></table>
<table><tbody><tr class="tot"><td class="muted">Total</td><td class="num">${m$(i.total)}</td></tr><tr class="tot"><td class="muted">Pagos aplicados</td><td class="num">− ${m$(i.paid)}</td></tr><tr class="tot grand"><td>Saldo pendiente</td><td class="num">${m$(i.balance)}</td></tr></tbody></table>
<p class="muted" style="font-size:11.5px;margin-top:18px">${esc(firm.name)} · ${esc(firm.address)} · ${esc(firm.email)}</p></article>`;
V.factura = id => {
  if (role() === 'client') return C.invoice(id);
  const a = A(); const i = a.invoice(id); const fin = a.can('finanzas.gestionar'); const firm = VA.server.pub.firm();
  const acts = fin ? [i.status === 'Borrador' ? `<button class="btn primary" data-act="invAct" data-a="issue" data-id="${i.id}">Emitir</button>` : '', ['Emitida', 'Vencida', 'Parcialmente pagada'].includes(i.status) ? `<button class="btn primary" data-act="manualPay" data-id="${i.id}">Registrar pago</button>` : '', !['Anulada', 'Pagada'].includes(i.status) && i.paid === 0 ? `<button class="btn danger" data-act="invVoid" data-id="${i.id}">Anular</button>` : ''].join('') : '';
  return `${VA.pageH(`<span class="mono">${esc(i.number)}</span>`, `${esc(i.clientName)} · ${VA.pill(i.status)}`, acts, ['facturas', 'Facturas'])}
  <div class="split"><div>${VA.invoiceDoc(i, firm)}</div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Pagos aplicados</h3></div>${paymentsTable(i.payments.map(p => Object.assign({}, p, { clientName: i.clientName })), 'ipay:' + i.id, true)}</section>
    <section class="panel"><div class="panel-h"><h3>Relaciones</h3></div><div class="panel-b">${VA.kv([['Expediente', `<button class="link" data-go="expediente.${i.caseId}">${esc(i.caseNumber)}</button>`], ['Presupuesto de origen', i.quoteId ? `<button class="link" data-go="presupuesto.${i.quoteId}">Ver presupuesto</button>` : '—'], ['En proceso', i.pendingCents ? m$(i.pendingCents) + ' sin confirmar' : '—']])}</div></section>
  </div></div>`;
};
ACT.invAct = el => VA.run(() => A().invoiceAction(el.dataset.id, el.dataset.a), 'Factura emitida. El cliente recibió el aviso.');
ACT.invVoid = el => VA.confirm({ title: 'Anular factura', text: 'La factura queda anulada y deja de sumar al saldo del cliente. Esta acción no se puede deshacer.', label: 'Anular factura', danger: true }, () => VA.run(() => A().invoiceAction(el.dataset.id, 'void'), 'Factura anulada.'));
ACT.manualPay = el => { const i = A().invoice(el.dataset.id); VA.openModal({ title: 'Registrar pago recibido', form: 'manualPay', body: `<input type="hidden" name="id" value="${i.id}">${VA.notice('shield', 'El pago queda <b>pendiente de verificación</b> y no modifica el saldo hasta que otro administrador con permiso financiero confirme la acreditación.')}<div class="form-grid"><label class="field"><span>Importe USD</span><input class="in" name="amount" inputmode="decimal" value="${VA.centsInput(i.balance - i.pendingCents)}" required></label><label class="field"><span>Método</span><select class="in" name="method">${VA.opts(['Transferencia', 'Depósito', 'Efectivo', 'Cheque'])}</select></label><label class="field full"><span>Referencia de la operación</span><input class="in" name="reference" placeholder="N° de transferencia o recibo"></label></div><div id="mp-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Registrar</button>` }); };
FORM.manualPay = (d, form) => { const c = VA.parseMoney(d.amount); if (isNaN(c)) { form.querySelector('#mp-err').textContent = 'Revisá el importe.'; return; } try { A().registerManualPayment({ invoiceId: d.id, amountCents: c, method: d.method, reference: d.reference }); S.modal = null; VA.toast('Pago registrado. Queda pendiente de verificación.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#mp-err').textContent = e.message; } };

function paymentsTable(rows, id, compact) {
  return VA.table(id, [
    { k: 'at', l: 'Fecha', lead: true, fn: p => `<b style="font-weight:500">${fd(p.at)}</b><div class="xs muted">${esc(p.concept)}</div>` },
    compact ? null : { k: 'clientName', l: 'Cliente' },
    compact ? null : { k: 'caseNumber', l: 'Expediente', fn: p => `<span class="mono xs">${esc(p.caseNumber || '—')}</span>` },
    { k: 'method', l: 'Método', fn: p => esc(p.method) + (p.last4 ? ` <span class="xs muted">•••• ${esc(p.last4)}</span>` : '') },
    compact ? null : { k: 'providerId', l: 'ID proveedor', fn: p => `<span class="mono xs">${esc(p.providerId)}</span>` },
    { k: 'amountCents', l: 'Importe', cls: 'num', fn: p => m$(p.amountCents) + (p.refundedCents ? `<div class="xs muted">− ${m$(p.refundedCents)} reint.</div>` : '') },
    compact ? null : { k: 'feeCents', l: 'Comisión', cls: 'num', fn: p => p.feeCents ? m$(p.feeCents) : '—' },
    { k: 'status', l: 'Estado', fn: p => VA.pill(p.status) }
  ].filter(Boolean), rows, { defaultSort: { k: 'at', dir: 'desc' }, empty: VA.empty('wallet', 'Sin pagos registrados') });
}
VA.paymentsTable = paymentsTable;
V.pagos = () => {
  if (role() === 'client') return C.pay();
  const a = A(); if (!a.can('finanzas.gestionar')) throw new VA.ApiError('FORBIDDEN', 'Esta sección requiere el permiso de finanzas.');
  const f = VA.F('pays'); let rows = a.payments({ clientId: f.clientId || undefined, lawyerId: f.lawyerId || undefined });
  if (f.status) rows = rows.filter(p => p.status === f.status);
  const pend = rows.filter(p => p.status === 'Pendiente de verificación');
  return `${VA.pageH('Pagos recibidos', 'Historial por cliente, expediente y abogado')}
  ${VA.notice('card', '<b>Pasarela en modo de prueba.</b> Ningún pago es real. Un pago con tarjeta pasa a «Confirmado» solo cuando la pasarela lo informa (webhook simulado). Los pagos manuales requieren verificación.', 'gold')}
  ${pend.length ? `<section class="panel"><div class="panel-h"><h3>Por verificar</h3></div><ul class="list">${pend.map(p => verifyLi(p)).join('')}</ul></section>` : ''}
  <div class="row"><select class="in" style="width:auto" data-change="payF" data-k="clientId" aria-label="Cliente">${VA.opts(a.clients().map(c => ({ v: c.id, l: c.name })), f.clientId, 'Todos los clientes')}</select><select class="in" style="width:auto" data-change="payF" data-k="lawyerId" aria-label="Abogado">${VA.opts(a.lawyers().map(l => ({ v: l.id, l: l.name })), f.lawyerId, 'Todos los abogados')}</select><select class="in" style="width:auto" data-change="payF" data-k="status" aria-label="Estado">${VA.opts(['Confirmado', 'Procesando', 'Pendiente de verificación', 'Fallido', 'Reembolsado', 'Reembolso parcial'], f.status, 'Todos los estados')}</select></div>
  <div class="panel">${paymentsTable(rows, 'pays')}</div>
  <p class="small muted">Total confirmado en la vista: <b>${m$(rows.reduce((s, p) => s + (['Confirmado', 'Reembolsado', 'Reembolso parcial'].includes(p.status) ? p.amountCents - (p.refundedCents || 0) : 0), 0))}</b> · neto de comisiones: <b>${m$(rows.reduce((s, p) => s + (p.net || 0), 0))}</b></p>`;
};
CHG.payF = el => { VA.filter('pays', { [el.dataset.k]: el.value }); VA.refresh(); };

/* ════════ EQUIPO ════════ */
V.equipo = () => {
  const a = A(); if (role() !== 'admin') throw new VA.ApiError('FORBIDDEN', 'Sección reservada a la administración.');
  const f = VA.F('team'); let ls = a.lawyers();
  if (f.area) ls = ls.filter(l => l.areas.includes(f.area)); if (f.av) ls = ls.filter(l => l.availability === f.av);
  ls.sort((x, y) => f.sort === 'carga' ? x.activeCases - y.activeCases : 0);
  const admins = VA.db.users.filter(u => u.role === 'admin');
  const manage = a.can('equipo.gestionar');
  return `${VA.pageH('Nuestro equipo', 'Perfiles, tarifas, disponibilidad y carga de trabajo', manage ? `<button class="btn primary" data-act="newLawyer">${icon('plus')}Nuevo perfil</button>` : '')}
  <div class="row"><select class="in" style="width:auto" data-change="teamF" data-k="area" aria-label="Especialidad">${VA.opts(VA.AREAS, f.area, 'Todas las especialidades')}</select><select class="in" style="width:auto" data-change="teamF" data-k="av" aria-label="Disponibilidad">${VA.opts(['Disponible', 'Agenda completa', 'Licencia'], f.av, 'Cualquier disponibilidad')}</select><select class="in" style="width:auto" data-change="teamF" data-k="sort" aria-label="Ordenar">${VA.opts([{ v: 'carga', l: 'Menor carga primero' }], f.sort, 'Orden del estudio')}</select></div>
  <div class="grid3" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))">${ls.map(l => `<button class="panel click" data-go="abogado.${l.id}" style="text-align:left;padding:0;overflow:hidden;cursor:pointer;color:inherit;display:flex;flex-direction:column">
    <div style="aspect-ratio:4/3;overflow:hidden;background:var(--sunk);max-width:100%">${l.photo ? `<img src="${esc(l.photo)}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 22%;${l.active ? '' : 'filter:grayscale(1);opacity:.6'}">` : `<div style="height:100%;display:flex;align-items:center;justify-content:center" class="serif">${esc(VA.initials(l.name))}</div>`}</div>
    <div style="padding:16px 18px" class="stack sm"><span class="xs gold" style="letter-spacing:.12em;text-transform:uppercase;font-weight:600">${esc(l.title)}</span><b class="serif" style="font-size:21px;font-weight:500">${esc(l.name)}</b><span class="small muted">${esc(l.specialty)}</span>
    <div class="row" style="gap:8px;margin-top:6px">${VA.pill(l.active ? l.availability : 'Desactivado')}</div>
    <div class="kv small" style="margin-top:8px"><dt>Casos asignados</dt><dd>${l.activeCases} activos · ${l.totalCases} total</dd><dt>Tarifa</dt><dd>${m$(l.rateCents)}/h</dd><dt>Perfil</dt><dd>${l.active ? 'Activo' : 'Desactivado'}</dd></div></div></button>`).join('')}</div>
  <section class="panel"><div class="panel-h"><h3>Administración</h3><span class="small muted">Usuarios administradores, separados de los abogados</span></div><ul class="list">${admins.map(u => `<li>${VA.avatar(u.name)}<div class="grow"><b style="font-weight:500">${esc(u.name)}</b><div class="xs muted">${esc(u.adminScope)} · ${esc(u.email)}</div></div><span class="small muted">${u.perms.length} de ${Object.keys(VA.PERMS).length} permisos</span>${a.can('ajustes.gestionar') ? '<button class="btn sm" data-go="ajustes">Permisos</button>' : ''}</li>`).join('')}</ul></section>`;
};
CHG.teamF = el => { VA.filter('team', { [el.dataset.k]: el.value }); VA.refresh(); };
ACT.newLawyer = () => VA.openModal({ title: 'Nuevo perfil profesional', form: 'newLawyer', body: `<label class="field"><span>Nombre completo</span><input class="in" name="name" required></label><label class="field"><span>Correo institucional</span><input class="in" name="email" type="email" required></label><label class="field"><span>Cargo</span><input class="in" name="title" placeholder="Asociado/a, Socio/a…"></label>${VA.notice('mail', 'Se crea el usuario y se envía una invitación para que defina su contraseña (simulada en la demo). La tarifa inicial es la estándar del estudio.')}<div id="nl-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">Crear perfil</button>` });
FORM.newLawyer = (d, form) => { try { const id = A().saveLawyer(null, d); S.modal = null; VA.toast('Perfil creado. Invitación encolada.', 'ok'); VA.go('abogado.' + id); } catch (e) { form.querySelector('#nl-err').textContent = e.message; } };
V.abogado = id => {
  const a = A(); const l = a.lawyer(id); const self = role() === 'lawyer' && S.me.lawyerId === id;
  if (role() === 'lawyer' && !self) throw new VA.ApiError('FORBIDDEN', 'Solo podés ver tu propio perfil.');
  const manage = a.can('equipo.gestionar'); const rates = a.can('tarifas.gestionar');
  const editable = manage || self;
  const allCases = manage ? a.cases().filter(c => c.lawyerId !== id && !['Cerrado', 'Archivado'].includes(c.status)) : [];
  return `${VA.pageH(esc(l.name), esc(l.title) + ' · ' + esc(l.specialty), manage ? `<button class="btn ${l.active ? 'danger' : 'primary'}" data-act="lawyerActive" data-id="${l.id}" data-v="${l.active ? 0 : 1}">${l.active ? 'Desactivar perfil' : 'Activar perfil'}</button>` : '', self ? null : ['equipo', 'Nuestro equipo'])}
  <div class="split"><form data-form="lawyer" data-id="${l.id}" class="stack lg" novalidate>
    <section class="panel"><div class="panel-h"><h3>Perfil público</h3><span class="small muted">Se muestra en el sitio institucional</span></div><div class="panel-b form-grid">
      ${manage ? `<label class="field"><span>Nombre completo</span><input class="in" name="name" value="${esc(l.name)}"></label>` : ''}
      <label class="field"><span>Cargo</span><input class="in" name="title" value="${esc(l.title)}"${manage ? '' : ' readonly'}></label>
      <label class="field"><span>Especialidad</span><input class="in" name="specialty" value="${esc(l.specialty)}"${editable ? '' : ' readonly'}></label>
      <label class="field"><span>Teléfono</span><input class="in" name="phone" value="${esc(l.phone)}"${editable ? '' : ' readonly'}></label>
      <label class="field"><span>Disponibilidad</span><select class="in" name="availability"${editable ? '' : ' disabled'}>${VA.opts(['Disponible', 'Agenda completa', 'Licencia'], l.availability)}</select></label>
      <label class="field"><span>Idiomas <span class="hint">· separados por coma</span></span><input class="in" name="languages" value="${esc(l.languages.join(', '))}"${editable ? '' : ' readonly'}></label>
      <fieldset class="field full" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:6px">Áreas que atiende</legend><div class="row">${VA.AREAS.map(x => `<label class="check"><input type="checkbox" name="areas" value="${x}"${l.areas.includes(x) ? ' checked' : ''}${manage ? '' : ' disabled'}> ${x}</label>`).join('')}</div></fieldset>
      <label class="field full"><span>Biografía</span><textarea class="in" name="bio"${editable ? '' : ' readonly'}>${esc(l.bio)}</textarea></label>
    </div></section>
    <section class="panel"><div class="panel-h"><h3>Trayectoria</h3>${editable ? '<button type="button" class="btn sm" data-act="expAdd">' + icon('plus') + 'Agregar</button>' : ''}</div><div class="panel-b stack" id="exp-rows">${l.experience.map(expRow).join('') || ''}</div></section>
    <section class="panel"><div class="panel-h"><h3>Honorarios</h3>${rates ? '' : `<span class="vis int">${icon('lock')}Solo administración con permiso de tarifas</span>`}</div><div class="panel-b form-grid"><label class="field"><span>Tarifa por hora (USD)</span><input class="in" name="rate" inputmode="decimal" value="${VA.centsInput(l.rateCents)}"${rates ? '' : ' readonly'}><span class="hint">Tarifa estándar del estudio: ${VA.money(VA.server.pub.standardRate())}/h. Se usa para calcular el costo de cada consulta.</span></label></div></section>
    ${manage ? `<section class="panel"><div class="panel-h"><h3>Permisos del profesional</h3></div><div class="panel-b stack"><label class="check"><input type="checkbox" name="p_fin"${l.perms.verFinanzas ? ' checked' : ''}> <span>Ver facturación y pagos de sus expedientes</span></label><label class="check"><input type="checkbox" name="p_turnos"${l.perms.aprobarTurnos ? ' checked' : ''}> <span>Aprobar o rechazar sus turnos</span></label><label class="check"><input type="checkbox" name="p_quotes"${l.perms.emitirPresupuestos ? ' checked' : ''}> <span>Preparar y emitir presupuestos</span></label></div></section>` : ''}
    ${editable ? '<div class="row"><button class="btn primary" type="submit">Guardar perfil</button><span id="lw-err" class="err" role="alert"></span></div>' : ''}
  </form>
  <div class="stack lg">
    <section class="panel"><div class="panel-b stack" style="align-items:center;text-align:center">${l.photo ? `<img src="${esc(l.photo)}" alt="" style="width:160px;height:200px;object-fit:cover;object-position:50% 20%;border-radius:4px">` : VA.avatar(l.name, null, 'xl')}
      ${editable ? `<label class="btn sm" style="cursor:pointer">${icon('upload')}Cambiar fotografía<input type="file" accept="image/jpeg,image/png,image/webp" class="sr" data-change="lawyerPhoto" data-id="${l.id}"></label>` : ''}<span class="xs muted">${l.user && l.user.lastLogin ? 'Último ingreso ' + VA.rel(l.user.lastLogin) : 'Sin ingresos registrados'}</span></div></section>
    <section class="panel"><div class="panel-h"><h3>Currículum</h3></div><div class="panel-b stack">${l.cv ? `<div class="row">${icon('file')}<div class="grow"><b style="font-weight:500">${esc(l.cv.name)}</b><div class="xs muted">${VA.fsize(l.cv.size)} · cargado ${fd(l.cv.at)}</div></div></div>` : '<p class="small muted">Sin currículum cargado.</p>'}${manage ? `<label class="btn sm" style="cursor:pointer;align-self:flex-start">${icon('upload')}${l.cv ? 'Reemplazar' : 'Cargar'} currículum<input type="file" accept=".pdf,.docx" class="sr" data-change="lawyerCV" data-id="${l.id}"></label>` : ''}</div></section>
    <section class="panel"><div class="panel-h"><h3>Contacto</h3></div><div class="panel-b">${VA.kv([['Correo', esc(l.email)], ['Teléfono', esc(l.phone)], ['En el estudio desde', fd(l.joined)]])}</div></section>
    <section class="panel"><div class="panel-h"><h3>Expedientes asignados</h3><span class="small muted">${l.activeCases} activos</span></div>${l.cases.length ? `<ul class="list tight">${l.cases.map(c => `<li class="click" data-go="expediente.${c.id}"><div class="grow small"><span class="mono xs muted">${esc(c.number)}</span><div>${esc(c.title)}</div></div>${VA.pill(c.status)}</li>`).join('')}</ul>` : VA.empty('folder', 'Sin expedientes')}
    ${manage && allCases.length ? `<div class="panel-b row" style="border-top:1px solid var(--line)"><label class="sr" for="as-case">Asignar expediente</label><select class="in grow" id="as-case">${VA.opts(allCases.map(c => ({ v: c.id, l: c.number + ' · ' + c.lawyerName })), '', 'Asignar un expediente existente…')}</select><button class="btn sm" data-act="assignToLawyer" data-id="${l.id}">Asignar</button></div>` : ''}</section>
  </div></div>`;
};
const expRow = e => `<div class="row exp-row" style="flex-wrap:nowrap;align-items:flex-end"><label class="field" style="width:150px;flex:none"><span>Período</span><input class="in" name="ex_period" value="${esc(e.period)}"></label><label class="field grow"><span>Cargo</span><input class="in" name="ex_role" value="${esc(e.role)}"></label><label class="field grow"><span>Organización</span><input class="in" name="ex_org" value="${esc(e.org)}"></label><button type="button" class="btn ghost icon" data-act="expDel" aria-label="Quitar">${icon('trash')}</button></div>`;
ACT.expAdd = () => document.getElementById('exp-rows').insertAdjacentHTML('beforeend', expRow({ period: '', role: '', org: '' }));
ACT.expDel = el => el.closest('.exp-row').remove();
FORM.lawyer = (d, form) => {
  const arr = v => [].concat(v == null ? [] : v); const a = A();
  const patch = { title: d.title, specialty: d.specialty, phone: d.phone, availability: d.availability, bio: d.bio, languages: String(d.languages || '').split(',').map(x => x.trim()).filter(Boolean) };
  if (d.name !== undefined) patch.name = d.name;
  if (a.can('equipo.gestionar')) { patch.areas = arr(d.areas); patch.perms = { verFinanzas: d.p_fin === 'on', aprobarTurnos: d.p_turnos === 'on', emitirPresupuestos: d.p_quotes === 'on' }; }
  const pr = arr(d.ex_period), ro = arr(d.ex_role), og = arr(d.ex_org); patch.experience = ro.map((r, i) => ({ period: pr[i], role: r, org: og[i] }));
  if (a.can('tarifas.gestionar')) { const r = VA.parseMoney(d.rate); if (isNaN(r)) { form.querySelector('#lw-err').textContent = 'Revisá la tarifa (ejemplo: 150,00).'; return; } patch.rateCents = r; }
  try { a.saveLawyer(form.dataset.id, patch); if (S.me.lawyerId === form.dataset.id) S.me = Object.assign(S.me, a.me()); VA.toast('Perfil guardado.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#lw-err').textContent = e.message; }
};
CHG.lawyerPhoto = el => { const f = el.files[0]; if (!f) return; if (f.size > 8 * 1048576) { VA.toast('La imagen supera 8 MB.', 'bad'); return; } VA.readImage(f, 640).then(url => VA.run(() => { A().saveLawyer(el.dataset.id, { photo: url }); if (S.me.lawyerId === el.dataset.id) S.me.photo = url; }, 'Fotografía actualizada.')).catch(VA.handle); };
CHG.lawyerCV = el => { const f = VA.fileMeta(el); if (!f) return; VA.run(() => A().uploadCV(el.dataset.id, f), 'Currículum cargado.'); };
ACT.lawyerActive = el => { const on = el.dataset.v === '1'; VA.confirm({ title: on ? 'Activar perfil' : 'Desactivar perfil', text: on ? 'El profesional vuelve a poder ingresar y a figurar en el sitio.' : 'El profesional no podrá ingresar, se cierran sus sesiones y deja de figurar en el sitio y en la reserva de turnos. Sus expedientes no se reasignan automáticamente.', label: on ? 'Activar' : 'Desactivar', danger: !on }, () => VA.run(() => A().saveLawyer(el.dataset.id, { active: on }), on ? 'Perfil activado.' : 'Perfil desactivado.')); };
ACT.assignToLawyer = el => { const c = document.getElementById('as-case').value; if (!c) { VA.toast('Elegí un expediente.', 'bad'); return; } VA.run(() => A().assignCase(c, el.dataset.id), 'Expediente asignado.'); };

/* ════════ CLIENTES ════════ */
V.clientes = () => {
  const a = A(); const rows = a.clients();
  return `${VA.pageH(role() === 'lawyer' ? 'Mis clientes' : 'Clientes', rows.length + ' clientes')}
  <div class="panel">${VA.table('clients', [
    { k: 'name', l: 'Cliente', lead: true, fn: c => `<span class="row" style="gap:10px;flex-wrap:nowrap">${VA.avatar(c.name)}<span><b style="font-weight:500">${esc(c.name)}</b><span class="xs muted" style="display:block">${esc(c.email)}</span></span></span>` },
    { k: 'activeCases', l: 'Asuntos', fn: c => c.activeCases + ' activos · ' + c.cases + ' total' },
    { k: 'verification', l: 'Identidad', fn: c => VA.pill(c.verification) },
    { k: 'balance', l: 'Saldo', cls: 'num', fn: c => c.balance == null ? '—' : c.balance ? `<b style="font-weight:600">${m$(c.balance)}</b>` : m$(0) },
    { k: 'userActive', l: 'Portal', fn: c => c.invited ? VA.pill('Pendiente', 'Invitación enviada') : VA.pill('Activo', 'Activo') }
  ], rows, { go: c => 'cliente.' + c.id })}</div>`;
};
V.cliente = id => {
  const a = A(); const c = a.client(id); const canId = a.can('clientes.identidad');
  return `${VA.pageH(esc(c.name), 'Cliente desde ' + fd(c.createdAt), (a.can('expedientes.gestionar') ? `<button class="btn" data-act="newCase" data-client="${c.id}">${icon('plus')}Nuevo expediente</button>` : ''), ['clientes', role() === 'lawyer' ? 'Mis clientes' : 'Clientes'])}
  <div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Expedientes</h3></div>${c.cases.length ? `<ul class="list">${c.cases.map(k => `<li class="click" data-go="expediente.${k.id}" tabindex="0"><div class="grow"><span class="mono xs muted">${esc(k.number)}</span><div>${esc(k.title)}</div><div class="xs muted">${esc(k.lawyerName)}</div></div>${VA.pill(k.status)}</li>`).join('')}</ul>` : VA.empty('folder', 'Sin expedientes visibles para tu usuario')}</section>
    ${c.balance != null ? `<section class="panel"><div class="panel-h"><h3>Situación financiera</h3></div><div class="panel-b">${VA.kv([['Saldo pendiente', c.balance ? `<b style="color:var(--bad)">${m$(c.balance)}</b>` : m$(0)], ['Saldo a favor', m$(c.credit)]])}</div></section>` : ''}
  </div><div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Identificación</h3>${c.masked ? `<span class="vis int">${icon('lock')}Datos enmascarados</span>` : ''}</div><div class="panel-b stack">
      ${VA.kv([['Correo', esc(c.email)], ['Teléfono', esc(c.phone)], ['Domicilio', esc(c.address)], ['Documento', esc((c.docType || '') + ' ' + (c.docNumber || ''))], ['País de emisión', esc(c.country)], ['Nacimiento', c.birthDate ? (c.masked ? '••••' : fd(c.birthDate)) : ''], ['Contacto preferido', esc(c.contactPref)], ['Verificación', VA.pill(c.verification) + (c.verifiedByName ? `<div class="xs muted">por ${esc(c.verifiedByName)} · ${fd(c.verifiedAt)}</div>` : '')]])}
      ${c.identityDocs.length ? `<div><span class="lbl">Documentación aportada</span><ul class="list tight">${c.identityDocs.map(d => `<li>${icon('file')}<span class="grow small">${esc(d.name)}</span>${VA.pill(d.status)}</li>`).join('')}</ul></div>` : ''}
      ${canId ? `<form data-form="verify" data-id="${c.id}" class="stack" novalidate style="border-top:1px solid var(--line);padding-top:12px"><span class="lbl">Estado de verificación</span><select class="in" name="status">${VA.opts(['No verificado', 'En revisión', 'Verificado manualmente'], c.verification)}</select><input class="in" name="note" placeholder="Cómo se verificó (obligatorio para marcar como verificado)"><p class="xs muted">La plataforma no verifica identidades automáticamente: este estado refleja una revisión manual del equipo y queda auditado.</p><button class="btn sm primary" type="submit" style="align-self:flex-start">Guardar estado</button></form>` : '<p class="xs muted">Para ver los datos completos y verificar identidades se necesita el permiso correspondiente.</p>'}
    </div></section>
  </div></div>`;
};
FORM.verify = (d, form) => VA.run(() => A().verifyIdentity(form.dataset.id, d.status, d.note), 'Estado de verificación actualizado.');

/* ════════ PLANTILLAS ════════ */
V.plantillas = () => {
  const a = A(); if (!a.can('plantillas.gestionar')) throw new VA.ApiError('FORBIDDEN', 'Requiere el permiso de plantillas.');
  const tps = a.templates(); const sel = S.ui.tplSel || tps[0].id; const t = tps.find(x => x.id === sel) || { id: '', name: '', category: VA.TEMPLATE_CATS[0], subject: '', body: '' };
  const cases = a.cases(); const pcase = S.ui.tplCase || (cases[0] || {}).id;
  let prev = { subject: '', body: '' }; try { if (t.id) prev = a.renderTemplate(t.id, pcase); } catch (e) { }
  return `${VA.pageH('Biblioteca de plantillas', 'Comunicaciones reutilizables con variables dinámicas', `<button class="btn primary" data-act="tplNew">${icon('plus')}Nueva plantilla</button>`)}
  <div style="display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:24px" class="tpl-grid">
    <section class="panel"><ul class="list tight">${VA.TEMPLATE_CATS.map(cat => { const items = tps.filter(x => x.category === cat); return items.length ? `<li style="background:var(--sunk);padding:6px 16px"><span class="eyebrow" style="font-size:10.5px">${esc(cat)}</span></li>` + items.map(x => `<li class="click" data-act="tplSel" data-id="${x.id}" style="${x.id === sel ? 'box-shadow:inset 2px 0 0 var(--gold);background:var(--sunk)' : ''}"><span class="small">${esc(x.name)}</span></li>`).join('') : ''; }).join('')}</ul></section>
    <div class="grid2">
      <form class="panel" data-form="tpl" data-id="${t.id}" novalidate><div class="panel-h"><h3>${t.id ? 'Editar' : 'Nueva'}</h3>${t.id ? `<button type="button" class="btn sm danger" data-act="tplDel" data-id="${t.id}">Eliminar</button>` : ''}</div><div class="panel-b stack">
        <label class="field"><span>Nombre</span><input class="in" name="name" value="${esc(t.name)}" required></label>
        <label class="field"><span>Categoría</span><select class="in" name="category">${VA.opts(VA.TEMPLATE_CATS, t.category)}</select></label>
        <label class="field"><span>Asunto</span><input class="in" name="subject" value="${esc(t.subject)}" required></label>
        <label class="field"><span>Texto</span><textarea class="in" id="tpl-body" name="body" style="min-height:240px" required>${esc(t.body)}</textarea></label>
        <div class="row" style="gap:6px"><span class="xs muted">Insertar:</span>${VA.TEMPLATE_VARS.map(v => `<button type="button" class="tag" style="cursor:pointer;background:var(--paper)" data-act="tplVar" data-v="${v}">{{${v}}}</button>`).join('')}</div>
        <div id="tpl-err" class="err" role="alert"></div><button class="btn primary" type="submit" style="align-self:flex-start">Guardar plantilla</button></div></form>
      <section class="panel"><div class="panel-h"><h3>Vista previa</h3><select class="in" style="width:auto;max-width:100%" data-change="tplCase" aria-label="Expediente de ejemplo">${VA.opts(cases.map(c => ({ v: c.id, l: c.number + ' · ' + c.clientName })), pcase)}</select></div><div class="panel-b stack"><p class="small muted">Con los datos del expediente elegido.</p><b style="font-weight:600">${esc(prev.subject)}</b><p style="white-space:pre-wrap;color:var(--ink-2)">${esc(prev.body)}</p></div></section>
    </div></div><style>@media(max-width:900px){.tpl-grid{grid-template-columns:minmax(0,1fr)!important}}</style>`;
};
ACT.tplSel = el => { S.ui.tplSel = el.dataset.id; VA.refresh(); };
ACT.tplNew = () => { S.ui.tplSel = '__new'; VA.refresh(); };
CHG.tplCase = el => { S.ui.tplCase = el.value; VA.refresh(); };
ACT.tplVar = el => { const ta = document.getElementById('tpl-body'); const v = '{{' + el.dataset.v + '}}'; const s = ta.selectionStart || ta.value.length; ta.value = ta.value.slice(0, s) + v + ta.value.slice(ta.selectionEnd || s); ta.focus(); ta.setSelectionRange(s + v.length, s + v.length); };
FORM.tpl = (d, form) => { try { const id = A().saveTemplate(form.dataset.id || null, d); S.ui.tplSel = id; VA.toast('Plantilla guardada.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#tpl-err').textContent = e.message; } };
ACT.tplDel = el => VA.confirm({ title: 'Eliminar plantilla', text: 'La plantilla se elimina de la biblioteca. Las comunicaciones ya enviadas no cambian.', label: 'Eliminar', danger: true }, () => VA.run(() => { A().deleteTemplate(el.dataset.id); S.ui.tplSel = null; }, 'Plantilla eliminada.'));

/* ════════ NOTIFICACIONES ════════ */
V.notificaciones = () => {
  const a = A(); const list = a.notifications(); const f = S.ui.nf || 'todas';
  const shown = f === 'nuevas' ? list.filter(n => !n.read) : list;
  const outbox = role() === 'admin' && (a.can('crm.gestionar') || a.can('ajustes.gestionar'));
  const tabs = outbox ? VA.tabs('notif', [['mias', 'Mis notificaciones', list.filter(n => !n.read).length], ['salida', 'Bandeja de salida (correo)'], ['auto', 'Recordatorios automáticos']]) : { cur: 'mias', html: '' };
  let body = '';
  if (tabs.cur === 'mias') body = `<div class="row between"><div class="seg" role="group" aria-label="Filtro"><button data-act="nf" data-v="todas" aria-pressed="${f === 'todas'}">Todas</button><button data-act="nf" data-v="nuevas" aria-pressed="${f === 'nuevas'}">Sin leer</button></div>${list.some(n => !n.read) ? '<button class="btn sm" data-act="readAll">Marcar todas como leídas</button>' : ''}</div>
    <section class="panel">${shown.length ? `<ul class="list">${shown.map(notifLi).join('')}</ul>` : VA.empty('bell', 'No hay notificaciones', f === 'nuevas' ? 'Leíste todo.' : '')}</section>
    <section class="panel"><div class="panel-h"><h3>Preferencias de comunicación</h3></div><div class="panel-b stack"><label class="check"><input type="checkbox" checked disabled> <span>Avisos dentro de la plataforma <span class="muted small">(siempre activos)</span></span></label><label class="check"><input type="checkbox" data-change="prefEmail"${S.me.notifPrefs && S.me.notifPrefs.email ? ' checked' : ''}> <span>Copia por correo electrónico</span></label><p class="xs muted">Los avisos repetidos sobre un mismo hecho se agrupan para no duplicar envíos.</p></div></section>`;
  if (tabs.cur === 'salida') { const ob = a.outbox(); body = `${VA.notice('mail', '<b>Modo demostración.</b> No hay proveedor de correo configurado: los mensajes quedan aquí con estado «Simulado» y no salen del sistema.', 'gold')}<section class="panel">${ob.length ? `<ul class="list">${ob.map(e => `<li style="align-items:flex-start">${icon('mail')}<div class="grow"><b style="font-weight:500">${esc(e.subject)}</b><div class="xs muted">Para ${esc(e.to)} · ${fdt(e.at)}</div><p class="small" style="color:var(--ink-2);margin-top:4px;white-space:pre-wrap">${esc(e.body.slice(0, 280))}${e.body.length > 280 ? '…' : ''}</p></div><span class="pill plain">${esc(e.status)}</span></li>`).join('')}</ul>` : VA.empty('mail', 'Sin correos')}</section>`; }
  if (tabs.cur === 'auto') { const st = a.settings(); body = `<section class="panel"><div class="panel-h"><h3>Recordatorios programados</h3><button class="btn primary sm" data-act="runSched">${icon('refresh')}Ejecutar ahora</button></div><div class="panel-b stack">${VA.kv([['Reuniones', st.reminders.meetingHours.map(h => h + ' h antes').join(' y ')], ['Facturas vencidas', 'cada ' + st.reminders.paymentEveryDays + ' días'], ['Presupuestos sin respuesta', 'a los ' + st.reminders.quoteAfterDays + ' días del envío'], ['Reservas sin pago', 'se liberan al vencer la reserva temporal (' + st.holdMinutes + ' min)']])}<p class="small muted">En producción esta tarea corre en el servidor cada 15 minutos. En la demo se ejecuta al iniciar sesión y con este botón. Cada recordatorio tiene una clave única, así que ejecutarlo varias veces no genera duplicados.</p>${S.ui.schedRes ? VA.notice('check', 'Última ejecución: ' + fdt(S.ui.schedRes.at) + ' · ' + S.ui.schedRes.created + ' notificaciones nuevas.', 'ok') : ''}${a.can('ajustes.gestionar') ? '<button class="btn sm" data-go="ajustes" style="align-self:flex-start">Configurar en Ajustes</button>' : ''}</div></section>`; }
  return `${VA.pageH('Notificaciones', list.filter(n => !n.read).length + ' sin leer')}${tabs.html}${body}`;
};
ACT.nf = el => { S.ui.nf = el.dataset.v; VA.refresh(); };
ACT.readAll = () => VA.run(() => A().markAllRead(), 'Todo marcado como leído.');
CHG.prefEmail = el => VA.run(() => { A().updatePrefs({ email: el.checked }); S.me.notifPrefs = { email: el.checked, inapp: true }; }, el.checked ? 'Vas a recibir copia por correo.' : 'Solo avisos dentro de la plataforma.');
ACT.runSched = () => VA.run(() => { S.ui.schedRes = A().runScheduler(); }, 'Recordatorios ejecutados.');

/* ════════ AUDITORÍA ════════ */
V.auditoria = () => {
  const f = VA.F('audit'); const rows = A().auditLog(f);
  return `${VA.pageH('Auditoría', 'Registro de acciones sensibles y accesos denegados')}
  <div class="row"><div class="search" style="max-width:320px">${icon('search')}<label class="sr" for="au-q">Buscar</label><input id="au-q" class="in" type="search" placeholder="Acción, persona o detalle" value="${esc(f.q || '')}" data-input="auQ"></div><label class="check"><input type="checkbox" data-change="auDenied"${f.denied ? ' checked' : ''}> <span>Solo accesos denegados</span></label></div>
  <div class="panel">${VA.table('audit', [{ k: 'at', l: 'Fecha', lead: true, fn: x => `<span class="small">${fdt(x.at)}</span>` }, { k: 'userName', l: 'Usuario' }, { k: 'action', l: 'Acción', fn: x => `<span class="mono xs" style="${x.action === 'acceso.denegado' ? 'color:var(--bad)' : ''}">${esc(x.action)}</span>` }, { k: 'detail', l: 'Detalle', fn: x => `<span class="small">${esc(x.detail)}</span>` }], rows, { defaultSort: { k: 'at', dir: 'desc' } })}</div>`;
};
let auq; INP.auQ = el => { clearTimeout(auq); auq = setTimeout(() => { VA.filter('audit', { q: el.value }); VA.refresh(); }, 220); };
CHG.auDenied = el => { VA.filter('audit', { denied: el.checked }); VA.refresh(); };

/* ════════ AJUSTES ════════ */
V.ajustes = () => {
  const a = A(); if (!a.can('ajustes.gestionar')) throw new VA.ApiError('FORBIDDEN', 'Requiere el permiso de ajustes.');
  const st = a.settings(); const f = st.firm; const admins = a.admins();
  const idLabels = { phone: 'Teléfono', address: 'Domicilio', docType: 'Tipo de documento', docNumber: 'Número de documento', country: 'País de emisión', birthDate: 'Fecha de nacimiento' };
  return `${VA.pageH('Ajustes', 'Datos institucionales, permisos, recordatorios y privacidad')}
  <div class="grid2">
  <form class="panel" data-form="setFirm" novalidate><div class="panel-h"><h3>Datos institucionales</h3><span class="small muted">Se muestran en el sitio y en los documentos</span></div><div class="panel-b form-grid">
    ${[['name', 'Nombre'], ['tagline', 'Bajada'], ['address', 'Dirección'], ['addressNote', 'Nota de dirección'], ['reference', 'Referencia de marca'], ['phone', 'Teléfono'], ['email', 'Correo'], ['hours', 'Horario']].map(([k, l]) => `<label class="field"><span>${l}</span><input class="in" name="${k}" value="${esc(f[k])}"></label>`).join('')}
    <label class="field"><span>LinkedIn</span><input class="in" name="linkedin" value="${esc(f.social.linkedin)}"></label><label class="field"><span>Instagram</span><input class="in" name="instagram" value="${esc(f.social.instagram)}"></label>
    <div class="full"><button class="btn primary" type="submit">Guardar datos</button></div></div></form>
  <div class="stack lg">
  <form class="panel" data-form="setId" novalidate><div class="panel-h"><h3>Identificación del cliente</h3></div><div class="panel-b stack"><p class="small muted">Campos obligatorios en la ficha de identificación.</p>${Object.keys(idLabels).map(k => `<label class="check"><input type="checkbox" name="${k}"${st.identityRequired[k] ? ' checked' : ''}> <span>${idLabels[k]}</span></label>`).join('')}<button class="btn primary sm" type="submit" style="align-self:flex-start">Guardar</button></div></form>
  <form class="panel" data-form="setRem" novalidate><div class="panel-h"><h3>Recordatorios y conservación</h3></div><div class="panel-b form-grid">
    <label class="field"><span>Recordatorio de reunión (horas antes)</span><input class="in" name="mh" value="${st.reminders.meetingHours.join(', ')}"><span class="hint">Separadas por coma, ej.: 24, 2</span></label>
    <label class="field"><span>Repetir aviso de pago cada (días)</span><input class="in" type="number" min="1" max="30" name="pe" value="${st.reminders.paymentEveryDays}"></label>
    <label class="field"><span>Recordar presupuesto tras (días)</span><input class="in" type="number" min="1" max="30" name="qa" value="${st.reminders.quoteAfterDays}"></label>
    <label class="field"><span>Conservar expedientes cerrados (años)</span><input class="in" type="number" min="1" name="ry" value="${st.retention.closedCaseYears}"></label>
    <label class="field"><span>Conservar consultas no convertidas (meses)</span><input class="in" type="number" min="1" name="rl" value="${st.retention.leadMonths}"></label>
    <div class="full"><button class="btn primary sm" type="submit">Guardar</button></div></div></form>
  </div></div>
  <section class="panel"><div class="panel-h"><h3>Permisos de administración</h3><span class="small muted">Cada cambio queda auditado</span></div><div class="panel-b tw"><form data-form="setPerms" novalidate><table class="t"><thead><tr><th>Permiso</th>${admins.map(x => `<th style="text-align:center">${esc(x.name)}<div class="xs muted" style="text-transform:none;letter-spacing:0;font-weight:400">${esc(x.adminScope)}</div></th>`).join('')}</tr></thead><tbody>${Object.entries(VA.PERMS).map(([k, l]) => `<tr><td>${esc(l)}<div class="mono xs muted">${k}</div></td>${admins.map(x => `<td style="text-align:center"><input type="checkbox" name="${x.id}" value="${k}"${x.perms.includes(k) ? ' checked' : ''} aria-label="${esc(l)} — ${esc(x.name)}" style="width:18px;height:18px;accent-color:var(--navy)"></td>`).join('')}</tr>`).join('')}</tbody></table><div class="row" style="margin-top:14px"><button class="btn primary" type="submit">Guardar permisos</button></div></form></div></section>
  <section class="panel"><div class="panel-h"><h3>Datos de demostración</h3></div><div class="panel-b row between"><p class="small muted" style="max-width:60ch">Restablecer borra todos los cambios hechos en este navegador y vuelve a cargar los 10 usuarios y los datos de ejemplo. ${VA.persistOK === false ? '<b>El navegador no permite guardar datos: los cambios se pierden al recargar.</b>' : 'Los cambios se guardan en este navegador.'}</p><button class="btn danger" data-act="resetDemo">${icon('refresh')}Restablecer datos de demostración</button></div></section>`;
};
FORM.setFirm = d => VA.run(() => A().saveSettings({ firm: d, social: { linkedin: d.linkedin, instagram: d.instagram } }), 'Datos institucionales guardados.');
FORM.setId = d => VA.run(() => A().saveSettings({ identityRequired: { phone: !!d.phone, address: !!d.address, docType: !!d.docType, docNumber: !!d.docNumber, country: !!d.country, birthDate: !!d.birthDate } }), 'Campos obligatorios actualizados.');
FORM.setRem = d => VA.run(() => A().saveSettings({ reminders: { meetingHours: String(d.mh).split(',').map(x => +x.trim()), paymentEveryDays: d.pe, quoteAfterDays: d.qa }, retention: { closedCaseYears: d.ry, leadMonths: d.rl } }), 'Recordatorios guardados.');
FORM.setPerms = d => VA.run(() => { A().admins().forEach(x => A().setAdminPerms(x.id, [].concat(d[x.id] || []))); S.me = Object.assign(S.me, A().me()); }, 'Permisos actualizados.');
})();
