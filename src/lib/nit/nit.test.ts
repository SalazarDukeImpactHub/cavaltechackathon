/**
 * Tests del validador de NIT. Ejecutar: npx tsx src/lib/nit/nit.test.ts
 */

import assert from "node:assert/strict";
import { calcularDigitoVerificacion, validarNit, formatearNit } from "./nit";

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

console.log("Validador de NIT (Módulo 11)\n");

test("ejemplo oficial de la DIAN: 800197268 → DV 4", () => {
  assert.equal(calcularDigitoVerificacion("800197268"), 4);
});

test("NIT válido con guion: 800197268-4", () => {
  assert.equal(validarNit("800197268-4").valido, true);
});

test("NIT válido sin guion: 8001972684", () => {
  assert.equal(validarNit("8001972684").valido, true);
});

test("acepta formato con puntos: 800.197.268-4", () => {
  assert.equal(validarNit("800.197.268-4").valido, true);
});

test("rechaza DV incorrecto: 800197268-9", () => {
  assert.equal(validarNit("800197268-9").valido, false);
});

test("rechaza letras", () => {
  assert.equal(validarNit("8001A7268-4").valido, false);
});

test("rechaza base demasiado corta", () => {
  assert.equal(validarNit("123-6").valido, false);
});

test("formatearNit produce el canónico base-DV", () => {
  assert.equal(formatearNit("800197268"), "800197268-4");
});

test("rechaza NIT trivial 000000-0 (todo ceros) aunque el DV cuadre", () => {
  assert.equal(validarNit("000000-0").valido, false);
});

test("rechaza NIT de dígitos repetidos 111111-x", () => {
  assert.equal(validarNit("111111-1").valido, false);
});

console.log(`\n${pasaron} tests pasaron.`);
