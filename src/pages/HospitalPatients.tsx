import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ArrowLeft, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { doctorAPI, Doctor } from "@/lib/doctor-api";
import {
  hospitalPatientAPI,
  HospitalPatient,
} from "@/lib/hospital-patient-api";
import { toast } from "@/hooks/use-toast";

interface Hospital {
  id: string;
  name: string;
  createdAt: string;
}

const HospitalPatients = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [patients, setPatients] = useState<HospitalPatient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<string[]>([
    "ativo",
    "compartilhado",
  ]);

  useEffect(() => {
    const hospitalData = localStorage.getItem("hospital_session");
    if (!hospitalData) {
      navigate("/gerenciamento", { replace: true });
      return;
    }

    try {
      const parsedHospital = JSON.parse(hospitalData);
      setHospital(parsedHospital);
      loadData(parsedHospital.id);
    } catch (error) {
      navigate("/gerenciamento", { replace: true });
    }
  }, [navigate]);

  const loadData = async (hospitalId: string) => {
    setIsLoading(true);
    try {
      // Carregar médicos e pacientes em paralelo
      const [doctorsData, patientsData] = await Promise.all([
        doctorAPI.getDoctorsByHospital(hospitalId),
        hospitalPatientAPI.getPatientsByHospital(hospitalId),
      ]);

      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter patients based on search, doctor, and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      !searchTerm ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDoctor =
      selectedDoctor === "all" || patient.doctorId === selectedDoctor;

    const matchesStatus = statusFilters.includes(patient.status);

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  // Handle status filter toggle
  const handleStatusFilterToggle = (status: string) => {
    setStatusFilters((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "ATIVO", className: "bg-blue-100 text-blue-800" },
      inativo: { label: "INATIVO", className: "bg-gray-100 text-gray-800" },
      compartilhado: {
        label: "COMPARTILHADO",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status.toUpperCase(),
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/gerenciamento/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Pacientes da {hospital.name}
              </h1>
              <p className="text-gray-600">
                Visualize todos os pacientes atendidos pelos médicos da
                instituição
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              {/* Search */}
              <div className="flex-1 sm:max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar paciente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Ver gráficos button */}
                <Button
                  onClick={() => navigate("/gerenciamento/patients/graphs")}
                  className="bg-[#00B1BB] hover:bg-[#01485E] text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver gráficos
                </Button>

                {/* Doctor Filter */}
                <div className="min-w-[200px]">
                  <Select
                    value={selectedDoctor}
                    onValueChange={setSelectedDoctor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por médico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os médicos</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Status ({statusFilters.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Status do Paciente
                      </p>
                      {[
                        {
                          value: "ativo",
                          label: "Ativos",
                          color: "bg-blue-100 text-blue-800",
                        },
                        {
                          value: "inativo",
                          label: "Inativos",
                          color: "bg-gray-100 text-gray-800",
                        },
                        {
                          value: "compartilhado",
                          label: "Compartilhados",
                          color: "bg-purple-100 text-purple-800",
                        },
                      ].map((status) => (
                        <div
                          key={status.value}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={status.value}
                            checked={statusFilters.includes(status.value)}
                            onCheckedChange={() =>
                              handleStatusFilterToggle(status.value)
                            }
                          />
                          <label
                            htmlFor={status.value}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Lista de Pacientes ({filteredPatients.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ||
                  selectedDoctor !== "all" ||
                  statusFilters.length < 3
                    ? "Nenhum paciente encontrado"
                    : "Nenhum paciente cadastrado"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ||
                  selectedDoctor !== "all" ||
                  statusFilters.length < 3
                    ? "Tente ajustar sua pesquisa ou filtros."
                    : "Os pacientes aparecerão aqui quando os médicos os cadastrarem."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Médico Responsável
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Cadastro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient, index) => (
                      <tr
                        key={`hospital-patient-${patient.id}-${index}`}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          navigate(`/gerenciamento/patients/${patient.id}`);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          {patient.age && (
                            <div className="text-sm text-gray-500">
                              {patient.age} anos
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.doctorName || "Médico não encontrado"}
                          </div>
                          {patient.doctorSpecialty && (
                            <div className="text-sm text-gray-500">
                              {patient.doctorSpecialty}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(patient.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(patient.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalPatients;
