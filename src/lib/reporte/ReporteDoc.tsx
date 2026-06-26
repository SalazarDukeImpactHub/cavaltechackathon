import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { type ResultadoDiagnostico } from "@/lib/diagnostico/calcular";
import { BLOQUES } from "@/lib/diagnostico/preguntas";
import { recomendacionesPara, PRIORIDAD_META } from "@/lib/diagnostico/recomendaciones";

const COLOR = {
  primary: "#0E2976",
  gold: "#C9A227",
  texto: "#1A2240",
  muted: "#6B7280",
  borde: "#E2E5EE",
  bajo: "#EF4444",
  medio: "#F59E0B",
  alto: "#22C55E",
};

function colorPct(p: number) {
  if (p < 40) return COLOR.bajo;
  if (p < 75) return COLOR.medio;
  return COLOR.alto;
}
function nivel(p: number) {
  if (p < 40) return "Crítico";
  if (p < 75) return "En Proceso";
  return "Conforme";
}

const PRIORIDAD_HEX: Record<string, string> = {
  critico: COLOR.bajo,
  importante: COLOR.medio,
  recomendado: COLOR.alto,
};

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLOR.texto, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2 solid ${COLOR.primary}`, paddingBottom: 12, marginBottom: 20 },
  logo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: COLOR.primary, letterSpacing: 2 },
  sub: { fontSize: 9, color: COLOR.muted, marginTop: 2 },
  fecha: { fontSize: 9, color: COLOR.muted },
  scoreBox: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
  scoreNum: { fontSize: 48, fontFamily: "Helvetica-Bold" },
  badge: { fontSize: 11, fontFamily: "Helvetica-Bold", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, color: "#fff" },
  empresa: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLOR.primary },
  seccion: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLOR.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  filaBloque: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottom: `1 solid ${COLOR.borde}` },
  barTrack: { width: 140, height: 6, backgroundColor: COLOR.borde, borderRadius: 3, marginHorizontal: 12 },
  rec: { borderLeft: `3 solid ${COLOR.gold}`, paddingLeft: 10, paddingVertical: 6, marginBottom: 8 },
  recAccion: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  recDetalle: { fontSize: 9, color: COLOR.muted, marginTop: 2, lineHeight: 1.4 },
  pBadge: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, marginBottom: 3, alignSelf: "flex-start" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: COLOR.muted, textAlign: "center", borderTop: `1 solid ${COLOR.borde}`, paddingTop: 8 },
});

export function ReporteDoc({
  resultado,
  empresa,
  fecha,
}: {
  resultado: ResultadoDiagnostico;
  empresa?: string | null;
  fecha: string;
}) {
  const recs = recomendacionesPara(resultado.brechas);
  const c = colorPct(resultado.porcentaje);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.logo}>CAVALTEC</Text>
            <Text style={s.sub}>Autodiagnóstico de cumplimiento — Ley 1581 de 2012 · Fase de diseño</Text>
          </View>
          <Text style={s.fecha}>{fecha}</Text>
        </View>

        {empresa ? <Text style={[s.empresa, { marginBottom: 14 }]}>{empresa}</Text> : null}

        <View style={s.scoreBox}>
          <Text style={[s.scoreNum, { color: c }]}>{resultado.porcentaje}%</Text>
          <View>
            <Text style={[s.badge, { backgroundColor: c }]}>{nivel(resultado.porcentaje)}</Text>
            <Text style={[s.sub, { marginTop: 4 }]}>Nivel de cumplimiento en fase de diseño</Text>
          </View>
        </View>

        <Text style={s.seccion}>Desglose por dimensión</Text>
        {BLOQUES.map((b) => {
          const logrado = resultado.porBloque[b.codigo];
          const pct = Math.round((logrado / b.pesoMaximo) * 100);
          const bc = colorPct(pct);
          return (
            <View key={b.codigo} style={s.filaBloque}>
              <Text style={{ flex: 1 }}>{b.titulo}</Text>
              <View style={s.barTrack}>
                <View style={{ width: `${pct}%`, height: 6, backgroundColor: bc, borderRadius: 3 }} />
              </View>
              <Text style={{ width: 32, textAlign: "right", fontFamily: "Helvetica-Bold", color: bc }}>{pct}%</Text>
            </View>
          );
        })}

        <Text style={[s.seccion, { marginTop: 20 }]}>Brechas detectadas y plan de acción</Text>
        {recs.length === 0 ? (
          <Text style={{ color: COLOR.alto }}>Sin brechas detectadas. Cumplimiento completo en los controles respondidos.</Text>
        ) : (
          recs.map((r) => {
            const meta = PRIORIDAD_META[r.prioridad];
            return (
              <View key={r.codigo} style={s.rec}>
                <Text style={[s.pBadge, { backgroundColor: PRIORIDAD_HEX[r.prioridad] }]}>{meta.etiqueta.toUpperCase()}</Text>
                <Text style={s.recAccion}>{r.accion}</Text>
                <Text style={s.recDetalle}>{r.detalle}</Text>
              </View>
            );
          })
        )}

        <Text style={s.footer} fixed>
          Generado por CAVALTEC Autodiagnóstico · Este reporte es orientativo y no constituye asesoría legal.
        </Text>
      </Page>
    </Document>
  );
}
