-- Villafañe & Asociados — modelo de datos de referencia para producción (PostgreSQL 15+)
-- La demo replica estas entidades en el navegador. Importes SIEMPRE en centavos enteros (bigint).
-- El aislamiento por cliente/abogado se refuerza con Row Level Security (ver final).

create extension if not exists pgcrypto;

create type user_role      as enum ('admin','lawyer','client');
create type case_status    as enum ('Nuevo','En evaluación','Presupuesto enviado','Pendiente de documentación','Activo','En espera','Cerrado','Archivado');
create type case_priority  as enum ('Baja','Media','Alta','Urgente');
create type doc_visibility as enum ('interna','compartido');
create type meeting_status as enum ('Solicitado','Pendiente de pago','Pago confirmado','Pendiente de aprobación','Aprobado','Rechazado','Reprogramación propuesta','Cancelado','Realizado');
create type quote_status   as enum ('Borrador','Emitido','Enviado','Aceptado','Rechazado','Vencido');
create type invoice_status as enum ('Borrador','Emitida','Anulada');           -- Pagada/Parcial/Vencida se derivan de pagos y fechas
create type payment_status as enum ('Procesando','Confirmado','Fallido','Reembolsado','Reembolso parcial','Pendiente de verificación');
create type pipeline_stage as enum ('Nuevo contacto','Primer intento de contacto','Contactado','Reunión solicitada','Reunión agendada','Presupuesto en preparación','Presupuesto enviado','Presupuesto aceptado','Cliente incorporado','No convertido');

create table roles (
  id text primary key,                                   -- 'admin_general', 'admin_operativo', ...
  name text not null,
  permissions text[] not null default '{}'               -- 'expedientes.todos', 'finanzas.gestionar', ...
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  name text not null,
  role user_role not null,
  role_id text references roles(id),                     -- solo administradores
  password_hash text,                                    -- argon2id; null hasta aceptar la invitación
  active boolean not null default true,
  notify_email boolean not null default true,
  failed_logins int not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table lawyer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id),
  title text, specialty text, areas text[] not null default '{}',
  bio text, phone text, languages text[] default '{}',
  photo_path text,                                       -- ruta en el bucket privado
  cv_path text, cv_uploaded_at timestamptz,
  experience jsonb not null default '[]',
  rate_cents bigint not null check (rate_cents between 1000 and 500000),
  availability text not null default 'Disponible',
  can_view_finance boolean not null default false,
  can_approve_meetings boolean not null default true,
  can_issue_quotes boolean not null default false,
  active boolean not null default true
);

create table client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id),
  phone text, address text,
  doc_type text, doc_number_enc bytea,                   -- cifrado a nivel de columna (pgp_sym_encrypt / KMS)
  doc_country text, birth_date date,
  verification text not null default 'No verificado' check (verification in ('No verificado','En revisión','Verificado manualmente')),
  verified_by uuid references users(id), verified_at timestamptz, verification_note text,
  contact_pref text, created_at timestamptz not null default now()
);

create table cases (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,                           -- EXP-2026-0011
  title text not null,
  client_id uuid not null references client_profiles(id),
  lawyer_id uuid not null references lawyer_profiles(id),
  area text not null,
  description text, client_summary text,
  status case_status not null default 'Nuevo',
  priority case_priority not null default 'Media',
  opened_at date not null default current_date,
  next_date date, next_label text,
  fees_cents bigint not null default 0 check (fees_cents >= 0),
  currency char(3) not null default 'USD',
  updated_at timestamptz not null default now()
);
create index on cases (client_id); create index on cases (lawyer_id); create index on cases (status);

create table case_assignments (                          -- permisos explícitos adicionales
  case_id uuid references cases(id) on delete cascade,
  lawyer_id uuid references lawyer_profiles(id),
  granted_by uuid references users(id), granted_at timestamptz default now(),
  primary key (case_id, lawyer_id)
);
create table case_client_access (                        -- otros clientes autorizados
  case_id uuid references cases(id) on delete cascade,
  client_id uuid references client_profiles(id),
  primary key (case_id, client_id)
);

create table case_activities (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  kind text not null check (kind in ('interna','cliente','sistema')),
  text text not null, author_id uuid references users(id),
  created_at timestamptz not null default now()
);
create index on case_activities (case_id, created_at desc);

create table internal_notes (                            -- notas internas fuera de expediente (CRM, reuniones)
  id uuid primary key default gen_random_uuid(),
  entity text not null, entity_id uuid not null,
  text text not null, author_id uuid references users(id), created_at timestamptz default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  name text not null, category text not null,
  mime text not null check (mime in ('application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  storage_path text not null,                            -- bucket privado; descarga con URL firmada de corta duración
  sha256 text not null,
  visibility doc_visibility not null default 'interna',
  review_status text not null default 'Pendiente de revisión',
  review_note text, reviewed_by uuid references users(id),
  replaceable boolean not null default false, replaces uuid references documents(id),
  request_id uuid, uploaded_by uuid not null references users(id),
  created_at timestamptz not null default now()
);
create index on documents (case_id);

create table document_permissions (                      -- excepciones puntuales a la visibilidad
  document_id uuid references documents(id) on delete cascade,
  user_id uuid references users(id), can_download boolean default true,
  primary key (document_id, user_id)
);

create table document_requests (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  title text not null, category text, due_date date,
  status text not null default 'Pendiente', requested_by uuid references users(id), created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null, case_id uuid references cases(id), contact_id uuid,
  assignee_id uuid not null references users(id), due_date date not null,
  done boolean not null default false, source text, alert_key text,
  created_by uuid references users(id), created_at timestamptz default now()
);
create unique index on tasks (alert_key) where alert_key is not null and not done;

create table crm_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null, email citext, phone text,
  client_id uuid references client_profiles(id),
  stage pipeline_stage not null default 'Nuevo contacto',
  source text, area text, first_contact date not null default current_date,
  lawyer_id uuid references lawyer_profiles(id), owner_id uuid references users(id),
  tags text[] default '{}', notes text,                 -- notas internas: nunca expuestas al cliente
  next_action text, next_action_date date,
  last_activity_at timestamptz default now()
);
create table crm_communications (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references crm_contacts(id) on delete cascade,
  channel text not null, summary text not null, by_user uuid references users(id), created_at timestamptz default now()
);

create table availability_slots (                        -- horario laboral y bloqueos
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references lawyer_profiles(id),
  kind text not null check (kind in ('laboral','bloqueo')),
  starts_at timestamptz not null, ends_at timestamptz not null check (ends_at > starts_at),
  weekday smallint, reason text
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references lawyer_profiles(id),
  client_id uuid references client_profiles(id), case_id uuid references cases(id), contact_id uuid references crm_contacts(id),
  type text not null, area text,
  starts_at timestamptz not null, duration_min int not null check (duration_min in (30,60,90)),
  rate_cents bigint not null, total_cents bigint not null, currency char(3) not null default 'USD',
  status meeting_status not null, hold_until timestamptz, proposed_start timestamptz,
  description text, private_notes text,
  created_at timestamptz default now(),
  slot tstzrange generated always as (tstzrange(starts_at, starts_at + make_interval(mins => duration_min))) stored
);
-- Sin dobles reservas: dos reuniones activas del mismo profesional no pueden superponerse.
create extension if not exists btree_gist;
alter table meetings add constraint no_double_booking exclude using gist (lawyer_id with =, slot with &&)
  where (status in ('Pendiente de pago','Pago confirmado','Pendiente de aprobación','Aprobado','Reprogramación propuesta'));
create table meeting_history (
  id bigserial primary key, meeting_id uuid references meetings(id) on delete cascade,
  from_status meeting_status, to_status meeting_status not null, note text, by_user uuid references users(id), created_at timestamptz default now()
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique not null, version int not null default 1,
  client_id uuid references client_profiles(id), contact_id uuid references crm_contacts(id), case_id uuid references cases(id),
  lawyer_id uuid not null references lawyer_profiles(id),
  service text not null, scope text not null,
  tax_rate_bp int not null default 0 check (tax_rate_bp in (0,1050,2100)),
  payment_method text, advance_pct int check (advance_pct between 0 and 100), installments int check (installments between 0 and 24),
  valid_until date not null, conditions text, notes text,
  status quote_status not null default 'Borrador', issued_at date, sent_at timestamptz, converted_at timestamptz,
  check (client_id is not null or contact_id is not null)
);
create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  kind text not null check (kind in ('honorarios','gastos')), description text not null,
  amount_cents bigint not null check (amount_cents > 0)
);
create table quote_acceptances (                         -- evidencia, no firma electrónica con validez legal
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id), version int not null,
  decision text not null check (decision in ('Aceptado','Rechazado')),
  user_id uuid not null references users(id), on_behalf boolean not null default false,
  content_sha256 text not null, ip inet, user_agent text, reason text, created_at timestamptz default now()
);

create table invoices (                                  -- comprobantes internos (no fiscales) hasta integrar ARCA
  id uuid primary key default gen_random_uuid(),
  number text unique not null, client_id uuid not null references client_profiles(id),
  case_id uuid not null references cases(id), quote_id uuid references quotes(id),
  concept text not null, issued_at date, due_at date not null,
  status invoice_status not null default 'Borrador', currency char(3) not null default 'USD',
  fiscal_cae text, fiscal_status text                    -- reservado para la integración fiscal
);
create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null, amount_cents bigint not null check (amount_cents > 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id), case_id uuid references cases(id),
  invoice_id uuid references invoices(id), meeting_id uuid references meetings(id),
  concept text, amount_cents bigint not null check (amount_cents > 0), currency char(3) not null default 'USD',
  method text not null, status payment_status not null,
  provider text, provider_ref text unique,               -- id de la pasarela; confirmación solo por webhook firmado
  card_brand text, card_last4 char(4),                   -- nunca número completo ni CVC
  fee_cents bigint not null default 0, refunded_cents bigint not null default 0 check (refunded_cents <= amount_cents),
  registered_by uuid references users(id), confirmed_by uuid references users(id), confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  check (invoice_id is not null or meeting_id is not null or concept is not null)
);
create table client_credits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id), amount_cents bigint not null, reason text, created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id), type text not null, title text not null, body text,
  link text, read_at timestamptz, dedupe_key text, created_at timestamptz not null default now()
);
create unique index on notifications (user_id, dedupe_key) where dedupe_key is not null;   -- evita envíos duplicados
create table email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email citext not null, subject text not null, body text not null,
  status text not null default 'pendiente', provider_ref text, attempts int default 0, created_at timestamptz default now()
);

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null, category text not null, subject text not null, body text not null, updated_at timestamptz default now()
);

create table audit_logs (                                -- solo inserción
  id bigserial primary key, at timestamptz not null default now(),
  user_id uuid references users(id), action text not null, entity text, entity_id text, detail text, ip inet
);
revoke update, delete on audit_logs from public;

create table settings (key text primary key, value jsonb not null);

-- ── Row Level Security (ejemplos). La app fija current_setting('app.user_id') por request. ──
alter table cases enable row level security;
create policy cases_client on cases for select using (
  client_id in (select id from client_profiles where user_id = current_setting('app.user_id')::uuid)
  or id in (select case_id from case_client_access a join client_profiles c on c.id = a.client_id where c.user_id = current_setting('app.user_id')::uuid));
create policy cases_lawyer on cases for select using (
  lawyer_id in (select id from lawyer_profiles where user_id = current_setting('app.user_id')::uuid)
  or id in (select case_id from case_assignments a join lawyer_profiles l on l.id = a.lawyer_id where l.user_id = current_setting('app.user_id')::uuid));
create policy cases_admin on cases for all using (exists (
  select 1 from users u join roles r on r.id = u.role_id where u.id = current_setting('app.user_id')::uuid and 'expedientes.todos' = any(r.permissions)));

alter table documents enable row level security;
create policy docs_client on documents for select using (
  visibility = 'compartido' and case_id in (select id from cases));   -- hereda el filtro de cases
alter table case_activities enable row level security;
create policy act_client on case_activities for select using (kind = 'cliente' and case_id in (select id from cases));
alter table notifications enable row level security;
create policy notif_owner on notifications using (user_id = current_setting('app.user_id')::uuid);
create policy docs_staff on documents for select using (
  exists (select 1 from users u where u.id = current_setting('app.user_id')::uuid and u.role in ('admin','lawyer')) and case_id in (select id from cases));
create policy act_staff on case_activities for select using (
  exists (select 1 from users u where u.id = current_setting('app.user_id')::uuid and u.role in ('admin','lawyer')) and case_id in (select id from cases));
