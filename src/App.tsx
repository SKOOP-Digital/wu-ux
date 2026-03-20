import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Overview from "./pages/Overview";
import Placements from "./pages/Placements";
import PlacementDetail from "./pages/PlacementDetail";
import Campaigns from "./pages/Campaigns";
import CampaignCreate from "./pages/CampaignCreate";
import ProgrammaticSlots from "./pages/ProgrammaticSlots";
import PlaybackMix from "./pages/PlaybackMix";
import ProofOfPlay from "./pages/ProofOfPlay";
import RevenueReports from "./pages/RevenueReports";
import OrdersBilling from "./pages/OrdersBilling";
import SettingsPage from "./pages/SettingsPage";
import PlaylistEditor from "./pages/PlaylistEditor";
import Screens from "./pages/Screens";
import ScreenDetail from "./pages/ScreenDetail";
import Media from "./pages/Media";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/playlists" element={<AppLayout><PlaylistEditor /></AppLayout>} />
          <Route path="*" element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/screens" element={<Screens />} />
                <Route path="/screens/:id" element={<ScreenDetail />} />
                <Route path="/media" element={<Media />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/placements" element={<Placements />} />
                <Route path="/placements/:id" element={<PlacementDetail />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/create" element={<CampaignCreate />} />
                <Route path="/programmatic" element={<ProgrammaticSlots />} />
                <Route path="/playback-mix" element={<PlaybackMix />} />
                <Route path="/proof-of-play" element={<ProofOfPlay />} />
                <Route path="/revenue" element={<RevenueReports />} />
                <Route path="/orders" element={<OrdersBilling />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
