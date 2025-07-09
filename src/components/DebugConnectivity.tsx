import { useState, useEffect } from "react";
import { testSupabaseConnectivity } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function DebugConnectivity() {
  const [connectivityTest, setConnectivityTest] = useState<{
    success: boolean;
    error?: string;
    timestamp?: string;
    loading: boolean;
  }>({ loading: false, success: false });

  const runConnectivityTest = async () => {
    setConnectivityTest({ loading: true, success: false });

    try {
      const result = await testSupabaseConnectivity();
      setConnectivityTest({
        loading: false,
        success: result.success,
        error: result.error,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      setConnectivityTest({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  useEffect(() => {
    // Teste automático ao carregar o componente
    runConnectivityTest();
  }, []);

  const getStatusIcon = () => {
    if (connectivityTest.loading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    return connectivityTest.success ? (
      <Wifi className="h-4 w-4" />
    ) : (
      <WifiOff className="h-4 w-4" />
    );
  };

  const getStatusBadge = () => {
    if (connectivityTest.loading) {
      return <Badge variant="secondary">Testando...</Badge>;
    }
    return connectivityTest.success ? (
      <Badge variant="default" className="bg-green-500">
        Conectado
      </Badge>
    ) : (
      <Badge variant="destructive">Desconectado</Badge>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Debug Conectividade
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Status da conexão com Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>URL:</strong>
          </div>
          <div className="font-mono text-xs break-all">
            {import.meta.env.VITE_SUPABASE_URL || "Não definida"}
          </div>

          <div>
            <strong>Modo:</strong>
          </div>
          <div>{import.meta.env.VITE_APP_MODE || "web"}</div>

          <div>
            <strong>Última verificação:</strong>
          </div>
          <div>{connectivityTest.timestamp || "Nunca"}</div>
        </div>

        {connectivityTest.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Erro:</strong> {connectivityTest.error}
            </p>
          </div>
        )}

        <Button
          onClick={runConnectivityTest}
          disabled={connectivityTest.loading}
          className="w-full"
          variant="outline"
        >
          {connectivityTest.loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Testar Novamente
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Variáveis de Ambiente:</strong>
          </p>
          <p>
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? "✅" : "❌"}
          </p>
          <p>
            VITE_SUPABASE_ANON_KEY:{" "}
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅" : "❌"}
          </p>
          <p>
            VITE_APP_MODE: {import.meta.env.VITE_APP_MODE || "não definido"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
