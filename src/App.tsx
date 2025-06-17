import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SelectProfession from "./pages/SelectProfession";
import AddCRM from "./pages/AddCRM";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Pacientes from "./pages/Pacientes";
import PatientProfile from "./pages/PatientProfile";
import PatientForm from "./pages/PatientForm";
import Indicadores from "./pages/Indicadores";
import CreateIndicator from "./pages/CreateIndicator";
import CreatedIndicators from "./pages/CreatedIndicators";
import StandardIndicators from "./pages/StandardIndicators";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/select-profession" element={<SelectProfession />} />
            <Route path="/add-crm" element={<AddCRM />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes"
              element={
                <ProtectedRoute>
                  <Pacientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indicadores"
              element={
                <ProtectedRoute>
                  <Indicadores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indicadores/criar"
              element={
                <ProtectedRoute>
                  <CreateIndicator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indicadores/criados"
              element={
                <ProtectedRoute>
                  <CreatedIndicators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indicadores/padrao"
              element={
                <ProtectedRoute>
                  <StandardIndicators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/novo"
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:id"
              element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:id/editar"
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
