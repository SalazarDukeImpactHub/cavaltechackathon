-- ============================================================
-- CAVALTEC — Schema multi-tenant + RLS (Ley 1581 autodiagnóstico)
-- Pegar en: Supabase Dashboard → SQL Editor → Run.
-- El CUESTIONARIO (11 preguntas) NO vive acá: es config en código.
-- Acá persistimos sólo evaluaciones y respuestas, aisladas por empresa.
-- ============================================================

-- ---------- Perfiles (1:1 con auth.users) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text,
  created_at timestamptz not null default now()
);

-- ---------- Empresas ----------
create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  nit        text,
  sector     text,
  tamano     text,             -- micro | pequena | mediana | grande
  creado_por uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

-- ---------- Membresías (rol del usuario en una empresa) ----------
create table if not exists public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  rol        text not null default 'admin'
             check (rol in ('admin', 'evaluador', 'auditor')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- ---------- Evaluaciones (cada autodiagnóstico) ----------
create table if not exists public.evaluations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  creado_por  uuid not null references auth.users (id),
  estado      text not null default 'completada'
              check (estado in ('borrador', 'completada')),
  porcentaje  int  not null default 0 check (porcentaje between 0 and 100),
  created_at  timestamptz not null default now()
);

-- ---------- Respuestas (1 por pregunta de cada evaluación) ----------
create table if not exists public.answers (
  id              uuid primary key default gen_random_uuid(),
  evaluation_id   uuid not null references public.evaluations (id) on delete cascade,
  pregunta_codigo text not null,                 -- 'P1'..'P11'
  respuesta       text not null check (respuesta in ('si', 'no', 'na')),
  unique (evaluation_id, pregunta_codigo)
);

-- ============================================================
-- Row Level Security — el muro multiempresa
-- ============================================================

-- Helper: ¿el usuario actual es miembro de esta empresa?
create or replace function public.es_miembro(p_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where company_id = p_company_id and user_id = auth.uid()
  );
$$;

alter table public.profiles        enable row level security;
alter table public.companies       enable row level security;
alter table public.company_members enable row level security;
alter table public.evaluations     enable row level security;
alter table public.answers         enable row level security;

-- profiles: cada quien ve y edita el suyo
create policy "perfil propio - select" on public.profiles
  for select using (id = auth.uid());
create policy "perfil propio - upsert" on public.profiles
  for insert with check (id = auth.uid());
create policy "perfil propio - update" on public.profiles
  for update using (id = auth.uid());

-- companies: ve quien es miembro; crea cualquier autenticado (queda como creador)
create policy "empresas visibles a miembros" on public.companies
  for select using (public.es_miembro(id));
create policy "crear empresa" on public.companies
  for insert with check (creado_por = auth.uid());

-- company_members: ve quien comparte la empresa
create policy "membresias visibles a miembros" on public.company_members
  for select using (public.es_miembro(company_id));
create policy "agregar miembro a empresa propia" on public.company_members
  for insert with check (public.es_miembro(company_id) or user_id = auth.uid());

-- evaluations: scoping por empresa
create policy "evaluaciones de mi empresa - select" on public.evaluations
  for select using (public.es_miembro(company_id));
create policy "evaluaciones de mi empresa - insert" on public.evaluations
  for insert with check (public.es_miembro(company_id) and creado_por = auth.uid());

-- answers: heredan el scoping de su evaluación
create policy "respuestas de mi empresa - select" on public.answers
  for select using (
    exists (
      select 1 from public.evaluations e
      where e.id = answers.evaluation_id and public.es_miembro(e.company_id)
    )
  );
create policy "respuestas de mi empresa - insert" on public.answers
  for insert with check (
    exists (
      select 1 from public.evaluations e
      where e.id = answers.evaluation_id and public.es_miembro(e.company_id)
    )
  );

-- ---------- Crear perfil + membresía automáticamente al registrarse ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
