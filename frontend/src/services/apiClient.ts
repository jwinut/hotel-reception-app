// src/services/apiClient.ts
import { Booking, BookingStatus } from '../types';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง');
        }
        throw error;
      }
      
      throw new Error('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return this.makeRequest<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: 'POST',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.makeRequest<T>(endpoint, options);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: 'PUT',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.makeRequest<T>(endpoint, options);
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: 'PATCH',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.makeRequest<T>(endpoint, options);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient(
  process.env.REACT_APP_API_BASE_URL || '',
  parseInt(process.env.REACT_APP_API_TIMEOUT || '10000')
);

export type { ApiResponse, ApiErrorResponse };