import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  getMigrationStatus,
  enableSupabaseMigration,
  disableSupabaseMigration,
  setFeatureFlag,
  isFeatureEnabled,
} from "@/lib/feature-flags";
import { isSupabaseAvailable } from "@/lib/supabase";

const MigrationPanel: React.FC = () => {
  const [status, setStatus] = useState(getMigrationStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Atualizar status a cada 2 segundos
    const interval = setInterval(() => {
      setStatus(getMigrationStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Temporariamente habilitado em produção para migração
  // if (!import.meta.env.DEV) return null;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          🔧 Migração
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 bg-white border-2 border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            🔧 Painel de Migração
          </h3>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>

        {/* Status do Supabase */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium">Supabase:</span>
            <Badge
              variant={status.supabaseAvailable ? "default" : "destructive"}
            >
              {status.supabaseAvailable ? "✅ Conectado" : "❌ Desconectado"}
            </Badge>
          </div>
        </div>

        {/* Progresso da Migração */}
        <div className="mb-4">
          <div className="text-xs font-medium mb-2">
            Progresso: {status.overallProgress}/4 módulos
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(status.overallProgress / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Status dos Módulos */}
        <div className="space-y-2 mb-4">
          <ModuleStatus
            name="Autenticação"
            enabled={status.authMigrated}
            onToggle={(enabled) => {
              setFeatureFlag("useSupabaseAuth", enabled);
              setStatus(getMigrationStatus());
            }}
          />
          <ModuleStatus
            name="Pacientes"
            enabled={status.patientsMigrated}
            onToggle={(enabled) => {
              setFeatureFlag("useSupabasePatients", enabled);
              setStatus(getMigrationStatus());
            }}
          />
          <ModuleStatus
            name="Indicadores"
            enabled={status.indicatorsMigrated}
            onToggle={(enabled) => {
              setFeatureFlag("useSupabaseIndicators", enabled);
              setStatus(getMigrationStatus());
            }}
          />
          <ModuleStatus
            name="Perfis"
            enabled={status.profilesMigrated}
            onToggle={(enabled) => {
              setFeatureFlag("useSupabaseProfiles", enabled);
              setStatus(getMigrationStatus());
            }}
          />
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-2">
          <Button
            onClick={() => {
              enableSupabaseMigration();
              setTimeout(() => setStatus(getMigrationStatus()), 100);
            }}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-xs"
            disabled={!status.supabaseAvailable}
          >
            🚀 Ativar Supabase
          </Button>

          <Button
            onClick={() => {
              disableSupabaseMigration();
              setTimeout(() => setStatus(getMigrationStatus()), 100);
            }}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            🔄 Voltar localStorage
          </Button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          ⚠️ Mudanças aplicadas após recarregar
        </div>
      </Card>
    </div>
  );
};

interface ModuleStatusProps {
  name: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const ModuleStatus: React.FC<ModuleStatusProps> = ({
  name,
  enabled,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between text-xs">
      <span>{name}:</span>
      <Button
        onClick={() => onToggle(!enabled)}
        variant="ghost"
        size="sm"
        className="h-6 px-2"
      >
        <Badge variant={enabled ? "default" : "secondary"}>
          {enabled ? "Supabase" : "localStorage"}
        </Badge>
      </Button>
    </div>
  );
};

export default MigrationPanel;
