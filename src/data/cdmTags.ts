// Auto-generated from WU devices list CSV — do not edit by hand.
// Regenerate: node scripts/build-screen-tags.mjs && node scripts/generate-cdm-data.mjs

export interface CdmValue { id: string; value: string; screenCount: number; }
export interface CdmKey   { id: string; key: string; isAuto: boolean; values: CdmValue[]; createdAt: string; }

/** Geo keys derived from screen address fields — not duplicated in tag pickers. */
export const GEO_CDM_KEYS = new Set(["city", "state", "zip", "country"]);

export const CDM_KEY_LABELS: Record<string, string> = {
  region: "Region",
  brand: "Brand",
  category: "Category",
  agent_partner: "Agent Partner",
  partner: "Partner",
  audience_grouping: "Audience Grouping",
  audience: "Audience Corridor",
  unit_type: "Unit Type",
  device_type: "Device Type",
  facing: "Facing",
  vendor_partner: "Vendor Partner",
  dma: "DMA",
  pool: "Pool",
  bundle: "Bundle",
  pom_bucket: "POM Bucket",
  country: "Country",
  state: "State",
  city: "City",
  zip: "Zip",
};

export const defaultCdmKeys: CdmKey[] = [
  {
    "id": "ck-1",
    "key": "region",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-region-1",
        "value": "East",
        "screenCount": 1193
      },
      {
        "id": "cv-region-2",
        "value": "Central",
        "screenCount": 784
      },
      {
        "id": "cv-region-3",
        "value": "West",
        "screenCount": 433
      },
      {
        "id": "cv-region-4",
        "value": "Canada",
        "screenCount": 1
      }
    ]
  },
  {
    "id": "ck-2",
    "key": "brand",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-brand-1",
        "value": "WU",
        "screenCount": 1849
      },
      {
        "id": "cv-brand-2",
        "value": "VG",
        "screenCount": 477
      },
      {
        "id": "cv-brand-3",
        "value": "OV",
        "screenCount": 64
      }
    ]
  },
  {
    "id": "ck-3",
    "key": "category",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-category-1",
        "value": "Independent",
        "screenCount": 1012
      },
      {
        "id": "cv-category-2",
        "value": "Strategic",
        "screenCount": 935
      },
      {
        "id": "cv-category-3",
        "value": "Regional",
        "screenCount": 361
      }
    ]
  },
  {
    "id": "ck-4",
    "key": "agent_partner",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-agent_partner-1",
        "value": "Independent In Lane",
        "screenCount": 1100
      },
      {
        "id": "cv-agent_partner-2",
        "value": "Advance America",
        "screenCount": 472
      },
      {
        "id": "cv-agent_partner-3",
        "value": "CFSC",
        "screenCount": 195
      },
      {
        "id": "cv-agent_partner-4",
        "value": "Pay-O-Matic",
        "screenCount": 150
      },
      {
        "id": "cv-agent_partner-5",
        "value": "Barr Management",
        "screenCount": 92
      },
      {
        "id": "cv-agent_partner-6",
        "value": "Continental Currency",
        "screenCount": 48
      },
      {
        "id": "cv-agent_partner-7",
        "value": "Western Union Corporate O&O",
        "screenCount": 43
      },
      {
        "id": "cv-agent_partner-8",
        "value": "A1 Check Cashing",
        "screenCount": 40
      },
      {
        "id": "cv-agent_partner-9",
        "value": "West Suburban",
        "screenCount": 38
      },
      {
        "id": "cv-agent_partner-10",
        "value": "New Lincoln Addison",
        "screenCount": 37
      },
      {
        "id": "cv-agent_partner-11",
        "value": "GFG Management",
        "screenCount": 34
      },
      {
        "id": "cv-agent_partner-12",
        "value": "CHECK CASHING USA",
        "screenCount": 32
      },
      {
        "id": "cv-agent_partner-13",
        "value": "Economy CE",
        "screenCount": 25
      },
      {
        "id": "cv-agent_partner-14",
        "value": "Keller 6365",
        "screenCount": 25
      },
      {
        "id": "cv-agent_partner-15",
        "value": "David's Check Cashing",
        "screenCount": 23
      },
      {
        "id": "cv-agent_partner-16",
        "value": "Rumba Money Centers",
        "screenCount": 20
      },
      {
        "id": "cv-agent_partner-17",
        "value": "Chicago Financial Network",
        "screenCount": 16
      },
      {
        "id": "cv-agent_partner-18",
        "value": "Chavez Supermarket",
        "screenCount": 11
      },
      {
        "id": "cv-agent_partner-19",
        "value": "Western North",
        "screenCount": 10
      }
    ]
  },
  {
    "id": "ck-5",
    "key": "partner",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-partner-1",
        "value": "Advance-America",
        "screenCount": 468
      },
      {
        "id": "cv-partner-2",
        "value": "CFSC",
        "screenCount": 194
      },
      {
        "id": "cv-partner-3",
        "value": "Pay-O-Matic",
        "screenCount": 150
      },
      {
        "id": "cv-partner-4",
        "value": "Barr-Management",
        "screenCount": 92
      },
      {
        "id": "cv-partner-5",
        "value": "Continental-Currency",
        "screenCount": 48
      },
      {
        "id": "cv-partner-6",
        "value": "A1-Check-Cashing",
        "screenCount": 40
      },
      {
        "id": "cv-partner-7",
        "value": "Kroger",
        "screenCount": 38
      },
      {
        "id": "cv-partner-8",
        "value": "West-Suburban",
        "screenCount": 36
      },
      {
        "id": "cv-partner-9",
        "value": "New-Lincoln-Addison",
        "screenCount": 35
      },
      {
        "id": "cv-partner-10",
        "value": "Check-Cashing-USA",
        "screenCount": 32
      },
      {
        "id": "cv-partner-11",
        "value": "GFG",
        "screenCount": 32
      },
      {
        "id": "cv-partner-12",
        "value": "Keller-6365",
        "screenCount": 25
      },
      {
        "id": "cv-partner-13",
        "value": "Economy-CE",
        "screenCount": 24
      },
      {
        "id": "cv-partner-14",
        "value": "Davids-Check-Cashing",
        "screenCount": 23
      },
      {
        "id": "cv-partner-15",
        "value": "Rumba-Money-Centers",
        "screenCount": 20
      },
      {
        "id": "cv-partner-16",
        "value": "Chicago-Financial-Network",
        "screenCount": 16
      },
      {
        "id": "cv-partner-17",
        "value": "Chavez-Supermarkets",
        "screenCount": 11
      },
      {
        "id": "cv-partner-18",
        "value": "Western-North",
        "screenCount": 10
      },
      {
        "id": "cv-partner-19",
        "value": "Oportun",
        "screenCount": 10
      }
    ]
  },
  {
    "id": "ck-6",
    "key": "audience_grouping",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-audience_grouping-1",
        "value": "Spanish-Speaking Countries-LATAMCA",
        "screenCount": 1064
      },
      {
        "id": "cv-audience_grouping-2",
        "value": "LATAMCA",
        "screenCount": 245
      },
      {
        "id": "cv-audience_grouping-3",
        "value": "North America",
        "screenCount": 140
      },
      {
        "id": "cv-audience_grouping-4",
        "value": "Asia",
        "screenCount": 57
      },
      {
        "id": "cv-audience_grouping-5",
        "value": "Spanish-Speaking Countries",
        "screenCount": 26
      },
      {
        "id": "cv-audience_grouping-6",
        "value": "Africa",
        "screenCount": 17
      },
      {
        "id": "cv-audience_grouping-7",
        "value": "Europe",
        "screenCount": 12
      },
      {
        "id": "cv-audience_grouping-8",
        "value": "MENA",
        "screenCount": 9
      }
    ]
  },
  {
    "id": "ck-7",
    "key": "audience",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-audience-1",
        "value": "US-to-LATAMCA",
        "screenCount": 403
      },
      {
        "id": "cv-audience-2",
        "value": "US-to-Spanish-Speaking-Countries",
        "screenCount": 324
      },
      {
        "id": "cv-audience-3",
        "value": "US-to-US",
        "screenCount": 42
      },
      {
        "id": "cv-audience-4",
        "value": "US-to-Asia",
        "screenCount": 15
      },
      {
        "id": "cv-audience-5",
        "value": "US-to-Africa",
        "screenCount": 6
      },
      {
        "id": "cv-audience-6",
        "value": "US-to-Europe",
        "screenCount": 2
      },
      {
        "id": "cv-audience-7",
        "value": "US-to-MENA",
        "screenCount": 1
      }
    ]
  },
  {
    "id": "ck-8",
    "key": "unit_type",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-unit_type-1",
        "value": "dual sided window",
        "screenCount": 1199
      },
      {
        "id": "cv-unit_type-2",
        "value": "countertop",
        "screenCount": 423
      },
      {
        "id": "cv-unit_type-3",
        "value": "freestanding",
        "screenCount": 416
      },
      {
        "id": "cv-unit_type-4",
        "value": "wall mount",
        "screenCount": 346
      },
      {
        "id": "cv-unit_type-5",
        "value": "digi conversion",
        "screenCount": 26
      },
      {
        "id": "cv-unit_type-6",
        "value": "ceiling mount",
        "screenCount": 1
      }
    ]
  },
  {
    "id": "ck-9",
    "key": "device_type",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-device_type-1",
        "value": "windows",
        "screenCount": 1258
      },
      {
        "id": "cv-device_type-2",
        "value": "brightsign",
        "screenCount": 1153
      }
    ]
  },
  {
    "id": "ck-10",
    "key": "facing",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-facing-1",
        "value": "in",
        "screenCount": 1808
      },
      {
        "id": "cv-facing-2",
        "value": "out",
        "screenCount": 601
      }
    ]
  },
  {
    "id": "ck-11",
    "key": "vendor_partner",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-vendor_partner-1",
        "value": "KIS",
        "screenCount": 1196
      },
      {
        "id": "cv-vendor_partner-2",
        "value": "CRI",
        "screenCount": 1148
      },
      {
        "id": "cv-vendor_partner-3",
        "value": "CoolerScreens",
        "screenCount": 62
      }
    ]
  },
  {
    "id": "ck-12",
    "key": "dma",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-dma-1",
        "value": "New York, NY",
        "screenCount": 491
      },
      {
        "id": "cv-dma-2",
        "value": "Chicago, IL",
        "screenCount": 370
      },
      {
        "id": "cv-dma-3",
        "value": "Los Angeles, CA",
        "screenCount": 198
      },
      {
        "id": "cv-dma-4",
        "value": "Miami-Ft. Lauderdale, FL",
        "screenCount": 146
      },
      {
        "id": "cv-dma-5",
        "value": "Houston, TX",
        "screenCount": 133
      },
      {
        "id": "cv-dma-6",
        "value": "Atlanta, GA",
        "screenCount": 84
      },
      {
        "id": "cv-dma-7",
        "value": "Boston, MA",
        "screenCount": 82
      },
      {
        "id": "cv-dma-8",
        "value": "Dallas-Ft. Worth, TX",
        "screenCount": 66
      },
      {
        "id": "cv-dma-9",
        "value": "Orlando, FL",
        "screenCount": 51
      },
      {
        "id": "cv-dma-10",
        "value": "Philadelphia, PA",
        "screenCount": 42
      },
      {
        "id": "cv-dma-11",
        "value": "Tampa, FL",
        "screenCount": 40
      },
      {
        "id": "cv-dma-12",
        "value": "Sacramento-Stockton-Modesto, CA",
        "screenCount": 39
      },
      {
        "id": "cv-dma-13",
        "value": "Washington, DC",
        "screenCount": 36
      },
      {
        "id": "cv-dma-14",
        "value": "Fresno-Visalia, CA",
        "screenCount": 30
      },
      {
        "id": "cv-dma-15",
        "value": "San Francisco-Oakland-San Jose, CA",
        "screenCount": 29
      },
      {
        "id": "cv-dma-16",
        "value": "West Palm Beach-Ft. Pierce, FL",
        "screenCount": 28
      },
      {
        "id": "cv-dma-17",
        "value": "Jacksonville, FL",
        "screenCount": 26
      },
      {
        "id": "cv-dma-18",
        "value": "Ft. Myers-Naples, FL",
        "screenCount": 25
      },
      {
        "id": "cv-dma-19",
        "value": "San Antonio, TX",
        "screenCount": 24
      },
      {
        "id": "cv-dma-20",
        "value": "San Diego, CA",
        "screenCount": 23
      },
      {
        "id": "cv-dma-21",
        "value": "Las Vegas, NV",
        "screenCount": 20
      },
      {
        "id": "cv-dma-22",
        "value": "Bakersfield, CA",
        "screenCount": 16
      },
      {
        "id": "cv-dma-23",
        "value": "Denver, CO",
        "screenCount": 15
      },
      {
        "id": "cv-dma-24",
        "value": "Austin, TX",
        "screenCount": 15
      },
      {
        "id": "cv-dma-25",
        "value": "Charlotte, NC",
        "screenCount": 15
      },
      {
        "id": "cv-dma-26",
        "value": "Minneapolis-St. Paul, MN",
        "screenCount": 14
      },
      {
        "id": "cv-dma-27",
        "value": "Milwaukee, WI",
        "screenCount": 14
      },
      {
        "id": "cv-dma-28",
        "value": "Providence, RI",
        "screenCount": 13
      },
      {
        "id": "cv-dma-29",
        "value": "Salt Lake City, UT",
        "screenCount": 10
      },
      {
        "id": "cv-dma-30",
        "value": "New Orleans, LA",
        "screenCount": 10
      },
      {
        "id": "cv-dma-31",
        "value": "Phoenix, AZ",
        "screenCount": 10
      },
      {
        "id": "cv-dma-32",
        "value": "Portland-Auburn, ME",
        "screenCount": 10
      },
      {
        "id": "cv-dma-33",
        "value": "Detroit, MI",
        "screenCount": 10
      },
      {
        "id": "cv-dma-34",
        "value": "Nashville, TN",
        "screenCount": 9
      },
      {
        "id": "cv-dma-35",
        "value": "Greensboro-High Point-Winston Salem, NC",
        "screenCount": 9
      },
      {
        "id": "cv-dma-36",
        "value": "Santa Barbara-Santa Maria-San Luis Obispo, CA",
        "screenCount": 9
      },
      {
        "id": "cv-dma-37",
        "value": "Waco-Temple-Bryan, TX",
        "screenCount": 8
      },
      {
        "id": "cv-dma-38",
        "value": "Mobile, AL",
        "screenCount": 8
      },
      {
        "id": "cv-dma-39",
        "value": "Birmingham, AL",
        "screenCount": 7
      },
      {
        "id": "cv-dma-40",
        "value": "Greenville-Spartanburg, SC",
        "screenCount": 7
      },
      {
        "id": "cv-dma-41",
        "value": "Raleigh-Durham, NC",
        "screenCount": 7
      },
      {
        "id": "cv-dma-42",
        "value": "Tallahassee, FL",
        "screenCount": 7
      },
      {
        "id": "cv-dma-43",
        "value": "Panama City, FL",
        "screenCount": 7
      },
      {
        "id": "cv-dma-44",
        "value": "Baltimore, MD",
        "screenCount": 6
      },
      {
        "id": "cv-dma-45",
        "value": "Gainesville, FL",
        "screenCount": 6
      },
      {
        "id": "cv-dma-46",
        "value": "Grand Rapids-Kalamazoo-Battle Creek, MI",
        "screenCount": 6
      },
      {
        "id": "cv-dma-47",
        "value": "Harlingen-Weslaco-Brownsville-McAllen, TX",
        "screenCount": 6
      },
      {
        "id": "cv-dma-48",
        "value": "Beaumont-Port Arthur, TX",
        "screenCount": 5
      },
      {
        "id": "cv-dma-49",
        "value": "Rockford, IL",
        "screenCount": 5
      },
      {
        "id": "cv-dma-50",
        "value": "Albuquerque-Santa Fe, NM",
        "screenCount": 5
      },
      {
        "id": "cv-dma-51",
        "value": "Macon, GA",
        "screenCount": 5
      },
      {
        "id": "cv-dma-52",
        "value": "Reno, NV",
        "screenCount": 5
      },
      {
        "id": "cv-dma-53",
        "value": "Seattle-Tacoma, WA",
        "screenCount": 5
      },
      {
        "id": "cv-dma-54",
        "value": "Hartford & New Haven, CT",
        "screenCount": 5
      },
      {
        "id": "cv-dma-55",
        "value": "Palm Springs, CA",
        "screenCount": 5
      },
      {
        "id": "cv-dma-56",
        "value": "Chico-Redding, CA",
        "screenCount": 5
      },
      {
        "id": "cv-dma-57",
        "value": "Columbus, OH",
        "screenCount": 4
      },
      {
        "id": "cv-dma-58",
        "value": "Chattanooga, TN",
        "screenCount": 4
      },
      {
        "id": "cv-dma-59",
        "value": "Norfolk-Portsmouth-Newport News, VA",
        "screenCount": 4
      },
      {
        "id": "cv-dma-60",
        "value": "Green Bay-Appleton, WI",
        "screenCount": 4
      },
      {
        "id": "cv-dma-61",
        "value": "Albany-Schenectady-Troy, NY",
        "screenCount": 4
      },
      {
        "id": "cv-dma-62",
        "value": "Harrisburg-Lancaster-Lebanon-York, PA",
        "screenCount": 4
      },
      {
        "id": "cv-dma-63",
        "value": "Tyler-Longview(Lufkin & Nacogdoches), TX",
        "screenCount": 4
      },
      {
        "id": "cv-dma-64",
        "value": "Corpus Christi, TX",
        "screenCount": 4
      },
      {
        "id": "cv-dma-65",
        "value": "Odessa-Midland, TX",
        "screenCount": 4
      },
      {
        "id": "cv-dma-66",
        "value": "Salisbury, MD",
        "screenCount": 4
      },
      {
        "id": "cv-dma-67",
        "value": "Springfield-Holyoke, MA",
        "screenCount": 4
      },
      {
        "id": "cv-dma-68",
        "value": "Memphis, TN",
        "screenCount": 3
      },
      {
        "id": "cv-dma-69",
        "value": "Paducah, KY",
        "screenCount": 3
      },
      {
        "id": "cv-dma-70",
        "value": "Cedar Rapids-Waterloo-Iowa City & Dubuque, IA",
        "screenCount": 3
      },
      {
        "id": "cv-dma-71",
        "value": "Yuma, AZ",
        "screenCount": 3
      },
      {
        "id": "cv-dma-72",
        "value": "Kansas City, MO",
        "screenCount": 3
      },
      {
        "id": "cv-dma-73",
        "value": "Cleveland-Akron (Canton), OH",
        "screenCount": 3
      },
      {
        "id": "cv-dma-74",
        "value": "Ft. Smith-Fayetteville-Springdale-Rogers, AR",
        "screenCount": 3
      },
      {
        "id": "cv-dma-75",
        "value": "Peoria-Bloomington, IL",
        "screenCount": 2
      },
      {
        "id": "cv-dma-76",
        "value": "Colorado Springs-Pueblo, CO",
        "screenCount": 2
      },
      {
        "id": "cv-dma-77",
        "value": "Champaign & Springfield-Decatur, IL",
        "screenCount": 2
      },
      {
        "id": "cv-dma-78",
        "value": "Florence-Myrtle Beach, SC",
        "screenCount": 2
      },
      {
        "id": "cv-dma-79",
        "value": "Laredo, TX",
        "screenCount": 2
      },
      {
        "id": "cv-dma-80",
        "value": "Syracuse, NY",
        "screenCount": 2
      },
      {
        "id": "cv-dma-81",
        "value": "Roanoke-Lynchburg, VA",
        "screenCount": 2
      },
      {
        "id": "cv-dma-82",
        "value": "Youngstown, OH",
        "screenCount": 2
      },
      {
        "id": "cv-dma-83",
        "value": "Monterey-Salinas, CA",
        "screenCount": 2
      },
      {
        "id": "cv-dma-84",
        "value": "Victoria, TX",
        "screenCount": 2
      },
      {
        "id": "cv-dma-85",
        "value": "Ft. Wayne, IN",
        "screenCount": 2
      },
      {
        "id": "cv-dma-86",
        "value": "Lima, OH",
        "screenCount": 2
      },
      {
        "id": "cv-dma-87",
        "value": "El Paso, TX",
        "screenCount": 2
      },
      {
        "id": "cv-dma-88",
        "value": "Abilene-Sweetwater, TX",
        "screenCount": 2
      },
      {
        "id": "cv-dma-89",
        "value": "Richmond-Petersburg, VA",
        "screenCount": 2
      },
      {
        "id": "cv-dma-90",
        "value": "Wichita Falls, TX",
        "screenCount": 2
      },
      {
        "id": "cv-dma-91",
        "value": "South Bend-Elkhart, IN",
        "screenCount": 1
      },
      {
        "id": "cv-dma-92",
        "value": "Columbus, GA",
        "screenCount": 1
      },
      {
        "id": "cv-dma-93",
        "value": "Savannah, GA",
        "screenCount": 1
      },
      {
        "id": "cv-dma-94",
        "value": "Augusta, GA",
        "screenCount": 1
      },
      {
        "id": "cv-dma-95",
        "value": "Madison, WI",
        "screenCount": 1
      },
      {
        "id": "cv-dma-96",
        "value": "Portland, OR",
        "screenCount": 1
      },
      {
        "id": "cv-dma-97",
        "value": "Cincinnati, OH",
        "screenCount": 1
      },
      {
        "id": "cv-dma-98",
        "value": "Hattiesburg-Laurel, MS",
        "screenCount": 1
      },
      {
        "id": "cv-dma-99",
        "value": "Lincoln & Hastings-Kearney, NE",
        "screenCount": 1
      },
      {
        "id": "cv-dma-100",
        "value": "Omaha, NE",
        "screenCount": 1
      },
      {
        "id": "cv-dma-101",
        "value": "Knoxville, TN",
        "screenCount": 1
      },
      {
        "id": "cv-dma-102",
        "value": "Toledo, OH",
        "screenCount": 1
      },
      {
        "id": "cv-dma-103",
        "value": "Wichita-Hutchinson, KS",
        "screenCount": 1
      },
      {
        "id": "cv-dma-104",
        "value": "Binghamton, NY",
        "screenCount": 1
      },
      {
        "id": "cv-dma-105",
        "value": "Utica, NY",
        "screenCount": 1
      },
      {
        "id": "cv-dma-106",
        "value": "Charleston, SC",
        "screenCount": 1
      },
      {
        "id": "cv-dma-107",
        "value": "Albany, GA",
        "screenCount": 1
      },
      {
        "id": "cv-dma-108",
        "value": "Little Rock-Pine Bluff, AR",
        "screenCount": 1
      },
      {
        "id": "cv-dma-109",
        "value": "Oklahoma City, OK",
        "screenCount": 1
      },
      {
        "id": "cv-dma-110",
        "value": "Burlington, VT",
        "screenCount": 1
      },
      {
        "id": "cv-dma-111",
        "value": "St. Louis, MO",
        "screenCount": 1
      },
      {
        "id": "cv-dma-112",
        "value": "Pittsburgh, PA",
        "screenCount": 1
      },
      {
        "id": "cv-dma-113",
        "value": "Amarillo, TX",
        "screenCount": 1
      },
      {
        "id": "cv-dma-114",
        "value": "Lansing, MI",
        "screenCount": 1
      },
      {
        "id": "cv-dma-115",
        "value": "Honolulu, HI",
        "screenCount": 1
      },
      {
        "id": "cv-dma-116",
        "value": "Bowling Green, KY",
        "screenCount": 1
      },
      {
        "id": "cv-dma-117",
        "value": "Parkersburg, WV",
        "screenCount": 1
      },
      {
        "id": "cv-dma-118",
        "value": "Lexington, KY",
        "screenCount": 1
      },
      {
        "id": "cv-dma-119",
        "value": "Evansville, IN",
        "screenCount": 1
      }
    ]
  },
  {
    "id": "ck-13",
    "key": "pool",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-pool-1",
        "value": "Pre-Paid-Stores",
        "screenCount": 493
      }
    ]
  },
  {
    "id": "ck-14",
    "key": "bundle",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-bundle-1",
        "value": "Disney-AA",
        "screenCount": 110
      }
    ]
  },
  {
    "id": "ck-15",
    "key": "pom_bucket",
    "isAuto": false,
    "createdAt": "Jul 2026",
    "values": [
      {
        "id": "cv-pom_bucket-1",
        "value": "open",
        "screenCount": 145
      },
      {
        "id": "cv-pom_bucket-2",
        "value": "closed",
        "screenCount": 5
      }
    ]
  },
  {
    "id": "ck-16",
    "key": "country",
    "isAuto": true,
    "createdAt": "—",
    "values": []
  },
  {
    "id": "ck-17",
    "key": "state",
    "isAuto": true,
    "createdAt": "—",
    "values": []
  },
  {
    "id": "ck-18",
    "key": "city",
    "isAuto": true,
    "createdAt": "—",
    "values": []
  },
  {
    "id": "ck-19",
    "key": "zip",
    "isAuto": true,
    "createdAt": "—",
    "values": []
  }
];
