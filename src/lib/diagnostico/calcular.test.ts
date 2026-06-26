/**
 * Test del motor de diagnóstico. Ejecutar: npx tsx src/lib/diagnostico/calcular.test.ts
 * Sin framework: assertions puras + salida legible. Rápido para hackathon.
 */

import assert from "node:assert/strict";
import { calcularCumplimiento, nivelCumplimiento, type Respuestas } from "./calcular";

let pasaron = 0;
function test(nombre: string, fn: () => void) {
  try {
    fn();
    pasaron++;
    console.log(`  ✅ ${nombre}`);
  } catch (e) {
    console.log(`  ❌ ${nombre}`);
    console.error(e);
    process.exitCode = 1;
  }
}

console.log("Motor de diagnóstico — tests\n");

test("empresa sin nada responde 'no' → 0%", () => {
  const r: Respuestas = {
    P1: "no", P6: "no", P7: "no", P8: "no", P9: "no", P10: "no",
  };
  const res = calcularCumplimiento(r);
  assert.equal(res.porcentaje, 0);
  assert.equal(nivelCumplimiento(res.porcentaje), "bajo");
});

test("cumplimiento perfecto → 100%", () => {
  const r: Respuestas = {
    P1: "si", P2: "si", P3: "si", P4: "si", P5: "si",
    P6: "si", P7: "si", P8: "si", P9: "si", P10: "si", P11: "si",
  };
  const res = calcularCumplimiento(r);
  assert.equal(res.porcentaje, 100);
  assert.equal(res.brechas.length, 0);
  assert.equal(nivelCumplimiento(res.porcentaje), "alto");
});

test("ejemplo del brief → 60% con brechas P4,P5,P7,P10", () => {
  const r: Respuestas = {
    P1: "si", P2: "si", P3: "si", P4: "no", P5: "no",
    P6: "si", P7: "no", P8: "si", P9: "si", P10: "no",
  };
  const res = calcularCumplimiento(r);
  assert.equal(res.porcentaje, 60);
  assert.deepEqual(res.brechas.sort(), ["P10", "P4", "P5", "P7"]);
  assert.equal(res.porBloque.politica_datos, 20);
  assert.equal(res.porBloque.privacidad_diseno, 24);
  assert.equal(res.porBloque.gobernanza, 16);
});

test("LÓGICA PADRE-HIJO: P1='no' anula P2–P5 aunque sean 'si'", () => {
  const r: Respuestas = {
    P1: "no", P2: "si", P3: "si", P4: "si", P5: "si",
    P6: "si", P7: "si", P8: "si", P9: "no", P10: "no",
  };
  const res = calcularCumplimiento(r);
  // Las hijas no suman: solo cuenta el bloque de privacidad (36).
  assert.equal(res.porBloque.politica_datos, 0);
  assert.equal(res.porcentaje, 36);
  // P1 es la brecha crítica; las hijas anuladas no se listan.
  assert.ok(res.brechas.includes("P1"));
  assert.ok(!res.brechas.includes("P2"));
});

test("P11 es complementaria: nunca suma al total", () => {
  const r: Respuestas = { P10: "si", P11: "si" };
  const res = calcularCumplimiento(r);
  // P10 aporta 8, P11 aporta 0.
  assert.equal(res.porBloque.gobernanza, 8);
});

console.log(`\n${pasaron} tests pasaron.`);
