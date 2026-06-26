import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nombre = (user.user_metadata?.full_name as string) ?? user.email;

  return (
    <div className="min-h-screen">
      <div style={{ background: "rgba(8,14,38,.97)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div className="mx-auto flex h-16 items-center justify-between px-6 sm:px-12">
          <Logo size="sm" />
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

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm" style={{ color: "var(--gold)" }}>Bienvenido</p>
        <h1 className="font-display mt-1 text-3xl font-bold">{nombre}</h1>
        <p className="mt-2 text-muted">Tu sesión está activa. Acá vas a ver el historial de diagnósticos de tu empresa.</p>

        <Link
          href="/diagnostico"
          className="font-display mt-8 inline-block rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-hover"
        >
          Nuevo diagnóstico →
        </Link>
      </div>
    </div>
  );
}
