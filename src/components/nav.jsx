import { RADIUS, hexToRgb } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";
import { PaletteIcon } from "./ThemeSelector";

// Logo compartido entre el sidebar de escritorio y el header móvil — a
// diferencia de Plano (que lo repetía inline en cada lugar), acá vive en un
// solo componente. Mantiene la "gramática" visual de Plano (tarjeta
// redondeada + texto monospace) pero cambia la perforación de tira de
// película por una pluma con una gota de tinta que pulsa, aludiendo a
// escritura en vez de cine.
export function TintaLogo({ size = 40 }) {
  const w = size * 1.3;
  return (
    <svg width={w} height={size} viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="40" rx="7" fill="#0B0E16" stroke="#2C3654" strokeWidth="0.75"/>
      <path d="M18 24 L34 10 L38 14 L22 28 Z" fill="#5C7CFA"/>
      <path d="M15 28 L18 24 L22 28 L16 34 Z" fill="#3C56C9"/>
      <circle cx="36.5" cy="12.5" r="2.2" fill="#7C94FF">
        <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite"/>
      </circle>
      <text x="26" y="35" fontFamily="'Courier Prime','Courier New',monospace" fontSize="8.5" fontWeight="700"
        fill="#E4E6F0" textAnchor="middle" letterSpacing="2.5">TINTA</text>
    </svg>
  );
}

export function NavSidebar({ tab, onTab, saving, saveError, isDark, onToggleTheme, onOpenThemeSelector, onSignOut, userEmail, onHelp, onOnboarding }) {
  const C = useTheme();
  const items = [
    {id:"editor",     Icon:Icons.Editor,     label:"Editor"},
    {id:"chapters",   Icon:Icons.Board,      label:"Capítulos"},
    {id:"characters", Icon:Icons.Characters, label:"Personas"},
    {id:"timeline",   Icon:Icons.Timeline,   label:"Cronología"},
    {id:"world",      Icon:Icons.Map,        label:"Mundo"},
    {id:"notes",      Icon:Icons.Notes,      label:"Notas"},
    {id:"goals",      Icon:Icons.Goal,       label:"Objetivos"},
    {id:"search",     Icon:Icons.Search,     label:"Buscar"},
    {id:"books",      Icon:Icons.Books,      label:"Libros"},
  ];
  return (
    <div style={{
      width:64, background:C.bgSidebar, borderRight:`1px solid ${C.border}`,
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"12px 6px", gap:2, flexShrink:0, height:"100dvh",
      transition:"background .25s,border-color .25s",
    }}>
      <div className="flicker" style={{marginBottom:8, flexShrink:0, cursor:"default"}} title="Tinta — escritura literaria">
        <TintaLogo size={40}/>
      </div>

      {items.map(it => (
        <button key={it.id} className={`icon-nav-btn${tab===it.id?" active":""}`}
          onClick={() => onTab(it.id)} title={it.label}>
          <it.Icon/>
          <span style={{fontSize:8.5}}>{it.label}</span>
        </button>
      ))}

      <div style={{flex:1}}/>

      <button onClick={onHelp} title="Guía de Tinta"
        style={{padding:"8px", borderRadius:RADIUS.sm, border:"none", background:"none",
          color:C.textMuted, cursor:"pointer", transition:"color .15s, background .15s",
          display:"flex", alignItems:"center", justifyContent:"center", width:"100%"}}
        onMouseEnter={e=>{e.currentTarget.style.color=C.accent;e.currentTarget.style.background=C.accentGlow}}
        onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.background="none"}}>
        <Icons.Help/>
      </button>

      <button onClick={onOnboarding} title="Ver introducción"
        style={{padding:"6px", borderRadius:RADIUS.sm, border:"none", background:"none",
          color:C.textFaint, cursor:"pointer", transition:"color .15s, background .15s",
          display:"flex", alignItems:"center", justifyContent:"center", width:"100%",
          fontSize:13}}
        onMouseEnter={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.background=C.bgCard}}
        onMouseLeave={e=>{e.currentTarget.style.color=C.textFaint;e.currentTarget.style.background="none"}}>
        ✦
      </button>

      <button onClick={onOpenThemeSelector} title="Elegir tema"
        style={{padding:"8px", borderRadius:RADIUS.sm, border:"none", background:"none",
          color:C.textMuted, cursor:"pointer", transition:"color .15s, background .15s",
          display:"flex", alignItems:"center", justifyContent:"center", width:"100%"}}
        onMouseEnter={e=>{e.currentTarget.style.color=C.textSec;e.currentTarget.style.background=C.bgCard}}
        onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.background="none"}}>
        <PaletteIcon/>
      </button>

      <button onClick={onToggleTheme} title={isDark ? "Modo día" : "Modo noche"}
        style={{padding:"8px", borderRadius:RADIUS.sm, border:"none", background:"none",
          color:C.textMuted, cursor:"pointer", transition:"color .15s, background .15s",
          display:"flex", alignItems:"center", justifyContent:"center", width:"100%"}}
        onMouseEnter={e=>{e.currentTarget.style.color=C.textSec;e.currentTarget.style.background=C.bgCard}}
        onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.background="none"}}>
        {isDark ? <Icons.Sun/> : <Icons.Moon/>}
      </button>

      <button onClick={onSignOut} title={`Cerrar sesión (${userEmail})`}
        style={{padding:"7px", borderRadius:RADIUS.sm, border:"none", background:"none",
          cursor:"pointer", transition:"background .15s", width:"100%",
          display:"flex", alignItems:"center", justifyContent:"center"}}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(240,96,96,.1)"}
        onMouseLeave={e=>e.currentTarget.style.background="none"}>
        <div style={{
          width:26, height:26, borderRadius:"50%",
          background:`rgba(${hexToRgb(C.accent)},.18)`,
          border:`1px solid rgba(${hexToRgb(C.accent)},.3)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:10, fontWeight:700, color:C.accent, letterSpacing:0,
        }}>
          {(userEmail||"?")[0].toUpperCase()}
        </div>
      </button>

      {saveError && <div title="Sin conexión — tus cambios están a salvo localmente y se sincronizarán solos" style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"4px 0", color:C.red}}>
        <Icons.Saving/>
      </div>}
      {!saveError && saving && <div className="saving" style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"4px 0", color:C.textMuted}}>
        <Icons.Saving/>
      </div>}
    </div>
  );
}

export function MobileBottomNav({ tab, onTab, isDark, onOpenThemeSelector, onHelp }) {
  const C = useTheme();
  const items = [
    {id:"editor",     Icon:Icons.Editor,     label:"Editor"},
    {id:"chapters",   Icon:Icons.Board,      label:"Capítulos"},
    {id:"characters", Icon:Icons.Characters, label:"Personas"},
    {id:"notes",      Icon:Icons.Notes,      label:"Notas"},
    {id:"books",      Icon:Icons.Books,      label:"Libros"},
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:C.bgSidebar, borderTop:`1px solid ${C.border}`,
      display:"flex", zIndex:100,
      paddingBottom:"env(safe-area-inset-bottom, 0px)",
    }}>
      {items.map(it => (
        <button key={it.id} className={`mobile-nav-btn${tab===it.id?" active":""}`}
          onClick={() => onTab(it.id)}>
          <it.Icon style={{width:20,height:20}}/>
          <span style={{fontSize:8.5}}>{it.label}</span>
        </button>
      ))}
      <button onClick={onOpenThemeSelector} className="mobile-nav-btn" title="Tema">
        {isDark ? <Icons.Sun style={{width:20,height:20}}/> : <Icons.Moon style={{width:20,height:20}}/>}
        <span style={{fontSize:8.5}}>Tema</span>
      </button>
    </div>
  );
}

export function MobileEditorHeader({ bookTitle, chapterTitle, words, pages, saving,
  canUndo, canRedo, onUndo, onRedo, onExport, focusMode, onFocusMode }) {
  const C = useTheme();
  return (
    <div style={{flexShrink:0, background:C.bgPanel, borderBottom:`1px solid ${C.border}`,
      paddingTop:"env(safe-area-inset-top, 0px)"}}>
      <div style={{display:"flex", alignItems:"center", padding:"10px 14px", gap:8}}>
        <div style={{flexShrink:0}}><TintaLogo size={26}/></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:15, fontWeight:600, color:C.textPrimary,
            fontFamily:"'Inter',system-ui,sans-serif", overflow:"hidden",
            textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{chapterTitle || "Sin capítulo"}</div>
          <div style={{fontSize:10, color:C.textMuted, marginTop:1}}>
            {bookTitle} · {words} palabras · ~{pages} pág
            {saving && <span className="saving" style={{marginLeft:6}}>· Guardando…</span>}
          </div>
        </div>
        <button onClick={onUndo} disabled={!canUndo} style={{background:"none",border:"none",color:C.textMuted,padding:6,opacity:canUndo?1:.4}}><Icons.Undo/></button>
        <button onClick={onRedo} disabled={!canRedo} style={{background:"none",border:"none",color:C.textMuted,padding:6,opacity:canRedo?1:.4}}><Icons.Redo/></button>
        <button onClick={onFocusMode} style={{background:"none",border:"none",
          color:focusMode?C.accent:C.textMuted,cursor:"pointer",padding:6}}>
          <Icons.Focus/>
        </button>
        <button onClick={onExport} style={{background:"none",border:`1px solid ${C.borderBright}`,
          borderRadius:RADIUS.sm,color:C.textSec,cursor:"pointer",padding:"6px 8px"}}>
          <Icons.Export/>
        </button>
      </div>
    </div>
  );
}
