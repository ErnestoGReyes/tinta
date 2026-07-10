import { useState, useEffect, useRef } from "react";
import { RADIUS } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";
import { Modal, Btn } from "./common";
import { supabase } from "../lib/supabase";
import { formatRelativeDate, countWords } from "../utils/literary";
import { exportBookToPDF, pdfPageSizeOptions } from "../utils/pdfExport";
import { parseImportedText } from "../utils/importText";

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

// Importar un libro desde .txt/.md — el parseo en sí vive en
// utils/importText.js; acá solo manejamos el flujo de UI: elegir archivo,
// mostrar una vista previa EDITABLE (título, tipo, título de cada capítulo
// detectado) y recién ahí confirmar. Si el parser se equivoca separando
// capítulos, la persona lo nota acá mismo, antes de que exista ningún dato
// en Supabase — corregir un título mal detectado es un click, no un reimport.
export function ImportBookModal({ open, onClose, onImport }) {
  const C = useTheme();
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [rawText, setRawText] = useState(null);
  const [preserveLineBreaks, setPreserveLineBreaks] = useState(false);
  const [parsed, setParsed] = useState(null); // { suggestedTitle, isMarkdown, chapters }
  const [title, setTitle] = useState("");
  const [type, setType] = useState("novela");
  const [importing, setImporting] = useState(false);

  const types = [
    { id:"novela", label:"Novela" }, { id:"cuento", label:"Cuento" },
    { id:"poesia", label:"Poesía" }, { id:"ensayo", label:"Ensayo" },
  ];

  const reset = () => {
    setFileName(""); setRawText(null); setParsed(null);
    setTitle(""); setType("novela"); setPreserveLineBreaks(false); setImporting(false);
  };
  useEffect(() => { if (!open) reset(); }, [open]);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setRawText(text);
      const result = parseImportedText(text, file.name, { preserveLineBreaks });
      setParsed(result);
      setTitle(result.suggestedTitle);
    };
    reader.readAsText(file);
  };

  // Si la persona togglea "preservar saltos de línea" (útil para poesía) con
  // el archivo ya cargado, re-parseamos con la nueva opción en vez de pedirle
  // que vuelva a elegir el archivo.
  useEffect(() => {
    if (rawText !== null) {
      const result = parseImportedText(rawText, fileName, { preserveLineBreaks });
      setParsed(result);
      setTitle(t => t || result.suggestedTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preserveLineBreaks]);

  const updateChapterTitle = (i, newTitle) => {
    setParsed(p => ({ ...p, chapters: p.chapters.map((c, idx) => idx===i ? { ...c, title:newTitle } : c) }));
  };

  const confirm = async () => {
    if (!parsed || !title.trim()) return;
    setImporting(true);
    try {
      await onImport(title.trim(), type, parsed.chapters);
      onClose();
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Importar libro" width={460}>
      {!parsed ? (
        <div>
          <div style={{fontSize:12.5, color:C.textMuted, marginBottom:16, lineHeight:1.6}}>
            Subí un archivo <b>.txt</b> o <b>.md</b>. Si tiene encabezados Markdown
            (<code>#</code>, <code>##</code>) o líneas tipo "Capítulo 1", los capítulos
            se detectan solos — igual vas a poder revisarlos y corregirlos antes de importar.
          </div>
          <input ref={fileRef} type="file" accept=".txt,.md,text/plain,text/markdown"
            onChange={e=>handleFile(e.target.files?.[0])} style={{display:"none"}}/>
          <button onClick={()=>fileRef.current?.click()} style={{
            width:"100%", padding:"32px 16px", borderRadius:RADIUS.md, cursor:"pointer",
            border:`1.5px dashed ${C.borderBright}`, background:C.bgCard, color:C.textMuted,
            display:"flex", flexDirection:"column", alignItems:"center", gap:8, fontFamily:"inherit"}}>
            <Icons.Export style={{width:20, height:20, transform:"rotate(180deg)"}}/>
            <span style={{fontSize:13}}>Elegir archivo…</span>
          </button>
        </div>
      ) : (
        <div>
          <div style={{fontSize:11, color:C.textMuted, marginBottom:10}}>
            Archivo: {fileName} · {parsed.chapters.length} capítulo{parsed.chapters.length===1?"":"s"} detectado{parsed.chapters.length===1?"":"s"}
          </div>

          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título del libro"
            style={{width:"100%", background:C.bgCard, border:`1px solid ${C.borderBright}`,
              borderRadius:RADIUS.sm, padding:"11px 14px", color:C.textPrimary, fontSize:14,
              outline:"none", marginBottom:12, boxSizing:"border-box"}}/>

          <div style={{display:"flex", gap:6, marginBottom:12, flexWrap:"wrap"}}>
            {types.map(t => (
              <button key={t.id} onClick={()=>setType(t.id)} style={{
                padding:"6px 12px", borderRadius:RADIUS.pill, fontSize:12,
                background:type===t.id?C.accentGlow:"none",
                border:`1px solid ${type===t.id?C.accent:C.border}`,
                color:type===t.id?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit"}}>
                {t.label}
              </button>
            ))}
          </div>

          <label style={{display:"flex", alignItems:"center", gap:8, marginBottom:14, cursor:"pointer"}}>
            <input type="checkbox" checked={preserveLineBreaks} onChange={e=>setPreserveLineBreaks(e.target.checked)}
              style={{width:14, height:14, accentColor:C.accent, cursor:"pointer"}}/>
            <span style={{fontSize:12.5, color:C.textSec}}>Preservar saltos de línea dentro de cada párrafo (ideal para poesía)</span>
          </label>

          <div style={{fontSize:10.5, color:C.textMuted, textTransform:"uppercase", letterSpacing:.4, marginBottom:8}}>
            Capítulos detectados
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:6, maxHeight:220, overflowY:"auto", marginBottom:16}}>
            {parsed.chapters.map((ch, i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:8,
                background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm, padding:"8px 10px"}}>
                <span style={{fontSize:11, color:C.textFaint, flexShrink:0, width:18, textAlign:"right"}}>{i+1}.</span>
                <input value={ch.title} onChange={e=>updateChapterTitle(i, e.target.value)}
                  style={{flex:1, minWidth:0, background:"none", border:"none", outline:"none",
                    color:C.textPrimary, fontSize:12.5, fontWeight:500}}/>
                <span style={{fontSize:10.5, color:C.textFaint, flexShrink:0}}>{ch.wordCount} palabras</span>
              </div>
            ))}
          </div>

          <div style={{display:"flex", gap:8}}>
            <Btn variant="outline" onClick={reset} style={{flex:1, justifyContent:"center"}}>Elegir otro archivo</Btn>
            <Btn variant="primary" disabled={!title.trim() || importing} onClick={confirm} style={{flex:1, justifyContent:"center"}}>
              {importing ? "Importando…" : `Importar ${parsed.chapters.length} capítulo${parsed.chapters.length===1?"":"s"}`}
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}


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
// El PDF "de verdad" (tipografía de imprenta, portada, índice, numeración de
// página vía el propio motor de impresión del navegador) vive en
// utils/pdfExport.js — ver ese archivo para el porqué de ese enfoque.
export function ExportModal({ open, onClose, book, chapters }) {
  const C = useTheme();
  const [format, setFormat] = useState("md");
  const [author, setAuthor] = useState("");
  const [includeTOC, setIncludeTOC] = useState(true);
  const [pageSize, setPageSize] = useState("book");
  const [generating, setGenerating] = useState(false);

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

  const generatePdf = async () => {
    setGenerating(true);
    try {
      await exportBookToPDF(book, chapters, { author: author.trim(), includeTOC, pageSize });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Exportar libro" width={420}>
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
      <Btn variant="primary" onClick={download} style={{width:"100%", justifyContent:"center", marginBottom:20}}>
        <Icons.Export style={{width:14,height:14}}/> Descargar {format}
      </Btn>

      <div style={{height:1, background:C.border, margin:"0 0 16px"}}/>

      <div style={{fontSize:11, color:C.textMuted, textTransform:"uppercase", letterSpacing:.4, marginBottom:10}}>
        PDF con formato de libro
      </div>

      <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Nombre del autor (opcional)"
        style={{width:"100%", background:C.bgCard, border:`1px solid ${C.border}`,
          borderRadius:RADIUS.sm, padding:"9px 12px", color:C.textPrimary, fontSize:13,
          outline:"none", marginBottom:10, boxSizing:"border-box"}}/>

      <div style={{display:"flex", gap:6, marginBottom:10}}>
        {pdfPageSizeOptions().map(p => (
          <button key={p.id} onClick={()=>setPageSize(p.id)} style={{
            flex:1, padding:"7px 8px", borderRadius:RADIUS.sm, fontSize:11.5,
            background:pageSize===p.id?C.accentGlow:"none",
            border:`1px solid ${pageSize===p.id?C.accent:C.border}`,
            color:pageSize===p.id?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit"}}>
            {p.label}
          </button>
        ))}
      </div>

      <label style={{display:"flex", alignItems:"center", gap:8, marginBottom:16, cursor:"pointer"}}>
        <input type="checkbox" checked={includeTOC} onChange={e=>setIncludeTOC(e.target.checked)}
          style={{width:14, height:14, accentColor:C.accent, cursor:"pointer"}}/>
        <span style={{fontSize:12.5, color:C.textSec}}>Incluir índice</span>
      </label>

      <Btn variant="outline" onClick={generatePdf} disabled={generating} style={{width:"100%", justifyContent:"center"}}>
        <Icons.PDF style={{width:14,height:14}}/> {generating ? "Generando…" : "Generar PDF"}
      </Btn>
      <div style={{fontSize:10.5, color:C.textFaint, marginTop:8, lineHeight:1.5}}>
        Se abre en una pestaña nueva con el diálogo de impresión — elegí "Guardar como PDF" como destino.
      </div>
    </Modal>
  );
}
