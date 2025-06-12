// src/services/AuthenticationService.test.ts
import { authenticationService } from './AuthenticationService';
import type { 
  LoginCredentials, 
  User, 
  Permission, 
  SecurityLog 
} from './AuthenticationService';
import * as apiClientModule from './apiClient';
import * as validationModule from '../utils/validation';

// Mock the apiClient
jest.mock('./apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock validation utilities
jest.mock('../utils/validation', () => ({
  adminAuthRateLimit: {
    isAllowed: jest.fn(() => true),
    getRemainingTime: jest.fn(() => 0),
  },
  sanitizeInput: jest.fn((input: string) => input.trim()),
}));

const mockApiClient = apiClientModule.apiClient as jest.Mocked<typeof apiClientModule.apiClient>;
const mockValidation = validationModule as jest.Mocked<typeof validationModule>;

// Mock window.dispatchEvent for session events
const mockDispatchEvent = jest.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
});

describe('AuthenticationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockDispatchEvent.mockClear();
    
    // Reset validation mocks
    mockValidation.adminAuthRateLimit.isAllowed.mockReturnValue(true);
    mockValidation.adminAuthRateLimit.getRemainingTime.mockReturnValue(0);
    mockValidation.sanitizeInput.mockImplementation((input: string) => input.trim());
    
    // Reset NODE_ENV to development for mock behavior
    process.env.NODE_ENV = 'development';
    process.env.REACT_APP_ADMIN_CODE = 'test-admin-code';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('authenticateAdmin', () => {
    it('authenticates admin successfully in development mode', async () => {
      const promise = authenticationService.authenticateAdmin('test-admin-code');
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.user.role).toBe('admin');
      expect(result.data.user.name).toBe('ผู้ดูแลระบบ');
      expect(result.data.user.email).toBe('admin@hotel.com');
      expect(result.data.user.permissions).toHaveLength(6);
      expect(result.data.expiresAt).toBeGreaterThan(Date.now());
    });

    it('rejects incorrect admin password', async () => {
      const promise = authenticationService.authenticateAdmin('wrong-password');
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow('รหัสผ่านไม่ถูกต้อง');
    });

    it('sanitizes input password', async () => {
      const promise = authenticationService.authenticateAdmin('  test-admin-code  ');
      jest.advanceTimersByTime(300);

      expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('  test-admin-code  ');
      await expect(promise).resolves.toBeDefined();
    });

    it('respects rate limiting', async () => {
      mockValidation.adminAuthRateLimit.isAllowed.mockReturnValue(false);
      mockValidation.adminAuthRateLimit.getRemainingTime.mockReturnValue(60);

      await expect(authenticationService.authenticateAdmin('test-admin-code')).rejects.toThrow(
        'คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก 60 วินาที'
      );
      expect(mockValidation.adminAuthRateLimit.isAllowed).toHaveBeenCalledWith('admin-auth');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = {
        data: {
          user: { id: 'admin-001', role: 'admin' },
          expiresAt: Date.now() + 4 * 60 * 60 * 1000,
        },
        success: true,
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.authenticateAdmin('admin-password');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/admin', {
        password: 'admin-password',
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles production authentication errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(authenticationService.authenticateAdmin('wrong')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: Invalid credentials'
      );
    });

    it('handles non-Error exceptions', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce('String error');

      await expect(authenticationService.authenticateAdmin('password')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: Unknown error'
      );
    });
  });

  describe('authenticateStaff', () => {
    const validCredentials: LoginCredentials = {
      username: 'staff1',
      password: 'staff123',
      rememberMe: false,
    };

    it('authenticates staff successfully in development mode', async () => {
      const promise = authenticationService.authenticateStaff(validCredentials);
      jest.advanceTimersByTime(500);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.user.role).toBe('staff');
      expect(result.data.user.name).toBe('พนักงาน staff1');
      expect(result.data.user.email).toBe('staff1@hotel.com');
      expect(result.data.user.permissions).toHaveLength(4);
      expect(result.data.expiresAt).toBeGreaterThan(Date.now());
    });

    it('rejects invalid staff credentials', async () => {
      const invalidCredentials: LoginCredentials = {
        username: 'invalid',
        password: 'wrong',
      };

      const promise = authenticationService.authenticateStaff(invalidCredentials);
      jest.advanceTimersByTime(500);

      await expect(promise).rejects.toThrow('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    });

    it('sanitizes input credentials', async () => {
      const credentialsWithSpaces: LoginCredentials = {
        username: '  staff1  ',
        password: '  staff123  ',
        rememberMe: true,
      };

      const promise = authenticationService.authenticateStaff(credentialsWithSpaces);
      jest.advanceTimersByTime(500);

      expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('  staff1  ');
      expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('  staff123  ');
      await expect(promise).resolves.toBeDefined();
    });

    it('handles credentials without username', async () => {
      const credentialsNoUsername: LoginCredentials = {
        password: 'some-password',
      };

      const promise = authenticationService.authenticateStaff(credentialsNoUsername);
      jest.advanceTimersByTime(500);

      await expect(promise).rejects.toThrow('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    });

    it('respects rate limiting for staff', async () => {
      mockValidation.adminAuthRateLimit.isAllowed.mockReturnValue(false);
      mockValidation.adminAuthRateLimit.getRemainingTime.mockReturnValue(30);

      await expect(authenticationService.authenticateStaff(validCredentials)).rejects.toThrow(
        'คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก 30 วินาที'
      );
      expect(mockValidation.adminAuthRateLimit.isAllowed).toHaveBeenCalledWith('staff-auth-staff1');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = {
        data: {
          user: { id: 'staff-001', role: 'staff' },
          expiresAt: Date.now() + 4 * 60 * 60 * 1000,
        },
        success: true,
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.authenticateStaff(validCredentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/staff', {
        username: 'staff1',
        password: 'staff123',
        rememberMe: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles production staff authentication errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce(new Error('Staff auth failed'));

      await expect(authenticationService.authenticateStaff(validCredentials)).rejects.toThrow(
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: Staff auth failed'
      );
    });
  });

  describe('validateSession', () => {
    it('validates session in development mode', async () => {
      const promise = authenticationService.validateSession();
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
      expect(result.data.remainingTime).toBe(4 * 60 * 60 * 1000); // 4 hours
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = {
        data: { isValid: true, remainingTime: 3600000 },
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.validateSession();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/validate');
      expect(result).toEqual(mockResponse);
    });

    it('handles session validation errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Session invalid'));

      await expect(authenticationService.validateSession()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการตรวจสอบเซสชัน: Session invalid'
      );
    });
  });

  describe('refreshToken', () => {
    it('throws error in development mode', async () => {
      const promise = authenticationService.refreshToken('refresh-token');
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow('Token refresh not implemented in development mode');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = {
        data: {
          user: { id: 'user-001', role: 'staff' },
          token: 'new-token',
          expiresAt: Date.now() + 4 * 60 * 60 * 1000,
        },
        success: true,
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.refreshToken('refresh-token');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/refresh', {
        refreshToken: 'refresh-token',
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles refresh token errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce(new Error('Token expired'));

      await expect(authenticationService.refreshToken('expired-token')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการรีเฟรชโทเค่น: Token expired'
      );
    });
  });

  describe('logout', () => {
    it('logs out successfully in development mode', async () => {
      const promise = authenticationService.logout();
      jest.advanceTimersByTime(200);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: undefined, success: true };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(result).toEqual(mockResponse);
    });

    it('handles logout errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce(new Error('Logout failed'));

      await expect(authenticationService.logout()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการออกจากระบบ: Logout failed'
      );
    });
  });

  describe('changePassword', () => {
    it('changes password successfully in development mode', async () => {
      const promise = authenticationService.changePassword('old-password', 'new-password');
      jest.advanceTimersByTime(500);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('old-password');
      expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('new-password');
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockResponse = { data: undefined, success: true };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.changePassword('current', 'new');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/change-password', {
        currentPassword: 'current',
        newPassword: 'new',
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles password change errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.post.mockRejectedValueOnce(new Error('Password change failed'));

      await expect(authenticationService.changePassword('old', 'new')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: Password change failed'
      );
    });
  });

  describe('getUserPermissions', () => {
    it('returns mock permissions in development mode', async () => {
      const promise = authenticationService.getUserPermissions('user-001');
      jest.advanceTimersByTime(200);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toHaveProperty('resource');
      expect(result.data[0]).toHaveProperty('actions');
      expect(Array.isArray(result.data[0].actions)).toBe(true);
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockPermissions: Permission[] = [
        { resource: 'bookings', actions: ['read', 'write'] },
      ];
      const mockResponse = { data: mockPermissions, success: true };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.getUserPermissions('user-001');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/permissions/user-001');
      expect(result).toEqual(mockResponse);
    });

    it('handles permission fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Permission fetch failed'));

      await expect(authenticationService.getUserPermissions('user-001')).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลสิทธิ์: Permission fetch failed'
      );
    });
  });

  describe('getSecurityLogs', () => {
    it('returns mock security logs in development mode', async () => {
      const promise = authenticationService.getSecurityLogs(10, 0);
      jest.advanceTimersByTime(200);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('action');
      expect(result.data[0]).toHaveProperty('success');
      expect(result.data[0]).toHaveProperty('timestamp');
    });

    it('applies pagination correctly', async () => {
      const promise = authenticationService.getSecurityLogs(1, 1);
      jest.advanceTimersByTime(200);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('log-002'); // Second log due to offset
    });

    it('uses default parameters', async () => {
      const promise = authenticationService.getSecurityLogs();
      jest.advanceTimersByTime(200);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('calls apiClient in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const mockLogs: SecurityLog[] = [
        {
          id: 'log-001',
          action: 'login',
          success: true,
          timestamp: new Date().toISOString(),
        },
      ];
      const mockResponse = { data: mockLogs, success: true };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authenticationService.getSecurityLogs(20, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/security-logs', {
        limit: '20',
        offset: '10',
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles security logs fetch errors', async () => {
      process.env.NODE_ENV = 'production';
      mockApiClient.get.mockRejectedValueOnce(new Error('Logs fetch failed'));

      await expect(authenticationService.getSecurityLogs()).rejects.toThrow(
        'เกิดข้อผิดพลาดในการดึงข้อมูลล็อกความปลอดภัย: Logs fetch failed'
      );
    });
  });

  describe('hasPermission', () => {
    const mockPermissions: Permission[] = [
      { resource: 'bookings', actions: ['create', 'read', 'update'] },
      { resource: 'guests', actions: ['read'] },
    ];

    it('returns true for valid permissions', () => {
      expect(authenticationService.hasPermission(mockPermissions, 'bookings', 'read')).toBe(true);
      expect(authenticationService.hasPermission(mockPermissions, 'bookings', 'create')).toBe(true);
      expect(authenticationService.hasPermission(mockPermissions, 'guests', 'read')).toBe(true);
    });

    it('returns false for invalid permissions', () => {
      expect(authenticationService.hasPermission(mockPermissions, 'bookings', 'delete')).toBe(false);
      expect(authenticationService.hasPermission(mockPermissions, 'guests', 'create')).toBe(false);
      expect(authenticationService.hasPermission(mockPermissions, 'reports', 'read')).toBe(false);
    });

    it('handles empty permissions array', () => {
      expect(authenticationService.hasPermission([], 'bookings', 'read')).toBe(false);
    });
  });

  describe('updateActivity', () => {
    it('resets activity timer', () => {
      const service = authenticationService as any;
      
      // Simulate existing timer
      const mockTimer = setTimeout(() => {}, 1000);
      service.activityTimer = mockTimer;
      
      authenticationService.updateActivity();
      
      expect(service.activityTimer).not.toBe(mockTimer);
      expect(service.activityTimer).toBeDefined();
    });

    it('sets inactivity timeout', () => {
      authenticationService.updateActivity();
      
      // Fast-forward to inactivity timeout (30 minutes)
      jest.advanceTimersByTime(30 * 60 * 1000);
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session-inactive',
        })
      );
    });
  });

  describe('Session management', () => {
    it('starts session management after admin authentication', async () => {
      const service = authenticationService as any;
      
      const promise = authenticationService.authenticateAdmin('test-admin-code');
      jest.advanceTimersByTime(300);
      await promise;
      
      expect(service.sessionTimer).toBeDefined();
      expect(service.activityTimer).toBeDefined();
    });

    it('clears session management on logout', async () => {
      const service = authenticationService as any;
      
      // First authenticate to set up session
      const authPromise = authenticationService.authenticateAdmin('test-admin-code');
      jest.advanceTimersByTime(300);
      await authPromise;
      
      expect(service.sessionTimer).toBeDefined();
      expect(service.activityTimer).toBeDefined();
      
      // Then logout
      const logoutPromise = authenticationService.logout();
      jest.advanceTimersByTime(200);
      await logoutPromise;
      
      expect(service.sessionTimer).toBeNull();
      expect(service.activityTimer).toBeNull();
    });

    it('handles session expiry', async () => {
      const service = authenticationService as any;
      
      // Mock short session duration for testing
      const originalSessionDuration = service.SESSION_DURATION;
      service.SESSION_DURATION = 1000; // 1 second
      
      const promise = authenticationService.authenticateAdmin('test-admin-code');
      jest.advanceTimersByTime(300);
      await promise;
      
      // Fast-forward past session expiry
      jest.advanceTimersByTime(1000);
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session-expired',
        })
      );
      expect(service.sessionTimer).toBeNull();
      expect(service.activityTimer).toBeNull();
      
      // Restore original session duration
      service.SESSION_DURATION = originalSessionDuration;
    });
  });

  describe('Security logging', () => {
    it('logs successful admin login', async () => {
      const promise = authenticationService.authenticateAdmin('test-admin-code');
      jest.advanceTimersByTime(300);
      await promise;
    });

    it('logs failed admin login', async () => {
      const promise = authenticationService.authenticateAdmin('wrong-password');
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow();
    });

    it('logs session events', async () => {
      const service = authenticationService as any;
      
      // Mock short session duration for testing
      service.SESSION_DURATION = 100;
      
      const promise = authenticationService.authenticateAdmin('test-admin-code');
      jest.advanceTimersByTime(300);
      await promise;
      
      // Fast-forward past session expiry
      jest.advanceTimersByTime(100);
    });

    it('logs inactivity events', () => {
      authenticationService.updateActivity();
      
      // Fast-forward to inactivity timeout
      jest.advanceTimersByTime(30 * 60 * 1000);
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles environment variable defaults', async () => {
      delete process.env.REACT_APP_ADMIN_CODE;
      
      const promise = authenticationService.authenticateAdmin('default-dev-code');
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.success).toBe(true);
    });

    it('handles staff authentication with different valid users', async () => {
      const staff2Credentials: LoginCredentials = {
        username: 'staff2',
        password: 'staff456',
      };

      const promise = authenticationService.authenticateStaff(staff2Credentials);
      jest.advanceTimersByTime(500);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data.user.name).toBe('พนักงาน staff2');
      expect(result.data.user.email).toBe('staff2@hotel.com');
    });

    it('handles session management with zero or negative expiry time', () => {
      const service = authenticationService as any;
      
      // Test with past expiry time
      service.startSessionManagement(Date.now() - 1000);
      
      // Should not set session timer for past expiry
      expect(service.sessionTimer).toBeNull();
      expect(service.activityTimer).toBeDefined(); // Activity timer should still be set
    });
  });
});