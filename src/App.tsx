import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateDebatePage from "./pages/CreateDebatePage";
import MainDebateList from "./pages/MainDebateList";
import DebatePage from "./pages/DebatePage";
import ProfilePage from "./pages/ProfilePage";
import RandomDebatesPage from "./pages/RandomDebatesPage";
import PublicRandomDebatesPage from "./pages/PublicRandomDebatesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-debate" element={<CreateDebatePage />} />
          <Route path="/debates" element={<MainDebateList />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/random-debates" element={<RandomDebatesPage />} />
          <Route path="/public-random-debates" element={<PublicRandomDebatesPage />} />
          <Route path="/debate/:code" element={<DebatePage />} />
          <Route path="/welcome" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;