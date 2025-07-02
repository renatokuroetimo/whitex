import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { testSupabaseConnectivity } from "@/lib/supabase";

interface SupabaseStatusProps {
  onRetry?: () => void;
}

const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ onRetry }) => {
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    error?: string;
    details?: any;
  }>({ loading: true, success: false });

  const testConnection = async () => {
    setStatus({ loading: true, success: false });
    const result = await testSupabaseConnectivity();
    setStatus({
      loading: false,
      success: result.success,
      error: result.error,
      details: result.details,
    });
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (status.loading) {
    return (
      <Alert>
        <Wifi className="h-4 w-4 animate-pulse" />
        <AlertDescription>
          Testando conectividade com a base de dados...
        </AlertDescription>
      </Alert>
    );
  }

  if (status.success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Conectividade com a base de dados: ✅ Funcionando
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">
            Erro de conectividade com a base de dados
          </p>
          <p className="text-sm">
            {status.error || "Não foi possível conectar à base de dados"}
          </p>
          {status.error?.includes("Failed to fetch") && (
            <p className="text-sm text-muted-foreground">
              Isto pode indicar problemas de rede ou que o serviço está
              temporariamente indisponível.
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              className="h-8"
            >
              Testar novamente
            </Button>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                Tentar carregar dados
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseStatus;
