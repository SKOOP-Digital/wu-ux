

## Screens Page Search + Foursquare POI Proximity

### What changes

Add a search/filter toolbar to the Screens page with free-text search, AND/OR toggle, and a Foursquare-powered proximity filter. Add a tag breakdown sidebar on the right. Also add a "Target by Proximity" section to Campaign Builder Step 2.

### 1. New file: `src/services/foursquareService.ts`

- `searchPOIs(query, ll, radius)` — calls Foursquare Places Search v3 (`/v3/places/search`) with `Authorization: ${import.meta.env.VITE_FOURSQUARE_API_KEY}` header. Returns array of `{ fsq_id, name, location: { address, lat, lng }, categories }`.
- In-memory cache: `Map<string, POI[]>` keyed by `query|ll|radius`.
- `getScreensNearPOIs(pois, screens, radiusMeters)` — pure client-side Haversine distance check. Returns deduplicated screens within radius of any POI.
- Haversine helper function inlined in the same file.
- Export `POI` interface for use in other files.

### 2. Screens page (`src/pages/Screens.tsx`)

Restructure layout to a two-column grid when filters are active:

**Search toolbar** (above table):
- Free-text `Input` with search icon — filters by screen name, ID, and all tags (auto + manual)
- AND/OR pill toggle to the right
- "+ Add Proximity" button opens a collapsible proximity filter row:
  - POI search input + radius dropdown (0.25mi / 0.5mi / 1mi / 2mi / 5mi) + "Search" button
  - Results as selectable chips showing POI name + location count
  - Selected POIs as removable tags
- Active filters shown as removable chips below the bar
- Result count: "X screens match"

**Screen list** (left): existing table, filtered in place. Each row shows small tag badges for matched filters.

**Tag breakdown sidebar** (right, visible when filters active):
- "Tags in results" header
- All tags present in matched screens, sorted by count descending
- Globe icon for auto, tag icon for manual, pin icon for proximity
- Clickable — adds tag as filter

**State**: `searchText`, `matchMode` ("any"|"all"), `proximityPOIs`, `proximityRadius`, `showProximity`, `poiSearchQuery`, `poiResults`, `selectedPOIs`

**Filtering logic** (`useMemo`):
- Text filter: split by spaces, match against screen name/id/tags
- Proximity filter: `getScreensNearPOIs(selectedPOIs, allScreens, radius)`
- AND mode: intersect text + proximity results
- OR mode: union text + proximity results

### 3. Campaign Builder Step 2 (`src/pages/CampaignCreate.tsx`)

Add a third targeting card after "Target by Tags":

- **"Target by Proximity"** card with MapPin icon
- Description: "Find screens near specific points of interest using Foursquare."
- POI search input + radius dropdown + Search button (same UI pattern as Screens page)
- Selected POIs as removable chips
- "X screens match" count updates live
- New state: `proximityPOIs`, `proximityRadius`, `poiSearch`, `poiResults`
- Update `capacitySummary` to include proximity-matched screens (union with rule + tag screens)

### 4. Files

| File | Action |
|------|--------|
| `src/services/foursquareService.ts` | New — Foursquare API client + Haversine matching |
| `src/pages/Screens.tsx` | Major rewrite — search bar, proximity filter, tag sidebar |
| `src/pages/CampaignCreate.tsx` | Add "Target by Proximity" section to Step 2, update capacity calc |

### Technical notes

- API key accessed via `import.meta.env.VITE_FOURSQUARE_API_KEY` (Vite convention for client-side env vars)
- Radius conversion: miles to meters (1mi = 1609.34m) done in the service layer
- POI search debounced or triggered on button click (button click chosen per spec)
- The default center point for POI search uses the average lat/lng of matched screens, falling back to first screen's coordinates

