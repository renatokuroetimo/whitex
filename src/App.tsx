import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import Supabase test for development
if (import.meta.env.DEV) {
  import("@/lib/supabase-test");
}
import SelectProfession from "./pages/SelectProfession";
import AddCRM from "./pages/AddCRM";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Pacientes from "./pages/Pacientes";
import PatientProfile from "./pages/PatientProfile";
import PatientDetailView from "./pages/PatientDetailView";
import PatientForm from "./pages/PatientForm";
import Indicadores from "./pages/IndicadoresNew";
import CreateIndicator from "./pages/CreateIndicator";
import CreatedIndicators from "./pages/CreatedIndicators";
import StandardIndicators from "./pages/StandardIndicators";
import AddIndicatorToPatient from "./pages/AddIndicatorToPatient";
import PatientIndicators from "./pages/PatientIndicators";
import PatientGraphSelector from "./pages/PatientGraphSelector";
import PatientGraphView from "./pages/PatientGraphView";
import EditPatientIndicator from "./pages/EditPatientIndicator";
import PatientDashboard from "./pages/PatientDashboard";
import PatientAddIndicator from "./pages/PatientAddIndicator";
import DoctorSearch from "./pages/DoctorSearch";
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
              path="/patient-dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboard />
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
              path="/patient-profile"
              element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/indicadores"
              element={
                <ProtectedRoute>
                  <PatientIndicators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/adicionar-indicador"
              element={
                <ProtectedRoute>
                  <PatientAddIndicator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/buscar-medicos"
              element={
                <ProtectedRoute>
                  <DoctorSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/graficos"
              element={
                <ProtectedRoute>
                  <PatientGraphSelector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/graficos/visualizar"
              element={
                <ProtectedRoute>
                  <PatientGraphView />
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
                  <PatientDetailView />
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
            <Route
              path="/pacientes/:patientId/adicionar-indicador"
              element={
                <ProtectedRoute>
                  <AddIndicatorToPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:patientId/indicadores"
              element={
                <ProtectedRoute>
                  <PatientIndicators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:patientId/graficos"
              element={
                <ProtectedRoute>
                  <PatientGraphSelector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:patientId/graficos/visualizar"
              element={
                <ProtectedRoute>
                  <PatientGraphView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:patientId/indicadores/:indicatorId/editar"
              element={
                <ProtectedRoute>
                  <EditPatientIndicator />
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
