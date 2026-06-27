import { redirect } from "next/navigation";
import { Cuestionario } from "@/components/Cuestionario";
import { createClient } from "@/lib/supabase/server";

export default async function DiagnosticoPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string }>;
}) {
  const supabase = await createClient();

  // 1) Requiere sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2) Requiere contexto de empresa.
  const { empresa } = await searchParams;
  if (!empresa) redirect("/dashboard");

  // 3) RLS sólo devuelve la empresa si el usuario es miembro.
  const { data: company } = await supabase
    .from("companies")
    .select("id, nombre, sector, tamano")
    .eq("id", empresa)
    .maybeSingle();
  if (!company) redirect("/dashboard");

  // 4) RBAC: el auditor es solo-lectura, no puede crear diagnósticos.
  const { data: membership } = await supabase
    .from("company_members")
    .select("rol")
    .eq("company_id", empresa)
    .eq("user_id", user.id)
    .maybeSingle();
  if (membership?.rol === "auditor") redirect("/dashboard");

  return (
    <Cuestionario
      companyId={company.id}
      companyName={company.nombre}
      sector={company.sector}
      tamano={company.tamano}
    />
  );
}
