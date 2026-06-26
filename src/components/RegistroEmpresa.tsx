"use client";

import { useActionState, useState } from "react";
import { crearEmpresa, type EstadoFormulario } from "@/lib/empresa/actions";
import { validarNit } from "@/lib/nit/nit";

const SECTORES = ["Tecnología", "Salud", "Financiero", "Educación", "Comercio", "Servicios", "Industrial", "Otro"];
const TAMANOS = [
  { v: "micro", l: "Micro (1–10)" },
  { v: "pequena", l: "Pequeña (11–50)" },
  { v: "mediana", l: "Mediana (51–200)" },
  { v: "grande", l: "Grande (200+)" },
];

const inputCls =
  "w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition placeholder:text-dim";
const inputStyle = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)" };

export function RegistroEmpresa() {
  const [estado, formAction, pending] = useActionState<EstadoFormulario, FormData>(crearEmpresa, {});
  const [nit, setNit] = useState("");

  const nitTocado = nit.trim().length > 0;
  const nitValido = nitTocado && validarNit(nit).valido;

  return (
    <div
      className="rounded-2xl p-7"
      style={{ background: "rgba(13,21,64,.6)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(12px)" }}
    >
      <h2 className="font-display text-xl font-bold">Registrá tu empresa</h2>
      <p className="mt-1 mb-6 text-sm text-muted">Necesitamos estos datos para asociar tus diagnósticos.</p>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Nombre de la empresa *</label>
          <input name="nombre" required className={inputCls} style={inputStyle} placeholder="CAVALTEC S.A.S." />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">NIT *</label>
          <input
            name="nit"
            required
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            className={inputCls}
            style={{
              ...inputStyle,
              border: `1px solid ${nitTocado ? (nitValido ? "rgba(34,197,94,.5)" : "rgba(239,68,68,.5)") : "rgba(255,255,255,.12)"}`,
            }}
            placeholder="900123456-7"
          />
          {nitTocado && (
            <p className="mt-1.5 text-xs" style={{ color: nitValido ? "#22c55e" : "#ef4444" }}>
              {nitValido ? "✓ NIT válido (dígito de verificación correcto)" : "✗ NIT inválido — revisá los dígitos"}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-muted">Sector</label>
            <select name="sector" className={inputCls} style={inputStyle} defaultValue="">
              <option value="" style={{ color: "#000" }}>Seleccioná…</option>
              {SECTORES.map((s) => (
                <option key={s} value={s} style={{ color: "#000" }}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-muted">Tamaño</label>
            <select name="tamano" className={inputCls} style={inputStyle} defaultValue="">
              <option value="" style={{ color: "#000" }}>Seleccioná…</option>
              {TAMANOS.map((t) => (
                <option key={t.v} value={t.v} style={{ color: "#000" }}>{t.l}</option>
              ))}
            </select>
          </div>
        </div>

        {estado.error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#ef4444" }}>
            {estado.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || (nitTocado && !nitValido)}
          className="font-display mt-2 rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Creando…" : "Crear empresa"}
        </button>
      </form>
    </div>
  );
}
