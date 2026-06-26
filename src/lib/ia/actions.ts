"use server";

import { explicarPreguntaIA, generarAnalisisIA } from "./analisis";

const SIN_IA =
  "La asistencia con IA todavía no está disponible. El diagnóstico funciona igual.";

export async function explicarPregunta(codigo: string): Promise<string> {
  return (await explicarPreguntaIA(codigo)) ?? SIN_IA;
}

export async function generarAnalisis(porcentaje: number, brechas: string[]): Promise<string> {
  return (await generarAnalisisIA(porcentaje, brechas)) ?? SIN_IA;
}
