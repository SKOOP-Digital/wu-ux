export interface Screen {
  id: string;
  name: string;
  venue: string;
  status: "Online" | "Offline";
  resolution: string;
  orientation: "Landscape" | "Portrait";
  loopDuration: number; // seconds
  loopsPerHour: number;
}

export const allScreens: Screen[] = [
  { id: "scr-1", name: "Lobby Screen 1", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30 },
  { id: "scr-2", name: "Lobby Screen 2", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30 },
  { id: "scr-3", name: "Lobby Screen 3", venue: "Westfield Sydney", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30 },
  { id: "scr-4", name: "Lobby Screen 4", venue: "Westfield Sydney", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 120, loopsPerHour: 30 },
  { id: "scr-5", name: "Lobby Screen 5", venue: "Westfield Sydney", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 120, loopsPerHour: 30 },
  { id: "scr-6", name: "Lobby Screen 6", venue: "Westfield Sydney", status: "Offline", resolution: "1080×1920", orientation: "Portrait", loopDuration: 120, loopsPerHour: 30 },
  { id: "scr-7", name: "Food Court Display A", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-8", name: "Food Court Display B", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-9", name: "Food Court Display C", venue: "Melbourne Central", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-10", name: "Food Court Display D", venue: "Melbourne Central", status: "Offline", resolution: "1080×1920", orientation: "Portrait", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-11", name: "Elevator Panel 1", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60 },
  { id: "scr-12", name: "Elevator Panel 2", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60 },
  { id: "scr-13", name: "Elevator Panel 3", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60 },
  { id: "scr-14", name: "Elevator Panel 4", venue: "Brisbane CBD Tower", status: "Online", resolution: "1080×1920", orientation: "Portrait", loopDuration: 60, loopsPerHour: 60 },
  { id: "scr-15", name: "Parking Totem A", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-16", name: "Parking Totem B", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-17", name: "Parking Totem C", venue: "Perth Arena", status: "Online", resolution: "1920×1080", orientation: "Landscape", loopDuration: 90, loopsPerHour: 40 },
  { id: "scr-18", name: "Concourse Video Wall", venue: "Westfield Sydney", status: "Online", resolution: "3840×2160", orientation: "Landscape", loopDuration: 120, loopsPerHour: 30 },
];
