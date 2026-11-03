// Palabra del día: se calcula a partir de la fecha local, sin servidor.
const NUM = ['〇','一','二','三','四','五','六','七','八','九','十'];
const zhNum = n => n <= 10 ? NUM[n] : n < 20 ? '十' + (n % 10 ? NUM[n % 10] : '') : NUM[Math.floor(n / 10)] + '十' + (n % 10 ? NUM[n % 10] : '');
const DIAS = ['日','一','二','三','四','五','六'];

function indiceDe(fecha, inicio, total) {
  const [y, m, d] = inicio.split('-').map(Number);
  const dias = Math.round((Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - Date.UTC(y, m - 1, d)) / 864e5);
  return { dias, i: ((dias % total) + total) % total };
}

const $ = id => document.getElementById(id);
let datos, palabra;

function ir(vista) {
  document.querySelectorAll('.vista').forEach(v => v.classList.toggle('activa', v.id === vista));
  scrollTo(0, 0);
}
document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => ir(b.dataset.ir)));

function hablar() {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(palabra.h);
  u.lang = 'zh-CN'; u.rate = 0.7;
  const voz = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').startsWith('zh-CN'));
  if (voz) u.voice = voz;
  speechSynthesis.speak(u);
}
$('hablar').addEventListener('click', hablar);

$('copiar').addEventListener('click', async e => {
  const txt = await (await fetch('/widget/chino-diario.js')).text();
  try { await navigator.clipboard.writeText(txt); e.target.textContent = '已复制 · Copiado ✓'; }
  catch { location.href = '/widget/chino-diario.js'; }
});

function pintar() {
  const hoy = new Date();
  const lista = datos.palabras;
  const { dias, i } = indiceDe(hoy, datos.inicio, lista.length);
  palabra = lista[i];

  $('fecha-zh').textContent = `${zhNum(hoy.getMonth() + 1)}月${zhNum(hoy.getDate())}日 · 星期${DIAS[hoy.getDay()]}`;
  $('fecha-es').textContent = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  $('cat').textContent = palabra.cat;
  $('hanzi').textContent = palabra.h;
  $('hanzi').classList.toggle('largo', palabra.h.length > 2);
  $('pinyin').textContent = palabra.p;
  $('es').textContent = palabra.es;
  $('nota').textContent = palabra.nota || '';
  document.title = `${palabra.h} · ${palabra.p}`;

  // Historial: de hoy hacia atrás, sin repetir.
  const n = Math.min(Math.max(dias, 0) + 1, lista.length);
  $('lista').innerHTML = Array.from({ length: n }, (_, k) => {
    const w = lista[((i - k) % lista.length + lista.length) % lista.length];
    return `<li class="${k ? '' : 'hoy'}"><span class="h" lang="zh-CN">${w.h}</span><span class="p">${w.p}</span><span class="e">${w.es}</span></li>`;
  }).join('');
}

fetch('/words.json').then(r => r.json()).then(d => { datos = d; pintar(); });
// Si la app queda abierta y cambia el día, actualiza al volver.
document.addEventListener('visibilitychange', () => { if (!document.hidden && datos) pintar(); });

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
