# Tinta

Aplicación de escritura literaria (novelas, cuentos, poesía, ensayos) con
capítulos, cronologías, arcos de personajes, notas y objetivos de escritura.
Hermana de **Plano** (guionista) — comparten sistema de temas, autenticación y
patrones de UI, pero cada una vive en su propia carpeta para no acoplarlas.

## 1. Requisitos

- Node.js 18+
- Una cuenta y proyecto de [Supabase](https://supabase.com) (gratis alcanza para arrancar)

## 2. Instalar dependencias

```bash
npm install
```

## 3. Crear el proyecto de Supabase

1. Entrá a [supabase.com](https://supabase.com) → **New project**.
2. Cuando esté listo, andá a **Project Settings → API** y copiá:
   - `Project URL` https://ghprksnoarrvwtlvkauw.supabase.co
   - `anon public` key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocHJrc25vYXJydnd0bHZrYXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MTEwMDQsImV4cCI6MjA5OTE4NzAwNH0.4TjBKyLoJIE0sk_j-dlFKwa9Wi8ymUgNurhhB59hi8w
3. Andá a **Authentication → Providers** y asegurate de que **Email** esté habilitado
   (viene activado por defecto). Si no querés confirmación por email mientras
   probás, en **Authentication → Settings** podés desactivar "Confirm email".
4. Andá a **SQL Editor → New query**, pegá todo el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql) y apretá **Run**.
   Esto crea todas las tablas (`books`, `chapters`, `chapter_versions`,
   `character_arcs`, `timeline_events`, `notes`, `writing_goals`,
   `world_notes`, `user_preferences`) con Row Level Security ya configurado,
   así cada usuario solo ve sus propios libros.

## 4. Variables de entorno

```bash
cp .env.example .env
```

Editá `.env` y completá con los datos del paso anterior:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 5. Correr la app

```bash
npm run dev
```

Abrí la URL que muestra la terminal (normalmente `http://localhost:5173`).
Vas a ver la landing → creá una cuenta (email + contraseña) → creá tu primer
libro → empezá a escribir.

## Estructura del proyecto

```
src/
  design/tokens.js        Paletas de color (7 temas), tipografía, radios, sombras
  contexts/ThemeContext   Provider de tema (useTheme())
  hooks/                  useAuth, useThemePreference, useUndoable, useAutosave
  lib/                    cliente de Supabase, set de íconos SVG
  utils/literary.js       conteo de palabras, estimación de páginas, ids, fechas
  styles/globalStyles.js  CSS global inyectado + favicon
  components/
    common.jsx            Btn, Modal — base de toda la UI
    ThemeSelector.jsx      selector de las 7 paletas (día/noche)
    nav.jsx                sidebar de escritorio + nav móvil + logo
    landing.jsx            landing pública, login/signup, alta del primer libro
    editor.jsx              toolbar + editor de manuscrito (prosa continua)
    panels.jsx              lista de capítulos + panel CRUD genérico
                            (Personajes, Cronología, Notas, Objetivos, Mundo)
    modals.jsx              nuevo libro, historial de versiones, exportar
  App.jsx                  arma todo: auth, libros, capítulos, tabs, modales
  main.jsx                 punto de entrada + error boundary
supabase/schema.sql        esquema completo con RLS
```

## Qué falta / próximos pasos sugeridos

Esto es un punto de partida funcional, no un producto terminado. Ideas para
seguir construyendo, en orden aproximado de impacto:

- **Editor más robusto**: hoy es un `contentEditable` simple (negrita/cursiva).
  Para algo más serio (Markdown real, mejor undo por selección, comentarios al
  margen) conviene migrar a algo como [Tiptap](https://tiptap.dev/) — se
  enchufa en el mismo lugar que `ManuscriptEditor` en `components/editor.jsx`.
- **Exportación a PDF real**: `ExportModal` hoy exporta `.md`/`.txt` y ofrece
  "Imprimir → Guardar como PDF" del navegador. Un export con tipografía de
  imprenta, tapa y numeración de página necesitaría algo como jsPDF o una
  función de servidor con Puppeteer.
- **Partes**: la tabla `parts` ya existe en el esquema y `chapters.part_id` la
  referencia, pero todavía no hay UI para agruparlas — es una extensión
  natural de `ChaptersPanel`.
- **Drag & drop real** para reordenar capítulos (hoy son flechas arriba/abajo,
  funciona pero es menos cómodo con muchos capítulos).
- **Vincular eventos de la cronología a capítulos** (la columna
  `linked_chapter_id` ya existe en `timeline_events`).
- Si en algún momento Tinta y Plano comparten muchos fixes en los archivos
  "sin cambios" (common.jsx, ThemeContext, hooks), ese es el momento de
  extraerlos a un paquete compartido de verdad en vez de mantener dos copias.
