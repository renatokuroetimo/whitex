import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextHybrid";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/styles/mobile-toast.css";

// Páginas específicas para pacientes
import Index from "./pages/Index";
import Login from "./pages/Login";
import SelectProfession from "./pages/SelectProfession";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";
import PatientIndicators from "./pages/PatientIndicators";
import PatientAddIndicator from "./pages/PatientAddIndicator";
import PatientGraphSelector from "./pages/PatientGraphSelector";
import PatientGraphView from "./pages/PatientGraphView";
import DoctorSearch from "./pages/DoctorSearch";
import NotFound from "./pages/NotFound";
import DebugConnectivity from "./components/DebugConnectivity";

const queryClient = new QueryClient();

const AppMobile = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota inicial - redireciona baseado no login */}
            <Route path="/" element={<Index />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/select-profession" element={<SelectProfession />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Patient Dashboard - rota principal */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <PatientProfile />
                </ProtectedRoute>
              }
            />

            {/* Indicadores */}
            <Route
              path="/indicadores"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <PatientIndicators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adicionar-indicador"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <PatientAddIndicator />
                </ProtectedRoute>
              }
            />

            {/* Gráficos */}
            <Route
              path="/graficos"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <PatientGraphSelector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/graficos/visualizar"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <PatientGraphView />
                </ProtectedRoute>
              }
            />

            {/* Buscar médicos */}
            <Route
              path="/buscar-medicos"
              element={
                <ProtectedRoute requiredProfession="paciente">
                  <DoctorSearch />
                </ProtectedRoute>
              }
            />

            {/* Debug de conectividade - TEMPOR��RIO */}
            <Route path="/debug" element={<DebugConnectivity />} />

            {/* Redirect old routes */}
            <Route
              path="/patient-dashboard"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/patient-profile"
              element={<Navigate to="/profile" replace />}
            />
            <Route
              path="/patient/indicadores"
              element={<Navigate to="/indicadores" replace />}
            />
            <Route
              path="/patient/adicionar-indicador"
              element={<Navigate to="/adicionar-indicador" replace />}
            />
            <Route
              path="/patient/graficos"
              element={<Navigate to="/graficos" replace />}
            />
            <Route
              path="/patient/graficos/visualizar"
              element={<Navigate to="/graficos/visualizar" replace />}
            />
            <Route
              path="/patient/buscar-medicos"
              element={<Navigate to="/buscar-medicos" replace />}
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AppMobile;
