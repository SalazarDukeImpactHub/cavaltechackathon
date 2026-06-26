import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularCumplimiento, type Respuestas } from "@/lib/diagnostico/calcular";
import { type Respuesta } from "@/lib/diagnostico/preguntas";
import { ResultadoView } from "@/components/ResultadoView";
import { DescargarPDF } from "@/components/DescargarPDF";
import { Logo } from "@/components/Logo";

export default async function EvaluacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS sólo devuelve la evaluación si el usuario es miembro de su empresa.
  const { data: evaluacion } = await supabase
    .from("evaluations")
    .select("id, company_id, porcentaje, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!evaluacion) redirect("/dashboard");

  const { data: empresa } = await supabase
    .from("companies")
    .select("nombre")
    .eq("id", evaluacion.company_id)
    .maybeSingle();

  const { data: answers } = await supabase
    .from("answers")
    .select("pregunta_codigo, respuesta")
    .eq("evaluation_id", id);

  const respuestas: Respuestas = Object.fromEntries(
    (answers ?? []).map((a) => [a.pregunta_codigo as string, a.respuesta as Respuesta]),
  );
  const resultado = calcularCumplimiento(respuestas);

  const fecha = new Date(evaluacion.created_at).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      <div
        className="sticky top-0 z-20"
        style={{ background: "rgba(8,14,38,.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.07)" }}
      >
        <div className="mx-auto flex h-16 items-center justify-between px-6 sm:px-12">
          <Link href="/" aria-label="Ir al inicio">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-[7px] text-[13px] text-muted transition hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,.12)" }}
            >
              ← Panel
            </Link>
            <DescargarPDF respuestas={respuestas} empresa={empresa?.nombre ?? null} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-8">
        <p className="text-sm" style={{ color: "var(--gold)" }}>Diagnóstico archivado</p>
        <h1 className="font-display mt-1 text-2xl font-bold">
          {empresa?.nombre ?? "Empresa"} <span className="text-muted">· {fecha}</span>
        </h1>
      </div>

      <ResultadoView resultado={resultado} />
    </div>
  );
}
