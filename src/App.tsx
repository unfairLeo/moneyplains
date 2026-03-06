import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatView } from "@/components/views/ChatView";
import { MetasView } from "@/components/views/MetasView";
import { MissoesView } from "@/components/views/MissoesView";
import { PersonalidadesView } from "@/components/views/PersonalidadesView";
import { ConquistasView } from "@/components/views/ConquistasView";
import { SettingsView } from "@/components/views/SettingsView";
import Login from "@/pages/Login";
import LandingPage from "@/pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<ChatView />} />
              <Route path="/metas" element={<MetasView />} />
              <Route path="/missoes" element={<MissoesView />} />
              <Route path="/personalidades" element={<PersonalidadesView />} />
              <Route path="/conquistas" element={<ConquistasView />} />
              <Route path="/configuracoes" element={<SettingsView />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
