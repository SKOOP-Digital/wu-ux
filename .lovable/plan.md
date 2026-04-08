

## Update Campaign Builder Proximity Search to Match Screens Page

### Problem
The Campaign Create page (Step 2) still uses the old POI search pattern:
- Shows individual POI location chips that users must manually click to select
- Displays POI addresses instead of focusing on screen counts
- Doesn't auto-apply all found POIs on search
- Missing the results banner showing "X screens within Y mi of Z"
- Missing clear button

### Changes

**Single file: `src/pages/CampaignCreate.tsx`**

1. **Auto-apply POIs on search** — Update `handleCampaignPoiSearch` to set `proximityPOIs` directly with all results (like Screens page does with `setSelectedPOIs`), add `activePoiQuery` and `poiSearched` state, remove `poiResults` state entirely.

2. **Remove the POI chip picker** — Delete the `poiResults` section (lines 482-506) that shows individual POI locations as selectable chips. Also remove the `selectedPOIs` chip display (lines 436-445).

3. **Add results banner** — After search completes, show a banner like: "144 screens within 1 mi of CVS" with a clear/reset button, matching the Screens page pattern.

4. **Update description text** — Change "Find screens near specific points of interest using Foursquare" to just "Find screens near specific points of interest."

5. **Clean up unused state** — Remove `poiResults` / `setPoiResults` state since POIs are now auto-applied without user selection.

