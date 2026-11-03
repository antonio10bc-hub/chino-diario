# 每日一词 · Chino diario

Web app minimalista: una palabra en chino al día (caracteres, pinyin, significado en español y pronunciación).

- **Sin servidor**: la palabra se elige con la fecha local (`words.json` → `inicio` + días transcurridos). Recorre la lista en orden y vuelve a empezar.
- **Añadir palabras**: añádelas al final de `palabras` en `words.json` (`h`, `p`, `es`, `cat` y `nota` opcional).
- **iPhone**: abre la web en Safari → compartir → *Añadir a pantalla de inicio*.
- **Widget**: `widget/chino-diario.js` para la app Scriptable (instrucciones dentro de la app, sección 小组件).
