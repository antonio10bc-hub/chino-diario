// 每日一词 · Chino diario — núcleo del widget (se descarga solo desde la web).
module.exports = async function () {
const WEB = "https://chino-diario-eta.vercel.app";

const papel = Color.dynamic(new Color("#f4efe6"), new Color("#16130f"));
const tinta = Color.dynamic(new Color("#1f1c18"), new Color("#ece4d4"));
const gris = Color.dynamic(new Color("#8a8173"), new Color("#8f8676"));
const rojo = Color.dynamic(new Color("#b23a2e"), new Color("#c9503f"));
const zh = (t, s) => { try { return new Font(t === "b" ? "STSongti-SC-Bold" : "STSongti-SC-Regular", s); } catch (e) { return Font.systemFont(s); } };

// Datos con copia local por si no hay conexión
const fm = FileManager.local();
const ruta = fm.joinPath(fm.documentsDirectory(), "chino-diario.json");
let datos;
try { datos = await new Request(WEB + "/words.json").loadJSON(); fm.writeString(ruta, JSON.stringify(datos)); }
catch (e) { datos = JSON.parse(fm.readString(ruta)); }

const hoy = new Date();
const [y, m, d] = datos.inicio.split("-").map(Number);
const dias = Math.round((Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) - Date.UTC(y, m - 1, d)) / 864e5);
const n = datos.palabras.length;
const w = datos.palabras[((dias % n) + n) % n];
const largo = w.h.length > 2;

const NUM = ["〇","一","二","三","四","五","六","七","八","九","十"];
const zhNum = k => k <= 10 ? NUM[k] : k < 20 ? "十" + (k % 10 ? NUM[k % 10] : "") : NUM[Math.floor(k / 10)] + "十" + (k % 10 ? NUM[k % 10] : "");
const fecha = `${zhNum(hoy.getMonth() + 1)}月${zhNum(hoy.getDate())}日`;

const fam = config.widgetFamily || "large";
const wg = new ListWidget();
wg.backgroundColor = papel;
wg.url = WEB;
wg.refreshAfterDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 0, 1);

const txt = (st, s, font, color, lineas = 1) => {
  const t = st.addText(s); t.font = font; t.textColor = color; t.lineLimit = lineas; t.minimumScaleFactor = 0.4; return t;
};
const sello = st => {
  const s = st.addStack(); s.backgroundColor = rojo; s.cornerRadius = 4; s.setPadding(2, 4, 2, 4);
  txt(s, "日", zh("b", 11), new Color("#f4efe6"));
};
const cabecera = () => {
  const top = wg.addStack(); top.centerAlignContent();
  txt(top, fecha, zh("r", 12), gris);
  top.addSpacer();
  txt(top, w.cat.toUpperCase(), Font.systemFont(10), gris);
};
const centro = (s, font, color, lineas = 1) => {
  const st = wg.addStack(); st.addSpacer();
  const t = txt(st, s, font, color, lineas); t.centerAlignText();
  st.addSpacer(); return t;
};

if (fam === "medium") {
  // Carácter grande a la izquierda, pinyin y significado a la derecha.
  wg.setPadding(14, 18, 14, 18);
  cabecera();
  wg.addSpacer();
  const fila = wg.addStack(); fila.centerAlignContent();
  txt(fila, w.h, zh("b", largo ? 66 : 92), tinta);
  fila.addSpacer(18);
  const col = fila.addStack(); col.layoutVertically();
  txt(col, w.p, Font.italicSystemFont(largo ? 24 : 28), rojo);
  col.addSpacer(4);
  txt(col, w.es, Font.systemFont(21), tinta, 2);
  fila.addSpacer();
  wg.addSpacer();
} else if (fam === "small") {
  wg.setPadding(12, 12, 12, 12);
  txt(wg.addStack(), fecha, zh("r", 11), gris);
  wg.addSpacer();
  centro(w.h, zh("b", largo ? 44 : 58), tinta);
  wg.addSpacer(2);
  centro(w.p, Font.italicSystemFont(17), rojo);
  centro(w.es, Font.systemFont(14), tinta);
  wg.addSpacer();
} else {
  wg.setPadding(18, 20, 18, 20);
  cabecera();
  wg.addSpacer();
  centro(w.h, zh("b", largo ? 96 : 130), tinta);
  wg.addSpacer(6);
  centro(w.p, Font.italicSystemFont(30), rojo);
  wg.addSpacer(8);
  centro(w.es, Font.systemFont(22), tinta, 2);
  if (w.nota) { wg.addSpacer(10); centro(w.nota, Font.italicSystemFont(15), gris, 2); }
  wg.addSpacer();
  const pie = wg.addStack(); pie.addSpacer(); sello(pie);
}

if (config.runsInWidget) Script.setWidget(wg);
else if (fam === "medium") await wg.presentMedium(); else await wg.presentLarge();
};
