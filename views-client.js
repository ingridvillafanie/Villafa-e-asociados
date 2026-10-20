/* Portal privado del cliente. Lenguaje claro, sin tecnicismos. */
(function () {
'use strict';
const VA = window.VA, S = VA.S, esc = VA.esc, icon = VA.icon, V = VA.V, C = VA.C, ACT = VA.ACT, FORM = VA.FORM, CHG = VA.CHG;
const A = () => VA.A();
const m$ = VA.money$, fd = VA.fDate, fdt = VA.fDT;
const today = () => VA.ymd(VA.now());
const first = n => String(n || '').split(' ')[0];

const MEET_EXPLAIN = (m) => ({
  'Pendiente de pago': `Reservamos el horario hasta las ${m.holdUntil ? VA.fTime(m.holdUntil) : '—'}. Completá el pago para enviar la solicitud a ${esc(m.lawyerName)}.`,
  'Pago confirmado': 'Pago recibido. Estamos enviando la solicitud al profesional.',
  'Pendiente de aprobación': `Pago recibido. <b>Tu turno todavía no está confirmado:</b> ${esc(m.lawyerName)} debe aprobarlo. Te avisamos apenas lo haga.`,
  'Aprobado': 'Turno confirmado. Te enviamos un recordatorio antes de la reunión.',
  'Reprogramación propuesta': `${esc(m.lawyerName)} te propone otro horario: <b>${m.proposedStart ? fdt(m.proposedStart) : ''}</b>. Aceptalo o cancelá con reintegro total.`,
  'Rechazado': 'El estudio no pudo confirmar este turno.' + (m.payment && m.payment.refundedCents ? ' Te reintegramos ' + m$(m.payment.refundedCents) + '.' : ''),
  'Cancelado': (m.history.slice(-1)[0] || {}).note || 'Turno cancelado.',
  'Realizado': 'Reunión realizada.',
  'Solicitado': 'Solicitud registrada.'
})[m.status] || '';

/* ── INICIO ── */
C.home = () => {
  const d = A().clientDashboard();
  const todo = [];
  if (d.pendingDocs.length) todo.push(`<li class="click" data-go="documentos" tabindex="0">${icon('upload')}<div class="grow"><b style="font-weight:600">Subí ${d.pendingDocs.length === 1 ? '1 documento' : d.pendingDocs.length + ' documentos'}</b><div class="small muted">${esc(d.pendingDocs.map(r => r.title).join(' · '))}</div></div>${icon('right')}</li>`);
  if (d.replaceDocs.length) todo.push(`<li class="click" data-go="documentos" tabindex="0">${icon('refresh')}<div class="grow"><b style="font-weight:600">Reemplazá ${d.replaceDocs.length === 1 ? 'un documento' : d.replaceDocs.length + ' documentos'}</b><div class="small muted">${esc(d.replaceDocs.map(x => x.name).join(' · '))}</div></div>${icon('right')}</li>`);
  d.quotes.forEach(q => todo.push(`<li class="click" data-go="presupuesto.${q.id}" tabindex="0">${icon('file')}<div class="grow"><b style="font-weight:600">Revisá tu presupuesto</b><div class="small muted">${esc(q.service)} · ${m$(q.total)} · válido hasta el ${fd(q.validUntil)}</div></div>${icon('right')}</li>`));
  const overdue = d.invoices.filter(i => i.status === 'Vencida');
  if (d.balance) todo.push(`<li class="click" data-go="pagos" tabindex="0">${icon('wallet')}<div class="grow"><b style="font-weight:600">${overdue.length ? 'Tenés un pago vencido' : 'Tenés un saldo pendiente'}</b><div class="small muted">${m$(d.balance)}${overdue.length ? ' · venció el ' + fd(overdue[0].dueAt) : ''}</div></div>${icon('right')}</li>`);
  if (d.next && d.next.status === 'Pendiente de pago') todo.push(`<li class="click" data-act="payMeeting" data-id="${d.next.id}" tabindex="0">${icon('card')}<div class="grow"><b style="font-weight:600">Pagá tu turno para enviarlo al profesional</b><div class="small muted">${fdt(d.next.start)} · ${m$(d.next.totalCents)}</div></div>${icon('right')}</li>`);
  const n = d.next;
  return `<div class="page-h"><div><p class="eyebrow">Tu espacio privado</p><h1 style="margin-top:8px">Hola, ${esc(first(S.me.name))}</h1><p class="sub">Acá ves el estado de tus asuntos, tus documentos, tus turnos y tus pagos.</p></div><button class="btn primary" data-go="solicitar">${icon('calendar')}Solicitar una reunión</button></div>
  ${todo.length ? `<section class="panel" style="border-color:color-mix(in srgb,var(--gold) 50%,var(--line))"><div class="panel-h"><h2>Para hacer</h2><span class="small muted">${todo.length} ${todo.length === 1 ? 'pendiente' : 'pendientes'}</span></div><ul class="list">${todo.join('')}</ul></section>` : VA.notice('check', 'No tenés nada pendiente. Te avisamos cuando haya novedades.', 'ok')}
  <div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h2>Mis expedientes</h2><button class="btn sm" data-go="expedientes">Ver todos</button></div>${d.cases.length ? `<ul class="list">${d.cases.map(c => `<li class="click" data-go="expediente.${c.id}" tabindex="0"><div class="grow"><span class="mono xs muted">${esc(c.number)}</span><div style="font-weight:500">${esc(c.title)}</div><div class="small" style="margin-top:2px">${VA.pill(c.status, c.statusLabel)} <span class="xs muted">· última novedad ${VA.rel(c.lastUpdate)}</span></div></div>${icon('right')}</li>`).join('')}</ul>` : VA.empty('folder', 'Todavía no tenés expedientes')}</section>
    <section class="panel"><div class="panel-h"><h2>Avisos recientes</h2><button class="btn sm" data-go="notificaciones">Todos</button></div>${d.notifications.length ? `<ul class="list tight">${d.notifications.map(VA.notifLi).join('')}</ul>` : VA.empty('bell', 'Sin avisos')}</section>
  </div><div class="stack lg">
    ${d.lawyers.map(l => `<section class="panel"><div class="panel-b row" style="gap:16px;flex-wrap:nowrap">${l.photo ? `<img src="${esc(l.photo)}" alt="" style="width:72px;height:88px;object-fit:cover;object-position:50% 20%;border-radius:4px;flex:none">` : VA.avatar(l.name, null, 'lg')}<div><span class="eyebrow" style="font-size:10.5px">Tu profesional</span><div class="serif" style="font-size:21px;margin-top:2px">${esc(l.name)}</div><div class="small muted">${esc(l.title)} · ${esc(l.specialty)}</div></div></div></section>`).join('')}
    <section class="panel"><div class="panel-h"><h2>Próximo turno</h2><button class="btn sm" data-go="turnos">Turnos</button></div><div class="panel-b">${n ? `<div class="stack"><div class="row" style="gap:14px;flex-wrap:nowrap"><div style="text-align:center;min-width:56px"><div class="xs muted" style="text-transform:uppercase;letter-spacing:.1em">${VA.MES[new Date(n.start).getMonth()]}</div><div class="serif" style="font-size:34px;line-height:1">${new Date(n.start).getDate()}</div></div><div><b style="font-weight:600">${esc(n.type)}</b><div class="small muted">${VA.fDay(n.start)} · ${VA.fTime(n.start)} · ${esc(n.lawyerName)}</div></div></div>${VA.pill(n.status)}<p class="small" style="color:var(--ink-2)">${MEET_EXPLAIN(n)}</p></div>` : `<p class="small muted">No tenés turnos programados.</p><button class="btn sm" data-go="solicitar" style="margin-top:10px">Solicitar una reunión</button>`}</div></section>
    <section class="panel"><div class="panel-h"><h2>Pagos</h2><button class="btn sm" data-go="pagos">Detalle</button></div><div class="panel-b">${VA.kv([['Saldo pendiente', d.balance ? `<b style="color:var(--bad)">${m$(d.balance)}</b>` : m$(0)], ['Pagos realizados', m$(d.paid)], d.credit ? ['Saldo a favor', m$(d.credit)] : null, ['Facturas', d.invoices.length]])}</div></section>
  </div></div>`;
};

/* ── EXPEDIENTES ── */
C.cases = () => {
  const rows = A().cases();
  return `${VA.pageH('Mis expedientes', 'Solo ves los asuntos de los que sos titular o a los que te dieron acceso.')}
  <div class="grid2">${rows.map(c => `<button class="panel click" data-go="expediente.${c.id}" style="text-align:left;cursor:pointer;color:inherit;padding:0"><div class="panel-b stack"><div class="row between"><span class="mono xs muted">${esc(c.number)}</span>${VA.pill(c.status, c.statusLabel)}</div><b class="serif" style="font-size:21px;font-weight:500;line-height:1.2">${esc(c.title)}</b><div class="row small muted" style="gap:8px">${VA.avatar(c.lawyerName, c.lawyerPhoto)}<span>${esc(c.lawyerName)}</span></div>${c.next ? `<p class="small">Próxima fecha: <b style="font-weight:600">${fd(c.next.date)}</b> · ${esc(c.next.label)}</p>` : ''}<p class="xs muted">Última novedad ${VA.rel(c.lastUpdate)}</p></div></button>`).join('') || VA.empty('folder', 'Todavía no tenés expedientes')}</div>`;
};
C.case = id => {
  const c = A().case(id);
  const pend = c.requests.filter(r => r.status === 'Pendiente');
  const accepted = c.quotes.filter(q => q.status === 'Aceptado');
  const open = c.quotes.filter(q => q.status === 'Enviado');
  return `${VA.pageH(`<span class="mono" style="font-size:14px;color:var(--muted);display:block;margin-bottom:6px;font-family:var(--f-mono)">${esc(c.number)}</span>${esc(c.title)}`, '', VA.pill(c.status, c.statusLabel), ['expedientes', 'Mis expedientes'])}
  <div class="split"><div class="stack lg">
    <section class="panel"><div class="panel-h"><h2>Resumen</h2></div><div class="panel-b stack"><p style="font-size:16px">${esc(c.clientSummary)}</p>${c.next ? `<div class="summary row" style="gap:14px"><div style="text-align:center;min-width:52px"><div class="xs muted" style="text-transform:uppercase">${VA.MES[VA.toD(c.next.date).getMonth()]}</div><div class="serif" style="font-size:28px;line-height:1">${VA.toD(c.next.date).getDate()}</div></div><div><span class="xs muted">Próxima fecha relevante</span><div style="font-weight:500">${esc(c.next.label)}</div></div></div>` : ''}</div></section>
    ${pend.length ? `<section class="panel" style="border-color:color-mix(in srgb,var(--gold) 50%,var(--line))"><div class="panel-h"><h2>Documentos que necesitamos</h2></div><ul class="list">${pend.map(r => `<li>${icon('file')}<div class="grow">${esc(r.title)}<div class="xs muted">Antes del ${fd(r.due)}</div></div><button class="btn sm primary" data-act="cUpload" data-case="${c.id}" data-req="${r.id}" data-cat="${esc(r.category)}" data-title="${esc(r.title)}">${icon('upload')}Subir</button></li>`).join('')}</ul></section>` : ''}
    ${open.length ? open.map(q => `<section class="panel"><div class="panel-b row between"><div><b style="font-weight:600">Presupuesto para revisar</b><div class="small muted">${esc(q.number)} · ${m$(q.total)}</div></div><button class="btn primary" data-go="presupuesto.${q.id}">Revisar presupuesto</button></div></section>`).join('') : ''}
    <section class="panel"><div class="panel-h"><h2>Novedades</h2><span class="small muted">Lo que tu abogado comparte con vos</span></div><div class="panel-b">${c.activities.length ? `<ol class="tl">${c.activities.map(x => `<li class="cliente"><div class="meta"><span>${esc(x.authorName)}</span><span>${fdt(x.at)}</span></div><p style="white-space:pre-wrap">${esc(x.text)}</p></li>`).join('')}</ol>` : VA.empty('clock', 'Todavía no hay novedades')}</div></section>
    <section class="panel"><div class="panel-h"><h2>Documentos compartidos</h2><button class="btn sm" data-act="cUpload" data-case="${c.id}">${icon('upload')}Subir documento</button></div>${docList(c.documents)}</section>
  </div><div class="stack lg">
    <section class="panel"><div class="panel-b row" style="gap:14px;flex-wrap:nowrap">${c.lawyer.photo ? `<img src="${esc(c.lawyer.photo)}" alt="" style="width:64px;height:80px;object-fit:cover;object-position:50% 20%;border-radius:4px">` : ''}<div><span class="eyebrow" style="font-size:10.5px">Profesional responsable</span><div class="serif" style="font-size:20px">${esc(c.lawyer.name)}</div><div class="small muted">${esc(c.lawyer.title)}</div><button class="btn sm" style="margin-top:8px" data-act="bookFor" data-case="${c.id}" data-lawyer="${c.lawyer.id}" data-area="${esc(c.area)}">Pedir reunión</button></div></div></section>
    ${c.meetings.length ? `<section class="panel"><div class="panel-h"><h3>Reuniones</h3></div><ul class="list tight">${c.meetings.map(m => `<li class="click" data-act="openMeeting" data-id="${m.id}"><div class="grow small">${fdt(m.start)}<div class="xs muted">${esc(m.type)}</div></div>${VA.pill(m.status)}</li>`).join('')}</ul></section>` : ''}
    ${accepted.length ? `<section class="panel"><div class="panel-h"><h3>Presupuesto aceptado</h3></div><ul class="list tight">${accepted.map(q => `<li class="click" data-go="presupuesto.${q.id}"><div class="grow small">${esc(q.number)}<div class="xs muted">Aceptado el ${fd(q.acceptance.at)}</div></div><b style="font-weight:600">${m$(q.total)}</b></li>`).join('')}</ul></section>` : ''}
    ${c.finance ? `<section class="panel"><div class="panel-h"><h3>Facturas y pagos</h3></div>${c.finance.invoices.length ? `<ul class="list tight">${c.finance.invoices.map(i => `<li class="click" data-go="factura.${i.id}"><div class="grow small"><span class="mono">${esc(i.number)}</span><div class="xs muted">${esc(i.concept)}</div></div><span class="small nowrap">${m$(i.balance ? i.balance : i.total)}</span>${VA.pill(i.status)}</li>`).join('')}</ul>` : VA.empty('wallet', 'Sin facturas')}</section>` : ''}
  </div></div>`;
};
function docList(docs) {
  if (!docs.length) return VA.empty('file', 'Todavía no hay documentos');
  return `<ul class="list">${docs.map(d => `<li style="align-items:flex-start">${icon('file')}<div class="grow"><span style="font-weight:500">${esc(d.name)}</span><div class="xs muted">${esc(d.category)} · ${fd(d.at)} · ${VA.fsize(d.size)} · ${d.mine || d.uploadedBy === S.me.id ? 'subido por vos' : 'compartido por el estudio'}</div>${d.status === 'Requiere reemplazo' && d.reviewNote ? `<div class="small" style="color:var(--bad);margin-top:4px">${esc(d.reviewNote)}</div>` : ''}</div>${VA.pill(d.status)}${d.replaceable && d.uploadedBy === S.me.id && d.status !== 'Aprobado' ? `<button class="btn sm" data-act="cUpload" data-case="${d.caseId}" data-replace="${d.id}" data-cat="${esc(d.category)}" data-title="${esc(d.name)}">Reemplazar</button>` : `<button class="btn sm ghost" data-act="docDownload" aria-label="Descargar ${esc(d.name)}">${icon('download')}</button>`}</li>`).join('')}</ul>`;
}

/* ── DOCUMENTOS ── */
V.documentos = () => {
  if (S.me.role !== 'client') return VA.notFound();
  const groups = A().myDocuments();
  const pend = groups.flatMap(g => g.requests.filter(r => r.status === 'Pendiente').map(r => Object.assign(r, { number: g.number })));
  return `${VA.pageH('Documentos', 'Subí documentación de forma segura y seguí su revisión.', `<button class="btn primary" data-act="cUpload">${icon('upload')}Subir documento</button>`)}
  ${pend.length ? `<section class="panel" style="border-color:color-mix(in srgb,var(--gold) 50%,var(--line))"><div class="panel-h"><h2>Solicitudes del estudio</h2><span class="small muted">${pend.length} pendientes</span></div><ul class="list">${pend.map(r => `<li>${icon('file')}<div class="grow"><b style="font-weight:500">${esc(r.title)}</b><div class="xs muted"><span class="mono">${esc(r.number)}</span> · antes del ${fd(r.due)}${VA.daysUntil(r.due) < 0 ? ' · <span style="color:var(--bad)">vencida</span>' : ''}</div></div><button class="btn sm primary" data-act="cUpload" data-case="${r.caseId}" data-req="${r.id}" data-cat="${esc(r.category)}" data-title="${esc(r.title)}">${icon('upload')}Subir</button></li>`).join('')}</ul></section>` : ''}
  ${VA.notice('lock', 'Formatos aceptados: PDF, JPG, PNG y DOCX, hasta 10 MB por archivo. Cada documento queda asociado a su expediente y solo lo ve el equipo que trabaja en él.')}
  ${groups.map(g => `<section class="panel"><div class="panel-h"><div><span class="mono xs muted">${esc(g.number)}</span><h2 style="font-size:19px">${esc(g.title)}</h2></div></div>${docList(g.documents)}</section>`).join('')}`;
};
ACT.cUpload = el => {
  const cases = A().cases(); const ds = el.dataset;
  VA.openModal({ title: ds.replace ? 'Reemplazar documento' : ds.req ? 'Subir: ' + ds.title : 'Subir documento', form: 'cUpload', body: `
  <input type="hidden" name="req" value="${esc(ds.req || '')}"><input type="hidden" name="replace" value="${esc(ds.replace || '')}">
  ${ds.replace ? `<p class="small muted">Reemplazás «${esc(ds.title)}». La versión anterior deja de estar visible.</p>` : ''}
  <label class="field"><span>Expediente</span><select class="in" name="caseId"${ds.case ? ' disabled' : ''} required>${VA.opts(cases.map(c => ({ v: c.id, l: c.number + ' · ' + c.title })), ds.case || (cases.length === 1 ? cases[0].id : ''), cases.length > 1 && !ds.case ? 'Elegí' : null)}</select>${ds.case ? `<input type="hidden" name="caseId" value="${esc(ds.case)}">` : ''}</label>
  <label class="field"><span>Categoría</span><select class="in" name="category">${VA.opts(VA.DOC_CATS, ds.cat || 'Documentación del caso')}</select></label>
  <label class="field"><span>Archivo <span class="hint">· PDF, JPG, PNG o DOCX · máx. 10 MB</span></span><input class="in" type="file" id="cu-file" accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png" required></label>
  ${VA.notice('info', '<b>Demo:</b> se registran el nombre, el tipo y el tamaño del archivo. En producción el archivo se guarda cifrado en un almacenamiento privado.')}
  <div id="cu-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary">${icon('upload')}Subir</button>` });
};
FORM.cUpload = (d, form) => {
  const err = form.querySelector('#cu-err'); const f = VA.fileMeta(form.querySelector('#cu-file'));
  if (!d.caseId) { err.textContent = 'Elegí el expediente.'; return; }
  if (!f) { err.textContent = 'Elegí un archivo.'; return; }
  if (f.size > VA.MAX_FILE) { err.textContent = 'El archivo supera 10 MB. Comprimilo o dividilo en partes.'; return; }
  if (!VA.ALLOWED_FILES[f.type]) { err.textContent = 'Formato no admitido. Usá PDF, JPG, PNG o DOCX.'; return; }
  try { A().uploadDocument({ caseId: d.caseId, name: f.name, size: f.size, type: f.type, category: d.category, requestId: d.req || null, replaceId: d.replace || null }); S.modal = null; VA.toast('Recibimos tu documento. Queda pendiente de revisión.', 'ok'); VA.refresh(); } catch (e) { if (e.code === 'SESSION') return VA.handle(e); err.textContent = e.message; }
};

/* ── TURNOS ── */
C.turns = () => {
  const list = A().meetings(); const now = VA.now();
  const up = list.filter(m => !['Rechazado', 'Cancelado', 'Realizado'].includes(m.status) && new Date(m.start) > new Date(now.getTime() - 3600e3)).sort((a, b) => a.start.localeCompare(b.start));
  const past = list.filter(m => !up.includes(m)).sort((a, b) => b.start.localeCompare(a.start));
  const card = m => `<li style="align-items:flex-start;flex-wrap:wrap">${VA.avatar(m.lawyerName, m.lawyerPhoto)}<div class="grow" style="min-width:200px"><b style="font-weight:600">${esc(m.type)}</b> <span class="small muted">con ${esc(m.lawyerName)}</span><div class="small">${VA.fDay(m.start)} · ${VA.fTime(m.start)} a ${VA.fTime(m.end)} · ${m$(m.totalCents)}</div><div style="margin-top:6px">${VA.pill(m.status)}</div><p class="small" style="color:var(--ink-2);margin-top:6px">${MEET_EXPLAIN(m)}</p></div><div class="row" style="gap:6px">${m.status === 'Pendiente de pago' ? `<button class="btn sm primary" data-act="payMeeting" data-id="${m.id}">${icon('card')}Pagar ${m$(m.totalCents)}</button>` : ''}${m.status === 'Reprogramación propuesta' ? `<button class="btn sm primary" data-act="cAcceptProp" data-id="${m.id}">Aceptar nuevo horario</button>` : ''}${['Pendiente de pago', 'Pendiente de aprobación', 'Aprobado', 'Reprogramación propuesta'].includes(m.status) ? `<button class="btn sm" data-act="cCancel" data-id="${m.id}">Cancelar</button>` : ''}</div></li>`;
  return `${VA.pageH('Turnos', 'Tus reuniones con el estudio', `<button class="btn primary" data-go="solicitar">${icon('plus')}Solicitar una reunión</button>`)}
  <section class="panel"><div class="panel-h"><h2>Próximos</h2></div>${up.length ? `<ul class="list">${up.map(card).join('')}</ul>` : VA.empty('calendar', 'No tenés turnos próximos', 'Podés pedir una reunión cuando lo necesites.', '<button class="btn sm" data-go="solicitar">Solicitar una reunión</button>')}</section>
  <section class="panel"><div class="panel-h"><h2>Cómo funcionan los turnos</h2></div><div class="panel-b"><ol class="prose" style="padding-left:20px;margin:0;display:flex;flex-direction:column;gap:6px;font-size:14px"><li>Elegís el tipo de consulta, el profesional y el horario. Ves el costo antes de pagar.</li><li>Reservamos el horario por ${VA.db.settings.holdMinutes / 60} horas mientras completás el pago.</li><li>Con el pago confirmado, el profesional revisa la solicitud. <b>El turno queda confirmado recién cuando lo aprueba.</b></li><li>Si el estudio rechaza o cancela, te reintegramos el 100 %. Si cancelás vos con 24 h o más, también. Con menos de 24 h, acreditamos el 50 % como saldo a favor.</li></ol></div></section>
  ${past.length ? `<section class="panel"><div class="panel-h"><h2>Historial</h2></div><ul class="list">${past.map(card).join('')}</ul></section>` : ''}`;
};
C.meetingModal = m => VA.openModal({ title: m.type, body: `<div class="stack">${VA.pill(m.status)}${VA.kv([['Profesional', esc(m.lawyerName)], ['Fecha', VA.fDay(m.start)], ['Horario', VA.fTime(m.start) + ' a ' + VA.fTime(m.end)], ['Costo', m$(m.totalCents)]])}<p class="small">${MEET_EXPLAIN(m)}</p></div>`, foot: `<button class="btn" data-act="closeModal">Cerrar</button><button class="btn primary" data-go="turnos">Ir a Turnos</button>` });
ACT.cAcceptProp = el => VA.run(() => A().meetingAction(el.dataset.id, 'acceptProposal'), 'Nuevo horario aceptado. Tu turno está confirmado.');
ACT.cCancel = el => {
  const m = A().meetings().find(x => x.id === el.dataset.id); const hrs = (new Date(m.start) - VA.now()) / 3600e3;
  const paid = m.payment && m.payment.status === 'Confirmado';
  const rule = !paid ? 'No se registró ningún pago, así que no hay cargos.' : m.status === 'Reprogramación propuesta' || m.status === 'Pendiente de aprobación' || hrs >= 24 ? 'Te reintegramos el 100 % del pago (' + VA.money(m.payment.amountCents) + ').' : 'Faltan menos de 24 horas: acreditamos el 50 % (' + VA.money(Math.round(m.payment.amountCents / 2)) + ') como saldo a favor para otra consulta. El resto no se reintegra.';
  VA.confirm({ title: 'Cancelar turno', text: 'Turno del ' + VA.fDT(m.start) + ' con ' + m.lawyerName + '. ' + rule, label: 'Cancelar turno', danger: true }, () => { try { const r = A().meetingAction(m.id, 'cancel'); VA.toast(r.rule, 'ok'); VA.refresh(); } catch (e) { VA.handle(e); } });
};

/* ── SOLICITAR REUNIÓN (asistente) ── */
ACT.bookFor = el => { S.ui.bk = { step: 2, typeId: 'seguimiento', area: el.dataset.area, lawyerId: el.dataset.lawyer, caseId: el.dataset.case, dur: 30 }; VA.go('solicitar'); };
V.solicitar = () => {
  if (S.me.role !== 'client') return VA.notFound();
  const a = A(); const b = S.ui.bk = S.ui.bk || { step: 1, typeId: '', area: '', lawyerId: null, caseId: '', dur: 60 };
  const type = VA.MEETING_TYPES.find(t => t.id === b.typeId);
  const steps = ['Consulta', 'Profesional', 'Fecha y hora', 'Confirmar'];
  const head = `<div class="wsteps" aria-label="Pasos">${steps.map((s, i) => `<span class="${i + 1 === b.step ? 'on' : i + 1 < b.step ? 'done' : ''}">${i + 1}. ${s}</span>`).join('')}</div>`;
  let body = '';
  const cases = a.cases().filter(c => !['Cerrado', 'Archivado'].includes(c.status));
  if (b.step === 1) {
    body = `<div class="stack lg"><fieldset style="border:0;padding:0;margin:0" class="stack"><legend class="lbl" style="margin-bottom:8px">Tipo de consulta</legend><div class="choice">${VA.MEETING_TYPES.map(t => `<button type="button" class="opt" data-act="bkSet" data-k="typeId" data-v="${t.id}" aria-pressed="${b.typeId === t.id}"><span><span class="t">${esc(t.name)}</span><span class="small muted" style="display:block">${esc(t.desc)}</span><span class="xs muted" style="display:block;margin-top:4px">${t.durations.join(' o ')} minutos</span></span></button>`).join('')}</div></fieldset>
    <div class="form-grid"><label class="field"><span>Área jurídica</span><select class="in" data-change="bkField" data-k="area">${VA.opts(VA.AREAS, b.area, 'Elegí un área')}</select></label>
    ${cases.length ? `<label class="field"><span>Expediente relacionado (opcional)</span><select class="in" data-change="bkField" data-k="caseId">${VA.opts(cases.map(c => ({ v: c.id, l: c.number + ' · ' + c.title })), b.caseId, 'Ninguno / consulta nueva')}</select></label>` : ''}</div>
    <div class="row"><button class="btn primary" data-act="bkStep" data-v="2"${b.typeId && b.area ? '' : ' disabled'}>Continuar</button></div></div>`;
  }
  if (b.step === 2) {
    const ls = a.bookingOptions(b.area);
    body = `<div class="stack lg"><p class="muted">Profesionales de ${esc(b.area)}. La tarifa es por hora; el costo final depende de la duración.</p><div class="choice">
    <button type="button" class="opt" data-act="bkSet" data-k="lawyerId" data-v="" aria-pressed="${b.lawyerId === ''}"><span class="avatar">${icon('users').replace('<svg', '<svg style="width:18px;height:18px"')}</span><span><span class="t">Que el estudio asigne</span><span class="small muted" style="display:block">Asignamos al profesional con disponibilidad en el horario que elijas.</span></span></button>
    ${ls.map(l => `<button type="button" class="opt" data-act="bkSet" data-k="lawyerId" data-v="${l.id}" aria-pressed="${b.lawyerId === l.id}">${VA.avatar(l.name, l.photo, 'lg')}<span><span class="t">${esc(l.name)}</span><span class="small muted" style="display:block">${esc(l.title)} · ${esc(l.specialty)}</span><span class="small" style="display:block;margin-top:4px"><b style="font-weight:600">${m$(l.rateCents)}</b> por hora${l.availability !== 'Disponible' ? ' · ' + esc(l.availability) : ''}</span></span></button>`).join('')}</div>
    <div class="row"><button class="btn" data-act="bkStep" data-v="1">Atrás</button><button class="btn primary" data-act="bkStep" data-v="3"${b.lawyerId != null ? '' : ' disabled'}>Continuar</button></div></div>`;
  }
  if (b.step === 3) {
    if (!type.durations.includes(b.dur)) b.dur = type.durations[0];
    const days = []; let d = VA.dayStart(VA.now()); while (days.length < 12) { if (d.getDay() !== 0 && d.getDay() !== 6) days.push(VA.ymd(d)); d = VA.addDays(d, 1); }
    if (!b.date || !days.includes(b.date)) b.date = days[0];
    let slots = [];
    if (b.lawyerId) slots = a.slots(b.lawyerId, b.date, b.dur);
    else { const set = new Set(); a.bookingOptions(b.area).forEach(l => a.slots(l.id, b.date, b.dur).forEach(s => set.add(s))); slots = [...set].sort(); }
    body = `<div class="stack lg"><fieldset style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:8px">Duración</legend><div class="seg">${type.durations.map(x => `<button type="button" data-act="bkSet" data-k="dur" data-v="${x}" aria-pressed="${b.dur === x}">${x} minutos</button>`).join('')}</div></fieldset>
    <div class="field"><span>Día</span><div class="days">${days.map(x => { const dd = VA.toD(x); return `<button type="button" data-act="bkSet" data-k="date" data-v="${x}" aria-pressed="${b.date === x}"><small>${VA.DIA[dd.getDay()]}</small><b>${dd.getDate()}</b><small>${VA.MES[dd.getMonth()]}</small></button>`; }).join('')}</div></div>
    <div class="field"><span>Horarios disponibles · ${esc(VA.fDay(b.date))}</span>${slots.length ? `<div class="slots">${slots.map(s => `<button type="button" data-act="bkSet" data-k="start" data-v="${s}" aria-pressed="${b.start === s}">${VA.fTime(s)}</button>`).join('')}</div>` : '<p class="small muted">No quedan horarios libres ese día. Probá con otro.</p>'}</div>
    <div class="row"><button class="btn" data-act="bkStep" data-v="2">Atrás</button><button class="btn primary" data-act="bkStep" data-v="4"${b.start && slots.includes(b.start) ? '' : ' disabled'}>Continuar</button></div></div>`;
  }
  if (b.step === 4) {
    const opts = a.bookingOptions(b.area); const l = b.lawyerId ? opts.find(x => x.id === b.lawyerId) : null;
    const cost = l ? VA.money(Math.round(l.rateCents * b.dur / 60)) : null;
    const rng = opts.map(x => Math.round(x.rateCents * b.dur / 60)); const minC = Math.min(...rng), maxC = Math.max(...rng);
    body = `<div class="grid2"><div class="stack lg"><div class="summary stack">${VA.kv([['Consulta', esc(type.name)], ['Área', esc(b.area)], ['Profesional', l ? esc(l.name) : 'Asignación del estudio'], ['Fecha', esc(VA.fDay(b.start))], ['Horario', VA.fTime(b.start) + ' · ' + b.dur + ' minutos'], ['Tarifa', l ? m$(l.rateCents) + ' por hora' : 'Según el profesional asignado'], ['Moneda', 'Dólares estadounidenses (USD)']])}<div style="border-top:1px solid var(--line-2);padding-top:10px"><span class="xs muted">Costo total</span><div class="big">${cost || (minC === maxC ? VA.money(minC) : 'Entre ' + VA.money(minC) + ' y ' + VA.money(maxC))}</div>${l ? '' : '<p class="xs muted">Al reservar te mostramos el profesional asignado y el importe exacto antes de pagar.</p>'}</div></div></div>
    <div class="stack lg"><label class="field"><span>Contanos brevemente el motivo <span class="hint">· sin datos sensibles</span></span><textarea class="in" id="bk-desc" maxlength="1000">${esc(b.description || '')}</textarea></label>
    ${VA.notice('info', '<b>Pagar no confirma el turno.</b> Después del pago, la solicitud queda pendiente hasta que el profesional la apruebe. Si no la aprueba, te reintegramos el 100 %.', 'gold')}
    <div class="row"><button class="btn" data-act="bkStep" data-v="3">Atrás</button><button class="btn primary" data-act="bkSubmit">Reservar y continuar al pago</button></div></div></div>`;
  }
  return `${VA.pageH('Solicitar una reunión', '', '', ['turnos', 'Turnos'])}${head}<section class="panel"><div class="panel-b">${body}</div></section>`;
};
ACT.bkSet = el => { const b = S.ui.bk; const k = el.dataset.k; let v = el.dataset.v; if (k === 'dur') v = +v; b[k] = v; if (['dur', 'date', 'lawyerId', 'typeId'].includes(k)) b.start = null; if (k === 'typeId') b.dur = VA.MEETING_TYPES.find(t => t.id === v).durations[0]; VA.refresh(); };
CHG.bkField = el => { S.ui.bk[el.dataset.k] = el.value; if (el.dataset.k === 'area') S.ui.bk.lawyerId = null; VA.refresh(); };
ACT.bkStep = el => { S.ui.bk.step = +el.dataset.v; const d = document.getElementById('bk-desc'); if (d) S.ui.bk.description = d.value; VA.refresh(); window.scrollTo(0, 0); };
ACT.bkSubmit = () => {
  const b = S.ui.bk; const d = document.getElementById('bk-desc'); b.description = d ? d.value : '';
  try { const id = A().requestMeeting({ typeId: b.typeId, durationMin: b.dur, area: b.area, lawyerId: b.lawyerId || null, start: b.start, caseId: b.caseId || null, description: b.description }); S.ui.bk = null; VA.go('turnos'); VA.toast('Horario reservado. Completá el pago para enviar la solicitud.', 'ok'); ACT.payMeeting({ dataset: { id } }); }
  catch (e) { VA.handle(e); if (e.code === 'CONFLICT') { b.step = 3; b.start = null; VA.refresh(); } }
};

/* ── PAGO (pasarela en modo de prueba) ── */
ACT.payMeeting = el => { const m = A().meetings().find(x => x.id === el.dataset.id); if (!m) return; S.ui.pay = { kind: 'meeting', id: m.id, amount: m.totalCents, title: m.type + ' con ' + m.lawyerName, sub: VA.fDT(m.start) + ' · ' + m.durationMin + ' min · ' + VA.money(m.rateCents) + '/h', stage: 'form' }; payModal(); };
ACT.payInvoice = el => { const i = A().invoice(el.dataset.id); S.ui.pay = { kind: 'invoice', id: i.id, amount: i.balance, max: i.balance, title: 'Factura ' + i.number, sub: i.concept + ' · saldo ' + VA.money(i.balance), stage: 'form' }; payModal(); };
function payModal() {
  const p = S.ui.pay; let body, foot;
  if (p.stage === 'form') {
    body = `<div class="summary"><span class="xs muted">${esc(p.title)}</span><div class="big">${m$(p.amount)}</div><p class="xs muted">${esc(p.sub)}</p></div>
    ${VA.notice('card', '<b>Pasarela en modo de prueba.</b> No se realizan cobros reales. Usá <span class="mono">4242 4242 4242 4242</span> (aprobada) o <span class="mono">4000 0000 0000 0002</span> (rechazada), cualquier vencimiento futuro y CVC. El número completo y el código de seguridad no se guardan.', 'gold')}
    ${p.kind === 'invoice' ? `<label class="field"><span>Importe a pagar (USD)</span><input class="in" name="amount" inputmode="decimal" value="${VA.centsInput(p.amount)}"><span class="hint">Podés hacer un pago parcial. Máximo ${VA.money(p.max)}.</span></label>` : ''}
    <div class="form-grid"><label class="field full"><span>Nombre en la tarjeta</span><input class="in" name="cname" autocomplete="cc-name" value="${esc(S.me.name)}" required></label>
    <label class="field full"><span>Número de tarjeta</span><input class="in mono" name="cnum" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="23" required data-input="ccFmt"></label>
    <label class="field"><span>Vencimiento</span><input class="in" name="cexp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5" required data-input="expFmt"></label>
    <label class="field"><span>CVC</span><input class="in" name="ccvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" required></label></div>
    <div id="pay-err" class="err" role="alert"></div>`;
    foot = `<button type="button" class="btn" data-act="closeModal">Cancelar</button><button class="btn primary" type="submit">${icon('lock')}Pagar ${m$(p.amount)}</button>`;
  } else if (p.stage === 'processing') {
    body = `<div class="empty"><span class="spin" style="width:28px;height:28px"></span><strong>Procesando el pago</strong><p class="small">Esperando la confirmación de la pasarela de prueba. El pago no se marca como recibido hasta que la pasarela lo confirma.</p><p class="xs muted mono">${esc(p.providerId)}</p></div>`; foot = '';
  } else if (p.stage === 'ok') {
    body = `<div class="empty">${icon('check')}<strong>Pago confirmado</strong>${p.kind === 'meeting' ? `<p class="small" style="max-width:44ch">Recibimos ${m$(p.amount)}. <b>Tu turno todavía no está confirmado:</b> quedó pendiente de aprobación del profesional. Te avisamos apenas lo apruebe.</p>` : `<p class="small">Aplicamos ${m$(p.amount)} a la factura. El saldo ya está actualizado.</p>`}<p class="xs muted mono">${esc(p.providerId)}</p></div>`;
    foot = `<button class="btn primary" data-act="closeModal">Listo</button>`;
  } else {
    body = `<div class="empty">${icon('alert')}<strong>No pudimos procesar el pago</strong><p class="small">La tarjeta fue rechazada por el emisor (simulación). No se realizó ningún cargo. Podés intentar con otra tarjeta.</p></div>`;
    foot = `<button class="btn" data-act="closeModal">Cerrar</button><button class="btn primary" data-act="payRetry">Intentar de nuevo</button>`;
  }
  VA.openModal({ title: p.kind === 'meeting' ? 'Pagar la consulta' : 'Pagar factura', form: p.stage === 'form' ? 'pay' : null, body, foot });
}
VA.INP.ccFmt = el => { const v = el.value.replace(/\D/g, '').slice(0, 19); el.value = v.replace(/(.{4})/g, '$1 ').trim(); };
VA.INP.expFmt = el => { let v = el.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); el.value = v; };
ACT.payRetry = () => { S.ui.pay.stage = 'form'; payModal(); };
FORM.pay = (d, form) => {
  const p = S.ui.pay; const err = form.querySelector('#pay-err');
  let amt = p.amount; if (p.kind === 'invoice') { amt = VA.parseMoney(d.amount); if (isNaN(amt) || amt <= 0) { err.textContent = 'Revisá el importe a pagar.'; return; } }
  const card = { number: d.cnum, exp: d.cexp, cvc: d.ccvc, name: d.cname };
  try {
    const r = A().startPayment(p.kind === 'meeting' ? { meetingId: p.id, card } : { invoiceId: p.id, amountCents: amt, card });
    // los datos de la tarjeta se descartan aquí: no quedan en el estado de la aplicación
    form.reset(); p.amount = amt; p.providerId = r.providerId; p.stage = 'processing'; payModal();
    setTimeout(() => { // confirmación asíncrona de la pasarela (webhook simulado)
      try { const res = VA.server.providerWebhook(r.providerId); p.stage = res.status === 'Confirmado' ? 'ok' : 'fail'; } catch (e) { p.stage = 'fail'; }
      if (S.modal) payModal(); else VA.refresh();
    }, 1600);
  } catch (e) { if (e.code === 'SESSION') return VA.handle(e); err.textContent = e.message; }
};

/* ── PAGOS Y PRESUPUESTOS ── */
C.pay = () => {
  const a = A(); const d = a.clientDashboard(); const invs = a.invoices(); const pays = a.payments(); const quotes = a.quotes();
  return `${VA.pageH('Pagos y presupuestos', 'Tus facturas, pagos y propuestas de honorarios')}
  <div class="figures"><div class="fig ${d.balance ? 'alert' : ''}" style="cursor:default"><span class="v money">${m$(d.balance)}</span><span class="k">Saldo pendiente</span></div><div class="fig" style="cursor:default"><span class="v money">${m$(d.paid)}</span><span class="k">Pagos realizados</span></div><div class="fig" style="cursor:default"><span class="v money">${m$(d.credit)}</span><span class="k">Saldo a favor</span></div></div>
  ${quotes.length ? `<section class="panel"><div class="panel-h"><h2>Presupuestos</h2></div><ul class="list">${quotes.map(q => `<li class="click" data-go="presupuesto.${q.id}" tabindex="0">${icon('file')}<div class="grow"><b style="font-weight:500">${esc(q.service)}</b><div class="xs muted"><span class="mono">${esc(q.number)}</span> · ${q.status === 'Enviado' ? 'válido hasta el ' + fd(q.validUntil) : q.status === 'Aceptado' ? 'aceptado el ' + fd(q.acceptance.at) : esc(q.status.toLowerCase())}</div></div><span class="nowrap">${m$(q.total)}</span>${VA.pill(q.status)}</li>`).join('')}</ul></section>` : ''}
  <section class="panel"><div class="panel-h"><h2>Facturas</h2><span class="xs muted">Comprobantes internos del estudio</span></div>${VA.table('cinv', [
    { k: 'number', l: 'Factura', lead: true, fn: i => `<span class="mono">${esc(i.number)}</span><div class="xs muted">${esc(i.concept)} · ${esc(i.caseNumber)}</div>` },
    { k: 'dueAt', l: 'Vence', fn: i => fd(i.dueAt) }, { k: 'total', l: 'Importe', cls: 'num', fn: i => m$(i.total) },
    { k: 'balance', l: 'Saldo', cls: 'num', fn: i => i.balance ? `<b style="font-weight:600">${m$(i.balance)}</b>` : m$(0) },
    { k: 'status', l: 'Estado', fn: i => VA.pill(i.status) + (i.pendingCents ? '<div class="xs muted">Pago en proceso</div>' : '') },
    { k: 'x', l: '', sort: false, fn: i => i.balance && !i.pendingCents ? `<button class="btn sm primary" data-act="payInvoice" data-id="${i.id}">Pagar</button>` : `<button class="btn sm" data-go="factura.${i.id}">Ver</button>` }
  ], invs, { defaultSort: { k: 'number', dir: 'desc' }, empty: VA.empty('book', 'Sin facturas') })}</section>
  <section class="panel"><div class="panel-h"><h2>Pagos realizados</h2></div>${VA.paymentsTable(pays, 'cpays', true)}</section>`;
};
C.invoice = id => {
  const i = A().invoice(id); const firm = VA.server.pub.firm();
  return `${VA.pageH(`<span class="mono">${esc(i.number)}</span>`, esc(i.concept) + ' · ' + VA.pill(i.status), i.balance && !i.pendingCents ? `<button class="btn primary" data-act="payInvoice" data-id="${i.id}">${icon('card')}Pagar ${m$(i.balance)}</button>` : '', ['pagos', 'Pagos'])}${VA.invoiceDoc(i, firm)}`;
};
C.quote = id => {
  const q = A().quote(id); const firm = VA.server.pub.firm();
  const open = q.status === 'Enviado';
  return `${VA.pageH(esc(q.service), `<span class="mono">${esc(q.number)}</span> · versión ${q.version} · ${VA.pill(q.status)}`, open ? `<button class="btn danger" data-act="cqReject" data-id="${q.id}">Rechazar</button><button class="btn primary" data-act="cqAccept" data-id="${q.id}" data-v="${q.version}">${icon('check')}Aceptar presupuesto</button>` : '', ['pagos', 'Pagos y presupuestos'])}
  ${open ? VA.notice('info', 'Revisá el detalle. Si tenés dudas, podés <button class="link" data-go="solicitar">pedir una reunión</button> antes de decidir. La propuesta vence el <b>' + fd(q.validUntil) + '</b>.', 'gold') : ''}
  ${VA.quoteDoc(q, firm)}`;
};
ACT.cqAccept = el => VA.openModal({ title: 'Aceptar presupuesto', form: 'cqAccept', body: `<input type="hidden" name="id" value="${el.dataset.id}"><input type="hidden" name="v" value="${el.dataset.v}"><p>Vas a aceptar la versión ${el.dataset.v} del presupuesto. Registramos la fecha, tu usuario y una huella del documento.</p><label class="check"><input type="checkbox" name="ok" required> <span>Leí el presupuesto completo, incluido el alcance y las condiciones.</span></label><p class="xs muted">Esta aceptación digital no constituye una firma electrónica o digital con validez legal.</p><div id="cqa-err" class="err" role="alert"></div>`, foot: `<button type="button" class="btn" data-act="closeModal">Volver</button><button class="btn primary">Aceptar</button>` });
FORM.cqAccept = (d, form) => { if (d.ok !== 'on') { form.querySelector('#cqa-err').textContent = 'Confirmá que leíste el presupuesto.'; return; } try { A().quoteAction(d.id, 'accept', { version: +d.v }); S.modal = null; VA.toast('Gracias. Registramos tu aceptación; el estudio te contactará para los próximos pasos.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#cqa-err').textContent = e.message; } };
ACT.cqReject = el => VA.openModal({ title: 'Rechazar presupuesto', form: 'cqReject', body: `<input type="hidden" name="id" value="${el.dataset.id}"><label class="field"><span>¿Querés contarnos el motivo? (opcional)</span><textarea class="in" name="reason"></textarea></label>`, foot: `<button type="button" class="btn" data-act="closeModal">Volver</button><button class="btn danger">Rechazar</button>` });
FORM.cqReject = d => { S.modal = null; VA.run(() => A().quoteAction(d.id, 'reject', { reason: d.reason }), 'Registramos tu respuesta.'); };

/* ── MIS DATOS ── */
V.datos = () => {
  if (S.me.role !== 'client') return VA.notFound();
  const c = A().client(S.me.clientId); const r = c.required;
  const req = k => r[k] ? ' <span class="hint">· obligatorio</span>' : '';
  const verText = { 'No verificado': 'Todavía no verificamos tu identidad. El estudio te va a pedir un documento cuando sea necesario para tu caso.', 'En revisión': 'Estamos revisando la documentación de identidad que aportaste.', 'Verificado manualmente': 'El estudio verificó tu identidad el ' + fd(c.verifiedAt) + '.' }[c.verification];
  return `${VA.pageH('Mis datos', 'Información personal protegida. Solo la ve el personal autorizado del estudio.')}
  <div class="split"><form class="panel" data-form="myData" novalidate><div class="panel-h"><h2>Identificación</h2></div><div class="panel-b form-grid">
    <label class="field"><span>Nombre completo</span><input class="in" value="${esc(c.name)}" readonly><span class="hint">Para cambiarlo, escribinos.</span></label>
    <label class="field"><span>Correo electrónico</span><input class="in" value="${esc(c.email)}" readonly></label>
    <label class="field"><span>Teléfono${req('phone')}</span><input class="in" name="phone" value="${esc(c.phone)}"></label>
    <label class="field"><span>Domicilio${req('address')}</span><input class="in" name="address" value="${esc(c.address)}"></label>
    <label class="field"><span>Tipo de documento${req('docType')}</span><select class="in" name="docType">${VA.opts(['DNI', 'Pasaporte', 'Cédula', 'Otro'], c.docType, 'Elegí')}</select></label>
    <label class="field"><span>Número de documento${req('docNumber')}</span><input class="in" name="docNumber" value="${esc(c.docNumber)}"></label>
    <label class="field"><span>País de emisión${req('country')}</span><input class="in" name="country" value="${esc(c.country)}"></label>
    <label class="field"><span>Fecha de nacimiento${req('birthDate')}</span><input class="in" type="date" name="birthDate" value="${esc(c.birthDate)}"></label>
    <label class="field"><span>Medio de contacto preferido</span><select class="in" name="contactPref">${VA.opts(['Correo electrónico', 'Teléfono', 'WhatsApp'], c.contactPref)}</select></label>
    <div class="full stack"><p class="xs muted">Si modificás el tipo o el número de documento, la verificación vuelve a quedar en revisión.</p><div id="md-err" class="err" role="alert"></div><button class="btn primary" type="submit" style="align-self:flex-start">Guardar cambios</button></div>
  </div></form>
  <div class="stack lg">
    <section class="panel"><div class="panel-h"><h3>Verificación de identidad</h3></div><div class="panel-b stack">${VA.pill(c.verification)}<p class="small" style="color:var(--ink-2)">${verText}</p>${c.identityDocs.length ? `<ul class="list tight" style="border-top:1px solid var(--line)">${c.identityDocs.map(d => `<li>${icon('file')}<span class="grow small">${esc(d.name)}</span>${VA.pill(d.status)}</li>`).join('')}</ul>` : ''}<button class="btn sm" data-act="cUpload" data-cat="Identificación personal" style="align-self:flex-start">${icon('upload')}Aportar documento de identidad</button></div></section>
    <section class="panel"><div class="panel-h"><h3>Avisos</h3></div><div class="panel-b stack"><label class="check"><input type="checkbox" checked disabled> <span>En el portal <span class="muted small">(siempre)</span></span></label><label class="check"><input type="checkbox" data-change="prefEmail"${S.me.notifPrefs && S.me.notifPrefs.email ? ' checked' : ''}> <span>Copia por correo electrónico</span></label></div></section>
    <section class="panel"><div class="panel-h"><h3>Seguridad</h3></div><div class="panel-b stack small"><p>Tu sesión se cierra sola tras 30 minutos sin actividad.</p><p class="muted">El cambio de contraseña se habilita con el proveedor de correo configurado (pendiente en la demo).</p></div></section>
  </div></div>`;
};
FORM.myData = (d, form) => { try { A().updateIdentity(S.me.clientId, d); VA.toast('Datos guardados.', 'ok'); VA.refresh(); } catch (e) { form.querySelector('#md-err').textContent = e.message; } };
})();
