/**
 * Rate limiter simple en memoria (ventana deslizante).
 * Nota: en serverless el estado es por instancia (best-effort). El control real
 * de abuso es la autenticación; esto suma una capa contra ráfagas.
 */
const registros = new Map<string, number[]>();

export function permitido(clave: string, max: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const previos = (registros.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (previos.length >= max) {
    registros.set(clave, previos);
    return false;
  }
  previos.push(ahora);
  registros.set(clave, previos);
  return true;
}
