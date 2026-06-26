import { Logo } from "./Logo";

const OFICIAL = "https://www.cavaltec.com";

const externo = { target: "_blank" as const, rel: "noopener noreferrer" };
const linkCls = "text-[13px] text-muted transition hover:text-white";

const EMPRESA = [
  { label: "Nuestra empresa", href: `${OFICIAL}/nosotros.html` },
  { label: "Servicios", href: `${OFICIAL}/servicios.html` },
  { label: "Contáctanos", href: `${OFICIAL}/contacto.html` },
];

const LEGAL = [
  { label: "Política de privacidad", href: `${OFICIAL}/politica-privacidad.html` },
  { label: "Términos y condiciones", href: `${OFICIAL}/terminos-condiciones.html` },
  { label: "Política de seguridad", href: `${OFICIAL}/politica-seguridad.html` },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,.07)", background: "rgba(8,14,38,.7)" }}>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Marca */}
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-muted">
              Autodiagnóstico de cumplimiento de la Ley 1581 de protección de datos personales.
            </p>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">Empresa</h4>
            <ul className="flex flex-col gap-2">
              {EMPRESA.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...externo} className={linkCls}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">Legal</h4>
            <ul className="flex flex-col gap-2">
              {LEGAL.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...externo} className={linkCls}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-dim">Contacto</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="mailto:info@cavaltec.com" className={linkCls}>info@cavaltec.com</a></li>
              <li><a href="https://wa.me/573136998787" {...externo} className={linkCls}>+57 313 699 8787</a></li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="https://www.linkedin.com/company/cavaltec" {...externo} aria-label="LinkedIn" className="text-muted transition hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V10.2H6.16V17h2.18zM7.25 9.2a1.26 1.26 0 1 0 0-2.52 1.26 1.26 0 0 0 0 2.52zM18 17v-3.74c0-2-.43-3.5-2.76-3.5a2.42 2.42 0 0 0-2.18 1.2h-.03V10.2H10.9V17h2.18v-3.36c0-.9.17-1.76 1.28-1.76 1.1 0 1.1 1.02 1.1 1.82V17H18z"/></svg>
              </a>
              <a href="https://www.youtube.com/@cavaltec" {...externo} aria-label="YouTube" className="text-muted transition hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.3-.42-4.88a2.55 2.55 0 0 0-1.8-1.8C19.2 5 12 5 12 5s-7.2 0-8.78.42a2.55 2.55 0 0 0-1.8 1.8C1 8.7 1 12 1 12s0 3.3.42 4.88a2.55 2.55 0 0 0 1.8 1.8C4.8 19 12 19 12 19s7.2 0 8.78-.42a2.55 2.55 0 0 0 1.8-1.8C23 15.3 23 12 23 12zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-dim sm:flex-row"
          style={{ borderColor: "rgba(255,255,255,.06)" }}
        >
          <p>© 2026 CAVALTEC S.A.S. · Todos los derechos reservados.</p>
          <p>Autodiagnóstico · Ley 1581 de 2012</p>
        </div>
      </div>
    </footer>
  );
}
