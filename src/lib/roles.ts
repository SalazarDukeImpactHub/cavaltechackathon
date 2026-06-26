/** Metadatos de roles — módulo neutral, compartido entre server y client components. */

export interface Miembro {
  user_id: string;
  rol: string;
  nombre: string;
}

export const ROL_META: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "var(--gold)" },
  evaluador: { label: "Evaluador", color: "var(--primary-light)" },
  auditor: { label: "Auditor", color: "var(--muted)" },
};
