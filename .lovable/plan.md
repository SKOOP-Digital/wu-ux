

## Western Union Inventory Import with Geocoding — Full Dataset

### What we're building

A build-time pipeline that parses the Western Union XLSX (~2,830 rows), geocodes all addresses to lat/lng, and generates a new `screens.ts` with every row included. No deduplication, no capping — every row becomes a screen.

### Phase 1 — Build-time data pipeline (`/tmp/generate_screens.py`)

1. Parse `Inventory_List_1.xlsx` with pandas — all ~2,830 rows
2. Every row gets a unique screen ID (`scr-1` through `scr-2830`)
3. Detect country from zip format: 5-digit → US, letter-number → Canada, dash → Brazil
4. Auto-generate tags from agent name keywords (e.g. "KITCHEN FOOD FAIR" → "Food & Grocery", "OFFICE" → "Office") via a keyword lookup map
5. Handle active hours: both 0 → always on (0/2359), otherwise as-is, null → undefined
6. Average Multiplier → `impressionsPerPlay`, default 1.0 if missing
7. Geocode: US Census Bureau batch (one request), Nominatim for Canada/Brazil (1 req/sec)
8. Track failed geocodes in `failed_geocodes.json`
9. Output `src/data/screens.ts` with all ~2,830 screens

### Phase 2 — Extend Screen interface (`src/data/screens.ts`)

Add to `Screen` interface:
- `city`, `state`, `zip`, `country` — from XLSX
- `activeHoursStart`, `activeHoursEnd` — military time integers
- `geocodeStatus?: "success" | "failed" | "pending"`

Defaults: `status: "Online"`, `resolution: "1080×1920"`, `orientation: "Portrait"`, `loopDuration: 60`, `loopsPerHour: 60`, `venue` = Agent Name.

### Phase 3 — Update tag system (`src/data/screenTags.ts`)

- Remove hardcoded `VENUE_GEO` lookup
- Derive geo tags from `screen.city`, `screen.state`, `screen.zip`, `screen.country`
- Failed-geocode screens still appear in tag searches — only excluded from proximity

### Phase 4 — Impression store (`src/data/impressionStore.ts`)

- Add `initFromScreenData()` to bulk-load multipliers from screen data
- Call from `src/main.tsx` on boot

### Phase 5 — Settings: Screen Data Tab (`src/pages/SettingsPage.tsx`)

**A. XLSX Importer** — Accept `.xlsx` via SheetJS, map columns, match by agent name + address, show results

**B. Geocoding Issues** — Table of failed screens with inline lat/lng edit, retry per-row, download failed CSV, retry all bulk action

### Phase 6 — Screen Detail (`src/pages/ScreenDetail.tsx`)

- Show city/state/zip/country, active hours ("6:00 AM – 10:00 PM" or "Always On")
- Geocode status badge: "📍 Location verified" or "⚠ Location missing"
- Inline lat/lng input for failed screens

### Phase 7 — Proximity search guard (`src/services/foursquareService.ts`)

- `getScreensNearPOIs()` already checks `if (!screen.lat || !screen.lng) continue` — confirm this guard exists (it does in current code)

### Files

| File | Action |
|------|--------|
| `/tmp/generate_screens.py` | New — parse XLSX, geocode, output screens.ts |
| `src/data/screens.ts` | Rewrite — all ~2,830 WU screens with geocoded coords |
| `src/data/screenTags.ts` | Rewrite — derive geo from screen fields |
| `src/data/impressionStore.ts` | Add `initFromScreenData()` |
| `src/main.tsx` | Call `initFromScreenData()` on boot |
| `src/pages/SettingsPage.tsx` | Add Screen Data tab with importer + geocoding issues |
| `src/pages/ScreenDetail.tsx` | Show location fields, active hours, geocode status |
| `package.json` | Add `xlsx` dependency |

### Technical notes

- Census Bureau batch handles all US rows in one HTTP request
- Nominatim handles Canada/Brazil at 1 req/sec (~20-30 min runtime)
- Screen count: 18 → ~2,830
- All existing features (table, filters, Campaign Builder, proximity) reference `allScreens` and pick up new data automatically

