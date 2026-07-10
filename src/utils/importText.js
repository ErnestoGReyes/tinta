// ─────────────────────────────────────────────────────────────────────────
// Importar un libro entero desde un archivo .txt o .md — el camino inverso
// de utils/pdfExport.js. La idea es la misma que ahí: no inventamos un
// formato propio ni pedimos que el archivo venga en una estructura rígida,
// tratamos de reconocer los patrones más comunes con los que la gente
// realmente escribe (Markdown con encabezados, o texto plano con
// "Capítulo 1" / "Chapter 1") y dejamos todo editable en una vista previa
// antes de tocar la base de datos — si el parser se equivoca en algo, se
// corrige ahí mismo, no hay que reimportar.
// ─────────────────────────────────────────────────────────────────────────

function escapeHtml(s = "") {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// **negrita** / __negrita__ y *cursiva* / _cursiva_ — solo tiene sentido
// aplicarlo en modo Markdown; en texto plano un asterisco es solo un asterisco.
function applyInlineMarkdown(escapedText) {
  return escapedText
    .replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, a, b) => `<b>${a || b}</b>`)
    .replace(/\*(.+?)\*|_(.+?)_/g, (_, a, b) => `<i>${a || b}</i>`);
}

function paragraphsToHtml(rawText, { markdown, preserveLineBreaks }) {
  const paragraphs = rawText.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(p => {
    // Subtítulo dentro del capítulo (## en Markdown) — se respeta como bloque
    // propio en vez de mezclarlo con el párrafo.
    const subHeadingMatch = markdown && /^##\s+(.+)$/.exec(p.split("\n")[0]);
    if (subHeadingMatch && p.split("\n").length === 1) {
      return `<h2>${applyInlineMarkdown(escapeHtml(subHeadingMatch[1].trim()))}</h2>`;
    }
    const lines = p.split("\n").map(l => l.trim()).filter(Boolean);
    const joined = lines.map(l => applyInlineMarkdown(escapeHtml(l)))
      .join(preserveLineBreaks ? "<br>" : " ");
    return `<p>${joined}</p>`;
  }).join("");
}

function countWordsPlain(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

// Intenta separar el archivo en capítulos usando encabezados Markdown.
// Prioriza "## " si existen (patrón: # Título del libro, ## Capítulo 1...);
// si no hay "## " pero sí varios "# " además del primero, usa esos.
function splitMarkdown(text) {
  const lines = text.split("\n");
  const h1Idx = [], h2Idx = [];
  lines.forEach((l, i) => {
    if (/^##\s+/.test(l)) h2Idx.push(i);
    else if (/^#\s+/.test(l)) h1Idx.push(i);
  });

  let suggestedTitle = null;
  let breakIdx = [];
  let headingLevel = null;

  if (h2Idx.length > 0) {
    // Si el archivo arranca con un "# " antes del primer "## ", es el título del libro.
    if (h1Idx.length > 0 && h1Idx[0] < h2Idx[0]) {
      suggestedTitle = lines[h1Idx[0]].replace(/^#\s+/, "").trim();
    }
    breakIdx = h2Idx;
    headingLevel = 2;
  } else if (h1Idx.length > 1) {
    suggestedTitle = lines[h1Idx[0]].replace(/^#\s+/, "").trim();
    breakIdx = h1Idx.slice(1);
    headingLevel = 1;
  } else if (h1Idx.length === 1) {
    suggestedTitle = lines[h1Idx[0]].replace(/^#\s+/, "").trim();
    breakIdx = [];
  }

  if (breakIdx.length === 0) {
    // Sin capítulos detectables vía encabezados: un único capítulo con todo
    // el cuerpo (menos la línea de título, si la sacamos arriba).
    const bodyLines = suggestedTitle !== null
      ? lines.filter((_, i) => i !== h1Idx[0])
      : lines;
    return { suggestedTitle, chapters: [{ title: "Capítulo 1", raw: bodyLines.join("\n") }] };
  }

  const chapters = breakIdx.map((idx, k) => {
    const title = lines[idx].replace(/^#{1,2}\s+/, "").trim();
    const end = breakIdx[k + 1] ?? lines.length;
    const raw = lines.slice(idx + 1, end).join("\n");
    return { title: title || `Capítulo ${k + 1}`, raw };
  });
  return { suggestedTitle, chapters };
}

// Texto plano: busca líneas tipo "Capítulo 3", "CAPÍTULO III", "Chapter 3: ...".
// Si no encuentra ninguna, prueba con líneas cortas en mayúsculas rodeadas de
// blancos (heurística más débil, solo como último recurso). Si tampoco, todo
// el archivo es un único capítulo.
function splitPlainText(text) {
  const lines = text.split("\n");
  const CHAPTER_RE = /^\s*(cap[ií]tulo|chapter)\s+([0-9]+|[ivxlcdm]+)\b[:.\-–—]?\s*(.*)$/i;

  const matches = [];
  lines.forEach((l, i) => { if (CHAPTER_RE.test(l)) matches.push(i); });

  if (matches.length > 0) {
    const chapters = matches.map((idx, k) => {
      const m = CHAPTER_RE.exec(lines[idx]);
      const trailingTitle = m[3]?.trim();
      const title = trailingTitle || `Capítulo ${k + 1}`;
      const end = matches[k + 1] ?? lines.length;
      const raw = lines.slice(idx + 1, end).join("\n");
      return { title, raw };
    });
    return { suggestedTitle: null, chapters };
  }

  // Heurística débil: línea corta, TODO EN MAYÚSCULAS, con blanco antes y
  // después — patrón típico de un título de capítulo suelto sin la palabra
  // "Capítulo". Se usa solo si no hubo ningún match del patrón fuerte de
  // arriba, para no confundir un simple grito en mayúsculas dentro de un
  // párrafo con un título.
  const looksLikeTitle = (l, prev, next) =>
    l.trim().length > 0 && l.trim().length <= 60 &&
    l.trim() === l.trim().toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(l) &&
    (prev === undefined || prev.trim() === "") && (next === undefined || next.trim() === "");

  const weakMatches = [];
  lines.forEach((l, i) => {
    if (looksLikeTitle(l, lines[i - 1], lines[i + 1])) weakMatches.push(i);
  });

  if (weakMatches.length > 1) {
    const chapters = weakMatches.map((idx, k) => {
      const end = weakMatches[k + 1] ?? lines.length;
      const raw = lines.slice(idx + 1, end).join("\n");
      return { title: lines[idx].trim(), raw };
    });
    return { suggestedTitle: null, chapters };
  }

  return { suggestedTitle: null, chapters: [{ title: "Capítulo 1", raw: text }] };
}

export function parseImportedText(rawText, filename = "", { preserveLineBreaks = false } = {}) {
  const text = rawText.replace(/\r\n?/g, "\n");
  const isMarkdown = /\.md$/i.test(filename) || /^#{1,2}\s+/m.test(text);

  const { suggestedTitle: parsedTitle, chapters: rawChapters } = isMarkdown
    ? splitMarkdown(text)
    : splitPlainText(text);

  const fallbackTitle = filename.replace(/\.(txt|md)$/i, "").replace(/[_-]+/g, " ").trim();

  const chapters = rawChapters.map(ch => {
    const html = paragraphsToHtml(ch.raw, { markdown: isMarkdown, preserveLineBreaks });
    return { title: ch.title, html, wordCount: countWordsPlain(ch.raw) };
  }).filter(ch => ch.html.trim() || ch.title); // descarta capítulos totalmente vacíos generados por líneas sueltas

  return {
    suggestedTitle: parsedTitle || fallbackTitle || "Libro importado",
    isMarkdown,
    chapters: chapters.length ? chapters : [{ title: "Capítulo 1", html: "", wordCount: 0 }],
  };
}
