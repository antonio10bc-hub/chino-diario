// 每日一词 · Chino diario — widget para Scriptable (iPhone)
// Este cargador se pega una sola vez: el diseño se descarga de la web y se actualiza solo.
const URL_NUCLEO = "https://chino-diario-eta.vercel.app/widget/nucleo.js";
const fm = FileManager.local();
const ruta = fm.joinPath(fm.documentsDirectory(), "chino-diario-nucleo.js");
try {
  const codigo = await new Request(URL_NUCLEO).loadString();
  if (codigo.includes("module.exports")) fm.writeString(ruta, codigo);
} catch (e) { /* sin conexión: usa la copia guardada */ }
const main = importModule(ruta);
await main();
Script.complete();
