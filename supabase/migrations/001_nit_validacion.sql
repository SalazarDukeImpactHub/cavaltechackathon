-- ============================================================
-- CAVALTEC — Validación de NIT (DIAN, Módulo 11) a nivel de base.
-- Pegar en: Supabase Dashboard → SQL Editor → Run.
-- La base RECHAZA cualquier NIT cuyo dígito de verificación no cuadre.
-- ============================================================

-- Calcula el dígito de verificación de una base numérica (Módulo 11).
create or replace function public.nit_dv(base text)
returns int
language plpgsql
immutable
as $$
declare
  factores int[] := array[3,7,13,17,19,23,29,37,41,43,47,53,59,67,71];
  suma int := 0;
  len  int := length(base);
  i    int;
  residuo int;
begin
  for i in 1..len loop
    -- posición i contada desde la derecha (i=1 => último dígito)
    suma := suma + (substr(base, len - i + 1, 1))::int * factores[i];
  end loop;
  residuo := suma % 11;
  if residuo < 2 then
    return residuo;
  else
    return 11 - residuo;
  end if;
end;
$$;

-- Valida un NIT completo en formato canónico "XXXXXXXXX-Y" (sin puntos ni espacios).
create or replace function public.nit_valido(nit text)
returns boolean
language plpgsql
immutable
as $$
declare
  base text;
  dv   int;
begin
  if nit is null or nit !~ '^[0-9]{6,15}-[0-9]$' then
    return false;
  end if;
  base := split_part(nit, '-', 1);
  dv   := split_part(nit, '-', 2)::int;
  return public.nit_dv(base) = dv;
end;
$$;

-- Restringe la columna: si hay NIT, debe ser válido. (Nullable para borradores.)
alter table public.companies
  drop constraint if exists nit_formato_valido;

alter table public.companies
  add constraint nit_formato_valido
  check (nit is null or public.nit_valido(nit));

-- Prueba rápida (deberían devolver 4 y true):
-- select public.nit_dv('800197268');         -- 4
-- select public.nit_valido('800197268-4');   -- true
-- select public.nit_valido('800197268-9');   -- false
