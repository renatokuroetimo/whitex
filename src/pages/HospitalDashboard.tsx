import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Settings,
  UserPlus,
  Users,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { hospitalAPI } from "@/lib/hospital-api";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Hospital {
  id: string;
  name: string;
  createdAt: string;
}

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settingsData, setSettingsData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const hospitalData = localStorage.getItem("hospital_session");
    if (!hospitalData) {
      navigate("/gerenciamento", { replace: true });
      return;
    }

    try {
      const parsedHospital = JSON.parse(hospitalData);
      setHospital(parsedHospital);
      setSettingsData((prev) => ({ ...prev, name: parsedHospital.name }));
    } catch (error) {
      navigate("/gerenciamento", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("hospital_session");
    navigate("/gerenciamento", { replace: true });
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hospital) return;

    // Validar nome
    if (!settingsData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome da instituição é obrigatório",
      });
      return;
    }

    // Se tentando alterar senha, validar campos
    if (settingsData.currentPassword || settingsData.newPassword) {
      if (!settingsData.currentPassword) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Senha atual é obrigatória para alterar a senha",
        });
        return;
      }

      if (!settingsData.newPassword) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nova senha é obrigatória",
        });
        return;
      }

      if (settingsData.newPassword !== settingsData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Confirmação de senha não confere",
        });
        return;
      }

      if (settingsData.newPassword.length < 6) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nova senha deve ter pelo menos 6 caracteres",
        });
        return;
      }
    }

    try {
      // Atualizar nome
      await hospitalAPI.updateHospital(hospital.id, {
        name: settingsData.name.trim(),
      });

      // Atualizar senha se informada
      if (settingsData.currentPassword && settingsData.newPassword) {
        await hospitalAPI.updatePassword(
          hospital.id,
          settingsData.currentPassword,
          settingsData.newPassword,
        );
      }

      // Atualizar sessão local
      const updatedHospital = { ...hospital, name: settingsData.name.trim() };
      setHospital(updatedHospital);
      localStorage.setItem("hospital_session", JSON.stringify(updatedHospital));

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      });

      // Limpar campos de senha
      setSettingsData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao atualizar configurações",
      });
    }
  };

  const dashboardOptions = [
    {
      title: "Listar Médicos",
      description: "Visualizar e gerenciar médicos da instituição",
      icon: Users,
      path: "/gerenciamento/doctors",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Listar Pacientes",
      description: "Visualizar todos os pacientes da instituição",
      icon: Users,
      path: "/gerenciamento/patients",
      color: "from-purple-500 to-purple-600",
    },
  ];

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-6 shadow-xl mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {hospital.name}
                </h1>
                <p className="text-gray-600">Painel de Gerenciamento</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configurações da Instituição</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    {/* Nome */}
                    <div>
                      <Label htmlFor="name">Nome da Instituição</Label>
                      <Input
                        id="name"
                        value={settingsData.name}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* Alterar Senha */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-800 mb-3">
                        Alterar Senha (opcional)
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="currentPassword">Senha Atual</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={settingsData.currentPassword}
                              onChange={(e) =>
                                setSettingsData({
                                  ...settingsData,
                                  currentPassword: e.target.value,
                                })
                              }
                              placeholder="Digite sua senha atual"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="newPassword">Nova Senha</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={settingsData.newPassword}
                              onChange={(e) =>
                                setSettingsData({
                                  ...settingsData,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder="Digite a nova senha"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">
                            Confirmar Nova Senha
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={settingsData.confirmPassword}
                            onChange={(e) =>
                              setSettingsData({
                                ...settingsData,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="Confirme a nova senha"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutDialog(true)}
                className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {dashboardOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.path}
                className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(option.path)}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {option.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  <Button
                    className={`w-full bg-gradient-to-r ${option.color} hover:shadow-lg transition-all duration-200 text-white font-semibold py-3 rounded-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(option.path);
                    }}
                  >
                    Acessar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logout Confirmation Dialog */}
        <ConfirmDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          title="Sair do Sistema"
          description="Tem certeza que deseja sair do painel de gerenciamento?"
          confirmText="Sair"
          cancelText="Cancelar"
          onConfirm={handleLogout}
        />
      </div>
    </div>
  );
};

export default HospitalDashboard;
