

## Fix Proximity UX — Show Screens Near POIs, Not POI Locations

### The Problem

The current flow forces users through an unnecessary intermediate step:
1. Search "CVS" → see a list of CVS store locations as clickable chips
2. Manually click each CVS chip to "select" it
3. Only then do screens filter

This makes it look like we're showing CVS stores, not screens. The user expects: type "CVS", hit search → immediately see only the screens within X miles of any CVS.

### The Fix

**Auto-select all POI results on search** and hide the individual POI chips. The flow becomes:

1. User types "CVS", picks radius (1 mi), clicks Search
2. Edge function finds all CVS locations in the network area
3. All returned POIs are automatically set as `selectedPOIs`
4. `getScreensNearPOIs` filters screens → table updates instantly
5. Banner shows: "78 screens within 1 mi of CVS"

### Changes in `src/pages/Screens.tsx`

1. **In `handlePoiSearch`**: After fetching results, auto-set `setSelectedPOIs(results)` instead of just `setPoiResults(results)`. Store the search query for display in the banner.

2. **Remove POI chips section**: Delete the section that displays individual POI results as selectable chips (lines ~296-327). Users don't need to see/select individual store locations.

3. **Update the banner**: Show the search term (e.g. "CVS") instead of listing individual POI names. Change from `selectedPOIs.map(p => p.name).join(', ')` to the original search query string.

4. **Add a "clear" button** to the proximity section so users can reset and search again.

5. **Show state feedback**: When searching, show "Searching for CVS locations..." then "Found 12 CVS locations — filtering screens..." then the final result in the banner.

### Single file changed

| File | Change |
|---|---|
| `src/pages/Screens.tsx` | Auto-apply POIs on search, remove POI chip picker, update banner text |

