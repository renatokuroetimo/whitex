import { useEffect } from "react";

interface StaticFileRedirectProps {
  filename: string;
  title?: string;
}

const StaticFileRedirect = ({ filename, title }: StaticFileRedirectProps) => {
  useEffect(() => {
    // Force redirect to static file
    window.location.replace(`/${filename}`);
  }, [filename]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          Redirecionando para {title || filename}...
        </p>
      </div>
    </div>
  );
};

export default StaticFileRedirect;
