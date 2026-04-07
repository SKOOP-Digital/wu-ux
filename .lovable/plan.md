

## Impressions Field + Data Import

### What changes

Add an optional `impressionsPerPlay` multiplier to screens, allow importing it via CSV in Settings, allow manual entry on Screen Detail, and show estimated impressions in the Campaign Builder Step 4 and Capacity Summary.

### 1. Data model (`src/data/screens.ts`)

- Add `impressionsPerPlay?: number` to the `Screen` interface
- No default values in mock data — all screens start without impression data

### 2. Settings page (`src/pages/SettingsPage.tsx`)

- Add "Audience & Impressions" to the tabs array
- New tab content:
  - **CSV upload area**: drag-and-drop or file input accepting `.csv`
  - Expected format: `screen_id, impressions_per_play`
  - On upload: parse CSV, match screen IDs against `allScreens`, update matching screens' `impressionsPerPlay` in a local state/store
  - **Success state**: "X screens updated" + timestamp
  - **Error state**: list unmatched screen IDs
  - **"Download template" link**: generates and downloads a CSV with headers + all screen IDs pre-filled (impressions column blank)
  - Since this is a client-side app with no persistence, store imported data in a shared context/store

### 3. Shared impression store (`src/data/impressionStore.ts` — new file)

- Simple module-level store: `Map<string, { multiplier: number; updatedAt: Date }>`
- Export `getImpressionMultiplier(screenId)`, `setImpressionMultiplier(screenId, value)`, `bulkSetImpressions(entries[])`, `hasAnyImpressionData()`, `getLastImportTime()`
- This avoids needing React context — just a shared JS module that all pages import

### 4. Screen Detail page (`src/pages/ScreenDetail.tsx`)

- Add an "Impression Data" card after existing content
- Show current multiplier from `getImpressionMultiplier(screen.id)` or "No impression data" message
- Editable numeric input for manual entry — calls `setImpressionMultiplier` on change
- "Last updated" timestamp beneath

### 5. Campaign Builder Step 4 (`src/pages/CampaignCreate.tsx`)

**Estimated Delivery box** — add row beneath daily plays:
- "Estimated daily impressions"
- If `hasAnyImpressionData()` is false → muted text: "— Waiting for impression data. Upload your audience data in Settings to enable."
- Otherwise → calculate: sum of `estimatedDailyPlaysPerScreen × impressionsPerPlay` for each matched screen (screens without multiplier use 0 or are excluded)

**Capacity Summary panel (right side)** — add "Est. Impressions/day" row with same logic

**Review step (Step 6)** — add estimated impressions to summary grid

### 6. Files

| File | Action |
|------|--------|
| `src/data/screens.ts` | Add `impressionsPerPlay?` to interface |
| `src/data/impressionStore.ts` | New — shared impression data store |
| `src/pages/SettingsPage.tsx` | Add "Audience & Impressions" tab with CSV upload |
| `src/pages/ScreenDetail.tsx` | Add impression data card with manual input |
| `src/pages/CampaignCreate.tsx` | Add impression rows to Step 4, Capacity Summary, and Review |

