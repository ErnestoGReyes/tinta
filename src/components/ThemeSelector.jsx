import { RADIUS, FONT_DISPLAY, getThemeList } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Modal, Btn } from "./common";

function CheckIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ThemeCard({ theme, active, isDark, onSelect }) {
  const C = useTheme();
  const preview = isDark ? theme.dark : theme.light;
  return (
    <button onClick={() => onSelect(theme.id)} style={{
      display:"flex", alignItems:"center", gap:12, width:"100%",
      padding:"10px 12px", borderRadius:RADIUS.md, cursor:"pointer",
      textAlign:"left", fontFamily:"inherit",
      background: active ? C.accentGlow : "none",
      border: `1px solid ${active ? theme.swatch + "80" : C.border}`,
      transition:"background .15s, border-color .15s",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bgCard; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}
    >
      <div style={{
        width:36, height:36, borderRadius:RADIUS.sm, flexShrink:0, position:"relative",
        background: preview.bgApp, border:`1px solid ${preview.border}`, overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", right:-6, bottom:-6, width:22, height:22, borderRadius:"50%",
          background: preview.accent, boxShadow:`0 0 0 2px ${preview.bgApp}`,
        }}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{theme.label}</div>
        <div style={{ fontSize:10.5, color:C.textMuted, marginTop:1 }}>
          {isDark ? "Vista modo noche" : "Vista modo día"}
        </div>
      </div>
      {active && (
        <div style={{
          width:22, height:22, borderRadius:"50%", flexShrink:0,
          background:C.accent, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <CheckIcon color={C.white}/>
        </div>
      )}
    </button>
  );
}

export function ThemeSelectorModal({ open, onClose, themeId, onSelectTheme, isDark, onToggleMode }) {
  const C = useTheme();
  const themes = getThemeList();

  return (
    <Modal open={open} onClose={onClose} title="Elegí un tema" width={420}>
      <div style={{ marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, color:C.textMuted }}>
          Cada tema tiene su versión día y noche.
        </span>
        <Btn variant="outline" onClick={onToggleMode} style={{ fontSize:11, padding:"4px 10px" }}>
          {isDark ? "Ver modo día" : "Ver modo noche"}
        </Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            active={theme.id === themeId}
            isDark={isDark}
            onSelect={onSelectTheme}
          />
        ))}
      </div>
    </Modal>
  );
}

export function PaletteIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.3c1.5 0 2.7-1.2 2.7-2.7C20 7 16.4 2 12 2z"/>
      <circle cx="7" cy="10" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="6.5" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="15.5" cy="8" r="1.4" fill="currentColor" stroke="none"/>
    </svg>
  );
}
