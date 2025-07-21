import { Toaster as Sonner } from "sonner";
import { isMobileApp } from "@/lib/mobile-utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const MobileSonner = ({ ...props }: ToasterProps) => {
  const isNativeMobile = isMobileApp();

  return (
    <Sonner
      theme="light"
      className="toaster group"
      position={isNativeMobile ? "bottom-center" : "top-right"}
      toastOptions={{
        classNames: {
          toast: isNativeMobile
            ? "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:mb-safe group-[.toaster]:mx-4 group-[.toaster]:rounded-xl"
            : "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
        },
      }}
      {...props}
    />
  );
};

export { MobileSonner };
