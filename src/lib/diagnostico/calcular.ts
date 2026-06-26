/**
 * Motor de diagnóstico — lógica PURA (sin DB, sin red, sin UI).
 * Entra: respuestas crudas. Sale: porcentaje de cumplimiento + brechas.
 *
 * Esta función corre SIEMPRE en el servidor. El cliente manda respuestas,
 * nunca el puntaje: así nadie puede falsear su cumplimiento desde la consola.
 */

import { PREGUNTAS, type CodigoBloque, type Respuesta } from "./preguntas";

export type Respuestas = Record<string, Respuesta | undefined>;

export interface ResultadoDiagnostico {
  /** Cumplimiento total 0–100. */
  porcentaje: number;
  /** Aporte logrado por bloque. */
  porBloque: Record<CodigoBloque, number>;
  /** Códigos de preguntas falladas (alimentan las recomendaciones de IA). */
  brechas: string[];
}

export function calcularCumplimiento(respuestas: Respuestas): ResultadoDiagnostico {
  let porcentaje = 0;
  const brechas: string[] = [];
  const porBloque: Record<CodigoBloque, number> = {
    politica_datos: 0,
    privacidad_diseno: 0,
    gobernanza: 0,
  };

  for (const pregunta of PREGUNTAS) {
    // Las complementarias (P11) no suman ni cuentan como brecha.
    if (!pregunta.cuentaAlTotal) continue;

    // Lógica condicional: si el padre no fue "si", la hija vale 0.
    // El padre ya es la brecha; la hija queda fuera de juego.
    if (pregunta.padre && respuestas[pregunta.padre] !== "si") continue;

    const respuesta = respuestas[pregunta.codigo];

    if (respuesta === "si") {
      porcentaje += pregunta.peso;
      porBloque[pregunta.bloque] += pregunta.peso;
    } else if (pregunta.peso > 0 || pregunta.gate) {
      // "no", "na" o sin responder en una pregunta que aporta o que es gate.
      brechas.push(pregunta.codigo);
    }
  }

  return { porcentaje, porBloque, brechas };
}

/** Nivel cualitativo para el gauge/velocímetro. */
export function nivelCumplimiento(porcentaje: number): "bajo" | "medio" | "alto" {
  if (porcentaje < 40) return "bajo";
  if (porcentaje < 75) return "medio";
  return "alto";
}

const VALORES_VALIDOS: readonly string[] = ["si", "no", "na"];

/**
 * Filtra respuestas a SÓLO códigos de pregunta conocidos (P1..P11) con valores
 * válidos. Defensa en profundidad: nada que no sea legítimo se calcula ni persiste.
 */
export function sanitizarRespuestas(input: Record<string, unknown> | null | undefined): Respuestas {
  const limpio: Respuestas = {};
  if (!input || typeof input !== "object") return limpio;
  for (const p of PREGUNTAS) {
    const v = (input as Record<string, unknown>)[p.codigo];
    if (typeof v === "string" && VALORES_VALIDOS.includes(v)) {
      limpio[p.codigo] = v as Respuesta;
    }
  }
  return limpio;
}
