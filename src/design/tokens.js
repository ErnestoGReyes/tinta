// ═══════════════════════════════════════════════════════════════════════════
// ESCALA, RADIOS Y SOMBRAS
// ═══════════════════════════════════════════════════════════════════════════
export const RADIUS = { xs: 4, sm: 8, md: 12, lg: 16, pill: 20 };

export const FONT_SIZE = {
  xs: 10, sm: 11, base: 13, md: 14, lg: 17, xl: 24, display: 40,
};

// Tipografía: Cormorant Garamond para titulares editoriales (landing, estados
// vacíos), Lora para el cuerpo del manuscrito (serif pensada para lectura
// larga, distinta del monospace de Plano que imitaba una hoja de guion), Inter
// para el chrome funcional (botones, nav, metadata).
export const FONT_DISPLAY = "'Cormorant Garamond',serif";
export const FONT_BODY = "'Lora',Georgia,serif";
export const FONT_UI = "'Inter',system-ui,sans-serif";

export const shadowLayer = (a1, a2, tint = "18,12,4") =>
  `0 1px 2px rgba(${tint},${a1}), 0 6px 16px rgba(${tint},${a2})`;
export const SHADOW = {
  card: () => shadowLayer(0.32, 0.22),
  raised: () => shadowLayer(0.36, 0.28),
  modal: (base) => `0 24px 60px ${base}`,
};

// Paleta para distinguir personajes/arcos y eventos de cronología a simple
// vista — 10 matices bien separados en la rueda de color, con versión clara
// (fondo oscuro) y oscura-saturada (fondo claro) para buen contraste en los
// dos modos.
export const ARC_PALETTE_DARK = [
  "#C0A060", "#D67070", "#7CAE6E", "#A88CB0", "#D08850",
  "#7A96D0", "#5FA8A0", "#C87CA8", "#6FC0D0", "#A8A050",
];
export const ARC_PALETTE_LIGHT = [
  "#8B6820", "#803030", "#4A6830", "#604858", "#8A5020",
  "#3C5080", "#2C6058", "#78355C", "#2C6878", "#6B6020",
];

// ═══════════════════════════════════════════════════════════════════════════
// PALETAS DE TEMA — mismo registro que Plano, para que Tinta y Plano se
// sientan parte de la misma familia si alguien usa las dos.
// ═══════════════════════════════════════════════════════════════════════════
export const DARK = {
  bgApp:"#0A0909", bgSidebar:"#070706", bgEditor:"#0D0B0A", bgPanel:"#0A0909",
  bgCard:"#241E14", bgCardHover:"#342B1D", bgActive:"#453927",
  border:"#554630", borderBright:"#7C6646",
  accent:"#C0A060", accentGlow:"rgba(192,160,96,0.12)", accentWarm:"#D4B870",
  green:"#8AAE6E", purple:"#A88CB0", yellow:"#D4B060", red:"#D67070",
  textPrimary:"#E8E0D0", textSec:"#A69C8B", textMuted:"#7F7563", textFaint:"#4A4438",
  white:"#F0E8D8", shadow:"rgba(18,12,4,0.88)",
};
export const LIGHT = {
  bgApp:"#F2EDE4", bgSidebar:"#EBE4D8", bgEditor:"#F8F4EC", bgPanel:"#EDE6DA",
  bgCard:"#FAF8F4", bgCardHover:"#F5F1E8", bgActive:"#DCD3BC",
  border:"#C8B893", borderBright:"#947F4C",
  accent:"#8B6820", accentGlow:"rgba(139,104,32,0.10)", accentWarm:"#A07828",
  green:"#4A6830", purple:"#604858", yellow:"#987020", red:"#803030",
  textPrimary:"#1A1510", textSec:"#4A4030", textMuted:"#8A7860", textFaint:"#C8B898",
  white:"#F8F4EC", shadow:"rgba(60,45,20,0.18)",
};
export const VINTAGE_DARK = {
  bgApp:"#1C1712", bgSidebar:"#17130F", bgEditor:"#201A14", bgPanel:"#1C1712",
  bgCard:"#2E2620", bgCardHover:"#3D332A", bgActive:"#4A3D30",
  border:"#5A4C3C", borderBright:"#7A6650",
  accent:"#B5483D", accentGlow:"rgba(181,72,61,0.14)", accentWarm:"#D9B87E",
  green:"#7C9A5E", purple:"#8C7690", yellow:"#C9A15A", red:"#C25C4E",
  textPrimary:"#EDE0C8", textSec:"#B8A98C", textMuted:"#8C7F68", textFaint:"#544A3C",
  white:"#F5EAD2", shadow:"rgba(20,14,8,0.85)",
};
export const VINTAGE_LIGHT = {
  bgApp:"#F0E6D2", bgSidebar:"#E8DCC0", bgEditor:"#FAF3E3", bgPanel:"#ECE0C8",
  bgCard:"#FBF6EA", bgCardHover:"#F5EDDA", bgActive:"#E2D3AE",
  border:"#D0BE94", borderBright:"#B5A176",
  accent:"#A63D30", accentGlow:"rgba(166,61,48,0.10)", accentWarm:"#8A6A34",
  green:"#5C7A3E", purple:"#6B5670", yellow:"#8A6A20", red:"#8A3428",
  textPrimary:"#241C12", textSec:"#4A3D2A", textMuted:"#7A6A4E", textFaint:"#B5A582",
  white:"#FAF3E3", shadow:"rgba(60,40,15,0.18)",
};
export const NEON_DARK = {
  bgApp:"#08070C", bgSidebar:"#050509", bgEditor:"#0A0910", bgPanel:"#08070C",
  bgCard:"#17142A", bgCardHover:"#221E3C", bgActive:"#2E2850",
  border:"#3A3260", borderBright:"#524486",
  accent:"#E0409A", accentGlow:"rgba(224,64,154,0.14)", accentWarm:"#40D0E0",
  green:"#3FCB8E", purple:"#8C6FE0", yellow:"#E0D040", red:"#E04060",
  textPrimary:"#EDEBFB", textSec:"#A79CD0", textMuted:"#6E63A0", textFaint:"#403868",
  white:"#F4F0FF", shadow:"rgba(5,3,15,0.88)",
};
export const NEON_LIGHT = {
  bgApp:"#EDEAF5", bgSidebar:"#E4E0F0", bgEditor:"#F6F4FC", bgPanel:"#E8E4F2",
  bgCard:"#FAF8FE", bgCardHover:"#F2EEFA", bgActive:"#DCD4EE",
  border:"#C7BEE0", borderBright:"#A99CD0",
  accent:"#B01C70", accentGlow:"rgba(176,28,112,0.10)", accentWarm:"#1C8A9C",
  green:"#2C8858", purple:"#5C4098", yellow:"#8A7A10", red:"#A0203C",
  textPrimary:"#181428", textSec:"#3E3560", textMuted:"#766A98", textFaint:"#B8AED8",
  white:"#FAF8FE", shadow:"rgba(30,20,60,0.16)",
};
export const BLUEPRINT_DARK = {
  bgApp:"#081620", bgSidebar:"#05101A", bgEditor:"#0A1A26", bgPanel:"#081620",
  bgCard:"#122A3A", bgCardHover:"#1A3A4E", bgActive:"#204A62",
  border:"#2C5870", borderBright:"#3E7CA0",
  accent:"#4FB8E8", accentGlow:"rgba(79,184,232,0.12)", accentWarm:"#7CD0E8",
  green:"#5CAE8E", purple:"#7C8CC0", yellow:"#C0B060", red:"#D67070",
  textPrimary:"#DCEAF2", textSec:"#8CAABC", textMuted:"#5C7C8E", textFaint:"#345060",
  white:"#EAF4FA", shadow:"rgba(3,10,16,0.85)",
};
export const BLUEPRINT_LIGHT = {
  bgApp:"#EEF3F6", bgSidebar:"#E4ECF0", bgEditor:"#F8FBFC", bgPanel:"#E8F0F4",
  bgCard:"#FBFDFE", bgCardHover:"#F2F7F9", bgActive:"#D6E6EC",
  border:"#BAD2DC", borderBright:"#8CB8C8",
  accent:"#1C6C94", accentGlow:"rgba(28,108,148,0.10)", accentWarm:"#2C8AA8",
  green:"#3C7A5C", purple:"#4C5C98", yellow:"#8A7420", red:"#A03838",
  textPrimary:"#0E222C", textSec:"#33505C", textMuted:"#6E8C98", textFaint:"#AEC6CE",
  white:"#FBFDFE", shadow:"rgba(10,30,40,0.14)",
};
export const THEATRE_DARK = {
  bgApp:"#100608", bgSidebar:"#0C0406", bgEditor:"#140809", bgPanel:"#100608",
  bgCard:"#2E1014", bgCardHover:"#401620", bgActive:"#521C2A",
  border:"#642438", borderBright:"#8A3048",
  accent:"#C9A050", accentGlow:"rgba(201,160,80,0.12)", accentWarm:"#D9BC70",
  green:"#6E9A5C", purple:"#9A6C8C", yellow:"#C9A050", red:"#B03050",
  textPrimary:"#EFE0D8", textSec:"#B99490", textMuted:"#8A6660", textFaint:"#503034",
  white:"#F5E8DE", shadow:"rgba(20,4,8,0.88)",
};
export const THEATRE_LIGHT = {
  bgApp:"#F2E4E0", bgSidebar:"#EAD8D4", bgEditor:"#F8ECE8", bgPanel:"#EDDCD8",
  bgCard:"#FAF0EC", bgCardHover:"#F4E4E0", bgActive:"#E0C0BC",
  border:"#CCA098", borderBright:"#B0746C",
  accent:"#8A3428", accentGlow:"rgba(138,52,40,0.10)", accentWarm:"#9A6020",
  green:"#4E7038", purple:"#6E4858", yellow:"#8A6820", red:"#7A2438",
  textPrimary:"#241210", textSec:"#4A2C28", textMuted:"#8A6A64", textFaint:"#C8A098",
  white:"#FAF0EC", shadow:"rgba(60,20,20,0.16)",
};
export const WESTERN_DARK = {
  bgApp:"#150E08", bgSidebar:"#110B06", bgEditor:"#19110A", bgPanel:"#150E08",
  bgCard:"#2E2014", bgCardHover:"#402C1C", bgActive:"#523822",
  border:"#644426", borderBright:"#8A5E32",
  accent:"#C97A3C", accentGlow:"rgba(201,122,60,0.13)", accentWarm:"#D99850",
  green:"#8A9A5C", purple:"#9A7C6C", yellow:"#C9A050", red:"#B0503A",
  textPrimary:"#EFE2D0", textSec:"#B8A088", textMuted:"#8A7660", textFaint:"#4A3C2C",
  white:"#F5EAD8", shadow:"rgba(20,12,4,0.85)",
};
export const WESTERN_LIGHT = {
  bgApp:"#F0E0C8", bgSidebar:"#E8D4B0", bgEditor:"#F8EEDC", bgPanel:"#ECDEC0",
  bgCard:"#FBF4E6", bgCardHover:"#F4E8CE", bgActive:"#E0C494",
  border:"#CBAE7C", borderBright:"#B08C50",
  accent:"#A85220", accentGlow:"rgba(168,82,32,0.10)", accentWarm:"#8A6020",
  green:"#5C7038", purple:"#7A5C4C", yellow:"#8A6414", red:"#8A3C20",
  textPrimary:"#241A0E", textSec:"#4A3620", textMuted:"#8A7250", textFaint:"#C8AE80",
  white:"#FBF4E6", shadow:"rgba(60,36,10,0.18)",
};
export const NORDIC_DARK = {
  bgApp:"#14171A", bgSidebar:"#101215", bgEditor:"#16191C", bgPanel:"#14171A",
  bgCard:"#20242A", bgCardHover:"#2A2F36", bgActive:"#343A42",
  border:"#3E454E", borderBright:"#565F6A",
  accent:"#5E8F6E", accentGlow:"rgba(94,143,110,0.12)", accentWarm:"#7CA88C",
  green:"#5E8F6E", purple:"#7C8CA0", yellow:"#C0B080", red:"#C06868",
  textPrimary:"#E4E7EA", textSec:"#A0A8B0", textMuted:"#707880", textFaint:"#3E454E",
  white:"#EEF1F3", shadow:"rgba(6,8,10,0.8)",
};
export const NORDIC_LIGHT = {
  bgApp:"#F5F6F7", bgSidebar:"#EEF0F1", bgEditor:"#FAFBFB", bgPanel:"#F0F2F3",
  bgCard:"#FFFFFF", bgCardHover:"#F5F6F7", bgActive:"#E4E7E9",
  border:"#D6DADD", borderBright:"#B8BFC4",
  accent:"#3C6B4C", accentGlow:"rgba(60,107,76,0.08)", accentWarm:"#4C7C5C",
  green:"#3C6B4C", purple:"#4C5C78", yellow:"#8A7420", red:"#A03C3C",
  textPrimary:"#1A1D20", textSec:"#454C52", textMuted:"#7A828A", textFaint:"#C4CACE",
  white:"#FFFFFF", shadow:"rgba(20,24,28,0.10)",
};

export const THEMES = {
  vintage:   { id:"vintage",   label:"Papel Envejecido",   swatch:VINTAGE_DARK.accent,   dark:VINTAGE_DARK,   light:VINTAGE_LIGHT },
  noir:      { id:"noir",      label:"Noir Clásico",       swatch:DARK.accent,           dark:DARK,           light:LIGHT },
  neon:      { id:"neon",      label:"Neo-Noir",           swatch:NEON_DARK.accent,      dark:NEON_DARK,      light:NEON_LIGHT },
  blueprint: { id:"blueprint", label:"Blueprint Técnico",  swatch:BLUEPRINT_DARK.accent, dark:BLUEPRINT_DARK, light:BLUEPRINT_LIGHT },
  theatre:   { id:"theatre",   label:"Terciopelo",         swatch:THEATRE_DARK.accent,   dark:THEATRE_DARK,   light:THEATRE_LIGHT },
  western:   { id:"western",   label:"Desierto",           swatch:WESTERN_DARK.accent,   dark:WESTERN_DARK,   light:WESTERN_LIGHT },
  nordic:    { id:"nordic",    label:"Editorial Nórdico",  swatch:NORDIC_DARK.accent,    dark:NORDIC_DARK,    light:NORDIC_LIGHT },
};
export const DEFAULT_THEME_ID = "vintage";

export function getThemeList() { return Object.values(THEMES); }
export function getPalette(themeId, isDark) {
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
  return isDark ? theme.dark : theme.light;
}
export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
