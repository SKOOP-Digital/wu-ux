import type { Screen } from "./screens";
import { screenCdmTagsById, type ScreenCdmTags } from "./screenCdmTags";

/** Split semicolon-delimited tag strings (e.g. "Disney-AA; Disney-Hispanic"). */
export function expandTagValue(raw: string): string[] {
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Normalize a CDM tag field value to a flat list of comparable strings. */
export function normalizeCdmFieldValue(raw: string | string[] | undefined): string[] {
  if (raw == null || raw === "") return [];
  const parts = Array.isArray(raw) ? raw : [raw];
  return parts.flatMap((v) => expandTagValue(String(v)));
}

export function getScreenCdmTags(screen: Screen): ScreenCdmTags | undefined {
  return screenCdmTagsById[screen.id];
}

export function getScreenCdmValues(screen: Screen, key: string): string[] {
  const tags = getScreenCdmTags(screen);
  if (!tags) return [];
  return normalizeCdmFieldValue(tags[key]);
}

export function screenHasCdmValue(screen: Screen, key: string, value: string): boolean {
  const needle = value.trim().toLowerCase();
  if (!needle) return false;
  return getScreenCdmValues(screen, key).some((v) => v.toLowerCase() === needle);
}
