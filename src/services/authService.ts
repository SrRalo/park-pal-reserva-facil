import { apiClient } from '@/lib/apiClient';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  UsuarioReserva,
  ApiResponse 
} from '@/types/api';

export class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/login', credentials);
      
      if (response.data.success && response.data.data?.access_token) {
        // Guardar token automáticamente
        apiClient.setAuthToken(response.data.data.access_token);
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('Auth login error:', error);
      
      // Manejar errores específicos de validación
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
        if (axiosError.response?.status === 422) {
          const validationErrors = axiosError.response?.data?.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat();
            throw new Error(errorMessages.join(', '));
          }
        }
        
        const errorMessage = axiosError.response?.data?.message || 'Error de autenticación';
        throw new Error(errorMessage);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      throw new Error(errorMessage);
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/register', userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Auth register error:', error);
      
      // Manejar errores específicos de validación
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
        if (axiosError.response?.status === 422) {
          const validationErrors = axiosError.response?.data?.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat();
            throw new Error(errorMessages.join(', '));
          }
        }
        
        const errorMessage = axiosError.response?.data?.message || 'Error de registro';
        throw new Error(errorMessage);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error de registro';
      throw new Error(errorMessage);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout del backend
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Auth logout error:', error);
      // Continuar con el logout local aunque falle el backend
    } finally {
      // Limpiar datos locales
      apiClient.clearAuthToken();
      localStorage.removeItem('user');
    }
  }

  /**
   * Obtener usuario actual (si es necesario)
   */
  async getCurrentUser(): Promise<UsuarioReserva> {
    try {
      const response = await apiClient.get<ApiResponse<UsuarioReserva>>('/me');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo obtener la información del usuario');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error obteniendo usuario';
      console.error('Get current user error:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return apiClient.getAuthToken();
  }

  /**
   * Verificar y renovar token si es necesario
   */
  async verifyToken(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      // Intentar hacer una petición simple para verificar el token
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Limpiar token inválido
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
