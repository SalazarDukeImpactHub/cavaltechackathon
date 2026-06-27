import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { calcularCumplimiento, type Respuestas } from "@/lib/diagnostico/calcular";
import { type Respuesta } from "@/lib/diagnostico/preguntas";
import { generarAnalisisIA } from "@/lib/ia/analisis";
import { ReporteDoc } from "@/lib/reporte/ReporteDoc";
import { createClient } from "@/lib/supabase/server";
import { permitido } from "@/lib/seguridad/rate-limit";

// @react-pdf necesita APIs de Node.
export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  // Requiere sesión: este endpoint genera un análisis con IA (operación paga).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("No autorizado", { status: 401 });
  }
  if (!permitido(`reporte:${user.id}`, 5, 60_000)) {
    return new Response("Demasiadas solicitudes", { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const evaluationId = typeof body?.evaluationId === "string" ? body.evaluationId : "";
  if (!UUID_REGEX.test(evaluationId)) {
    return new Response("Parámetros inválidos", { status: 400 });
  }

  // Defensa en profundidad: leemos la evaluación CON LAS COOKIES DEL USUARIO.
  // RLS filtra automáticamente — si el user no es miembro de la empresa
  // dueña de la evaluación, la query devuelve null y rechazamos el request.
  // No confiamos en ningún dato que venga del cliente más allá del id.
  const { data: evaluacion } = await supabase
    .from("evaluations")
    .select("id, company_id")
    .eq("id", evaluationId)
    .maybeSingle();
  if (!evaluacion) {
    return new Response("No autorizado", { status: 403 });
  }

  const { data: companyRow } = await supabase
    .from("companies")
    .select("nombre")
    .eq("id", evaluacion.company_id)
    .maybeSingle();
  const empresa = (companyRow?.nombre as string | undefined) ?? null;

  const { data: answerRows } = await supabase
    .from("answers")
    .select("pregunta_codigo, respuesta")
    .eq("evaluation_id", evaluationId);

  const respuestas: Respuestas = Object.fromEntries(
    (answerRows ?? []).map((a) => [a.pregunta_codigo as string, a.respuesta as Respuesta]),
  );

  // El score se recalcula EN EL SERVIDOR a partir de respuestas leídas de la DB.
  const resultado = calcularCumplimiento(respuestas);
  const fecha = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Análisis con IA incluido en el PDF (null si no hay API key → se omite la sección).
  const analisis = await generarAnalisisIA(resultado.porcentaje, resultado.brechas);

  const elemento = React.createElement(ReporteDoc, {
    resultado,
    empresa,
    fecha,
    analisis,
  }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(elemento);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reporte-cavaltec.pdf"',
    },
  });
}
