

## Skoop Wiki Page for Western Union

**What**: A standalone HTML reference guide documenting the Skoop platform, saved to `/mnt/documents/`. It will include real screenshots captured from the live app and follow the exact structure, tone, and design requirements specified.

**Approach**:

### Phase 1 — Screenshot Capture
Navigate to the live app at the published URL and capture screenshots of:
- Overview page (flow diagram)
- Network Rules list (`/placements`)
- Network Rule creation — each collapsible section expanded (`/placements/new`)
- Campaign list (`/campaigns`)
- Campaign creation wizard — all 6 steps (`/campaigns/create`)
- Conflict state on Step 4 (capacity panel with conflict)

Each screenshot will be embedded as base64 data URIs in the HTML so the file is fully self-contained.

### Phase 2 — HTML Document
Build a single `skoop-wiki.html` file with:

- **Layout**: Dark sidebar (`#10181f`) with sticky nav + white content area, responsive single-column on mobile
- **Sections**: How It Works, Network Rules, Creating a Campaign (6 sub-steps), Conflict Detection, Alerts
- **Styling**: Inline CSS using Skoop brand colors (teal `#00b7af`, dark `#10181f`), Inter font, clean wiki aesthetic
- **Content**: Plain English, ops-team tone, step-by-step instructions with inline screenshots
- **Footer**: "Prepared by Skoop for Western Union · 2026"

### Technical Details
- Self-contained HTML — no external dependencies except Google Fonts
- Screenshots embedded as base64 PNGs
- CSS media queries for mobile responsiveness
- Smooth-scroll anchor links in sidebar
- Output: `/mnt/documents/skoop-wiki.html`

