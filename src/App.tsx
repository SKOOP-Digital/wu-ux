import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Placements from "./pages/Placements";
import PlacementDetail from "./pages/PlacementDetail";
import Campaigns from "./pages/Campaigns";
import CampaignCreate from "./pages/CampaignCreate";
import ProofOfPlay from "./pages/ProofOfPlay";
import SettingsPage from "./pages/SettingsPage";
import Screens from "./pages/Screens";
import ScreenDetail from "./pages/ScreenDetail";
import Analytics from "./pages/Analytics";
import CampaignDetail from "./pages/CampaignDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="*" element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/screens" replace />} />
                <Route path="/screens" element={<Screens />} />
                <Route path="/screens/:id" element={<ScreenDetail />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/placements" element={<Placements />} />
                <Route path="/placements/new" element={<PlacementDetail />} />
                <Route path="/placements/:id" element={<PlacementDetail />} />
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
