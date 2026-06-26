"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularCumplimiento, type Respuestas, type ResultadoDiagnostico } from "@/lib/diagnostico/calcular";
import { validarNit, formatearNit } from "@/lib/nit/nit";

export interface EstadoFormulario {
  error?: string;
}

const SECTORES_VALIDOS = ["Tecnología", "Salud", "Financiero", "Educación", "Comercio", "Servicios", "Industrial", "Otro"];
const TAMANOS_VALIDOS = ["micro", "pequena", "mediana", "grande"];

/** Crea una empresa (con su NIT validado por Módulo 11). El trigger crea la membresía. */
export async function crearEmpresa(
  _prev: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const nitInput = String(formData.get("nit") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const tamano = String(formData.get("tamano") ?? "").trim();

  if (nombre.length < 2) return { error: "Ingresá el nombre de la empresa." };

  const nit = validarNit(nitInput);
  if (!nit.valido) {
    return { error: "El NIT no es válido. Revisá los dígitos y el dígito de verificación." };
  }
  if (sector && !SECTORES_VALIDOS.includes(sector)) return { error: "Sector inválido." };
  if (tamano && !TAMANOS_VALIDOS.includes(tamano)) return { error: "Tamaño inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Volvé a ingresar." };

  const { error } = await supabase.from("companies").insert({
    nombre,
    nit: formatearNit(nit.base),
    sector: sector || null,
    tamano: tamano || null,
    creado_por: user.id,
  });

  if (error) return { error: "No pudimos crear la empresa: " + error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Calcula el cumplimiento EN EL SERVIDOR y persiste la evaluación + respuestas. */
export async function guardarEvaluacion(
  companyId: string,
  respuestas: Respuestas,
): Promise<ResultadoDiagnostico> {
  const resultado = calcularCumplimiento(respuestas);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión no válida.");

  const { data: evaluacion, error } = await supabase
    .from("evaluations")
    .insert({
      company_id: companyId,
      creado_por: user.id,
      estado: "completada",
      porcentaje: resultado.porcentaje,
    })
    .select("id")
    .single();

  if (error || !evaluacion) throw new Error("No se pudo guardar la evaluación.");

  const filas = Object.entries(respuestas)
    .filter(([, v]) => v)
    .map(([codigo, respuesta]) => ({
      evaluation_id: evaluacion.id,
      pregunta_codigo: codigo,
      respuesta: respuesta as string,
    }));

  if (filas.length) await supabase.from("answers").insert(filas);

  revalidatePath("/dashboard");
  return resultado;
}
