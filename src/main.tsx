import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Importar API de imagens para carregar funções de debug globais
import "./lib/profile-image-api.ts";

createRoot(document.getElementById("root")!).render(<App />);
