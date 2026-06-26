/**
 * Base de conocimiento de recomendaciones (Ley 1581 — fase de diseño).
 * Una recomendación experta por cada posible brecha, con nivel de prioridad.
 * Línea base DETERMINISTA: la IA del Nivel 3 la enriquece, pero el producto
 * da valor real aunque la IA no esté disponible.
 */

import { PREGUNTA_POR_CODIGO } from "./preguntas";

export type Prioridad = "critico" | "importante" | "recomendado";

export interface Recomendacion {
  codigo: string;
  prioridad: Prioridad;
  /** Acción concreta, en imperativo. */
  accion: string;
  /** Por qué importa y cómo encararlo, en lenguaje claro. */
  detalle: string;
}

const ORDEN_PRIORIDAD: Record<Prioridad, number> = {
  critico: 0,
  importante: 1,
  recomendado: 2,
};

type Base = Omit<Recomendacion, "codigo">;

const BASE: Readonly<Record<string, Base>> = {
  P1: {
    prioridad: "critico",
    accion: "Redactá y publicá una Política de Tratamiento de Datos Personales",
    detalle:
      "Es la base de todo cumplimiento. La Ley 1581 exige una política formal que regule cómo recolectás, usás y protegés los datos personales. Sin ella, el bloque entero queda en cero.",
  },
  P2: {
    prioridad: "importante",
    accion: "Documentá y publicá la política en un medio de fácil acceso",
    detalle:
      "No alcanza con tenerla: los titulares deben poder consultarla. Publicala en tu sitio web y en puntos de atención visibles.",
  },
  P3: {
    prioridad: "importante",
    accion: "Definí explícitamente las finalidades del tratamiento",
    detalle:
      "Aclará para qué usás cada dato. La Ley exige finalidades determinadas y legítimas: no podés recolectar datos 'por si acaso'.",
  },
  P4: {
    prioridad: "importante",
    accion: "Incluí los derechos de los titulares en la política",
    detalle:
      "Los titulares tienen derecho a conocer, actualizar, rectificar y suprimir sus datos, y a revocar la autorización. La política debe enumerarlos.",
  },
  P5: {
    prioridad: "importante",
    accion: "Explicá cómo ejercer los derechos (Habeas Data)",
    detalle:
      "Indicá el canal, el responsable y el procedimiento para que un titular pueda ejercer sus derechos. Sin un mecanismo claro, el derecho es letra muerta.",
  },
  P6: {
    prioridad: "importante",
    accion: "Realizá evaluaciones de impacto de privacidad (PIA/EIPD)",
    detalle:
      "Antes de lanzar un nuevo producto o proceso que trate datos, evaluá y documentá los riesgos de privacidad. Es el corazón de Privacy by Design.",
  },
  P7: {
    prioridad: "importante",
    accion: "Aplicá técnicas de minimización de datos",
    detalle:
      "Recolectá únicamente los datos necesarios para la finalidad declarada. Menos datos = menos riesgo y menos superficie de exposición.",
  },
  P8: {
    prioridad: "recomendado",
    accion: "Configurá privacidad por defecto en tus sistemas",
    detalle:
      "Que la opción más protectora sea la predeterminada: campos opcionales realmente opcionales, mínima retención y accesos restringidos de fábrica.",
  },
  P9: {
    prioridad: "critico",
    accion: "Implementá un sistema de administración de riesgos",
    detalle:
      "Identificá, evaluá y mitigá los riesgos sobre los datos personales de forma sistemática y documentada, no reactiva. Es el control de mayor peso del diagnóstico.",
  },
  P10: {
    prioridad: "importante",
    accion: "Designá un oficial de protección de datos",
    detalle:
      "Asigná un responsable que vele por el cumplimiento, atienda a los titulares y sea el punto de contacto ante la autoridad (SIC).",
  },
  P11: {
    prioridad: "recomendado",
    accion: "Formalizá por escrito la designación del oficial",
    detalle:
      "Que la responsabilidad quede documentada y comunicada internamente mediante acto administrativo, no de palabra. Refuerza la gobernanza ante una auditoría.",
  },
};

export const PRIORIDAD_META: Record<Prioridad, { etiqueta: string; color: string }> = {
  critico: { etiqueta: "Crítico", color: "var(--nivel-bajo)" },
  importante: { etiqueta: "Importante", color: "var(--nivel-medio)" },
  recomendado: { etiqueta: "Recomendado", color: "var(--nivel-alto)" },
};

/** Recomendaciones para las brechas dadas, ordenadas por prioridad y luego por impacto. */
export function recomendacionesPara(brechas: string[]): Recomendacion[] {
  return brechas
    .filter((codigo) => BASE[codigo])
    .map((codigo) => ({ codigo, ...BASE[codigo] }))
    .sort((a, b) => {
      const dp = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
      if (dp !== 0) return dp;
      return (PREGUNTA_POR_CODIGO[b.codigo]?.peso ?? 0) - (PREGUNTA_POR_CODIGO[a.codigo]?.peso ?? 0);
    });
}
