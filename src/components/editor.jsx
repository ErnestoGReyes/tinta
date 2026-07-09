import { useRef, useEffect } from "react";
import { RADIUS, FONT_BODY, FONT_DISPLAY, hexToRgb } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";
import { Btn } from "./common";

// A diferencia del editor de Plano (bloques discretos tipados — escena,
// acción, diálogo…), acá el texto es un flujo continuo: un capítulo es un
// único bloque de prosa. Formato mínimo viable: negrita/cursiva vía
// document.execCommand sobre un <div contentEditable>, que sigue funcionando
// en todos los navegadores para estos dos comandos aunque esté deprecado para
// casos más complejos. Si más adelante querés un editor "de verdad" (Markdown,
// undo granular por selección, etc.) esto es el punto para migrar a algo como
// Tiptap/ProseMirror — se enchufa en el mismo lugar.
export function Toolbar({ chapterTitle, onTitleChange, saving, saveError,
  canUndo, canRedo, onUndo, onRedo, onFormat, onHistory, onExport,
  focusMode, onFocusMode, isMobile }) {
  const C = useTheme();
  if (isMobile) return null;

  return (
    <div style={{background:C.bgPanel, borderBottom:`1px solid ${C.border}`,
      padding:"0 16px", display:"flex", alignItems:"center", gap:4, flexShrink:0, height:50}}>
      <input value={chapterTitle} onChange={e=>onTitleChange(e.target.value)}
        placeholder="Título del capítulo"
        style={{background:"none", border:"none", outline:"none", color:C.textPrimary,
          fontFamily:FONT_DISPLAY, fontSize:17, fontWeight:600, flex:1, minWidth:0,
          maxWidth:320}}/>

      <div style={{width:1, height:22, background:C.border, margin:"0 8px"}}/>

      <Btn onClick={()=>onFormat("bold")} title="Negrita (Ctrl+B)" style={{padding:"5px 7px"}}><Icons.Bold/></Btn>
      <Btn onClick={()=>onFormat("italic")} title="Cursiva (Ctrl+I)" style={{padding:"5px 7px"}}><Icons.Italic/></Btn>

      <div style={{flex:1}}/>

      {saveError
        ? <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5, color:C.red, marginRight:4}}>
            <Icons.Saving/> Sin conexión
          </span>
        : saving && <span className="saving" style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5, color:C.textMuted, marginRight:4}}>
            <Icons.Saving/> Guardando
          </span>}

      <Btn onClick={onUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" style={{padding:"5px 7px"}}><Icons.Undo/></Btn>
      <Btn onClick={onRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)" style={{padding:"5px 7px"}}><Icons.Redo/></Btn>
      <Btn onClick={onFocusMode} title="Modo foco" style={{padding:"5px 7px", color:focusMode?C.accent:C.textMuted}}><Icons.Focus/></Btn>
      <Btn onClick={onHistory} title="Historial de versiones" style={{padding:"5px 7px", color:C.textMuted}}><Icons.History/></Btn>
      <Btn onClick={onExport} variant="outline" style={{gap:5, padding:"4px 10px", fontSize:12}}>
        <Icons.Export/> Exportar
      </Btn>
    </div>
  );
}

// El cuerpo del manuscrito: una columna centrada, ancha como una página de
// libro (no full-width), con tipografía serif y buen interlineado — pensado
// para escribir/leer prosa larga, no para chrome de UI.
// Pegar texto copiado de otro lado (Word, Notion, un .txt, la web) trae
// consigo el estilo de origen: color de letra, tipografía, tamaños, spans
// anidados. Eso puede dejar texto invisible (ej. negro sobre nuestro fondo
// oscuro) y confundir al cursor. Por eso interceptamos el paste, tomamos SOLO
// el texto plano del portapapeles y reconstruimos nosotros mismos el HTML
// (con <br> para los saltos de línea) — así lo pegado siempre hereda la
// tipografía y el color del editor, nunca el de origen.
function handlePaste(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text/plain");
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped.split(/\r\n|\r|\n/).join("<br>");
  document.execCommand("insertHTML", false, html);
}

export function ManuscriptEditor({ html, onChange, isMobile, focusMode }) {
  const C = useTheme();
  const ref = useRef(null);

  // Sincroniza el contenido guardado hacia el DOM cada vez que `html` cambia
  // por una razón externa al tipeo (montaje del capítulo, restaurar una
  // versión, deshacer/rehacer) — comparando directamente contra lo que el
  // DOM ya tiene, no contra un valor recordado de la última tecla. Mientras
  // el usuario tipea, el navegador ya actualizó el DOM antes de que este
  // efecto corra, así que `ref.current.innerHTML` y `html` ya coinciden y no
  // se pisa el cursor. La versión anterior comparaba contra una referencia
  // que arrancaba igual al valor inicial, así que al abrir un capítulo con
  // contenido guardado nunca llegaba a pintarlo en pantalla.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (html || "")) {
      ref.current.innerHTML = html || "";
    }
  }, [html]);

  return (
    <div style={{flex:1, overflowY:"auto", background:C.bgEditor}}>
      <div style={{
        maxWidth: focusMode ? 640 : 720, margin:"0 auto",
        padding: isMobile ? "24px 20px 80px" : "48px 40px 120px",
      }}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={e => onChange(e.currentTarget.innerHTML)}
          onPaste={handlePaste}
          data-placeholder="Había una vez…"
          style={{
            outline:"none", fontFamily:FONT_BODY, fontSize: isMobile ? 17 : 18,
            lineHeight:1.85, color:C.textPrimary, minHeight:"60vh",
            caretColor:C.accent,
          }}
        />
      </div>
      <style>{`
        [contenteditable][data-placeholder]:empty:before{
          content: attr(data-placeholder);
          color: ${C.textFaint};
        }
      `}</style>
    </div>
  );
}

export function applyFormat(command) {
  document.execCommand(command, false, null);
}
