import React, { useState, useCallback } from "react";
import { ImageOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  onError?: (error: string) => void;
  maxRetries?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc,
  placeholder,
  onError,
  maxRetries = 2,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const error = new Error(`Failed to load image: ${currentSrc}`);
      console.error("❌ Erro ao carregar imagem do Supabase:", error);

      setIsLoading(false);

      // Try fallback first
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        return;
      }

      // Then try retries
      if (retryCount < maxRetries) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
            setCurrentSrc(src + `?retry=${retryCount + 1}`); // Add cache buster
            setIsLoading(true);
          },
          1000 * (retryCount + 1),
        ); // Exponential backoff
        return;
      }

      // Finally show error state
      setHasError(true);
      onError?.(error.message);
    },
    [currentSrc, fallbackSrc, retryCount, maxRetries, src, onError],
  );

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    setCurrentSrc(src + `?retry=${Date.now()}`);
  };

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        <ImageOff className="w-8 h-8 mb-2" />
        <p className="text-xs text-center mb-2">Erro ao carregar imagem</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: "relative" }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {placeholder || (
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          )}
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          display: hasError ? "none" : "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default SafeImage;
