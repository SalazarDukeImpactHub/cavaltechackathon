"use client";

import { useActionState } from "react";
import { agregarMiembro, type EstadoMiembro } from "@/lib/empresa/actions";
import { ROL_META, type Miembro } from "@/lib/roles";

const inputCls = "rounded-lg px-3 py-2 text-sm text-white outline-none";
const inputStyle = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)" };

export function GestionMiembros({
  companyId,
  miembros,
  esAdmin,
  miUserId,
}: {
  companyId: string;
  miembros: Miembro[];
  esAdmin: boolean;
  miUserId: string;
}) {
  const [estado, formAction, pending] = useActionState<EstadoMiembro, FormData>(agregarMiembro, {});

  return (
    <div className="mt-5 border-t pt-5" style={{ borderColor: "rgba(255,255,255,.06)" }}>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">
        Equipo ({miembros.length})
      </div>

      <ul className="flex flex-col gap-2">
        {miembros.map((m) => {
          const meta = ROL_META[m.rol] ?? ROL_META.evaluador;
          return (
            <li
              key={m.user_id}
              className="flex items-center justify-between rounded-lg px-4 py-2.5"
              style={{ background: "rgba(255,255,255,.03)" }}
            >
              <span className="text-sm text-soft">
                {m.nombre}
                {m.user_id === miUserId && <span className="text-dim"> · vos</span>}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${meta.color} 35%, transparent)` }}
              >
                {meta.label}
              </span>
            </li>
          );
        })}
      </ul>

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
            disabled={pending}
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
    </div>
  );
}
