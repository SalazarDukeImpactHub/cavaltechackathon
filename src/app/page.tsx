import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";

const FEATURES = [
  {
    titulo: "Diagnóstico preciso",
    desc: "Evaluación ponderada de los controles exigidos por la Ley 1581.",
    color: "var(--gold)",
    bg: "rgba(201,162,39,.15)",
    border: "rgba(201,162,39,.3)",
    icon: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </>
    ),
  },
  {
    titulo: "Brechas priorizadas",
    desc: "Lista ordenada de incumplimientos críticos, importantes y recomendados.",
    color: "var(--muted)",
    bg: "rgba(14,41,118,.3)",
    border: "rgba(59,95,200,.4)",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
  },
  {
    titulo: "Plan de acción",
    desc: "Recomendaciones concretas y accionables para cada brecha detectada.",
    color: "var(--nivel-alto)",
    bg: "rgba(34,197,94,.12)",
    border: "rgba(34,197,94,.3)",
    icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  },
];

export default function Home() {
  return (
    <>
      {/* NAV (fija) */}
      <nav
        className="sticky top-0 z-50 flex h-[72px] items-center justify-between px-6 sm:px-12"
        style={{ background: "rgba(8,14,38,.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}
      >
        <Logo />
        <div className="flex items-center gap-7">
          <Link href="#" className="text-[13.5px] text-muted transition hover:text-white max-sm:hidden">Inicio</Link>
          <a
            href="https://www.cavaltec.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13.5px] text-muted transition hover:text-white max-sm:hidden"
          >
            Conozca CAVALTEC
          </a>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-[18px] py-2 text-[13px] font-medium text-white transition hover:bg-primary-hover"
          >
            Ingresar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative overflow-hidden " style={{ backgroundImage: "url(servicios_fondo.png)",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
             }}>
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute left-1/2 top-[40%]"
          style={{
            transform: "translate(-50%,-50%)",
            width: 960,
            height: 640,
            background: "radial-gradient(ellipse, rgba(14,41,118,.22) 0%, transparent 68%)",
            animation: "glow 6s ease-in-out infinite",
          }}
        />

        <div
          className="relative z-[1] flex flex-col items-center justify-center px-6 pb-16 pt-10 text-center"
          style={{ minHeight: "calc(100vh - 72px)" }}
        >
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full px-[18px] py-[7px]"
            style={{ background: "rgba(201,162,39,.1)", border: "1px solid rgba(201,162,39,.3)" }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--gold)" }} />
            <span className="text-[13px] font-medium" style={{ color: "var(--gold-bright)", letterSpacing: ".4px" }}>
              Ley 1581 de 2012 · Protección de Datos · Colombia
            </span>
          </div>

          <h1
            className="font-display mb-[22px] font-extrabold leading-[1.1] text-white"
            style={{ fontSize: "clamp(30px,5vw,60px)", maxWidth: 860 }}
          >
            Conozca su nivel de <span style={{ color: "var(--gold)" }}>cumplimiento</span>
            <br />en protección de datos personales
          </h1>

          <p className="mb-11 leading-[1.65] text-muted" style={{ fontSize: "clamp(15px,2vw,18px)", maxWidth: 560 }}>
            Responda 11 preguntas y obtenga un diagnóstico preciso con brechas identificadas y
            recomendaciones accionables para su empresa.
          </p>

          <Link
            href="/dashboard"
            className="font-display rounded-xl bg-primary px-[52px] py-[18px] text-[17px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover"
            style={{
              boxShadow: "0 0 48px rgba(14,41,118,.45), inset 0 1px 0 rgba(255,255,255,.12)",
              letterSpacing: ".3px",
            }}
          >
            Iniciar diagnóstico →
          </Link>

          {/* Stats */}
          <div className="mt-[60px] flex items-center gap-6 sm:gap-10">
            {[
              ["11", "Preguntas clave"],
              ["3", "Dimensiones"],
              ["~5 min", "Tiempo estimado"],
            ].map(([n, l], i) => (
              <div key={l} className="flex items-center gap-6 sm:gap-10">
                {i > 0 && <span className="h-9 w-px" style={{ background: "rgba(255,255,255,.08)" }} />}
                <div className="text-center">
                  <div className="font-display text-3xl font-bold leading-none">{n}</div>
                  <div className="mt-[5px] text-xs text-dim">{l}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-[18px] text-xs text-dim">Acceso seguro · Datos cifrados · Confidencial</p>

          {/* Feature cards */}
          <div className="mt-[52px] flex w-full max-w-[820px] flex-col gap-4 sm:flex-row">
            {FEATURES.map((f) => (
              <div
                key={f.titulo}
                className="flex-1 rounded-2xl p-6"
                style={{ background: "rgba(13,21,64,.6)", border: "1px solid rgba(255,255,255,.07)", backdropFilter: "blur(12px)" }}
              >
                <div
                  className="mb-[14px] flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round">
                    {f.icon}
                  </svg>
                </div>
                <div className="font-display mb-1.5 text-[15px] font-semibold">{f.titulo}</div>
                <div className="text-[13px] leading-[1.5] text-muted">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </>
  );
}
