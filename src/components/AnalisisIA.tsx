"use client";

import { useState } from "react";
import { generarAnalisis } from "@/lib/ia/actions";
import { Markdown } from "./Markdown";

export function AnalisisIA({ porcentaje, brechas }: { porcentaje: number; brechas: string[] }) {
  const [texto, setTexto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function generar() {
    setCargando(true);
    const res = await generarAnalisis(porcentaje, brechas);
    setTexto(res);
    setCargando(false);
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgba(201,162,39,.08)", border: "1px solid rgba(201,162,39,.25)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: "var(--gold)" }}>✦</span>
        <h3 className="font-display text-base font-semibold">Análisis con IA</h3>
      </div>

      {texto === null ? (
        <>
          <p className="mb-4 text-sm text-muted">
            Genere una interpretación personalizada de su resultado y un plan de acción para esta semana.
          </p>
          <button
            onClick={generar}
            disabled={cargando}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-50"
            style={{ background: "var(--gold)", color: "#080e26" }}
          >
            {cargando ? "Analizando…" : "Generar análisis"}
          </button>
        </>
      ) : (
        <Markdown>{texto}</Markdown>
      )}
    </div>
  );
}
