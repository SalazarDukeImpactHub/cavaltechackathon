import Link from "next/link";
import { Logo } from "@/components/Logo";
import { signInWithGoogle } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          transform: "translate(-50%,-50%)",
          width: 720,
          height: 480,
          background: "radial-gradient(ellipse, rgba(14,41,118,.2) 0%, transparent 68%)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: "rgba(13,21,64,.6)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(12px)" }}
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <h1 className="font-display mb-2 text-2xl font-bold">Ingresá a tu cuenta</h1>
        <p className="mb-7 text-sm text-muted">
          Accedé para guardar tus diagnósticos y consultar el historial de tu empresa.
        </p>

        {error && (
          <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#ef4444" }}>
            No pudimos iniciar sesión. Intentá de nuevo.
          </div>
        )}

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold transition hover:brightness-95"
            style={{ color: "#080e26" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continuar con Google
          </button>
        </form>

        <p className="mt-6 text-xs text-dim">
          ¿Solo querés probar?{" "}
          <Link href="/diagnostico" className="transition hover:text-muted" style={{ color: "var(--gold)" }}>
            Diagnóstico sin registro →
          </Link>
        </p>
      </div>
    </div>
  );
}
