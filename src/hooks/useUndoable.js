import { useState, useCallback } from "react";

export function useUndoable(initial) {
  const [history, setHistory] = useState({ past: [], present: initial, future: [] });
  const set = useCallback(val => {
    setHistory(h => ({
      past: [...h.past.slice(-49), h.present],
      present: typeof val === "function" ? val(h.present) : val,
      future: [],
    }));
  }, []);
  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.past.length) return h;
      const prev = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
    });
  }, []);
  const redo = useCallback(() => {
    setHistory(h => {
      if (!h.future.length) return h;
      const [next, ...rest] = h.future;
      return { past: [...h.past, h.present], present: next, future: rest };
    });
  }, []);
  return [history.present, set, undo, redo, history.past.length > 0, history.future.length > 0];
}
