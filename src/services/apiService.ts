import { API_URL } from '../config/api.js';
import type {
  User,
  Company,
  Consultation,
  ApiResponse,
  ApiError,
  RequestOptions,
  LoginFormData,
  RegisterFormData
} from '../types/global';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
    // Tentar recuperar token do localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Configurar headers de autenticação
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Criar erro customizado
  private createApiError(message: string, status?: number, code?: string, details?: any): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'ApiError';
    error.status = status;
    error.code = code;
    error.details = details;
    return error;
  }

  // Verificar se é erro de rede
  private isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message === 'Failed to fetch';
  }

  // Método genérico para fazer requisições com retry
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const {
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(includeAuth),
        ...fetchOptions.headers,
      },
    };

    // Adicionar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    let lastError: any;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Tentar parsear JSON, mas tratar casos onde não é JSON
        let data: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (jsonError) {
            console.warn('Failed to parse JSON response:', jsonError);
            data = { success: false, message: 'Invalid JSON response' };
          }
        } else {
          const textData = await response.text();
          data = { success: response.ok, message: textData || response.statusText };
        }

        if (!response.ok) {
          const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
          const apiError = this.createApiError(
            errorMessage,
            response.status,
            data.code || `HTTP_${response.status}`,
            data.details || data.errors
          );

          // Tratar diferentes tipos de erro
          if (response.status === 401 && includeAuth) {
            // Token inválido ou expirado (apenas quando autenticação está incluída)
            await this.logout();
            throw this.createApiError('Sessão expirada. Faça login novamente.', 401, 'SESSION_EXPIRED');
          } else if (response.status === 403) {
            throw this.createApiError('Acesso negado.', 403, 'ACCESS_DENIED');
          } else if (response.status === 404) {
            throw this.createApiError('Recurso não encontrado.', 404, 'NOT_FOUND');
          } else if (response.status >= 500) {
            throw this.createApiError('Erro interno do servidor. Tente novamente.', response.status, 'SERVER_ERROR');
          }

          throw apiError;
        }

        return data;
      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;

        // Se é um ApiError já tratado, não tentar novamente
        if (error.name === 'ApiError') {
          throw error;
        }

        // Tratar erro de timeout
        if (error.name === 'AbortError') {
          const timeoutError = this.createApiError(
            'Tempo limite da requisição excedido.',
            408,
            'REQUEST_TIMEOUT'
          );
          
          if (attempt === retries) {
            throw timeoutError;
          }
          console.warn(`Timeout na tentativa ${attempt}/${retries} para ${endpoint}`);
          continue;
        }

        // Tratar erro de rede
        if (this.isNetworkError(error)) {
          const networkError = this.createApiError(
            'Erro de conexão. Verifique sua internet.',
            0,
            'NETWORK_ERROR'
          );
          
          if (attempt === retries) {
            throw networkError;
          }
          console.warn(`Erro de rede na tentativa ${attempt}/${retries} para ${endpoint}`);
          await this.delay(retryDelay * attempt);
          continue;
        }

        // Para outros erros, tentar novamente apenas se não for a última tentativa
        if (attempt === retries) {
          console.error(`API Error (${endpoint}) após ${retries} tentativas:`, error);
          throw this.createApiError(
            error.message || 'Erro desconhecido na requisição.',
            0,
            'UNKNOWN_ERROR',
            error
          );
        }

        console.warn(`Tentativa ${attempt}/${retries} falhou para ${endpoint}:`, error.message);
        await this.delay(retryDelay * attempt);
      }
    }

    throw lastError;
  }

  // Utilitário para delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================
  // AUTENTICAÇÃO
  // ========================================

  async login(credentials: LoginFormData): Promise<{ success: boolean; user: User; token: string }> {
    const response = await this.request<{ success: boolean; message: string; data: { user: User; token: string } }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false
    );

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user, token: response.data.token };
    }

    return { success: false, user: null as any, token: '' };
  }

  async register(userData: RegisterFormData): Promise<{ success: boolean; user: User; token: string }> {
    const response = await this.request<{ success: boolean; user: User; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      false
    );

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  async verifyToken(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/api/auth/verify');
  }

  async getProfile(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/api/auth/profile');
  }

  // ========================================
  // EMPRESAS
  // ========================================

  async getCompanies(params: {
    page?: number;
    limit?: number;
    q?: string;
    situacao?: string;
  } = {}): Promise<{
    success: boolean;
    data: {
      companies: Company[];
      pagination: {
        currentPage: number;
        totalPages: number;
        total: number;
      };
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.q) searchParams.set('q', params.q);
    if (params.situacao) searchParams.set('situacao', params.situacao);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/companies?${queryString}` : '/api/companies';
    
    return this.request<{
      success: boolean;
      data: {
        companies: Company[];
        pagination: {
          currentPage: number;
          totalPages: number;
          total: number;
        };
      };
    }>(endpoint);
  }

  // ========================================
  // CONSULTAS CNPJ
  // ========================================

  async consultCNPJ(cnpj: string, produto: string): Promise<{
    success: boolean;
    data: {
      company: Company;
      consultation: Consultation;
    };
  }> {
    return this.request<{
      success: boolean;
      data: {
        company: Company;
        consultation: Consultation;
      };
    }>('/api/consultations/cnpj', {
      method: 'POST',
      body: JSON.stringify({ cnpj, produto }),
    });
  }

  async getConsultations(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    data: {
      consultations: Consultation[];
      pagination: {
        currentPage: number;
        totalPages: number;
        total: number;
      };
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/consultations?${queryString}` : '/api/consultations';
    
    return this.request<{
      success: boolean;
      data: {
        consultations: Consultation[];
        pagination: {
          currentPage: number;
          totalPages: number;
          total: number;
        };
      };
    }>(endpoint);
  }

  async getConsultationStats(): Promise<{
    success: boolean;
    data: {
      total: number;
      emAndamento: number;
      concluidas: number;
      favoritas: number;
      hoje: number;
      semana: number;
      mes: number;
    };
  }> {
    return this.request<{
      success: boolean;
      data: {
        total: number;
        emAndamento: number;
        concluidas: number;
        favoritas: number;
        hoje: number;
        semana: number;
        mes: number;
      };
    }>('/api/consultations/stats');
  }

  async toggleFavorite(consultationId: string): Promise<{ success: boolean; isFavorite: boolean }> {
    return this.request<{ success: boolean; isFavorite: boolean }>(
      `/api/consultations/${consultationId}/favorite`,
      { method: 'PATCH' }
    );
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Obter usuário do localStorage
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Verificar se o servidor está online
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Método para fazer upload de arquivos
  async uploadFile(file: File, endpoint: string = '/api/upload'): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Não definir Content-Type para multipart/form-data
        // O browser vai definir automaticamente com o boundary
      }
    });
  }

  // Método para cancelar requisições (usando AbortController)
  private abortControllers = new Map<string, AbortController>();
  
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  // Método para fazer requisições com cancelamento
  async requestWithCancel<T>(
    requestId: string,
    endpoint: string,
    options: RequestOptions = {},
    includeAuth: boolean = true
  ): Promise<T> {
    // Cancelar requisição anterior com o mesmo ID
    this.cancelRequest(requestId);

    // Criar novo controller
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    try {
      const result = await this.request<T>(endpoint, {
        ...options,
        signal: controller.signal
      }, includeAuth);
      
      this.abortControllers.delete(requestId);
      return result;
    } catch (error) {
      this.abortControllers.delete(requestId);
      throw error;
    }
  }

  // Método para limpar todos os controllers
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }
}

// Exportar instância única
export const apiService = new ApiService();
export default apiService;
