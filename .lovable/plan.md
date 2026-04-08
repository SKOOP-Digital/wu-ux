

## Proximity Filter UX — Show Only Matching Screens

### Problem
When a user selects a POI like "CVS" with a 1-mile radius, the table already filters to matching screens, but there's no clear summary banner telling the user what they're looking at. The count is buried in small text next to filter chips.

### What changes

**1. Add a prominent results banner** (in `src/pages/Screens.tsx`)

When proximity filters are active, render a highlighted banner above the table:

```text
┌─────────────────────────────────────────────────┐
│  📍 78 screens within 1 mi of CVS               │
│     Showing only screens that match your filters │
└─────────────────────────────────────────────────┘
```

- Uses `filteredScreens.length` for the count
- Dynamically builds the message from `proximityRadius` and `selectedPOIs` names
- When both text + proximity filters are active, the banner reads e.g. "78 screens match your filters (within 1 mi of CVS)"
- Styled as an info-card with a MapPin icon and the primary accent color

**2. Auto-apply POI on selection**

Currently the user must: search → click a POI chip to select it → the table filters. This already works. No change needed to the filtering logic itself — `proximityFilteredScreens` and `filteredScreens` already intersect/union correctly.

**3. Hide unmatched screens (already working)**

The existing `filteredScreens` array already excludes non-matching screens. The table renders only `filteredScreens`. No logic change needed — just the UX banner.

### Single file changed

| File | Change |
|---|---|
| `src/pages/Screens.tsx` | Add results summary banner between filter chips and the table |

### Implementation detail

Insert a new `div` between the filter toolbar card (line ~350) and the table section (line ~353). The banner renders conditionally when `hasFilters` is true:

```tsx
{hasFilters && (
  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
    <MapPin size={16} className="text-primary shrink-0" />
    <div>
      <p className="text-sm font-semibold text-foreground">
        {filteredScreens.length} screen{filteredScreens.length !== 1 ? 's' : ''}
        {selectedPOIs.length > 0 && ` within ${proximityRadius} mi of ${selectedPOIs.map(p => p.name).join(', ')}`}
      </p>
      <p className="text-xs text-muted-foreground">
        Showing only screens that match your filters
      </p>
    </div>
  </div>
)}
```

