import { useEffect, useRef, useState } from "react";

export function useAutosave(value, onSave, delay = 1000) {
  const timer = useRef(null);
  const first = useRef(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    clearTimeout(timer.current);
    setSaving(true);
    timer.current = setTimeout(async () => {
      try {
        await onSave(value);
        setSaveError(false);
      } catch (err) {
        console.error("Error de autoguardado:", err);
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }, delay);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { saving, saveError };
}
