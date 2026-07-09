export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function estimatePages(words) {
  return Math.max(1, Math.round(words / 275));
}

export function estimateReadingMinutes(words) {
  return Math.max(1, Math.round(words / 200));
}

export function excerpt(text, n = 140) {
  const t = (text || "").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export function formatRelativeDate(dt) {
  const d = new Date(dt);
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return "Ahora mismo";
  if (diff < 60) return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString("es-UY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
