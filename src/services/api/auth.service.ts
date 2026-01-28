import apiClient, { saveAuth, clearAuth } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'ADMIN';
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      userId: string;
      username: string;
      email: string;
      role: string;
      studentId?: string;
      adminId?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login...', { username: credentials.username });
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      console.log('✅ Login successful');
      
      // Save auth data to AsyncStorage
      const { accessToken, refreshToken, user } = response.data.data;
      await saveAuth(accessToken, refreshToken, user);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      
      // More specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      // Save auth data to AsyncStorage
      const { accessToken, refreshToken, user } = response.data.data;
      await saveAuth(accessToken, refreshToken, user);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth data regardless of API call result
      await clearAuth();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }
}

export default new AuthService();
