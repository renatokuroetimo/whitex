import React from "react";

interface LogoProps {
  variant?: "primary" | "white" | "dark" | "compact";
  size?: "sm" | "md" | "lg" | "xl" | "3xl" | "6xl";
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  showText = true,
}) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
    "3xl": "h-36",
    "6xl": "h-72",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
    "3xl": "text-8xl",
    "6xl": "text-9xl",
  };

  const getLogoImage = () => {
    switch (variant) {
      case "primary":
        return "https://cdn.builder.io/api/v1/image/assets%2F6c764843f8bb4491bc67ad730818e264%2Fa28122db8e4244f89d5b90894945ba92?format=webp&width=800";
      case "white":
        return "https://cdn.builder.io/api/v1/image/assets%2F6c764843f8bb4491bc67ad730818e264%2F81453ca8989d4efabc0343bc6acd7efd?format=webp&width=800";
      case "dark":
        return "https://cdn.builder.io/api/v1/image/assets%2F6c764843f8bb4491bc67ad730818e264%2Fcf7eba20960f4754868fa84e0fde6be8?format=webp&width=800";
      case "compact":
        return "https://cdn.builder.io/api/v1/image/assets%2F6c764843f8bb4491bc67ad730818e264%2F3b57f4fcec554d2c83f11fdf285b1f51?format=webp&width=800";
      default:
        return "https://cdn.builder.io/api/v1/image/assets%2F6c764843f8bb4491bc67ad730818e264%2Fa28122db8e4244f89d5b90894945ba92?format=webp&width=800";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "white":
        return "text-white";
      case "dark":
        return "text-gray-900";
      case "primary":
      default:
        return "text-brand-primary";
    }
  };

  if (!showText) {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src={getLogoImage()}
          alt="WhiteX"
          className={`${sizeClasses[size]} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={getLogoImage()}
        alt="WhiteX"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      <span className={`font-bold ${textSizeClasses[size]} ${getTextColor()}`}>
        WhiteX
      </span>
    </div>
  );
};

export default Logo;
