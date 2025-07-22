import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextHybrid";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import MigrationPanel from "@/components/MigrationPanel";
import AutoRedirect from "@/components/AutoRedirect";

// Supabase test disponível via console em desenvolvimento
import Index from "./pages/Index";
import Login from "./pages/Login";
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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIndicators from "./pages/AdminIndicators";
import AdminHospitals from "./pages/AdminHospitals";
import AdminEditIndicator from "./pages/AdminEditIndicator";
import AdminCreateIndicator from "./pages/AdminCreateIndicator";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalCreateDoctor from "./pages/HospitalCreateDoctor";
import HospitalDoctors from "./pages/HospitalDoctors";
import HospitalPatients from "./pages/HospitalPatients";
import HospitalGraphSelector from "./pages/HospitalGraphSelector";
import HospitalGraphView from "./pages/HospitalGraphView";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MigrateUser from "./pages/MigrateUser";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <MigrationPanel />
        <BrowserRouter>
          <Routes>
            {/* Public routes - outside AutoRedirect */}
            <Route path="/terms" element={<TermsOfService />} />

            {/* Protected/Auto-redirected routes */}
            <Route path="/*" element={
              <AutoRedirect>
                <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/migrate-user" element={<MigrateUser />} />
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
              {/* Redirecionamentos para rotas corretas */}
              <Route
                path="/patient/dashboard"
                element={<Navigate to="/patient-dashboard" replace />}
              />
              <Route
                path="/patients"
                element={<Navigate to="/pacientes" replace />}
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
                path="/indicadores/editar/:id"
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

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/indicators"
                element={
                  <AdminProtectedRoute>
                    <AdminIndicators />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/hospitals"
                element={
                  <AdminProtectedRoute>
                    <AdminHospitals />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/indicators/create"
                element={
                  <AdminProtectedRoute>
                    <AdminCreateIndicator />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/indicators/edit/:id"
                element={
                  <AdminProtectedRoute>
                    <AdminEditIndicator />
                  </AdminProtectedRoute>
                }
              />

              {/* Hospital Management Routes */}
              <Route path="/gerenciamento" element={<HospitalLogin />} />
              <Route path="/gerenciamento/login" element={<HospitalLogin />} />
              <Route
                path="/gerenciamento/dashboard"
                element={<HospitalDashboard />}
              />
              <Route
                path="/gerenciamento/doctors/create"
                element={<HospitalCreateDoctor />}
              />
              <Route
                path="/gerenciamento/doctors"
                element={<HospitalDoctors />}
              />
              <Route
                path="/gerenciamento/patients"
                element={<HospitalPatients />}
              />
              <Route
                path="/gerenciamento/patients/:id"
                element={<PatientDetailView />}
              />
              <Route
                path="/gerenciamento/patients/:patientId/indicadores"
                element={<PatientIndicators />}
              />
              <Route
                path="/gerenciamento/patients/:patientId/adicionar-indicador"
                element={<AddIndicatorToPatient />}
              />
              <Route
                path="/gerenciamento/patients/:patientId/graficos"
                element={<PatientGraphSelector />}
              />
              <Route
                path="/gerenciamento/patients/:patientId/graficos/visualizar"
                element={<PatientGraphView />}
              />
              <Route
                path="/gerenciamento/patients/graphs"
                element={<HospitalGraphSelector />}
              />
              <Route
                path="/gerenciamento/patients/graphs/view"
                element={<HospitalGraphView />}
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </AutoRedirect>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
