import { useEffect } from "react";
import { RADIUS, SHADOW, FONT_DISPLAY, hexToRgb } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";

export function Btn({ onClick, children, style={}, title, variant="ghost", disabled=false }) {
  const C = useTheme();
  const base = {
    border:"none", borderRadius:RADIUS.sm, fontSize:12, fontWeight:600,
    display:"flex", alignItems:"center", gap:5,
    transition:"color .16s cubic-bezier(.16,1,.3,1), background-color .16s cubic-bezier(.16,1,.3,1), border-color .16s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, transform .12s ease, opacity .16s ease",
    opacity:disabled?.5:1, cursor:disabled?"not-allowed":"pointer", ...style,
  };
  const variants = {
    ghost:   { background:"none", color:C.textSec, padding:"5px 8px" },
    primary: { background:C.accent, color:C.white, padding:"6px 14px" },
    outline: { background:"none", border:`1px solid ${C.borderBright}`, color:C.textSec, padding:"5px 12px" },
    danger:  { background:"rgba(240,96,96,.12)", color:C.red, padding:"5px 10px", border:`1px solid rgba(240,96,96,.25)` },
    warm:    { background:`rgba(${hexToRgb(C.accentWarm)},.15)`, color:C.accentWarm, padding:"6px 14px" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} title={title} disabled={disabled}
      style={{...base, ...variants[variant]}}
      onMouseEnter={e=>{if(!disabled){
        if(variant==="ghost"){e.currentTarget.style.color=C.textPrimary;e.currentTarget.style.background=C.bgCard}
        else if(variant==="primary"){e.currentTarget.style.boxShadow=`0 2px 14px ${C.accent}50`;e.currentTarget.style.transform="translateY(-1px)"}
        else if(variant==="outline"){e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;e.currentTarget.style.boxShadow=`0 0 0 1px ${C.accent}25`}
        else if(variant==="warm"){e.currentTarget.style.boxShadow=`0 2px 12px ${C.accentWarm}40`}
      }}}
      onMouseLeave={e=>{if(!disabled){
        if(variant==="ghost"){e.currentTarget.style.color=C.textSec;e.currentTarget.style.background="none"}
        else if(variant==="primary"){e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}
        else if(variant==="outline"){e.currentTarget.style.borderColor=C.borderBright;e.currentTarget.style.color=C.textSec;e.currentTarget.style.boxShadow="none"}
        else if(variant==="warm"){e.currentTarget.style.boxShadow="none"}
      }}}
      onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform="scale(.96)"}}
      onMouseUp={e=>{if(!disabled)e.currentTarget.style.transform=variant==="primary"?"translateY(-1px)":"none"}}
    >{children}</button>
  );
}

export function Modal({ open, onClose, title, children, width=420 }) {
  const C = useTheme();
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay-in" onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.65)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16,
    }}>
      <div className="modal-in" onClick={e=>e.stopPropagation()} style={{
        background:C.bgPanel, border:`1px solid ${C.borderBright}`, borderRadius:RADIUS.lg,
        width:"100%", maxWidth:width, maxHeight:"90dvh",
        display:"flex", flexDirection:"column",
        boxShadow:SHADOW.modal(C.shadow),
      }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:`1px solid ${C.border}`, flexShrink:0}}>
          <span style={{fontFamily:FONT_DISPLAY, fontWeight:600, fontSize:17, color:C.textPrimary}}>{title}</span>
          <Btn onClick={onClose} style={{padding:"5px 7px", color:C.textMuted}}><Icons.Close/></Btn>
        </div>
        <div style={{padding:20, overflowY:"auto", flex:1, minHeight:0}}>{children}</div>
      </div>
    </div>
  );
}
