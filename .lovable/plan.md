

## Add "Play Frequency" Delivery Mode to Campaign Step 4

### What changes

Add a third delivery mode tab ("Play Frequency") to Step 4 of the Campaign Creation wizard, alongside the existing "% of Screen Time" and "Total Plays" modes.

### Changes in `src/pages/CampaignCreate.tsx`

**1. State**
- Expand `deliveryMode` type from `"sov" | "total"` to `"sov" | "total" | "frequency"`
- Add two new state variables: `playFrequencyValue` (number, default 4) and `playFrequencyUnit` ("minutes" | "hours", default "minutes")

**2. Capacity calculation (`capacitySummary` useMemo)**
- Add a `frequency` branch: convert frequency to plays/day using `activeHoursPerDay * (60 / frequencyMinutes)` per screen, multiplied by total screens
- Set `requested` to this calculated value so conflict detection works identically to the other modes

**3. Estimated daily plays (`estimatedDailyPlays` useMemo)**
- Add frequency branch returning the same calculated plays/day

**4. Step 4 UI (`renderStep4`)**
- Add third toggle button "Play Frequency"
- When selected, show:
  - Numeric input labeled "Play every" + a select dropdown for Minutes/Hours
  - Estimated Delivery box showing plays/day and total plays over campaign flight
- Conflict card already renders based on `capacitySummary.fits` — no changes needed there

**5. Review step (Step 6)**
- Update the Delivery Target display to show frequency mode text (e.g. "Every 4 minutes")

### No other files change

All logic is self-contained in `CampaignCreate.tsx`. The conflict panel, capacity summary panel, and warning icon on the Next button all already react to `capacitySummary.fits` — they'll work automatically with the new mode.

