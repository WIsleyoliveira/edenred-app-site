// Detecta automaticamente a URL da API
// Em produção (Railway), usa o mesmo domínio
// Em desenvolvimento, usa localhost
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

export const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction ? window.location.origin : "http://localhost:5001");
