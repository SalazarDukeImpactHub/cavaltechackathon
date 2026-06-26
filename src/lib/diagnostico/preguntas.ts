/**
 * Fuente de verdad del cuestionario de autodiagnóstico (Ley 1581 — fase de diseño).
 * Los pesos y la jerarquía vienen del Reto CAVALTEC y NO cambian: viven en código,
 * no en la base de datos. Una pregunta = un peso = una regla.
 */

export type Respuesta = "si" | "no" | "na";

export type CodigoBloque = "politica_datos" | "privacidad_diseno" | "gobernanza";

export interface Bloque {
  codigo: CodigoBloque;
  titulo: string;
  descripcion: string;
  pesoMaximo: number; // suma de los pesos de sus preguntas
}

export interface Pregunta {
  codigo: string;
  numero: number;
  bloque: CodigoBloque;
  texto: string;
  /** Aporte al porcentaje total cuando la respuesta es "si". */
  peso: number;
  /** Código de la pregunta padre. Si el padre no fue "si", esta pregunta vale 0. */
  padre?: string;
  /** Una pregunta gate habilita a sus hijas; si es "no" es una brecha crítica aunque pese 0. */
  gate?: boolean;
  /** false = complementaria/informativa: no suma al total (P11). */
  cuentaAlTotal: boolean;
}

export const BLOQUES: readonly Bloque[] = [
  {
    codigo: "politica_datos",
    titulo: "Política de datos personales",
    descripcion: "Documentación, publicación y contenido de la política de tratamiento.",
    pesoMaximo: 40,
  },
  {
    codigo: "privacidad_diseno",
    titulo: "Privacidad desde el diseño",
    descripcion: "Evaluaciones de impacto y minimización de datos por defecto.",
    pesoMaximo: 36,
  },
  {
    codigo: "gobernanza",
    titulo: "Gobernanza",
    descripcion: "Administración de riesgos y oficial de protección de datos.",
    pesoMaximo: 24,
  },
] as const;

export const PREGUNTAS: readonly Pregunta[] = [
  // Bloque 1 — Política de datos personales (máx 40%)
  {
    codigo: "P1",
    numero: 1,
    bloque: "politica_datos",
    texto: "¿Cuenta con una política de tratamiento de datos personales?",
    peso: 0, // gate: hereda el peso de las hijas 2–5
    gate: true,
    cuentaAlTotal: true,
  },
  {
    codigo: "P2",
    numero: 2,
    bloque: "politica_datos",
    texto: "¿La política está documentada y publicada en un medio de fácil acceso?",
    peso: 10,
    padre: "P1",
    cuentaAlTotal: true,
  },
  {
    codigo: "P3",
    numero: 3,
    bloque: "politica_datos",
    texto: "¿Define las finalidades del tratamiento de datos?",
    peso: 10,
    padre: "P1",
    cuentaAlTotal: true,
  },
  {
    codigo: "P4",
    numero: 4,
    bloque: "politica_datos",
    texto: "¿Incluye los derechos de los titulares?",
    peso: 10,
    padre: "P1",
    cuentaAlTotal: true,
  },
  {
    codigo: "P5",
    numero: 5,
    bloque: "politica_datos",
    texto: "¿Menciona cómo ejercer los derechos de los titulares?",
    peso: 10,
    padre: "P1",
    cuentaAlTotal: true,
  },

  // Bloque 2 — Privacidad desde el diseño (máx 36%)
  {
    codigo: "P6",
    numero: 6,
    bloque: "privacidad_diseno",
    texto: "¿Incorpora evaluaciones de impacto (Privacy Impact Assessments)?",
    peso: 12,
    cuentaAlTotal: true,
  },
  {
    codigo: "P7",
    numero: 7,
    bloque: "privacidad_diseno",
    texto: "¿Aplica técnicas de minimización de datos?",
    peso: 12,
    cuentaAlTotal: true,
  },
  {
    codigo: "P8",
    numero: 8,
    bloque: "privacidad_diseno",
    texto: "¿Configura sus sistemas para recopilar el mínimo de datos por defecto?",
    peso: 12,
    cuentaAlTotal: true,
  },

  // Bloque 3 — Gobernanza (máx 24%)
  {
    codigo: "P9",
    numero: 9,
    bloque: "gobernanza",
    texto: "¿Cuenta con un sistema de administración de riesgos?",
    peso: 16,
    cuentaAlTotal: true,
  },
  {
    codigo: "P10",
    numero: 10,
    bloque: "gobernanza",
    texto: "¿Cuenta con un oficial de protección de datos personales?",
    peso: 8,
    gate: true,
    cuentaAlTotal: true,
  },
  {
    codigo: "P11",
    numero: 11,
    bloque: "gobernanza",
    texto: "¿Está designado formalmente?",
    peso: 0, // complementaria: no suma al total
    padre: "P10",
    cuentaAlTotal: false,
  },
] as const;

/** Acceso rápido por código. */
export const PREGUNTA_POR_CODIGO: Readonly<Record<string, Pregunta>> = Object.fromEntries(
  PREGUNTAS.map((p) => [p.codigo, p]),
);
