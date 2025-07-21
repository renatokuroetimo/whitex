import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { isMobileApp } from "@/lib/mobile-utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const MobileSonner = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isNativeMobile = isMobileApp();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isNativeMobile ? "bottom-center" : "top-right"}
      toastOptions={{
        classNames: {
          toast: isNativeMobile
            ? "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:mb-safe group-[.toaster]:mx-4 group-[.toaster]:rounded-xl"
            : "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { MobileSonner };
