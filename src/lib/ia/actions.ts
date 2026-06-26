"use server";

import Anthropic from "@anthropic-ai/sdk";
import { PREGUNTA_POR_CODIGO } from "@/lib/diagnostico/preguntas";
import { recomendacionesPara } from "@/lib/diagnostico/recomendaciones";

const SIN_KEY =
  "La asistencia con IA todavía no está configurada (falta la API key). El diagnóstico funciona igual.";

function primerTexto(content: Anthropic.Messages.ContentBlock[]): string {
  const bloque = content.find((b): b is Anthropic.Messages.TextBlock => b.type === "text");
  return bloque?.text ?? "No se pudo generar la respuesta.";
}

/**
 * Traduce una pregunta legal a lenguaje simple (on-demand).
 * Modelo: Haiku 4.5 — rápido y económico, se invoca muchas veces.
 */
export async function explicarPregunta(codigo: string): Promise<string> {
  const pregunta = PREGUNTA_POR_CODIGO[codigo];
  if (!pregunta) return "Pregunta no encontrada.";
  if (!process.env.ANTHROPIC_API_KEY) return SIN_KEY;

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "Sos un experto en la Ley 1581 de 2012 de Colombia (protección de datos personales). " +
        "Explicás conceptos legales en lenguaje claro y simple para responsables de pymes, sin jerga. " +
        "Respondés en español neutro, en 2 o 3 oraciones cortas, enfocándote en qué significa y por qué importa.",
      messages: [
        {
          role: "user",
          content: `Explicá en lenguaje sencillo esta pregunta de un autodiagnóstico de cumplimiento:\n\n"${pregunta.texto}"`,
        },
      ],
    });
    return primerTexto(res.content);
  } catch {
    return "No pudimos generar la explicación en este momento.";
  }
}

/**
 * Interpreta el resultado y arma un plan accionable, personalizado a las brechas.
 * Modelo: Sonnet 4.6 — más razonamiento, se invoca una vez por diagnóstico.
 */
export async function generarAnalisis(porcentaje: number, brechas: string[]): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return SIN_KEY;

  const recs = recomendacionesPara(brechas);
  const detalleBrechas =
    recs.length === 0
      ? "No se detectaron brechas."
      : recs.map((r) => `- [${r.prioridad}] ${r.accion}: ${r.detalle}`).join("\n");

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system:
        "Sos un consultor experto en protección de datos (Ley 1581 de Colombia). " +
        "Interpretás resultados de un autodiagnóstico y das un plan claro, priorizado y motivador para una pyme. " +
        "Español neutro, directo y accionable, sin jerga legal innecesaria.",
      messages: [
        {
          role: "user",
          content:
            `Una empresa obtuvo ${porcentaje}% de cumplimiento en la fase de diseño de la Ley 1581.\n\n` +
            `Brechas detectadas (ordenadas por prioridad):\n${detalleBrechas}\n\n` +
            "Escribí: (1) una interpretación breve del resultado en 2-3 oraciones, y " +
            "(2) los 3 primeros pasos concretos para esta semana. Usá viñetas para los pasos.",
        },
      ],
    });
    return primerTexto(res.content);
  } catch {
    return "No pudimos generar el análisis en este momento.";
  }
}
