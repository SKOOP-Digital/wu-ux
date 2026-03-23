export interface Placement {
  id: string;
  name: string;
  scope: "Venue" | "Group" | "Screen";
  venue: string;
  model: "Loop" | "Ad-break";
  owned: number;
  direct: number;
  prog: number;
  dayparts: string;
  status: string;
  screenIds: string[]; // references Screen.id
}

export const allPlacements: Placement[] = [
  {
    id: "pl-1",
    name: "Lobby Screens — Main Loop",
    scope: "Venue",
    venue: "Westfield Sydney",
    model: "Loop",
    owned: 50, direct: 30, prog: 20,
    dayparts: "All Day",
    status: "Healthy",
    screenIds: ["scr-1", "scr-2", "scr-3", "scr-4", "scr-5", "scr-6"],
  },
  {
    id: "pl-2",
    name: "Food Court Digital Menu Boards",
    scope: "Group",
    venue: "Melbourne Central",
    model: "Ad-break",
    owned: 40, direct: 40, prog: 20,
    dayparts: "11am–9pm",
    status: "Overbooked",
    screenIds: ["scr-7", "scr-8", "scr-9", "scr-10"],
  },
  {
    id: "pl-3",
    name: "Elevator Portrait Panels",
    scope: "Screen",
    venue: "Brisbane CBD Tower",
    model: "Loop",
    owned: 60, direct: 25, prog: 15,
    dayparts: "7am–7pm",
    status: "Healthy",
    screenIds: ["scr-11", "scr-12", "scr-13", "scr-14"],
  },
  {
    id: "pl-4",
    name: "Parking Entry Totems",
    scope: "Group",
    venue: "Perth Arena",
    model: "Ad-break",
    owned: 70, direct: 20, prog: 10,
    dayparts: "6am–11pm",
    status: "Healthy",
    screenIds: ["scr-15", "scr-16", "scr-17"],
  },
  {
    id: "pl-5",
    name: "Concourse Video Wall",
    scope: "Screen",
    venue: "Westfield Sydney",
    model: "Loop",
    owned: 30, direct: 50, prog: 20,
    dayparts: "9am–9pm",
    status: "At Risk",
    screenIds: ["scr-18"],
  },
  {
    id: "pl-draft-1",
    name: "New Draft Placement",
    scope: "Screen",
    venue: "",
    model: "Loop",
    owned: 50, direct: 30, prog: 20,
    dayparts: "All Day",
    status: "Draft",
    screenIds: [],
  },
];

/** Calculate capacity for a placement based on its assigned screens */
export function calcCapacity(screenIds: string[], screensData: { id: string; loopsPerHour: number }[]) {
  const matched = screensData.filter(s => screenIds.includes(s.id));
  // Each screen contributes loopsPerHour * 16 operating hours per day
  const total = matched.reduce((sum, s) => sum + s.loopsPerHour * 16, 0);
  const booked = Math.round(total * 0.82); // simulated 82% utilisation
  return { total, booked, available: total - booked };
}
