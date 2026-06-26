"use server";

import { calcularCumplimiento, type ResultadoDiagnostico, type Respuestas } from "@/lib/diagnostico/calcular";

/**
 * Evalúa las respuestas EN EL SERVIDOR. El cliente envía respuestas crudas;
 * el puntaje se calcula acá y nunca se confía al navegador.
 */
export async function evaluarDiagnostico(respuestas: Respuestas): Promise<ResultadoDiagnostico> {
  return calcularCumplimiento(respuestas);
}
