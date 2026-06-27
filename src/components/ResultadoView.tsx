import { Gauge } from "./Gauge";
import { type ResultadoDiagnostico } from "@/lib/diagnostico/calcular";
import { BLOQUES } from "@/lib/diagnostico/preguntas";
import {
  recomendacionesPara,
  PRIORIDAD_META,
  type ContextoEmpresa,
} from "@/lib/diagnostico/recomendaciones";
import { AnalisisIA } from "./AnalisisIA";
import { AsistenteDiagnostico } from "./AsistenteDiagnostico";

interface NivelInfo {
  label: string;
  desc: string;
  color: string;
  glow: string;
}

function nivelInfo(p: number): NivelInfo {
  if (p < 40) return { label: "Crítico", desc: "Se requieren acciones urgentes", color: "#ef4444", glow: "rgba(239,68,68,.3)" };
  if (p < 75) return { label: "En Proceso", desc: "Avances significativos pendientes", color: "#f59e0b", glow: "rgba(245,158,11,.3)" };
  return { label: "Conforme", desc: "Cumplimiento legal satisfactorio", color: "#22c55e", glow: "rgba(34,197,94,.3)" };
}

function colorPorPct(p: number): string {
  if (p < 40) return "#ef4444";
  if (p < 75) return "#f59e0b";
  return "#22c55e";
}

const WHATSAPP_TEL = "573136998787";

export function ResultadoView({
  resultado,
  empresa,
  contexto,
}: {
  resultado: ResultadoDiagnostico;
  empresa?: string | null;
  contexto?: ContextoEmpresa;
}) {
  const nivel = nivelInfo(resultado.porcentaje);
  const recomendaciones = recomendacionesPara(resultado.brechas, contexto);

  // Mensaje pre-llenado para la asesoría por WhatsApp, con el contexto del diagnóstico.
  const lineasBrechas = recomendaciones.length
    ? recomendaciones.map((r) => `• ${r.accion}`).join("\n")
    : "Sin brechas detectadas.";
  const mensajeWa =
    "Hola CAVALTEC, quiero solicitar asesoría sobre mi autodiagnóstico de cumplimiento de la Ley 1581.\n\n" +
    (empresa ? `Empresa: ${empresa}\n` : "") +
    `Nivel de cumplimiento (fase de diseño): ${resultado.porcentaje}% — ${nivel.label}\n\n` +
    `Brechas prioritarias a cerrar:\n${lineasBrechas}\n\n` +
    "¿Me pueden ayudar a cerrarlas?";
  const urlWa = `https://api.whatsapp.com/send/?phone=${WHATSAPP_TEL}&text=${encodeURIComponent(mensajeWa)}&type=phone_number&app_absent=0`;

  return (
    <div style={{ animation: "fadeIn 350ms ease both" }}>
      {/* Score hero */}
      <div className="relative overflow-hidden px-6 pb-8 pt-12 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0"
          style={{ transform: "translateX(-50%)", width: 700, height: 350, background: `radial-gradient(ellipse, ${nivel.glow} 0%, transparent 68%)`, opacity: 0.6 }}
        />
        <div
          className="relative mb-7 inline-flex items-center gap-[9px] rounded-full px-[22px] py-2"
          style={{ background: `${nivel.color}1a`, border: `1px solid ${nivel.color}4d` }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: nivel.color }} />
          <span className="text-sm font-bold" style={{ color: nivel.color, letterSpacing: ".5px" }}>{nivel.label}</span>
          <span className="text-[13px]" style={{ color: nivel.color, opacity: 0.75 }}>· {nivel.desc}</span>
        </div>

        <div className="relative mx-auto" style={{ maxWidth: 400 }}>
          <Gauge porcentaje={resultado.porcentaje} color={nivel.color} />
        </div>
      </div>

      {/* Desglose por dimensión */}
      <div className="mx-auto px-6 pb-9" style={{ maxWidth: 680 }}>
        <div className="mb-[18px] text-[11px] font-bold uppercase tracking-[1.5px] text-dim">Desglose por dimensión</div>
        <div
          className="flex flex-col gap-[22px] rounded-2xl px-7 py-6"
          style={{ background: "rgba(13,21,64,.6)", border: "1px solid rgba(255,255,255,.07)", backdropFilter: "blur(12px)" }}
        >
          {BLOQUES.map((b) => {
            const logrado = resultado.porBloque[b.codigo];
            const pct = Math.round((logrado / b.pesoMaximo) * 100);
            const color = colorPorPct(pct);
            return (
              <div key={b.codigo}>
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{b.titulo}</span>
                  <span className="font-display text-[15px] font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}`, transition: "width 1.2s ease-out" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brechas + acciones */}
      <div className="mx-auto px-6 pb-12" style={{ maxWidth: 680 }}>
        <div className="mb-[18px] text-[11px] font-bold uppercase tracking-[1.5px] text-dim">
          Brechas detectadas y acciones recomendadas
        </div>

        {recomendaciones.length === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.22)" }}>
            <div className="mb-2 text-[28px]">✓</div>
            <p className="text-[15px] font-semibold" style={{ color: "#22c55e" }}>Sin brechas detectadas</p>
            <p className="mt-1 text-[13px] text-muted">Cumplimiento completo en todos los controles respondidos.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recomendaciones.map((rec) => {
              const meta = PRIORIDAD_META[rec.prioridad];
              return (
                <div
                  key={rec.codigo}
                  className="rounded-xl px-5 py-[18px]"
                  style={{ background: "rgba(13,21,64,.5)", border: "1px solid rgba(255,255,255,.06)", borderLeft: `3px solid ${meta.color}`, animation: "revealCard 400ms ease both" }}
                >
                  <div className="mb-2.5 flex items-center gap-2">
                    <span
                      className="rounded-full px-[11px] py-[3px] text-[11px] font-bold"
                      style={{ color: meta.color, background: `${meta.color}1f`, border: `1px solid ${meta.color}59` }}
                    >
                      {meta.etiqueta}
                    </span>
                    <span className="text-[11px] text-dim">{rec.codigo}</span>
                  </div>
                  <p className="mb-1 text-sm font-semibold text-white">{rec.accion}</p>
                  <p className="text-sm leading-[1.6] text-soft">{rec.detalle}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Análisis con IA */}
      <div className="mx-auto px-6 pb-9" style={{ maxWidth: 680 }}>
        <AnalisisIA porcentaje={resultado.porcentaje} brechas={resultado.brechas} contexto={contexto} />
      </div>

      {/* CTA */}
      <div className="mx-auto px-6 pb-20 text-center" style={{ maxWidth: 680 }}>
        <div className="rounded-2xl px-10 py-8" style={{ background: "rgba(14,41,118,.15)", border: "1px solid rgba(14,41,118,.4)" }}>
          <div className="font-display mb-2 text-xl font-bold">¿Desea un plan de acción detallado?</div>
          <p className="mb-6 text-sm text-muted">
            Nuestro equipo puede ayudarle a cerrar las brechas y alcanzar el cumplimiento de la Ley 1581.
          </p>
          <a
            href={urlWa}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display inline-block rounded-xl bg-primary px-10 py-[15px] text-base font-semibold text-white transition hover:-translate-y-px hover:bg-primary-hover"
            style={{ boxShadow: "0 0 32px rgba(14,41,118,.4)" }}
          >
            Solicitar asesoría CAVALTEC
          </a>
        </div>
      </div>

      <AsistenteDiagnostico porcentaje={resultado.porcentaje} brechas={resultado.brechas} contexto={contexto} />
    </div>
  );
}
