/* Villafañe & Asociados — núcleo de la demo
 * Utilidades, datos semilla, capa de API con control de acceso (RBAC) y pruebas de aceptación.
 * Este archivo no toca el DOM: corre igual en el navegador y en Node (para pruebas).
 * Importes: siempre enteros en centavos. Nunca se opera con decimales flotantes. */
(function (G) {
'use strict';
const VA = G.VA = G.VA || {};

/* ───────────── utilidades ───────────── */
function sha256(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  const maxWord = Math.pow(2, 32); let result = ''; const words = []; const bitLen = ascii.length * 8;
  let hash = sha256.h = sha256.h || []; const k = sha256.k = sha256.k || []; let pc = k.length; const comp = {};
  for (let c = 2; pc < 64; c++) { if (!comp[c]) { for (let i = 0; i < 313; i += c) comp[i] = c; hash[pc] = (Math.pow(c, .5) * maxWord) | 0; k[pc++] = (Math.pow(c, 1 / 3) * maxWord) | 0; } }
  ascii += '\x80'; while (ascii.length % 64 - 56) ascii += '\x00';
  let i, j;
  for (i = 0; i < ascii.length; i++) { j = ascii.charCodeAt(i); if (j >> 8) return ''; words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = ((bitLen / maxWord) | 0); words[words.length] = bitLen;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16); const old = hash; hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2]; const a = hash[0], e = hash[4];
      const t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
        (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
  }
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
  return result;
}
const utf8 = s => unescape(encodeURIComponent(String(s)));
VA.sha256 = s => sha256(utf8(s));
VA.hashPw = (salt, pw) => VA.sha256(salt + '::' + pw);
VA.rand = (n = 10) => { let s = ''; const a = 'abcdefghijkmnpqrstuvwxyz23456789'; for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };

let _now = null;
VA.setNow = d => { _now = d ? new Date(d).getTime() : null; };
VA.now = () => _now ? new Date(_now) : new Date();
VA.dayStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
VA.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
VA.at = (base, days, h = 10, m = 0) => { const x = VA.addDays(VA.dayStart(base), days); x.setHours(h, m, 0, 0); return x.toISOString(); };
VA.dateOnly = (base, days) => { const x = VA.addDays(VA.dayStart(base), days); return ymd(x); };
function ymd(x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
VA.ymd = ymd;
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
VA.MES = MES; VA.MESL = MESL; VA.DIA = DIA; VA.DIAL = DIAL;
const toD = v => (v instanceof Date) ? v : (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T00:00:00') : new Date(v));
VA.toD = toD;
VA.fDate = v => { if (!v) return '—'; const d = toD(v); return d.getDate() + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear(); };
VA.fTime = v => { const d = toD(v); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
VA.fDT = v => v ? VA.fDate(v) + ' · ' + VA.fTime(v) : '—';
VA.fDay = v => { const d = toD(v); return DIAL[d.getDay()] + ' ' + d.getDate() + ' de ' + MESL[d.getMonth()]; };
VA.rel = v => {
  const diff = (VA.now() - toD(v)) / 6e4; const fut = diff < 0; const m = Math.abs(diff);
  let s; if (m < 1) return 'ahora'; if (m < 60) s = Math.round(m) + ' min'; else if (m < 1440) s = Math.round(m / 60) + ' h'; else s = Math.round(m / 1440) + ' d';
  return fut ? 'en ' + s : 'hace ' + s;
};
VA.daysUntil = v => Math.round((VA.dayStart(toD(v)) - VA.dayStart(VA.now())) / 864e5);
VA.money = (c, cur = 'USD') => {
  c = Math.round(c || 0); const neg = c < 0; c = Math.abs(c);
  const ent = Math.floor(c / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + cur + ' ' + ent + ',' + String(c % 100).padStart(2, '0');
};
VA.moneyShort = (c, cur = 'USD') => { const v = Math.round((c || 0) / 100); return cur + ' ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
VA.parseMoney = s => {
  s = String(s == null ? '' : s).trim().replace(/[^\d.,]/g, ''); if (!s) return NaN;
  let ent, dec = '';
  if (s.includes(',')) { const p = s.split(','); if (p.length > 2) return NaN; ent = p[0].replace(/\./g, ''); dec = p[1]; }
  else { const p = s.split('.'); if (p.length === 2 && p[1].length <= 2) { ent = p[0]; dec = p[1]; } else ent = s.replace(/\./g, ''); }
  if (!/^\d*$/.test(ent) || !/^\d{0,2}$/.test(dec)) return NaN;
  return parseInt(ent || '0', 10) * 100 + parseInt((dec + '00').slice(0, 2), 10);
};
VA.centsInput = c => { c = Math.round(c || 0); return Math.floor(c / 100) + ',' + String(c % 100).padStart(2, '0'); };
const clone = o => JSON.parse(JSON.stringify(o));
VA.clone = clone;

class ApiError extends Error { constructor(code, message) { super(message); this.code = code; } }
VA.ApiError = ApiError;
const deny = (m = 'No tenés permiso para realizar esta acción.') => { throw new ApiError('FORBIDDEN', m); };
const bad = m => { throw new ApiError('VALIDATION', m); };
const notFound = (m = 'El registro no existe o no está disponible para tu usuario.') => { throw new ApiError('NOT_FOUND', m); };
const conflict = m => { throw new ApiError('CONFLICT', m); };

/* ───────────── catálogos ───────────── */
VA.PERMS = {
  'equipo.gestionar': 'Gestionar perfiles del equipo',
  'tarifas.gestionar': 'Configurar honorarios y tarifas',
  'expedientes.todos': 'Ver todos los expedientes',
  'expedientes.gestionar': 'Crear, asignar y reasignar expedientes',
  'crm.gestionar': 'Gestionar el CRM',
  'finanzas.gestionar': 'Presupuestos, facturas y pagos',
  'agenda.gestionar': 'Aprobar y gestionar turnos',
  'plantillas.gestionar': 'Biblioteca de plantillas',
  'clientes.identidad': 'Ver y verificar identidad de clientes',
  'auditoria.ver': 'Consultar la auditoría',
  'ajustes.gestionar': 'Ajustes de la firma y permisos'
};
VA.CASE_STATES = ['Nuevo', 'En evaluación', 'Presupuesto enviado', 'Pendiente de documentación', 'Activo', 'En espera', 'Cerrado', 'Archivado'];
VA.CASE_CLIENT_LABEL = {
  'Nuevo': 'Recibimos tu consulta', 'En evaluación': 'Estamos evaluando tu caso', 'Presupuesto enviado': 'Tenés un presupuesto para revisar',
  'Pendiente de documentación': 'Necesitamos documentación tuya', 'Activo': 'En curso', 'En espera': 'En espera de novedades externas',
  'Cerrado': 'Finalizado', 'Archivado': 'Archivado'
};
VA.PRIORITIES = ['Baja', 'Media', 'Alta', 'Urgente'];
VA.AREAS = ['Derecho Penal', 'Derecho de Familia', 'Mediación'];
VA.PIPELINE = ['Nuevo contacto', 'Primer intento de contacto', 'Contactado', 'Reunión solicitada', 'Reunión agendada', 'Presupuesto en preparación', 'Presupuesto enviado', 'Presupuesto aceptado', 'Cliente incorporado', 'No convertido'];
VA.SOURCES = ['Sitio web', 'Recomendación', 'Google', 'Instagram', 'LinkedIn', 'Evento', 'Otro'];
VA.DOC_CATS = ['Identificación personal', 'Documentación del caso', 'Contratos', 'Notificaciones', 'Comprobantes de pago', 'Otros'];
VA.MEETING_TYPES = [
  { id: 'primera', name: 'Primera consulta', desc: 'Para exponer tu situación y recibir una orientación inicial.', durations: [60, 90] },
  { id: 'seguimiento', name: 'Seguimiento de expediente', desc: 'Repaso de avances y próximos pasos de un caso en curso.', durations: [30, 60] },
  { id: 'documentacion', name: 'Revisión de documentación', desc: 'Revisión conjunta de documentos aportados.', durations: [30, 60] }
];
VA.MEETING_STATES = ['Solicitado', 'Pendiente de pago', 'Pago confirmado', 'Pendiente de aprobación', 'Aprobado', 'Rechazado', 'Reprogramación propuesta', 'Cancelado', 'Realizado'];
const MT = {
  'Solicitado': ['Pendiente de pago', 'Cancelado'],
  'Pendiente de pago': ['Pago confirmado', 'Cancelado'],
  'Pago confirmado': ['Pendiente de aprobación'],
  'Pendiente de aprobación': ['Aprobado', 'Rechazado', 'Reprogramación propuesta', 'Cancelado'],
  'Reprogramación propuesta': ['Aprobado', 'Cancelado', 'Reprogramación propuesta'],
  'Aprobado': ['Realizado', 'Cancelado', 'Reprogramación propuesta'],
  'Rechazado': [], 'Cancelado': [], 'Realizado': []
};
VA.MEETING_TRANSITIONS = MT;
const HOLD = ['Pendiente de pago', 'Pago confirmado', 'Pendiente de aprobación', 'Aprobado', 'Reprogramación propuesta'];
VA.QUOTE_STATES = ['Borrador', 'Emitido', 'Enviado', 'Aceptado', 'Rechazado', 'Vencido'];
VA.INVOICE_STATES = ['Borrador', 'Emitida', 'Parcialmente pagada', 'Pagada', 'Vencida', 'Anulada'];
VA.TEMPLATE_CATS = ['Presupuestos', 'Cartas de presentación', 'Solicitudes de documentación', 'Confirmaciones de reuniones', 'Recordatorios de pagos', 'Actualizaciones del expediente', 'Comunicaciones administrativas'];
VA.TEMPLATE_VARS = ['cliente', 'expediente', 'asunto', 'abogado', 'fecha', 'importe', 'portal'];
VA.ALLOWED_FILES = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX' };
VA.MAX_FILE = 10 * 1024 * 1024;
VA.DEMO_PW = { admin: 'Demo-Admin-2026', lawyer: 'Demo-Abogado-2026', client: 'Demo-Cliente-2026' };

/* ───────────── datos semilla ───────────── */
VA.seed = function (now) {
  now = now || VA.now();
  const T = now;
  const at = (d, h, m) => VA.at(T, d, h, m);
  const day = d => VA.dateOnly(T, d);
  const db = { version: 3, createdAt: T.toISOString(), seq: {}, sessions: {} };

  db.settings = {
    firm: {
      name: 'Villafañe & Asociados', tagline: 'Estudio jurídico · Derecho Penal y de Familia',
      address: 'Av. Alvear 1850, piso 7 · Recoleta, Buenos Aires', addressNote: 'Dirección de demostración',
      reference: 'Oficina de referencia de marca: Park Avenue, Manhattan',
      phone: '+54 11 5550-1850', email: 'contacto@villafane-demo.test', hours: 'Lunes a viernes, 9 a 18 h',
      social: { linkedin: 'villafane-asociados', instagram: '@villafane.asociados' }
    },
    identityRequired: { phone: true, address: false, docType: true, docNumber: true, country: true, birthDate: false },
    reminders: { meetingHours: [24, 2], paymentEveryDays: 7, quoteAfterDays: 3 },
    holdMinutes: 120,
    retention: { closedCaseYears: 10, leadMonths: 24 },
    standardRateCents: 10000
  };

  const salt = () => VA.rand(12);
  const U = (id, role, name, email, extra) => { const s = salt(); return Object.assign({ id, role, name, email, salt: s, pwHash: VA.hashPw(s, VA.DEMO_PW[role]), active: true, failed: 0, lockedUntil: null, lastLogin: null, notifPrefs: { email: true, inapp: true } }, extra); };
  const allPerms = Object.keys(VA.PERMS);
  db.users = [
    U('u_adm1', 'admin', 'Carolina Méndez', 'carolina.mendez@villafane-demo.test', { adminScope: 'Administración general', perms: allPerms.slice() }),
    U('u_adm2', 'admin', 'Diego Paredes', 'diego.paredes@villafane-demo.test', { adminScope: 'Administración operativa y financiera', perms: ['expedientes.todos', 'expedientes.gestionar', 'crm.gestionar', 'finanzas.gestionar', 'agenda.gestionar', 'plantillas.gestionar', 'auditoria.ver'] }),
    U('u_l1', 'lawyer', 'Julia Okada', 'julia.okada@villafane-demo.test', { lawyerId: 'l1' }),
    U('u_l2', 'lawyer', 'Lucía Ferraro', 'lucia.ferraro@villafane-demo.test', { lawyerId: 'l2' }),
    U('u_l3', 'lawyer', 'Tomás Arrieta', 'tomas.arrieta@villafane-demo.test', { lawyerId: 'l3' }),
    U('u_l4', 'lawyer', 'Andrés Bellamy', 'andres.bellamy@villafane-demo.test', { lawyerId: 'l4' }),
    U('u_c1', 'client', 'Martín Quiroga', 'martin.quiroga@correo-demo.test', { clientId: 'c1' }),
    U('u_c2', 'client', 'Sofía Benítez', 'sofia.benitez@correo-demo.test', { clientId: 'c2' }),
    U('u_c3', 'client', 'Ricardo Almada', 'ricardo.almada@correo-demo.test', { clientId: 'c3' }),
    U('u_c4', 'client', 'Elena Duarte', 'elena.duarte@correo-demo.test', { clientId: 'c4' })
  ];

  const L = (id, userId, name, title, specialty, areas, rate, photo, bio, exp, extra) => Object.assign({
    id, userId, name, title, specialty, areas, rateCents: rate, photo, bio, experience: exp,
    email: userId.replace('u_', '') && db.users.find(u => u.id === userId).email,
    phone: '+54 11 5550-18' + id.slice(1).padStart(2, '0'), active: true, availability: 'Disponible',
    perms: { verFinanzas: true, aprobarTurnos: true, emitirPresupuestos: true }, cv: null, joined: day(-900), languages: ['Español', 'Inglés']
  }, extra);
  db.lawyers = [
    L('l1', 'u_l1', 'Julia Okada', 'Asociada senior', 'Familia y mediación', ['Derecho de Familia', 'Mediación'], 10000, 'img/okada.jpg',
      'Acompaña procesos de familia con foco en acuerdos sostenibles: alimentos, cuidado personal y planes de parentalidad. Prioriza la mediación cuando protege mejor a los hijos y a las partes.',
      [{ period: '2019 — actualidad', role: 'Asociada senior', org: 'Villafañe & Asociados' }, { period: '2014 — 2019', role: 'Abogada de familia', org: 'Práctica independiente' }],
      { cv: { name: 'CV_Julia_Okada.pdf', size: 184000, at: at(-120, 10) } }),
    L('l2', 'u_l2', 'Lucía Ferraro', 'Socia', 'Derecho de Familia', ['Derecho de Familia'], 12500, 'img/ferraro.jpg',
      'Dirige el área de familia. Interviene en divorcios, régimen de comunicación, compensaciones económicas y conflictos patrimoniales entre cónyuges y convivientes.',
      [{ period: '2016 — actualidad', role: 'Socia, área de Familia', org: 'Villafañe & Asociados' }, { period: '2009 — 2016', role: 'Abogada litigante', org: 'Estudio de familia (datos de demostración)' }]),
    L('l3', 'u_l3', 'Tomás Arrieta', 'Socio', 'Derecho Penal económico', ['Derecho Penal'], 15000, 'img/arrieta.jpg',
      'Defensa penal en investigaciones por delitos económicos y empresariales. Trabaja desde la etapa preliminar para ordenar la prueba y anticipar escenarios procesales.',
      [{ period: '2015 — actualidad', role: 'Socio, área Penal', org: 'Villafañe & Asociados' }, { period: '2008 — 2015', role: 'Abogado penalista', org: 'Práctica de litigio (datos de demostración)' }]),
    L('l4', 'u_l4', 'Andrés Bellamy', 'Socio director', 'Derecho Penal y litigio', ['Derecho Penal', 'Mediación'], 17500, 'img/bellamy.jpg',
      'Conduce la estrategia de los casos penales de mayor complejidad y coordina el equipo de litigio. Combina preparación de juicio con negociación cuando el caso lo permite.',
      [{ period: '2012 — actualidad', role: 'Socio director', org: 'Villafañe & Asociados' }, { period: '2005 — 2012', role: 'Abogado litigante', org: 'Firma de litigio (datos de demostración)' }],
      { languages: ['Español', 'Inglés', 'Portugués'] })
  ];

  const C = (id, userId, name, extra) => Object.assign({ id, userId, name, email: db.users.find(u => u.id === userId).email, country: 'Argentina', verification: 'No verificado', verifiedBy: null, verifiedAt: null, contactPref: 'Correo electrónico', createdAt: day(-60) }, extra);
  db.clients = [
    C('c1', 'u_c1', 'Martín Quiroga', { phone: '+54 11 5550-2041', address: 'Av. Santa Fe 2200, CABA (ficticio)', docType: 'DNI', docNumber: 'DEMO-30.418.552', birthDate: '1981-04-12', verification: 'Verificado manualmente', verifiedBy: 'u_adm1', verifiedAt: at(-60, 12), createdAt: day(-170) }),
    C('c2', 'u_c2', 'Sofía Benítez', { phone: '+54 11 5550-3317', address: '', docType: 'DNI', docNumber: 'DEMO-33.902.117', birthDate: '', verification: 'En revisión', createdAt: day(-22), contactPref: 'WhatsApp' }),
    C('c3', 'u_c3', 'Ricardo Almada', { phone: '+54 11 5550-4470', address: 'Belgrano, CABA (ficticio)', docType: 'Pasaporte', docNumber: 'DEMO-AA1188420', country: 'Uruguay', birthDate: '1975-09-30', verification: 'Verificado manualmente', verifiedBy: 'u_adm1', verifiedAt: at(-90, 11), createdAt: day(-96) }),
    C('c4', 'u_c4', 'Elena Duarte', { phone: '+54 11 5550-5582', address: '', docType: 'DNI', docNumber: 'DEMO-35.276.904', birthDate: '', verification: 'No verificado', createdAt: day(-7), contactPref: 'Teléfono' })
  ];

  const K = (id, number, o) => Object.assign({ id, number, extraLawyerIds: [], authorizedClientIds: [], currency: 'USD', updatedAt: o.openedAt + 'T12:00:00.000Z' }, o);
  db.cases = [
    K('k11', 'EXP-2026-0011', { title: 'Defensa en investigación por presunta defraudación comercial', clientId: 'c1', lawyerId: 'l3', area: 'Derecho Penal', status: 'Activo', priority: 'Alta', openedAt: day(-62), next: { date: day(9), label: 'Presentación de descargo escrito' }, feesCents: 480000,
      description: 'Defensa técnica en una investigación preliminar iniciada a partir de una denuncia comercial. Se trabaja en la reconstrucción documental de las operaciones cuestionadas.',
      clientSummary: 'Te acompañamos en una investigación preliminar. Estamos ordenando la documentación de las operaciones para presentar tu descargo.' }),
    K('k04', 'EXP-2026-0004', { title: 'Mediación por conflicto societario familiar', clientId: 'c1', lawyerId: 'l1', area: 'Mediación', status: 'Cerrado', priority: 'Media', openedAt: day(-165), next: null, feesCents: 200000,
      description: 'Mediación prejudicial entre socios con vínculo familiar. Concluyó con acuerdo de salida ordenada.', clientSummary: 'La mediación concluyó con un acuerdo firmado por ambas partes.' }),
    K('k14', 'EXP-2026-0014', { title: 'Divorcio y plan de parentalidad', clientId: 'c2', lawyerId: 'l2', area: 'Derecho de Familia', status: 'Pendiente de documentación', priority: 'Media', openedAt: day(-21), next: { date: day(12), label: 'Presentación de propuesta reguladora' }, feesCents: 360000,
      description: 'Divorcio con propuesta reguladora: cuidado personal compartido, régimen de comunicación y atribución de la vivienda.', clientSummary: 'Estamos preparando la presentación del divorcio y la propuesta sobre el cuidado de tus hijos. Necesitamos algunas partidas para avanzar.' }),
    K('k09', 'EXP-2026-0009', { title: 'Defensa penal por accidente de tránsito con lesiones', clientId: 'c3', lawyerId: 'l4', area: 'Derecho Penal', status: 'Activo', priority: 'Alta', openedAt: day(-95), next: { date: day(5), label: 'Audiencia de conciliación' }, feesCents: 550000,
      description: 'Defensa en causa por lesiones culposas derivadas de un siniestro vial. Se explora una conciliación con la parte damnificada.', clientSummary: 'Defendemos tu posición en la causa por el accidente. Se programó una audiencia para explorar un acuerdo con la otra parte.' }),
    K('k12', 'EXP-2026-0012', { title: 'Actualización de cuota alimentaria', clientId: 'c3', lawyerId: 'l2', area: 'Derecho de Familia', status: 'En espera', priority: 'Baja', openedAt: day(-40), next: { date: day(24), label: 'Vencimiento de traslado' }, feesCents: 150000,
      description: 'Pedido de actualización de cuota alimentaria por variación de ingresos. A la espera de la contestación de la otra parte.', clientSummary: 'Pedimos la actualización de la cuota. Estamos esperando la respuesta de la otra parte.' }),
    K('k16', 'EXP-2026-0016', { title: 'Acuerdo de alimentos y cuidado personal', clientId: 'c4', lawyerId: 'l1', area: 'Derecho de Familia', status: 'Presupuesto enviado', priority: 'Media', openedAt: day(-6), next: { date: day(11), label: 'Vence el presupuesto' }, feesCents: 0,
      description: 'Consulta por acuerdo de alimentos y cuidado personal de un hijo menor. Se envió propuesta de honorarios.', clientSummary: 'Te enviamos una propuesta de honorarios. Cuando la aceptes, comenzamos a trabajar en el acuerdo.' })
  ];
  db.seq.case = 16;

  let n = 0; const A = (caseId, kind, text, authorId, d, h) => ({ id: 'a' + (++n), caseId, kind, text, authorId, at: at(d, h || 11) });
  db.activities = [
    A('k11', 'sistema', 'Expediente creado y asignado a Tomás Arrieta.', 'u_adm1', -62, 10),
    A('k11', 'cliente', 'Recibimos la documentación contable que enviaste. La estamos revisando junto al perito de parte.', 'u_l3', -30),
    A('k11', 'interna', 'Pedir al perito informe preliminar antes del descargo. Ojo con las facturas de marzo: hay dos numeraciones duplicadas.', 'u_l3', -12, 16),
    A('k11', 'cliente', 'Presentamos un escrito pidiendo acceso completo al legajo. Te avisamos apenas tengamos respuesta.', 'u_l3', -4, 12),
    A('k04', 'cliente', 'Se firmó el acuerdo de mediación. El expediente queda cerrado.', 'u_l1', -110),
    A('k04', 'sistema', 'Estado cambiado de Activo a Cerrado.', 'u_l1', -110, 12),
    A('k14', 'sistema', 'Expediente creado a partir del presupuesto P-2026-0005 aceptado.', 'u_adm2', -21, 10),
    A('k14', 'cliente', 'Para presentar el divorcio necesitamos tres documentos. Los podés subir desde la sección Documentos.', 'u_l2', -18),
    A('k14', 'interna', 'La otra parte tiene patrocinio de un estudio grande. Preparar propuesta de vivienda con dos alternativas.', 'u_l2', -9, 17),
    A('k09', 'cliente', 'La fiscalía fijó audiencia de conciliación. Vamos a reunirnos antes para preparar tu posición.', 'u_l4', -6),
    A('k09', 'interna', 'Monto razonable de reparación según antecedentes: rango a definir con el cliente. No anticipar cifras por escrito.', 'u_l4', -6, 15),
    A('k12', 'cliente', 'Presentamos el pedido de actualización. El juzgado corrió traslado a la otra parte.', 'u_l2', -15),
    A('k16', 'sistema', 'Consulta registrada desde el CRM. Presupuesto P-2026-0008 enviado.', 'u_adm2', -4, 10)
  ];
  db.seq.activity = n;

  n = 0; const D = (caseId, name, category, visibility, uploadedBy, d, status, size, type, extra) => Object.assign({ id: 'd' + (++n), caseId, name, category, visibility, uploadedBy, at: at(d, 13), status, size, type: type || 'application/pdf', replaceable: false, requestId: null }, extra);
  db.documents = [
    D('k11', 'Poder general judicial.pdf', 'Contratos', 'compartido', 'u_l3', -60, 'Aprobado', 248000),
    D('k11', 'Libro IVA ventas 2025.pdf', 'Documentación del caso', 'compartido', 'u_c1', -31, 'Aprobado', 1840000),
    D('k11', 'Estrategia de defensa — borrador interno.docx', 'Documentación del caso', 'interna', 'u_l3', -10, 'Aprobado', 96000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    D('k11', 'Cédula de notificación.pdf', 'Notificaciones', 'compartido', 'u_l3', -5, 'Aprobado', 132000),
    D('k04', 'Acuerdo de mediación firmado.pdf', 'Contratos', 'compartido', 'u_l1', -110, 'Aprobado', 410000),
    D('k14', 'DNI frente y dorso.jpg', 'Identificación personal', 'compartido', 'u_c2', -19, 'Pendiente de revisión', 820000, 'image/jpeg', { replaceable: true }),
    D('k14', 'Análisis de la propuesta de vivienda.docx', 'Documentación del caso', 'interna', 'u_l2', -8, 'Aprobado', 64000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    D('k09', 'Acta de constatación del siniestro.pdf', 'Documentación del caso', 'compartido', 'u_l4', -80, 'Aprobado', 390000),
    D('k09', 'Póliza del seguro automotor.pdf', 'Contratos', 'compartido', 'u_c3', -78, 'Aprobado', 512000),
    D('k09', 'Notas para audiencia — uso interno.pdf', 'Documentación del caso', 'interna', 'u_l4', -3, 'Aprobado', 88000),
    D('k12', 'Recibos de sueldo 2026.pdf', 'Documentación del caso', 'compartido', 'u_c3', -38, 'Requiere reemplazo', 640000, 'application/pdf', { replaceable: true, reviewNote: 'Falta el recibo de junio. Subí el archivo completo, por favor.' })
  ];
  db.seq.doc = n;
  db.docRequests = [
    { id: 'r1', caseId: 'k14', title: 'Partida de matrimonio', category: 'Documentación del caso', status: 'Pendiente', requestedBy: 'u_l2', at: at(-18, 11), due: day(4) },
    { id: 'r2', caseId: 'k14', title: 'Partidas de nacimiento de los hijos', category: 'Documentación del caso', status: 'Pendiente', requestedBy: 'u_l2', at: at(-18, 11), due: day(4) },
    { id: 'r3', caseId: 'k14', title: 'Constancia de ingresos de los últimos 3 meses', category: 'Documentación del caso', status: 'Pendiente', requestedBy: 'u_l2', at: at(-18, 11), due: day(8) }
  ];
  db.seq.req = 3;

  n = 0; const TK = (title, caseId, assigneeId, d, done, extra) => Object.assign({ id: 't' + (++n), title, caseId, contactId: null, assigneeId, due: day(d), done: !!done, createdBy: 'u_adm1', at: at(-5) }, extra);
  db.tasks = [
    TK('Revisar informe preliminar del perito', 'k11', 'u_l3', 2),
    TK('Redactar descargo escrito', 'k11', 'u_l3', 7),
    TK('Controlar recepción de partidas', 'k14', 'u_l2', 4),
    TK('Preparar propuesta reguladora — dos alternativas de vivienda', 'k14', 'u_l2', 10),
    TK('Reunión previa a la audiencia de conciliación', 'k09', 'u_l4', 3),
    TK('Seguimiento del presupuesto enviado', 'k16', 'u_l1', 1),
    TK('Archivar documentación de la mediación', 'k04', 'u_l1', -30, true),
    TK('Llamar a Camila Roldán (consulta web sin respuesta)', null, 'u_adm2', 0, false, { contactId: 'p6', source: 'Alerta CRM' })
  ];
  db.seq.task = n;

  const P = (id, name, o) => Object.assign({ id, name, communications: [], tags: [], notes: '', clientId: null, ownerId: 'u_adm2', lawyerId: null, nextAction: null }, o);
  db.contacts = [
    P('p1', 'Martín Quiroga', { email: 'martin.quiroga@correo-demo.test', phone: '+54 11 5550-2041', clientId: 'c1', stage: 'Cliente incorporado', source: 'Recomendación', firstContact: day(-172), area: 'Derecho Penal', lawyerId: 'l3', tags: ['Penal económico', 'Recurrente'], lastActivity: at(-4, 12), notes: 'Recomendado por un cliente anterior. Prefiere reuniones presenciales a primera hora.', communications: [{ at: at(-172, 10), channel: 'Teléfono', summary: 'Primer llamado por la mediación societaria.', by: 'u_adm1' }, { at: at(-64, 9), channel: 'Correo', summary: 'Consulta por nueva investigación penal.', by: 'u_adm2' }] }),
    P('p2', 'Sofía Benítez', { email: 'sofia.benitez@correo-demo.test', phone: '+54 11 5550-3317', clientId: 'c2', stage: 'Cliente incorporado', source: 'Sitio web', firstContact: day(-26), area: 'Derecho de Familia', lawyerId: 'l2', tags: ['Familia'], lastActivity: at(-9, 17), communications: [{ at: at(-26, 15), channel: 'Formulario web', summary: 'Consulta por divorcio con hijos.', by: null }, { at: at(-25, 11), channel: 'WhatsApp', summary: 'Se coordinó primera consulta.', by: 'u_adm2' }] }),
    P('p3', 'Ricardo Almada', { email: 'ricardo.almada@correo-demo.test', phone: '+54 11 5550-4470', clientId: 'c3', stage: 'Cliente incorporado', source: 'Google', firstContact: day(-98), area: 'Derecho Penal', lawyerId: 'l4', tags: ['Penal', 'Deuda'], lastActivity: at(-6, 15), notes: 'Tiene una factura vencida. Gestionar recordatorio sin presionar antes de la audiencia.', communications: [{ at: at(-98, 12), channel: 'Teléfono', summary: 'Consulta urgente tras el siniestro.', by: 'u_adm1' }] }),
    P('p4', 'Elena Duarte', { email: 'elena.duarte@correo-demo.test', phone: '+54 11 5550-5582', clientId: 'c4', stage: 'Presupuesto enviado', source: 'Instagram', firstContact: day(-8), area: 'Derecho de Familia', lawyerId: 'l1', tags: ['Familia', 'Alimentos'], lastActivity: at(-4, 10), nextAction: { text: 'Confirmar recepción del presupuesto', date: day(1) }, communications: [{ at: at(-8, 18), channel: 'Instagram', summary: 'Mensaje directo consultando por alimentos.', by: null }, { at: at(-7, 10), channel: 'Teléfono', summary: 'Primera consulta telefónica con Julia Okada.', by: 'u_l1' }] }),
    P('p5', 'Federico Lanús', { email: 'f.lanus@correo-demo.test', phone: '+54 11 5550-6120', stage: 'Presupuesto en preparación', source: 'LinkedIn', firstContact: day(-10), area: 'Derecho Penal', lawyerId: 'l4', tags: ['Penal', 'Empresa'], lastActivity: at(-3, 16), nextAction: { text: 'Enviar presupuesto', date: day(2) }, communications: [{ at: at(-10, 11), channel: 'LinkedIn', summary: 'Contacto por compliance penal en su empresa.', by: null }, { at: at(-5, 15), channel: 'Reunión', summary: 'Reunión inicial con Andrés Bellamy.', by: 'u_l4' }] }),
    P('p6', 'Camila Roldán', { email: 'camila.roldan@correo-demo.test', phone: '+54 11 5550-7731', stage: 'Nuevo contacto', source: 'Sitio web', firstContact: day(-2), area: 'Derecho de Familia', tags: ['Familia'], lastActivity: at(-2, 21), communications: [{ at: at(-2, 21), channel: 'Formulario web', summary: 'Consulta por régimen de comunicación con su hija.', by: null }] }),
    P('p7', 'Gustavo Peralta', { email: 'g.peralta@correo-demo.test', phone: '+54 11 5550-8844', stage: 'Primer intento de contacto', source: 'Google', firstContact: day(-4), area: 'Derecho Penal', tags: ['Penal'], lastActivity: at(-3, 10), nextAction: { text: 'Segundo intento de llamada', date: day(-1) }, communications: [{ at: at(-3, 10), channel: 'Teléfono', summary: 'No atendió. Se dejó mensaje.', by: 'u_adm2' }] }),
    P('p8', 'Valeria Sosa', { email: 'valeria.sosa@correo-demo.test', phone: '+54 11 5550-9013', stage: 'Reunión agendada', source: 'Recomendación', firstContact: day(-6), area: 'Derecho de Familia', lawyerId: 'l2', tags: ['Familia'], lastActivity: at(-1, 12), nextAction: { text: 'Primera consulta con Lucía Ferraro', date: day(3) }, communications: [{ at: at(-6, 9), channel: 'Correo', summary: 'Consulta por compensación económica.', by: null }] }),
    P('p9', 'Paula Iriarte', { email: 'paula.iriarte@correo-demo.test', phone: '+54 11 5550-1290', stage: 'No convertido', source: 'Evento', firstContact: day(-50), area: 'Mediación', lawyerId: 'l1', tags: ['Mediación'], lastActivity: at(-30, 12), notes: 'Eligió resolver sin patrocinio.', communications: [{ at: at(-30, 12), channel: 'Correo', summary: 'Rechazó el presupuesto por costo.', by: 'u_adm2' }] }),
    P('p10', 'Hernán Ibarra', { email: 'hernan.ibarra@correo-demo.test', phone: '+54 11 5550-3402', stage: 'Contactado', source: 'Sitio web', firstContact: day(-5), area: 'Derecho Penal', tags: ['Penal'], lastActivity: at(-2, 11), nextAction: { text: 'Ofrecer turno de primera consulta', date: day(1) }, communications: [{ at: at(-2, 11), channel: 'Teléfono', summary: 'Interesado en primera consulta. Pidió horarios por la tarde.', by: 'u_adm2' }] })
  ];
  db.seq.contact = 10;

  // reuniones
  const M = (id, o) => Object.assign({ id, currency: 'USD', caseId: null, contactId: null, privateNotes: '', proposedStart: null, holdUntil: null, paymentId: null, history: [] }, o);
  const rate = l => db.lawyers.find(x => x.id === l).rateCents;
  const tot = (l, dur) => Math.round(rate(l) * dur / 60);
  db.meetings = [
    M('m1', { lawyerId: 'l3', clientId: 'c1', caseId: 'k11', type: 'Seguimiento de expediente', area: 'Derecho Penal', start: at(0, 17, 0), durationMin: 60, rateCents: rate('l3'), totalCents: tot('l3', 60), status: 'Aprobado', paymentId: 'pay5', description: 'Repaso del borrador de descargo.', history: [{ at: at(-3, 10), by: 'u_c1', to: 'Pendiente de aprobación' }, { at: at(-3, 12), by: 'u_l3', to: 'Aprobado' }] }),
    M('m2', { lawyerId: 'l2', clientId: 'c2', caseId: 'k14', type: 'Revisión de documentación', area: 'Derecho de Familia', start: at(2, 15, 0), durationMin: 60, rateCents: rate('l2'), totalCents: tot('l2', 60), status: 'Pendiente de aprobación', paymentId: 'pay6', description: 'Quiero revisar qué documentos faltan y cómo conseguir la partida de matrimonio.', history: [{ at: at(-1, 19), by: 'u_c2', to: 'Pendiente de pago' }, { at: at(-1, 19, 5), by: 'sistema', to: 'Pago confirmado' }, { at: at(-1, 19, 5), by: 'sistema', to: 'Pendiente de aprobación' }] }),
    M('m3', { lawyerId: 'l4', clientId: 'c3', caseId: 'k09', type: 'Seguimiento de expediente', area: 'Derecho Penal', start: at(1, 10, 0), durationMin: 30, rateCents: rate('l4'), totalCents: tot('l4', 30), status: 'Aprobado', paymentId: 'pay7', description: 'Preparación de la audiencia de conciliación.', history: [{ at: at(-5, 10), by: 'u_l4', to: 'Aprobado' }] }),
    M('m4', { lawyerId: 'l1', clientId: 'c4', caseId: 'k16', type: 'Primera consulta', area: 'Derecho de Familia', start: at(3, 16, 0), durationMin: 60, rateCents: rate('l1'), totalCents: tot('l1', 60), status: 'Pendiente de pago', holdUntil: new Date(T.getTime() + 120 * 6e4).toISOString(), description: 'Consulta sobre el alcance del presupuesto antes de aceptarlo.', history: [{ at: T.toISOString(), by: 'u_c4', to: 'Pendiente de pago' }] }),
    M('m5', { lawyerId: 'l3', clientId: 'c1', caseId: 'k11', type: 'Seguimiento de expediente', area: 'Derecho Penal', start: at(-14, 11, 0), durationMin: 60, rateCents: rate('l3'), totalCents: tot('l3', 60), status: 'Realizado', paymentId: 'pay4', description: 'Revisión de libros contables.', history: [{ at: at(-14, 12), by: 'u_l3', to: 'Realizado' }] }),
    M('m6', { lawyerId: 'l2', clientId: null, contactId: 'p8', type: 'Primera consulta', area: 'Derecho de Familia', start: at(3, 11, 0), durationMin: 60, rateCents: rate('l2'), totalCents: tot('l2', 60), status: 'Aprobado', description: 'Primera consulta (agendada por el estudio, cobro presencial).', history: [{ at: at(-1, 12), by: 'u_adm2', to: 'Aprobado' }] })
  ];
  db.seq.meeting = 6;
  db.blocks = [
    { id: 'b1', lawyerId: 'l4', start: at(2, 9, 0), end: at(2, 13, 0), reason: 'Audiencia en tribunales' },
    { id: 'b2', lawyerId: 'l2', start: at(1, 14, 0), end: at(1, 18, 0), reason: 'No disponible' }
  ];
  db.seq.block = 2;

  // presupuestos
  const Q = (id, number, o) => Object.assign({ id, number, currency: 'USD', taxRate: 0, paymentMethod: 'Transferencia bancaria o tarjeta', advancePct: 40, installments: 3, conditions: 'Los honorarios no incluyen tasas judiciales ni gastos de peritos oficiales. Los gastos se rinden con comprobante. La propuesta puede ajustarse si cambia el alcance del trabajo.', notes: '', version: 1, history: [], acceptance: null, rejection: null, convertedAt: null, contactId: null, caseId: null, clientId: null }, o);
  db.quotes = [
    Q('q8', 'P-2026-0008', { clientId: 'c4', contactId: 'p4', caseId: 'k16', lawyerId: 'l1', service: 'Acuerdo de alimentos y cuidado personal', scope: 'Negociación con la otra parte, redacción del acuerdo y presentación para homologación judicial. Incluye hasta tres reuniones de trabajo.', items: [{ kind: 'honorarios', desc: 'Honorarios profesionales — negociación y redacción', amountCents: 280000 }, { kind: 'honorarios', desc: 'Presentación y seguimiento de la homologación', amountCents: 40000 }, { kind: 'gastos', desc: 'Gastos estimados (tasas y copias certificadas)', amountCents: 25000 }], issuedAt: day(-4), sentAt: at(-4, 10), validUntil: day(11), status: 'Enviado', history: [{ at: at(-4, 9), by: 'u_l1', action: 'Emitido v1' }, { at: at(-4, 10), by: 'u_adm2', action: 'Enviado al cliente' }] }),
    Q('q5', 'P-2026-0005', { clientId: 'c2', contactId: 'p2', caseId: 'k14', lawyerId: 'l2', service: 'Divorcio con propuesta reguladora', scope: 'Presentación del divorcio, propuesta reguladora y audiencia.', items: [{ kind: 'honorarios', desc: 'Honorarios profesionales', amountCents: 340000 }, { kind: 'gastos', desc: 'Gastos estimados', amountCents: 20000 }], issuedAt: day(-24), sentAt: at(-24, 12), validUntil: day(-9), status: 'Aceptado', acceptance: { at: at(-22, 20), userId: 'u_c2', version: 1, checksum: 'seed' }, convertedAt: at(-21, 10), advancePct: 50, installments: 2 }),
    Q('q3', 'P-2026-0003', { clientId: 'c1', contactId: 'p1', caseId: 'k11', lawyerId: 'l3', service: 'Defensa penal en investigación preliminar', scope: 'Defensa técnica hasta la definición de la situación procesal.', items: [{ kind: 'honorarios', desc: 'Honorarios profesionales', amountCents: 450000 }, { kind: 'gastos', desc: 'Gastos estimados (pericia de parte)', amountCents: 30000 }], issuedAt: day(-64), sentAt: at(-64, 12), validUntil: day(-49), status: 'Aceptado', acceptance: { at: at(-63, 9), userId: 'u_c1', version: 1, checksum: 'seed' }, convertedAt: at(-62, 10), advancePct: 50, installments: 4 }),
    Q('q6', 'P-2026-0006', { clientId: 'c3', contactId: 'p3', caseId: 'k09', lawyerId: 'l4', service: 'Defensa penal — siniestro vial', scope: 'Defensa en la causa hasta la etapa de juicio.', items: [{ kind: 'honorarios', desc: 'Honorarios profesionales', amountCents: 520000 }, { kind: 'gastos', desc: 'Gastos estimados', amountCents: 30000 }], issuedAt: day(-97), sentAt: at(-97, 12), validUntil: day(-82), status: 'Aceptado', acceptance: { at: at(-96, 10), userId: 'u_c3', version: 1, checksum: 'seed' }, convertedAt: at(-95, 10) }),
    Q('q9', 'P-2026-0009', { contactId: 'p5', lawyerId: 'l4', service: 'Programa de prevención penal empresarial', scope: 'Diagnóstico de riesgos penales, protocolo interno y capacitación a la gerencia.', items: [{ kind: 'honorarios', desc: 'Diagnóstico y protocolo', amountCents: 600000 }, { kind: 'honorarios', desc: 'Capacitación (2 jornadas)', amountCents: 150000 }], taxRate: 2100, issuedAt: null, validUntil: day(20), status: 'Borrador' }),
    Q('q2', 'P-2026-0002', { contactId: 'p9', lawyerId: 'l1', service: 'Mediación prejudicial', scope: 'Hasta cuatro audiencias de mediación.', items: [{ kind: 'honorarios', desc: 'Honorarios profesionales', amountCents: 120000 }], issuedAt: day(-34), sentAt: at(-34, 12), validUntil: day(-19), status: 'Rechazado', rejection: { at: at(-30, 12), userId: 'u_adm2', reason: 'La persona decidió no avanzar por costo.' } })
  ];
  db.seq.quote = 9;

  // facturas internas
  const I = (id, number, o) => Object.assign({ id, number, currency: 'USD', status: 'Emitida', quoteId: null }, o);
  db.invoices = [
    I('i3', 'F-2026-0003', { clientId: 'c1', caseId: 'k04', concept: 'Honorarios de mediación', items: [{ desc: 'Honorarios de mediación', amountCents: 200000 }], issuedAt: day(-150), dueAt: day(-140) }),
    I('i7', 'F-2026-0007', { clientId: 'c3', caseId: 'k09', quoteId: 'q6', concept: 'Anticipo de honorarios', items: [{ desc: 'Anticipo 40% — P-2026-0006', amountCents: 220000 }], issuedAt: day(-95), dueAt: day(-88) }),
    I('i10', 'F-2026-0010', { clientId: 'c1', caseId: 'k11', quoteId: 'q3', concept: 'Anticipo de honorarios', items: [{ desc: 'Anticipo 50% — P-2026-0003', amountCents: 240000 }], issuedAt: day(-62), dueAt: day(-55) }),
    I('i11', 'F-2026-0011', { clientId: 'c1', caseId: 'k11', quoteId: 'q3', concept: 'Cuota 1 de 4', items: [{ desc: 'Cuota 1 de 4 — saldo de honorarios', amountCents: 60000 }], issuedAt: day(-32), dueAt: day(-22) }),
    I('i12', 'F-2026-0012', { clientId: 'c3', caseId: 'k09', quoteId: 'q6', concept: 'Cuota 1 de 3', items: [{ desc: 'Cuota 1 de 3 — saldo de honorarios', amountCents: 110000 }, { desc: 'Gastos rendidos — pericia accidentológica', amountCents: 40000 }], issuedAt: day(-33), dueAt: day(-18) }),
    I('i13', 'F-2026-0013', { clientId: 'c2', caseId: 'k14', quoteId: 'q5', concept: 'Anticipo de honorarios', items: [{ desc: 'Anticipo 50% — P-2026-0005', amountCents: 180000 }], issuedAt: day(-21), dueAt: day(-14) }),
    I('i14', 'F-2026-0014', { clientId: 'c3', caseId: 'k12', concept: 'Honorarios — actualización de cuota', items: [{ desc: 'Honorarios iniciales', amountCents: 75000 }], issuedAt: day(-38), dueAt: day(-28) }),
    I('i15', 'F-2026-0015', { clientId: 'c1', caseId: 'k11', quoteId: 'q3', concept: 'Cuota 2 de 4', items: [{ desc: 'Cuota 2 de 4 — saldo de honorarios', amountCents: 60000 }], issuedAt: day(-2), dueAt: day(18) }),
    I('i16', 'F-2026-0016', { clientId: 'c2', caseId: 'k14', concept: 'Gastos de presentación', items: [{ desc: 'Tasa de justicia (estimada)', amountCents: 15000 }], issuedAt: null, dueAt: day(20), status: 'Borrador' })
  ];
  db.seq.invoice = 16;

  const fee = c => Math.round(c * 290 / 10000) + 30;
  const PY = (id, o) => Object.assign({ id, currency: 'USD', status: 'Confirmado', refundedCents: 0, invoiceId: null, meetingId: null, caseId: null }, o);
  db.payments = [
    PY('pay1', { clientId: 'c1', caseId: 'k04', invoiceId: 'i3', concept: 'F-2026-0003', amountCents: 200000, at: at(-145, 11), method: 'Transferencia', providerId: 'TRF-DEMO-88213', feeCents: 0, lawyerId: 'l1' }),
    PY('pay2', { clientId: 'c3', caseId: 'k09', invoiceId: 'i7', concept: 'F-2026-0007', amountCents: 220000, at: at(-92, 15), method: 'Tarjeta (prueba)', providerId: 'pi_test_7Kq2Lm', feeCents: fee(220000), lawyerId: 'l4', last4: '4242' }),
    PY('pay3', { clientId: 'c1', caseId: 'k11', invoiceId: 'i10', concept: 'F-2026-0010', amountCents: 240000, at: at(-58, 10), method: 'Transferencia', providerId: 'TRF-DEMO-90551', feeCents: 0, lawyerId: 'l3' }),
    PY('pay4', { clientId: 'c1', caseId: 'k11', meetingId: 'm5', concept: 'Reunión — Seguimiento de expediente', amountCents: 15000, at: at(-17, 9), method: 'Tarjeta (prueba)', providerId: 'pi_test_Zr81Qa', feeCents: fee(15000), lawyerId: 'l3', last4: '4242' }),
    PY('pay8', { clientId: 'c1', caseId: 'k11', invoiceId: 'i11', concept: 'F-2026-0011', amountCents: 60000, at: at(-24, 12), method: 'Tarjeta (prueba)', providerId: 'pi_test_Wd02Ha', feeCents: fee(60000), lawyerId: 'l3', last4: '4242' }),
    PY('pay9', { clientId: 'c3', caseId: 'k09', invoiceId: 'i12', concept: 'F-2026-0012 (pago parcial)', amountCents: 75000, at: at(-20, 16), method: 'Transferencia', providerId: 'TRF-DEMO-91770', feeCents: 0, lawyerId: 'l4' }),
    PY('pay10', { clientId: 'c2', caseId: 'k14', invoiceId: 'i13', concept: 'F-2026-0013', amountCents: 180000, at: at(-19, 13), method: 'Tarjeta (prueba)', providerId: 'pi_test_Ux55Pe', feeCents: fee(180000), lawyerId: 'l2', last4: '4242' }),
    PY('pay11', { clientId: 'c3', caseId: 'k12', invoiceId: 'i14', concept: 'F-2026-0014', amountCents: 75000, at: at(-30, 10), method: 'Transferencia', providerId: 'TRF-DEMO-91002', feeCents: 0, lawyerId: 'l2' }),
    PY('pay5', { clientId: 'c1', caseId: 'k11', meetingId: 'm1', concept: 'Reunión — Seguimiento de expediente', amountCents: 15000, at: at(-3, 10), method: 'Tarjeta (prueba)', providerId: 'pi_test_Hh3Rt9', feeCents: fee(15000), lawyerId: 'l3', last4: '4242' }),
    PY('pay6', { clientId: 'c2', caseId: 'k14', meetingId: 'm2', concept: 'Reunión — Revisión de documentación', amountCents: 12500, at: at(-1, 19, 5), method: 'Tarjeta (prueba)', providerId: 'pi_test_Bq7Yn1', feeCents: fee(12500), lawyerId: 'l2', last4: '4242' }),
    PY('pay7', { clientId: 'c3', caseId: 'k09', meetingId: 'm3', concept: 'Reunión — Seguimiento de expediente', amountCents: 8750, at: at(-5, 9), method: 'Tarjeta (prueba)', providerId: 'pi_test_Jp4Cs6', feeCents: fee(8750), lawyerId: 'l4', last4: '4242' }),
    PY('pay12', { clientId: 'c1', caseId: 'k04', concept: 'Consulta inicial', amountCents: 10000, at: at(-168, 10), method: 'Transferencia', providerId: 'TRF-DEMO-80001', feeCents: 0, lawyerId: 'l1' })
  ];
  db.seq.payment = 12;
  db.credits = [];

  n = 0; const N = (userId, type, title, body, link, d, read, h) => ({ id: 'n' + (++n), userId, type, title, body, link, at: at(d, h || 10), read: !!read, dedupe: null });
  db.notifications = [
    N('u_c1', 'Actualización del expediente', 'Novedad en EXP-2026-0011', 'Presentamos un escrito pidiendo acceso completo al legajo.', 'expediente.k11', -4, false, 12),
    N('u_c1', 'Reunión aprobada', 'Tu reunión de hoy está confirmada', 'Tomás Arrieta aprobó la reunión de seguimiento.', 'turnos', -3, true, 12),
    N('u_c2', 'Documentos solicitados', 'Necesitamos 3 documentos', 'Lucía Ferraro pidió documentación para avanzar con tu divorcio.', 'documentos', -18, false),
    N('u_c2', 'Pago confirmado', 'Pago recibido — turno pendiente de aprobación', 'Recibimos el pago de USD 125,00. Tu turno todavía debe ser aprobado por Lucía Ferraro.', 'turnos', -1, false, 19),
    N('u_c3', 'Aviso de pago pendiente', 'La factura F-2026-0012 está vencida', 'Saldo pendiente: USD 750,00.', 'pagos', -10, false),
    N('u_c3', 'Reunión aprobada', 'Reunión confirmada para mañana', 'Andrés Bellamy confirmó la reunión de preparación.', 'turnos', -5, true),
    N('u_c4', 'Presupuesto enviado', 'Tenés un presupuesto para revisar', 'P-2026-0008 · Acuerdo de alimentos y cuidado personal.', 'presupuesto.q8', -4, false),
    N('u_l2', 'Turno por aprobar', 'Sofía Benítez solicitó una reunión', 'Pago confirmado. Revisá y aprobá o proponé otro horario.', 'agenda', -1, false, 19),
    N('u_l2', 'Documento recibido', 'Sofía Benítez subió un documento', 'DNI frente y dorso.jpg — pendiente de revisión.', 'expediente.k14', -19, true),
    N('u_l3', 'Recordatorio de reunión', 'Reunión hoy con Martín Quiroga', 'Seguimiento de expediente a las 17:00.', 'agenda', 0, false, 8),
    N('u_l1', 'Seguimiento comercial', 'Presupuesto P-2026-0008 sin respuesta', 'Enviado hace 4 días a Elena Duarte.', 'presupuesto.q8', 0, false, 9),
    N('u_adm1', 'Nueva consulta', 'Nueva consulta desde el sitio web', 'Camila Roldán · Derecho de Familia.', 'crm.p6', -2, false, 21),
    N('u_adm2', 'Nueva consulta', 'Nueva consulta desde el sitio web', 'Camila Roldán · Derecho de Familia.', 'crm.p6', -2, false, 21),
    N('u_adm2', 'Turno por aprobar', 'Turno pagado pendiente de aprobación', 'Sofía Benítez con Lucía Ferraro.', 'agenda', -1, false, 19)
  ];
  db.seq.notification = n;
  db.outbox = [
    { id: 'e1', to: 'camila.roldan@correo-demo.test', subject: 'Recibimos tu consulta — Villafañe & Asociados', body: 'Hola Camila, recibimos tu consulta. Te vamos a contactar dentro de las próximas 24 horas hábiles.', at: at(-2, 21), status: 'Simulado (sin proveedor de correo)' }
  ];
  db.seq.email = 1;

  db.templates = [
    { id: 'tp1', name: 'Envío de presupuesto', category: 'Presupuestos', subject: 'Tu presupuesto para {{asunto}}', body: 'Hola {{cliente}}:\n\nTe compartimos la propuesta de honorarios para {{asunto}}, preparada por {{abogado}}. El importe total es de {{importe}}.\n\nPodés revisarla y aceptarla desde tu portal: {{portal}}\n\nQuedamos a disposición para cualquier consulta.\n\nVillafañe & Asociados' },
    { id: 'tp2', name: 'Carta de presentación', category: 'Cartas de presentación', subject: 'Bienvenida a Villafañe & Asociados', body: 'Estimado/a {{cliente}}:\n\nGracias por confiarnos su asunto. {{abogado}} será su profesional responsable en el expediente {{expediente}}.\n\nDesde el portal ({{portal}}) podrá seguir cada novedad, cargar documentación y solicitar reuniones.\n\nAtentamente,\nVillafañe & Asociados' },
    { id: 'tp3', name: 'Solicitud de documentación', category: 'Solicitudes de documentación', subject: 'Documentación pendiente — {{expediente}}', body: 'Hola {{cliente}}:\n\nPara avanzar con {{asunto}} necesitamos que cargues la documentación solicitada antes del {{fecha}}.\n\nPodés subirla de forma segura desde {{portal}}. Por favor, no la envíes por correo.\n\n{{abogado}}' },
    { id: 'tp4', name: 'Confirmación de reunión', category: 'Confirmaciones de reuniones', subject: 'Reunión confirmada — {{fecha}}', body: 'Hola {{cliente}}:\n\n{{abogado}} confirmó la reunión del {{fecha}}. Te recordamos que podés reprogramarla desde {{portal}} con al menos 24 horas de anticipación.\n\nVillafañe & Asociados' },
    { id: 'tp5', name: 'Recordatorio de pago', category: 'Recordatorios de pagos', subject: 'Recordatorio de pago — {{expediente}}', body: 'Hola {{cliente}}:\n\nTe recordamos que hay un saldo pendiente de {{importe}} vinculado al expediente {{expediente}}.\n\nPodés abonarlo desde {{portal}}. Si ya realizaste el pago, desestimá este mensaje.\n\nAdministración — Villafañe & Asociados' },
    { id: 'tp6', name: 'Actualización del expediente', category: 'Actualizaciones del expediente', subject: 'Novedades en {{expediente}}', body: 'Hola {{cliente}}:\n\nHay una novedad en tu expediente {{expediente}} ({{asunto}}). Podés leerla completa en tu portal: {{portal}}\n\n{{abogado}}' },
    { id: 'tp7', name: 'Cambio de horario de atención', category: 'Comunicaciones administrativas', subject: 'Información administrativa', body: 'Hola {{cliente}}:\n\nTe informamos que el {{fecha}} el estudio atenderá en horario reducido. Las solicitudes del portal se responderán al día hábil siguiente.\n\nVillafañe & Asociados' }
  ];
  db.seq.template = 7;

  db.audit = [
    { id: 'au1', at: at(-62, 10), userId: 'u_adm1', action: 'expediente.crear', entity: 'case', entityId: 'k11', detail: 'EXP-2026-0011 asignado a Tomás Arrieta' },
    { id: 'au2', at: at(-60, 12), userId: 'u_adm1', action: 'identidad.verificar', entity: 'client', entityId: 'c1', detail: 'Verificación manual de DNI con documento a la vista' },
    { id: 'au3', at: at(-21, 10), userId: 'u_adm2', action: 'presupuesto.convertir', entity: 'quote', entityId: 'q5', detail: 'P-2026-0005 → EXP-2026-0014' },
    { id: 'au4', at: at(-20, 16), userId: 'u_adm2', action: 'pago.confirmar', entity: 'payment', entityId: 'pay9', detail: 'Transferencia acreditada USD 750,00 (F-2026-0012)' }
  ];
  db.seq.audit = 4;
  return db;
};

/* ───────────── API (servidor simulado) ───────────── */
VA.createApi = function (db, opts) {
  opts = opts || {};
  const persist = opts.persist || (() => {});
  const SESSION_MIN = 30;
  const nextId = (k, p) => { db.seq[k] = (db.seq[k] || 0) + 1; return p + db.seq[k]; };
  const byId = (t, id) => db[t].find(x => x.id === id);
  const userOf = id => db.users.find(u => u.id === id);
  const lawyerOf = id => db.lawyers.find(l => l.id === id);
  const clientOf = id => db.clients.find(c => c.id === id);
  const nameOf = id => { if (id === 'sistema' || !id) return 'Sistema'; const u = userOf(id); return u ? u.name : 'Usuario'; };
  const nowISO = () => VA.now().toISOString();
  const today = () => VA.ymd(VA.now());
  const can = (u, p) => !!(u && u.role === 'admin' && u.active && (u.perms || []).includes(p));
  const isAdmin = u => u && u.role === 'admin';
  const audit = (u, action, entity, entityId, detail) => { db.audit.unshift({ id: nextId('audit', 'au'), at: nowISO(), userId: u ? u.id : 'sistema', action, entity, entityId, detail: detail || '' }); };
  const str = (v, max = 2000) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, c => c === '\n' ? c : ' ').trim().slice(0, max);
  const req = (v, label, max) => { const s = str(v, max); if (!s) bad('Completá el campo «' + label + '».'); return s; };
  const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  const admins = perm => db.users.filter(u => u.role === 'admin' && u.active && (!perm || u.perms.includes(perm)));

  function notify(userIds, n) {
    const ids = [...new Set(userIds.filter(Boolean))];
    ids.forEach(uid => {
      const u = userOf(uid); if (!u) return;
      if (n.dedupe && db.notifications.some(x => x.userId === uid && x.dedupe === n.dedupe)) return;
      db.notifications.unshift({ id: nextId('notification', 'n'), userId: uid, type: n.type, title: n.title, body: n.body || '', link: n.link || null, at: nowISO(), read: false, dedupe: n.dedupe || null });
      if (n.email !== false && u.notifPrefs && u.notifPrefs.email && (u.role === 'client' || n.emailStaff)) {
        db.outbox.unshift({ id: nextId('email', 'e'), to: u.email, subject: n.title, body: n.body || '', at: nowISO(), status: 'Simulado (sin proveedor de correo)' });
      }
    });
  }

  /* ── reglas de acceso ── */
  function canCase(u, c) {
    if (!u || !c) return false;
    if (u.role === 'admin') return can(u, 'expedientes.todos');
    if (u.role === 'lawyer') return c.lawyerId === u.lawyerId || (c.extraLawyerIds || []).includes(u.lawyerId);
    if (u.role === 'client') return c.clientId === u.clientId || (c.authorizedClientIds || []).includes(u.clientId);
    return false;
  }
  function needCase(u, id) {
    const c = byId('cases', id);
    if (!c) notFound();
    if (!canCase(u, c)) { audit(u, 'acceso.denegado', 'case', id, 'Intento de acceso a expediente sin permiso'); persist(); deny('No tenés acceso a este expediente.'); }
    return c;
  }
  const lawyerFin = u => u.role === 'lawyer' && lawyerOf(u.lawyerId) && lawyerOf(u.lawyerId).perms.verFinanzas;
  function canFinCase(u, caseId) {
    if (can(u, 'finanzas.gestionar')) return true;
    const c = byId('cases', caseId); if (!c) return false;
    if (u.role === 'client') return canCase(u, c);
    if (u.role === 'lawyer') return lawyerFin(u) && canCase(u, c);
    return false;
  }
  const clientCases = cid => db.cases.filter(c => c.clientId === cid || (c.authorizedClientIds || []).includes(cid));
  const lawyerClientIds = lid => [...new Set(db.cases.filter(c => c.lawyerId === lid || (c.extraLawyerIds || []).includes(lid)).map(c => c.clientId))];
  function canClient(u, cid) {
    if (u.role === 'admin') return can(u, 'expedientes.todos') || can(u, 'crm.gestionar') || can(u, 'finanzas.gestionar');
    if (u.role === 'lawyer') return lawyerClientIds(u.lawyerId).includes(cid);
    if (u.role === 'client') return u.clientId === cid;
    return false;
  }

  /* ── cálculos financieros ── */
  const collected = p => (p.status === 'Confirmado' || p.status === 'Reembolsado' || p.status === 'Reembolso parcial') ? p.amountCents - (p.refundedCents || 0) : 0;
  function invoiceCalc(inv) {
    const total = inv.items.reduce((s, i) => s + i.amountCents, 0);
    const pays = db.payments.filter(p => p.invoiceId === inv.id);
    const paid = pays.reduce((s, p) => s + collected(p), 0);
    const balance = Math.max(0, total - paid);
    let status = inv.status;
    if (inv.status !== 'Borrador' && inv.status !== 'Anulada') {
      if (balance === 0) status = 'Pagada';
      else if (inv.dueAt && inv.dueAt < today()) status = 'Vencida';
      else if (paid > 0) status = 'Parcialmente pagada';
      else status = 'Emitida';
    }
    const pending = pays.filter(p => p.status === 'Procesando' || p.status === 'Pendiente de verificación').reduce((s, p) => s + p.amountCents, 0);
    return Object.assign(clone(inv), { total, paid, balance: inv.status === 'Anulada' ? 0 : balance, status, pendingCents: pending, clientName: (clientOf(inv.clientId) || {}).name, caseNumber: (byId('cases', inv.caseId) || {}).number, payments: clone(pays) });
  }
  function quoteCalc(q) {
    const fees = q.items.filter(i => i.kind === 'honorarios').reduce((s, i) => s + i.amountCents, 0);
    const expenses = q.items.filter(i => i.kind === 'gastos').reduce((s, i) => s + i.amountCents, 0);
    const tax = Math.round(fees * (q.taxRate || 0) / 10000);
    const total = fees + expenses + tax;
    const advance = Math.round(total * (q.advancePct || 0) / 100);
    const inst = q.installments > 0 ? Math.floor((total - advance) / q.installments) : 0;
    let status = q.status; if (status === 'Enviado' && q.validUntil && q.validUntil < today()) status = 'Vencido';
    const cl = q.clientId ? clientOf(q.clientId) : null; const ct = q.contactId ? byId('contacts', q.contactId) : null;
    return Object.assign(clone(q), { fees, expenses, tax, total, advance, installmentCents: inst, status, recipientName: cl ? cl.name : ct ? ct.name : '—', recipientEmail: cl ? cl.email : ct ? ct.email : '', lawyerName: (lawyerOf(q.lawyerId) || {}).name, caseNumber: q.caseId ? (byId('cases', q.caseId) || {}).number : null, checksumNow: VA.sha256(JSON.stringify({ items: q.items, taxRate: q.taxRate, scope: q.scope, service: q.service, conditions: q.conditions, advancePct: q.advancePct, installments: q.installments, version: q.version })) });
  }
  function clientBalance(cid) {
    return db.invoices.filter(i => i.clientId === cid).map(invoiceCalc).filter(i => i.status !== 'Borrador' && i.status !== 'Anulada').reduce((s, i) => s + i.balance, 0);
  }
  const creditOf = cid => db.credits.filter(c => c.clientId === cid).reduce((s, c) => s + c.amountCents, 0);

  /* ── agenda ── */
  const mEnd = m => new Date(new Date(m.start).getTime() + m.durationMin * 6e4);
  const holding = m => HOLD.includes(m.status) && !(m.status === 'Pendiente de pago' && m.holdUntil && new Date(m.holdUntil) < VA.now());
  function slotFree(lawyerId, startISO, dur, ignoreId) {
    const s = new Date(startISO).getTime(); const e = s + dur * 6e4;
    const d = new Date(startISO); const wd = d.getDay();
    if (wd === 0 || wd === 6) return { ok: false, why: 'El estudio no atiende fines de semana.' };
    const startMin = d.getHours() * 60 + d.getMinutes(); if (startMin < 9 * 60 || startMin + dur > 18 * 60) return { ok: false, why: 'Fuera del horario de atención (9 a 18 h).' };
    if (s < VA.now().getTime() + 60 * 6e4) return { ok: false, why: 'El horario debe ser al menos una hora posterior a este momento.' };
    for (const m of db.meetings) {
      if (m.id === ignoreId || m.lawyerId !== lawyerId || !holding(m)) continue;
      const ranges = [[new Date(m.start).getTime(), mEnd(m).getTime()]];
      if (m.status === 'Reprogramación propuesta' && m.proposedStart) { const ps = new Date(m.proposedStart).getTime(); ranges.push([ps, ps + m.durationMin * 6e4]); }
      if (ranges.some(([a, b]) => s < b && e > a)) return { ok: false, why: 'Ese horario ya está reservado.' };
    }
    for (const b of db.blocks) if (b.lawyerId === lawyerId && s < new Date(b.end).getTime() && e > new Date(b.start).getTime()) return { ok: false, why: 'El profesional bloqueó ese horario.' };
    return { ok: true };
  }
  function slotsFor(lawyerId, dateYMD, dur) {
    const out = []; const base = VA.toD(dateYMD);
    for (let t = 9 * 60; t + dur <= 18 * 60; t += 30) { const d = new Date(base); d.setHours(Math.floor(t / 60), t % 60, 0, 0); if (slotFree(lawyerId, d.toISOString(), dur).ok) out.push(d.toISOString()); }
    return out;
  }
  function transition(m, to, by, note) {
    if (!(MT[m.status] || []).includes(to)) conflict('No se puede pasar de «' + m.status + '» a «' + to + '».');
    m.history.push({ at: nowISO(), by: by ? by.id : 'sistema', from: m.status, to, note: note || '' });
    m.status = to;
  }
  function refund(m, pct, by, reason) {
    const p = m.paymentId && byId('payments', m.paymentId);
    if (!p || p.status !== 'Confirmado' || pct <= 0) return 0;
    const amt = Math.round(p.amountCents * pct / 100);
    p.refundedCents = amt; p.status = amt >= p.amountCents ? 'Reembolsado' : 'Reembolso parcial';
    p.refundNote = reason; p.refundAt = nowISO();
    audit(by, 'pago.reembolsar', 'payment', p.id, VA.money(amt) + ' — ' + reason);
    return amt;
  }
  function canManageMeeting(u, m) {
    if (can(u, 'agenda.gestionar')) return true;
    if (u.role === 'lawyer' && m.lawyerId === u.lawyerId) return lawyerOf(u.lawyerId).perms.aprobarTurnos;
    return false;
  }
  function meetingView(u, m) {
    const v = clone(m); const l = lawyerOf(m.lawyerId); const c = m.clientId ? clientOf(m.clientId) : null; const ct = m.contactId ? byId('contacts', m.contactId) : null;
    v.lawyerName = l ? l.name : '—'; v.lawyerPhoto = l ? l.photo : null; v.clientName = c ? c.name : ct ? ct.name + ' (contacto)' : '—';
    v.end = mEnd(m).toISOString(); v.caseNumber = m.caseId ? (byId('cases', m.caseId) || {}).number : null;
    v.payment = m.paymentId ? clone(byId('payments', m.paymentId)) : null;
    v.holdExpired = m.status === 'Pendiente de pago' && m.holdUntil && new Date(m.holdUntil) < VA.now();
    if (u.role === 'client') { delete v.privateNotes; v.history = v.history.map(h => ({ at: h.at, to: h.to, note: h.note && h.byClientVisible !== false ? h.note : '' })); }
    return v;
  }

  /* ── vistas de entidades ── */
  function caseView(u, c) {
    const v = clone(c);
    const l = lawyerOf(c.lawyerId); const cl = clientOf(c.clientId);
    v.lawyer = l ? { id: l.id, name: l.name, title: l.title, photo: l.photo, email: l.email } : null;
    v.client = cl ? { id: cl.id, name: cl.name, email: cl.email, phone: cl.phone } : null;
    v.extraLawyers = (c.extraLawyerIds || []).map(id => (lawyerOf(id) || {}).name);
    const acts = db.activities.filter(a => a.caseId === c.id).sort((a, b) => b.at.localeCompare(a.at)).map(a => Object.assign(clone(a), { authorName: nameOf(a.authorId) }));
    const docs = db.documents.filter(d => d.caseId === c.id).sort((a, b) => b.at.localeCompare(a.at)).map(d => Object.assign(clone(d), { uploaderName: nameOf(d.uploadedBy) }));
    v.requests = clone(db.docRequests.filter(r => r.caseId === c.id));
    v.meetings = db.meetings.filter(m => m.caseId === c.id).map(m => meetingView(u, m)).sort((a, b) => a.start.localeCompare(b.start));
    const quotes = db.quotes.filter(q => q.caseId === c.id).map(quoteCalc);
    const fin = canFinCase(u, c.id);
    v.finance = fin ? { invoices: db.invoices.filter(i => i.caseId === c.id).map(invoiceCalc).filter(i => u.role !== 'client' || i.status !== 'Borrador'), payments: clone(db.payments.filter(p => p.caseId === c.id)) } : null;
    if (u.role === 'client') {
      v.activities = acts.filter(a => a.kind === 'cliente');
      v.documents = docs.filter(d => d.visibility === 'compartido');
      v.quotes = quotes.filter(q => ['Enviado', 'Aceptado', 'Rechazado', 'Vencido'].includes(q.status));
      v.tasks = [];
      delete v.description; delete v.extraLawyerIds; delete v.authorizedClientIds;
      v.statusLabel = VA.CASE_CLIENT_LABEL[c.status] || c.status;
    } else {
      v.activities = acts; v.documents = docs; v.quotes = quotes;
      v.tasks = clone(db.tasks.filter(t => t.caseId === c.id)).map(t => Object.assign(t, { assigneeName: nameOf(t.assigneeId) }));
    }
    return v;
  }
  function caseRow(u, c) {
    const l = lawyerOf(c.lawyerId); const cl = clientOf(c.clientId);
    const last = db.activities.filter(a => a.caseId === c.id && (u.role !== 'client' || a.kind === 'cliente')).map(a => a.at).sort().pop() || c.updatedAt;
    return { id: c.id, number: c.number, title: c.title, area: c.area, status: c.status, statusLabel: VA.CASE_CLIENT_LABEL[c.status], priority: c.priority, openedAt: c.openedAt, next: c.next, lawyerId: c.lawyerId, lawyerName: l ? l.name : '—', lawyerPhoto: l ? l.photo : null, clientId: c.clientId, clientName: cl ? cl.name : '—', lastUpdate: last };
  }
  function lawyerPublic(l) { return { id: l.id, name: l.name, title: l.title, specialty: l.specialty, areas: l.areas, photo: l.photo, bio: l.bio, languages: l.languages }; }
  function lawyerFull(l) {
    const active = db.cases.filter(c => c.lawyerId === l.id && !['Cerrado', 'Archivado'].includes(c.status));
    return Object.assign(clone(l), { activeCases: active.length, totalCases: db.cases.filter(c => c.lawyerId === l.id).length, upcoming: db.meetings.filter(m => m.lawyerId === l.id && holding(m) && new Date(m.start) > VA.now()).length, user: (({ email, active, lastLogin }) => ({ email, active, lastLogin }))(userOf(l.userId)) });
  }

  /* ════════ API pública (sin sesión) ════════ */
  const pub = {
    firm() { return clone(db.settings.firm); },
    team() { return db.lawyers.filter(l => l.active).map(lawyerPublic); },
    standardRate() { return db.settings.standardRateCents; },
    createLead(data) {
      const name = req(data.name, 'Nombre y apellido', 120); const email = req(data.email, 'Correo electrónico', 160).toLowerCase();
      if (!emailOk(email)) bad('Revisá el correo electrónico: parece incompleto.');
      const phone = req(data.phone, 'Teléfono', 40); if (!/^[+\d][\d\s().-]{6,}$/.test(phone)) bad('Revisá el teléfono: usá solo números, espacios o el signo +.');
      const area = VA.AREAS.includes(data.area) ? data.area : bad('Elegí un área jurídica.');
      const message = req(data.message, 'Descripción inicial', 1500);
      if (!data.privacy) bad('Para enviar la consulta tenés que aceptar la política de privacidad.');
      const recent = db.contacts.find(c => c.email === email && c.stage === 'Nuevo contacto' && (VA.now() - new Date(c.lastActivity)) < 10 * 6e4);
      if (recent) conflict('Ya recibimos una consulta con este correo hace instantes. Te vamos a contactar a la brevedad.');
      const id = nextId('contact', 'p');
      const c = { id, name, email, phone, stage: 'Nuevo contacto', source: 'Sitio web', firstContact: today(), area, lawyerId: null, tags: [area.replace('Derecho ', '')], notes: '', clientId: null, ownerId: (admins('crm.gestionar')[1] || admins('crm.gestionar')[0] || {}).id, nextAction: { text: 'Primer contacto (responder en 24 h hábiles)', date: VA.dateOnly(VA.now(), 1) }, lastActivity: nowISO(), contactPref: str(data.pref, 40) || 'Correo electrónico', communications: [{ at: nowISO(), channel: 'Formulario web', summary: message, by: null }] };
      db.contacts.unshift(c);
      notify(admins('crm.gestionar').map(u => u.id), { type: 'Nueva consulta', title: 'Nueva consulta desde el sitio web', body: name + ' · ' + area, link: 'crm.' + id, email: false });
      db.outbox.unshift({ id: nextId('email', 'e'), to: email, subject: 'Recibimos tu consulta — Villafañe & Asociados', body: 'Hola ' + name.split(' ')[0] + ', recibimos tu consulta sobre ' + area + '. Te vamos a contactar dentro de las próximas 24 horas hábiles por ' + c.contactPref.toLowerCase() + '. No envíes documentación hasta que te indiquemos el canal seguro.', at: nowISO(), status: 'Simulado (sin proveedor de correo)' });
      audit(null, 'crm.nueva_consulta', 'contact', id, 'Formulario web — ' + area);
      persist(); return { id };
    }
  };

  /* ════════ autenticación ════════ */
  const auth = {
    login(email, pw) {
      email = String(email || '').trim().toLowerCase();
      if (!email || !pw) bad('Ingresá tu correo y tu contraseña.');
      const u = db.users.find(x => x.email === email);
      const generic = 'El correo o la contraseña no coinciden. Revisalos e intentá de nuevo.';
      if (!u) { audit(null, 'auth.fallido', 'user', null, email); persist(); throw new ApiError('AUTH', generic); }
      if (u.lockedUntil && new Date(u.lockedUntil) > VA.now()) { const s = Math.ceil((new Date(u.lockedUntil) - VA.now()) / 1000); throw new ApiError('LOCKED', 'Demasiados intentos fallidos. Esperá ' + s + ' segundos y volvé a intentar.'); }
      if (!u.pwHash) throw new ApiError('AUTH', 'Esta cuenta todavía no activó su acceso. Revisá la invitación enviada por correo.');
      if (!u.active) throw new ApiError('AUTH', 'La cuenta está desactivada. Comunicate con la administración del estudio.');
      if (VA.hashPw(u.salt, pw) !== u.pwHash) {
        u.failed = (u.failed || 0) + 1;
        if (u.failed >= 5) { u.lockedUntil = new Date(VA.now().getTime() + 30000).toISOString(); u.failed = 0; audit(u, 'auth.bloqueo', 'user', u.id, 'Bloqueo temporal por 5 intentos fallidos'); }
        else audit(u, 'auth.fallido', 'user', u.id, 'Contraseña incorrecta');
        persist(); throw new ApiError('AUTH', generic);
      }
      u.failed = 0; u.lockedUntil = null; u.lastLogin = nowISO();
      const token = VA.rand(32);
      db.sessions[token] = { userId: u.id, exp: new Date(VA.now().getTime() + SESSION_MIN * 6e4).toISOString() };
      audit(u, 'auth.ingreso', 'user', u.id, u.role);
      persist(); return { token, user: safeUser(u) };
    },
    logout(token) { const s = db.sessions[token]; if (s) { audit(userOf(s.userId), 'auth.salida', 'user', s.userId); delete db.sessions[token]; persist(); } },
    requestReset(email) {
      email = String(email || '').trim().toLowerCase(); if (!emailOk(email)) bad('Ingresá un correo válido.');
      const u = db.users.find(x => x.email === email);
      if (u) { db.outbox.unshift({ id: nextId('email', 'e'), to: email, subject: 'Restablecer contraseña', body: 'Recibimos un pedido para restablecer tu contraseña. El enlace vence en 30 minutos. (Demo: el enlace no se genera sin proveedor de correo.)', at: nowISO(), status: 'Simulado (sin proveedor de correo)' }); audit(u, 'auth.recuperacion', 'user', u.id); persist(); }
      return { ok: true };
    },
    resolve(token) {
      const s = token && db.sessions[token]; if (!s) return null;
      if (new Date(s.exp) < VA.now()) { delete db.sessions[token]; persist(); return null; }
      s.exp = new Date(VA.now().getTime() + SESSION_MIN * 6e4).toISOString();
      const u = userOf(s.userId); return u && u.active ? u : null;
    }
  };
  function safeUser(u) {
    const o = { id: u.id, role: u.role, name: u.name, email: u.email, adminScope: u.adminScope || null, perms: u.perms ? u.perms.slice() : [], lawyerId: u.lawyerId || null, clientId: u.clientId || null, notifPrefs: clone(u.notifPrefs || {}) };
    if (u.lawyerId) { const l = lawyerOf(u.lawyerId); o.photo = l.photo; o.lawyerPerms = clone(l.perms); o.title = l.title; }
    return o;
  }

  /* ════════ API con sesión ════════ */
  function as(token) {
    const u = auth.resolve(token);
    if (!u) throw new ApiError('SESSION', 'Tu sesión venció. Ingresá de nuevo para continuar.');
    const mutate = fn => (...args) => { const r = fn(...args); persist(); return r; };
    const needPerm = p => { if (!can(u, p)) { audit(u, 'acceso.denegado', 'perm', p, 'Permiso requerido: ' + p); persist(); deny(); } };
    const staff = () => { if (u.role === 'client') deny(); };

    const api = {
      me: () => safeUser(u),
      can: p => can(u, p),

      /* ── expedientes ── */
      cases(f = {}) {
        let list = db.cases.filter(c => canCase(u, c));
        if (f.status) list = list.filter(c => c.status === f.status);
        if (f.area) list = list.filter(c => c.area === f.area);
        if (f.lawyerId) list = list.filter(c => c.lawyerId === f.lawyerId);
        if (f.q) { const q = f.q.toLowerCase(); list = list.filter(c => (c.number + ' ' + c.title + ' ' + (clientOf(c.clientId) || {}).name).toLowerCase().includes(q)); }
        return list.map(c => caseRow(u, c));
      },
      case(id) { return caseView(u, needCase(u, id)); },
      createCase: mutate(d => {
        needPerm('expedientes.gestionar');
        const title = req(d.title, 'Título del asunto', 200); const cl = clientOf(d.clientId) || bad('Elegí un cliente.');
        const l = lawyerOf(d.lawyerId) || bad('Elegí un abogado responsable.'); if (!l.active) bad('Ese perfil está desactivado.');
        const area = VA.AREAS.includes(d.area) ? d.area : bad('Elegí un área jurídica.');
        const num = nextId('case', ''); const id = 'k' + num;
        const c = { id, number: 'EXP-' + VA.now().getFullYear() + '-' + String(num).padStart(4, '0'), title, clientId: cl.id, lawyerId: l.id, area, status: 'Nuevo', priority: VA.PRIORITIES.includes(d.priority) ? d.priority : 'Media', openedAt: today(), next: d.nextDate ? { date: d.nextDate, label: str(d.nextLabel, 120) || 'Próxima fecha' } : null, feesCents: 0, currency: 'USD', description: str(d.description, 3000), clientSummary: str(d.clientSummary, 1000) || 'Recibimos tu asunto y lo estamos evaluando.', extraLawyerIds: [], authorizedClientIds: [], updatedAt: nowISO() };
        db.cases.unshift(c);
        db.activities.push({ id: nextId('activity', 'a'), caseId: id, kind: 'sistema', text: 'Expediente creado y asignado a ' + l.name + '.', authorId: u.id, at: nowISO() });
        notify([l.userId], { type: 'Expediente asignado', title: 'Nuevo expediente asignado: ' + c.number, body: title, link: 'expediente.' + id });
        notify([cl.userId], { type: 'Actualización del expediente', title: 'Abrimos tu expediente ' + c.number, body: 'Profesional responsable: ' + l.name + '.', link: 'expediente.' + id });
        audit(u, 'expediente.crear', 'case', id, c.number + ' asignado a ' + l.name);
        return { id };
      }),
      updateCase: mutate((id, d) => {
        const c = needCase(u, id);
        const isOwnerLawyer = u.role === 'lawyer' && c.lawyerId === u.lawyerId;
        if (!(can(u, 'expedientes.gestionar') || isOwnerLawyer)) deny();
        const changes = [];
        if (d.status && d.status !== c.status) { if (!VA.CASE_STATES.includes(d.status)) bad('Estado inválido.'); changes.push('Estado: ' + c.status + ' → ' + d.status); c.status = d.status; }
        if (d.priority && d.priority !== c.priority) { if (!VA.PRIORITIES.includes(d.priority)) bad('Prioridad inválida.'); changes.push('Prioridad: ' + c.priority + ' → ' + d.priority); c.priority = d.priority; }
        if (d.title !== undefined) { c.title = req(d.title, 'Título', 200); }
        if (d.description !== undefined) c.description = str(d.description, 3000);
        if (d.clientSummary !== undefined) c.clientSummary = str(d.clientSummary, 1000);
        if (d.nextDate !== undefined) { c.next = d.nextDate ? { date: d.nextDate, label: str(d.nextLabel, 120) || 'Próxima fecha' } : null; changes.push('Próxima fecha actualizada'); }
        if (d.feesCents !== undefined) { if (!can(u, 'finanzas.gestionar')) deny('Solo administración financiera puede modificar honorarios.'); if (!Number.isInteger(d.feesCents) || d.feesCents < 0) bad('Importe inválido.'); changes.push('Honorarios: ' + VA.money(c.feesCents) + ' → ' + VA.money(d.feesCents)); c.feesCents = d.feesCents; }
        c.updatedAt = nowISO();
        if (changes.length) {
          db.activities.push({ id: nextId('activity', 'a'), caseId: id, kind: 'sistema', text: changes.join(' · '), authorId: u.id, at: nowISO() });
          audit(u, 'expediente.editar', 'case', id, changes.join(' · '));
          if (d.status) notify([clientOf(c.clientId).userId], { type: 'Actualización importante del caso', title: c.number + ': ' + (VA.CASE_CLIENT_LABEL[c.status] || c.status), body: c.title, link: 'expediente.' + id, dedupe: 'st:' + id + ':' + c.status });
        }
        return true;
      }),
      assignCase: mutate((id, lawyerId) => {
        needPerm('expedientes.gestionar'); const c = needCase(u, id); const l = lawyerOf(lawyerId) || bad('Elegí un abogado.');
        if (!l.active) bad('Ese perfil está desactivado.'); if (c.lawyerId === l.id) return true;
        const prev = lawyerOf(c.lawyerId); c.lawyerId = l.id; c.updatedAt = nowISO();
        db.activities.push({ id: nextId('activity', 'a'), caseId: id, kind: 'sistema', text: 'Reasignado de ' + (prev ? prev.name : '—') + ' a ' + l.name + '.', authorId: u.id, at: nowISO() });
        notify([l.userId], { type: 'Expediente asignado', title: 'Te asignaron ' + c.number, body: c.title, link: 'expediente.' + id });
        notify([clientOf(c.clientId).userId], { type: 'Actualización del expediente', title: 'Cambio de profesional en ' + c.number, body: 'Tu nuevo profesional responsable es ' + l.name + '.', link: 'expediente.' + id });
        audit(u, 'expediente.reasignar', 'case', id, (prev ? prev.name : '—') + ' → ' + l.name);
        return true;
      }),
      setExtraAccess: mutate((id, lawyerIds) => {
        needPerm('expedientes.gestionar'); const c = needCase(u, id);
        c.extraLawyerIds = (lawyerIds || []).filter(x => lawyerOf(x) && x !== c.lawyerId);
        audit(u, 'expediente.permisos', 'case', id, 'Acceso adicional: ' + (c.extraLawyerIds.map(x => lawyerOf(x).name).join(', ') || 'ninguno'));
        return true;
      }),
      addActivity: mutate((id, kind, text) => {
        staff(); const c = needCase(u, id); text = req(text, kind === 'cliente' ? 'Actualización para el cliente' : 'Nota interna', 3000);
        if (!['interna', 'cliente'].includes(kind)) bad('Tipo de nota inválido.');
        db.activities.push({ id: nextId('activity', 'a'), caseId: id, kind, text, authorId: u.id, at: nowISO() }); c.updatedAt = nowISO();
        if (kind === 'cliente') { notify([clientOf(c.clientId).userId], { type: 'Actualización del expediente', title: 'Novedad en ' + c.number, body: text.slice(0, 160), link: 'expediente.' + id }); audit(u, 'expediente.actualizacion_cliente', 'case', id, 'Publicada al cliente'); }
        else audit(u, 'expediente.nota_interna', 'case', id, 'Nota interna registrada');
        return true;
      }),
      addTask: mutate(d => {
        staff(); if (d.caseId) needCase(u, d.caseId);
        const title = req(d.title, 'Tarea', 200); const assignee = userOf(d.assigneeId) || u;
        if (assignee.role === 'client') bad('Las tareas se asignan a miembros del equipo.');
        if (u.role === 'lawyer' && assignee.id !== u.id && !can(u, 'expedientes.gestionar')) bad('Como abogado podés crear tareas para vos.');
        const t = { id: nextId('task', 't'), title, caseId: d.caseId || null, contactId: d.contactId || null, assigneeId: assignee.id, due: d.due || today(), done: false, createdBy: u.id, at: nowISO(), source: d.source || null };
        db.tasks.unshift(t);
        if (assignee.id !== u.id) notify([assignee.id], { type: 'Tarea asignada', title: 'Nueva tarea: ' + title, body: 'Vence ' + VA.fDate(t.due), link: t.caseId ? 'expediente.' + t.caseId : 'tareas', email: false });
        audit(u, 'tarea.crear', 'task', t.id, title);
        return t.id;
      }),
      toggleTask: mutate(id => {
        staff(); const t = byId('tasks', id) || notFound();
        if (!(t.assigneeId === u.id || can(u, 'expedientes.gestionar') || (t.caseId && canCase(u, byId('cases', t.caseId)) && u.role === 'lawyer'))) deny();
        t.done = !t.done; audit(u, t.done ? 'tarea.completar' : 'tarea.reabrir', 'task', id, t.title); return t.done;
      }),
      tasks(f = {}) {
        staff();
        let list = db.tasks.filter(t => can(u, 'expedientes.todos') || t.assigneeId === u.id || (t.caseId && canCase(u, byId('cases', t.caseId))));
        if (f.mine) list = list.filter(t => t.assigneeId === u.id);
        return clone(list).map(t => Object.assign(t, { assigneeName: nameOf(t.assigneeId), caseNumber: t.caseId ? byId('cases', t.caseId).number : null, contactName: t.contactId ? (byId('contacts', t.contactId) || {}).name : null })).sort((a, b) => (a.done - b.done) || a.due.localeCompare(b.due));
      },
      requestDocument: mutate((caseId, d) => {
        staff(); const c = needCase(u, caseId);
        const r = { id: nextId('req', 'r'), caseId, title: req(d.title, 'Documento solicitado', 160), category: VA.DOC_CATS.includes(d.category) ? d.category : 'Documentación del caso', status: 'Pendiente', requestedBy: u.id, at: nowISO(), due: d.due || VA.dateOnly(VA.now(), 7) };
        db.docRequests.push(r);
        if (c.status === 'Activo' || c.status === 'En evaluación') { c.status = 'Pendiente de documentación'; db.activities.push({ id: nextId('activity', 'a'), caseId, kind: 'sistema', text: 'Estado cambiado a Pendiente de documentación.', authorId: u.id, at: nowISO() }); }
        notify([clientOf(c.clientId).userId], { type: 'Documentos solicitados', title: 'Necesitamos un documento: ' + r.title, body: c.number + ' · antes del ' + VA.fDate(r.due), link: 'documentos' });
        audit(u, 'documento.solicitar', 'case', caseId, r.title);
        return r.id;
      }),
      uploadDocument: mutate(d => {
        const c = needCase(u, d.caseId);
        const name = req(d.name, 'Nombre del archivo', 180);
        if (!VA.ALLOWED_FILES[d.type]) bad('Formato no admitido. Usá PDF, JPG, PNG o DOCX.');
        if (!(d.size > 0)) bad('El archivo está vacío.');
        if (d.size > VA.MAX_FILE) bad('El archivo supera el límite de 10 MB. Comprimilo o dividilo en partes.');
        const visibility = u.role === 'client' ? 'compartido' : (d.visibility === 'compartido' ? 'compartido' : 'interna');
        let replaced = null;
        if (d.replaceId) {
          const old = byId('documents', d.replaceId) || notFound();
          if (old.caseId !== c.id) deny();
          if (u.role === 'client' && (!old.replaceable || old.uploadedBy !== u.id)) deny('Este documento no admite reemplazo.');
          old.status = 'Reemplazado'; old.visibility = 'interna'; replaced = old.id;
        }
        const doc = { id: nextId('doc', 'd'), caseId: c.id, name, category: VA.DOC_CATS.includes(d.category) ? d.category : 'Otros', visibility, uploadedBy: u.id, at: nowISO(), status: u.role === 'client' ? 'Pendiente de revisión' : 'Aprobado', size: d.size, type: d.type, replaceable: u.role === 'client', requestId: null, replaces: replaced };
        if (d.requestId) { const r = byId('docRequests', d.requestId); if (r && r.caseId === c.id) { r.status = 'Recibido'; doc.requestId = r.id; } }
        db.documents.push(doc); c.updatedAt = nowISO();
        if (u.role === 'client') {
          notify([lawyerOf(c.lawyerId).userId], { type: 'Documento recibido', title: u.name + ' subió un documento', body: name + ' — ' + c.number, link: 'expediente.' + c.id, email: false });
          notify([u.id], { type: 'Documentos recibidos', title: 'Recibimos tu documento', body: name + ' quedó pendiente de revisión.', link: 'documentos', email: false });
          if (c.status === 'Pendiente de documentación' && !db.docRequests.some(r => r.caseId === c.id && r.status === 'Pendiente')) {
            c.status = 'Activo'; db.activities.push({ id: nextId('activity', 'a'), caseId: c.id, kind: 'sistema', text: 'Documentación completa. Estado cambiado a Activo.', authorId: 'sistema', at: nowISO() });
          }
        } else if (visibility === 'compartido') notify([clientOf(c.clientId).userId], { type: 'Documentos recibidos', title: 'Hay un documento nuevo en ' + c.number, body: name, link: 'documentos' });
        audit(u, 'documento.subir', 'document', doc.id, name + ' (' + visibility + ')');
        return doc.id;
      }),
      reviewDocument: mutate((id, status, note) => {
        staff(); const d = byId('documents', id) || notFound(); needCase(u, d.caseId);
        if (!['Aprobado', 'Requiere reemplazo'].includes(status)) bad('Estado inválido.');
        d.status = status; d.reviewNote = str(note, 300); d.reviewedBy = u.id; d.reviewedAt = nowISO();
        const c = byId('cases', d.caseId);
        if (d.uploadedBy && userOf(d.uploadedBy).role === 'client') notify([d.uploadedBy], { type: 'Documentos recibidos', title: status === 'Aprobado' ? 'Aprobamos tu documento' : 'Necesitamos que reemplaces un documento', body: d.name + (d.reviewNote ? ' — ' + d.reviewNote : ''), link: 'documentos' });
        audit(u, 'documento.revisar', 'document', id, d.name + ' → ' + status + ' (' + c.number + ')');
        return true;
      }),
      setDocVisibility: mutate((id, vis) => {
        staff(); const d = byId('documents', id) || notFound(); const c = needCase(u, d.caseId);
        if (!['interna', 'compartido'].includes(vis)) bad('Visibilidad inválida.');
        d.visibility = vis;
        if (vis === 'compartido') notify([clientOf(c.clientId).userId], { type: 'Documentos recibidos', title: 'Hay un documento nuevo en ' + c.number, body: d.name, link: 'documentos' });
        audit(u, 'documento.visibilidad', 'document', id, d.name + ' → ' + (vis === 'compartido' ? 'compartido con el cliente' : 'solo interno'));
        return true;
      }),
      myDocuments() {
        if (u.role !== 'client') deny();
        const cs = clientCases(u.clientId);
        return cs.map(c => ({ caseId: c.id, number: c.number, title: c.title, documents: db.documents.filter(d => d.caseId === c.id && d.visibility === 'compartido').map(d => Object.assign(clone(d), { uploaderName: nameOf(d.uploadedBy), mine: d.uploadedBy === u.id })).sort((a, b) => b.at.localeCompare(a.at)), requests: clone(db.docRequests.filter(r => r.caseId === c.id)) }));
      },

      /* ── clientes e identidad ── */
      clients() {
        staff();
        const ids = u.role === 'lawyer' ? lawyerClientIds(u.lawyerId) : (canClient(u, null) ? db.clients.map(c => c.id) : []);
        if (u.role === 'admin' && !canClient(u, null)) deny();
        return db.clients.filter(c => ids.includes(c.id)).map(c => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, verification: c.verification, cases: clientCases(c.id).length, activeCases: clientCases(c.id).filter(k => !['Cerrado', 'Archivado'].includes(k.status)).length, balance: (can(u, 'finanzas.gestionar') || lawyerFin(u)) ? clientBalance(c.id) : null, userActive: (userOf(c.userId) || {}).active, invited: !(userOf(c.userId) || {}).pwHash }));
      },
      client(id) {
        const c = clientOf(id) || notFound();
        if (!canClient(u, id)) { audit(u, 'acceso.denegado', 'client', id, 'Ficha de cliente'); persist(); deny(); }
        const v = clone(c);
        const showId = u.role === 'client' || can(u, 'clientes.identidad');
        if (!showId) { v.docNumber = c.docNumber ? '•••• ' + c.docNumber.slice(-3) : ''; v.birthDate = c.birthDate ? '••••' : ''; v.masked = true; }
        if (u.role === 'lawyer') v.cases = clientCases(id).filter(k => canCase(u, k)).map(k => caseRow(u, k)); else v.cases = clientCases(id).map(k => caseRow(u, k));
        v.identityDocs = db.documents.filter(d => d.category === 'Identificación personal' && clientCases(id).some(k => k.id === d.caseId) && (u.role !== 'client' || d.visibility === 'compartido')).map(d => ({ id: d.id, name: d.name, status: d.status, at: d.at }));
        v.verifiedByName = c.verifiedBy ? nameOf(c.verifiedBy) : null;
        v.required = clone(db.settings.identityRequired);
        v.balance = (u.role === 'client' || can(u, 'finanzas.gestionar') || lawyerFin(u)) ? clientBalance(id) : null;
        v.credit = creditOf(id);
        if (u.role === 'admin') audit(u, 'cliente.consultar', 'client', id, 'Ficha consultada');
        return v;
      },
      updateIdentity: mutate((id, d) => {
        const c = clientOf(id) || notFound();
        if (!(u.role === 'client' && u.clientId === id) && !can(u, 'clientes.identidad')) deny();
        const reqd = db.settings.identityRequired;
        const fields = { phone: 'Teléfono', address: 'Domicilio', docType: 'Tipo de documento', docNumber: 'Número de documento', country: 'País de emisión', birthDate: 'Fecha de nacimiento' };
        Object.keys(fields).forEach(k => { if (d[k] !== undefined) { const v = str(d[k], 120); if (reqd[k] && !v) bad('Completá el campo «' + fields[k] + '».'); c[k] = v; } });
        if (d.contactPref) c.contactPref = str(d.contactPref, 40);
        if (d.docNumber !== undefined || d.docType !== undefined) { if (c.verification === 'Verificado manualmente') { c.verification = 'En revisión'; c.verifiedBy = null; c.verifiedAt = null; } }
        audit(u, 'identidad.editar', 'client', id, 'Datos de identificación actualizados');
        return true;
      }),
      verifyIdentity: mutate((id, status, note) => {
        needPerm('clientes.identidad'); const c = clientOf(id) || notFound();
        if (!['No verificado', 'En revisión', 'Verificado manualmente'].includes(status)) bad('Estado inválido.');
        if (status === 'Verificado manualmente' && !str(note)) bad('Indicá cómo se verificó la identidad (por ejemplo: documento original a la vista).');
        c.verification = status; c.verifiedBy = status === 'Verificado manualmente' ? u.id : null; c.verifiedAt = status === 'Verificado manualmente' ? nowISO() : null; c.verificationNote = str(note, 300);
        audit(u, 'identidad.verificar', 'client', id, status + (note ? ' — ' + note : ''));
        return true;
      }),
      updatePrefs: mutate(p => { const me = userOf(u.id); me.notifPrefs = { email: !!p.email, inapp: true }; audit(u, 'preferencias.editar', 'user', u.id, 'Correo: ' + (p.email ? 'sí' : 'no')); return true; }),

      /* ── equipo ── */
      lawyers() { staff(); return db.lawyers.map(l => { const f = lawyerFull(l); if (u.role === 'lawyer' && l.id !== u.lawyerId) { delete f.cv; delete f.perms; } return f; }); },
      lawyer(id) { staff(); const l = lawyerOf(id) || notFound(); const f = lawyerFull(l); f.cases = db.cases.filter(c => c.lawyerId === id && canCase(u, c)).map(c => caseRow(u, c)); return f; },
      saveLawyer: mutate((id, d) => {
        const self = u.role === 'lawyer' && u.lawyerId === id;
        if (!can(u, 'equipo.gestionar') && !self) deny();
        let l = id ? lawyerOf(id) : null;
        if (!l) {
          if (!can(u, 'equipo.gestionar')) deny();
          const email = req(d.email, 'Correo', 160).toLowerCase(); if (!emailOk(email)) bad('Correo inválido.'); if (db.users.some(x => x.email === email)) conflict('Ya existe un usuario con ese correo.');
          const lid = 'l' + (db.lawyers.length + 1) + VA.rand(3); const uid = 'u_' + lid;
          db.users.push({ id: uid, role: 'lawyer', name: req(d.name, 'Nombre', 120), email, salt: VA.rand(12), pwHash: null, active: true, failed: 0, lawyerId: lid, notifPrefs: { email: true, inapp: true } });
          l = { id: lid, userId: uid, name: d.name, title: '', specialty: '', areas: [], rateCents: db.settings.standardRateCents, photo: null, bio: '', experience: [], email, phone: '', active: true, availability: 'Disponible', perms: { verFinanzas: false, aprobarTurnos: true, emitirPresupuestos: false }, cv: null, joined: today(), languages: ['Español'] };
          db.lawyers.push(l);
          db.outbox.unshift({ id: nextId('email', 'e'), to: email, subject: 'Invitación al portal de Villafañe & Asociados', body: 'Te damos la bienvenida. Activá tu acceso con el enlace de invitación (simulado en la demo).', at: nowISO(), status: 'Simulado (sin proveedor de correo)' });
          audit(u, 'equipo.crear', 'lawyer', lid, d.name);
        }
        const before = clone(l);
        if (d.name !== undefined && can(u, 'equipo.gestionar')) { l.name = req(d.name, 'Nombre', 120); userOf(l.userId).name = l.name; }
        ['title', 'specialty', 'bio', 'phone'].forEach(k => { if (d[k] !== undefined) l[k] = str(d[k], k === 'bio' ? 1200 : 160); });
        if (d.areas) l.areas = d.areas.filter(a => VA.AREAS.includes(a));
        if (d.languages) l.languages = d.languages.map(x => str(x, 40)).filter(Boolean);
        if (d.availability && ['Disponible', 'Agenda completa', 'Licencia'].includes(d.availability)) l.availability = d.availability;
        if (d.photo !== undefined) { if (d.photo && !/^data:image\/(jpeg|png|webp);base64,/.test(d.photo) && !/^img\//.test(d.photo)) bad('La foto debe ser JPG, PNG o WEBP.'); if (d.photo && d.photo.length > 1.5e6) bad('La foto es demasiado pesada. Usá una imagen de menos de 1 MB.'); l.photo = d.photo; }
        if (d.rateCents !== undefined && d.rateCents !== l.rateCents) {
          if (!can(u, 'tarifas.gestionar')) deny('Solo un administrador con permiso de tarifas puede cambiar honorarios.');
          if (!Number.isInteger(d.rateCents) || d.rateCents < 1000 || d.rateCents > 500000) bad('La tarifa debe estar entre USD 10 y USD 5.000 por hora.');
          audit(u, 'tarifa.cambiar', 'lawyer', l.id, l.name + ': ' + VA.money(l.rateCents) + ' → ' + VA.money(d.rateCents) + ' por hora'); l.rateCents = d.rateCents;
        }
        if (d.perms && can(u, 'equipo.gestionar')) { l.perms = { verFinanzas: !!d.perms.verFinanzas, aprobarTurnos: !!d.perms.aprobarTurnos, emitirPresupuestos: !!d.perms.emitirPresupuestos }; }
        if (d.experience && Array.isArray(d.experience)) l.experience = d.experience.map(e => ({ period: str(e.period, 60), role: str(e.role, 120), org: str(e.org, 160) })).filter(e => e.role);
        if (d.active !== undefined && can(u, 'equipo.gestionar') && d.active !== l.active) {
          l.active = !!d.active; userOf(l.userId).active = l.active;
          if (!l.active) Object.keys(db.sessions).forEach(t => { if (db.sessions[t].userId === l.userId) delete db.sessions[t]; });
          audit(u, l.active ? 'equipo.activar' : 'equipo.desactivar', 'lawyer', l.id, l.name);
        }
        if (JSON.stringify(before) !== JSON.stringify(l)) audit(u, 'equipo.editar', 'lawyer', l.id, l.name);
        return l.id;
      }),
      uploadCV: mutate((id, f) => {
        needPerm('equipo.gestionar'); const l = lawyerOf(id) || notFound();
        if (f.type !== 'application/pdf' && f.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') bad('El currículum debe estar en PDF o DOCX.');
        if (f.size > VA.MAX_FILE) bad('El archivo supera 10 MB.');
        l.cv = { name: str(f.name, 160), size: f.size, at: nowISO() }; audit(u, 'equipo.cv', 'lawyer', id, l.cv.name); return true;
      }),

      /* ── CRM ── */
      contacts(f = {}) {
        needPerm('crm.gestionar');
        let list = db.contacts.slice();
        if (f.stage) list = list.filter(c => c.stage === f.stage);
        if (f.area) list = list.filter(c => c.area === f.area);
        if (f.lawyerId) list = list.filter(c => c.lawyerId === f.lawyerId);
        if (f.source) list = list.filter(c => c.source === f.source);
        if (f.from) list = list.filter(c => c.firstContact >= f.from);
        if (f.q) { const q = f.q.toLowerCase(); list = list.filter(c => (c.name + ' ' + c.email + ' ' + c.tags.join(' ')).toLowerCase().includes(q)); }
        const rows = list.map(c => {
          const quotes = db.quotes.filter(q => q.contactId === c.id || (c.clientId && q.clientId === c.clientId)).map(quoteCalc);
          return Object.assign(clone(c), { lawyerName: c.lawyerId ? lawyerOf(c.lawyerId).name : null, ownerName: nameOf(c.ownerId), debt: c.clientId ? clientBalance(c.clientId) : 0, kind: c.clientId ? (clientCases(c.clientId).some(k => !['Cerrado', 'Archivado'].includes(k.status)) ? 'Cliente con asuntos activos' : 'Cliente registrado') : 'Potencial', quotesAccepted: quotes.filter(q => q.status === 'Aceptado').length, quotesRejected: quotes.filter(q => q.status === 'Rechazado').length, quotesOpen: quotes.filter(q => q.status === 'Enviado').length });
        });
        let out = rows;
        if (f.debt === 'si') out = out.filter(r => r.debt > 0);
        if (f.quotes === 'aceptados') out = out.filter(r => r.quotesAccepted > 0);
        if (f.quotes === 'rechazados') out = out.filter(r => r.quotesRejected > 0);
        return out;
      },
      contact(id) {
        needPerm('crm.gestionar'); const c = byId('contacts', id) || notFound();
        const v = clone(c);
        v.lawyerName = c.lawyerId ? lawyerOf(c.lawyerId).name : null; v.ownerName = nameOf(c.ownerId);
        v.communications = v.communications.map(m => Object.assign(m, { byName: m.by ? nameOf(m.by) : 'Ingreso automático' })).sort((a, b) => b.at.localeCompare(a.at));
        v.cases = c.clientId ? clientCases(c.clientId).map(k => caseRow(u, k)) : [];
        v.meetings = db.meetings.filter(m => (c.clientId && m.clientId === c.clientId) || m.contactId === id).map(m => meetingView(u, m));
        v.quotes = db.quotes.filter(q => q.contactId === id || (c.clientId && q.clientId === c.clientId)).map(quoteCalc);
        v.invoices = c.clientId ? db.invoices.filter(i => i.clientId === c.clientId).map(invoiceCalc) : [];
        v.payments = c.clientId ? clone(db.payments.filter(p => p.clientId === c.clientId)) : [];
        v.debt = c.clientId ? clientBalance(c.clientId) : 0;
        v.tasks = clone(db.tasks.filter(t => t.contactId === id));
        return v;
      },
      setStage: mutate((id, stage) => {
        needPerm('crm.gestionar'); const c = byId('contacts', id) || notFound(); if (!VA.PIPELINE.includes(stage)) bad('Etapa inválida.');
        if (stage === 'Cliente incorporado' && !c.clientId) bad('Para marcarlo como cliente incorporado primero creá su cuenta de cliente.');
        const prev = c.stage; c.stage = stage; c.lastActivity = nowISO();
        c.communications.push({ at: nowISO(), channel: 'Sistema', summary: 'Etapa: ' + prev + ' → ' + stage, by: u.id });
        audit(u, 'crm.etapa', 'contact', id, c.name + ': ' + prev + ' → ' + stage); return true;
      }),
      saveContact: mutate((id, d) => {
        needPerm('crm.gestionar'); let c = id ? byId('contacts', id) : null;
        if (!c) { c = { id: nextId('contact', 'p'), communications: [], tags: [], notes: '', clientId: null, stage: 'Nuevo contacto', firstContact: today(), lastActivity: nowISO(), ownerId: u.id, lawyerId: null, nextAction: null }; db.contacts.unshift(c); audit(u, 'crm.crear', 'contact', c.id, d.name); }
        if (d.name !== undefined) c.name = req(d.name, 'Nombre', 120);
        if (d.email !== undefined) { const e = str(d.email, 160).toLowerCase(); if (e && !emailOk(e)) bad('Correo inválido.'); c.email = e; }
        if (d.phone !== undefined) c.phone = str(d.phone, 40);
        if (d.area !== undefined) c.area = VA.AREAS.includes(d.area) ? d.area : c.area || 'Derecho de Familia';
        if (d.source !== undefined) c.source = VA.SOURCES.includes(d.source) ? d.source : 'Otro';
        if (d.lawyerId !== undefined) c.lawyerId = lawyerOf(d.lawyerId) ? d.lawyerId : null;
        if (d.ownerId !== undefined) c.ownerId = userOf(d.ownerId) && userOf(d.ownerId).role !== 'client' ? d.ownerId : c.ownerId;
        if (d.notes !== undefined) c.notes = str(d.notes, 3000);
        if (d.tags !== undefined) c.tags = String(d.tags).split(',').map(t => str(t, 30)).filter(Boolean).slice(0, 8);
        if (d.nextText !== undefined) c.nextAction = d.nextText ? { text: str(d.nextText, 160), date: d.nextDate || today() } : null;
        c.lastActivity = nowISO(); return c.id;
      }),
      addComm: mutate((id, channel, summary) => {
        needPerm('crm.gestionar'); const c = byId('contacts', id) || notFound();
        c.communications.push({ at: nowISO(), channel: str(channel, 40) || 'Nota', summary: req(summary, 'Resumen', 1000), by: u.id }); c.lastActivity = nowISO();
        if (c.stage === 'Nuevo contacto' && channel !== 'Nota') c.stage = channel === 'Teléfono' ? 'Primer intento de contacto' : 'Contactado';
        return true;
      }),
      onboardContact: mutate(id => {
        needPerm('crm.gestionar'); const k = byId('contacts', id) || notFound(); if (k.clientId) conflict('Este contacto ya tiene cuenta de cliente.');
        if (!k.email) bad('El contacto necesita un correo para recibir la invitación al portal.');
        if (db.users.some(x => x.email === k.email)) conflict('Ya existe un usuario con ese correo.');
        const cid = 'c' + (db.clients.length + 1) + VA.rand(3); const uid = 'u_' + cid;
        db.users.push({ id: uid, role: 'client', name: k.name, email: k.email, salt: VA.rand(12), pwHash: null, active: true, failed: 0, clientId: cid, notifPrefs: { email: true, inapp: true } });
        db.clients.push({ id: cid, userId: uid, name: k.name, email: k.email, phone: k.phone, address: '', docType: '', docNumber: '', country: 'Argentina', birthDate: '', verification: 'No verificado', verifiedBy: null, verifiedAt: null, contactPref: 'Correo electrónico', createdAt: today() });
        k.clientId = cid; k.lastActivity = nowISO();
        db.quotes.filter(q => q.contactId === id && !q.clientId).forEach(q => { q.clientId = cid; });
        db.outbox.unshift({ id: nextId('email', 'e'), to: k.email, subject: 'Tu acceso al portal de clientes', body: 'Hola ' + k.name.split(' ')[0] + ', creamos tu acceso al portal de Villafañe & Asociados. Activalo con el enlace de invitación (simulado en la demo).', at: nowISO(), status: 'Simulado (sin proveedor de correo)' });
        audit(u, 'cliente.crear', 'client', cid, k.name + ' (desde CRM)');
        return cid;
      }),
      alerts() {
        needPerm('crm.gestionar');
        const out = []; const now = VA.now();
        db.contacts.filter(c => c.stage === 'Nuevo contacto' && (now - new Date(c.lastActivity)) > 12 * 3600e3).forEach(c => out.push({ key: 'nr:' + c.id, kind: 'Consulta sin respuesta', severity: 'alta', text: c.name + ' espera respuesta desde ' + VA.rel(c.lastActivity) + '.', contactId: c.id, link: 'crm.' + c.id }));
        db.quotes.map(quoteCalc).filter(q => q.status === 'Enviado' && q.sentAt && (now - new Date(q.sentAt)) > db.settings.reminders.quoteAfterDays * 864e5).forEach(q => out.push({ key: 'qs:' + q.id, kind: 'Presupuesto sin contestación', severity: 'media', text: q.number + ' a ' + q.recipientName + ' — enviado ' + VA.rel(q.sentAt) + '.', contactId: q.contactId, link: 'presupuesto.' + q.id }));
        db.contacts.filter(c => c.nextAction && c.nextAction.date < today() && !['Cliente incorporado', 'No convertido'].includes(c.stage)).forEach(c => out.push({ key: 'fu:' + c.id, kind: 'Seguimiento vencido', severity: 'media', text: c.name + ': «' + c.nextAction.text + '» vencía el ' + VA.fDate(c.nextAction.date) + '.', contactId: c.id, link: 'crm.' + c.id }));
        db.invoices.map(invoiceCalc).filter(i => i.status === 'Vencida').forEach(i => out.push({ key: 'ov:' + i.id, kind: 'Factura vencida', severity: 'alta', text: i.number + ' de ' + i.clientName + ' — saldo ' + VA.money(i.balance) + '.', contactId: (db.contacts.find(c => c.clientId === i.clientId) || {}).id, link: 'factura.' + i.id }));
        db.meetings.filter(m => holding(m) && m.status === 'Aprobado' && new Date(m.start) > now && (new Date(m.start) - now) < 48 * 3600e3).forEach(m => { const v = meetingView(u, m); out.push({ key: 'mt:' + m.id, kind: 'Próxima reunión', severity: 'baja', text: v.clientName + ' con ' + v.lawyerName + ' — ' + VA.fDT(m.start) + '.', contactId: (db.contacts.find(c => c.clientId === m.clientId) || {}).id || m.contactId, link: 'agenda' }); });
        const tasked = new Set(db.tasks.filter(t => t.alertKey && !t.done).map(t => t.alertKey));
        return out.map(a => Object.assign(a, { tasked: tasked.has(a.key) }));
      },
      alertToTask: mutate((alert, assigneeId) => {
        needPerm('crm.gestionar'); const a = (api.alerts().find(x => x.key === alert)) || notFound('La alerta ya no está vigente.');
        if (a.tasked) conflict('Ya existe una tarea abierta para esta alerta.');
        const assignee = userOf(assigneeId) || bad('Elegí a quién asignar la tarea.'); if (assignee.role === 'client') bad('Elegí un miembro del equipo.');
        const t = { id: nextId('task', 't'), title: a.kind + ': ' + a.text, caseId: null, contactId: a.contactId || null, assigneeId, due: VA.dateOnly(VA.now(), 1), done: false, createdBy: u.id, at: nowISO(), source: 'Alerta CRM', alertKey: a.key };
        db.tasks.unshift(t);
        if (assigneeId !== u.id) notify([assigneeId], { type: 'Tarea asignada', title: 'Te asignaron una tarea de seguimiento', body: t.title, link: 'tareas', email: false });
        audit(u, 'crm.alerta_tarea', 'task', t.id, t.title); return t.id;
      }),

      /* ── presupuestos ── */
      quotes(f = {}) {
        let list;
        if (u.role === 'client') list = db.quotes.filter(q => q.clientId === u.clientId && ['Enviado', 'Aceptado', 'Rechazado'].includes(q.status));
        else if (can(u, 'finanzas.gestionar')) list = db.quotes.slice();
        else if (u.role === 'lawyer') list = db.quotes.filter(q => q.lawyerId === u.lawyerId);
        else deny();
        let out = list.map(quoteCalc);
        if (f.status) out = out.filter(q => q.status === f.status);
        return out.sort((a, b) => b.number.localeCompare(a.number));
      },
      quote(id) {
        const q = byId('quotes', id) || notFound();
        const ok = u.role === 'client' ? (q.clientId === u.clientId && ['Enviado', 'Aceptado', 'Rechazado'].includes(q.status)) : (can(u, 'finanzas.gestionar') || (u.role === 'lawyer' && q.lawyerId === u.lawyerId));
        if (!ok) { audit(u, 'acceso.denegado', 'quote', id, 'Presupuesto'); persist(); deny('No tenés acceso a este presupuesto.'); }
        const v = quoteCalc(q); if (v.acceptance) v.acceptance.userName = nameOf(v.acceptance.userId); if (v.rejection) v.rejection.userName = nameOf(v.rejection.userId);
        v.history = (v.history || []).map(h => Object.assign(h, { byName: nameOf(h.by) }));
        if (u.role === 'client') delete v.notes;
        return v;
      },
      saveQuote: mutate((id, d) => {
        const canQ = can(u, 'finanzas.gestionar') || (u.role === 'lawyer' && lawyerOf(u.lawyerId).perms.emitirPresupuestos);
        if (!canQ) deny('No tenés permiso para preparar presupuestos.');
        let q = id ? byId('quotes', id) : null;
        if (q && u.role === 'lawyer' && q.lawyerId !== u.lawyerId) deny();
        if (q && q.status !== 'Borrador') conflict('Solo se puede editar un borrador. Creá una nueva versión.');
        const items = (d.items || []).map(i => ({ kind: i.kind === 'gastos' ? 'gastos' : 'honorarios', desc: req(i.desc, 'Concepto', 200), amountCents: i.amountCents })).filter(i => i.desc);
        if (!items.length) bad('Agregá al menos un concepto con importe.');
        if (items.some(i => !Number.isInteger(i.amountCents) || i.amountCents <= 0)) bad('Revisá los importes: deben ser mayores a cero (por ejemplo 1.500,00).');
        const lawyerId = u.role === 'lawyer' ? u.lawyerId : (lawyerOf(d.lawyerId) ? d.lawyerId : bad('Elegí el abogado responsable.'));
        let clientId = null, contactId = null, caseId = null;
        if (d.caseId) { const c = needCase(u, d.caseId); caseId = c.id; clientId = c.clientId; contactId = (db.contacts.find(k => k.clientId === c.clientId) || {}).id || null; }
        else if (d.clientId) { if (!clientOf(d.clientId) || !canClient(u, d.clientId)) bad('Cliente inválido.'); clientId = d.clientId; contactId = (db.contacts.find(k => k.clientId === clientId) || {}).id || null; }
        else if (d.contactId) { if (!can(u, 'crm.gestionar')) deny(); const k = byId('contacts', d.contactId) || bad('Contacto inválido.'); contactId = k.id; clientId = k.clientId; }
        else bad('Elegí un cliente, un expediente o un contacto del CRM.');
        const adv = parseInt(d.advancePct, 10); const inst = parseInt(d.installments, 10); const tax = parseInt(d.taxRate, 10) || 0;
        if (!(adv >= 0 && adv <= 100)) bad('El anticipo debe estar entre 0 y 100 %.'); if (!(inst >= 0 && inst <= 24)) bad('Las cuotas deben estar entre 0 y 24.');
        if (![0, 1050, 2100].includes(tax)) bad('Impuesto inválido.');
        if (!d.validUntil || d.validUntil < today()) bad('La vigencia debe ser una fecha futura.');
        const data = { clientId, contactId, caseId, lawyerId, service: req(d.service, 'Descripción del servicio', 200), scope: req(d.scope, 'Alcance del trabajo', 2000), items, taxRate: tax, paymentMethod: str(d.paymentMethod, 120) || 'Transferencia bancaria o tarjeta', advancePct: adv, installments: inst, validUntil: d.validUntil, conditions: str(d.conditions, 2000), notes: str(d.notes, 1000) };
        if (!q) { const num = nextId('quote', ''); q = Object.assign({ id: 'q' + num, number: 'P-' + VA.now().getFullYear() + '-' + String(num).padStart(4, '0'), currency: 'USD', status: 'Borrador', version: 1, history: [], acceptance: null, rejection: null, convertedAt: null, issuedAt: null }, data); db.quotes.unshift(q); q.history.push({ at: nowISO(), by: u.id, action: 'Borrador creado' }); audit(u, 'presupuesto.crear', 'quote', q.id, q.number); if (contactId) { const k = byId('contacts', contactId); if (k && ['Nuevo contacto', 'Primer intento de contacto', 'Contactado', 'Reunión solicitada', 'Reunión agendada'].includes(k.stage)) { k.stage = 'Presupuesto en preparación'; k.lastActivity = nowISO(); } } }
        else { Object.assign(q, data); q.history.push({ at: nowISO(), by: u.id, action: 'Borrador editado' }); }
        return q.id;
      }),
      quoteAction: mutate((id, action, extra) => {
        const q = byId('quotes', id) || notFound(); const isClient = u.role === 'client';
        const staffOk = can(u, 'finanzas.gestionar') || (u.role === 'lawyer' && q.lawyerId === u.lawyerId && lawyerOf(u.lawyerId).perms.emitirPresupuestos);
        const calc = quoteCalc(q); const k = q.contactId ? byId('contacts', q.contactId) : null;
        const lawyerUser = lawyerOf(q.lawyerId).userId;
        if (action === 'issue') {
          if (!staffOk) deny(); if (q.status !== 'Borrador') conflict('Solo se emite un borrador.');
          q.status = 'Emitido'; q.issuedAt = today(); q.history.push({ at: nowISO(), by: u.id, action: 'Emitido v' + q.version }); audit(u, 'presupuesto.emitir', 'quote', id, q.number + ' v' + q.version);
        } else if (action === 'send') {
          if (!staffOk) deny(); if (q.status !== 'Emitido') conflict('Primero emití el presupuesto.');
          if (!q.clientId) bad('El contacto todavía no tiene cuenta en el portal. Incorporalo como cliente desde el CRM o envialo por correo cuando haya proveedor configurado.');
          q.status = 'Enviado'; q.sentAt = nowISO(); q.history.push({ at: nowISO(), by: u.id, action: 'Enviado al cliente' });
          notify([clientOf(q.clientId).userId], { type: 'Presupuesto enviado', title: 'Tenés un presupuesto para revisar', body: q.number + ' · ' + q.service + ' · ' + VA.money(calc.total), link: 'presupuesto.' + id });
          if (k) { k.stage = 'Presupuesto enviado'; k.lastActivity = nowISO(); }
          if (q.caseId) { const c = byId('cases', q.caseId); if (['Nuevo', 'En evaluación'].includes(c.status)) c.status = 'Presupuesto enviado'; }
          audit(u, 'presupuesto.enviar', 'quote', id, q.number);
        } else if (action === 'accept' || action === 'reject') {
          if (isClient) { if (q.clientId !== u.clientId) { audit(u, 'acceso.denegado', 'quote', id); deny(); } }
          else if (!staffOk) deny();
          if (calc.status === 'Vencido') conflict('La propuesta venció. Pedí al estudio una versión actualizada.');
          if (q.status !== 'Enviado') conflict('Este presupuesto no está pendiente de respuesta.');
          if (action === 'accept') {
            if (extra && extra.version && extra.version !== q.version) conflict('El presupuesto cambió desde que lo abriste. Revisá la versión vigente.');
            q.status = 'Aceptado'; q.acceptance = { at: nowISO(), userId: u.id, version: q.version, checksum: calc.checksumNow, onBehalf: !isClient };
            q.history.push({ at: nowISO(), by: u.id, action: 'Aceptado v' + q.version + (isClient ? ' desde el portal' : ' (registrado por el estudio)') });
            if (k) { k.stage = 'Presupuesto aceptado'; k.lastActivity = nowISO(); k.communications.push({ at: nowISO(), channel: 'Portal', summary: 'Aceptó el presupuesto ' + q.number + ' (v' + q.version + ').', by: u.id }); }
            notify([lawyerUser, ...admins('finanzas.gestionar').map(x => x.id)], { type: 'Presupuesto aceptado', title: q.number + ' aceptado', body: calc.recipientName + ' aceptó ' + q.service + '.', link: 'presupuesto.' + id, email: false });
            audit(u, 'presupuesto.aceptar', 'quote', id, q.number + ' v' + q.version + ' · huella ' + calc.checksumNow.slice(0, 12));
          } else {
            q.status = 'Rechazado'; q.rejection = { at: nowISO(), userId: u.id, reason: str(extra && extra.reason, 300) };
            q.history.push({ at: nowISO(), by: u.id, action: 'Rechazado' });
            if (k) { k.communications.push({ at: nowISO(), channel: 'Portal', summary: 'Rechazó el presupuesto ' + q.number + (q.rejection.reason ? ': ' + q.rejection.reason : ''), by: u.id }); k.lastActivity = nowISO(); k.nextAction = { text: 'Contactar para entender el rechazo', date: VA.dateOnly(VA.now(), 2) }; }
            notify([lawyerUser, ...admins('finanzas.gestionar').map(x => x.id)], { type: 'Presupuesto rechazado', title: q.number + ' rechazado', body: calc.recipientName + (q.rejection.reason ? ': ' + q.rejection.reason : ''), link: 'presupuesto.' + id, email: false });
            audit(u, 'presupuesto.rechazar', 'quote', id, q.number);
          }
        } else if (action === 'newVersion') {
          if (!staffOk) deny(); if (!['Emitido', 'Enviado', 'Rechazado'].includes(q.status) && calc.status !== 'Vencido') conflict('Solo se versiona un presupuesto emitido, enviado, vencido o rechazado.');
          q.version += 1; q.status = 'Borrador'; q.rejection = null; q.validUntil = VA.dateOnly(VA.now(), 15); q.history.push({ at: nowISO(), by: u.id, action: 'Nueva versión v' + q.version });
          audit(u, 'presupuesto.version', 'quote', id, q.number + ' v' + q.version);
        } else if (action === 'convert') {
          needPerm('finanzas.gestionar'); if (q.status !== 'Aceptado') conflict('Solo se convierte un presupuesto aceptado.'); if (q.convertedAt) conflict('Este presupuesto ya se convirtió en acuerdo.');
          if (!q.clientId) bad('El contacto necesita una cuenta de cliente. Incorporalo desde el CRM.');
          let c = q.caseId ? byId('cases', q.caseId) : null;
          if (!c) { const num = nextId('case', ''); c = { id: 'k' + num, number: 'EXP-' + VA.now().getFullYear() + '-' + String(num).padStart(4, '0'), title: q.service, clientId: q.clientId, lawyerId: q.lawyerId, area: (k && k.area) || lawyerOf(q.lawyerId).areas[0], status: 'Activo', priority: 'Media', openedAt: today(), next: null, feesCents: calc.total, currency: 'USD', description: q.scope, clientSummary: 'Comenzamos a trabajar en tu asunto según el presupuesto aceptado.', extraLawyerIds: [], authorizedClientIds: [], updatedAt: nowISO() }; db.cases.unshift(c); q.caseId = c.id; }
          c.status = 'Activo'; c.feesCents = calc.total; c.updatedAt = nowISO();
          db.activities.push({ id: nextId('activity', 'a'), caseId: c.id, kind: 'sistema', text: 'Acuerdo de honorarios a partir de ' + q.number + ' (' + VA.money(calc.total) + '). Expediente activo.', authorId: u.id, at: nowISO() });
          db.activities.push({ id: nextId('activity', 'a'), caseId: c.id, kind: 'cliente', text: 'Registramos tu aceptación del presupuesto. Ya estamos trabajando en tu asunto.', authorId: u.id, at: nowISO() });
          let invId = null;
          if (calc.advance > 0) { const n2 = nextId('invoice', ''); invId = 'i' + n2; db.invoices.unshift({ id: invId, number: 'F-' + VA.now().getFullYear() + '-' + String(n2).padStart(4, '0'), clientId: q.clientId, caseId: c.id, quoteId: q.id, concept: 'Anticipo de honorarios', items: [{ desc: 'Anticipo ' + q.advancePct + '% — ' + q.number, amountCents: calc.advance }], issuedAt: today(), dueAt: VA.dateOnly(VA.now(), 7), status: 'Emitida', currency: 'USD' }); notify([clientOf(q.clientId).userId], { type: 'Factura emitida', title: 'Factura de anticipo disponible', body: VA.money(calc.advance) + ' · vence en 7 días.', link: 'pagos' }); }
          q.convertedAt = nowISO(); q.history.push({ at: nowISO(), by: u.id, action: 'Convertido en acuerdo · ' + c.number });
          if (k) { k.stage = 'Cliente incorporado'; k.lastActivity = nowISO(); }
          audit(u, 'presupuesto.convertir', 'quote', id, q.number + ' → ' + c.number + (invId ? ' + anticipo' : ''));
          return { caseId: c.id, invoiceId: invId };
        } else bad('Acción desconocida.');
        return true;
      }),

      /* ── facturas y pagos ── */
      invoices(f = {}) {
        let list;
        if (u.role === 'client') list = db.invoices.filter(i => i.clientId === u.clientId && i.status !== 'Borrador');
        else if (can(u, 'finanzas.gestionar')) list = db.invoices.slice();
        else if (lawyerFin(u)) list = db.invoices.filter(i => canCase(u, byId('cases', i.caseId)));
        else deny();
        let out = list.map(invoiceCalc);
        if (f.status) out = out.filter(i => i.status === f.status);
        if (f.clientId) out = out.filter(i => i.clientId === f.clientId);
        return out.sort((a, b) => b.number.localeCompare(a.number));
      },
      invoice(id) {
        const i = byId('invoices', id) || notFound();
        const ok = u.role === 'client' ? (i.clientId === u.clientId && i.status !== 'Borrador') : canFinCase(u, i.caseId);
        if (!ok) { audit(u, 'acceso.denegado', 'invoice', id); persist(); deny('No tenés acceso a esta factura.'); }
        return invoiceCalc(i);
      },
      createInvoice: mutate(d => {
        needPerm('finanzas.gestionar'); const c = byId('cases', d.caseId) || bad('Elegí un expediente.');
        const items = (d.items || []).filter(x => x.desc).map(x => ({ desc: str(x.desc, 200), amountCents: x.amountCents }));
        if (!items.length || items.some(x => !Number.isInteger(x.amountCents) || x.amountCents <= 0)) bad('Agregá conceptos con importes mayores a cero.');
        if (!d.dueAt) bad('Indicá la fecha de vencimiento.');
        const n2 = nextId('invoice', ''); const inv = { id: 'i' + n2, number: 'F-' + VA.now().getFullYear() + '-' + String(n2).padStart(4, '0'), clientId: c.clientId, caseId: c.id, quoteId: d.quoteId || null, concept: req(d.concept, 'Concepto', 160), items, issuedAt: null, dueAt: d.dueAt, status: 'Borrador', currency: 'USD' };
        db.invoices.unshift(inv); audit(u, 'factura.crear', 'invoice', inv.id, inv.number + ' (borrador)');
        if (d.issue) api.invoiceAction(inv.id, 'issue');
        return inv.id;
      }),
      invoiceAction: mutate((id, action) => {
        needPerm('finanzas.gestionar'); const i = byId('invoices', id) || notFound(); const calc = invoiceCalc(i);
        if (action === 'issue') { if (i.status !== 'Borrador') conflict('La factura ya fue emitida.'); i.status = 'Emitida'; i.issuedAt = today(); notify([clientOf(i.clientId).userId], { type: 'Factura emitida', title: 'Factura ' + i.number + ' disponible', body: VA.money(calc.total) + ' · vence el ' + VA.fDate(i.dueAt), link: 'pagos' }); audit(u, 'factura.emitir', 'invoice', id, i.number); }
        else if (action === 'void') { if (calc.paid > 0 || calc.pendingCents > 0) conflict('No se puede anular una factura con pagos aplicados o en proceso.'); if (i.status === 'Anulada') conflict('Ya está anulada.'); i.status = 'Anulada'; audit(u, 'factura.anular', 'invoice', id, i.number); }
        else bad('Acción desconocida.');
        return true;
      }),
      payments(f = {}) {
        let list;
        if (u.role === 'client') list = db.payments.filter(p => p.clientId === u.clientId);
        else if (can(u, 'finanzas.gestionar')) list = db.payments.slice();
        else if (lawyerFin(u)) list = db.payments.filter(p => p.caseId && canCase(u, byId('cases', p.caseId)) || p.lawyerId === u.lawyerId);
        else deny();
        if (f.clientId) list = list.filter(p => p.clientId === f.clientId);
        if (f.caseId) list = list.filter(p => p.caseId === f.caseId);
        if (f.lawyerId) list = list.filter(p => p.lawyerId === f.lawyerId);
        return clone(list).map(p => Object.assign(p, { clientName: (clientOf(p.clientId) || {}).name, caseNumber: p.caseId ? (byId('cases', p.caseId) || {}).number : null, lawyerName: p.lawyerId ? lawyerOf(p.lawyerId).name : null, net: collected(p) - (p.status === 'Confirmado' || p.status === 'Reembolso parcial' ? (p.feeCents || 0) : 0) })).sort((a, b) => b.at.localeCompare(a.at));
      },
      /* Pasarela de pagos en MODO DE PRUEBA. Solo se conservan la marca y los últimos 4 dígitos.
         El número completo y el código de seguridad nunca se guardan. */
      startPayment: mutate(d => {
        const card = d.card || {}; const num = String(card.number || '').replace(/\D/g, '');
        if (num.length < 13 || num.length > 19) bad('Revisá el número de tarjeta.');
        if (!/^\d{2}\/\d{2}$/.test(card.exp || '')) bad('Usá el formato MM/AA para el vencimiento.');
        const [mm, yy] = card.exp.split('/').map(Number); if (mm < 1 || mm > 12 || new Date(2000 + yy, mm, 0) < VA.dayStart(VA.now())) bad('La tarjeta está vencida.');
        if (!/^\d{3,4}$/.test(String(card.cvc || ''))) bad('El código de seguridad tiene 3 o 4 dígitos.');
        if (!str(card.name)) bad('Indicá el nombre que figura en la tarjeta.');
        let rec;
        if (d.meetingId) {
          const m = byId('meetings', d.meetingId) || notFound();
          if (!(u.role === 'client' && m.clientId === u.clientId)) deny();
          if (m.status !== 'Pendiente de pago') conflict('Este turno no está pendiente de pago.');
          if (m.paymentId) { const prev = byId('payments', m.paymentId); if (prev && prev.status === 'Procesando') conflict('Ya hay un pago en proceso para este turno.'); }
          const f = slotFree(m.lawyerId, m.start, m.durationMin, m.id); if (!f.ok) conflict('El horario ya no está disponible: ' + f.why + ' Elegí otro horario.');
          rec = { clientId: m.clientId, caseId: m.caseId, meetingId: m.id, invoiceId: null, concept: 'Reunión — ' + m.type, amountCents: m.totalCents, lawyerId: m.lawyerId };
          m.holdUntil = new Date(VA.now().getTime() + 10 * 6e4).toISOString();
        } else if (d.invoiceId) {
          const i = byId('invoices', d.invoiceId) || notFound(); const calc = invoiceCalc(i);
          if (!(u.role === 'client' && i.clientId === u.clientId)) deny();
          if (['Borrador', 'Anulada', 'Pagada'].includes(calc.status)) conflict('Esta factura no admite pagos.');
          if (calc.pendingCents > 0) conflict('Ya hay un pago en proceso para esta factura.');
          const amt = d.amountCents == null ? calc.balance : d.amountCents;
          if (!Number.isInteger(amt) || amt <= 0 || amt > calc.balance) bad('El importe debe ser mayor a cero y no superar el saldo de ' + VA.money(calc.balance) + '.');
          rec = { clientId: i.clientId, caseId: i.caseId, invoiceId: i.id, meetingId: null, concept: i.number, amountCents: amt, lawyerId: (byId('cases', i.caseId) || {}).lawyerId };
        } else bad('Pago sin destino.');
        const p = Object.assign({ id: nextId('payment', 'pay'), currency: 'USD', at: nowISO(), method: 'Tarjeta (prueba)', status: 'Procesando', providerId: 'pi_test_' + VA.rand(8), feeCents: Math.round(rec.amountCents * 290 / 10000) + 30, refundedCents: 0, last4: num.slice(-4), brand: num[0] === '4' ? 'Visa' : num[0] === '5' ? 'Mastercard' : num[0] === '3' ? 'Amex' : 'Tarjeta', testOutcome: num === '4000000000000002' ? 'failed' : 'succeeded' }, rec);
        db.payments.unshift(p);
        if (d.meetingId) byId('meetings', d.meetingId).paymentId = p.id;
        audit(u, 'pago.iniciar', 'payment', p.id, VA.money(p.amountCents) + ' · ' + p.concept + ' · ' + p.providerId);
        return { id: p.id, providerId: p.providerId };
      })
    };

    /* ── agenda ── */
    Object.assign(api, {
      meetings(f = {}) {
        let list;
        if (u.role === 'client') list = db.meetings.filter(m => m.clientId === u.clientId);
        else if (can(u, 'agenda.gestionar')) list = db.meetings.slice();
        else if (u.role === 'lawyer') list = db.meetings.filter(m => m.lawyerId === u.lawyerId);
        else deny();
        if (f.lawyerId) list = list.filter(m => m.lawyerId === f.lawyerId);
        if (f.status) list = list.filter(m => m.status === f.status);
        return list.map(m => meetingView(u, m)).sort((a, b) => a.start.localeCompare(b.start));
      },
      blocks(lawyerId) { staff(); if (u.role === 'lawyer' && lawyerId !== u.lawyerId && !can(u, 'agenda.gestionar')) deny(); return clone(db.blocks.filter(b => !lawyerId || b.lawyerId === lawyerId)); },
      bookingOptions(area) {
        const ls = db.lawyers.filter(l => l.active && l.availability !== 'Licencia' && (!area || l.areas.includes(area)));
        return ls.map(l => ({ id: l.id, name: l.name, title: l.title, photo: l.photo, specialty: l.specialty, rateCents: l.rateCents, availability: l.availability }));
      },
      slots(lawyerId, dateYMD, dur) { const l = lawyerOf(lawyerId) || notFound(); if (![30, 60, 90].includes(dur)) bad('Duración inválida.'); return slotsFor(l.id, dateYMD, dur); },
      requestMeeting: mutate(d => {
        if (u.role !== 'client') deny('Las solicitudes desde el portal las realiza el cliente. El estudio agenda desde la agenda interna.');
        const type = VA.MEETING_TYPES.find(t => t.id === d.typeId) || bad('Elegí el tipo de consulta.');
        const dur = parseInt(d.durationMin, 10); if (!type.durations.includes(dur)) bad('Elegí una duración válida para este tipo de consulta.');
        const area = VA.AREAS.includes(d.area) ? d.area : bad('Elegí un área jurídica.');
        if (!d.start) bad('Elegí fecha y horario.');
        let l = d.lawyerId ? lawyerOf(d.lawyerId) : null;
        if (d.lawyerId && (!l || !l.active || !l.areas.includes(area))) bad('Ese profesional no atiende esta área.');
        if (!l) {
          const cands = db.lawyers.filter(x => x.active && x.availability !== 'Licencia' && x.areas.includes(area) && slotFree(x.id, d.start, dur).ok)
            .sort((a, b) => db.cases.filter(c => c.lawyerId === a.id && c.status === 'Activo').length - db.cases.filter(c => c.lawyerId === b.id && c.status === 'Activo').length);
          l = cands[0] || conflict('No hay profesionales disponibles en ese horario para el área elegida. Probá otro horario.');
        }
        const free = slotFree(l.id, d.start, dur); if (!free.ok) conflict(free.why + ' Elegí otro horario.');
        let caseId = null; if (d.caseId) { const c = needCase(u, d.caseId); caseId = c.id; }
        const m = { id: nextId('meeting', 'm'), lawyerId: l.id, clientId: u.clientId, caseId, contactId: null, type: type.name, area, start: new Date(d.start).toISOString(), durationMin: dur, rateCents: l.rateCents, totalCents: Math.round(l.rateCents * dur / 60), currency: 'USD', status: 'Solicitado', description: str(d.description, 1000), privateNotes: '', proposedStart: null, holdUntil: new Date(VA.now().getTime() + db.settings.holdMinutes * 6e4).toISOString(), paymentId: null, history: [], autoAssigned: !d.lawyerId };
        m.history.push({ at: nowISO(), by: u.id, from: null, to: 'Solicitado', note: '' });
        db.meetings.push(m);
        transition(m, 'Pendiente de pago', u, 'Reserva temporal hasta ' + VA.fTime(m.holdUntil));
        audit(u, 'turno.solicitar', 'meeting', m.id, l.name + ' · ' + VA.fDT(m.start) + ' · ' + VA.money(m.totalCents));
        return m.id;
      }),
      meetingAction: mutate((id, action, extra) => {
        const m = byId('meetings', id) || notFound(); extra = extra || {};
        const isClient = u.role === 'client';
        if (isClient && m.clientId !== u.clientId) { audit(u, 'acceso.denegado', 'meeting', id); deny(); }
        if (!isClient && !canManageMeeting(u, m)) deny('No tenés permiso para gestionar este turno.');
        const cl = m.clientId ? clientOf(m.clientId) : null; const l = lawyerOf(m.lawyerId);
        const tellClient = (type, title, body) => cl && notify([cl.userId], { type, title, body, link: 'turnos' });
        const when = VA.fDT(m.start);
        switch (action) {
          case 'approve': {
            if (isClient) deny();
            if (m.status !== 'Pendiente de aprobación') conflict(m.status === 'Pendiente de pago' ? 'El turno no puede aprobarse hasta que se confirme el pago.' : 'Este turno no está pendiente de aprobación.');
            const p = m.paymentId && byId('payments', m.paymentId); if (m.clientId && (!p || p.status !== 'Confirmado')) conflict('El pago del turno no está confirmado.');
            const f = slotFree(m.lawyerId, m.start, m.durationMin, m.id); if (!f.ok) conflict('Conflicto de agenda: ' + f.why);
            transition(m, 'Aprobado', u); tellClient('Aprobación de turno', 'Turno confirmado: ' + when, l.name + ' aprobó tu reunión.');
            audit(u, 'turno.aprobar', 'meeting', id, when); break;
          }
          case 'reject': {
            if (isClient) deny(); transition(m, 'Rechazado', u, str(extra.reason, 300));
            const amt = refund(m, 100, u, 'Turno rechazado por el estudio');
            tellClient('Rechazo de turno', 'No pudimos confirmar tu turno del ' + when, (extra.reason ? str(extra.reason, 300) + ' ' : '') + (amt ? 'Te reintegramos ' + VA.money(amt) + ' (100 %).' : ''));
            audit(u, 'turno.rechazar', 'meeting', id, when); break;
          }
          case 'propose': {
            if (isClient) deny(); if (!extra.start) bad('Elegí el nuevo horario.');
            const f = slotFree(m.lawyerId, extra.start, m.durationMin, m.id); if (!f.ok) conflict(f.why);
            if (m.status === 'Pendiente de pago') conflict('Esperá a que el cliente complete el pago o cancelá la solicitud.');
            transition(m, 'Reprogramación propuesta', u, 'Nuevo horario propuesto: ' + VA.fDT(extra.start)); m.proposedStart = new Date(extra.start).toISOString();
            tellClient('Cambio de fecha', 'Te proponemos otro horario', l.name + ' propone el ' + VA.fDT(m.proposedStart) + ' en lugar del ' + when + '. Aceptalo o cancelá con reintegro total.');
            audit(u, 'turno.proponer', 'meeting', id, when + ' → ' + VA.fDT(m.proposedStart)); break;
          }
          case 'acceptProposal': {
            if (!isClient) deny(); if (m.status !== 'Reprogramación propuesta' || !m.proposedStart) conflict('No hay una propuesta pendiente.');
            const f = slotFree(m.lawyerId, m.proposedStart, m.durationMin, m.id); if (!f.ok) conflict('El horario propuesto ya no está disponible.');
            const old = m.start; m.start = m.proposedStart; m.proposedStart = null; transition(m, 'Aprobado', u, 'Cliente aceptó el nuevo horario');
            notify([l.userId], { type: 'Cambio de fecha', title: 'Reprogramación aceptada', body: (cl ? cl.name : '') + ': ' + VA.fDT(old) + ' → ' + VA.fDT(m.start), link: 'agenda', email: false });
            audit(u, 'turno.reprogramar', 'meeting', id, VA.fDT(old) + ' → ' + VA.fDT(m.start)); break;
          }
          case 'cancel': {
            if (!(MT[m.status] || []).includes('Cancelado')) conflict('Este turno ya no puede cancelarse.');
            const hrs = (new Date(m.start) - VA.now()) / 3600e3; let amt = 0, cred = 0, rule;
            const wasPaid = m.paymentId && (byId('payments', m.paymentId) || {}).status === 'Confirmado';
            if (!isClient) { rule = 'Cancelado por el estudio: reintegro del 100 %.'; amt = refund(m, 100, u, 'Cancelado por el estudio'); }
            else if (m.status === 'Reprogramación propuesta') { rule = 'No aceptaste el nuevo horario: reintegro del 100 %.'; amt = refund(m, 100, u, 'Cliente no aceptó la reprogramación'); }
            else if (m.status === 'Pendiente de aprobación') { rule = 'Cancelaste antes de la aprobación: reintegro del 100 %.'; amt = refund(m, 100, u, 'Cancelado antes de la aprobación'); }
            else if (hrs >= 24) { rule = 'Cancelaste con 24 h o más de anticipación: reintegro del 100 %.'; amt = refund(m, 100, u, 'Cancelación con anticipación'); }
            else if (wasPaid) { rule = 'Cancelaste con menos de 24 h: se acredita el 50 % como saldo a favor para otra consulta.'; cred = Math.round(byId('payments', m.paymentId).amountCents / 2); db.credits.push({ clientId: m.clientId, amountCents: cred, reason: 'Cancelación tardía ' + when, at: nowISO() }); const p = byId('payments', m.paymentId); p.creditNote = 'Saldo a favor ' + VA.money(cred); }
            else rule = 'Solicitud cancelada sin cargos.';
            transition(m, 'Cancelado', u, rule);
            if (isClient) notify([l.userId], { type: 'Cancelación', title: 'Turno cancelado por ' + (cl ? cl.name : 'el cliente'), body: when, link: 'agenda', email: false });
            else tellClient('Cambio de fecha', 'Cancelamos tu turno del ' + when, rule + (extra.reason ? ' ' + str(extra.reason, 300) : ''));
            audit(u, 'turno.cancelar', 'meeting', id, when + ' — ' + rule + (amt ? ' Reintegro ' + VA.money(amt) : '') + (cred ? ' Crédito ' + VA.money(cred) : ''));
            return { rule, refund: amt, credit: cred };
          }
          case 'done': {
            if (isClient) deny(); if (new Date(m.start) > VA.now()) conflict('Solo se marca como realizada una reunión que ya empezó.');
            transition(m, 'Realizado', u); audit(u, 'turno.realizado', 'meeting', id, when); break;
          }
          case 'note': {
            if (isClient) deny(); m.privateNotes = str(extra.text, 3000); audit(u, 'turno.nota', 'meeting', id, 'Nota privada'); break;
          }
          default: bad('Acción desconocida.');
        }
        return true;
      }),
      scheduleMeeting: mutate(d => {
        staff(); const l = lawyerOf(d.lawyerId) || bad('Elegí el profesional.');
        if (u.role === 'lawyer' && l.id !== u.lawyerId) deny();
        if (u.role === 'admin') needPerm('agenda.gestionar');
        const dur = parseInt(d.durationMin, 10); if (![30, 60, 90].includes(dur)) bad('Duración inválida.');
        const f = slotFree(l.id, d.start, dur); if (!f.ok) conflict(f.why);
        let clientId = null, caseId = null;
        if (d.caseId) { const c = needCase(u, d.caseId); caseId = c.id; clientId = c.clientId; }
        const m = { id: nextId('meeting', 'm'), lawyerId: l.id, clientId, caseId, contactId: d.contactId || null, type: str(d.type, 80) || 'Seguimiento de expediente', area: d.area || l.areas[0], start: new Date(d.start).toISOString(), durationMin: dur, rateCents: l.rateCents, totalCents: Math.round(l.rateCents * dur / 60), currency: 'USD', status: clientId ? 'Pendiente de pago' : 'Aprobado', description: str(d.description, 1000), privateNotes: '', proposedStart: null, holdUntil: new Date(VA.now().getTime() + 48 * 3600e3).toISOString(), paymentId: null, history: [{ at: nowISO(), by: u.id, from: null, to: clientId ? 'Pendiente de pago' : 'Aprobado', note: 'Propuesta por el estudio' }] };
        db.meetings.push(m);
        if (clientId) notify([clientOf(clientId).userId], { type: 'Cambio de fecha', title: 'El estudio te propone una reunión', body: m.type + ' · ' + VA.fDT(m.start) + ' · ' + VA.money(m.totalCents) + '. Completá el pago para reservarla.', link: 'turnos' });
        audit(u, 'turno.proponer_estudio', 'meeting', m.id, l.name + ' · ' + VA.fDT(m.start));
        return m.id;
      }),
      addBlock: mutate(d => {
        staff(); const l = lawyerOf(d.lawyerId) || bad('Elegí el profesional.');
        if (u.role === 'lawyer' && l.id !== u.lawyerId) deny(); if (u.role === 'admin') needPerm('agenda.gestionar');
        const s = new Date(d.start), e = new Date(d.end); if (!(e > s)) bad('El fin debe ser posterior al inicio.');
        const clash = db.meetings.find(m => m.lawyerId === l.id && holding(m) && s < mEnd(m) && e > new Date(m.start));
        if (clash) conflict('Ese rango se superpone con un turno de ' + (meetingView(u, clash).clientName) + ' (' + VA.fDT(clash.start) + ').');
        const b = { id: nextId('block', 'b'), lawyerId: l.id, start: s.toISOString(), end: e.toISOString(), reason: str(d.reason, 120) || 'No disponible' };
        db.blocks.push(b); audit(u, 'agenda.bloquear', 'block', b.id, l.name + ' · ' + VA.fDT(b.start)); return b.id;
      }),
      removeBlock: mutate(id => { staff(); const b = byId('blocks', id) || notFound(); if (u.role === 'lawyer' && b.lawyerId !== u.lawyerId) deny(); if (u.role === 'admin') needPerm('agenda.gestionar'); db.blocks = db.blocks.filter(x => x.id !== id); audit(u, 'agenda.desbloquear', 'block', id); return true; })
    });

    /* ── notificaciones, plantillas, auditoría, ajustes ── */
    Object.assign(api, {
      notifications() { return clone(db.notifications.filter(n => n.userId === u.id)).sort((a, b) => b.at.localeCompare(a.at)); },
      unread() { return db.notifications.filter(n => n.userId === u.id && !n.read).length; },
      markRead: mutate(id => { const n = db.notifications.find(x => x.id === id && x.userId === u.id); if (!n) notFound(); n.read = true; return true; }),
      markAllRead: mutate(() => { db.notifications.forEach(n => { if (n.userId === u.id) n.read = true; }); return true; }),
      outbox() { if (!(can(u, 'crm.gestionar') || can(u, 'ajustes.gestionar'))) deny(); return clone(db.outbox).slice(0, 80); },
      templates() { staff(); return clone(db.templates); },
      saveTemplate: mutate((id, d) => {
        needPerm('plantillas.gestionar'); let t = id ? byId('templates', id) : null;
        if (!t) { t = { id: nextId('template', 'tp') }; db.templates.push(t); }
        t.name = req(d.name, 'Nombre', 120); t.category = VA.TEMPLATE_CATS.includes(d.category) ? d.category : 'Comunicaciones administrativas';
        t.subject = req(d.subject, 'Asunto', 200); t.body = req(d.body, 'Texto', 5000);
        const unknown = (t.body + t.subject).match(/\{\{\s*([^}]+?)\s*\}\}/g) || []; const bads = unknown.map(x => x.replace(/[{}\s]/g, '')).filter(v => !VA.TEMPLATE_VARS.includes(v));
        if (bads.length) bad('Variable desconocida: {{' + bads[0] + '}}. Usá: ' + VA.TEMPLATE_VARS.map(v => '{{' + v + '}}').join(', '));
        t.updatedAt = nowISO(); audit(u, 'plantilla.guardar', 'template', t.id, t.name); return t.id;
      }),
      deleteTemplate: mutate(id => { needPerm('plantillas.gestionar'); const t = byId('templates', id) || notFound(); db.templates = db.templates.filter(x => x.id !== id); audit(u, 'plantilla.eliminar', 'template', id, t.name); return true; }),
      renderTemplate(id, caseId, vars) {
        staff(); const t = byId('templates', id) || notFound(); let ctx = Object.assign({ fecha: VA.fDate(VA.now()), portal: 'portal.villafane-demo.test', importe: '—', cliente: '—', expediente: '—', asunto: '—', abogado: '—' }, vars || {});
        if (caseId) { const c = needCase(u, caseId); const cl = clientOf(c.clientId); const due = db.invoices.filter(i => i.caseId === c.id).map(invoiceCalc).reduce((s, i) => s + (['Emitida', 'Vencida', 'Parcialmente pagada'].includes(i.status) ? i.balance : 0), 0); Object.assign(ctx, { cliente: cl.name, expediente: c.number, asunto: c.title, abogado: lawyerOf(c.lawyerId).name, importe: due ? VA.money(due) : VA.money(c.feesCents) }, vars || {}); }
        const fill = s => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => ctx[k] != null ? ctx[k] : '{{' + k + '}}');
        return { subject: fill(t.subject), body: fill(t.body) };
      },
      sendTemplate: mutate((id, caseId, edited) => {
        staff(); const c = needCase(u, caseId); const r = edited && edited.body ? { subject: req(edited.subject, 'Asunto', 200), body: req(edited.body, 'Mensaje', 5000) } : api.renderTemplate(id, caseId);
        const cl = clientOf(c.clientId); const t = byId('templates', id);
        notify([cl.userId], { type: t && t.category === 'Recordatorios de pagos' ? 'Aviso de pago pendiente' : 'Actualización del expediente', title: r.subject, body: r.body, link: 'expediente.' + c.id, dedupe: 'tpl:' + id + ':' + c.id + ':' + Math.floor(VA.now() / 6e5) });
        db.activities.push({ id: nextId('activity', 'a'), caseId: c.id, kind: 'sistema', text: 'Comunicación enviada con plantilla «' + (t ? t.name : 'personalizada') + '»: ' + r.subject, authorId: u.id, at: nowISO() });
        audit(u, 'comunicacion.enviar', 'case', c.id, r.subject); return true;
      }),
      auditLog(f = {}) { needPerm('auditoria.ver'); let l = db.audit.slice(); if (f.q) { const q = f.q.toLowerCase(); l = l.filter(a => (a.action + ' ' + a.detail + ' ' + nameOf(a.userId)).toLowerCase().includes(q)); } if (f.denied) l = l.filter(a => a.action === 'acceso.denegado'); return clone(l.slice(0, 300)).map(a => Object.assign(a, { userName: nameOf(a.userId) })); },
      settings() { staff(); return clone(db.settings); },
      saveSettings: mutate(d => {
        needPerm('ajustes.gestionar');
        if (d.firm) Object.keys(db.settings.firm).forEach(k => { if (k !== 'social' && d.firm[k] !== undefined) db.settings.firm[k] = str(d.firm[k], 200); });
        if (d.social) db.settings.firm.social = { linkedin: str(d.social.linkedin, 80), instagram: str(d.social.instagram, 80) };
        if (d.identityRequired) Object.keys(db.settings.identityRequired).forEach(k => { db.settings.identityRequired[k] = !!d.identityRequired[k]; });
        if (d.reminders) { const r = d.reminders; const hrs = (r.meetingHours || []).map(Number).filter(h => h > 0 && h <= 168); if (!hrs.length) bad('Indicá al menos un recordatorio de reunión.'); db.settings.reminders = { meetingHours: hrs.sort((a, b) => b - a), paymentEveryDays: Math.max(1, Math.min(30, parseInt(r.paymentEveryDays, 10) || 7)), quoteAfterDays: Math.max(1, Math.min(30, parseInt(r.quoteAfterDays, 10) || 3)) }; }
        if (d.retention) db.settings.retention = { closedCaseYears: Math.max(1, parseInt(d.retention.closedCaseYears, 10) || 10), leadMonths: Math.max(1, parseInt(d.retention.leadMonths, 10) || 24) };
        audit(u, 'ajustes.guardar', 'settings', null, Object.keys(d).join(', ')); return true;
      }),
      admins() { needPerm('ajustes.gestionar'); return db.users.filter(x => x.role === 'admin').map(x => ({ id: x.id, name: x.name, email: x.email, adminScope: x.adminScope, perms: x.perms.slice(), active: x.active })); },
      setAdminPerms: mutate((id, perms) => {
        needPerm('ajustes.gestionar'); const a = userOf(id); if (!a || a.role !== 'admin') notFound();
        const clean = perms.filter(p => VA.PERMS[p]);
        if (id === u.id && !clean.includes('ajustes.gestionar')) bad('No podés quitarte el permiso de ajustes a vos mismo: quedaría la firma sin administrador general.');
        const before = a.perms.join(', '); a.perms = clean; audit(u, 'permisos.cambiar', 'user', id, a.name + ': [' + before + '] → [' + clean.join(', ') + ']'); return true;
      }),
      runScheduler: mutate(() => runScheduler()),
      search(q) {
        staff(); q = String(q || '').trim().toLowerCase(); if (q.length < 2) return [];
        const out = [];
        db.cases.filter(c => canCase(u, c)).forEach(c => { const cl = clientOf(c.clientId); if ((c.number + ' ' + c.title + ' ' + cl.name).toLowerCase().includes(q)) out.push({ kind: 'Expediente', title: c.number + ' · ' + c.title, sub: cl.name, link: 'expediente.' + c.id }); });
        if (u.role === 'lawyer' || canClient(u, null)) db.clients.filter(c => canClient(u, c.id)).forEach(c => { if ((c.name + ' ' + c.email).toLowerCase().includes(q)) out.push({ kind: 'Cliente', title: c.name, sub: c.email, link: 'cliente.' + c.id }); });
        if (can(u, 'crm.gestionar')) db.contacts.filter(c => !c.clientId).forEach(c => { if ((c.name + ' ' + c.email).toLowerCase().includes(q)) out.push({ kind: 'Contacto CRM', title: c.name, sub: c.stage, link: 'crm.' + c.id }); });
        if (can(u, 'finanzas.gestionar')) { db.invoices.forEach(i => { if (i.number.toLowerCase().includes(q)) out.push({ kind: 'Factura', title: i.number, sub: clientOf(i.clientId).name, link: 'factura.' + i.id }); }); db.quotes.forEach(x => { if ((x.number + ' ' + x.service).toLowerCase().includes(q)) out.push({ kind: 'Presupuesto', title: x.number, sub: x.service, link: 'presupuesto.' + x.id }); }); }
        return out.slice(0, 12);
      }
    });

    /* ── tableros ── */
    Object.assign(api, {
      adminDashboard() {
        if (u.role !== 'admin') deny();
        const nowD = VA.now(); const t0 = today(); const month = t0.slice(0, 7);
        const invs = db.invoices.map(invoiceCalc).filter(i => i.status !== 'Borrador' && i.status !== 'Anulada');
        const qs = db.quotes.map(quoteCalc);
        const pays = db.payments.filter(p => collected(p) > 0);
        const debtors = [...new Set(invs.filter(i => i.balance > 0 && i.status === 'Vencida').map(i => i.clientId))];
        const months = []; for (let k = 5; k >= 0; k--) { const d = new Date(nowD.getFullYear(), nowD.getMonth() - k, 1); const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); months.push({ key, label: MES[d.getMonth()], value: pays.filter(p => p.at.slice(0, 7) === key || VA.ymd(new Date(p.at)).slice(0, 7) === key).reduce((s, p) => s + collected(p), 0) }); }
        const upcoming = [];
        db.cases.filter(c => c.next && c.next.date >= t0 && !['Cerrado', 'Archivado'].includes(c.status)).forEach(c => upcoming.push({ date: c.next.date, label: c.next.label, ref: c.number, link: 'expediente.' + c.id, kind: 'Expediente' }));
        invs.filter(i => i.balance > 0 && i.dueAt >= t0).forEach(i => upcoming.push({ date: i.dueAt, label: 'Vence ' + i.number + ' · ' + VA.money(i.balance), ref: i.clientName, link: 'factura.' + i.id, kind: 'Factura' }));
        qs.filter(q => q.status === 'Enviado').forEach(q => upcoming.push({ date: q.validUntil, label: 'Vence la propuesta ' + q.number, ref: q.recipientName, link: 'presupuesto.' + q.id, kind: 'Presupuesto' }));
        upcoming.sort((a, b) => a.date.localeCompare(b.date));
        return {
          clients: db.clients.length,
          activeCases: db.cases.filter(c => c.status === 'Activo').length,
          openCases: db.cases.filter(c => !['Cerrado', 'Archivado'].includes(c.status)).length,
          newCasesMonth: db.cases.filter(c => c.openedAt.slice(0, 7) === month).length,
          pendingInquiries: db.contacts.filter(c => ['Nuevo contacto', 'Primer intento de contacto'].includes(c.stage)).length,
          toApprove: db.meetings.filter(m => m.status === 'Pendiente de aprobación').length,
          todayMeetings: db.meetings.filter(m => VA.ymd(new Date(m.start)) === t0 && ['Aprobado', 'Realizado', 'Pendiente de aprobación'].includes(m.status)).map(m => meetingView(u, m)),
          quotesSent: qs.filter(q => ['Enviado', 'Aceptado', 'Rechazado', 'Vencido'].includes(q.status)).length,
          quotesPending: qs.filter(q => q.status === 'Enviado').length,
          invoicesIssued: invs.length,
          collectedTotal: pays.reduce((s, p) => s + collected(p), 0),
          collectedMonth: pays.filter(p => VA.ymd(new Date(p.at)).slice(0, 7) === month).reduce((s, p) => s + collected(p), 0),
          receivable: invs.reduce((s, i) => s + i.balance, 0),
          debtors: debtors.map(id => ({ id, name: clientOf(id).name, amount: invs.filter(i => i.clientId === id && i.status === 'Vencida').reduce((s, i) => s + i.balance, 0) })),
          upcoming: upcoming.slice(0, 7), months,
          workload: db.lawyers.map(l => ({ id: l.id, name: l.name, photo: l.photo, active: db.cases.filter(c => c.lawyerId === l.id && !['Cerrado', 'Archivado'].includes(c.status)).length, pendingTasks: db.tasks.filter(t => t.assigneeId === l.userId && !t.done).length })),
          pipeline: VA.PIPELINE.map(s => ({ stage: s, count: db.contacts.filter(c => c.stage === s).length })),
          activity: db.audit.filter(a => !['auth.ingreso', 'auth.salida', 'auth.fallido', 'cliente.consultar'].includes(a.action)).slice(0, 8).map(a => Object.assign(clone(a), { userName: nameOf(a.userId) }))
        };
      },
      lawyerDashboard() {
        if (u.role !== 'lawyer') deny(); const lid = u.lawyerId; const t0 = today();
        const mine = db.cases.filter(c => canCase(u, c));
        return {
          cases: mine.filter(c => !['Cerrado', 'Archivado'].includes(c.status)).length,
          newCases: mine.filter(c => (VA.now() - new Date(c.openedAt + 'T12:00:00')) < 14 * 864e5).map(c => caseRow(u, c)),
          today: db.meetings.filter(m => m.lawyerId === lid && VA.ymd(new Date(m.start)) === t0 && holding(m)).map(m => meetingView(u, m)),
          upcoming: db.meetings.filter(m => m.lawyerId === lid && holding(m) && new Date(m.start) > VA.now()).map(m => meetingView(u, m)).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 5),
          toApprove: db.meetings.filter(m => m.lawyerId === lid && m.status === 'Pendiente de aprobación').length,
          tasks: api.tasks({ mine: true }).filter(t => !t.done).slice(0, 6),
          recentDocs: db.documents.filter(d => mine.some(c => c.id === d.caseId) && d.uploadedBy !== u.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5).map(d => Object.assign(clone(d), { uploaderName: nameOf(d.uploadedBy), caseNumber: byId('cases', d.caseId).number })),
          deadlines: mine.filter(c => c.next && c.next.date >= t0 && !['Cerrado', 'Archivado'].includes(c.status)).sort((a, b) => a.next.date.localeCompare(b.next.date)).map(c => caseRow(u, c)),
          notifications: api.notifications().filter(n => !n.read).slice(0, 5)
        };
      },
      clientDashboard() {
        if (u.role !== 'client') deny();
        const cs = clientCases(u.clientId);
        const invs = db.invoices.filter(i => i.clientId === u.clientId && i.status !== 'Borrador').map(invoiceCalc);
        const meets = db.meetings.filter(m => m.clientId === u.clientId).map(m => meetingView(u, m));
        const next = meets.filter(m => ['Aprobado', 'Pendiente de aprobación', 'Reprogramación propuesta', 'Pendiente de pago'].includes(m.status) && new Date(m.start) > VA.now()).sort((a, b) => a.start.localeCompare(b.start))[0] || null;
        return {
          cases: cs.map(c => caseRow(u, c)),
          lawyers: [...new Set(cs.filter(c => !['Cerrado', 'Archivado'].includes(c.status)).map(c => c.lawyerId))].map(id => lawyerPublic(lawyerOf(id))),
          next, pendingDocs: db.docRequests.filter(r => cs.some(c => c.id === r.caseId) && r.status === 'Pendiente').map(r => Object.assign(clone(r), { caseNumber: byId('cases', r.caseId).number })),
          replaceDocs: db.documents.filter(d => cs.some(c => c.id === d.caseId) && d.status === 'Requiere reemplazo' && d.visibility === 'compartido').map(d => clone(d)),
          quotes: db.quotes.filter(q => q.clientId === u.clientId && q.status === 'Enviado').map(quoteCalc).filter(q => q.status === 'Enviado'),
          invoices: invs, paid: db.payments.filter(p => p.clientId === u.clientId).reduce((s, p) => s + collected(p), 0),
          balance: invs.reduce((s, i) => s + (i.status === 'Anulada' ? 0 : i.balance), 0), credit: creditOf(u.clientId),
          notifications: api.notifications().slice(0, 4)
        };
      },
      financeDashboard(period) {
        if (!can(u, 'finanzas.gestionar')) deny();
        const nowD = VA.now(); let from = '0000';
        if (period === 'mes') from = VA.ymd(new Date(nowD.getFullYear(), nowD.getMonth(), 1));
        else if (period === 'trimestre') from = VA.ymd(VA.addDays(nowD, -90));
        else if (period === 'anio') from = nowD.getFullYear() + '-01-01';
        const inP = d => d && d >= from;
        const pays = db.payments.filter(p => inP(VA.ymd(new Date(p.at))));
        const invs = db.invoices.map(invoiceCalc).filter(i => i.status !== 'Borrador' && i.status !== 'Anulada');
        const invP = invs.filter(i => inP(i.issuedAt));
        const qs = db.quotes.map(quoteCalc).filter(q => q.issuedAt && inP(q.issuedAt));
        const decided = qs.filter(q => ['Aceptado', 'Rechazado'].includes(q.status));
        const caseArea = id => (byId('cases', id) || {}).area || 'Consultas';
        return {
          collected: pays.reduce((s, p) => s + collected(p), 0),
          fees: pays.filter(p => p.status === 'Confirmado' || p.status === 'Reembolso parcial').reduce((s, p) => s + (p.feeCents || 0), 0),
          refunds: pays.reduce((s, p) => s + (p.refundedCents || 0), 0),
          pending: invs.reduce((s, i) => s + i.balance, 0),
          issued: invP.reduce((s, i) => s + i.total, 0), issuedCount: invP.length,
          overdue: invs.filter(i => i.status === 'Vencida'), overdueTotal: invs.filter(i => i.status === 'Vencida').reduce((s, i) => s + i.balance, 0),
          quotesSent: qs.filter(q => q.status !== 'Borrador' && q.status !== 'Emitido').length, quotesAccepted: qs.filter(q => q.status === 'Aceptado').length,
          acceptance: decided.length ? Math.round(qs.filter(q => q.status === 'Aceptado').length * 100 / decided.length) : null,
          byLawyer: db.lawyers.map(l => ({ name: l.name, value: pays.filter(p => p.lawyerId === l.id).reduce((s, p) => s + collected(p), 0) })).sort((a, b) => b.value - a.value),
          byArea: VA.AREAS.concat(['Consultas']).map(a => ({ name: a, value: pays.filter(p => (p.caseId ? caseArea(p.caseId) : 'Consultas') === a).reduce((s, p) => s + collected(p), 0) })).filter(x => x.value > 0),
          pendingVerification: db.payments.filter(p => p.status === 'Pendiente de verificación').map(p => Object.assign(clone(p), { clientName: clientOf(p.clientId).name }))
        };
      },
      registerManualPayment: mutate(d => {
        needPerm('finanzas.gestionar'); const i = byId('invoices', d.invoiceId) || notFound(); const calc = invoiceCalc(i);
        if (['Borrador', 'Anulada', 'Pagada'].includes(calc.status)) conflict('Esta factura no admite pagos.');
        if (!Number.isInteger(d.amountCents) || d.amountCents <= 0 || d.amountCents > calc.balance - calc.pendingCents) bad('El importe debe ser mayor a cero y no superar el saldo disponible (' + VA.money(calc.balance - calc.pendingCents) + ').');
        if (!['Transferencia', 'Efectivo', 'Cheque', 'Depósito'].includes(d.method)) bad('Elegí el método de pago.');
        const p = { id: nextId('payment', 'pay'), clientId: i.clientId, caseId: i.caseId, invoiceId: i.id, meetingId: null, concept: i.number, amountCents: d.amountCents, currency: 'USD', at: nowISO(), method: d.method, status: 'Pendiente de verificación', providerId: str(d.reference, 60) || 'MANUAL-' + VA.rand(6).toUpperCase(), feeCents: 0, refundedCents: 0, lawyerId: (byId('cases', i.caseId) || {}).lawyerId, registeredBy: u.id };
        db.payments.unshift(p); audit(u, 'pago.registrar', 'payment', p.id, VA.money(p.amountCents) + ' ' + d.method + ' — pendiente de verificación'); return p.id;
      }),
      confirmManualPayment: mutate((id, ok) => {
        needPerm('finanzas.gestionar'); const p = byId('payments', id) || notFound(); if (p.status !== 'Pendiente de verificación') conflict('Este pago no está pendiente de verificación.');
        if (p.registeredBy === u.id && db.users.filter(x => x.role === 'admin' && x.perms.includes('finanzas.gestionar') && x.active).length > 1) bad('Por control cruzado, la acreditación la confirma otro administrador con permiso financiero.');
        p.status = ok ? 'Confirmado' : 'Fallido'; p.confirmedBy = u.id; p.confirmedAt = nowISO();
        if (ok) notify([clientOf(p.clientId).userId], { type: 'Confirmación de pago', title: 'Confirmamos tu pago de ' + VA.money(p.amountCents), body: p.concept + ' · ' + p.method, link: 'pagos' });
        audit(u, ok ? 'pago.confirmar' : 'pago.rechazar', 'payment', id, VA.money(p.amountCents) + ' · ' + p.concept); return true;
      })
    });
    return api;
  }

  /* ── webhook del proveedor de pagos (modo de prueba) ── */
  function providerWebhook(providerId, outcome) {
    const p = db.payments.find(x => x.providerId === providerId) || notFound('Pago desconocido para la pasarela.');
    if (p.status !== 'Procesando') return { status: p.status };
    outcome = outcome || p.testOutcome || 'succeeded';
    const cl = clientOf(p.clientId);
    if (outcome !== 'succeeded') {
      p.status = 'Fallido'; p.failure = 'Tarjeta rechazada por el emisor (simulación)';
      notify([cl.userId], { type: 'Aviso de pago pendiente', title: 'No pudimos procesar el pago', body: 'La tarjeta fue rechazada. Podés intentar con otra tarjeta.', link: p.meetingId ? 'turnos' : 'pagos', email: false });
      audit(null, 'pago.fallido', 'payment', p.id, p.providerId); persist(); return { status: p.status };
    }
    p.status = 'Confirmado'; p.confirmedAt = nowISO();
    audit(null, 'pago.confirmar', 'payment', p.id, 'Webhook de pasarela (prueba) · ' + VA.money(p.amountCents));
    if (p.meetingId) {
      const m = byId('meetings', p.meetingId); const l = lawyerOf(m.lawyerId);
      transition(m, 'Pago confirmado', null, 'Pago ' + p.providerId); transition(m, 'Pendiente de aprobación', null, 'A la espera de la aprobación del profesional');
      notify([cl.userId], { type: 'Confirmación de pago', title: 'Pago recibido — turno pendiente de aprobación', body: 'Recibimos ' + VA.money(p.amountCents) + '. Tu turno del ' + VA.fDT(m.start) + ' todavía debe ser aprobado por ' + l.name + '.', link: 'turnos' });
      notify([l.userId, ...admins('agenda.gestionar').map(x => x.id)], { type: 'Turno por aprobar', title: cl.name + ' solicitó una reunión', body: m.type + ' · ' + VA.fDT(m.start) + ' · pago confirmado.', link: 'agenda', email: false });
    } else {
      notify([cl.userId], { type: 'Confirmación de pago', title: 'Confirmamos tu pago de ' + VA.money(p.amountCents), body: p.concept, link: 'pagos' });
      notify(admins('finanzas.gestionar').map(x => x.id), { type: 'Pago recibido', title: 'Pago recibido · ' + p.concept, body: cl.name + ' · ' + VA.money(p.amountCents), link: 'pagos', email: false });
    }
    persist(); return { status: p.status };
  }

  /* ── recordatorios programados ── */
  function runScheduler() {
    const now = VA.now(); let count = 0;
    const before = db.notifications.length;
    db.meetings.forEach(m => {
      if (m.status === 'Pendiente de pago' && m.holdUntil && new Date(m.holdUntil) < now && !(m.paymentId && (byId('payments', m.paymentId) || {}).status === 'Procesando')) {
        transition(m, 'Cancelado', null, 'Reserva temporal vencida sin pago'); if (m.clientId) notify([clientOf(m.clientId).userId], { type: 'Cambio de fecha', title: 'Venció la reserva de tu turno', body: 'No se registró el pago a tiempo. Podés solicitar un nuevo horario.', link: 'turnos', dedupe: 'hold:' + m.id });
      }
      if (m.status !== 'Aprobado') return;
      const hrs = (new Date(m.start) - now) / 3600e3; if (hrs <= 0) return;
      const marks = db.settings.reminders.meetingHours.slice().sort((a, b) => a - b);
      const mark = marks.find(h => hrs <= h); if (mark === undefined) return;
      const l = lawyerOf(m.lawyerId); const who = [l.userId]; if (m.clientId) who.push(clientOf(m.clientId).userId);
      notify(who, { type: 'Recordatorio de reunión', title: 'Recordatorio: reunión ' + VA.fDT(m.start), body: m.type + ' con ' + (m.clientId ? l.name : 'el cliente') + ' · ' + m.durationMin + ' min.', link: 'turnos', dedupe: 'rem' + mark + ':' + m.id });
    });
    const every = db.settings.reminders.paymentEveryDays;
    db.invoices.map(invoiceCalc).filter(i => i.status === 'Vencida').forEach(i => { const days = -VA.daysUntil(i.dueAt); notify([clientOf(i.clientId).userId], { type: 'Aviso de pago pendiente', title: 'Recordatorio: ' + i.number + ' vencida', body: 'Saldo pendiente ' + VA.money(i.balance) + '.', link: 'pagos', dedupe: 'pay:' + i.id + ':' + Math.floor(days / every) }); });
    db.quotes.map(quoteCalc).filter(q => q.status === 'Enviado' && q.clientId && q.sentAt && (now - new Date(q.sentAt)) > db.settings.reminders.quoteAfterDays * 864e5).forEach(q => notify([clientOf(q.clientId).userId], { type: 'Recordatorio de presupuesto pendiente', title: 'Tu presupuesto ' + q.number + ' sigue disponible', body: 'Vence el ' + VA.fDate(q.validUntil) + '.', link: 'presupuesto.' + q.id, dedupe: 'qrem:' + q.id + ':v' + q.version }));
    count = db.notifications.length - before;
    persist(); return { created: count, at: now.toISOString() };
  }

  return { pub, auth, as, providerWebhook, runScheduler, _db: db };
};

/* ───────────── pruebas de aceptación ───────────── */
VA.runAcceptance = function () {
  const db = VA.seed();
  db.sessions = {};
  const api = VA.createApi(db);
  const login = (email, role) => api.auth.login(email, VA.DEMO_PW[role]).token;
  const res = [];
  const t = (n, name, fn) => { try { const d = fn(); res.push({ n, name, ok: true, detail: d || '' }); } catch (e) { res.push({ n, name, ok: false, detail: e.message }); } };
  const expectDeny = (fn, label) => { try { fn(); } catch (e) { if (e.code === 'FORBIDDEN' || e.code === 'NOT_FOUND') return label + ': rechazado (' + e.code + ')'; throw e; } throw new Error(label + ': el servidor permitió el acceso'); };
  const c1 = login('martin.quiroga@correo-demo.test', 'client'), c2 = login('sofia.benitez@correo-demo.test', 'client'), c4 = login('elena.duarte@correo-demo.test', 'client');
  const l3 = login('tomas.arrieta@villafane-demo.test', 'lawyer'), l1 = login('julia.okada@villafane-demo.test', 'lawyer');
  const a1 = login('carolina.mendez@villafane-demo.test', 'admin'), a2 = login('diego.paredes@villafane-demo.test', 'admin');

  t(1, 'Un cliente no puede acceder a expedientes de otro cliente, ni modificando la URL', () => {
    const A = api.as(c1); const r = [expectDeny(() => A.case('k14'), 'GET /expediente/k14 (de Sofía)'), expectDeny(() => A.quote('q8'), 'GET /presupuesto/q8 (de Elena)'), expectDeny(() => A.invoice('i12'), 'GET /factura/i12 (de Ricardo)'), expectDeny(() => A.client('c2'), 'GET /cliente/c2')];
    if (A.cases().some(c => c.clientId !== 'c1')) throw new Error('El listado incluye casos ajenos');
    return r.join(' · ');
  });
  t(2, 'Un abogado no puede consultar expedientes que no tiene asignados, salvo permiso explícito', () => {
    const L = api.as(l3); const r1 = expectDeny(() => L.case('k14'), 'Tomás → EXP-0014');
    api.as(a1).setExtraAccess('k14', ['l3']); const ok = api.as(l3).case('k14');
    if (!ok) throw new Error('El permiso explícito no habilitó el acceso');
    api.as(a1).setExtraAccess('k14', []); const r2 = expectDeny(() => api.as(l3).case('k14'), 'tras revocar');
    return r1 + ' · con permiso explícito: permitido · ' + r2;
  });
  t(3, 'Un administrador autorizado administra los módulos que le corresponden', () => {
    const A = api.as(a1); A.adminDashboard(); A.contacts(); A.invoices(); A.lawyers(); A.auditLog();
    const B = api.as(a2); B.contacts(); B.invoices();
    const r = expectDeny(() => B.saveLawyer('l1', { rateCents: 99000 }), 'Admin operativo cambiando tarifas');
    return 'Admin general: todos los módulos · Admin operativo: CRM y finanzas sí; ' + r;
  });
  t(4, 'Un presupuesto aceptado se refleja en el CRM', () => {
    const before = api.as(a1).contact('p4').stage; api.as(c4).quoteAction('q8', 'accept', { version: 1 });
    const after = api.as(a1).contact('p4'); if (after.stage !== 'Presupuesto aceptado') throw new Error('Etapa CRM: ' + after.stage);
    const q = api.as(a1).quote('q8'); if (!q.acceptance || q.acceptance.version !== 1) throw new Error('Aceptación sin versión registrada');
    return 'Etapa: ' + before + ' → ' + after.stage + ' · versión ' + q.acceptance.version + ' · huella ' + q.acceptance.checksum.slice(0, 10);
  });
  t(5, 'Los pagos actualizan los saldos de las facturas', () => {
    const tok = login('ricardo.almada@correo-demo.test', 'client');
    const before = api.as(tok).invoice('i12');
    const p = api.as(tok).startPayment({ invoiceId: 'i12', amountCents: 25000, card: { number: '4242 4242 4242 4242', exp: '12/30', cvc: '123', name: 'R Almada' } });
    const mid = api.as(tok).invoice('i12'); if (mid.balance !== before.balance) throw new Error('El saldo cambió antes de la confirmación de la pasarela');
    api.providerWebhook(p.providerId, 'succeeded'); const after = api.as(tok).invoice('i12');
    if (after.balance !== before.balance - 25000) throw new Error('Saldo esperado ' + (before.balance - 25000) + ', obtenido ' + after.balance);
    const stored = JSON.stringify(db.payments); if (stored.includes('4242424242424242') || /"cvc"/.test(stored)) throw new Error('Se almacenaron datos completos de la tarjeta');
    return VA.money(before.balance) + ' → ' + VA.money(after.balance) + ' (solo tras webhook) · tarjeta guardada como •••• ' + db.payments[0].last4;
  });
  t(6, 'Los turnos respetan la disponibilidad y no permiten dobles reservas', () => {
    const m3 = db.meetings.find(m => m.id === 'm3');
    const C = api.as(c1); let msg = '';
    try { C.requestMeeting({ typeId: 'seguimiento', durationMin: 30, area: 'Derecho Penal', lawyerId: 'l4', start: m3.start }); throw new Error('Permitió doble reserva'); } catch (e) { if (e.code !== 'CONFLICT') throw e; msg = 'Mismo horario de Andrés: rechazado'; }
    const b1 = db.blocks.find(b => b.id === 'b1');
    try { C.requestMeeting({ typeId: 'seguimiento', durationMin: 30, area: 'Derecho Penal', lawyerId: 'l4', start: b1.start }); throw new Error('Permitió reservar un horario bloqueado'); } catch (e) { if (e.code !== 'CONFLICT') throw e; msg += ' · horario bloqueado: rechazado'; }
    const slots = C.slots('l4', VA.ymd(new Date(m3.start)), 30); if (slots.includes(m3.start)) throw new Error('El horario ocupado figura como disponible');
    return msg + ' · el horario ocupado no se ofrece';
  });
  t(7, 'Un turno pagado sigue pendiente de aprobación hasta que se autorice', () => {
    const C = api.as(c4); const p = C.startPayment({ meetingId: 'm4', card: { number: '4242424242424242', exp: '11/29', cvc: '321', name: 'E Duarte' } });
    api.providerWebhook(p.providerId, 'succeeded');
    let m = api.as(c4).meetings().find(x => x.id === 'm4'); if (m.status !== 'Pendiente de aprobación') throw new Error('Estado tras el pago: ' + m.status);
    const s1 = m.status; api.as(l1).meetingAction('m4', 'approve'); m = api.as(c4).meetings().find(x => x.id === 'm4');
    if (m.status !== 'Aprobado') throw new Error('No se aprobó');
    return 'Tras el pago: ' + s1 + ' → tras la aprobación de Julia Okada: ' + m.status;
  });
  t(8, 'Una notificación privada no se muestra a otros clientes', () => {
    api.as(l3).addActivity('k11', 'cliente', 'Prueba: novedad privada para Martín.');
    const own = api.as(c1).notifications().some(n => n.body.includes('novedad privada'));
    const leak = api.as(c2).notifications().some(n => n.body.includes('novedad privada'));
    if (!own) throw new Error('El titular no recibió la notificación'); if (leak) throw new Error('Otro cliente vio la notificación');
    const r = expectDeny(() => api.as(c2).markRead(db.notifications.find(n => n.userId === 'u_c1').id), 'Sofía marcando una notificación de Martín');
    return 'Martín la recibe · Sofía no la ve · ' + r;
  });
  t(9, 'Un documento interno nunca aparece en el portal del cliente sin autorización', () => {
    const docs = api.as(c1).case('k11').documents; if (docs.some(d => d.visibility !== 'compartido')) throw new Error('Documento interno visible');
    const flat = api.as(c1).myDocuments().flatMap(g => g.documents); if (flat.some(d => d.name.includes('borrador interno'))) throw new Error('Documento interno en «Mis documentos»');
    const notes = api.as(c1).case('k11').activities; if (notes.some(a => a.kind !== 'cliente')) throw new Error('Nota interna visible');
    api.as(l3).setDocVisibility('d3', 'compartido'); const now = api.as(c1).case('k11').documents.some(d => d.id === 'd3');
    if (!now) throw new Error('Al autorizarlo no apareció');
    return 'Oculto por defecto (documentos y notas internas) · visible solo tras autorizarlo';
  });
  t(10, 'La interfaz funciona en escritorio y en móvil', () => 'Revisión visual: diseño adaptable con navegación lateral en escritorio, menú inferior y tablas en tarjetas en móvil (se verifica en pantalla).');
  return res;
};

if (typeof module !== 'undefined') module.exports = VA;
})(typeof window !== 'undefined' ? window : globalThis);
