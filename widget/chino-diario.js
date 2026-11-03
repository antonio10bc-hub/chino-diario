// 每日一词 · Chino diario — widget para Scriptable (iPhone)
// Pégalo en Scriptable y añade un widget de Scriptable (tamaño grande) a la pantalla de inicio.
const URL_DATOS = "https://chino-diario-eta.vercel.app/words.json";

const papel = Color.dynamic(new Color("#f4efe6"), new Color("#16130f"));
const tinta = Color.dynamic(new Color("#1f1c18"), new Color("#ece4d4"));
const gris = Color.dynamic(new Color("#8a8173"), new Color("#8f8676"));
const rojo = Color.dynamic(new Color("#b23a2e"), new Color("#c9503f"));
const zh = (t, s) => { try { return new Font(t === "b" ? "STSongti-SC-Bold" : "STSongti-SC-Regular", s); } catch (e) { return Font.systemFont(s); } };

// Datos con copia local por si no hay conexión
const fm = FileManager.local();
const ruta = fm.joinPath(fm.documentsDirectory(), "chino-diario.json");
let datos;
try { datos = await new Request(URL_DATOS).loadJSON(); fm.writeString(ruta, JSON.stringify(datos)); }
catch (e) { datos = JSON.parse(fm.readString(ruta)); }

const hoy = new Date();
const [y, m, d] = datos.inicio.split("-").map(Number);
const dias = Math.round((Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) - Date.UTC(y, m - 1, d)) / 864e5);
const n = datos.palabras.length;
const w = datos.palabras[((dias % n) + n) % n];

const NUM = ["〇","一","二","三","四","五","六","七","八","九","十"];
const zhNum = k => k <= 10 ? NUM[k] : k < 20 ? "十" + (k % 10 ? NUM[k % 10] : "") : NUM[Math.floor(k / 10)] + "十" + (k % 10 ? NUM[k % 10] : "");

const fam = config.widgetFamily || "large";
const grande = fam === "large" || fam === "extraLarge";
const pequeno = fam === "small";

const wg = new ListWidget();
wg.backgroundColor = papel;
wg.setPadding(18, 20, 18, 20);
wg.url = "https://chino-diario-eta.vercel.app";

const top = wg.addStack();
const f = top.addText(`${zhNum(hoy.getMonth() + 1)}月${zhNum(hoy.getDate())}日`);
f.font = zh("r", 12); f.textColor = gris;
top.addSpacer();
if (!pequeno) { const c = top.addText(w.cat.toUpperCase()); c.font = Font.systemFont(10); c.textColor = gris; }

wg.addSpacer();
const centro = (txt, font, color) => {
  const s = wg.addStack(); s.addSpacer();
  const t = s.addText(txt); t.font = font; t.textColor = color; t.minimumScaleFactor = 0.4; t.lineLimit = 1;
  s.addSpacer(); return t;
};
const tam = pequeno ? 46 : grande ? (w.h.length > 2 ? 84 : 112) : 64;
centro(w.h, zh("b", tam), tinta);
wg.addSpacer(pequeno ? 2 : 6);
centro(w.p, Font.italicSystemFont(pequeno ? 14 : grande ? 24 : 18), rojo);
wg.addSpacer(pequeno ? 2 : 8);
centro(w.es, Font.systemFont(pequeno ? 12 : grande ? 18 : 14), tinta);
if (grande && w.nota) { wg.addSpacer(8); const t = centro(w.nota, Font.italicSystemFont(13), gris); t.lineLimit = 2; }
wg.addSpacer();

if (!pequeno) {
  const pie = wg.addStack(); pie.addSpacer();
  const sello = pie.addStack();
  sello.backgroundColor = rojo; sello.cornerRadius = 4; sello.setPadding(3, 5, 3, 5);
  const s = sello.addText("日"); s.font = zh("b", 12); s.textColor = new Color("#f4efe6");
}

// Refrescar justo después de medianoche
const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 0, 1);
wg.refreshAfterDate = manana;

if (config.runsInWidget) Script.setWidget(wg); else await wg.presentLarge();
Script.complete();
