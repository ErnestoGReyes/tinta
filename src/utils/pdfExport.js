// ─────────────────────────────────────────────────────────────────────────
// Exportación a PDF "de libro" — a diferencia del pdfExport de Plano (que
// posiciona cada línea a mano con <canvas> para lograr las columnas exactas
// que pide el formato de guion: personaje a 3.7", diálogo a 2.5", etc.), acá
// el contenido es prosa corrida. Un libro no necesita tabulaciones fijas,
// así que en vez de reimplementar paginación manual le dejamos el trabajo
// (reflow, justificado, viudas/huérfanas) al motor de impresión del propio
// navegador vía CSS estándar — mucho menos código, y de paso conservamos
// gratis la negrita/cursiva/título/subtítulo que ya viven en el HTML
// guardado de cada capítulo, sin tener que re-parsearlos a mano.
//
// Lo que SÍ vale la pena traer de Plano tal cual:
//   1. Abrir la ventana de forma síncrona, ANTES de cualquier await — los
//      navegadores solo dejan window.open() sin bloqueo de pop-ups si pasa
//      dentro del mismo gesto de click que lo disparó.
//   2. Esperar a document.fonts.ready antes de llamar a print(): si no,
//      hay riesgo de imprimir con la tipografía de sistema porque la
//      fuente web (acá Lora/Cormorant Garamond) todavía no terminó de cargar.
const BODY_FONT = `'Lora', Georgia, serif`;
const DISPLAY_FONT = `'Cormorant Garamond', serif`;
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Cormorant+Garamond:wght@500;600;700&display=swap";

const PAGE_SIZES = {
  book:   { css: "6in 9in", label: "Libro (6×9\")" },
  letter: { css: "letter",  label: "Carta" },
  a4:     { css: "A4",      label: "A4" },
};

function escapeHtml(s = "") {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function pdfPageSizeOptions() {
  return Object.entries(PAGE_SIZES).map(([id, v]) => ({ id, label: v.label }));
}

export async function exportBookToPDF(book, chapters, { author = "", includeTOC = true, pageSize = "book" } = {}) {
  // Sincrónico: tiene que pasar antes de cualquier "await" de acá abajo.
  const w = window.open("", "_blank");
  if (!w) {
    alert("Tu navegador bloqueó la ventana de exportación. Habilitá los pop-ups para este sitio e intentá de nuevo.");
    return;
  }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:${BODY_FONT};font-size:13px;color:#666;display:flex;
    align-items:center;justify-content:center;height:100vh;margin:0;background:#f4f4f4}
  </style></head><body>Generando PDF…</body></html>`);
  w.document.close();

  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.book;
  const maxWidthScreen = pageSize === "book" ? "6in" : "210mm";

  const chapterHtml = chapters.map((ch, i) => `
    <section class="chapter">
      <h1 class="chapter-title">${escapeHtml(ch.title || `Capítulo ${i + 1}`)}</h1>
      <div class="chapter-body">${ch.content || ""}</div>
    </section>
  `).join("\n");

  const tocHtml = includeTOC ? `
    <section class="toc">
      <h2>Índice</h2>
      <ol>
        ${chapters.map((ch, i) => `<li>${escapeHtml(ch.title || `Capítulo ${i + 1}`)}</li>`).join("")}
      </ol>
    </section>
  ` : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(book?.title || "Libro")}</title>
<link rel="stylesheet" href="${GOOGLE_FONTS_HREF}"/>
<style>
  @page { size: ${size.css}; margin: 2.2cm 2cm; }
  * { box-sizing: border-box; }
  html, body { background:#fff; margin:0; padding:0; }
  body { font-family:${BODY_FONT}; font-size:12.5pt; line-height:1.6; color:#161310; }

  .cover { height:100vh; display:flex; flex-direction:column; align-items:center;
    justify-content:center; text-align:center; page-break-after:always; }
  .cover h1 { font-family:${DISPLAY_FONT}; font-size:34pt; font-weight:600; margin:0 0 18pt; }
  .cover .author { font-size:14pt; color:#444; }
  .cover .credit { margin-top:60pt; font-size:9.5pt; color:#999; }

  .toc { page-break-after:always; }
  .toc h2 { font-family:${DISPLAY_FONT}; font-size:20pt; margin:0 0 20pt; }
  .toc ol { font-size:12pt; line-height:2.1; padding-left:22pt; }

  .chapter { page-break-before:always; }
  .chapter-title { font-family:${DISPLAY_FONT}; font-size:22pt; font-weight:600;
    margin:0 0 26pt; text-align:center; }

  /* El contenido de cada capítulo puede traer <p> o <div> por línea según el
     navegador donde se escribió — estilamos ambos por igual para que el
     resultado sea consistente pase lo que pase. */
  .chapter-body > p, .chapter-body > div {
    margin:0; text-indent:1.4em; text-align:justify; orphans:3; widows:3;
  }
  .chapter-body > p:first-of-type, .chapter-body > div:first-of-type { text-indent:0; }
  .chapter-body h1 {
    font-family:${DISPLAY_FONT}; font-size:16pt; font-weight:600;
    margin:1.6em 0 .5em; text-indent:0; text-align:left;
  }
  .chapter-body h2 {
    font-family:${DISPLAY_FONT}; font-size:13pt; font-style:italic;
    font-weight:600; margin:1.2em 0 .4em; text-indent:0; text-align:left;
  }

  @media screen {
    body { background:#888; padding:24px 0; }
    .cover, .toc, .chapter { background:#fff; max-width:${maxWidthScreen};
      margin:0 auto 24px; box-shadow:0 4px 24px rgba(0,0,0,.35); padding:2cm; }
  }
  @media print {
    .cover, .toc, .chapter { padding:0; }
  }
</style>
</head>
<body>
  <div class="cover">
    <h1>${escapeHtml(book?.title || "Sin título")}</h1>
    ${author ? `<div class="author">${escapeHtml(author)}</div>` : ""}
    <div class="credit">Escrito con Tinta</div>
  </div>
  ${tocHtml}
  ${chapterHtml}
  <script>
    // Igual que en el exportador de guiones de Plano: esperamos a que la
    // fuente termine de cargar (no un timeout fijo) antes de imprimir, con
    // un salvavidas por si "ready" nunca resuelve.
    (function () {
      function go() { window.print(); }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(go).catch(go);
        setTimeout(go, 2500);
      } else {
        setTimeout(go, 600);
      }
    })();
  </script>
</body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
}
