"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { responderChat } from "@/lib/ia/actions";
import { type MensajeChat } from "@/lib/ia/chat";
import { Markdown } from "./Markdown";

function Robot({ size, color, animado = false }: { size: number; color: string; animado?: boolean }) {
  const ojo: CSSProperties | undefined = animado
    ? { transformBox: "fill-box", transformOrigin: "center", animation: "parpadeo 4.2s ease-in-out infinite" }
    : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={animado ? { animation: "flotar 3.5s ease-in-out infinite" } : undefined}
    >
      <line x1="12" y1="2.6" x2="12" y2="5.6" />
      <circle cx="12" cy="2" r="1.1" fill={color} stroke="none" style={animado ? { animation: "glow 1.8s ease-in-out infinite" } : undefined} />
      <rect x="4.5" y="6" width="15" height="12" rx="4" />
      <line x1="2.6" y1="11" x2="2.6" y2="13.6" />
      <line x1="21.4" y1="11" x2="21.4" y2="13.6" />
      <circle cx="9.6" cy="11.6" r="1.25" fill={color} stroke="none" style={ojo} />
      <circle cx="14.4" cy="11.6" r="1.25" fill={color} stroke="none" style={ojo} />
      <path d="M9.6 14.6 q 2.4 1.8 4.8 0" />
    </svg>
  );
}

function Avatar({ size = 32, animado = false }: { size?: number; animado?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: "linear-gradient(135deg, var(--gold-bright), var(--gold))" }}
    >
      <Robot size={Math.round(size * 0.66)} color="#080e26" animado={animado} />
    </div>
  );
}

interface ChatPanelProps {
  subtitulo: string;
  bienvenida: string;
  sugerencias: string[];
  tooltip: string;
  onEnviar: (historial: MensajeChat[]) => Promise<string>;
}

/** Widget de chat reusable (botón flotante + panel). Vale es el personaje en ambos usos. */
export function ChatPanel({ subtitulo, bienvenida, sugerencias, tooltip, onEnviar }: ChatPanelProps) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando, abierto]);

  async function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio || cargando) return;
    const nuevos: MensajeChat[] = [...mensajes, { rol: "user", texto: limpio }];
    setMensajes(nuevos);
    setInput("");
    setCargando(true);
    const respuesta = await onEnviar(nuevos);
    setMensajes([...nuevos, { rol: "assistant", texto: respuesta }]);
    setCargando(false);
  }

  return (
    <>
      {/* Botón flotante */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          aria-label="Hablar con Vale, la asistente"
          className="group fixed bottom-6 right-6 z-50 h-14 w-14"
        >
          <span className="absolute inset-0 rounded-full" style={{ border: "2px solid var(--primary-light)", animation: "sonar 2.6s ease-out infinite" }} />
          <span className="absolute inset-0 rounded-full" style={{ border: "2px solid var(--gold)", animation: "sonar 2.6s ease-out infinite 1.3s" }} />
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full transition group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))", boxShadow: "0 8px 24px rgba(14,41,118,.55), 0 0 0 4px rgba(201,162,39,.2)" }}
          >
            <Robot size={30} color="#fff" animado />
          </span>
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2" style={{ background: "var(--nivel-alto)", borderColor: "var(--background)" }} />
          <span
            className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium text-white opacity-0 transition group-hover:opacity-100"
            style={{ background: "rgba(13,21,64,.95)", border: "1px solid rgba(255,255,255,.1)" }}
          >
            {tooltip}
          </span>
        </button>
      )}

      {/* Panel */}
      {abierto && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl max-sm:inset-3 max-sm:bottom-3 max-sm:h-auto"
          style={{
            width: 370,
            height: 540,
            maxHeight: "calc(100vh - 48px)",
            background: "rgba(8,14,38,.98)",
            border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            backdropFilter: "blur(20px)",
            animation: "scaleIn 180ms ease both",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <Avatar size={36} animado />
            <div className="flex-1">
              <div className="font-display text-sm font-bold leading-tight">Vale</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--nivel-alto)" }} />
                {subtitulo}
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex gap-2">
              <Avatar size={28} />
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-[1.5] text-soft" style={{ background: "rgba(255,255,255,.05)" }}>
                {bienvenida}
              </div>
            </div>

            {mensajes.length === 0 && (
              <div className="flex flex-col gap-2 pt-1">
                {sugerencias.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="self-start rounded-full px-3.5 py-1.5 text-[12.5px] transition hover:brightness-110"
                    style={{ color: "var(--gold-bright)", background: "rgba(201,162,39,.1)", border: "1px solid rgba(201,162,39,.3)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {mensajes.map((m, i) =>
              m.rol === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13px] leading-[1.5] text-white" style={{ background: "var(--primary)" }}>
                    {m.texto}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-2">
                  <Avatar size={28} />
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-[1.5]" style={{ background: "rgba(255,255,255,.05)" }}>
                    <Markdown>{m.texto}</Markdown>
                  </div>
                </div>
              ),
            )}

            {cargando && (
              <div className="flex items-center gap-2 text-[12px] text-muted" style={{ animation: "glow 1.4s ease-in-out infinite" }}>
                <Avatar size={28} />
                Vale está escribiendo…
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(input);
            }}
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta…"
              maxLength={500}
              className="flex-1 rounded-full px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-dim"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }}
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:brightness-110 disabled:opacity-40"
              style={{ background: "var(--primary)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/** Vale en el landing — responde el FAQ informativo (público). */
export function ChatWidget() {
  return (
    <ChatPanel
      subtitulo="Asistente de cumplimiento"
      bienvenida="¡Hola! Soy Vale 👋 Te ayudo a entender por qué proteger los datos de tu empresa importa — y cómo. ¿Qué querés saber?"
      sugerencias={["¿Por qué es importante?", "¿Qué riesgos evito?", "¿Por qué elegirlos?"]}
      tooltip="Hablá con Vale 👋"
      onEnviar={responderChat}
    />
  );
}
