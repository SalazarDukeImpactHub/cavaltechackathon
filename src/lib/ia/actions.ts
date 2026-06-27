"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { permitido } from "@/lib/seguridad/rate-limit";
import { explicarPreguntaIA, generarAnalisisIA } from "./analisis";
import type { ContextoEmpresa } from "@/lib/diagnostico/recomendaciones";
import {
  responderChatIA,
  responderDiagnosticoIA,
  type MensajeChat,
  type ContextoDiagnostico,
} from "./chat";

const SIN_IA = "La asistencia con IA todavía no está disponible. El diagnóstico funciona igual.";
const SIN_SESION = "Necesita iniciar sesión para usar la asistencia con IA.";
const DEMASIADO = "Demasiadas solicitudes. Espere un momento e intente de nuevo.";

async function usuarioId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function explicarPregunta(codigo: string): Promise<string> {
  const uid = await usuarioId();
  if (!uid) return SIN_SESION;
  if (!permitido(`ia:explica:${uid}`, 20, 60_000)) return DEMASIADO;
  return (await explicarPreguntaIA(codigo)) ?? SIN_IA;
}

export async function generarAnalisis(
  porcentaje: number,
  brechas: string[],
  contexto?: ContextoEmpresa,
): Promise<string> {
  const uid = await usuarioId();
  if (!uid) return SIN_SESION;
  if (!permitido(`ia:analisis:${uid}`, 5, 60_000)) return DEMASIADO;
  return (await generarAnalisisIA(porcentaje, brechas, contexto)) ?? SIN_IA;
}

/** Chat público de Vale (landing). Sin login → rate limit por IP. */
export async function responderChat(historial: MensajeChat[]): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
  if (!permitido(`chat:${ip}`, 20, 10 * 60_000)) {
    return "Va muy rápido 😅 Espere un momentito y seguimos.";
  }
  return (
    (await responderChatIA(historial)) ??
    "Por ahora no puedo responder. Puede empezar su diagnóstico gratuito con el botón “Iniciar diagnóstico”."
  );
}

/** Asistente in-app sobre el diagnóstico. Autenticado + rate limit por usuario. */
export async function responderDiagnostico(
  historial: MensajeChat[],
  ctx: ContextoDiagnostico,
): Promise<string> {
  const uid = await usuarioId();
  if (!uid) return SIN_SESION;
  if (!permitido(`diag:${uid}`, 25, 10 * 60_000)) return DEMASIADO;
  return (await responderDiagnosticoIA(historial, ctx)) ?? SIN_IA;
}
