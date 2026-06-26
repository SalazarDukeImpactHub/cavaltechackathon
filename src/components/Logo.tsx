/** Logotipo CAVALTEC: monograma "CT" + nombre, del manual de marca. */
export function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  const ct =
    size === "md"
      ? { fs: 22, ls: "3px", pad: "6px 14px 5px" }
      : { fs: 16, ls: "2.5px", pad: "4px 10px 3px" };
  const name =
    size === "md"
      ? { fs: 8.5, ls: "2.5px", pad: "3px 6px 4px" }
      : { fs: 6, ls: "2px", pad: "2px 4px 3px" };

  return (
    <div
      className="inline-flex shrink-0 flex-col"
      style={{ border: `${size === "md" ? 2.5 : 2}px solid #fff` }}
    >
      <div className="flex items-center justify-center" style={{ padding: ct.pad }}>
        <span
          className="font-display text-white"
          style={{ fontWeight: 900, fontSize: ct.fs, letterSpacing: ct.ls, lineHeight: 1 }}
        >
          CT
        </span>
      </div>
      <div className="flex items-center justify-center bg-white" style={{ padding: name.pad }}>
        <span
          className="font-display"
          style={{ fontWeight: 800, fontSize: name.fs, color: "#080e26", letterSpacing: name.ls, lineHeight: 1 }}
        >
          CAVALTEC
        </span>
      </div>
    </div>
  );
}
