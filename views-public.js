/* Sitio público, ingreso, páginas legales y documentación de la demo. */
(function () {
'use strict';
const VA = window.VA, S = VA.S, esc = VA.esc, icon = VA.icon, V = VA.V, ACT = VA.ACT, FORM = VA.FORM;

function header() {
  const links = [['firma', 'La firma'], ['areas', 'Áreas de práctica'], ['equipo', 'Equipo'], ['proceso', 'Cómo trabajamos'], ['faq', 'Preguntas'], ['contacto', 'Contacto']];
  return `<div class="demo-strip"><b>Demostración de producto.</b> Villafañe &amp; Asociados es una firma ficticia; personas, casos e importes son datos de ejemplo.</div>
  <header class="pub-head"><div class="in-w">
    <button class="wordmark-btn" data-go="" style="background:none;border:0;padding:0;cursor:pointer" aria-label="Villafañe & Asociados, inicio">${VA.wordmark({ size: 42 })}</button>
    <nav class="pub-nav" aria-label="Secciones">${links.map(([id, l]) => `<button data-act="scrollTo" data-id="${id}">${l}</button>`).join('')}</nav>
    <button class="btn primary portal-btn" data-go="${S.me ? 'panel' : 'ingresar'}">${icon('lock')}${S.me ? 'Ir a mi portal' : 'Portal privado'}</button>
    <button class="btn ghost icon pub-menu" data-act="pubMenu" aria-label="Menú" aria-expanded="${!!S.ui.pubMenu}">${icon(S.ui.pubMenu ? 'x' : 'menu')}</button>
  </div>${S.ui.pubMenu ? `<nav class="mnav">${links.map(([id, l]) => `<button data-act="scrollTo" data-id="${id}">${l}</button>`).join('')}<button data-go="${S.me ? 'panel' : 'ingresar'}"><b>${S.me ? 'Ir a mi portal' : 'Portal privado'}</b></button></nav>` : ''}</header>`;
}
ACT.pubMenu = () => { S.ui.pubMenu = !S.ui.pubMenu; VA.refresh(); };
ACT.scrollTo = el => { S.ui.pubMenu = false; const id = el.dataset.id; if (S.route !== '') { S.route = ''; try { location.hash = ''; } catch (e) { } } VA.render(); const t = document.getElementById(id); if (t) { const y = t.getBoundingClientRect().top + window.scrollY - 76; window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } };

function footer() {
  const f = VA.server.pub.firm();
  return `<footer class="foot"><div class="in-w">
    <div class="stack">${VA.wordmark({ size: 40, color: '#F7F4EE' })}<p style="max-width:34ch">${esc(f.tagline)}. Atención con turno previo.</p><p class="xs">${esc(f.reference)}</p></div>
    <div><h4>Estudio</h4><p>${esc(f.address)}</p><p class="xs">${esc(f.addressNote)}</p><p style="margin-top:8px">${esc(f.hours)}</p></div>
    <div><h4>Contacto</h4><p class="nowrap">${esc(f.phone)}</p><p style="overflow-wrap:anywhere">${esc(f.email)}</p><p style="margin-top:8px">LinkedIn: ${esc(f.social.linkedin)}</p><p>Instagram: ${esc(f.social.instagram)}</p></div>
    <div><h4>Portal y legales</h4><button data-go="${S.me ? 'panel' : 'ingresar'}">Acceso al portal privado</button><button data-go="privacidad">Aviso de privacidad</button><button data-go="terminos">Términos de uso</button><button data-go="acerca">Acerca de esta demo</button></div>
  </div><div class="legal"><span>© ${VA.now().getFullYear()} ${esc(f.name)} — firma ficticia creada para demostración.</span><span>Los datos institucionales se editan desde Ajustes.</span></div></footer>`;
}

/* ── HOME ── */
V.home = () => {
  const team = VA.server.pub.team();
  const f = VA.server.pub.firm();
  const areaOpts = VA.AREAS.map(a => `<option>${a}</option>`).join('');
  const sent = S.ui.leadSent;
  return `<div class="pub">${header()}
  <section class="sec hero" aria-labelledby="h-hero">
    <div>
      <p class="eyebrow">Estudio jurídico · Buenos Aires</p>
      <h1 id="h-hero" style="margin-top:22px"><span>Experiencia</span><span>jurídica.</span><span><em>Estrategia.</em></span><span>Confianza.</span></h1>
      <p class="lead">En Villafañe &amp; Asociados acompañamos a nuestros clientes con una atención jurídica rigurosa, estratégica y personalizada, desde la primera consulta hasta cada etapa de su proceso.</p>
      <div class="ctas"><button class="btn primary" data-act="scrollTo" data-id="contacto">Solicitar una consulta</button><button class="btn" data-act="scrollTo" data-id="equipo">Conocer al equipo</button></div>
    </div>
    <figure class="facade" style="margin:0">${VA.facade('#B69A62')}<figcaption><span>Recoleta · Buenos Aires</span><span>Ilustración</span></figcaption></figure>
  </section>
  <div class="band"><div class="in-w"><span>Derecho Penal</span><span>Derecho de Familia</span><span>Mediación</span><span>Honorarios por escrito antes de empezar</span><span>Portal privado para cada cliente</span></div></div>

  <section class="sec" id="firma" aria-labelledby="h-firma">
    <div class="sec-h"><div><p class="eyebrow">Nuestra firma</p><h2 id="h-firma" style="margin-top:14px">Un estudio pensado para los momentos que importan.</h2></div>
    <p class="statement">Trabajamos con pocos asuntos a la vez para dedicarle a cada uno <em>tiempo, estudio y criterio</em>. Cada cliente sabe quién lleva su caso, qué sigue y cuánto cuesta.</p></div>
    <div class="principles">
      <div><h3>Confidencialidad</h3><p>La información de cada cliente circula solo entre quienes trabajan en su caso. El portal privado separa lo que es interno de lo que se comparte.</p></div>
      <div><h3>Preparación jurídica</h3><p>Antes de proponer un camino, estudiamos el expediente, la prueba disponible y los escenarios posibles. Las decisiones se toman con información.</p></div>
      <div><h3>Acompañamiento personal</h3><p>Un profesional responsable para cada asunto, con reuniones de seguimiento y respuestas en lenguaje claro.</p></div>
      <div><h3>Atención estratégica</h3><p>Evaluamos cuándo conviene litigar, negociar o mediar. El objetivo es el mejor resultado posible para la persona, no el proceso más largo.</p></div>
    </div>
  </section>

  <section class="sec" id="areas" aria-labelledby="h-areas" style="padding-top:0">
    <div class="sec-h"><div><p class="eyebrow">Áreas de práctica</p><h2 id="h-areas" style="margin-top:14px">Dos especialidades, una misma exigencia.</h2></div><p>Concentramos la práctica en Derecho Penal y Derecho de Familia: materias donde la estrategia, el tiempo y el trato personal cambian el resultado.</p></div>
    <div class="areas">
      <article class="area"><span class="no">I</span><h3>Derecho Penal</h3><p style="color:var(--ink-2)">Defensa técnica desde la primera citación o denuncia. Ordenamos la prueba, explicamos cada etapa del proceso y anticipamos escenarios para que nada te tome por sorpresa.</p>
        <ul><li>Defensa en investigaciones</li><li>Delitos económicos y empresariales</li><li>Accidentes de tránsito con lesiones</li><li>Querellas</li><li>Excarcelaciones y medidas cautelares</li><li>Prevención penal en empresas</li></ul>
        <div><button class="btn" data-act="leadArea" data-area="Derecho Penal">Solicitar asesoramiento penal</button></div></article>
      <article class="area"><span class="no">II</span><h3>Derecho de Familia</h3><p style="color:var(--ink-2)">Acompañamiento en divorcios, cuidado de hijos y conflictos patrimoniales familiares. Buscamos acuerdos sostenibles y, cuando no son posibles, una representación firme en el juzgado.</p>
        <ul><li>Divorcios y convenios reguladores</li><li>Cuidado personal y comunicación</li><li>Alimentos y su actualización</li><li>Compensación económica</li><li>Uniones convivenciales</li><li>Planes de parentalidad</li></ul>
        <div><button class="btn" data-act="leadArea" data-area="Derecho de Familia">Solicitar asesoramiento de familia</button></div></article>
      <article class="area minor"><div class="stack sm"><span class="eyebrow">Área complementaria · concepto de demostración</span><h3>Mediación y resolución de conflictos</h3><p class="small" style="color:var(--ink-2);max-width:62ch">Para conflictos familiares o societarios donde una negociación asistida puede ahorrar tiempo y desgaste.</p></div><button class="btn ghost" data-act="leadArea" data-area="Mediación">Consultar por mediación ${icon('right')}</button></article>
    </div>
  </section>

  <section class="sec" id="equipo" aria-labelledby="h-equipo" style="padding-top:0">
    <div class="sec-h"><div><p class="eyebrow">Nuestro equipo</p><h2 id="h-equipo" style="margin-top:14px">Las personas detrás de cada caso.</h2></div><p>Cada asunto tiene un profesional responsable que conoce el expediente de punta a punta. Los perfiles se actualizan desde la plataforma interna.</p></div>
    <div class="team">${team.map(l => `<article class="person"><div class="ph">${l.photo ? `<img src="${esc(l.photo)}" alt="Retrato de ${esc(l.name)}" loading="lazy">` : ''}</div><span class="role">${esc(l.title)}</span><h3>${esc(l.name)}</h3><p class="small" style="color:var(--ink);font-weight:500">${esc(l.specialty)}</p><p>${esc(l.bio)}</p></article>`).join('')}</div>
    <p class="xs muted" style="margin-top:20px">Biografías de demostración. Nombres, cargos y trayectoria se reemplazan por los datos reales del estudio desde «Nuestro equipo».</p>
  </section>

  <section class="sec" id="proceso" aria-labelledby="h-proc" style="padding-top:0">
    <div class="sec-h"><div><p class="eyebrow">Cómo trabajamos</p><h2 id="h-proc" style="margin-top:14px">Un proceso claro desde el primer día.</h2></div><p>Sabés en qué etapa está tu asunto, quién lo lleva y qué viene después. Todo queda registrado en tu portal.</p></div>
    <div class="steps">${[
      ['Primera consulta', 'Nos contás tu situación en una reunión con turno previo. Te orientamos sobre las alternativas posibles.'],
      ['Evaluación del caso', 'Analizamos la documentación y el contexto para definir una estrategia viable.'],
      ['Propuesta de honorarios', 'Recibís un presupuesto por escrito, con alcance, gastos estimados y forma de pago.'],
      ['Asignación del profesional', 'Un abogado responsable toma el caso según la especialidad y la disponibilidad del equipo.'],
      ['Seguimiento del expediente', 'Trabajamos el caso con tareas, plazos y reuniones de revisión.'],
      ['Comunicación y actualización', 'Cada novedad relevante se publica en tu portal y te avisamos por correo.']
    ].map(([t, d], i) => `<div class="step"><span class="n">${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </section>

  <section class="sec" id="contacto" aria-labelledby="h-contacto" style="padding-top:0">
    <div class="sec-h"><div><p class="eyebrow">Solicitar contacto</p><h2 id="h-contacto" style="margin-top:14px">Contanos brevemente qué necesitás.</h2></div><p>Te respondemos dentro de las 24 horas hábiles por el medio que prefieras.</p></div>
    <div class="contact">
      <div class="panel"><div class="panel-b">${sent ? `<div class="empty">${icon('check')}<strong>Recibimos tu consulta</strong><p class="small" style="max-width:46ch">Gracias, ${esc(sent)}. Te vamos a contactar dentro de las próximas 24 horas hábiles. Por favor, no envíes documentación hasta que te indiquemos el canal seguro.</p><button class="btn" data-act="leadAgain">Enviar otra consulta</button></div>` : `
        <form data-form="lead" class="stack lg" novalidate>
          ${VA.notice('lock', '<b>No envíes información sensible ni documentación confidencial por este formulario.</b> Cuando el estudio confirme tu consulta, te indicará cómo hacerlo de forma segura.', 'gold')}
          <div class="form-grid">
            <label class="field"><span>Nombre y apellido</span><input class="in" id="ld-name" name="name" autocomplete="name" required></label>
            <label class="field"><span>Correo electrónico</span><input class="in" id="ld-email" name="email" type="email" autocomplete="email" required></label>
            <label class="field"><span>Teléfono</span><input class="in" id="ld-phone" name="phone" type="tel" autocomplete="tel" placeholder="+54 11 …" required></label>
            <label class="field"><span>Área jurídica</span><select class="in" id="ld-area" name="area" required><option value="">Elegí un área</option>${VA.AREAS.map(a => `<option${S.ui.leadArea === a ? ' selected' : ''}>${a}</option>`).join('')}</select></label>
            <label class="field full"><span>Descripción inicial del asunto <span class="hint">· breve y sin datos sensibles</span></span><textarea class="in" id="ld-msg" name="message" maxlength="1500" required placeholder="Por ejemplo: necesito orientación sobre el régimen de comunicación con mi hija."></textarea></label>
            <fieldset class="field full" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:8px">Preferencia de contacto</legend><div class="row">${['Correo electrónico', 'Teléfono', 'WhatsApp'].map((p, i) => `<label class="check"><input type="radio" name="pref" value="${p}"${i === 0 ? ' checked' : ''}> ${p}</label>`).join('')}</div></fieldset>
          </div>
          <label class="check"><input type="checkbox" name="privacy" id="ld-privacy"> <span>Leí y acepto el <button type="button" class="link" data-go="privacidad">aviso de privacidad</button>.</span></label>
          <div id="lead-err" class="err" role="alert"></div>
          <div><button class="btn primary" type="submit" style="min-height:46px;padding:0 24px">Enviar consulta</button></div>
        </form>`}</div></div>
      <div class="stack lg">
        <div class="stack sm"><p class="eyebrow">Estudio</p><p class="serif" style="font-size:24px;line-height:1.25">${esc(f.address)}</p><p class="xs muted">${esc(f.addressNote)}</p></div>
        <div class="kv" style="font-size:15px"><dt>Teléfono</dt><dd>${esc(f.phone)}</dd><dt>Correo</dt><dd>${esc(f.email)}</dd><dt>Horario</dt><dd>${esc(f.hours)}</dd></div>
        <div class="notice">${icon('info')}<div>¿Ya sos cliente? Ingresá al <button class="link" data-go="ingresar">portal privado</button> para ver tu expediente, subir documentos o solicitar una reunión.</div></div>
      </div>
    </div>
  </section>

  <section class="sec faq" id="faq" aria-labelledby="h-faq" style="padding-top:0">
    <div class="sec-h"><div><p class="eyebrow">Preguntas frecuentes</p><h2 id="h-faq" style="margin-top:14px">Lo que suelen preguntarnos.</h2></div><p>Si tu duda no está acá, escribinos desde el formulario de contacto.</p></div>
    <div>${[
      ['¿Cómo solicito una primera consulta?', 'Completá el formulario de contacto o, si ya tenés cuenta, pedí un turno desde el portal. Elegís el área, el profesional (o dejás que el estudio lo asigne), la duración y el horario disponible.'],
      ['¿Cómo se determinan los honorarios?', 'La consulta se cobra por hora según la tarifa de cada profesional, que ves antes de pagar. Para un caso completo recibís un presupuesto por escrito con el alcance del trabajo, los gastos estimados, el anticipo y las cuotas.'],
      ['¿Cómo funciona la asignación de un abogado?', 'Asignamos el caso según la especialidad y la carga de trabajo del equipo. Siempre sabés quién es tu profesional responsable y podés verlo en tu portal.'],
      ['¿Cómo cargo documentación?', 'Desde la sección Documentos del portal. Aceptamos PDF, JPG, PNG y DOCX de hasta 10 MB. Cada archivo queda asociado a tu expediente y ves su estado de revisión.'],
      ['¿Cómo consulto el estado de mi expediente?', 'En «Mis expedientes» ves el estado actual, las próximas fechas relevantes y la cronología de novedades que tu abogado comparte con vos.'],
      ['¿Cómo realizo pagos?', 'Desde «Pagos y presupuestos» podés abonar facturas y consultas con tarjeta. Un pago se marca como recibido recién cuando la pasarela lo confirma.'],
      ['¿Cómo reprogramo una reunión?', 'Desde «Turnos». Si cancelás con 24 horas o más de anticipación, te reintegramos el 100 %. Con menos de 24 horas, acreditamos el 50 % como saldo a favor para otra consulta.'],
      ['¿Cómo contacto al estudio?', 'Por teléfono o correo en el horario de atención, o desde el portal si ya sos cliente. Para temas urgentes de un caso en curso, comunicate con tu profesional responsable.']
    ].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
  </section>
  ${footer()}</div>`;
};
ACT.leadArea = el => { S.ui.leadArea = el.dataset.area; ACT.scrollTo({ dataset: { id: 'contacto' } }); };
ACT.leadAgain = () => { S.ui.leadSent = null; VA.refresh(); };
FORM.lead = (d, form) => {
  const err = form.querySelector('#lead-err'); form.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  const miss = [['name', 'ld-name'], ['email', 'ld-email'], ['phone', 'ld-phone'], ['area', 'ld-area'], ['message', 'ld-msg']].filter(([k]) => !String(d[k] || '').trim());
  if (miss.length) { miss.forEach(([, id]) => form.querySelector('#' + id).setAttribute('aria-invalid', 'true')); err.textContent = 'Completá los campos marcados para enviar la consulta.'; form.querySelector('#' + miss[0][1]).focus(); return; }
  try { VA.server.pub.createLead({ name: d.name, email: d.email, phone: d.phone, area: d.area, message: d.message, pref: d.pref, privacy: d.privacy === 'on' }); S.ui.leadSent = String(d.name).split(' ')[0]; S.ui.leadArea = null; VA.refresh(); }
  catch (e) { err.textContent = e.message; if (/correo/i.test(e.message)) form.querySelector('#ld-email').setAttribute('aria-invalid', 'true'); if (/teléfono/i.test(e.message)) form.querySelector('#ld-phone').setAttribute('aria-invalid', 'true'); }
};

/* ── LOGIN ── */
const DEMO_USERS = [
  ['Administración general', 'carolina.mendez@villafane-demo.test', 'admin', 'Carolina Méndez'],
  ['Admin. operativa y financiera', 'diego.paredes@villafane-demo.test', 'admin', 'Diego Paredes'],
  ['Abogada · Familia y mediación', 'julia.okada@villafane-demo.test', 'lawyer', 'Julia Okada'],
  ['Socia · Familia', 'lucia.ferraro@villafane-demo.test', 'lawyer', 'Lucía Ferraro'],
  ['Socio · Penal', 'tomas.arrieta@villafane-demo.test', 'lawyer', 'Tomás Arrieta'],
  ['Socio director · Penal', 'andres.bellamy@villafane-demo.test', 'lawyer', 'Andrés Bellamy'],
  ['Cliente · al día', 'martin.quiroga@correo-demo.test', 'client', 'Martín Quiroga'],
  ['Cliente · documentación pendiente', 'sofia.benitez@correo-demo.test', 'client', 'Sofía Benítez'],
  ['Cliente · factura vencida', 'ricardo.almada@correo-demo.test', 'client', 'Ricardo Almada'],
  ['Cliente · presupuesto pendiente', 'elena.duarte@correo-demo.test', 'client', 'Elena Duarte']
];
VA.DEMO_USERS = DEMO_USERS;
V.login = () => {
  const reset = S.ui.resetMode;
  return `<div class="login">
  <aside class="l-art"><button data-go="" style="background:none;border:0;padding:0;cursor:pointer;color:#F7F4EE;align-self:flex-start">${VA.wordmark({ size: 44, color: '#F7F4EE' })}</button>
    <div class="fac">${VA.facade('rgba(198,172,118,.7)')}</div>
    <blockquote>Un lugar seguro para cada expediente.</blockquote>
    <p style="position:relative;color:rgba(247,244,238,.6);font-size:13px;max-width:40ch">Cada persona ve solo lo que le corresponde: el cliente, su caso; el abogado, sus expedientes; la administración, lo que sus permisos habilitan.</p></aside>
  <section class="l-form">
    <button class="crumb" data-go="">${icon('left')}Volver al sitio</button>
    ${reset ? `<div class="stack"><h1 class="serif" style="font-size:34px">Recuperar contraseña</h1><p class="muted">Te enviamos un enlace para crear una contraseña nueva. Por seguridad, la respuesta es la misma exista o no la cuenta.</p></div>
      ${S.ui.resetSent ? VA.notice('mail', 'Si el correo corresponde a una cuenta, vas a recibir el enlace en unos minutos. <b>Demo:</b> el mensaje queda en la bandeja de salida simulada.', 'ok') : `<form data-form="reset" class="stack" novalidate><label class="field"><span>Correo electrónico</span><input class="in" id="rs-email" name="email" type="email" autocomplete="email" required></label><div id="rs-err" class="err" role="alert"></div><button class="btn primary" type="submit" style="min-height:46px">Enviar enlace</button></form>`}
      <button class="link" data-act="resetMode" data-v="0" style="align-self:flex-start">Volver al ingreso</button>`
    : `<div class="stack sm"><p class="eyebrow">Portal privado</p><h1 class="serif" style="font-size:clamp(30px,4vw,40px)">Ingresá a tu cuenta</h1></div>
    <form data-form="login" class="stack" novalidate>
      <label class="field"><span>Correo electrónico</span><input class="in" id="lg-email" name="email" type="email" autocomplete="username" required value="${esc(S.ui.lgEmail || '')}"></label>
      <div class="field"><label class="lbl" for="lg-pw">Contraseña</label><div style="position:relative"><input class="in" id="lg-pw" name="password" type="${S.ui.showPw ? 'text' : 'password'}" autocomplete="current-password" required value="${esc(S.ui.lgPw || '')}" style="padding-right:46px"><button type="button" class="btn ghost icon" data-act="togglePw" aria-label="${S.ui.showPw ? 'Ocultar' : 'Mostrar'} contraseña" aria-pressed="${!!S.ui.showPw}" style="position:absolute;right:2px;top:1px">${icon(S.ui.showPw ? 'eyeoff' : 'eye')}</button></div></div>
      <div class="row between"><span></span><button type="button" class="link" data-act="resetMode" data-v="1">¿Olvidaste tu contraseña?</button></div>
      <div id="lg-err" class="err" role="alert">${esc(S.ui.lgErr || '')}</div>
      <button class="btn primary" type="submit" style="min-height:46px" id="lg-btn">Ingresar</button>
    </form>
    <div class="creds"><div class="ch">${icon('info')}<span><b>Credenciales ficticias de demostración.</b> Contraseñas: administración <span class="mono">${VA.DEMO_PW.admin}</span> · abogados <span class="mono">${VA.DEMO_PW.lawyer}</span> · clientes <span class="mono">${VA.DEMO_PW.client}</span>. En producción este panel no existe.</span></div>
      ${DEMO_USERS.map(([r, e, role, n]) => `<div class="cred"><span class="r">${esc(r)}</span><span class="e"><b style="font-weight:500">${esc(n)}</b> <span class="muted xs">${esc(e)}</span></span><button class="btn sm" data-act="fillCred" data-e="${esc(e)}" data-r="${role}">Usar</button></div>`).join('')}</div>`}
  </section></div>`;
};
ACT.togglePw = () => { const pw = document.getElementById('lg-pw'), em = document.getElementById('lg-email'); S.ui.lgPw = pw ? pw.value : ''; S.ui.lgEmail = em ? em.value : ''; S.ui.showPw = !S.ui.showPw; VA.refresh(); };
ACT.resetMode = el => { S.ui.resetMode = el.dataset.v === '1'; S.ui.resetSent = false; VA.refresh(); };
ACT.fillCred = el => { S.ui.lgEmail = el.dataset.e; S.ui.lgPw = VA.DEMO_PW[el.dataset.r]; S.ui.lgErr = ''; VA.refresh(); const b = document.getElementById('lg-btn'); if (b) b.focus(); };
FORM.login = (d, form) => {
  const btn = form.querySelector('#lg-btn'); const err = form.querySelector('#lg-err');
  S.ui.lgEmail = d.email; S.ui.lgPw = d.password;
  if (!d.email || !d.password) { err.textContent = 'Ingresá tu correo y tu contraseña.'; return; }
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Verificando…';
  setTimeout(() => {
    try {
      const r = VA.server.auth.login(d.email, d.password);
      S.token = r.token; S.me = r.user; VA.ss.set('va_tok', r.token);
      S.ui.lgPw = ''; S.ui.lgErr = ''; S.ui.showPw = false;
      try { VA.server.runScheduler(); } catch (e) { }
      const to = S.after && !['', 'ingresar'].includes(S.after) ? S.after : 'panel'; S.after = null;
      VA.go(to);
      VA.toast('Hola, ' + r.user.name.split(' ')[0] + '.', 'ok');
    } catch (e) { S.ui.lgErr = e.message; btn.disabled = false; btn.textContent = 'Ingresar'; err.textContent = e.message; }
  }, 450);
};
FORM.reset = (d, form) => { try { VA.server.auth.requestReset(d.email); S.ui.resetSent = true; VA.refresh(); } catch (e) { form.querySelector('#rs-err').textContent = e.message; } };

/* ── páginas legales ── */
const legalPage = (title, body) => `<div class="pub">${header()}<section class="sec" style="max-width:860px"><button class="crumb" data-go="">${icon('left')}Volver al inicio</button><h1 class="serif" style="font-size:clamp(34px,5vw,52px);margin:8px 0 24px">${title}</h1>${VA.notice('alert', 'Texto de demostración redactado como punto de partida. Debe ser revisado y adaptado por un profesional antes de publicarse.', 'gold')}<div class="prose" style="margin-top:24px">${body}</div></section>${footer()}</div>`;
V.privacy = () => legalPage('Aviso de privacidad', `
<p>Villafañe &amp; Asociados (firma ficticia) trata los datos personales que nos facilitás para responder tu consulta, prestar servicios jurídicos y administrar la relación profesional.</p>
<h3>Qué datos tratamos</h3><ul><li>Datos de contacto: nombre, correo, teléfono y preferencia de contacto.</li><li>Datos del asunto que nos describas y la documentación que cargues en el portal una vez confirmada la relación.</li><li>Datos de identificación, cuando sean necesarios para el caso.</li><li>Datos de facturación y pagos. No almacenamos números completos de tarjeta ni códigos de seguridad.</li></ul>
<h3>Para qué los usamos</h3><p>Para evaluar tu consulta, prestar el servicio contratado, emitir presupuestos y comprobantes, coordinar reuniones y enviarte avisos sobre tu expediente según tus preferencias.</p>
<h3>Quién accede</h3><p>Solo el personal autorizado del estudio, según su rol: tu profesional responsable y la administración con permisos específicos. Cada acceso sensible queda registrado.</p>
<h3>Conservación</h3><p>Conservamos los expedientes cerrados durante el plazo configurado por el estudio y las consultas no convertidas durante un plazo menor, salvo obligación legal distinta.</p>
<h3>Tus derechos</h3><p>Podés solicitar acceso, rectificación o supresión de tus datos escribiendo al correo del estudio. La normativa aplicable en Argentina (Ley 25.326 y sus actualizaciones) debe verificarse con asesoramiento profesional antes de la puesta en producción.</p>`);
V.terms = () => legalPage('Términos de uso', `
<p>El uso de este sitio y del portal privado implica la aceptación de estos términos de demostración.</p>
<h3>Naturaleza de la información</h3><p>Los contenidos del sitio son informativos y no constituyen asesoramiento jurídico. La relación profesional comienza con la aceptación de un presupuesto.</p>
<h3>Portal privado</h3><p>El acceso es personal. Cuidá tus credenciales y cerrá la sesión en dispositivos compartidos. La sesión vence tras 30 minutos de inactividad.</p>
<h3>Aceptaciones digitales</h3><p>La aceptación de presupuestos desde el portal registra fecha, usuario y versión del documento. Ese registro no equivale a una firma electrónica o digital con validez legal; si se requiere, se instrumentará por los medios correspondientes.</p>
<h3>Comprobantes</h3><p>Los comprobantes emitidos en la plataforma son documentos internos de gestión y no reemplazan a las facturas fiscales oficiales.</p>`);

/* ── ACERCA DE LA DEMO (documentación + pruebas de aceptación) ── */
V.about = () => {
  const res = S.ui.testRes;
  return `<div class="pub">${header()}<section class="sec" style="max-width:980px">
  <button class="crumb" data-go="${S.me ? 'panel' : ''}">${icon('left')}${S.me ? 'Volver al portal' : 'Volver al inicio'}</button>
  <p class="eyebrow" style="margin-top:12px">Documentación</p><h1 class="serif" style="font-size:clamp(34px,5vw,52px);margin:10px 0 18px">Acerca de esta demo</h1>
  <div class="prose">
  <p>Villafañe &amp; Asociados es un prototipo funcional de plataforma LegalTech: sitio público, CRM jurídico, gestión de expedientes, agenda con pagos, suite financiera y portal de clientes, con permisos por rol. <b>No es un sistema productivo.</b></p>
  <h3>Cómo iniciar</h3><ul><li>Entrá a <button class="link" data-go="ingresar">Portal privado</button> y elegí un usuario ficticio con «Usar».</li><li>Probá el mismo flujo desde distintos roles: por ejemplo, Elena (cliente) paga un turno, Julia (abogada) lo aprueba y Elena ve la confirmación.</li><li>Los cambios se guardan en este navegador. Para empezar de cero: Ajustes → Restablecer datos de demostración, o el botón de abajo.</li></ul>
  <h3>Credenciales ficticias</h3>
  <div class="panel tw"><table class="t"><thead><tr><th>Rol</th><th>Usuario</th><th>Correo</th></tr></thead><tbody>${DEMO_USERS.map(([r, e, role, n]) => `<tr><td>${esc(r)}</td><td>${esc(n)}</td><td class="mono xs">${esc(e)}</td></tr>`).join('')}</tbody></table></div>
  <p class="small">Contraseñas: administración <code>${VA.DEMO_PW.admin}</code>, abogados <code>${VA.DEMO_PW.lawyer}</code>, clientes <code>${VA.DEMO_PW.client}</code>. Se guardan con hash y sal; nunca en texto plano.</p>
  <h3>Qué está implementado</h3><ul>
  <li><b>Control de acceso en la capa de servidor:</b> cada consulta pasa por la API, que resuelve la sesión, valida el rol y el permiso específico y filtra por expediente. Ocultar botones no es la única barrera: las URLs como <code>#expediente.k14</code> se rechazan si no corresponden y el intento se audita.</li>
  <li><b>Dos administradores con permisos configurables</b> (general y operativa/financiera), abogados con acceso solo a sus casos (o permiso explícito por expediente) y clientes aislados entre sí.</li>
  <li><b>Expedientes</b> con estados, prioridades, tareas, documentos con visibilidad interna/compartida, solicitudes de documentación, notas internas separadas de las actualizaciones al cliente e historial de actividad.</li>
  <li><b>CRM</b> con pipeline Kanban y tabla, filtros, ficha completa, alertas convertibles en tareas e incorporación de contactos como clientes.</li>
  <li><b>Presupuestos</b> con versiones, emisión, envío, aceptación digital (fecha, usuario, versión y huella del contenido) y conversión en acuerdo con factura de anticipo.</li>
  <li><b>Facturas internas y pagos</b>: los saldos se recalculan con cada pago confirmado; los pagos manuales requieren verificación de un segundo administrador.</li>
  <li><b>Agenda</b> con disponibilidad, bloqueos, reserva temporal, pago previo, aprobación profesional, reprogramación y reglas de reintegro. No permite dobles reservas.</li>
  <li><b>Notificaciones</b> internas con deduplicación, preferencias de correo y recordatorios programados (reuniones, pagos y presupuestos).</li>
  <li><b>Importes en centavos enteros</b>, sin operar con decimales flotantes.</li></ul>
  <h3>Reglas de turnos y reintegros</h3><ul><li>El cliente elige tipo de consulta, profesional (o asignación del estudio), duración y horario, y ve el costo antes de pagar.</li><li>El horario queda reservado temporalmente hasta que se registre el pago. Pagado no es confirmado: el turno queda «Pendiente de aprobación» hasta que el profesional lo acepta.</li><li>Rechazo o cancelación por el estudio: reintegro del 100 %. Cancelación del cliente antes de la aprobación o con 24 h o más: reintegro del 100 %. Con menos de 24 h: se acredita el 50 % como saldo a favor. Reprogramación propuesta y no aceptada: reintegro del 100 %.</li></ul>
  <h3>Limitaciones e integraciones pendientes</h3><ul>
  <li><b>Persistencia:</b> los datos viven en el almacenamiento local del navegador. La capa de servidor corre en el mismo dispositivo, así que su aislamiento es demostrativo; en producción debe ejecutarse en un servidor real (por ejemplo, Next.js + PostgreSQL con políticas por fila) con el modelo de datos del archivo <code>schema.sql</code> entregado.</li>
  <li><b>Pagos:</b> pasarela en modo de prueba. Para producción se integra un proveedor (Mercado Pago, Stripe u otro) con confirmación por webhook firmado.</li>
  <li><b>Correo:</b> los envíos quedan en una bandeja de salida simulada. Falta configurar un proveedor (SMTP, Resend, SES).</li>
  <li><b>Archivos:</b> solo se guardan metadatos. Falta un almacenamiento privado (bucket con URLs firmadas) y antivirus.</li>
  <li><b>Facturación fiscal:</b> los comprobantes son internos. La factura electrónica requiere integración con ARCA (ex AFIP).</li>
  <li><b>Firma electrónica:</b> la aceptación digital registra evidencia, pero no constituye firma electrónica o digital con validez legal.</li>
  <li><b>PDF:</b> la vista de documento está lista para imprimirse desde un navegador; la generación de PDF en servidor queda pendiente.</li>
  <li><b>Cumplimiento:</b> la adecuación a la Ley 25.326, a normas de secreto profesional y a requisitos de seguridad debe validarla un profesional. Esta demo no afirma cumplirlas.</li></ul>
  <h3>Cómo administrar los datos</h3><ul>
  <li><b>Currículums y perfiles:</b> Nuestro equipo → elegí un profesional → «Currículum» y «Trayectoria».</li>
  <li><b>Tarifas:</b> en la misma ficha, sección Honorarios (requiere el permiso «Configurar honorarios y tarifas»). El cambio queda auditado.</li>
  <li><b>Pagos:</b> en la demo se usan tarjetas de prueba: <code>4242 4242 4242 4242</code> aprobada, <code>4000 0000 0000 0002</code> rechazada. Con un proveedor real se reemplaza la función de inicio de pago y el webhook.</li>
  <li><b>Datos de la firma y del pie del sitio:</b> Ajustes → Datos institucionales.</li>
  <li><b>Datos de demostración:</b> el archivo <code>core.js</code> contiene la función de datos semilla; podés editarla o restablecer la demo.</li></ul>
  </div>
  <div class="panel" style="margin-top:32px"><div class="panel-h"><h2>Pruebas de aceptación</h2><button class="btn primary" data-act="runTests">${icon('check')}Ejecutar pruebas</button></div><div class="panel-b">
  <p class="small muted">Corren sobre un juego de datos de ejemplo recién generado, usando la misma API que usa la interfaz. No modifican tus datos.</p>
  ${res ? res.map(r => `<div class="test-row"><span class="mk ${r.ok ? 'ok' : 'bad'}">${r.ok ? '✓' : '✕'}</span><div><b style="font-weight:600">${r.n}. ${esc(r.name)}</b><p class="small muted" style="margin-top:2px">${esc(r.detail)}</p></div></div>`).join('') + `<p class="small" style="margin-top:12px"><b>${res.filter(r => r.ok).length} de ${res.length}</b> pruebas superadas.</p>` : ''}
  </div></div>
  <div class="row" style="margin-top:24px"><button class="btn danger" data-act="resetDemo">${icon('refresh')}Restablecer datos de demostración</button></div>
  </section>${footer()}</div>`;
};
ACT.runTests = () => { try { S.ui.testRes = VA.runAcceptance(); VA.refresh(); } catch (e) { VA.handle(e); } };
ACT.resetDemo = () => VA.confirm({ title: 'Restablecer la demo', text: 'Se borran todos los cambios hechos en este navegador y se vuelven a cargar los datos de ejemplo. También se cierra la sesión.', label: 'Restablecer', danger: true }, () => { VA.resetDB(); VA.toast('Datos de demostración restablecidos.', 'ok'); VA.go('ingresar'); });
})();
