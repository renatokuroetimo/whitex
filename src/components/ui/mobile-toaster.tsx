import { useToast } from "@/hooks/use-toast";
import { isMobileApp } from "@/lib/mobile-utils";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function MobileToaster() {
  const { toasts } = useToast();
  const isNativeMobile = isMobileApp();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className={isNativeMobile ? "mobile-toast" : undefined}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className={isNativeMobile ? "toast-title" : undefined}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className={isNativeMobile ? "toast-description" : undefined}>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className={isNativeMobile ? "mobile-toast-viewport" : undefined} />
    </ToastProvider>
  );
}
