"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  calcularCumplimiento,
  sanitizarRespuestas,
  type Respuestas,
  type ResultadoDiagnostico,
} from "@/lib/diagnostico/calcular";
import { validarNit, formatearNit } from "@/lib/nit/nit";

export interface EstadoFormulario {
  error?: string;
}

export interface EstadoMiembro {
  mensaje?: string;
  ok?: boolean;
}

const MENSAJE_RPC: Record<string, string> = {
  agregado: "Miembro agregado ✓",
  invitado: "Invitación enviada ✉️ — se unirá automáticamente al ingresar con ese email.",
  ok: "Cambio aplicado ✓",
  no_admin: "Solo un administrador puede realizar esta acción.",
  rol_invalido: "Rol inválido.",
  no_encontrado: "El miembro no se encontró.",
  ultimo_admin: "No se puede dejar la empresa sin administradores.",
};

/** Agrega un miembro a una empresa por email, con un rol. Solo admins (validado en la base). */
export async function agregarMiembro(
  _prev: EstadoMiembro,
  formData: FormData,
): Promise<EstadoMiembro> {
  const companyId = String(formData.get("companyId") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const rol = String(formData.get("rol") ?? "evaluador");

  if (!email.includes("@")) return { mensaje: "Ingrese un email válido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("agregar_miembro_por_email", {
    p_company: companyId,
    p_email: email,
    p_rol: rol,
  });

  if (error) return { mensaje: "No se pudo agregar el miembro." };

  const codigo = String(data);
  if (codigo === "agregado" || codigo === "invitado") {
    revalidatePath("/dashboard");
    return { ok: true, mensaje: MENSAJE_RPC[codigo] };
  }
  return { mensaje: MENSAJE_RPC[codigo] ?? "No se pudo agregar el miembro." };
}

/** Cambia el rol de un miembro existente. La RPC valida admin y bloquea "último admin". */
export async function cambiarRolMiembro(
  companyId: string,
  userId: string,
  rol: string,
): Promise<EstadoMiembro> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cambiar_rol_miembro", {
    p_company: companyId,
    p_user: userId,
    p_rol: rol,
  });
  if (error) return { mensaje: "No se pudo cambiar el rol." };
  const codigo = String(data);
  if (codigo === "ok") {
    revalidatePath("/dashboard");
    return { ok: true, mensaje: MENSAJE_RPC.ok };
  }
  return { mensaje: MENSAJE_RPC[codigo] ?? "No se pudo cambiar el rol." };
}

/** Remueve a un miembro de una empresa. La RPC valida admin y bloquea "último admin". */
export async function removerMiembro(
  companyId: string,
  userId: string,
): Promise<EstadoMiembro> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("remover_miembro", {
    p_company: companyId,
    p_user: userId,
  });
  if (error) return { mensaje: "No se pudo remover el miembro." };
  const codigo = String(data);
  if (codigo === "ok") {
    revalidatePath("/dashboard");
    return { ok: true, mensaje: "Miembro removido ✓" };
  }
  return { mensaje: MENSAJE_RPC[codigo] ?? "No se pudo remover el miembro." };
}

/** Cancela una invitación pendiente (RLS exige rol admin). */
export async function cancelarInvitacion(
  companyId: string,
  email: string,
): Promise<EstadoMiembro> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invitaciones")
    .delete()
    .eq("company_id", companyId)
    .eq("email", email.toLowerCase().trim());
  if (error) return { mensaje: "No se pudo cancelar la invitación." };
  revalidatePath("/dashboard");
  return { ok: true, mensaje: "Invitación cancelada ✓" };
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

  if (nombre.length < 2) return { error: "Ingrese el nombre de la empresa." };
  if (nombre.length > 120) return { error: "El nombre es demasiado largo (máximo 120 caracteres)." };
  if (/[<>]/.test(nombre)) return { error: "El nombre contiene caracteres no permitidos." };

  const nit = validarNit(nitInput);
  if (!nit.valido) {
    return { error: "El NIT no es válido. Revise los dígitos y el dígito de verificación." };
  }
  if (sector && !SECTORES_VALIDOS.includes(sector)) return { error: "Sector inválido." };
  if (tamano && !TAMANOS_VALIDOS.includes(tamano)) return { error: "Tamaño inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Su sesión expiró. Vuelva a ingresar." };

  const { error } = await supabase.from("companies").insert({
    nombre,
    nit: formatearNit(nit.base),
    sector: sector || null,
    tamano: tamano || null,
    creado_por: user.id,
  });

  if (error) {
    console.error("crearEmpresa:", error.message); // detalle solo en servidor
    return { error: "No pudimos crear la empresa. Intente de nuevo." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export interface EvaluacionGuardada {
  id: string;
  resultado: ResultadoDiagnostico;
}

/** Calcula el cumplimiento EN EL SERVIDOR y persiste la evaluación + respuestas. */
export async function guardarEvaluacion(
  companyId: string,
  respuestas: Respuestas,
): Promise<EvaluacionGuardada> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión no válida.");

  // Defensa en profundidad sobre RLS: verificar membresía + rol en el código.
  const { data: membership } = await supabase
    .from("company_members")
    .select("rol")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership || membership.rol === "auditor") {
    throw new Error("No autorizado para esta empresa.");
  }

  // Sólo respuestas legítimas (códigos conocidos + valores si/no/na) se calculan y persisten.
  const limpias = sanitizarRespuestas(respuestas);
  const resultado = calcularCumplimiento(limpias);

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

  const filas = Object.entries(limpias)
    .filter(([, v]) => v)
    .map(([codigo, respuesta]) => ({
      evaluation_id: evaluacion.id,
      pregunta_codigo: codigo,
      respuesta: respuesta as string,
    }));

  if (filas.length) {
    const { error: errAns } = await supabase.from("answers").insert(filas);
    if (errAns) console.error("guardarEvaluacion answers:", errAns.message);
  }

  revalidatePath("/dashboard");
  return { id: evaluacion.id as string, resultado };
}
