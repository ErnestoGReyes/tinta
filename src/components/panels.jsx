import { useState, useEffect, useCallback } from "react";
import { RADIUS, hexToRgb, ARC_PALETTE_DARK, ARC_PALETTE_LIGHT } from "../design/tokens";
import { useTheme } from "../contexts/ThemeContext";
import { Icons } from "../lib/icons";
import { Btn } from "./common";
import { supabase } from "../lib/supabase";
import { uid, countWords, excerpt } from "../utils/literary";

// ───────────────────────────────────────────────────────────────────────────
// CAPÍTULOS — lista reordenable (botones arriba/abajo en vez de drag & drop,
// para no sumar una dependencia nueva solo para esto) + alta/baja/rename.
// ───────────────────────────────────────────────────────────────────────────
export function ChaptersPanel({ chapters, activeId, onSelect, onCreate, onRename, onDelete, onReorder, isMobile }) {
  const C = useTheme();
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const move = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    const next = [...chapters];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onReorder(next);
  };

  return (
    <div style={{display:"flex", flexDirection:"column", height:"100%"}}>
      <div style={{padding: isMobile ? "0 0 12px" : "12px 12px 8px", flexShrink:0}}>
        <Btn variant="primary" onClick={onCreate} style={{width:"100%", justifyContent:"center"}}>
          <Icons.Plus style={{width:14,height:14}}/> Nuevo capítulo
        </Btn>
      </div>
      <div style={{flex:1, overflowY:"auto", padding: isMobile ? 0 : "0 8px 8px"}}>
        {chapters.length === 0 ? (
          <div className="fade-in" style={{padding:"32px 14px", textAlign:"center"}}>
            <div className="empty-float" style={{color:C.textFaint, marginBottom:8, opacity:.6}}>
              <Icons.Chapter style={{width:22,height:22}}/>
            </div>
            <div style={{color:C.textFaint, fontSize:11.5, lineHeight:1.6}}>Todavía no hay capítulos</div>
          </div>
        ) : chapters.map((ch, i) => {
          const isActive = ch.id === activeId;
          const words = countWords((ch.content||"").replace(/<[^>]+>/g," "));
          return (
            <div key={ch.id} onClick={()=>onSelect(ch.id)} style={{
              display:"flex", alignItems:"center", gap:6, padding:"9px 10px", margin:"0 0 2px",
              borderRadius:RADIUS.sm, cursor:"pointer",
              background:isActive?`rgba(${hexToRgb(C.accent)},.14)`:"transparent",
              borderLeft:`2px solid ${isActive?C.accent:"transparent"}`,
            }}
            onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=C.bgCard}}
            onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent"}}>
              <div style={{flex:1, minWidth:0}}>
                {renamingId === ch.id ? (
                  <input autoFocus value={renameValue}
                    onClick={e=>e.stopPropagation()}
                    onChange={e=>setRenameValue(e.target.value)}
                    onBlur={()=>{onRename(ch.id, renameValue||"Sin título"); setRenamingId(null);}}
                    onKeyDown={e=>{if(e.key==="Enter")e.currentTarget.blur();}}
                    style={{width:"100%", background:C.bgCard, border:`1px solid ${C.accent}`,
                      borderRadius:4, padding:"3px 6px", color:C.textPrimary, fontSize:12.5, outline:"none"}}/>
                ) : (
                  <div style={{fontSize:12.5, fontWeight:isActive?600:500,
                    color:isActive?C.accent:C.textPrimary, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap"}}
                    onDoubleClick={e=>{e.stopPropagation(); setRenamingId(ch.id); setRenameValue(ch.title);}}>
                    {i+1}. {ch.title || "Sin título"}
                  </div>
                )}
                <div style={{fontSize:9.5, color:C.textFaint, marginTop:2}}>{words} palabras</div>
              </div>
              <div style={{display:"flex", flexDirection:"column"}}>
                <button onClick={e=>{e.stopPropagation();move(i,-1);}} disabled={i===0}
                  style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",padding:1,opacity:i===0?.3:1}}>▲</button>
                <button onClick={e=>{e.stopPropagation();move(i,1);}} disabled={i===chapters.length-1}
                  style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",padding:1,opacity:i===chapters.length-1?.3:1}}>▼</button>
              </div>
              <button onClick={e=>{e.stopPropagation(); if(confirm(`¿Eliminar "${ch.title}"?`)) onDelete(ch.id);}}
                style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",padding:4}}>
                <Icons.Bin style={{width:13,height:13}}/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// PANEL CRUD GENÉRICO — usado para Personajes, Cronología, Notas y Objetivos.
// En vez de escribir cuatro componentes casi idénticos, uno solo maneja alta/
// edición/borrado contra cualquier tabla de Supabase filtrada por book_id.
// `fields` describe el formulario; `renderItem` decide cómo se ve cada fila.
// ───────────────────────────────────────────────────────────────────────────
export function SimpleCrudPanel({ table, bookId, fields, emptyLabel, emptyIcon: EmptyIcon, renderItem, orderBy = "created_at" }) {
  const C = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").eq("book_id", bookId).order(orderBy, { ascending: true });
    if (!error) setItems(data || []);
    setLoading(false);
  }, [table, bookId, orderBy]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({}); setEditingId(null); setShowForm(true); };
  const openEdit = (item) => { setForm(item); setEditingId(item.id); setShowForm(true); };

  const save = async () => {
    const payload = { ...form, book_id: bookId };
    if (editingId) {
      const { error } = await supabase.from(table).update(payload).eq("id", editingId);
      if (error) { alert(error.message); return; }
    } else {
      const { error } = await supabase.from(table).insert({ id: uid(), ...payload, created_at: new Date().toISOString() });
      if (error) { alert(error.message); return; }
    }
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    await supabase.from(table).delete().eq("id", id);
    load();
  };

  return (
    <div style={{padding:"12px 4px"}}>
      <Btn variant="primary" onClick={openNew} style={{marginBottom:14}}>
        <Icons.Plus style={{width:14,height:14}}/> Agregar
      </Btn>

      {showForm && (
        <div style={{background:C.bgCard, border:`1px solid ${C.borderBright}`, borderRadius:RADIUS.md,
          padding:14, marginBottom:14, display:"flex", flexDirection:"column", gap:8}}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{fontSize:10.5, color:C.textMuted, marginBottom:4, textTransform:"uppercase", letterSpacing:.4}}>{f.label}</div>
              {f.type === "textarea" ? (
                <textarea value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                  rows={3} style={{width:"100%", background:C.bgApp, border:`1px solid ${C.border}`,
                    borderRadius:RADIUS.xs, padding:8, color:C.textPrimary, fontSize:12.5, fontFamily:"inherit", resize:"vertical"}}/>
              ) : (
                <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                  style={{width:"100%", background:C.bgApp, border:`1px solid ${C.border}`,
                    borderRadius:RADIUS.xs, padding:8, color:C.textPrimary, fontSize:12.5, fontFamily:"inherit", boxSizing:"border-box"}}/>
              )}
            </div>
          ))}
          <div style={{display:"flex", gap:8, justifyContent:"flex-end", marginTop:4}}>
            <Btn variant="outline" onClick={()=>setShowForm(false)}>Cancelar</Btn>
            <Btn variant="primary" onClick={save}>Guardar</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{color:C.textFaint, fontSize:12, textAlign:"center", padding:20}}>Cargando…</div>
      ) : items.length === 0 ? (
        <div className="fade-in" style={{padding:"28px 14px", textAlign:"center"}}>
          {EmptyIcon && <div className="empty-float" style={{color:C.textFaint, marginBottom:8, opacity:.6}}><EmptyIcon style={{width:22,height:22}}/></div>}
          <div style={{color:C.textFaint, fontSize:11.5}}>{emptyLabel}</div>
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {items.map((item, i) => (
            <div key={item.id} onClick={()=>openEdit(item)} style={{
              background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm,
              padding:"10px 12px", cursor:"pointer", position:"relative",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderBright}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              {renderItem(item, i)}
              <button onClick={e=>{e.stopPropagation(); remove(item.id);}}
                style={{position:"absolute", top:8, right:8, background:"none", border:"none",
                  color:C.textFaint, cursor:"pointer", padding:2}}>
                <Icons.Bin style={{width:13,height:13}}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function arcColor(index, C, isDark) {
  const palette = isDark ? ARC_PALETTE_DARK : ARC_PALETTE_LIGHT;
  return palette[index % palette.length];
}

// ───────────────────────────────────────────────────────────────────────────
// Configuraciones concretas de SimpleCrudPanel para cada sección — quedan acá
// para que App.jsx no tenga que conocer la forma de cada tabla.
// ───────────────────────────────────────────────────────────────────────────
export function CharactersPanel({ bookId, isDark }) {
  const C = useTheme();
  return (
    <SimpleCrudPanel
      table="character_arcs" bookId={bookId}
      emptyLabel="Sin personajes todavía" emptyIcon={Icons.Characters}
      fields={[
        { key:"name", label:"Nombre" },
        { key:"description", label:"Descripción", type:"textarea" },
        { key:"arc_notes", label:"Notas del arco narrativo", type:"textarea" },
      ]}
      renderItem={(item, i) => (
        <div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
            <div style={{width:8,height:8,borderRadius:"50%", background:arcColor(i,C,isDark), flexShrink:0}}/>
            <div style={{fontSize:13, fontWeight:600, color:C.textPrimary}}>{item.name}</div>
          </div>
          {item.description && <div style={{fontSize:11.5, color:C.textMuted, lineHeight:1.5}}>{excerpt(item.description, 100)}</div>}
        </div>
      )}
    />
  );
}

export function TimelinePanel({ bookId }) {
  const C = useTheme();
  return (
    <SimpleCrudPanel
      table="timeline_events" bookId={bookId} orderBy="order_index"
      emptyLabel="Sin eventos en la cronología" emptyIcon={Icons.Timeline}
      fields={[
        { key:"date_label", label:"Fecha / momento" },
        { key:"description", label:"Qué pasa", type:"textarea" },
        { key:"order_index", label:"Orden (número)", type:"number" },
      ]}
      renderItem={(item) => (
        <div>
          <div style={{fontSize:11, color:C.accent, fontWeight:600, marginBottom:2}}>{item.date_label}</div>
          <div style={{fontSize:12.5, color:C.textPrimary, lineHeight:1.5}}>{excerpt(item.description, 120)}</div>
        </div>
      )}
    />
  );
}

export function NotesPanel({ bookId }) {
  return (
    <SimpleCrudPanel
      table="notes" bookId={bookId}
      emptyLabel="Sin notas todavía" emptyIcon={Icons.Notes}
      fields={[{ key:"text", label:"Nota", type:"textarea" }]}
      renderItem={(item) => <div style={{fontSize:12.5, lineHeight:1.6}}>{item.text}</div>}
    />
  );
}

export function GoalsPanel({ bookId }) {
  const C = useTheme();
  return (
    <SimpleCrudPanel
      table="writing_goals" bookId={bookId}
      emptyLabel="Sin objetivos definidos" emptyIcon={Icons.Goal}
      fields={[
        { key:"target_words", label:"Meta de palabras", type:"number" },
        { key:"daily_target", label:"Meta diaria de palabras", type:"number" },
        { key:"deadline", label:"Fecha límite", type:"date" },
      ]}
      renderItem={(item) => (
        <div style={{fontSize:12.5, color:C.textPrimary}}>
          {item.target_words ? `${item.target_words} palabras totales` : "Sin meta total"}
          {item.daily_target ? ` · ${item.daily_target}/día` : ""}
          {item.deadline ? ` · antes del ${item.deadline}` : ""}
        </div>
      )}
    />
  );
}

export function WorldPanel({ bookId }) {
  return (
    <SimpleCrudPanel
      table="world_notes" bookId={bookId}
      emptyLabel="Sin lugares ni notas de mundo todavía" emptyIcon={Icons.Map}
      fields={[
        { key:"name", label:"Lugar / elemento" },
        { key:"description", label:"Descripción", type:"textarea" },
      ]}
      renderItem={(item) => (
        <div>
          <div style={{fontSize:13, fontWeight:600, marginBottom:2}}>{item.name}</div>
          <div style={{fontSize:11.5, color:"inherit", opacity:.75, lineHeight:1.5}}>{excerpt(item.description, 100)}</div>
        </div>
      )}
    />
  );
}
