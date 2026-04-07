

## Screen Tags — Geo + Indoor/Outdoor + Campaign Builder Integration

### What changes

Add location and venue-type tags to every screen, display them on the Screen Detail page, and make them searchable in the Campaign Builder's "Target by Tags" input.

### 1. Extend the Screen data model (`src/data/screens.ts`)

Add three new fields to the `Screen` interface:
- `address?: string` — street address
- `lat?: number`, `lng?: number` — coordinates
- `manualTags?: string[]` — user-applied tags (e.g. "Indoor", "Outdoor")

Add a new `geoTags` type and a helper function `getGeoTags(screen)` that derives auto tags from the address/venue. Since there's no real geocoding API, we'll hardcode plausible geo data per venue:

| Venue | Country | State | City | ZIP |
|-------|---------|-------|------|-----|
| Westfield Sydney | Australia | NSW | Sydney | 2000 |
| Melbourne Central | Australia | VIC | Melbourne | 3000 |
| Brisbane CBD Tower | Australia | QLD | Brisbane | 4000 |
| Perth Arena | Australia | WA | Perth | 6000 |

Each screen gets `address`, `lat`, `lng` populated in the mock data, plus some screens get `manualTags: ["Indoor"]` or `["Outdoor"]`.

### 2. Create a tags utility (`src/data/screenTags.ts`)

- `getAutoTags(screen: Screen)` → returns `{ country, state, city, zip }` derived from the screen's address fields
- `getAllScreenTags()` → returns a deduplicated list of all tags across all screens (auto + manual), each with a `type: "auto" | "manual"` flag and a `screenCount` number
- `getScreensMatchingTags(tags: string[])` → returns screens that have ANY of the given tags (auto or manual)
- Standard venue tags constant: `["Indoor", "Outdoor"]`

### 3. Screen Detail page (`src/pages/ScreenDetail.tsx`)

Add a new "Tags" card between "Screen Details" and "Playback Capacity":

- **Auto tags row** — globe icon + label "Auto", then pills for Country, State, City, ZIP. Each pill has a small globe icon. Styled with a distinct muted blue/gray background to differentiate from manual tags. Not editable.
- **Applied tags row** — tag icon + label "Applied", then pills for manual tags (Indoor/Outdoor/custom). These use the existing teal `bg-primary/10` style. Include a small "+ Add Tag" button that opens a popover with the standard venue tags and a free-text input for custom tags.

### 4. Campaign Builder Step 2 (`src/pages/CampaignCreate.tsx`)

Replace the hardcoded `AVAILABLE_TAGS` array with `getAllScreenTags()` from the new utility. This means:

- The "Target by Tags" search input now returns geo tags (e.g. typing "Sydney" shows "Sydney" with "6 screens") alongside manual tags ("Indoor" with "12 screens")
- Each tag option in the dropdown shows the tag name, its type icon (globe for auto, tag for manual), and live screen count
- The `tagMatchedScreens` calculation uses `getScreensMatchingTags()` instead of the current naive string matching
- The per-rule "Filter to tags" input also uses the same tag source

### 5. Files to create/edit

| File | Action |
|------|--------|
| `src/data/screens.ts` | Add `address`, `lat`, `lng`, `manualTags` to interface + mock data |
| `src/data/screenTags.ts` | New file — tag derivation logic, search helpers |
| `src/pages/ScreenDetail.tsx` | Add Tags card with auto/applied rows |
| `src/pages/CampaignCreate.tsx` | Replace `AVAILABLE_TAGS` with dynamic tag list, update matching logic |

