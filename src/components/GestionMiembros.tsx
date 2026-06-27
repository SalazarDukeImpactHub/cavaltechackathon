"use client";

import { useActionState, useState, useTransition } from "react";
import {
  agregarMiembro,
  cambiarRolMiembro,
  removerMiembro,
  cancelarInvitacion,
  type EstadoMiembro,
} from "@/lib/empresa/actions";
import { ROL_META, type Miembro } from "@/lib/roles";

const inputCls = "rounded-lg px-3 py-2 text-sm text-white outline-none";
const inputStyle = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)" };

const ROLES = ["admin", "evaluador", "auditor"] as const;

export function GestionMiembros({
  companyId,
  miembros,
  invitaciones,
  esAdmin,
  miUserId,
}: {
  companyId: string;
  miembros: Miembro[];
  invitaciones: { email: string; rol: string }[];
  esAdmin: boolean;
  miUserId: string;
}) {
  const [estado, formAction, pending] = useActionState<EstadoMiembro, FormData>(agregarMiembro, {});
  const [accionPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  function mostrar(r: EstadoMiembro) {
    if (r.mensaje) setMensaje({ texto: r.mensaje, ok: !!r.ok });
  }

  function cambiarRol(userId: string, rol: string) {
    startTransition(async () => {
      mostrar(await cambiarRolMiembro(companyId, userId, rol));
    });
  }

  function remover(userId: string, nombre: string) {
    if (!confirm(`¿Remover a ${nombre} del equipo?`)) return;
    startTransition(async () => {
      mostrar(await removerMiembro(companyId, userId));
    });
  }

  function cancelar(email: string) {
    if (!confirm(`¿Cancelar la invitación a ${email}?`)) return;
    startTransition(async () => {
      mostrar(await cancelarInvitacion(companyId, email));
    });
  }

  const ocupado = pending || accionPending;

  return (
    <div className="mt-5 border-t pt-5" style={{ borderColor: "rgba(255,255,255,.06)" }}>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">
        Equipo ({miembros.length})
      </div>

      <ul className="flex flex-col gap-2">
        {miembros.map((m) => {
          const meta = ROL_META[m.rol] ?? ROL_META.evaluador;
          const esYo = m.user_id === miUserId;
          return (
            <li
              key={m.user_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-2.5"
              style={{ background: "rgba(255,255,255,.03)" }}
            >
              <span className="text-sm text-soft">
                {m.nombre}
                {esYo && <span className="text-dim"> · usted</span>}
              </span>
              <div className="flex items-center gap-2">
                {esAdmin ? (
                  <>
                    <select
                      value={m.rol}
                      onChange={(e) => cambiarRol(m.user_id, e.target.value)}
                      disabled={ocupado}
                      className="rounded-md px-2 py-1 text-[11px] font-semibold"
                      style={{
                        color: meta.color,
                        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${meta.color} 35%, transparent)`,
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} style={{ color: "#000" }}>
                          {ROL_META[r].label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remover(m.user_id, m.nombre)}
                      disabled={ocupado}
                      aria-label={`Remover a ${m.nombre}`}
                      title="Remover del equipo"
                      className="rounded-md px-2 py-1 text-xs text-dim transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${meta.color} 35%, transparent)` }}
                  >
                    {meta.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {invitaciones.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">
            Invitaciones pendientes ({invitaciones.length})
          </div>
          <ul className="flex flex-col gap-2">
            {invitaciones.map((iv) => {
              const meta = ROL_META[iv.rol] ?? ROL_META.evaluador;
              return (
                <li
                  key={iv.email}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-2.5"
                  style={{ background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.12)" }}
                >
                  <span className="text-sm text-muted">
                    {iv.email} <span className="text-dim">· pendiente</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${meta.color} 35%, transparent)` }}
                    >
                      {meta.label}
                    </span>
                    {esAdmin && (
                      <button
                        onClick={() => cancelar(iv.email)}
                        disabled={ocupado}
                        aria-label={`Cancelar invitación a ${iv.email}`}
                        title="Cancelar invitación"
                        className="rounded-md px-2 py-1 text-xs text-dim transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {esAdmin && (
        <form action={formAction} className="mt-4 flex flex-wrap items-center gap-2">
          <input type="hidden" name="companyId" value={companyId} />
          <input name="email" type="email" required placeholder="email@empresa.com" className={`${inputCls} flex-1`} style={inputStyle} />
          <select name="rol" defaultValue="evaluador" className={inputCls} style={inputStyle}>
            <option value="evaluador" style={{ color: "#000" }}>Evaluador</option>
            <option value="auditor" style={{ color: "#000" }}>Auditor</option>
            <option value="admin" style={{ color: "#000" }}>Administrador</option>
          </select>
          <button
            type="submit"
            disabled={ocupado}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            {pending ? "Agregando…" : "Agregar"}
          </button>
          {estado.mensaje && (
            <p className="w-full text-xs" style={{ color: estado.ok ? "#22c55e" : "#ef4444" }}>
              {estado.mensaje}
            </p>
          )}
        </form>
      )}

      {mensaje && (
        <p className="mt-3 text-xs" style={{ color: mensaje.ok ? "#22c55e" : "#ef4444" }}>
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
