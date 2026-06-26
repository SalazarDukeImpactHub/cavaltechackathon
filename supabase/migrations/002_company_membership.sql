-- ============================================================
-- CAVALTEC — Al crear una empresa, su creador queda como admin.
-- Resuelve el chicken-and-egg de RLS: sin esto, el INSERT ... RETURNING
-- no devuelve la fila porque la membresía aún no existe.
-- Pegar en: Supabase Dashboard → SQL Editor → Run.
-- ============================================================

create or replace function public.handle_new_company()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_members (company_id, user_id, rol)
  values (new.id, new.creado_por, 'admin')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_company_created on public.companies;
create trigger on_company_created
  after insert on public.companies
  for each row execute function public.handle_new_company();
