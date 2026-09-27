import type sr from "./dictionaries/sr";

/** The Serbian dictionary is the source of truth for the shape; every other language must match it. */
export type Dictionary = typeof sr;
