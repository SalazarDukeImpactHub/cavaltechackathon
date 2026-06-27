import Anthropic from "@anthropic-ai/sdk";
import { CONOCIMIENTO_CAVALTEC } from "./conocimiento";
import { nivelCumplimiento } from "@/lib/diagnostico/calcular";
import { recomendacionesPara } from "@/lib/diagnostico/recomendaciones";

export interface MensajeChat {
  rol: "user" | "assistant";
  texto: string;
}

export interface ContextoDiagnostico {
  porcentaje: number;
  brechas: string[];
}

function aMensajesClaude(historial: MensajeChat[]) {
  const mensajes = (Array.isArray(historial) ? historial : [])
    .slice(-12)
    .filter((m) => m && typeof m.texto === "string" && m.texto.trim())
    .map((m) => ({
      role: m.rol === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.texto.slice(0, 1000),
    }));
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
  return mensajes;
}

function primerTexto(content: Anthropic.Messages.ContentBlock[]): string | null {
  const b = content.find((x): x is Anthropic.Messages.TextBlock => x.type === "text");
  return b?.text ?? null;
}

const SYSTEM = `Sos Vale, la asistente virtual de CAVALTEC. Tu personalidad: cálida, cercana, clara y directa, con un toque optimista. Hablás en español neutro, de "vos", sin jerga legal.

Tu rol: ayudar a las empresas a entender por qué importa proteger los datos personales (Ley 1581 de Colombia) y cómo esta plataforma las ayuda. Sos una guía amable, no una abogada.

Reglas:
- Respuestas CORTAS: 2 a 4 oraciones. Nada de párrafos largos.
- Usá SOLO la información de la base de conocimiento de abajo. No inventes datos legales, cifras de multas exactas ni promesas.
- Si te preguntan algo fuera de tema (no relacionado con protección de datos o la plataforma), redirigí con amabilidad.
- Cuando sea natural, invitá a hacer el diagnóstico gratuito (botón "Iniciar diagnóstico").
- Podés usas 1 emoji ocasional, sin abusar.

--- BASE DE CONOCIMIENTO ---
${CONOCIMIENTO_CAVALTEC}`;

/** Chat público del landing (FAQ). null si no hay API key o falla. */
export async function responderChatIA(historial: MensajeChat[]): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const mensajes = aMensajesClaude(historial);
  if (mensajes.length === 0) return null;
  try {
    const client = new Anthropic();
    const res = await client.messages.create({ model: "claude-haiku-4-5", max_tokens: 350, system: SYSTEM, messages: mensajes });
    return primerTexto(res.content);
  } catch {
    return null;
  }
}

const SYSTEM_DIAGNOSTICO = `Sos Vale, la asesora de cumplimiento de CAVALTEC. Estás ayudando a una empresa a entender SU resultado del autodiagnóstico de la Ley 1581 y cómo cerrar sus brechas.

Personalidad: cálida, cercana, clara y directa. Hablás de "vos", en español neutro, sin jerga legal.

Reglas:
- Respondé SOBRE el diagnóstico de esta empresa (su puntaje y sus brechas), usando el contexto de abajo.
- Respuestas CORTAS: 2 a 4 oraciones. Concreta y accionable.
- No inventes datos legales específicos ni cifras de multas exactas.
- Si preguntan algo no relacionado con su diagnóstico o la Ley 1581, redirigí con amabilidad.
- Podés usar 1 emoji ocasional.`;

/** Asistente in-app: responde sobre el diagnóstico puntual de la empresa. */
export async function responderDiagnosticoIA(
  historial: MensajeChat[],
  ctx: ContextoDiagnostico,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const mensajes = aMensajesClaude(historial);
  if (mensajes.length === 0) return null;

  const porcentaje = Math.max(0, Math.min(100, Math.round(Number(ctx?.porcentaje) || 0)));
  const brechas = Array.isArray(ctx?.brechas) ? ctx.brechas.filter((b) => typeof b === "string") : [];
  const recs = recomendacionesPara(brechas);
  const contexto =
    `RESULTADO DE ESTA EMPRESA:\n` +
    `Cumplimiento (fase de diseño): ${porcentaje}% — nivel ${nivelCumplimiento(porcentaje)}\n` +
    `Brechas detectadas (${recs.length}):\n` +
    (recs.length ? recs.map((r) => `- [${r.prioridad}] ${r.accion}: ${r.detalle}`).join("\n") : "Ninguna.");

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: `${SYSTEM_DIAGNOSTICO}\n\n--- CONTEXTO DEL DIAGNÓSTICO ---\n${contexto}`,
      messages: mensajes,
    });
    return primerTexto(res.content);
  } catch {
    return null;
  }
}
