import { Cuestionario } from "@/components/Cuestionario";
import { createClient } from "@/lib/supabase/server";

export default async function DiagnosticoPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string }>;
}) {
  const { empresa } = await searchParams;

  let companyId: string | null = null;
  let companyName: string | null = null;

  if (empresa) {
    const supabase = await createClient();
    // RLS sólo devuelve la empresa si el usuario es miembro.
    const { data } = await supabase.from("companies").select("id, nombre").eq("id", empresa).maybeSingle();
    if (data) {
      companyId = data.id;
      companyName = data.nombre;
    }
  }

  return <Cuestionario companyId={companyId} companyName={companyName} />;
}
