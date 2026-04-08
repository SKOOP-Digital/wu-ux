

## Smart POI Search with Autocomplete Dropdown

### Problem
Searching "Chase" vs "Chase Bank" returns different Nominatim results because the free-text query hits different OSM entries. Users need to see categorized suggestions as they type so they pick the right term.

### Approach
Add a debounced autocomplete dropdown to the POI search input. As the user types (after 2+ characters), fire a lightweight Nominatim query against one regional center to get suggestions. Display them in a dropdown. When the user selects one, populate the input and auto-trigger the full multi-region search.

### Changes

**1. New component: `src/components/shared/POIAutocomplete.tsx`**

- Renders an `Input` with a `Popover`-based dropdown below it
- On input change (debounced 300ms, min 2 chars), calls a new `suggestPOIs` function
- Displays results in a list: name + category type (e.g. "Chase Bank — bank", "Chase Field — stadium")
- On selection: sets input value to the selected name, calls `onSelect(selectedName)`
- Shows loading spinner while fetching, "No results" when empty
- Keyboard navigation (arrow keys + Enter)

**2. Update `src/services/foursquareService.ts`**

- Add `suggestPOIs(query: string, screens: Screen[]): Promise<{name: string, type: string}[]>` 
- Uses a single regional center (largest cluster) with a wide radius
- Deduplicates results by name (case-insensitive) so "Chase Bank" appears once, not 50 times
- Returns unique name + category pairs, sorted by frequency

**3. Update `src/pages/Screens.tsx`**

- Replace the plain `Input` for POI search with `<POIAutocomplete>`
- On selection from dropdown, auto-set `poiSearchQuery` and call `handlePoiSearch()`
- User can still type freely and press Enter/Search to skip suggestions

**4. Update `src/pages/CampaignCreate.tsx`**

- Same replacement of the POI input with `<POIAutocomplete>` for consistency

### Files changed

| File | Change |
|---|---|
| `src/components/shared/POIAutocomplete.tsx` | New — autocomplete input with dropdown |
| `src/services/foursquareService.ts` | Add `suggestPOIs` function |
| `src/pages/Screens.tsx` | Swap POI input for `POIAutocomplete` |
| `src/pages/CampaignCreate.tsx` | Swap POI input for `POIAutocomplete` |

