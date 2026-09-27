"use client";

import { useEffect } from "react";
import { LANG_SWITCH_KEY, type LangSwitchState } from "./LanguageSwitcher";

/**
 * After a language switch, puts the reader back at the same place in the same section.
 * Works for both soft (client) and hard (full reload) navigations.
 */
export function useRestoreLangPosition(lang: string) {
  useEffect(() => {
    let state: LangSwitchState | null = null;
    try {
      const raw = sessionStorage.getItem(LANG_SWITCH_KEY);
      sessionStorage.removeItem(LANG_SWITCH_KEY);
      state = raw ? (JSON.parse(raw) as LangSwitchState) : null;
    } catch {}
    if (!state || Date.now() - state.at > 10_000) return;

    const root = document.documentElement;
    const restore = () => {
      const el = document.getElementById(state!.id);
      if (!el) return;
      // Translated copy can change the section height slightly — keep the relative position inside it
      const offset = state!.ratio * el.offsetHeight;
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, top));
      root.style.scrollBehavior = previous;
    };

    let cancelled = false;
    requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && restore()));
    // Once more after fonts settle (matters on a full reload)
    document.fonts?.ready.then(() => !cancelled && restore());
    return () => {
      cancelled = true;
    };
  }, [lang]);
}
