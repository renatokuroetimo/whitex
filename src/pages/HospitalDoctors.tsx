import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  ArrowLeft,
  Search,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { doctorAPI, Doctor } from "@/lib/doctor-api";
import { toast } from "@/hooks/use-toast";

const HospitalDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const hospitalData = localStorage.getItem("hospital_session");
        if (!hospitalData) {
          navigate("/gerenciamento", { replace: true });
          return;
        }

        const hospital = JSON.parse(hospitalData);
        const doctorsData = await doctorAPI.getDoctorsByHospital(hospital.id);
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (error) {
        console.error("Erro ao carregar médicos:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar lista de médicos",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [navigate]);

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.crm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-6 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/gerenciamento/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Médicos Cadastrados
                </h1>
                <p className="text-gray-600">
                  {filteredDoctors.length} médico(s) encontrado(s)
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/gerenciamento/doctors/create")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Novo Médico
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-6 shadow-xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email, CRM ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-12 shadow-xl text-center">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm
                ? "Nenhum médico encontrado"
                : "Nenhum médico cadastrado"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Tente usar outros termos de busca"
                : "Cadastre o primeiro médico da sua instituição"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => navigate("/gerenciamento/doctors/create")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg transition-all duration-200"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Médico
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="bg-white/90 backdrop-blur-lg border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                      {doctor.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      {doctor.crm}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Specialty */}
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {doctor.specialty}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {doctor.email}
                    </span>
                  </div>

                  {/* Phone */}
                  {doctor.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700">{doctor.phone}</span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {doctor.city}, {doctor.state}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-200">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Cadastrado em{" "}
                      {new Date(doctor.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDoctors;
