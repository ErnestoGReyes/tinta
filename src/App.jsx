import { useState, useEffect, useCallback, useRef } from "react";
import { RADIUS, FONT_DISPLAY } from "./design/tokens";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { InjectStyles } from "./styles/globalStyles";
import { useAuth } from "./hooks/useAuth";
import { useThemePreference } from "./hooks/useThemePreference";
import { useUndoable } from "./hooks/useUndoable";
import { useAutosave } from "./hooks/useAutosave";
import { supabase } from "./lib/supabase";
import { Icons } from "./lib/icons";
import { Modal, Btn } from "./components/common";
import { ThemeSelectorModal } from "./components/ThemeSelector";
import { NavSidebar, MobileBottomNav, MobileEditorHeader } from "./components/nav";
import { LandingPage, AuthScreen, WelcomeScreen } from "./components/landing";
import { Toolbar, ManuscriptEditor, applyFormat } from "./components/editor";
import { ChaptersPanel, CharactersPanel, TimelinePanel, NotesPanel, GoalsPanel, WorldPanel } from "./components/panels";
import { NewBookModal, ChapterVersionsModal, ExportModal } from "./components/modals";
import { uid, countWords, estimatePages, excerpt } from "./utils/literary";

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 860);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= 860);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

function LoadingScreen() {
  const C = useTheme();
  return (
    <div style={{height:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bgApp, color:C.textMuted}}>
      <Icons.Saving className="spinner" style={{width:22, height:22}}/>
    </div>
  );
}

function HelpModal({ open, onClose }) {
  const C = useTheme();
  const tips = [
    "Escribí en Editor — el texto se guarda solo mientras tipeás.",
    "Capítulos: creá, reordená con las flechas y renombrá con doble click.",
    "Ctrl+B / Ctrl+I aplican negrita y cursiva en el manuscrito.",
    "El historial guarda una versión automática cada 10 minutos de edición.",
    "Cronología, Personajes, Notas, Objetivos y Mundo son independientes por libro.",
  ];
  return (
    <Modal open={open} onClose={onClose} title="Guía rápida" width={380}>
      <ul style={{margin:0, paddingLeft:18, display:"flex", flexDirection:"column", gap:10}}>
        {tips.map((t,i) => <li key={i} style={{fontSize:12.5, color:C.textSec, lineHeight:1.6}}>{t}</li>)}
      </ul>
    </Modal>
  );
}

function PanelShell({ title, icon: Icon, children }) {
  const C = useTheme();
  return (
    <div style={{flex:1, overflowY:"auto", background:C.bgApp}}>
      <div style={{maxWidth:640, margin:"0 auto", padding:"32px 20px 60px"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:20}}>
          {Icon && <Icon style={{width:20, height:20, color:C.accent}}/>}
          <h2 style={{fontFamily:FONT_DISPLAY, fontSize:22, fontWeight:600, color:C.textPrimary, margin:0}}>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyEditorState({ onCreate }) {
  const C = useTheme();
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14}}>
      <div className="empty-float" style={{color:C.textFaint, opacity:.6}}><Icons.Chapter style={{width:28, height:28}}/></div>
      <div style={{color:C.textMuted, fontSize:13}}>Este libro todavía no tiene capítulos</div>
      <Btn variant="primary" onClick={onCreate}><Icons.Plus style={{width:14, height:14}}/> Crear el primero</Btn>
    </div>
  );
}

// Dueño del estado de edición de UN capítulo: contenido con undo/redo,
// autoguardado debounced y versión automática cada 10 minutos. Se monta con
// key={chapter.id} desde MainApp, así que al cambiar de capítulo se resetea
// solo (sin arrastrar el historial de undo del capítulo anterior).
function ChapterEditorPane({ chapter, bookTitle, isMobile, focusMode, onFocusMode, onExport, onHistory, onChapterSaved }) {
  const C = useTheme();
  const [content, setContent, undo, redo, canUndo, canRedo] = useUndoable(chapter.content || "");
  const [title, setTitle] = useState(chapter.title || "");
  const lastVersionAt = useRef(Date.now());

  const persist = useCallback(async (val) => {
    await supabase.from("chapters")
      .update({ content: val.content, title: val.title, updated_at: new Date().toISOString() })
      .eq("id", chapter.id);
    onChapterSaved && onChapterSaved(chapter.id, { content: val.content, title: val.title });

    if (Date.now() - lastVersionAt.current > 10 * 60 * 1000) {
      lastVersionAt.current = Date.now();
      await supabase.from("chapter_versions").insert({
        id: uid(), chapter_id: chapter.id, snapshot: val.content, label: "Automática",
        created_at: new Date().toISOString(),
      });
    }
  }, [chapter.id, onChapterSaved]);

  const { saving, saveError } = useAutosave({ content, title }, persist, 1200);

  const plain = (content || "").replace(/<[^>]+>/g, " ");
  const words = countWords(plain);
  const pages = estimatePages(words);

  return (
    <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column", minHeight:0}}>
      {isMobile ? (
        <MobileEditorHeader bookTitle={bookTitle} chapterTitle={title} words={words} pages={pages}
          saving={saving} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo}
          onExport={onExport} focusMode={focusMode} onFocusMode={onFocusMode}/>
      ) : (
        <Toolbar chapterTitle={title} onTitleChange={setTitle} saving={saving} saveError={saveError}
          canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo}
          onFormat={applyFormat} onHistory={onHistory} onExport={onExport}
          focusMode={focusMode} onFocusMode={onFocusMode} isMobile={false}/>
      )}
      <ManuscriptEditor html={content} onChange={setContent} isMobile={isMobile} focusMode={focusMode} onFocusMode={onFocusMode}/>
      {!isMobile && (
        <div style={{padding:"6px 16px", fontSize:10.5, color:C.textFaint, borderTop:`1px solid ${C.border}`, flexShrink:0}}>
          {words} palabras · ~{pages} páginas
        </div>
      )}
    </div>
  );
}

function BooksScreen({ books, selectedBookId, onSelect, onDelete, onNew }) {
  const C = useTheme();
  return (
    <PanelShell title="Tus libros" icon={Icons.Books}>
      <Btn variant="primary" onClick={onNew} style={{marginBottom:16}}>
        <Icons.Plus style={{width:14, height:14}}/> Nuevo libro
      </Btn>
      <div style={{display:"flex", flexDirection:"column", gap:8}}>
        {books.map(b => (
          <div key={b.id} onClick={()=>onSelect(b.id)} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background: b.id===selectedBookId ? C.accentGlow : C.bgCard,
            border:`1px solid ${b.id===selectedBookId ? C.accent : C.border}`,
            borderRadius:RADIUS.md, padding:"14px 16px", cursor:"pointer",
          }}>
            <div>
              <div style={{fontSize:14, fontWeight:600, color:C.textPrimary}}>{b.title}</div>
              <div style={{fontSize:11, color:C.textMuted, marginTop:2, textTransform:"capitalize"}}>{b.type}</div>
            </div>
            <button onClick={e=>{e.stopPropagation(); onDelete(b.id);}}
              style={{background:"none", border:"none", color:C.textFaint, cursor:"pointer", padding:6}}>
              <Icons.Bin style={{width:15, height:15}}/>
            </button>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function SearchScreen({ chapters, onOpenChapter }) {
  const C = useTheme();
  const [q, setQ] = useState("");
  const results = q.trim() ? chapters.filter(c => {
    const plain = (c.title + " " + (c.content||"").replace(/<[^>]+>/g," ")).toLowerCase();
    return plain.includes(q.trim().toLowerCase());
  }) : [];
  return (
    <PanelShell title="Buscar" icon={Icons.Search}>
      <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en este libro…"
        style={{width:"100%", background:C.bgCard, border:`1px solid ${C.borderBright}`, borderRadius:RADIUS.sm,
          padding:"10px 14px", color:C.textPrimary, fontSize:14, outline:"none", marginBottom:16, boxSizing:"border-box"}}/>
      {q.trim() && (
        <div style={{fontSize:11.5, color:C.textMuted, marginBottom:10}}>
          {results.length} resultado{results.length===1?"":"s"}
        </div>
      )}
      <div style={{display:"flex", flexDirection:"column", gap:6}}>
        {results.map(c => (
          <div key={c.id} onClick={()=>onOpenChapter(c.id)} style={{
            background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm, padding:"10px 12px", cursor:"pointer"}}>
            <div style={{fontSize:13, fontWeight:600, color:C.textPrimary}}>{c.title}</div>
            <div style={{fontSize:11.5, color:C.textMuted, marginTop:2}}>
              {excerpt((c.content||"").replace(/<[^>]+>/g," "), 100)}
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function MainApp({ session, isDark, themeId, setThemeId, toggleTheme }) {
  const C = useTheme();
  const isMobile = useIsMobile();
  const userId = session.user.id;

  const [books, setBooks] = useState(null); // null = cargando
  const [selectedBookId, setSelectedBookId] = useState(() => {
    try { return localStorage.getItem("tinta-last-book") || null; } catch { return null; }
  });
  const [tab, setTab] = useState("editor");
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [versionKey, setVersionKey] = useState(0);

  const [showNewBook, setShowNewBook] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const loadBooks = useCallback(async () => {
    const { data, error } = await supabase.from("books").select("*").eq("user_id", userId).order("created_at", { ascending:true });
    if (!error) setBooks(data || []);
    else setBooks([]);
  }, [userId]);
  useEffect(() => { loadBooks(); }, [loadBooks]);

  useEffect(() => {
    if (!books) return;
    if (!selectedBookId && books.length) setSelectedBookId(books[0].id);
    if (selectedBookId && !books.find(b=>b.id===selectedBookId)) setSelectedBookId(books[0]?.id || null);
  }, [books, selectedBookId]);

  useEffect(() => {
    try { if (selectedBookId) localStorage.setItem("tinta-last-book", selectedBookId); } catch {}
  }, [selectedBookId]);

  const loadChapters = useCallback(async () => {
    if (!selectedBookId) { setChapters([]); setSelectedChapterId(null); return; }
    const { data, error } = await supabase.from("chapters").select("*").eq("book_id", selectedBookId).order("order_index", { ascending:true });
    if (!error) {
      const list = data || [];
      setChapters(list);
      setSelectedChapterId(prev => list.find(c=>c.id===prev) ? prev : (list[0]?.id || null));
    }
  }, [selectedBookId]);
  useEffect(() => { loadChapters(); }, [loadChapters]);

  const createBook = async (title, type) => {
    const id = uid();
    const { error } = await supabase.from("books").insert({ id, user_id:userId, title, type, created_at:new Date().toISOString() });
    if (error) { alert(error.message); return; }
    await loadBooks();
    setSelectedBookId(id);
    setTab("editor");
  };

  const deleteBook = async (id) => {
    if (!confirm("¿Eliminar este libro y todo su contenido? No se puede deshacer.")) return;
    await supabase.from("books").delete().eq("id", id);
    loadBooks();
  };

  const createChapter = async () => {
    if (!selectedBookId) return;
    const id = uid();
    const { error } = await supabase.from("chapters").insert({
      id, book_id:selectedBookId, title:`Capítulo ${chapters.length+1}`, content:"",
      order_index: chapters.length, created_at:new Date().toISOString(), updated_at:new Date().toISOString(),
    });
    if (error) { alert(error.message); return; }
    await loadChapters();
    setSelectedChapterId(id);
    setTab("editor");
  };

  const renameChapter = async (id, title) => {
    setChapters(cs => cs.map(c => c.id===id ? { ...c, title } : c));
    await supabase.from("chapters").update({ title }).eq("id", id);
  };

  const deleteChapter = async (id) => {
    await supabase.from("chapters").delete().eq("id", id);
    await loadChapters();
  };

  const reorderChapters = async (next) => {
    setChapters(next);
    await Promise.all(next.map((c, i) => supabase.from("chapters").update({ order_index:i }).eq("id", c.id)));
  };

  const handleChapterSaved = useCallback((id, patch) => {
    setChapters(cs => cs.map(c => c.id===id ? { ...c, ...patch } : c));
  }, []);

  const restoreVersion = useCallback(async (snapshot) => {
    if (!selectedChapterId) return;
    await supabase.from("chapters").update({ content:snapshot, updated_at:new Date().toISOString() }).eq("id", selectedChapterId);
    setChapters(cs => cs.map(c => c.id===selectedChapterId ? { ...c, content:snapshot } : c));
    setVersionKey(v => v+1);
  }, [selectedChapterId]);

  const selectedBook = books?.find(b=>b.id===selectedBookId) || null;
  const selectedChapter = chapters.find(c=>c.id===selectedChapterId) || null;

  if (books === null) return <LoadingScreen/>;

  const navProps = {
    tab, onTab:setTab, isDark, onToggleTheme:toggleTheme,
    onOpenThemeSelector:()=>setShowThemeSelector(true),
    onSignOut:()=>supabase.auth.signOut(),
    userEmail:session.user.email,
    onHelp:()=>setShowHelp(true), onOnboarding:()=>setShowHelp(true),
  };

  if (books.length === 0) {
    return (
      <div style={{display:"flex", height:"100dvh"}}>
        {!isMobile && <NavSidebar {...navProps} saving={false} saveError={false}/>}
        <WelcomeScreen onCreateBook={createBook}/>
        <ThemeSelectorModal open={showThemeSelector} onClose={()=>setShowThemeSelector(false)}
          themeId={themeId} onSelectTheme={setThemeId} isDark={isDark} onToggleMode={toggleTheme}/>
        <HelpModal open={showHelp} onClose={()=>setShowHelp(false)}/>
      </div>
    );
  }

  const isEditorish = tab === "editor" || tab === "chapters";

  const renderMain = () => {
    if (isEditorish) {
      if (isMobile && tab === "chapters") {
        return (
          <div style={{flex:1, overflowY:"auto", padding:"16px 16px 90px", background:C.bgApp}}>
            <ChaptersPanel chapters={chapters} activeId={selectedChapterId}
              onSelect={id=>{ setSelectedChapterId(id); setTab("editor"); }}
              onCreate={createChapter} onRename={renameChapter} onDelete={deleteChapter}
              onReorder={reorderChapters} isMobile/>
          </div>
        );
      }
      if (isMobile) {
        return selectedChapter
          ? <ChapterEditorPane key={selectedChapter.id+":"+versionKey} chapter={selectedChapter}
              bookTitle={selectedBook?.title} isMobile focusMode={focusMode}
              onFocusMode={()=>setFocusMode(v=>!v)} onExport={()=>setShowExport(true)}
              onHistory={()=>setShowHistory(true)} onChapterSaved={handleChapterSaved}/>
          : <EmptyEditorState onCreate={createChapter}/>;
      }
      return (
        <div style={{display:"flex", flex:1, minWidth:0}}>
          {!focusMode && (
            <div style={{width:230, borderRight:`1px solid ${C.border}`, overflowY:"auto", flexShrink:0}}>
              <ChaptersPanel chapters={chapters} activeId={selectedChapterId}
                onSelect={setSelectedChapterId} onCreate={createChapter} onRename={renameChapter}
                onDelete={deleteChapter} onReorder={reorderChapters}/>
            </div>
          )}
          {selectedChapter
            ? <ChapterEditorPane key={selectedChapter.id+":"+versionKey} chapter={selectedChapter}
                bookTitle={selectedBook?.title} isMobile={false} focusMode={focusMode}
                onFocusMode={()=>setFocusMode(v=>!v)} onExport={()=>setShowExport(true)}
                onHistory={()=>setShowHistory(true)} onChapterSaved={handleChapterSaved}/>
            : <EmptyEditorState onCreate={createChapter}/>}
        </div>
      );
    }
    if (tab === "characters") return <PanelShell title="Personajes" icon={Icons.Characters}><CharactersPanel bookId={selectedBookId} isDark={isDark}/></PanelShell>;
    if (tab === "timeline") return <PanelShell title="Cronología" icon={Icons.Timeline}><TimelinePanel bookId={selectedBookId}/></PanelShell>;
    if (tab === "world") return <PanelShell title="Mundo" icon={Icons.Map}><WorldPanel bookId={selectedBookId}/></PanelShell>;
    if (tab === "notes") return <PanelShell title="Notas" icon={Icons.Notes}><NotesPanel bookId={selectedBookId}/></PanelShell>;
    if (tab === "goals") return <PanelShell title="Objetivos" icon={Icons.Goal}><GoalsPanel bookId={selectedBookId}/></PanelShell>;
    if (tab === "search") return <SearchScreen chapters={chapters} onOpenChapter={id=>{ setSelectedChapterId(id); setTab("editor"); }}/>;
    if (tab === "books") return <BooksScreen books={books} selectedBookId={selectedBookId}
      onSelect={id=>{ setSelectedBookId(id); setTab("editor"); }} onDelete={deleteBook} onNew={()=>setShowNewBook(true)}/>;
    return null;
  };

  // El modo foco esconde toda la UI que no sea el manuscrito en sí: nav
  // lateral (desktop) y barra inferior (mobile). El panel de capítulos ya se
  // esconde más arriba, dentro de renderMain(). Antes ninguna de estas tres
  // piezas reaccionaba a `focusMode`, así que activar el modo foco apenas
  // angostaba unos px la columna de texto — el resto de la pantalla no
  // cambiaba y por eso el toggle parecía no hacer nada.
  const chromeVisible = !focusMode || tab !== "editor";

  return (
    <div style={{display:"flex", height:"100dvh", overflow:"hidden"}}>
      {!isMobile && chromeVisible && <NavSidebar {...navProps} saving={false} saveError={false}/>}
      <div style={{flex:1, display:"flex", flexDirection:"column", minWidth:0}}>
        {renderMain()}
      </div>
      {isMobile && chromeVisible && <MobileBottomNav tab={tab} onTab={setTab} isDark={isDark}
        onOpenThemeSelector={()=>setShowThemeSelector(true)} onHelp={()=>setShowHelp(true)}/>}

      <NewBookModal open={showNewBook} onClose={()=>setShowNewBook(false)} onCreate={createBook}/>
      <ThemeSelectorModal open={showThemeSelector} onClose={()=>setShowThemeSelector(false)}
        themeId={themeId} onSelectTheme={setThemeId} isDark={isDark} onToggleMode={toggleTheme}/>
      <ChapterVersionsModal open={showHistory} onClose={()=>setShowHistory(false)}
        chapterId={selectedChapterId} onRestore={restoreVersion}/>
      <ExportModal open={showExport} onClose={()=>setShowExport(false)} book={selectedBook} chapters={chapters}/>
      <HelpModal open={showHelp} onClose={()=>setShowHelp(false)}/>
    </div>
  );
}

function Gate({ session, isDark, themeId, setThemeId, toggleTheme }) {
  const [authMode, setAuthMode] = useState("landing");
  if (session === undefined) return <LoadingScreen/>;
  if (session === null) {
    return authMode === "landing"
      ? <LandingPage isDark={isDark} onToggleTheme={toggleTheme} onEnter={()=>setAuthMode("auth")}/>
      : <AuthScreen isDark={isDark} onToggleTheme={toggleTheme}/>;
  }
  return <MainApp session={session} isDark={isDark} themeId={themeId} setThemeId={setThemeId} toggleTheme={toggleTheme}/>;
}

export default function App() {
  const session = useAuth();
  const { isDark, themeId, setThemeId, toggleTheme } = useThemePreference(session);
  return (
    <ThemeProvider isDark={isDark} themeId={themeId}>
      <InjectStyles/>
      <Gate session={session} isDark={isDark} themeId={themeId} setThemeId={setThemeId} toggleTheme={toggleTheme}/>
    </ThemeProvider>
  );
}
