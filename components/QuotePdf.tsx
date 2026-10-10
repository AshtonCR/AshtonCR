import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCRC, type Quote } from "@/lib/quote";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#14110f", fontFamily: "Helvetica" },
  head: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: "#d9461f", paddingBottom: 12 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  muted: { color: "#6b645a" },
  block: { marginTop: 18 },
  row: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#dcd5c6" },
  th: { fontFamily: "Helvetica-Bold", backgroundColor: "#f6f2ea" },
  cName: { flex: 4 }, cQty: { flex: 1, textAlign: "right" }, cUnit: { flex: 1.5, textAlign: "right" }, cTot: { flex: 1.5, textAlign: "right" },
  totals: { alignSelf: "flex-end", width: 200, marginTop: 14 },
  tRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: { fontFamily: "Helvetica-Bold", fontSize: 13, borderTopWidth: 1, borderTopColor: "#14110f", marginTop: 4, paddingTop: 4 },
  foot: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#6b645a" },
});

export function QuotePdf({ quote, business }: { quote: Quote; business: string }) {
  return (
    <Document title={`Cotización ${quote.number}`}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <Text style={s.brand}>{business}</Text>
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>COTIZACIÓN</Text>
            <Text>{quote.number}</Text>
            <Text style={s.muted}>Fecha: {quote.date}</Text>
          </View>
        </View>

        <View style={s.block}>
          <Text style={s.muted}>Cliente</Text>
          <Text style={{ fontSize: 12 }}>{quote.name}</Text>
          {quote.company ? <Text>{quote.company}</Text> : null}
        </View>

        <View style={s.block}>
          <View style={[s.row, s.th]}>
            <Text style={s.cName}>Producto</Text><Text style={s.cQty}>Cant.</Text>
            <Text style={s.cUnit}>Precio</Text><Text style={s.cTot}>Total</Text>
          </View>
          {quote.lines.map((l) => (
            <View key={l.id} style={s.row} wrap={false}>
              <View style={s.cName}>
                <Text>{l.name}</Text>
                {l.notes ? <Text style={s.muted}>Personalización: {l.notes}</Text> : null}
              </View>
              <Text style={s.cQty}>{l.qty}</Text>
              <Text style={s.cUnit}>{formatCRC(l.unit)}</Text>
              <Text style={s.cTot}>{formatCRC(l.total)}</Text>
            </View>
          ))}
        </View>

        <View style={s.totals}>
          <View style={s.tRow}><Text>Subtotal</Text><Text>{formatCRC(quote.subtotal)}</Text></View>
          <View style={s.tRow}><Text>IVA (13%)</Text><Text>{formatCRC(quote.iva)}</Text></View>
          <View style={[s.tRow, s.grand]}><Text>Total</Text><Text>{formatCRC(quote.total)}</Text></View>
        </View>

        <Text style={s.foot}>
          Cotización informativa, no constituye factura ni comprobante fiscal. Precios en colones. El diseño de la personalización se confirma por WhatsApp antes de producir.
        </Text>
      </Page>
    </Document>
  );
}
