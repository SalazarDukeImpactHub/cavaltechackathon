import ReactMarkdown from "react-markdown";

/** Renderiza Markdown (generado por la IA) con estilos de marca para dark mode. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="ia-md">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
