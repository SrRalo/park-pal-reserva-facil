import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para agregar token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      (error: AxiosError) => {
        const errorData = error.response?.data as ApiErrorResponse;
        
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: errorData,
          });
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Token expirado o inválido
          console.warn('Token expired or invalid, redirecting to login');
          this.handleAuthError();
        }

        // Transform error to a consistent format
        const transformedError = {
          ...error,
          message: errorData?.message || error.message || 'Error de conexión',
          errors: errorData?.errors || {},
          status: error.response?.status || 0,
        };

        return Promise.reject(transformedError);
      }
    );
  }

  private handleAuthError(): void {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Métodos HTTP genéricos
  public async get<T>(url: string, config = {}): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  public async post<T>(url: string, data = {}, config = {}): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  public async put<T>(url: string, data = {}, config = {}): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  public async delete<T>(url: string, config = {}): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  public async patch<T>(url: string, data = {}, config = {}): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  // Utility methods
  public setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public clearAuthToken(): void {
    localStorage.removeItem('token');
  }

  public getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiClient = new ApiClient();
