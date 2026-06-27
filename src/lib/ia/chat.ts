import Anthropic from "@anthropic-ai/sdk";
import { CONOCIMIENTO_CAVALTEC } from "./conocimiento";

export interface MensajeChat {
  rol: "user" | "assistant";
  texto: string;
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

/** Responde un turno de chat usando el FAQ como contexto. null si no hay API key o falla. */
export async function responderChatIA(historial: MensajeChat[]): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!Array.isArray(historial)) return null;

  // Últimos mensajes, con tope de largo por mensaje (anti-abuso).
  const mensajes = historial
    .slice(-12)
    .filter((m) => m && typeof m.texto === "string" && m.texto.trim())
    .map((m) => ({
      role: m.rol === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.texto.slice(0, 1000),
    }));

  // La conversación debe empezar con un mensaje del usuario.
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
  if (mensajes.length === 0) return null;

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 350,
      system: SYSTEM,
      messages: mensajes,
    });
    const bloque = res.content.find((b): b is Anthropic.Messages.TextBlock => b.type === "text");
    return bloque?.text ?? null;
  } catch {
    return null;
  }
}
