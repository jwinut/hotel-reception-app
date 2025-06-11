// src/services/AuthenticationService.ts
import { apiClient, ApiResponse } from './apiClient';
import { adminAuthRateLimit, sanitizeInput } from '../utils/validation';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'staff' | 'readonly';
  permissions: Permission[];
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface AuthenticationResult {
  user: User;
  token?: string;
  expiresAt: number;
  refreshToken?: string;
}

export interface LoginCredentials {
  username?: string;
  password: string;
  rememberMe?: boolean;
}

export interface SessionInfo {
  isValid: boolean;
  user?: User;
  expiresAt?: number;
  remainingTime?: number;
}

export interface SecurityLog {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  timestamp: string;
  details?: string;
}

class AuthenticationService {
  private readonly endpoint = '/api/auth';
  private readonly SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  private sessionTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;

  // Admin authentication with rate limiting
  async authenticateAdmin(password: string): Promise<ApiResponse<AuthenticationResult>> {
    try {
      const clientId = 'admin-auth';
      
      // Check rate limiting
      if (!adminAuthRateLimit.isAllowed(clientId)) {
        const remainingTime = adminAuthRateLimit.getRemainingTime(clientId);
        throw new Error(`คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก ${remainingTime} วินาที`);
      }

      // Sanitize input
      const sanitizedPassword = sanitizeInput(password);
      
      if (process.env.NODE_ENV === 'development') {
        return this.mockAdminAuthentication(sanitizedPassword);
      }

      const response = await apiClient.post<AuthenticationResult>(`${this.endpoint}/admin`, {
        password: sanitizedPassword,
      });

      if (response.success) {
        this.startSessionManagement(response.data.expiresAt);
        this.logSecurityEvent('admin_login', response.data.user.id, true);
      }

      return response;
    } catch (error) {
      this.logSecurityEvent('admin_login', undefined, false, error instanceof Error ? error.message : undefined);
      throw new Error(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Staff authentication
  async authenticateStaff(credentials: LoginCredentials): Promise<ApiResponse<AuthenticationResult>> {
    try {
      const clientId = `staff-auth-${credentials.username}`;
      
      // Check rate limiting
      if (!adminAuthRateLimit.isAllowed(clientId)) {
        const remainingTime = adminAuthRateLimit.getRemainingTime(clientId);
        throw new Error(`คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก ${remainingTime} วินาที`);
      }

      // Sanitize inputs
      const sanitizedCredentials: LoginCredentials = {
        password: sanitizeInput(credentials.password),
        rememberMe: credentials.rememberMe || false,
      };
      
      if (credentials.username) {
        sanitizedCredentials.username = sanitizeInput(credentials.username);
      }

      if (process.env.NODE_ENV === 'development') {
        return this.mockStaffAuthentication(sanitizedCredentials);
      }

      const response = await apiClient.post<AuthenticationResult>(`${this.endpoint}/staff`, sanitizedCredentials);

      if (response.success) {
        this.startSessionManagement(response.data.expiresAt);
        this.logSecurityEvent('staff_login', response.data.user.id, true);
      }

      return response;
    } catch (error) {
      this.logSecurityEvent('staff_login', credentials.username, false, error instanceof Error ? error.message : undefined);
      throw new Error(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate current session
  async validateSession(): Promise<ApiResponse<SessionInfo>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.mockSessionValidation();
      }

      return await apiClient.get<SessionInfo>(`${this.endpoint}/validate`);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการตรวจสอบเซสชัน: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Refresh authentication token
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthenticationResult>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        throw new Error('Token refresh not implemented in development mode');
      }

      return await apiClient.post<AuthenticationResult>(`${this.endpoint}/refresh`, {
        refreshToken,
      });
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการรีเฟรชโทเค่น: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    try {
      this.clearSessionManagement();
      
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 200));
        this.logSecurityEvent('logout', undefined, true);
        return { data: undefined, success: true };
      }

      const response = await apiClient.post<void>(`${this.endpoint}/logout`);
      
      if (response.success) {
        this.logSecurityEvent('logout', undefined, true);
      }

      return response;
    } catch (error) {
      this.logSecurityEvent('logout', undefined, false, error instanceof Error ? error.message : undefined);
      throw new Error(`เกิดข้อผิดพลาดในการออกจากระบบ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const sanitizedPasswords = {
        currentPassword: sanitizeInput(currentPassword),
        newPassword: sanitizeInput(newPassword),
      };

      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.logSecurityEvent('password_change', undefined, true);
        return { data: undefined, success: true };
      }

      const response = await apiClient.post<void>(`${this.endpoint}/change-password`, sanitizedPasswords);
      
      if (response.success) {
        this.logSecurityEvent('password_change', undefined, true);
      }

      return response;
    } catch (error) {
      this.logSecurityEvent('password_change', undefined, false, error instanceof Error ? error.message : undefined);
      throw new Error(`เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<ApiResponse<Permission[]>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const mockPermissions: Permission[] = [
          { resource: 'bookings', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'guests', actions: ['create', 'read', 'update'] },
          { resource: 'rooms', actions: ['read', 'update'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'configuration', actions: ['read', 'update'] },
        ];

        return { data: mockPermissions, success: true };
      }

      return await apiClient.get<Permission[]>(`${this.endpoint}/permissions/${userId}`);
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลสิทธิ์: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get security logs
  async getSecurityLogs(limit: number = 50, offset: number = 0): Promise<ApiResponse<SecurityLog[]>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockSecurityLogs(limit, offset);
      }

      return await apiClient.get<SecurityLog[]>(`${this.endpoint}/security-logs`, {
        limit: limit.toString(),
        offset: offset.toString(),
      });
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลล็อกความปลอดภัย: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if user has permission
  hasPermission(permissions: Permission[], resource: string, action: string): boolean {
    const permission = permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  }

  // Update activity timestamp
  updateActivity(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    // Reset inactivity timer
    this.activityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }

  // Session management
  private startSessionManagement(expiresAt: number): void {
    this.clearSessionManagement();

    // Set session expiry timer
    const timeToExpiry = expiresAt - Date.now();
    if (timeToExpiry > 0) {
      this.sessionTimer = setTimeout(() => {
        this.handleSessionExpiry();
      }, timeToExpiry);
    }

    // Start activity monitoring
    this.updateActivity();
  }

  private clearSessionManagement(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
  }

  private handleSessionExpiry(): void {
    this.logSecurityEvent('session_expired', undefined, true);
    this.clearSessionManagement();
    // Dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('session-expired'));
  }

  private handleInactivity(): void {
    this.logSecurityEvent('session_inactive', undefined, true);
    this.clearSessionManagement();
    // Dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('session-inactive'));
  }

  // Mock implementations for development
  private async mockAdminAuthentication(password: string): Promise<ApiResponse<AuthenticationResult>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const adminCode = process.env.REACT_APP_ADMIN_CODE || 'default-dev-code';
    
    if (password !== adminCode) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    const result: AuthenticationResult = {
      user: {
        id: 'admin-001',
        name: 'ผู้ดูแลระบบ',
        email: 'admin@hotel.com',
        role: 'admin',
        permissions: [
          { resource: 'bookings', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'guests', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'rooms', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'configuration', actions: ['read', 'update'] },
          { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
        ],
        lastLogin: new Date().toISOString(),
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    return { data: result, success: true };
  }

  private async mockStaffAuthentication(credentials: LoginCredentials): Promise<ApiResponse<AuthenticationResult>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple mock authentication for staff
    const validStaff = [
      { username: 'staff1', password: 'staff123' },
      { username: 'staff2', password: 'staff456' },
    ];

    const staff = validStaff.find(s => s.username === credentials.username && s.password === credentials.password);
    
    if (!staff) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const result: AuthenticationResult = {
      user: {
        id: `staff-${staff.username}`,
        name: `พนักงาน ${staff.username}`,
        email: `${staff.username}@hotel.com`,
        role: 'staff',
        permissions: [
          { resource: 'bookings', actions: ['create', 'read', 'update'] },
          { resource: 'guests', actions: ['create', 'read', 'update'] },
          { resource: 'rooms', actions: ['read'] },
          { resource: 'reports', actions: ['read'] },
        ],
        lastLogin: new Date().toISOString(),
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    return { data: result, success: true };
  }

  private async mockSessionValidation(): Promise<ApiResponse<SessionInfo>> {
    await new Promise(resolve => setTimeout(resolve, 100));

    // In development, assume session is always valid
    const sessionInfo: SessionInfo = {
      isValid: true,
      remainingTime: this.SESSION_DURATION,
    };

    return { data: sessionInfo, success: true };
  }

  private async getMockSecurityLogs(limit: number, offset: number): Promise<ApiResponse<SecurityLog[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockLogs: SecurityLog[] = [
      {
        id: 'log-001',
        userId: 'admin-001',
        action: 'admin_login',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: true,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'log-002',
        userId: 'staff-staff1',
        action: 'staff_login',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        success: true,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'log-003',
        action: 'admin_login',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0...',
        success: false,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        details: 'รหัสผ่านไม่ถูกต้อง',
      },
    ];

    // Apply pagination
    const paginatedLogs = mockLogs.slice(offset, offset + limit);

    return { data: paginatedLogs, success: true };
  }

  private logSecurityEvent(action: string, userId?: string, success: boolean = true, details?: string): void {
    // In a real implementation, this would send to a logging service
    console.log(`[Security Log] ${action} - User: ${userId || 'anonymous'} - Success: ${success}${details ? ` - Details: ${details}` : ''}`);
  }
}

// Export singleton instance
export const authenticationService = new AuthenticationService();
export default AuthenticationService;