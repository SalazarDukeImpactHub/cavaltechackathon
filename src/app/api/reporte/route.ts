import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { calcularCumplimiento, type Respuestas } from "@/lib/diagnostico/calcular";
import { ReporteDoc } from "@/lib/reporte/ReporteDoc";

// @react-pdf necesita APIs de Node.
export const runtime = "nodejs";

export async function POST(req: Request) {
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

  const elemento = React.createElement(ReporteDoc, {
    resultado,
    empresa,
    fecha,
  }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(elemento);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reporte-cavaltec.pdf"',
    },
  });
}
