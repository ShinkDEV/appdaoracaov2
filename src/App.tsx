import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewRequest from "./pages/NewRequest";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MyPrayers from "./pages/MyPrayers";
import Settings from "./pages/Settings";
import DonationSuccess from "./pages/DonationSuccess";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/novo-pedido" element={<Layout><NewRequest /></Layout>} />
            <Route path="/perfil" element={<Layout><Profile /></Layout>} />
            <Route path="/admin" element={<Layout><Admin /></Layout>} />
            <Route path="/minhas-oracoes" element={<Layout><MyPrayers /></Layout>} />
            <Route path="/configuracoes" element={<Layout><Settings /></Layout>} />
            <Route path="/doacao-sucesso" element={<Layout><DonationSuccess /></Layout>} />
            <Route path="/instalar" element={<Layout><Install /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
