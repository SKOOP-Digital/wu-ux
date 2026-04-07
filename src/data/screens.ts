export interface Screen {
  id: string;
  name: string;
  venue: string;
  status: "Online" | "Offline";
  resolution: string;
  orientation: "Landscape" | "Portrait";
  loopDuration: number; // seconds
  loopsPerHour: number;
  impressionsPerPlay?: number;
  address?: string;
  lat?: number;
  lng?: number;
  manualTags?: string[];
}

export const allScreens: Screen[] = [
  { id: "scr-1", name: "Lobby Screen 1", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
  { id: "scr-2", name: "Lobby Screen 2", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
  { id: "scr-3", name: "Lobby Screen 3", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
  { id: "scr-4", name: "Lobby Screen 4", venue: "Westfield Sydney", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
  { id: "scr-5", name: "Lobby Screen 5", venue: "Westfield Sydney", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
  { id: "scr-6", name: "Lobby Screen 6", venue: "Westfield Sydney", status: "Offline", resolution: "1080×1920", orientation: "Portrait", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
  { id: "scr-7", name: "Food Court Display A", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40, address: "211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.8102, lng: 144.9628, manualTags: ["Indoor"] },
  { id: "scr-8", name: "Food Court Display B", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40, address: "211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.8102, lng: 144.9628, manualTags: ["Indoor"] },
  { id: "scr-9", name: "Food Court Display C", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40, address: "211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.8102, lng: 144.9628, manualTags: ["Indoor"] },
  { id: "scr-10", name: "Food Court Display D", venue: "Melbourne Central", status: "Offline", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40, address: "211 La Trobe St, Melbourne VIC 3000, Australia", lat: -37.8102, lng: 144.9628, manualTags: ["Indoor"] },
  { id: "scr-11", name: "Elevator Panel 1", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60, address: "123 Eagle St, Brisbane QLD 4000, Australia", lat: -27.4678, lng: 153.0281, manualTags: ["Indoor"] },
  { id: "scr-12", name: "Elevator Panel 2", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60, address: "123 Eagle St, Brisbane QLD 4000, Australia", lat: -27.4678, lng: 153.0281, manualTags: ["Indoor"] },
  { id: "scr-13", name: "Elevator Panel 3", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60, address: "123 Eagle St, Brisbane QLD 4000, Australia", lat: -27.4678, lng: 153.0281, manualTags: ["Indoor"] },
  { id: "scr-14", name: "Elevator Panel 4", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60, address: "123 Eagle St, Brisbane QLD 4000, Australia", lat: -27.4678, lng: 153.0281, manualTags: ["Indoor"] },
  { id: "scr-15", name: "Parking Totem A", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 90, loopsPerHour: 40, address: "700 Wellington St, Perth WA 6000, Australia", lat: -31.9505, lng: 115.8605, manualTags: ["Outdoor"] },
  { id: "scr-16", name: "Parking Totem B", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 90, loopsPerHour: 40, address: "700 Wellington St, Perth WA 6000, Australia", lat: -31.9505, lng: 115.8605, manualTags: ["Outdoor"] },
  { id: "scr-17", name: "Parking Totem C", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 90, loopsPerHour: 40, address: "700 Wellington St, Perth WA 6000, Australia", lat: -31.9505, lng: 115.8605, manualTags: ["Outdoor"] },
  { id: "scr-18", name: "Concourse Video Wall", venue: "Westfield Sydney", status: "Online", resolution: "3840×2160", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30, address: "100 Market St, Sydney NSW 2000, Australia", lat: -33.8712, lng: 151.2071, manualTags: ["Indoor"] },
];
