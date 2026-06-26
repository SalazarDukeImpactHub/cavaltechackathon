"use client";

import { useEffect, useState } from "react";

/**
 * Velocímetro de cumplimiento 0–100% (SVG puro).
 * Zonas de color + aguja que rota + conteo animado al aparecer.
 */
interface GaugeProps {
  porcentaje: number;
  color: string;
}

const TOTAL_ARC = Math.PI * 130; // ≈ 408.41

export function Gauge({ porcentaje, color }: GaugeProps) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const objetivo = Math.max(0, Math.min(100, porcentaje));
    const duracion = 1600;
    let inicio: number | null = null;
    let raf = 0;
    const paso = (ts: number) => {
      if (inicio === null) inicio = ts;
      const t = Math.min((ts - inicio) / duracion, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValor(Math.round(eased * objetivo));
      if (t < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [porcentaje]);

  const fill = (valor / 100) * TOTAL_ARC;
  const needleRot = valor * 1.8 - 90;

  return (
    <svg viewBox="0 0 320 195" width="100%" style={{ overflow: "visible", maxWidth: 400 }}>
      {/* Arcos de zona */}
      <path d="M 30 160 A 130 130 0 0 1 119.83 36.36" style={{ fill: "none", stroke: "#ef4444", strokeWidth: 20, opacity: 0.15 }} />
      <path d="M 119.83 36.36 A 130 130 0 0 1 251.92 68.08" style={{ fill: "none", stroke: "#f59e0b", strokeWidth: 20, opacity: 0.15 }} />
      <path d="M 251.92 68.08 A 130 130 0 0 1 290 160" style={{ fill: "none", stroke: "#22c55e", strokeWidth: 20, opacity: 0.15 }} />

      {/* Track */}
      <path d="M 30 160 A 130 130 0 0 1 290 160" style={{ fill: "none", stroke: "rgba(255,255,255,.05)", strokeWidth: 20, strokeLinecap: "round" }} />

      {/* Arco de progreso */}
      <path
        d="M 30 160 A 130 130 0 0 1 290 160"
        style={{
          fill: "none",
          stroke: color,
          strokeWidth: 20,
          strokeLinecap: "round",
          strokeDasharray: `${fill.toFixed(2)} ${(TOTAL_ARC - fill + 2).toFixed(2)}`,
          filter: `drop-shadow(0 0 10px ${color})`,
        }}
      />

      {/* Aguja */}
      <g style={{ transformOrigin: "160px 160px", transform: `rotate(${needleRot.toFixed(2)}deg)` }}>
        <line x1="160" y1="156" x2="160" y2="42" style={{ stroke: "white", strokeWidth: 2.5, strokeLinecap: "round", filter: "drop-shadow(0 0 4px rgba(255,255,255,.4))" }} />
      </g>
      <circle cx="160" cy="160" r="13" style={{ fill: color, stroke: "#080e26", strokeWidth: 3 }} />
      <circle cx="160" cy="160" r="5" style={{ fill: "white" }} />

      {/* Etiquetas de zona */}
      <text x="20" y="180" style={{ fontSize: 11, fill: "#ef4444", opacity: 0.6, textAnchor: "middle" }}>0</text>
      <text x="62" y="54" style={{ fontSize: 11, fill: "#ef4444", opacity: 0.6, textAnchor: "middle" }}>25</text>
      <text x="160" y="22" style={{ fontSize: 11, fill: "#f59e0b", opacity: 0.6, textAnchor: "middle" }}>50</text>
      <text x="258" y="54" style={{ fontSize: 11, fill: "#22c55e", opacity: 0.6, textAnchor: "middle" }}>75</text>
      <text x="300" y="180" style={{ fontSize: 11, fill: "#22c55e", opacity: 0.6, textAnchor: "middle" }}>100</text>

      {/* Número */}
      <text x="160" y="130" className="font-display" style={{ fontWeight: 800, fontSize: 58, fill: "white", textAnchor: "middle" }}>
        {valor}
      </text>
      <text x="160" y="152" style={{ fontSize: 13, fill: "#94a3c8", textAnchor: "middle" }}>de 100 puntos</text>
    </svg>
  );
}
