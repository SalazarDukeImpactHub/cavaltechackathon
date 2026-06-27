-- ============================================================
-- CAVALTEC — Endurecimiento quirúrgico de RBAC
-- Pegar en: Supabase Dashboard → SQL Editor → Run.
-- ============================================================
-- Cubre 4 hallazgos de la auditoría de roles:
--   1) CRÍTICO: escalada de privilegios en company_members INSERT
--   2) IMPORTANTE: answers INSERT abierto a auditor
--   3) MENOR: no había RPC para cambiar rol de miembro existente
--   4) MENOR: no había RPC para remover miembro (con anti "último admin")
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1) company_members: bloquear INSERT directo desde el cliente.
-- ────────────────────────────────────────────────────────────
-- La policy anterior ("agregar miembro a empresa propia") permitía
--   ... with check (es_miembro(company_id) OR user_id = auth.uid())
-- El segundo término dejaba que CUALQUIER usuario autenticado se
-- insertara a sí mismo en cualquier empresa con el rol por defecto
-- ('admin'). Se cerraba el muro multiempresa entero por un OR.
--
-- Toda inserción legítima pasa por funciones SECURITY DEFINER:
--   - handle_new_company (trigger): creador de empresa → admin
--   - handle_new_user   (trigger): consume invitaciones pendientes
--   - agregar_miembro_por_email (RPC): único path manual
-- Esas funciones bypassean RLS, así que cerramos el INSERT directo.
drop policy if exists "agregar miembro a empresa propia" on public.company_members;
create policy "sin insert directo" on public.company_members
  for insert with check (false);

-- ────────────────────────────────────────────────────────────
-- 2) answers: alinear INSERT con la whitelist de evaluations.
-- ────────────────────────────────────────────────────────────
-- Antes: cualquier miembro (incluido auditor) podía intentar insertar
-- respuestas en evaluations existentes. La PK unique mitigaba en la
-- práctica, pero la regla correcta es la misma que evaluations.insert.
drop policy if exists "respuestas de mi empresa - insert" on public.answers;
create policy "respuestas de mi empresa - insert" on public.answers
  for insert with check (
    exists (
      select 1
      from public.evaluations e
      join public.company_members m on m.company_id = e.company_id
      where e.id = answers.evaluation_id
        and m.user_id = auth.uid()
        and m.rol in ('admin', 'evaluador')
    )
  );

-- ────────────────────────────────────────────────────────────
-- 3) RPC: cambiar el rol de un miembro existente.
-- ────────────────────────────────────────────────────────────
-- Devuelve: 'ok' | 'no_admin' | 'rol_invalido' | 'no_encontrado' | 'ultimo_admin'.
-- Anti "último admin": si el cambio dejaría a la empresa sin ningún
-- admin, se bloquea — evita que una empresa quede huérfana.
create or replace function public.cambiar_rol_miembro(
  p_company uuid,
  p_user    uuid,
  p_rol     text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_otros_admins int;
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

  -- Anti último admin: si rebajamos a alguien que es admin, debe
  -- haber al menos otro admin que se quede a cargo.
  if p_rol <> 'admin' then
    select count(*) into v_otros_admins
    from public.company_members
    where company_id = p_company and rol = 'admin' and user_id <> p_user;
    if v_otros_admins = 0 then
      return 'ultimo_admin';
    end if;
  end if;

  update public.company_members
    set rol = p_rol
    where company_id = p_company and user_id = p_user;

  if not found then
    return 'no_encontrado';
  end if;
  return 'ok';
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 4) RPC: remover un miembro de una empresa.
-- ────────────────────────────────────────────────────────────
-- Devuelve: 'ok' | 'no_admin' | 'no_encontrado' | 'ultimo_admin'.
create or replace function public.remover_miembro(
  p_company uuid,
  p_user    uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rol_destino  text;
  v_otros_admins int;
begin
  if not exists (
    select 1 from public.company_members
    where company_id = p_company and user_id = auth.uid() and rol = 'admin'
  ) then
    return 'no_admin';
  end if;

  select rol into v_rol_destino
  from public.company_members
  where company_id = p_company and user_id = p_user;
  if v_rol_destino is null then
    return 'no_encontrado';
  end if;

  if v_rol_destino = 'admin' then
    select count(*) into v_otros_admins
    from public.company_members
    where company_id = p_company and rol = 'admin' and user_id <> p_user;
    if v_otros_admins = 0 then
      return 'ultimo_admin';
    end if;
  end if;

  delete from public.company_members
    where company_id = p_company and user_id = p_user;
  return 'ok';
end;
$$;
