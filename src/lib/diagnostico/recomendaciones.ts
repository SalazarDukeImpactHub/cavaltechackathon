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

/** Perfil de la empresa que personaliza recomendaciones y análisis IA. */
export interface ContextoEmpresa {
  sector?: string | null;
  tamano?: string | null;
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
    accion: "Redacte y publique una Política de Tratamiento de Datos Personales",
    detalle:
      "Es la base de todo cumplimiento. La Ley 1581 exige una política formal que regule cómo recolecta, usa y protege los datos personales. Sin ella, el bloque entero queda en cero.",
  },
  P2: {
    prioridad: "importante",
    accion: "Documente y publique la política en un medio de fácil acceso",
    detalle:
      "No alcanza con tenerla: los titulares deben poder consultarla. Publíquela en su sitio web y en puntos de atención visibles.",
  },
  P3: {
    prioridad: "importante",
    accion: "Defina explícitamente las finalidades del tratamiento",
    detalle:
      "Aclare para qué usa cada dato. La Ley exige finalidades determinadas y legítimas: no puede recolectar datos 'por si acaso'.",
  },
  P4: {
    prioridad: "importante",
    accion: "Incluya los derechos de los titulares en la política",
    detalle:
      "Los titulares tienen derecho a conocer, actualizar, rectificar y suprimir sus datos, y a revocar la autorización. La política debe enumerarlos.",
  },
  P5: {
    prioridad: "importante",
    accion: "Explique cómo ejercer los derechos (Habeas Data)",
    detalle:
      "Indique el canal, el responsable y el procedimiento para que un titular pueda ejercer sus derechos. Sin un mecanismo claro, el derecho es letra muerta.",
  },
  P6: {
    prioridad: "importante",
    accion: "Realice evaluaciones de impacto de privacidad (PIA/EIPD)",
    detalle:
      "Antes de lanzar un nuevo producto o proceso que trate datos, evalúe y documente los riesgos de privacidad. Es el corazón de Privacy by Design.",
  },
  P7: {
    prioridad: "importante",
    accion: "Aplique técnicas de minimización de datos",
    detalle:
      "Recolecte únicamente los datos necesarios para la finalidad declarada. Menos datos = menos riesgo y menos superficie de exposición.",
  },
  P8: {
    prioridad: "recomendado",
    accion: "Configure privacidad por defecto en sus sistemas",
    detalle:
      "Que la opción más protectora sea la predeterminada: campos opcionales realmente opcionales, mínima retención y accesos restringidos de fábrica.",
  },
  P9: {
    prioridad: "critico",
    accion: "Implemente un sistema de administración de riesgos",
    detalle:
      "Identifique, evalúe y mitigue los riesgos sobre los datos personales de forma sistemática y documentada, no reactiva. Es el control de mayor peso del diagnóstico.",
  },
  P10: {
    prioridad: "importante",
    accion: "Designe un oficial de protección de datos",
    detalle:
      "Asigne un responsable que vele por el cumplimiento, atienda a los titulares y sea el punto de contacto ante la autoridad (SIC).",
  },
  P11: {
    prioridad: "recomendado",
    accion: "Formalice por escrito la designación del oficial",
    detalle:
      "Que la responsabilidad quede documentada y comunicada internamente mediante acto administrativo, no de palabra. Refuerza la gobernanza ante una auditoría.",
  },
};

export const PRIORIDAD_META: Record<Prioridad, { etiqueta: string; color: string }> = {
  critico: { etiqueta: "Crítico", color: "var(--nivel-bajo)" },
  importante: { etiqueta: "Importante", color: "var(--nivel-medio)" },
  recomendado: { etiqueta: "Recomendado", color: "var(--nivel-alto)" },
};

/**
 * Notas por sector. Si la empresa pertenece a uno de estos sectores, se anexa
 * la nota al detalle de la recomendación correspondiente. Si el código no aplica,
 * la recomendación queda con su detalle base.
 */
const NOTAS_SECTOR: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  Salud: {
    P3: "En salud, distinga finalidades clínicas, administrativas y de investigación: cada una exige autorización separada.",
    P6: "Para historias clínicas y datos sensibles, la evaluación de impacto es obligatoria antes de lanzar cualquier sistema.",
    P7: "Minimice los datos clínicos a lo estrictamente necesario para la prestación del servicio.",
    P9: "El sector salud está bajo doble supervisión (SIC y MinSalud): la gestión de riesgos debe atender ambos marcos.",
  },
  Financiero: {
    P6: "En el sector financiero, la evaluación de impacto debe considerar la Circular 029 de la SFC sobre seguridad de la información.",
    P9: "Las entidades financieras tienen exigencias adicionales bajo SARO y de seguridad de la información (SFC).",
    P10: "Para el sector financiero, el oficial de datos debe coordinarse con el área de cumplimiento (SARLAFT/SARO).",
  },
  Educación: {
    P3: "En educación, separe finalidades académicas, administrativas y de bienestar estudiantil.",
    P4: "Recuerde el régimen reforzado para datos de niños y adolescentes (Decreto 1377, art. 12).",
    P7: "No solicite información de menores que no sea estrictamente necesaria para la prestación educativa.",
  },
  Comercio: {
    P7: "En comercio, evite pedir datos como cédula completa o dirección para compras simples sin justificación clara.",
    P8: "Configure casillas de marketing como desmarcadas por defecto: el consentimiento debe ser activo.",
  },
  Tecnología: {
    P3: "En tecnología, sea explícito con finalidades de analítica, perfilamiento y compartir datos con terceros.",
    P8: "Las plataformas digitales deben ofrecer ajustes de privacidad por defecto, especialmente para cookies de terceros.",
  },
};

/**
 * Notas por tamaño. La carga regulatoria se ajusta a la capacidad operativa
 * de la empresa: una microempresa no tiene un equipo dedicado, una grande sí.
 */
const NOTAS_TAMANO: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  micro: {
    P1: "Para una microempresa, una política breve (2-3 páginas) es suficiente: enfoque en claridad sobre extensión.",
    P10: "En microempresas, el rol de oficial puede ser asumido por el representante legal o un colaborador asignado.",
  },
  pequena: {
    P10: "En empresas pequeñas, asigne el rol de oficial a alguien del área administrativa o jurídica con dedicación parcial.",
  },
  mediana: {
    P9: "Para una empresa mediana, formalice el sistema de riesgos con matriz documentada y revisión semestral.",
    P10: "En medianas, el oficial debería tener dedicación parcial dedicada y reportar a la gerencia.",
  },
  grande: {
    P9: "Como empresa grande, el sistema de riesgos debe estar integrado con el ERM corporativo y auditarse anualmente.",
    P10: "En empresas grandes, el oficial debe ser un cargo dedicado, con equipo de apoyo y reporte directo a la alta dirección.",
    P11: "Para empresas grandes, formalice la designación por acto administrativo y comuníquela a todo el personal.",
  },
};

/** Recomendaciones para las brechas dadas, ordenadas por prioridad y luego por impacto. */
export function recomendacionesPara(
  brechas: string[],
  contexto?: ContextoEmpresa,
): Recomendacion[] {
  const notaSector = contexto?.sector ? NOTAS_SECTOR[contexto.sector] : undefined;
  const notaTamano = contexto?.tamano ? NOTAS_TAMANO[contexto.tamano] : undefined;

  return brechas
    .filter((codigo) => BASE[codigo])
    .map((codigo) => {
      const base = BASE[codigo];
      const extra = [notaSector?.[codigo], notaTamano?.[codigo]].filter(Boolean).join(" ");
      return {
        codigo,
        ...base,
        detalle: extra ? `${base.detalle} ${extra}` : base.detalle,
      };
    })
    .sort((a, b) => {
      const dp = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
      if (dp !== 0) return dp;
      return (PREGUNTA_POR_CODIGO[b.codigo]?.peso ?? 0) - (PREGUNTA_POR_CODIGO[a.codigo]?.peso ?? 0);
    });
}
