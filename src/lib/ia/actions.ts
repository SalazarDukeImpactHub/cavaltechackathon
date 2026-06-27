"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { permitido } from "@/lib/seguridad/rate-limit";
import { explicarPreguntaIA, generarAnalisisIA } from "./analisis";
import { responderChatIA, type MensajeChat } from "./chat";

const SIN_IA = "La asistencia con IA todavía no está disponible. El diagnóstico funciona igual.";
const SIN_SESION = "Necesitás iniciar sesión para usar la asistencia con IA.";
const DEMASIADO = "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.";

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

export async function generarAnalisis(porcentaje: number, brechas: string[]): Promise<string> {
  const uid = await usuarioId();
  if (!uid) return SIN_SESION;
  if (!permitido(`ia:analisis:${uid}`, 5, 60_000)) return DEMASIADO;
  return (await generarAnalisisIA(porcentaje, brechas)) ?? SIN_IA;
}

/** Chat público de Vale (landing). Sin login → rate limit por IP. */
export async function responderChat(historial: MensajeChat[]): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
  if (!permitido(`chat:${ip}`, 20, 10 * 60_000)) {
    return "Vas muy rápido 😅 Esperá un momentito y seguimos.";
  }
  return (
    (await responderChatIA(historial)) ??
    "Por ahora no puedo responder. Podés empezar tu diagnóstico gratuito con el botón “Iniciar diagnóstico”."
  );
}
