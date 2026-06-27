-- ============================================================
-- CAVALTEC — Invitaciones pendientes (unir al equipo por email)
-- Permite invitar a alguien que todavía NO ingresó: queda pendiente y
-- se une automáticamente la primera vez que entra con ese email.
-- Pegar en: Supabase Dashboard → SQL Editor → Run.
-- ============================================================

-- 1) Tabla de invitaciones pendientes.
create table if not exists public.invitaciones (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  email       text not null,
  rol         text not null check (rol in ('admin', 'evaluador', 'auditor')),
  creado_por  uuid not null references auth.users (id),
  created_at  timestamptz not null default now(),
  unique (company_id, email)
);

alter table public.invitaciones enable row level security;

-- Los miembros ven las invitaciones pendientes de su empresa.
drop policy if exists "invitaciones visibles a miembros" on public.invitaciones;
create policy "invitaciones visibles a miembros" on public.invitaciones
  for select using (public.es_miembro(company_id));

-- Un admin puede cancelar (borrar) una invitación de su empresa.
drop policy if exists "admin cancela invitacion" on public.invitaciones;
create policy "admin cancela invitacion" on public.invitaciones
  for delete using (
    exists (
      select 1 from public.company_members
      where company_id = invitaciones.company_id and user_id = auth.uid() and rol = 'admin'
    )
  );

-- 2) RPC: si el usuario existe lo agrega; si no, crea una invitación pendiente.
--    Devuelve: 'agregado' | 'invitado' | 'no_admin' | 'rol_invalido'.
create or replace function public.agregar_miembro_por_email(
  p_company uuid,
  p_email text,
  p_rol text
)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user  uuid;
  v_email text := lower(trim(p_email));
begin
  if not exists (
    select 1 from public.company_members
    where company_id = p_company and user_id = auth.uid() and rol = 'admin'
  ) then
    return 'no_admin';
  end if;

  if p_rol not in ('admin', 'evaluador', 'auditor') then
    return 'rol_invalido';
  end if;

  select id into v_user from auth.users where lower(email) = v_email;

  if v_user is not null then
    insert into public.company_members (company_id, user_id, rol)
    values (p_company, v_user, p_rol)
    on conflict (company_id, user_id) do update set rol = excluded.rol;
    return 'agregado';
  else
    insert into public.invitaciones (company_id, email, rol, creado_por)
    values (p_company, v_email, p_rol, auth.uid())
    on conflict (company_id, email) do update set rol = excluded.rol;
    return 'invitado';
  end if;
end;
$$;

-- 3) Trigger de registro: consume las invitaciones al ingresar por primera vez.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));

  -- Auto-unir a todas las empresas que lo invitaron por este email.
  insert into public.company_members (company_id, user_id, rol)
  select i.company_id, new.id, i.rol
  from public.invitaciones i
  where lower(i.email) = lower(new.email)
  on conflict (company_id, user_id) do nothing;

  delete from public.invitaciones where lower(email) = lower(new.email);

  return new;
end;
$$;
