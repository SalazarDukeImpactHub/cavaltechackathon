-- ============================================================
-- CAVALTEC — Roles y gestión de miembros (admin / evaluador / auditor)
-- Pegar en: Supabase Dashboard → SQL Editor → Run.
-- ============================================================

-- 1) Visibilidad de perfiles entre co-miembros (para listar nombres del equipo).
create or replace function public.comparte_empresa_con(p_user uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members a
    join public.company_members b on a.company_id = b.company_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

drop policy if exists "perfiles co-miembros - select" on public.profiles;
create policy "perfiles co-miembros - select" on public.profiles
  for select using (public.comparte_empresa_con(id));

-- 2) Agregar miembro por email (solo un admin de la empresa puede hacerlo).
--    Devuelve: 'ok' | 'no_admin' | 'rol_invalido' | 'usuario_no_encontrado'.
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
  v_user uuid;
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

  select id into v_user from auth.users where email = lower(trim(p_email));
  if v_user is null then
    return 'usuario_no_encontrado';
  end if;

  insert into public.company_members (company_id, user_id, rol)
  values (p_company, v_user, p_rol)
  on conflict (company_id, user_id) do update set rol = excluded.rol;

  return 'ok';
end;
$$;

-- 3) RBAC en la base: solo admin/evaluador pueden crear evaluaciones (auditor = solo lectura).
drop policy if exists "evaluaciones de mi empresa - insert" on public.evaluations;
create policy "evaluaciones de mi empresa - insert" on public.evaluations
  for insert with check (
    creado_por = auth.uid()
    and exists (
      select 1 from public.company_members
      where company_id = evaluations.company_id
        and user_id = auth.uid()
        and rol in ('admin', 'evaluador')
    )
  );
