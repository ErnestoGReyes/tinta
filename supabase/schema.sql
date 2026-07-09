-- ═══════════════════════════════════════════════════════════════════════════
-- TINTA — esquema de Supabase
-- ═══════════════════════════════════════════════════════════════════════════
-- Correr esto una sola vez en el SQL Editor de tu proyecto de Supabase
-- (Project → SQL Editor → New query → pegar todo → Run).
--
-- Los ids son `text` (no uuid) porque el cliente los genera en el navegador
-- con utils/literary.js#uid() antes de insertar — así el autoguardado puede
-- crear filas offline-first sin esperar un id que devuelva el server.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── LIBROS ───────────────────────────────────────────────────────────────
create table if not exists public.books (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  type        text not null default 'novela', -- novela | cuento | poesia | ensayo
  created_at  timestamptz not null default now()
);
create index if not exists books_user_id_idx on public.books(user_id);

-- ── PARTES (opcional, agrupa capítulos dentro de un libro) ──────────────
create table if not exists public.parts (
  id          text primary key,
  book_id     text not null references public.books(id) on delete cascade,
  title       text not null,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists parts_book_id_idx on public.parts(book_id);

-- ── CAPÍTULOS ────────────────────────────────────────────────────────────
create table if not exists public.chapters (
  id          text primary key,
  book_id     text not null references public.books(id) on delete cascade,
  part_id     text references public.parts(id) on delete set null,
  title       text not null default '',
  content     text not null default '', -- HTML simple (negrita/cursiva) del manuscrito
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists chapters_book_id_idx on public.chapters(book_id);

-- ── VERSIONES de capítulo (snapshots automáticos + manuales) ────────────
create table if not exists public.chapter_versions (
  id          text primary key,
  chapter_id  text not null references public.chapters(id) on delete cascade,
  snapshot    text not null default '',
  label       text,
  created_at  timestamptz not null default now()
);
create index if not exists chapter_versions_chapter_id_idx on public.chapter_versions(chapter_id);

-- ── ARCOS DE PERSONAJES ──────────────────────────────────────────────────
create table if not exists public.character_arcs (
  id          text primary key,
  book_id     text not null references public.books(id) on delete cascade,
  name        text not null,
  description text,
  arc_notes   text,
  created_at  timestamptz not null default now()
);
create index if not exists character_arcs_book_id_idx on public.character_arcs(book_id);

-- ── CRONOLOGÍA ───────────────────────────────────────────────────────────
create table if not exists public.timeline_events (
  id            text primary key,
  book_id       text not null references public.books(id) on delete cascade,
  date_label    text,
  description   text,
  order_index   int not null default 0,
  linked_chapter_id text references public.chapters(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists timeline_events_book_id_idx on public.timeline_events(book_id);

-- ── NOTAS DEL AUTOR ──────────────────────────────────────────────────────
create table if not exists public.notes (
  id          text primary key,
  book_id     text not null references public.books(id) on delete cascade,
  chapter_id  text references public.chapters(id) on delete set null,
  text        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists notes_book_id_idx on public.notes(book_id);

-- ── OBJETIVOS DE ESCRITURA ───────────────────────────────────────────────
create table if not exists public.writing_goals (
  id            text primary key,
  book_id       text not null references public.books(id) on delete cascade,
  target_words  int,
  daily_target  int,
  deadline      date,
  created_at    timestamptz not null default now()
);
create index if not exists writing_goals_book_id_idx on public.writing_goals(book_id);

-- ── MUNDO (lugares, objetos, reglas del universo narrativo) ─────────────
create table if not exists public.world_notes (
  id          text primary key,
  book_id     text not null references public.books(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);
create index if not exists world_notes_book_id_idx on public.world_notes(book_id);

-- ── PREFERENCIA DE TEMA (misma tabla que puede compartir con Plano) ─────
create table if not exists public.user_preferences (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  theme_id    text not null default 'vintage',
  is_dark     boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — cada usuario solo ve/edita lo suyo.
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.books            enable row level security;
alter table public.parts            enable row level security;
alter table public.chapters         enable row level security;
alter table public.chapter_versions enable row level security;
alter table public.character_arcs   enable row level security;
alter table public.timeline_events  enable row level security;
alter table public.notes            enable row level security;
alter table public.writing_goals    enable row level security;
alter table public.world_notes      enable row level security;
alter table public.user_preferences enable row level security;

-- Libros: dueño directo por user_id.
create policy "own books" on public.books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tablas hijas directas de books: dueño vía join a books.
create policy "own parts" on public.parts
  for all using (exists (select 1 from public.books b where b.id = parts.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = parts.book_id and b.user_id = auth.uid()));

create policy "own chapters" on public.chapters
  for all using (exists (select 1 from public.books b where b.id = chapters.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = chapters.book_id and b.user_id = auth.uid()));

create policy "own character arcs" on public.character_arcs
  for all using (exists (select 1 from public.books b where b.id = character_arcs.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = character_arcs.book_id and b.user_id = auth.uid()));

create policy "own timeline events" on public.timeline_events
  for all using (exists (select 1 from public.books b where b.id = timeline_events.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = timeline_events.book_id and b.user_id = auth.uid()));

create policy "own notes" on public.notes
  for all using (exists (select 1 from public.books b where b.id = notes.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = notes.book_id and b.user_id = auth.uid()));

create policy "own writing goals" on public.writing_goals
  for all using (exists (select 1 from public.books b where b.id = writing_goals.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = writing_goals.book_id and b.user_id = auth.uid()));

create policy "own world notes" on public.world_notes
  for all using (exists (select 1 from public.books b where b.id = world_notes.book_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.books b where b.id = world_notes.book_id and b.user_id = auth.uid()));

-- chapter_versions: dueño vía chapters → books (dos saltos).
create policy "own chapter versions" on public.chapter_versions
  for all using (
    exists (
      select 1 from public.chapters c
      join public.books b on b.id = c.book_id
      where c.id = chapter_versions.chapter_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.chapters c
      join public.books b on b.id = c.book_id
      where c.id = chapter_versions.chapter_id and b.user_id = auth.uid()
    )
  );

-- Preferencias: dueño directo por user_id.
create policy "own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
