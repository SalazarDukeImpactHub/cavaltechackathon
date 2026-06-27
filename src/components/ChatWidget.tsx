"use client";

import { useEffect, useRef, useState } from "react";
import { responderChat } from "@/lib/ia/actions";
import { type MensajeChat } from "@/lib/ia/chat";

const BIENVENIDA =
  "¡Hola! Soy Vale 👋 Te ayudo a entender por qué proteger los datos de tu empresa importa — y cómo. ¿Qué querés saber?";

const SUGERENCIAS = ["¿Por qué es importante?", "¿Qué riesgos evito?", "¿Por qué elegirlos?"];

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        color: "#080e26",
        background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
      }}
    >
      V
    </div>
  );
}

export function ChatWidget() {
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
    const respuesta = await responderChat(nuevos);
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
          className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white transition hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
            boxShadow: "0 8px 24px rgba(14,41,118,.5), 0 0 0 4px rgba(201,162,39,.18)",
          }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 0 rgba(201,162,39,.35)", animation: "glow 3s ease-in-out infinite" }}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2"
            style={{ background: "var(--nivel-alto)", borderColor: "var(--background)" }}
          />
          <span
            className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium text-white opacity-0 transition group-hover:opacity-100"
            style={{ background: "rgba(13,21,64,.95)", border: "1px solid rgba(255,255,255,.1)" }}
          >
            Hablá con Vale 👋
          </span>
        </button>
      )}

      {/* Panel de chat */}
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
            <Avatar size={36} />
            <div className="flex-1">
              <div className="font-display text-sm font-bold leading-tight">Vale</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--nivel-alto)" }} />
                Asistente de cumplimiento
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
            {/* Bienvenida */}
            <div className="flex gap-2">
              <Avatar size={28} />
              <div
                className="max-w-[80%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-[1.5] text-soft"
                style={{ background: "rgba(255,255,255,.05)" }}
              >
                {BIENVENIDA}
              </div>
            </div>

            {mensajes.length === 0 && (
              <div className="flex flex-col gap-2 pt-1">
                {SUGERENCIAS.map((s) => (
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
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-[1.5] text-soft" style={{ background: "rgba(255,255,255,.05)" }}>
                    {m.texto}
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
