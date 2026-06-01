export interface CdmValue { id: string; value: string; screenCount: number; }
export interface CdmKey   { id: string; key: string; isAuto: boolean; values: CdmValue[]; createdAt: string; }

/** Geo keys that are already derived from screen address data — shown in CDM table but not injected
 *  into the tag selector a second time (getAllScreenTags already emits them). */
export const GEO_CDM_KEYS = new Set(["city", "state", "zip", "country"]);

export const defaultCdmKeys: CdmKey[] = [
  { id: "ck-city",    key: "city",    isAuto: true,  createdAt: "—", values: [
    { id: "cv-1",  value: "Toronto",       screenCount: 14 },
    { id: "cv-2",  value: "Montreal",      screenCount: 8  },
    { id: "cv-3",  value: "Los Angeles",   screenCount: 22 },
    { id: "cv-4",  value: "Birmingham",    screenCount: 6  },
  ]},
  { id: "ck-state",   key: "state",   isAuto: true,  createdAt: "—", values: [
    { id: "cv-5",  value: "Ontario",       screenCount: 23 },
    { id: "cv-6",  value: "California",    screenCount: 38 },
    { id: "cv-7",  value: "Alabama",       screenCount: 8  },
    { id: "cv-8",  value: "Quebec",        screenCount: 12 },
  ]},
  { id: "ck-zip",     key: "zip",     isAuto: true,  createdAt: "—", values: [
    { id: "cv-9",  value: "90201",    screenCount: 3 },
    { id: "cv-10", value: "36830",    screenCount: 2 },
    { id: "cv-11", value: "V2T2X8",   screenCount: 1 },
    { id: "cv-12", value: "93203",    screenCount: 3 },
  ]},
  { id: "ck-country", key: "country", isAuto: true,  createdAt: "—", values: [
    { id: "cv-13", value: "United States", screenCount: 198 },
    { id: "cv-14", value: "Canada",        screenCount: 47  },
    { id: "cv-15", value: "Brazil",        screenCount: 1   },
  ]},
  { id: "ck-folder",  key: "folder",  isAuto: true,  createdAt: "—", values: [
    { id: "cv-f1", value: "Kroger Network",       screenCount: 38 },
    { id: "cv-f2", value: "WU Partners",          screenCount: 24 },
    { id: "cv-f3", value: "Pilot Screens",        screenCount: 9  },
    { id: "cv-f4", value: "Inactive / Archived",  screenCount: 14 },
    { id: "cv-f5", value: "Continental Forex",    screenCount: 17 },
    { id: "cv-f6", value: "Independent Retail",   screenCount: 31 },
  ]},
  { id: "ck-vt",  key: "venue_type",   isAuto: false, createdAt: "Mar 5, 2025", values: [
    { id: "cv-16", value: "Grocery Chain",     screenCount: 45 },
    { id: "cv-17", value: "Check Cashing",     screenCount: 12 },
    { id: "cv-18", value: "Currency Exchange", screenCount: 8  },
  ]},
  { id: "ck-nt",  key: "network_tier", isAuto: false, createdAt: "Apr 2, 2025", values: [
    { id: "cv-19", value: "Premium",  screenCount: 20 },
    { id: "cv-20", value: "Standard", screenCount: 35 },
  ]},
];
