"use client";

import { ChatPanel } from "./ChatWidget";
import { responderDiagnostico } from "@/lib/ia/actions";
import { type MensajeChat } from "@/lib/ia/chat";

/** Vale dentro del resultado — responde sobre el diagnóstico puntual de la empresa. */
export function AsistenteDiagnostico({ porcentaje, brechas }: { porcentaje: number; brechas: string[] }) {
  return (
    <ChatPanel
      subtitulo="Sobre su diagnóstico"
      bienvenida="¡Hola! Soy Vale 👋 Ya vi su diagnóstico. Pregúnteme lo que quiera sobre su puntaje o sus brechas — y cómo cerrarlas."
      sugerencias={["¿Por qué saqué este puntaje?", "¿Por dónde empiezo?", "¿Cuál es mi brecha más urgente?"]}
      tooltip="Consulte su diagnóstico"
      onEnviar={(historial: MensajeChat[]) => responderDiagnostico(historial, { porcentaje, brechas })}
    />
  );
}
