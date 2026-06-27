import Anthropic from "@anthropic-ai/sdk";
import { PREGUNTA_POR_CODIGO } from "@/lib/diagnostico/preguntas";
import { recomendacionesPara, type ContextoEmpresa } from "@/lib/diagnostico/recomendaciones";

const TAMANO_LABEL: Record<string, string> = {
  micro: "microempresa (1-10 personas)",
  pequena: "pequeña empresa (11-50 personas)",
  mediana: "mediana empresa (51-200 personas)",
  grande: "empresa grande (más de 200 personas)",
};

function describirPerfil(contexto?: ContextoEmpresa): string {
  if (!contexto) return "";
  const partes: string[] = [];
  if (contexto.sector) partes.push(`sector ${contexto.sector}`);
  if (contexto.tamano && TAMANO_LABEL[contexto.tamano]) partes.push(TAMANO_LABEL[contexto.tamano]);
  return partes.length ? `Perfil de la empresa: ${partes.join(", ")}.` : "";
}

/**
 * Lógica de IA en módulo neutral (sin "use server") — usable desde server actions
 * Y desde route handlers (la generación del PDF). Devuelve null si no hay API key
 * o si la llamada falla, para que quien consuma decida qué mostrar.
 */

function primerTexto(content: Anthropic.Messages.ContentBlock[]): string | null {
  const bloque = content.find((b): b is Anthropic.Messages.TextBlock => b.type === "text");
  return bloque?.text ?? null;
}

/** Traduce una pregunta legal a lenguaje simple. Haiku — rápido y económico. */
export async function explicarPreguntaIA(codigo: string): Promise<string | null> {
  const pregunta = PREGUNTA_POR_CODIGO[codigo];
  if (!pregunta || !process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "Eres un experto en la Ley 1581 de 2012 de Colombia (protección de datos personales). " +
        "Explicas conceptos legales en lenguaje claro y simple para responsables de pymes, sin jerga. " +
        "Respondes en español de Colombia, tratando al lector de usted, en 2 o 3 oraciones cortas, enfocándote en qué significa y por qué importa.",
      messages: [
        {
          role: "user",
          content: `Explica en lenguaje sencillo esta pregunta de un autodiagnóstico de cumplimiento:\n\n"${pregunta.texto}"`,
        },
      ],
    });
    return primerTexto(res.content);
  } catch {
    return null;
  }
}

/** Interpreta el resultado y arma un plan accionable. Sonnet — más razonamiento. */
export async function generarAnalisisIA(
  porcentaje: number,
  brechas: string[],
  contexto?: ContextoEmpresa,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const recs = recomendacionesPara(brechas, contexto);
  const detalleBrechas =
    recs.length === 0
      ? "No se detectaron brechas."
      : recs.map((r) => `- [${r.prioridad}] ${r.accion}: ${r.detalle}`).join("\n");
  const perfil = describirPerfil(contexto);

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system:
        "Eres un consultor experto en protección de datos (Ley 1581 de Colombia). " +
        "Interpretas resultados de un autodiagnóstico y das un plan claro, priorizado y motivador para una pyme. " +
        "Cuando recibes el perfil de la empresa (sector y tamaño), personalizas las recomendaciones " +
        "para ese contexto puntual: una microempresa de comercio no necesita lo mismo que una grande de salud. " +
        "Español de Colombia, tratando al lector de usted, directo y accionable, sin jerga legal innecesaria.",
      messages: [
        {
          role: "user",
          content:
            (perfil ? `${perfil}\n\n` : "") +
            `La empresa obtuvo ${porcentaje}% de cumplimiento en la fase de diseño de la Ley 1581.\n\n` +
            `Brechas detectadas (ordenadas por prioridad):\n${detalleBrechas}\n\n` +
            "Escribe: (1) una interpretación breve del resultado en 2-3 oraciones, " +
            (perfil ? "mencionando cómo el perfil de la empresa influye, y " : "y ") +
            "(2) los 3 primeros pasos concretos para esta semana, adaptados al perfil. Usa viñetas para los pasos.",
        },
      ],
    });
    return primerTexto(res.content);
  } catch {
    return null;
  }
}
