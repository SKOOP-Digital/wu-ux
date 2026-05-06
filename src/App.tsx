import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Overview from "./pages/Overview";
import Campaigns from "./pages/Campaigns";
import CampaignCreate from "./pages/CampaignCreate";
import CampaignDetail from "./pages/CampaignDetail";
import ProofOfPlay from "./pages/ProofOfPlay";
import SettingsPage from "./pages/SettingsPage";
import PlaylistEditor from "./pages/PlaylistEditor";
import Screens from "./pages/Screens";
import ScreenDetail from "./pages/ScreenDetail";
import Media from "./pages/Media";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/playlists" element={<AppLayout><PlaylistEditor /></AppLayout>} />
          <Route path="*" element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/analytics" element={<Overview />} />
                <Route path="/screens" element={<Screens />} />
                <Route path="/screens/:id" element={<ScreenDetail />} />
                <Route path="/media" element={<Media />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/create" element={<CampaignCreate />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/proof-of-play" element={<ProofOfPlay />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
