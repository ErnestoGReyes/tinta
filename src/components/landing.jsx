import { useState } from "react";
import { RADIUS, FONT_DISPLAY } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";
import { Btn } from "./common";
import { TintaLogo } from "./nav";
import { supabase } from "../lib/supabase";

export function LandingPage({ isDark, onToggleTheme, onEnter }) {
  const C = useTheme();
  const features = [
    { Icon: Icons.Book,       title: "Novelas y cuentos",  desc: "Capítulos, partes y versiones de cada escena." },
    { Icon: Icons.Timeline,   title: "Cronologías",        desc: "Ordená los hechos de tu historia en una línea de tiempo." },
    { Icon: Icons.Characters, title: "Arcos de personajes",desc: "Seguí la evolución de cada personaje a lo largo del libro." },
    { Icon: Icons.Map,        title: "Mapas del mundo",    desc: "Anotá lugares y referencias de tu universo narrativo." },
  ];
  return (
    <div style={{minHeight:"100dvh", display:"flex", flexDirection:"column", background:C.bgApp}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 28px"}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <TintaLogo size={34}/>
        </div>
        <button onClick={onToggleTheme} style={{background:"none", border:`1px solid ${C.border}`,
          borderRadius:RADIUS.pill, padding:"6px 12px", color:C.textSec, cursor:"pointer",
          display:"flex", alignItems:"center", gap:6, fontSize:12}}>
          {isDark ? <Icons.Sun/> : <Icons.Moon/>} {isDark ? "Modo día" : "Modo noche"}
        </button>
      </div>

      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"20px 24px", textAlign:"center"}}>
        <div style={{marginBottom:20}}><TintaLogo size={64}/></div>
        <h1 style={{fontFamily:FONT_DISPLAY, fontSize:44, fontWeight:600, color:C.textPrimary,
          margin:"0 0 12px", maxWidth:600, lineHeight:1.15}}>
          Un espacio de escritura, sin distracciones
        </h1>
        <p style={{fontSize:15, color:C.textMuted, maxWidth:480, lineHeight:1.7, margin:"0 0 32px"}}>
          Novelas, cuentos, poesía y ensayos. Organizá capítulos, cronologías
          y arcos narrativos en un solo lugar, con autoguardado y control de versiones.
        </p>
        <Btn variant="primary" onClick={onEnter} style={{fontSize:14, padding:"12px 28px"}}>
          Empezar a escribir
        </Btn>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))",
        gap:1, borderTop:`1px solid ${C.border}`, background:C.border}}>
        {features.map(f => (
          <div key={f.title} style={{background:C.bgApp, padding:"28px 22px"}}>
            <f.Icon style={{width:20, height:20, color:C.accent, marginBottom:12}}/>
            <div style={{fontSize:14, fontWeight:600, color:C.textPrimary, marginBottom:4}}>{f.title}</div>
            <div style={{fontSize:12.5, color:C.textMuted, lineHeight:1.5}}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthScreen({ isDark, onToggleTheme }) {
  const C = useTheme();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const inputStyle = {
    width:"100%", background:C.bgCard, border:`1px solid ${C.borderBright}`,
    borderRadius:RADIUS.sm, padding:"11px 14px", color:C.textPrimary, fontSize:14,
    outline:"none", fontFamily:"inherit", boxSizing:"border-box", marginBottom:12,
  };

  async function submit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Cuenta creada. Si tu proyecto de Supabase pide confirmación por email, revisá tu casilla.");
      }
    } catch (err) {
      setError(err.message || "Algo salió mal. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100dvh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", background:C.bgApp, padding:24}}>
      <div style={{marginBottom:24}}><TintaLogo size={48}/></div>
      <form onSubmit={submit} style={{width:"100%", maxWidth:340, background:C.bgPanel,
        border:`1px solid ${C.border}`, borderRadius:RADIUS.lg, padding:28}}>
        <h2 style={{fontFamily:FONT_DISPLAY, fontSize:22, fontWeight:600, color:C.textPrimary, margin:"0 0 18px"}}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>
        <input type="email" required placeholder="Email" value={email}
          onChange={e=>setEmail(e.target.value)} style={inputStyle}/>
        <input type="password" required placeholder="Contraseña" value={password}
          onChange={e=>setPassword(e.target.value)} style={inputStyle} minLength={6}/>
        {error && <div style={{color:C.red, fontSize:12.5, marginBottom:12}}>{error}</div>}
        {info && <div style={{color:C.green, fontSize:12.5, marginBottom:12}}>{info}</div>}
        <Btn variant="primary" disabled={loading} style={{width:"100%", justifyContent:"center", padding:"11px"}}>
          {loading ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </Btn>
        <button type="button" onClick={()=>setMode(m=>m==="login"?"signup":"login")}
          style={{background:"none", border:"none", color:C.textMuted, fontSize:12.5,
            cursor:"pointer", marginTop:14, width:"100%", textAlign:"center"}}>
          {mode === "login" ? "¿No tenés cuenta? Creá una" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </form>
      <button onClick={onToggleTheme} style={{marginTop:20, background:"none", border:"none",
        color:C.textFaint, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:12}}>
        {isDark ? <Icons.Sun/> : <Icons.Moon/>} {isDark ? "Modo día" : "Modo noche"}
      </button>
    </div>
  );
}

export function WelcomeScreen({ onCreateBook, onImportClick }) {
  const C = useTheme();
  const [name, setName] = useState("");
  const [type, setType] = useState("novela");
  const types = [
    { id:"novela",  label:"Novela" },
    { id:"cuento",  label:"Cuento" },
    { id:"poesia",  label:"Poesía" },
    { id:"ensayo",  label:"Ensayo" },
  ];
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", background:C.bgEditor, padding:"40px 24px"}}>
      <div style={{marginBottom:24}}><TintaLogo size={56}/></div>
      <h1 style={{fontFamily:FONT_DISPLAY, fontSize:24, fontWeight:600, color:C.textPrimary,
        margin:"0 0 8px", textAlign:"center"}}>Empecemos tu primer libro</h1>
      <p style={{fontSize:13.5, color:C.textMuted, margin:"0 0 28px", textAlign:"center", maxWidth:340}}>
        Dale un título y elegí qué tipo de texto es. Podés cambiarlo después.
      </p>
      <div style={{width:"100%", maxWidth:340}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Título del libro"
          autoFocus onKeyDown={e=>{if(e.key==="Enter" && name.trim()) onCreateBook(name.trim(), type);}}
          style={{width:"100%", background:C.bgCard, border:`1px solid ${C.borderBright}`,
            borderRadius:RADIUS.sm, padding:"12px 14px", color:C.textPrimary, fontSize:14,
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
        <button onClick={()=>name.trim() && onCreateBook(name.trim(), type)}
          disabled={!name.trim()}
          style={{width:"100%", padding:"13px", borderRadius:RADIUS.md, border:"none",
            background:C.accent, color:C.white, fontSize:14, fontWeight:600,
            cursor:name.trim()?"pointer":"not-allowed", opacity:name.trim()?1:.5,
            fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icons.Plus style={{width:16,height:16}}/> Crear libro
        </button>
        {onImportClick && (
          <button onClick={onImportClick} style={{width:"100%", marginTop:14, background:"none",
            border:"none", color:C.textMuted, fontSize:12.5, cursor:"pointer", textAlign:"center",
            fontFamily:"inherit"}}>
            ¿Ya tenés algo escrito? Importar desde .txt o .md
          </button>
        )}
      </div>
    </div>
  );
}
