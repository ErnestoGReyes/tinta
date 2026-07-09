import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

export function makeGlobalCss(C) { return `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;background:${C.bgApp};color:${C.textPrimary};font-family:'Inter',system-ui,sans-serif}
  #root{position:relative; isolation:isolate}

  #root::before{
    content:"";
    position:fixed; inset:0; z-index:-2; pointer-events:none;
    background:
      radial-gradient(ellipse 1100px 700px at 15% -8%, ${C.accent}14, transparent 60%),
      radial-gradient(ellipse 900px 650px at 100% 105%, ${C.accentWarm}0d, transparent 62%);
  }

  ::-webkit-scrollbar{width:12px;height:12px}
  ::-webkit-scrollbar-track{background:rgba(128,128,128,.08)}
  ::-webkit-scrollbar-thumb{background:rgba(140,148,175,.55);border-radius:6px;border:2px solid transparent;background-clip:padding-box;min-height:44px}
  ::-webkit-scrollbar-thumb:hover{background:${C.accent};background-clip:padding-box}
  * { scrollbar-width: auto; scrollbar-color: rgba(140,148,175,.55) rgba(128,128,128,.08); }

  textarea:focus,input:focus{outline:none}
  textarea:focus-visible,input:focus-visible,button:focus-visible,a:focus-visible,[tabindex]:focus-visible{
    outline:2px solid ${C.accent};
    outline-offset:2px;
    border-radius:4px;
  }
  button{cursor:pointer;font-family:inherit}
  input,textarea{font-family:inherit}
  mark{background:${C.accentGlow};color:${C.accent};border-radius:2px;padding:0 1px}

  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .fade-in{animation:fadeIn .22s cubic-bezier(.16,1,.3,1)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes savePulse{0%{transform:scale(1.6);opacity:0}60%{opacity:1}100%{transform:scale(1);opacity:1}}
  .save-pulse{animation:savePulse .4s cubic-bezier(.34,1.56,.64,1)}
  .saving{animation:pulse 1.2s infinite}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .slide-up{animation:slideUp .3s cubic-bezier(.16,1,.3,1)}
  @keyframes overlay-in{from{opacity:0}to{opacity:1}}
  .overlay-in{animation:overlay-in .18s ease}
  @keyframes modalIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
  .modal-in{animation:modalIn .22s cubic-bezier(.16,1,.3,1)}
  @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
  .slide-right{animation:slideInRight .28s cubic-bezier(.16,1,.3,1)}
  @keyframes flicker{0%,100%{opacity:1}45%{opacity:.85}55%{opacity:1}}
  .flicker{animation:flicker 4s ease-in-out infinite}

  @keyframes emptyFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .spinner{animation:spin .9s linear infinite}
  .empty-float{animation:emptyFloat 3.5s ease-in-out infinite}

  .icon-nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 4px;
    border:none;background:none;color:${C.textMuted};font-size:9px;font-weight:600;
    letter-spacing:.5px;text-transform:uppercase;transition:color .18s cubic-bezier(.16,1,.3,1),background .18s cubic-bezier(.16,1,.3,1),transform .15s ease;
    border-radius:8px;width:100%;cursor:pointer}
  .icon-nav-btn:hover{color:${C.textSec};background:${C.bgCard};transform:translateY(-1px)}
  .icon-nav-btn.active{color:${C.accent};background:${C.accentGlow};box-shadow:inset 0 0 0 1px ${C.accent}30}
  .icon-nav-btn:active{transform:translateY(0) scale(.96)}

  .mobile-nav-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
    flex:1;padding:6px 2px 8px;border:none;background:none;cursor:pointer;transition:color .18s ease,transform .12s ease;
    font-size:9px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;
    color:${C.textMuted};min-height:52px}
  .mobile-nav-btn.active{color:${C.accent}}
  .mobile-nav-btn:active{opacity:.7;transform:scale(.94)}

  button{-webkit-tap-highlight-color:transparent}
  textarea{-webkit-tap-highlight-color:transparent}

  button, input, textarea, a { transition: background-color .18s cubic-bezier(.16,1,.3,1), border-color .18s cubic-bezier(.16,1,.3,1), color .18s cubic-bezier(.16,1,.3,1), opacity .18s ease, box-shadow .2s ease, transform .12s ease; }

  @media print {
    body * { visibility: hidden; }
    #tinta-print-area, #tinta-print-area * { visibility: visible; }
    #tinta-print-area { position: absolute; inset: 0; }
  }
`; }

export function InjectStyles() {
  const C = useTheme();
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "tinta-global-styles";
    el.textContent = makeGlobalCss(C);
    document.head.appendChild(el);
    document.title = "Tinta";

    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="#0B0E16"/>
      <path d="M20 6 L24 10 L12 22 L7 23 L8 18 Z" fill="#5C7CFA"/>
      <circle cx="23.5" cy="9.5" r="1.6" fill="#7C94FF"/>
    </svg>`;
    const faviconUrl = "data:image/svg+xml," + encodeURIComponent(faviconSvg);
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = faviconUrl;

    return () => document.head.removeChild(el);
  }, []);
  useEffect(() => {
    const el = document.getElementById("tinta-global-styles");
    if (el) el.textContent = makeGlobalCss(C);
  }, [C]);
  return null;
}
