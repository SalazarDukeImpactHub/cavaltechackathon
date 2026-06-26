"use client";

import { useState } from "react";
import type { Respuestas } from "@/lib/diagnostico/calcular";

export function DescargarPDF({
  respuestas,
  empresa,
}: {
  respuestas: Respuestas;
  empresa?: string | null;
}) {
  const [cargando, setCargando] = useState(false);

  async function descargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/reporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas, empresa }),
      });
      if (!res.ok) throw new Error("fallo");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte-cavaltec.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // silencioso; el botón vuelve a su estado normal
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={descargar}
      disabled={cargando}
      className="rounded-lg px-4 py-[7px] text-[13px] font-medium text-white transition hover:brightness-110 disabled:opacity-50"
      style={{ background: "var(--primary)" }}
    >
      {cargando ? "Generando…" : "⬇ Descargar PDF"}
    </button>
  );
}
