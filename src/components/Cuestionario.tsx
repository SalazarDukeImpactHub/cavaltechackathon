"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { evaluarDiagnostico } from "@/app/diagnostico/actions";
import { guardarEvaluacion } from "@/lib/empresa/actions";
import { explicarPregunta } from "@/lib/ia/actions";
import { ResultadoView } from "./ResultadoView";
import { Markdown } from "./Markdown";
import { DescargarPDF } from "./DescargarPDF";
import { Logo } from "./Logo";
import { BLOQUES, PREGUNTAS, type Respuesta } from "@/lib/diagnostico/preguntas";
import type { Respuestas, ResultadoDiagnostico } from "@/lib/diagnostico/calcular";

const OPCIONES: { valor: Respuesta; etiqueta: string; color: string }[] = [
  { valor: "si", etiqueta: "✓ Sí", color: "#22c55e" },
  { valor: "no", etiqueta: "✗ No", color: "#ef4444" },
  { valor: "na", etiqueta: "— N/A", color: "#f59e0b" },
];

const numero = (i: number) => String(i + 1).padStart(2, "0");

export function Cuestionario({
  companyId = null,
  companyName = null,
}: {
  companyId?: string | null;
  companyName?: string | null;
}) {
  const router = useRouter();
  const [blockIndex, setBlockIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [resultado, setResultado] = useState<ResultadoDiagnostico | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [explicaciones, setExplicaciones] = useState<Record<string, string>>({});
  const [expCargando, setExpCargando] = useState<string | null>(null);

  async function pedirExplicacion(codigo: string) {
    if (explicaciones[codigo]) return;
    setExpCargando(codigo);
    const texto = await explicarPregunta(codigo);
    setExplicaciones((prev) => ({ ...prev, [codigo]: texto }));
    setExpCargando(null);
  }

  const bloque = BLOQUES[blockIndex];
  const preguntas = PREGUNTAS.filter((p) => p.bloque === bloque.codigo);
  const esBloqueada = (padre?: string) => !!padre && respuestas[padre] !== "si";

  function responder(codigo: string, valor: Respuesta) {
    setRespuestas((prev) => {
      const next = { ...prev, [codigo]: valor };
      // Si el padre deja de ser "sí", limpiamos las respuestas de las hijas.
      if (valor !== "si") {
        for (const h of PREGUNTAS) if (h.padre === codigo) delete next[h.codigo];
      }
      return next;
    });
  }

  const puedeAvanzar = preguntas.every((p) => esBloqueada(p.padre) || !!respuestas[p.codigo]);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function avanzar() {
    if (!puedeAvanzar) return;
    if (blockIndex < BLOQUES.length - 1) {
      setBlockIndex(blockIndex + 1);
      scrollTop();
    } else {
      setEnviando(true);
      if (companyId) {
        const guardada = await guardarEvaluacion(companyId, respuestas);
        setResultado(guardada.resultado);
        setEvaluationId(guardada.id);
      } else {
        const res = await evaluarDiagnostico(respuestas);
        setResultado(res);
        setEvaluationId(null);
      }
      setEnviando(false);
      scrollTop();
    }
  }

  function retroceder() {
    if (blockIndex > 0) {
      setBlockIndex(blockIndex - 1);
      scrollTop();
    } else {
      router.push("/");
    }
  }

  function reiniciar() {
    setResultado(null);
    setEvaluationId(null);
    setRespuestas({});
    setBlockIndex(0);
    scrollTop();
  }

  // ── Pantalla de resultados ──
  if (resultado) {
    return (
      <div style={{ animation: "fadeIn 350ms ease both" }}>
        <Nav>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-4 py-[7px] text-[13px] text-muted transition hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,.12)" }}
            >
              ← Inicio
            </Link>
            {evaluationId && <DescargarPDF evaluationId={evaluationId} />}
            <button
              onClick={reiniciar}
              className="rounded-lg px-4 py-[7px] text-[13px] text-muted transition hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,.12)" }}
            >
              Nuevo diagnóstico
            </button>
          </div>
        </Nav>
        <ResultadoView resultado={resultado} empresa={companyName} />
      </div>
    );
  }

  // ── Cuestionario ──
  return (
    <div className="flex min-h-screen flex-col">
      <Nav sticky>
        <div className="flex items-center gap-1">
          {BLOQUES.map((b, i) => {
            const activo = i === blockIndex;
            const hecho = i < blockIndex;
            return (
              <div key={b.codigo} className="flex items-center gap-1">
                <div
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition"
                  style={{
                    background: activo ? "rgba(14,41,118,.58)" : hecho ? "rgba(14,41,118,.22)" : "rgba(255,255,255,.03)",
                    border: `1px solid ${activo ? "rgba(59,95,200,.7)" : hecho ? "rgba(14,41,118,.48)" : "rgba(255,255,255,.08)"}`,
                  }}
                >
                  <span className="font-display text-[11px] font-bold" style={{ color: activo ? "var(--gold-bright)" : hecho ? "var(--muted)" : "var(--dim)" }}>
                    {numero(i)}
                  </span>
                  <span className="text-[11.5px] max-sm:hidden" style={{ color: activo ? "#fff" : hecho ? "var(--muted)" : "var(--dim)" }}>
                    {b.titulo}
                  </span>
                  {hecho && <span className="text-[11px] font-bold" style={{ color: "#22c55e" }}>✓</span>}
                </div>
                {i < BLOQUES.length - 1 && <span style={{ color: "rgba(255,255,255,.2)", fontSize: 16 }}>›</span>}
              </div>
            );
          })}
        </div>
      </Nav>

      <div className="flex-1 px-6 pb-8 pt-12">
        <div className="mx-auto" style={{ maxWidth: 740 }}>
          {/* Header de bloque */}
          <div className="mb-9" style={{ animation: "fadeIn 300ms ease both" }}>
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-[1.5px]" style={{ color: "var(--gold)" }}>
              {companyName ? `${companyName} · ` : ""}Bloque {numero(blockIndex)} de {numero(BLOQUES.length - 1)}
            </div>
            <h2 className="font-display mb-2 text-[26px] font-bold text-white">{bloque.titulo}</h2>
            <p className="text-[15px] leading-[1.55] text-muted">{bloque.descripcion}</p>
          </div>

          {/* Preguntas */}
          <div className="flex flex-col gap-3.5">
            {preguntas.map((p) => {
              const bloqueada = esBloqueada(p.padre);
              return (
                <div
                  key={p.codigo}
                  style={{ opacity: bloqueada ? 0.38 : 1, pointerEvents: bloqueada ? "none" : "auto", transition: "opacity 280ms ease" }}
                >
                  <div style={{ borderLeft: p.padre ? "2px solid rgba(201,162,39,.22)" : "none", paddingLeft: p.padre ? 20 : 0 }}>
                    <div
                      className="rounded-2xl px-6 py-[22px]"
                      style={{ background: "rgba(13,21,64,.65)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(12px)", animation: "revealCard 280ms ease both" }}
                    >
                      {bloqueada && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg px-3.5 py-2" style={{ background: "rgba(75,90,130,.2)", border: "1px solid rgba(75,90,130,.3)" }}>
                          <span className="text-xs text-dim">🔒 Bloqueado — depende de {p.padre}</span>
                        </div>
                      )}
                      {p.padre && (
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[1px]" style={{ color: "var(--gold)", opacity: 0.8 }}>
                          Sub-pregunta
                        </div>
                      )}
                      {!p.cuentaAlTotal && (
                        <div className="mb-2 text-[11px] text-dim">Complementaria · no puntúa</div>
                      )}

                      <p className="mb-2 text-[15px] font-medium leading-[1.6] text-white">{p.texto}</p>

                      <button
                        onClick={() => pedirExplicacion(p.codigo)}
                        disabled={expCargando === p.codigo}
                        className="mb-4 text-xs transition hover:brightness-110 disabled:opacity-60"
                        style={{ color: "var(--gold)" }}
                      >
                        {expCargando === p.codigo ? "Consultando IA…" : "✦ ¿Qué significa?"}
                      </button>

                      {explicaciones[p.codigo] && (
                        <div
                          className="mb-4 rounded-lg p-3 text-[13px]"
                          style={{ background: "rgba(201,162,39,.08)", border: "1px solid rgba(201,162,39,.2)" }}
                        >
                          <Markdown>{explicaciones[p.codigo]}</Markdown>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {OPCIONES.map((op) => {
                          const activa = respuestas[p.codigo] === op.valor;
                          return (
                            <button
                              key={op.valor}
                              disabled={bloqueada}
                              onClick={() => responder(p.codigo, op.valor)}
                              className="flex-1 rounded-[9px] px-2 py-[11px] text-sm transition hover:brightness-110"
                              style={{
                                background: activa ? `${op.color}2e` : "rgba(255,255,255,.04)",
                                color: activa ? op.color : "#8899bb",
                                border: `1.5px solid ${activa ? `${op.color}80` : "rgba(255,255,255,.08)"}`,
                                fontWeight: activa ? 600 : 400,
                              }}
                            >
                              {op.etiqueta}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navegación */}
          <div className="mt-8 flex items-center justify-between pt-6" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <button
              onClick={retroceder}
              className="rounded-[10px] px-6 py-[13px] text-sm text-muted transition hover:text-white"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}
            >
              ← Anterior
            </button>
            <div className="text-center text-xs text-dim">
              {!puedeAvanzar && "Responda todas las preguntas para continuar"}
            </div>
            <button
              onClick={avanzar}
              disabled={!puedeAvanzar || enviando}
              className="font-display rounded-[10px] px-7 py-[13px] text-[15px] font-semibold text-white transition hover:brightness-110"
              style={{
                background: puedeAvanzar ? "var(--primary)" : "rgba(14,41,118,.28)",
                opacity: puedeAvanzar ? 1 : 0.45,
                cursor: puedeAvanzar ? "pointer" : "not-allowed",
              }}
            >
              {enviando ? "Calculando…" : blockIndex === BLOQUES.length - 1 ? "Ver Resultados →" : "Siguiente bloque →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Nav({ children, sticky }: { children: React.ReactNode; sticky?: boolean }) {
  return (
    <div
      className={sticky ? "sticky top-0 z-20" : ""}
      style={{ background: "rgba(8,14,38,.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.07)" }}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-6 sm:px-12">
        <Link href="/" aria-label="Ir al inicio">
          <Logo size="sm" />
        </Link>
        {children}
      </div>
    </div>
  );
}
