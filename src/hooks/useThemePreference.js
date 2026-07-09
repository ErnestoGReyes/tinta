import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_THEME_ID } from "../design/tokens";

const LS_MODE = "tinta-theme";
const LS_THEME_ID = "tinta-theme-id";

export function useThemePreference(session) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(LS_MODE) !== "light"; } catch { return true; }
  });
  const [themeId, setThemeId] = useState(() => {
    try { return localStorage.getItem(LS_THEME_ID) || DEFAULT_THEME_ID; } catch { return DEFAULT_THEME_ID; }
  });

  const loadedForUser = useRef(null);

  useEffect(() => { try { localStorage.setItem(LS_MODE, isDark ? "dark" : "light"); } catch {} }, [isDark]);
  useEffect(() => { try { localStorage.setItem(LS_THEME_ID, themeId); } catch {} }, [themeId]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || loadedForUser.current === userId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("theme_id, is_dark")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      loadedForUser.current = userId;
      if (!error && data) {
        if (data.theme_id) setThemeId(data.theme_id);
        if (typeof data.is_dark === "boolean") setIsDark(data.is_dark);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || loadedForUser.current !== userId) return;
    const timer = setTimeout(() => {
      supabase.from("user_preferences")
        .upsert(
          { user_id: userId, theme_id: themeId, is_dark: isDark, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .then(({ error }) => { if (error) console.error("No se pudo guardar la preferencia de tema:", error); });
    }, 500);
    return () => clearTimeout(timer);
  }, [themeId, isDark, session?.user?.id]);

  const toggleTheme = useCallback(() => setIsDark(v => !v), []);
  return { isDark, setIsDark, themeId, setThemeId, toggleTheme };
}
