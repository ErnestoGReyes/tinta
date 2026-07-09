import { useState, useEffect } from "react";
import { RADIUS } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";
import { Modal, Btn } from "./common";
import { supabase } from "../lib/supabase";
import { formatRelativeDate, countWords } from "../utils/literary";

export function NewBookModal({ open, onClose, onCreate }) {
  const C = useTheme();
  const [name, setName] = useState("");
  const [type, setType] = useState("novela");
  const types = [
    { id:"novela", label:"Novela" }, { id:"cuento", label:"Cuento" },
    { id:"poesia", label:"Poesía" }, { id:"ensayo", label:"Ensayo" },
  ];
  useEffect(()=>{ if(open){ setName(""); setType("novela"); } }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Nuevo libro" width={380}>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Título del libro"
        onKeyDown={e=>{if(e.key==="Enter" && name.trim()){onCreate(name.trim(), type); onClose();}}}
        style={{width:"100%", background:C.bgCard, border:`1px solid ${C.borderBright}`,
          borderRadius:RADIUS.sm, padding:"11px 14px", color:C.textPrimary, fontSize:14,
          outline:"none", marginBottom:14, boxSizing:"border-box"}}/>
      <div style={{display:"flex", gap:6, marginBottom:20, flexWrap:"wrap"}}>
        {types.map(t => (
          <button key={t.id} onClick={()=>setType(t.id)} style={{
            padding:"7px 14px", borderRadius:RADIUS.pill, fontSize:12.5,
            background:type===t.id?C.accentGlow:"none",
            border:`1px solid ${type===t.id?C.accent:C.border}`,
            color:type===t.id?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit"}}>
            {t.label}
          </button>
        ))}
      </div>
      <Btn variant="primary" disabled={!name.trim()}
        onClick={()=>{onCreate(name.trim(), type); onClose();}}
        style={{width:"100%", justifyContent:"center", padding:"11px"}}>
        Crear libro
      </Btn>
    </Modal>
  );
}

// Historial de versiones de un capítulo — clon directo del patrón HistoryModal
// de Plano: trae snapshots de Supabase ordenados por fecha y permite
// restaurar uno como el contenido activo del capítulo.
export function ChapterVersionsModal({ open, onClose, chapterId, onRestore }) {
  const C = useTheme();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !chapterId) return;
    setLoading(true);
    supabase.from("chapter_versions").select("*").eq("chapter_id", chapterId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { if (!error) setVersions(data || []); setLoading(false); });
  }, [open, chapterId]);

  return (
    <Modal open={open} onClose={onClose} title="Historial de versiones" width={440}>
      {loading ? (
        <div style={{color:C.textFaint, fontSize:12.5, textAlign:"center", padding:20}}>Cargando…</div>
      ) : versions.length === 0 ? (
        <div style={{textAlign:"center", padding:"20px 10px"}}>
          <div style={{color:C.textFaint, marginBottom:8}}><Icons.History style={{width:22,height:22}}/></div>
          <div style={{color:C.textFaint, fontSize:12}}>
            Todavía no hay versiones guardadas. Se crea una automáticamente cada tanto mientras escribís.
          </div>
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {versions.map(v => {
            const words = countWords((v.snapshot || "").replace(/<[^>]+>/g, " "));
            return (
              <div key={v.id} style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm, padding:"10px 12px"}}>
                <div>
                  <div style={{fontSize:12.5, color:C.textPrimary, fontWeight:600}}>{v.label || "Versión automática"}</div>
                  <div style={{fontSize:10.5, color:C.textMuted, marginTop:2}}>{formatRelativeDate(v.created_at)} · {words} palabras</div>
                </div>
                <Btn variant="outline" onClick={()=>{onRestore(v.snapshot); onClose();}} style={{fontSize:11, padding:"5px 10px"}}>
                  <Icons.Restore style={{width:13,height:13}}/> Restaurar
                </Btn>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// Export simple, sin dependencias nuevas: genera un .md o .txt en el cliente.
// Un export a PDF "de verdad" (tipografía de imprenta, numeración, tapa) es un
// paso natural siguiente — se podría armar con una librería como jsPDF o
// mandando el HTML a una función de servidor que use Puppeteer.
export function ExportModal({ open, onClose, book, chapters }) {
  const C = useTheme();
  const [format, setFormat] = useState("md");

  const buildText = () => {
    const parts = [`# ${book?.title || "Sin título"}`, ""];
    chapters.forEach((ch, i) => {
      const plain = (ch.content || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "");
      parts.push(format === "md" ? `## ${i+1}. ${ch.title || "Sin título"}` : `${i+1}. ${ch.title || "Sin título"}`.toUpperCase());
      parts.push("");
      parts.push(plain.trim());
      parts.push("");
    });
    return parts.join("\n");
  };

  const download = () => {
    const text = buildText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(book?.title || "libro").replace(/\s+/g, "_")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const printPdf = () => {
    const w = window.open("", "_blank");
    const body = chapters.map((ch, i) =>
      `<h2>${i+1}. ${ch.title || "Sin título"}</h2>${ch.content || ""}`
    ).join("<hr/>");
    w.document.write(`<html><head><title>${book?.title || "Libro"}</title>
      <style>
        body{font-family:Georgia,serif;max-width:640px;margin:40px auto;line-height:1.7;color:#1a1510}
        h1{font-family:Georgia,serif} h2{margin-top:2.5em;font-size:1.3em} hr{border:none;border-top:1px solid #ddd;margin:2em 0}
      </style></head><body><h1>${book?.title || ""}</h1>${body}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Modal open={open} onClose={onClose} title="Exportar libro" width={400}>
      <div style={{fontSize:12.5, color:C.textMuted, marginBottom:14, lineHeight:1.6}}>
        Exportá {chapters.length} capítulo{chapters.length===1?"":"s"} de "{book?.title}".
      </div>
      <div style={{display:"flex", gap:6, marginBottom:16}}>
        {[{id:"md",label:"Markdown (.md)"},{id:"txt",label:"Texto plano (.txt)"}].map(f => (
          <button key={f.id} onClick={()=>setFormat(f.id)} style={{
            flex:1, padding:"8px 10px", borderRadius:RADIUS.sm, fontSize:12,
            background:format===f.id?C.accentGlow:"none",
            border:`1px solid ${format===f.id?C.accent:C.border}`,
            color:format===f.id?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit"}}>
            {f.label}
          </button>
        ))}
      </div>
      <Btn variant="primary" onClick={download} style={{width:"100%", justifyContent:"center", marginBottom:8}}>
        <Icons.Export style={{width:14,height:14}}/> Descargar
      </Btn>
      <Btn variant="outline" onClick={printPdf} style={{width:"100%", justifyContent:"center"}}>
        <Icons.PDF style={{width:14,height:14}}/> Imprimir / Guardar como PDF
      </Btn>
    </Modal>
  );
}
