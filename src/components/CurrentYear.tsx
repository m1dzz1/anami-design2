"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** The page is statically generated: the server renders the build year, the browser corrects it after a New Year. */
export default function CurrentYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => buildYear);
  return <>{year}</>;
}
