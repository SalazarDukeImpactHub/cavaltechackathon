/**
 * Validación de NIT colombiano (DIAN) — lógica pura.
 * El dígito de verificación (DV) se calcula por Módulo 11.
 * Referencia: documentación técnica DIAN provista por el cliente.
 */

// Factores de ponderación oficiales, asignados de DERECHA a IZQUIERDA.
const FACTORES = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/** Quita puntos, espacios y guiones de DV mal puestos; deja solo lo numérico + guion separador. */
export function normalizarNit(entrada: string): string {
  return entrada.replace(/[.\s]/g, "").trim();
}

/** Calcula el dígito de verificación de una base numérica (sólo dígitos). */
export function calcularDigitoVerificacion(base: string): number {
  const digitos = base.split("").reverse(); // el último dígito base es la posición 1
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    suma += Number(digitos[i]) * FACTORES[i];
  }
  const residuo = suma % 11;
  return residuo < 2 ? residuo : 11 - residuo;
}

export interface NitParseado {
  base: string; // dígitos base, sin DV
  dv: number | null; // dígito de verificación informado
  valido: boolean; // sintaxis OK + DV coincide con Módulo 11
}

/**
 * Valida un NIT completo. Acepta "800197268-4" o "8001972684".
 * Reglas: sólo dígitos en la base, longitud 6–15, y el DV debe coincidir.
 */
export function validarNit(entrada: string): NitParseado {
  const limpio = normalizarNit(entrada);

  let base: string;
  let dvInformado: number | null;

  if (limpio.includes("-")) {
    const [b, d] = limpio.split("-");
    base = b;
    dvInformado = /^\d$/.test(d ?? "") ? Number(d) : null;
  } else if (/^\d+$/.test(limpio) && limpio.length >= 2) {
    // Sin guion: el último dígito se interpreta como DV.
    base = limpio.slice(0, -1);
    dvInformado = Number(limpio.slice(-1));
  } else {
    base = limpio;
    dvInformado = null;
  }

  const sintaxisOk =
    /^\d+$/.test(base) &&
    base.length >= 6 &&
    base.length <= 15 &&
    dvInformado !== null;

  const valido = sintaxisOk && calcularDigitoVerificacion(base) === dvInformado;

  return { base, dv: dvInformado, valido };
}

/** Formato canónico para guardar/mostrar: base-DV (sin puntos ni espacios). */
export function formatearNit(base: string): string {
  return `${base}-${calcularDigitoVerificacion(base)}`;
}
