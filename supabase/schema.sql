-- ============================================================================
-- Escuela de Natación · La Loma de Santi Petri
-- Esquema de base de datos para Supabase (Postgres)
-- Ejecutar completo en: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabla de sesiones (clases)
-- ----------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null default '11:00',
  end_time time not null default '12:00',
  capacity integer not null default 10 check (capacity > 0),
  created_at timestamptz not null default now()
);

comment on table public.sessions is 'Sesiones/clases de natación disponibles para reservar.';

-- ----------------------------------------------------------------------------
-- 2. Tabla de reservas (bookings)
-- ----------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  child_name text not null check (char_length(trim(child_name)) > 0),
  child_age integer not null check (child_age >= 0 and child_age <= 17),
  guardian_name text not null check (char_length(trim(guardian_name)) > 0),
  phone text not null check (char_length(trim(phone)) > 0),
  email text,
  cancel_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);

comment on table public.bookings is 'Reservas de niños/as para una sesión concreta.';

-- Evita doble reserva accidental del mismo teléfono o email en la misma sesión.
create unique index if not exists bookings_session_phone_unique
  on public.bookings (session_id, phone);

create unique index if not exists bookings_session_email_unique
  on public.bookings (session_id, lower(email))
  where email is not null and email <> '';

create index if not exists bookings_session_id_idx on public.bookings (session_id);
create index if not exists sessions_date_idx on public.sessions (date, start_time);

-- ----------------------------------------------------------------------------
-- 3. Control de aforo a nivel de base de datos (evita overbooking por
--    condiciones de carrera: bloquea la fila de la sesión antes de contar).
-- ----------------------------------------------------------------------------
create or replace function public.check_session_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_count integer;
begin
  select capacity into v_capacity
  from public.sessions
  where id = new.session_id
  for update; -- serializa inserts concurrentes para la misma sesión

  if v_capacity is null then
    raise exception 'La sesión indicada no existe.';
  end if;

  select count(*) into v_count
  from public.bookings
  where session_id = new.session_id;

  if v_count >= v_capacity then
    raise exception 'Esta sesión ya está completa (aforo máximo alcanzado).';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_check_session_capacity on public.bookings;
create trigger trg_check_session_capacity
  before insert on public.bookings
  for each row execute function public.check_session_capacity();

-- ----------------------------------------------------------------------------
-- 4. Vista pública de disponibilidad (sin datos personales)
-- ----------------------------------------------------------------------------
create or replace view public.session_availability as
select
  s.id,
  s.date,
  s.start_time,
  s.end_time,
  s.capacity,
  s.created_at,
  count(b.id)::int as booked_count
from public.sessions s
left join public.bookings b on b.session_id = s.id
group by s.id
order by s.date asc, s.start_time asc;

-- ----------------------------------------------------------------------------
-- 5. Funciones RPC seguras para el flujo público sin login
--    (consultar/cancelar la propia reserva mediante cancel_token)
-- ----------------------------------------------------------------------------
create or replace function public.get_booking_by_token(p_token uuid)
returns table (
  id uuid,
  child_name text,
  child_age integer,
  guardian_name text,
  phone text,
  email text,
  cancel_token uuid,
  created_at timestamptz,
  session_id uuid,
  session_date date,
  session_start_time time,
  session_end_time time
)
language sql
security definer
set search_path = public
as $$
  select
    b.id, b.child_name, b.child_age, b.guardian_name, b.phone, b.email,
    b.cancel_token, b.created_at,
    s.id as session_id, s.date as session_date,
    s.start_time as session_start_time, s.end_time as session_end_time
  from public.bookings b
  join public.sessions s on s.id = b.session_id
  where b.cancel_token = p_token;
$$;

create or replace function public.cancel_booking(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.bookings where cancel_token = p_token;
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.sessions enable row level security;
alter table public.bookings enable row level security;

-- Sesiones: lectura pública (para la landing), escritura solo admins logueados.
drop policy if exists "sessions_public_read" on public.sessions;
create policy "sessions_public_read"
  on public.sessions for select
  to anon, authenticated
  using (true);

drop policy if exists "sessions_admin_insert" on public.sessions;
create policy "sessions_admin_insert"
  on public.sessions for insert
  to authenticated
  with check (true);

drop policy if exists "sessions_admin_update" on public.sessions;
create policy "sessions_admin_update"
  on public.sessions for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "sessions_admin_delete" on public.sessions;
create policy "sessions_admin_delete"
  on public.sessions for delete
  to authenticated
  using (true);

-- Reservas: cualquiera puede crear una reserva (validada por el trigger de
-- aforo y los índices únicos anti-duplicado). Solo el admin autenticado puede
-- listar/editar/borrar reservas directamente; el público consulta/cancela la
-- suya únicamente a través de las funciones RPC (security definer) de arriba.
drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select"
  on public.bookings for select
  to authenticated
  using (true);

drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete"
  on public.bookings for delete
  to authenticated
  using (true);

-- Permisos de ejecución de las funciones RPC públicas
grant execute on function public.get_booking_by_token(uuid) to anon, authenticated;
grant execute on function public.cancel_booking(uuid) to anon, authenticated;
grant select on public.session_availability to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7. Datos de ejemplo: ciclo de clases de julio 2026 (opcional)
--    Descomenta para precargar las 4 fechas del enunciado.
-- ----------------------------------------------------------------------------
-- insert into public.sessions (date, start_time, end_time, capacity) values
--   ('2026-07-17', '11:00', '12:00', 10),
--   ('2026-07-20', '11:00', '12:00', 10),
--   ('2026-07-25', '11:00', '12:00', 10),
--   ('2026-07-28', '11:00', '12:00', 10);
