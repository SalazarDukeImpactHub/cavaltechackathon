import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { calcularCumplimiento, type Respuestas } from "@/lib/diagnostico/calcular";
import { generarAnalisisIA } from "@/lib/ia/analisis";
import { ReporteDoc } from "@/lib/reporte/ReporteDoc";
import { createClient } from "@/lib/supabase/server";
import { permitido } from "@/lib/seguridad/rate-limit";

// @react-pdf necesita APIs de Node.
export const runtime = "nodejs";

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
  const respuestas = (body?.respuestas ?? {}) as Respuestas;
  const empresa = typeof body?.empresa === "string" ? body.empresa : null;

  // El score se recalcula EN EL SERVIDOR — no confiamos en el cliente.
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
