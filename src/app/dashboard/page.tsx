import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { RegistroEmpresa } from "@/components/RegistroEmpresa";
import { GestionMiembros } from "@/components/GestionMiembros";
import { ROL_META, type Miembro } from "@/lib/roles";

function colorPct(p: number) {
  if (p < 40) return "#ef4444";
  if (p < 75) return "#f59e0b";
  return "#22c55e";
}

interface Empresa {
  id: string;
  nombre: string;
  nit: string | null;
  sector: string | null;
}
interface Evaluacion {
  id: string;
  company_id: string;
  porcentaje: number;
  created_at: string;
}
interface MemberRow {
  company_id: string;
  user_id: string;
  rol: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nombre = (user.user_metadata?.full_name as string) ?? user.email;

  const [{ data: empresas }, { data: evaluaciones }, { data: members }, { data: perfiles }] =
    await Promise.all([
      supabase.from("companies").select("id, nombre, nit, sector"),
      supabase.from("evaluations").select("id, company_id, porcentaje, created_at").order("created_at", { ascending: false }),
      supabase.from("company_members").select("company_id, user_id, rol"),
      supabase.from("profiles").select("id, nombre"),
    ]);

  const lista = (empresas ?? []) as Empresa[];
  const evals = (evaluaciones ?? []) as Evaluacion[];
  const memberRows = (members ?? []) as MemberRow[];
  const nombrePorId = new Map((perfiles ?? []).map((p) => [p.id as string, (p.nombre as string) ?? "Usuario"]));

  return (
    <div className="min-h-screen">
      <div style={{ background: "rgba(8,14,38,.97)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div className="mx-auto flex h-16 items-center justify-between px-6 sm:px-12">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted max-sm:hidden">{nombre}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg px-4 py-[7px] text-[13px] text-muted transition hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,.12)" }}
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm" style={{ color: "var(--gold)" }}>Panel</p>
        <h1 className="font-display mt-1 mb-8 text-3xl font-bold">Hola, {nombre}</h1>

        {lista.length === 0 ? (
          <RegistroEmpresa />
        ) : (
          <div className="flex flex-col gap-6">
            {lista.map((emp) => {
              const propias = evals.filter((e) => e.company_id === emp.id);
              const miembros: Miembro[] = memberRows
                .filter((m) => m.company_id === emp.id)
                .map((m) => ({ user_id: m.user_id, rol: m.rol, nombre: nombrePorId.get(m.user_id) ?? "Usuario" }));
              const miRol = miembros.find((m) => m.user_id === user.id)?.rol ?? "evaluador";
              const rolMeta = ROL_META[miRol] ?? ROL_META.evaluador;
              const puedeEvaluar = miRol === "admin" || miRol === "evaluador";

              return (
                <div key={emp.id} className="rounded-2xl p-6" style={{ background: "rgba(13,21,64,.6)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold">{emp.nombre}</h2>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{ color: rolMeta.color, background: `color-mix(in srgb, ${rolMeta.color} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${rolMeta.color} 35%, transparent)` }}
                        >
                          {rolMeta.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        NIT {emp.nit}
                        {emp.sector && ` · ${emp.sector}`}
                      </p>
                    </div>
                    {puedeEvaluar ? (
                      <Link
                        href={`/diagnostico?empresa=${emp.id}`}
                        className="font-display shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                      >
                        Nuevo diagnóstico →
                      </Link>
                    ) : (
                      <span className="shrink-0 rounded-xl px-4 py-2.5 text-xs text-dim" style={{ border: "1px solid rgba(255,255,255,.1)" }}>
                        Solo lectura (auditor)
                      </span>
                    )}
                  </div>

                  {/* Historial */}
                  <div className="mt-5 border-t pt-5" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">
                      Historial ({propias.length})
                    </div>
                    {propias.length === 0 ? (
                      <p className="text-sm text-muted">Aún no hay diagnósticos.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {propias.map((e) => (
                          <li key={e.id}>
                            <Link
                              href={`/evaluacion/${e.id}`}
                              className="flex items-center justify-between rounded-lg px-4 py-3 transition hover:brightness-125"
                              style={{ background: "rgba(255,255,255,.03)" }}
                            >
                              <span className="text-sm text-soft">
                                {new Date(e.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}
                                <span className="text-dim"> · ver detalle →</span>
                              </span>
                              <span className="font-display text-lg font-bold" style={{ color: colorPct(e.porcentaje) }}>
                                {e.porcentaje}%
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Equipo y roles */}
                  <GestionMiembros companyId={emp.id} miembros={miembros} esAdmin={miRol === "admin"} miUserId={user.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
