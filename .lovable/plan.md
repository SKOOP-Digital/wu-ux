

## Fix Tag UI on Campaign Create — Collapsible Grouped Tags

### Problem
The "Target by Tags" section on Step 2 dumps every tag as a flat list of chips. With hundreds of tags (cities, states, ZIPs, manual tags), this is overwhelming and unusable.

### Solution
Group tags by their `category` (Country, State, City, ZIP, manual venue tags) into collapsible sections. Each section shows a header with count, is collapsed by default, and expands on click. The search box filters across all groups and auto-expands matching groups.

### Changes — single file: `src/pages/CampaignCreate.tsx`

1. **Group `filteredTags` by category** — Create a `groupedTags` memo that buckets tags into categories: "Country", "State", "City", "ZIP", "Venue" (manual). Each group gets a label and its tags sorted by screen count descending.

2. **Collapsible sections** — Replace the flat `flex-wrap` tag list (lines 408-423) with category sections. Each section has:
   - A clickable header: "State (12)" with a chevron
   - Collapsed by default (show nothing)
   - When expanded, show the tag chips (limited to ~20 with a "Show all" toggle)
   - When `tagSearch` is active, auto-expand groups that have matches and hide empty groups

3. **Add `expandedTagGroups` state** — `useState<string[]>([])` to track which groups are open. When `tagSearch` changes, auto-expand all groups with matches.

4. **Cap visible tags per group** — Show first 15 tags per group with a "Show all X" link to prevent overwhelming the UI even within a group.

### Result
Tags go from a wall of 200+ chips to 5 neat collapsible sections. Search still works across all groups. Much cleaner UX.

