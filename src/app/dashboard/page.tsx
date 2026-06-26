import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { RegistroEmpresa } from "@/components/RegistroEmpresa";

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
  tamano: string | null;
}
interface Evaluacion {
  id: string;
  company_id: string;
  porcentaje: number;
  created_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nombre = (user.user_metadata?.full_name as string) ?? user.email;

  const { data: empresas } = await supabase
    .from("companies")
    .select("id, nombre, nit, sector, tamano");
  const { data: evaluaciones } = await supabase
    .from("evaluations")
    .select("id, company_id, porcentaje, created_at")
    .order("created_at", { ascending: false });

  const lista = (empresas ?? []) as Empresa[];
  const evals = (evaluaciones ?? []) as Evaluacion[];

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
              return (
                <div
                  key={emp.id}
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(13,21,64,.6)", border: "1px solid rgba(255,255,255,.08)" }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold">{emp.nombre}</h2>
                      <p className="mt-1 text-sm text-muted">
                        NIT {emp.nit}
                        {emp.sector && ` · ${emp.sector}`}
                      </p>
                    </div>
                    <Link
                      href={`/diagnostico?empresa=${emp.id}`}
                      className="font-display shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    >
                      Nuevo diagnóstico →
                    </Link>
                  </div>

                  <div className="mt-5 border-t pt-5" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">
                      Historial ({propias.length})
                    </div>
                    {propias.length === 0 ? (
                      <p className="text-sm text-muted">Aún no hay diagnósticos. Hacé el primero.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {propias.map((e) => (
                          <li
                            key={e.id}
                            className="flex items-center justify-between rounded-lg px-4 py-3"
                            style={{ background: "rgba(255,255,255,.03)" }}
                          >
                            <span className="text-sm text-soft">
                              {new Date(e.created_at).toLocaleDateString("es-CO", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="font-display text-lg font-bold" style={{ color: colorPct(e.porcentaje) }}>
                              {e.porcentaje}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
