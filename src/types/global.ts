// Global TypeScript types for the application

export interface User {
  _id: string;
  email: string;
  userName: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    itemsPerPage: number;
  };
}

export interface Company {
  _id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacao: 'ATIVA' | 'SUSPENSA' | 'INAPTA' | 'BAIXADA';
  porte: 'ME' | 'EPP' | 'DEMAIS';
  naturezaJuridica?: string;
  telefone?: string;
  email?: string;
  endereco?: Address;
  atividades?: Activity[];
  capital?: number;
  dataAbertura?: string;
  ultimaAtualizacao?: string;
  status: 'EM_ANALISE' | 'EM_NEGOCIACAO' | 'EM_PROCESSAMENTO' | 'FINALIZADA' | 'CANCELADA';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  pais?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Activity {
  codigo: string;
  descricao: string;
  principal: boolean;
}

export interface Consultation {
  _id: string;
  cnpj: string;
  userId: string;
  userName: string;
  step: number;
  maxSteps: number;
  completed: boolean;
  companyData?: Company;
  formData?: Record<string, any>;
  status: 'INICIADA' | 'EM_PROGRESSO' | 'FINALIZADA' | 'ERRO' | 'CANCELADA';
  progress: number;
  notes?: string[];
  attachments?: Attachment[];
  tags?: string[];
  isFavorite: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  produto?: 'FLEET' | 'TICKET_RESTAURANT' | 'PAY' | 'ALIMENTA' | 'ABASTECIMENTO' | 'OUTRAS';
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Landscape {
  _id: string;
  nome: string;
  descricao?: string;
  tipo: 'MERCADO' | 'CONCORRENCIA' | 'FORNECEDOR' | 'CLIENTE' | 'PARCEIRO';
  empresas: string[]; // Company IDs
  tags?: string[];
  insights?: string[];
  createdBy: string;
  isPublic: boolean;
  collaborators?: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  meta?: {
    pagination?: PaginationInfo;
    filters?: Record<string, any>;
    sort?: string;
    total?: number;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SearchFilters {
  q?: string;
  status?: string;
  situacao?: string;
  porte?: string;
  uf?: string;
  cidade?: string;
  atividade?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  userId?: string;
}

export interface DashboardStats {
  totalEmpresas: number;
  totalConsultas: number;
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  emAndamento: number;
  concluidas: number;
  favoritas: number;
  processosAtivos: number;
  taxaSucesso: number;
  tempoMedio: number; // em minutos
  crescimentoMensal: number; // percentual
}

export interface NotificationItem {
  _id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  action?: {
    label: string;
    url: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: Attachment;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ConsultationFormData {
  cnpj: string;
  targetCompany?: string;
  observacoes?: string;
  prioridade?: Consultation['priority'];
  dataVencimento?: string;
  tags?: string[];
}

// Theme types
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

// API Service types
export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// Component prop types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// Environment types
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_FIREBASE_MEASUREMENT_ID: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_ENVIRONMENT: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};