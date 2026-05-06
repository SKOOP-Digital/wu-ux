export interface Placement {
  id: string;
  name: string;
  scope: "Venue" | "Group" | "Screen";
  venue: string;
  venueType: string;
  region: string;
  model: "Loop" | "Ad-break";
  houseFill: number;
  sold: number;
  prog: number;
  dayparts: string;
  activeHours: number;
  status: string;
  screenCount: number;
  screenIds: string[]; // references Screen.id
  defaultPlayDuration: number; // seconds
  capacityUsagePct: number;
}

/** Derive plays/day for a rule from its screen count, active hours, and play duration */
export function calcPlaysPerDay(p: Pick<Placement, "screenCount" | "activeHours" | "defaultPlayDuration">) {
  const playsPerScreenPerHour = 3600 / p.defaultPlayDuration;
  return Math.round(p.screenCount * playsPerScreenPerHour * p.activeHours);
}

export function calcCapacityFromRule(p: Pick<Placement, "screenCount" | "activeHours" | "defaultPlayDuration" | "capacityUsagePct">) {
  const total = calcPlaysPerDay(p);
  const booked = Math.round(total * (p.capacityUsagePct / 100));
  return { total, booked, available: total - booked };
}

export const allPlacements: Placement[] = [
  {
    id: "pl-1",
    name: "Financial Banks · Northeast",
    scope: "Group",
    venue: "Northeast",
    venueType: "financial.banks",
    region: "New York, Boston, Philadelphia",
    model: "Loop",
    houseFill: 50, sold: 30, prog: 20,
    dayparts: "8am–6pm",
    activeHours: 10,
    status: "Healthy",
    screenCount: 480,
    screenIds: [],
    defaultPlayDuration: 15,
    capacityUsagePct: 78,
  },
  {
    id: "pl-2",
    name: "Urban Panels · National",
    scope: "Group",
    venue: "National",
    venueType: "outdoor.urban_panels",
    region: "National",
    model: "Loop",
    houseFill: 40, sold: 35, prog: 25,
    dayparts: "6am–11pm",
    activeHours: 17,
    status: "Overbooked",
    screenCount: 652,
    screenIds: [],
    defaultPlayDuration: 15,
    capacityUsagePct: 91,
  },
  {
    id: "pl-3",
    name: "Convenience Stores · Midwest & South",
    scope: "Group",
    venue: "Midwest & South",
    venueType: "retail.convenience_store",
    region: "Chicago, Dallas, Houston, Atlanta",
    model: "Loop",
    houseFill: 50, sold: 25, prog: 25,
    dayparts: "7am–10pm",
    activeHours: 15,
    status: "Healthy",
    screenCount: 411,
    screenIds: [],
    defaultPlayDuration: 10,
    capacityUsagePct: 62,
  },
  {
    id: "pl-4",
    name: "Grocery Retail · West Coast",
    scope: "Group",
    venue: "West Coast",
    venueType: "retail.grocery",
    region: "Los Angeles, San Francisco, Seattle, Portland",
    model: "Loop",
    houseFill: 55, sold: 25, prog: 20,
    dayparts: "8am–9pm",
    activeHours: 13,
    status: "Healthy",
    screenCount: 377,
    screenIds: [],
    defaultPlayDuration: 15,
    capacityUsagePct: 44,
  },
  {
    id: "pl-5",
    name: "Pharmacies · National",
    scope: "Group",
    venue: "National",
    venueType: "retail.pharmacies",
    region: "National",
    model: "Loop",
    houseFill: 60, sold: 20, prog: 20,
    dayparts: "9am–8pm",
    activeHours: 11,
    status: "At Risk",
    screenCount: 71,
    screenIds: [],
    defaultPlayDuration: 15,
    capacityUsagePct: 85,
  },
  {
    id: "pl-6",
    name: "Financial Banks · Southwest & Rocky Mountain",
    scope: "Group",
    venue: "Southwest & Rocky Mountain",
    venueType: "financial.banks",
    region: "Denver, Phoenix, Las Vegas, Salt Lake City, Albuquerque",
    model: "Loop",
    houseFill: 50, sold: 30, prog: 20,
    dayparts: "8am–6pm",
    activeHours: 10,
    status: "Healthy",
    screenCount: 709,
    screenIds: [],
    defaultPlayDuration: 15,
    capacityUsagePct: 55,
  },
];

/** Legacy helper kept for backward compat with screen-based calculations */
export function calcCapacity(screenIds: string[], screensData: { id: string; loopsPerHour: number }[]) {
  const matched = screensData.filter(s => screenIds.includes(s.id));
  const total = matched.reduce((sum, s) => sum + s.loopsPerHour * 16, 0);
  const booked = Math.round(total * 0.82);
  return { total, booked, available: total - booked };
}
