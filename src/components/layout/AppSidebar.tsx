import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Megaphone, Radio, Shuffle, FileCheck,
  DollarSign, FileText, Settings, Monitor, Image, ListVideo, BarChart3
} from "lucide-react";

const mainNav = [
  { icon: Monitor, label: "Screens", to: "/screens", section: "cms" },
  { icon: Image, label: "Media", to: "/media", section: "cms" },
  { icon: ListVideo, label: "Playlists", to: "/playlists", section: "cms" },
  { icon: BarChart3, label: "Analytics", to: "/analytics", section: "cms" },
];

const monetNav = [
  { icon: LayoutDashboard, label: "Overview", to: "/" },
  { icon: MapPin, label: "Network Rules", to: "/placements" },
  { icon: Megaphone, label: "Campaigns", to: "/campaigns" },
  { icon: Radio, label: "Programmatic", to: "/programmatic" },
  { icon: Shuffle, label: "Playback Mix", to: "/playback-mix" },
  { icon: FileCheck, label: "Proof of Play", to: "/proof-of-play" },
  { icon: DollarSign, label: "Revenue", to: "/revenue" },
  { icon: FileText, label: "Orders", to: "/orders" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export default function AppSidebar() {
  const location = useLocation();

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;
  };

  return (
    <aside className="w-[220px] min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          S
        </div>
        <span className="ml-3 text-sidebar-accent-foreground font-semibold text-sm">Skoop</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* CMS section */}
        <div className="mb-4">
          {mainNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass(item.to)}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-3" />

        {/* Monetisation section */}
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
          Monetisation
        </p>
        <div className="space-y-0.5">
          {monetNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass(item.to)}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
            SH
          </div>
          <span className="text-xs text-sidebar-foreground truncate">Skoop Admin</span>
        </div>
      </div>
    </aside>
  );
}
