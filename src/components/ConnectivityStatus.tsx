import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { testSupabaseConnectivity } from "@/lib/supabase";

interface ConnectivityStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({
  className = "",
  showDetails = false,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    responseTime?: number;
    error?: string;
  }>({ connected: true });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkSupabaseConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSupabaseStatus({ connected: false });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (isOnline) {
      checkSupabaseConnectivity();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkSupabaseConnectivity = async () => {
    setIsChecking(true);
    try {
      const result = await testSupabaseConnectivity(5000);
      setSupabaseStatus({
        connected: result.success,
        responseTime: result.responseTime,
        error: result.error,
      });
    } catch (error) {
      setSupabaseStatus({
        connected: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    if (!isOnline || !supabaseStatus.connected) return "destructive";
    if (supabaseStatus.responseTime && supabaseStatus.responseTime > 3000)
      return "secondary";
    return "default";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (isChecking) return "Verificando...";
    if (!supabaseStatus.connected) return "Sem conexão DB";
    if (supabaseStatus.responseTime) {
      return `Online (${supabaseStatus.responseTime}ms)`;
    }
    return "Online";
  };

  const getIcon = () => {
    if (isChecking) {
      return (
        <div className="w-3 h-3 animate-spin border border-current border-t-transparent rounded-full" />
      );
    }
    if (!isOnline || !supabaseStatus.connected) {
      return <WifiOff className="w-3 h-3" />;
    }
    return <Wifi className="w-3 h-3" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge
        variant={getStatusColor()}
        className="flex items-center gap-1 text-xs"
        onClick={checkSupabaseConnectivity}
        style={{ cursor: "pointer" }}
      >
        {getIcon()}
        {getStatusText()}
      </Badge>

      {showDetails && supabaseStatus.error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span className="truncate max-w-32" title={supabaseStatus.error}>
            {supabaseStatus.error}
          </span>
        </div>
      )}
    </div>
  );
};

export default ConnectivityStatus;
