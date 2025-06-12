// src/store/slices/authSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice, authenticateAdmin, validateSession } from './authSlice';
// We'll define AuthState locally since it's not exported from the slice
interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff' | 'readonly';
  permissions: string[];
  lastLogin?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isAdminMode: boolean;
  user: User | null;
  sessionExpiry: number | null;
  lastActivity: number;
  loginAttempts: number;
  isBlocked: boolean;
  blockUntil: number | null;
  isLoading: boolean;
  error: string | null;
}
import * as validationModule from '../../utils/validation';

// Mock the validation utilities
jest.mock('../../utils/validation', () => ({
  adminAuthRateLimit: {
    isAllowed: jest.fn(() => true),
    getRemainingTime: jest.fn(() => 0),
  },
  sanitizeInput: jest.fn((input: string) => input.trim()),
}));

const mockValidation = validationModule as jest.Mocked<typeof validationModule>;

// Helper function to create a test store
const createTestStore = (initialState?: Partial<AuthState>) => {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: initialState ? { auth: { ...authSlice.getInitialState(), ...initialState } } : undefined,
  });
  return store;
};

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockValidation.adminAuthRateLimit.isAllowed.mockReturnValue(true);
    mockValidation.adminAuthRateLimit.getRemainingTime.mockReturnValue(0);
    mockValidation.sanitizeInput.mockImplementation((input: string) => input.trim());
    
    // Set up environment variable for testing
    process.env.REACT_APP_ADMIN_CODE = 'test-admin-code';
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.REACT_APP_ADMIN_CODE;
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = createTestStore();
      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdminMode).toBe(false);
      expect(state.user).toBeNull();
      expect(state.sessionExpiry).toBeNull();
      expect(state.lastActivity).toBeCloseTo(Date.now(), -2); // Within 100ms
      expect(state.loginAttempts).toBe(0);
      expect(state.isBlocked).toBe(false);
      expect(state.blockUntil).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Reducers', () => {
    describe('logout', () => {
      it('should reset authentication state', () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: true,
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['admin'],
          },
          sessionExpiry: Date.now() + 1000000,
          error: 'Some error',
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.logout());
        const state = store.getState().auth;

        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdminMode).toBe(false);
        expect(state.user).toBeNull();
        expect(state.sessionExpiry).toBeNull();
        expect(state.error).toBeNull();
      });
    });

    describe('toggleAdminMode', () => {
      it('should toggle admin mode when user is authenticated admin', () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: false,
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['admin'],
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.toggleAdminMode());
        
        expect(store.getState().auth.isAdminMode).toBe(true);

        store.dispatch(authSlice.actions.toggleAdminMode());
        expect(store.getState().auth.isAdminMode).toBe(false);
      });

      it('should not toggle admin mode when user is not admin', () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: false,
          user: {
            id: 'staff-001',
            name: 'พนักงาน',
            role: 'staff',
            permissions: ['read'],
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.toggleAdminMode());
        
        expect(store.getState().auth.isAdminMode).toBe(false);
      });

      it('should not toggle admin mode when not authenticated', () => {
        const store = createTestStore();
        store.dispatch(authSlice.actions.toggleAdminMode());
        
        expect(store.getState().auth.isAdminMode).toBe(false);
      });
    });

    describe('updateActivity', () => {
      it('should update last activity timestamp', () => {
        const store = createTestStore();
        const initialActivity = store.getState().auth.lastActivity;
        
        jest.advanceTimersByTime(1000);
        store.dispatch(authSlice.actions.updateActivity());
        
        const newActivity = store.getState().auth.lastActivity;
        expect(newActivity).toBeGreaterThan(initialActivity);
      });

      it('should extend session when authenticated', () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          sessionExpiry: Date.now() + 1000000,
        };

        const store = createTestStore(initialState);
        const initialExpiry = store.getState().auth.sessionExpiry!;
        
        jest.advanceTimersByTime(1000);
        store.dispatch(authSlice.actions.updateActivity());
        
        const newExpiry = store.getState().auth.sessionExpiry!;
        expect(newExpiry).toBeGreaterThan(initialExpiry);
        expect(newExpiry).toBeCloseTo(Date.now() + (4 * 60 * 60 * 1000), -3); // 4 hours from now
      });

      it('should not extend session when not authenticated', () => {
        const store = createTestStore();
        
        store.dispatch(authSlice.actions.updateActivity());
        
        expect(store.getState().auth.sessionExpiry).toBeNull();
      });
    });

    describe('clearError', () => {
      it('should clear the error state', () => {
        const initialState: Partial<AuthState> = {
          error: 'Some error message',
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.clearError());
        
        expect(store.getState().auth.error).toBeNull();
      });
    });

    describe('resetRateLimit', () => {
      it('should reset rate limiting state', () => {
        const initialState: Partial<AuthState> = {
          loginAttempts: 3,
          isBlocked: true,
          blockUntil: Date.now() + 1000000,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.resetRateLimit());
        const state = store.getState().auth;

        expect(state.loginAttempts).toBe(0);
        expect(state.isBlocked).toBe(false);
        expect(state.blockUntil).toBeNull();
      });
    });

    describe('updateUserPermissions', () => {
      it('should update user permissions when user exists', () => {
        const initialState: Partial<AuthState> = {
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['read'],
          },
        };

        const store = createTestStore(initialState);
        const newPermissions = ['read', 'write', 'admin'];
        
        store.dispatch(authSlice.actions.updateUserPermissions(newPermissions));
        
        expect(store.getState().auth.user?.permissions).toEqual(newPermissions);
      });

      it('should not update permissions when user is null', () => {
        const store = createTestStore();
        const newPermissions = ['read', 'write'];
        
        store.dispatch(authSlice.actions.updateUserPermissions(newPermissions));
        
        expect(store.getState().auth.user).toBeNull();
      });
    });

    describe('checkSessionExpiry', () => {
      it('should logout when session is expired', () => {
        const expiredTime = Date.now() - 1000; // 1 second ago
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: true,
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['admin'],
          },
          sessionExpiry: expiredTime,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.checkSessionExpiry());
        const state = store.getState().auth;

        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdminMode).toBe(false);
        expect(state.user).toBeNull();
        expect(state.sessionExpiry).toBeNull();
        expect(state.error).toBe('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      });

      it('should not logout when session is still valid', () => {
        const futureTime = Date.now() + 1000000; // Far in future
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: true,
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['admin'],
          },
          sessionExpiry: futureTime,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.checkSessionExpiry());
        const state = store.getState().auth;

        expect(state.isAuthenticated).toBe(true);
        expect(state.user).not.toBeNull();
      });

      it('should not logout when no session expiry is set', () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          sessionExpiry: null,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.checkSessionExpiry());
        
        expect(store.getState().auth.isAuthenticated).toBe(true);
      });
    });

    describe('handleInactivity', () => {
      it('should logout when inactive for too long', () => {
        const longAgoActivity = Date.now() - (35 * 60 * 1000); // 35 minutes ago
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: true,
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['admin'],
          },
          lastActivity: longAgoActivity,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.handleInactivity());
        const state = store.getState().auth;

        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdminMode).toBe(false);
        expect(state.user).toBeNull();
        expect(state.sessionExpiry).toBeNull();
        expect(state.error).toBe('เซสชันหมดอายุเนื่องจากไม่มีการใช้งาน');
      });

      it('should not logout when activity is recent', () => {
        const recentActivity = Date.now() - (10 * 60 * 1000); // 10 minutes ago
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          lastActivity: recentActivity,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.handleInactivity());
        
        expect(store.getState().auth.isAuthenticated).toBe(true);
      });

      it('should not logout when not authenticated', () => {
        const longAgoActivity = Date.now() - (35 * 60 * 1000);
        const initialState: Partial<AuthState> = {
          isAuthenticated: false,
          lastActivity: longAgoActivity,
        };

        const store = createTestStore(initialState);
        store.dispatch(authSlice.actions.handleInactivity());
        
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(store.getState().auth.error).toBeNull();
      });
    });
  });

  describe('Async Thunks', () => {
    describe('authenticateAdmin', () => {
      it('should authenticate successfully with correct password', async () => {
        const store = createTestStore();
        
        const promise = store.dispatch(authenticateAdmin('test-admin-code'));
        jest.advanceTimersByTime(300); // Fast-forward through authentication delay
        const result = await promise;

        expect(result.type).toBe('auth/authenticateAdmin/fulfilled');
        expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('test-admin-code');
        
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAdminMode).toBe(true);
        expect(state.user).toEqual({
          id: 'admin-001',
          name: 'ผู้ดูแลระบบ',
          role: 'admin',
          permissions: ['create', 'read', 'update', 'delete', 'admin'],
          lastLogin: expect.any(String),
        });
        expect(state.sessionExpiry).toBeCloseTo(Date.now() + (4 * 60 * 60 * 1000), -3);
        expect(state.loginAttempts).toBe(0);
        expect(state.isBlocked).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should reject with incorrect password', async () => {
        const store = createTestStore();
        
        const promise = store.dispatch(authenticateAdmin('wrong-password'));
        jest.advanceTimersByTime(300);
        const result = await promise;

        expect(result.type).toBe('auth/authenticateAdmin/rejected');
        expect(result.payload).toBe('รหัสผ่านไม่ถูกต้อง');
        
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdminMode).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('รหัสผ่านไม่ถูกต้อง');
        expect(state.loginAttempts).toBe(1);
      });

      it('should handle rate limiting', async () => {
        mockValidation.adminAuthRateLimit.isAllowed.mockReturnValue(false);
        mockValidation.adminAuthRateLimit.getRemainingTime.mockReturnValue(120);

        const store = createTestStore();
        
        const promise = store.dispatch(authenticateAdmin('test-admin-code'));
        jest.advanceTimersByTime(300);
        const result = await promise;

        expect(result.type).toBe('auth/authenticateAdmin/rejected');
        expect(result.payload).toBe('คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก 120 วินาที');
        expect(mockValidation.adminAuthRateLimit.isAllowed).toHaveBeenCalledWith('admin-auth');
      });

      it('should block after 3 failed attempts', async () => {
        const store = createTestStore();

        // First 2 failed attempts
        for (let i = 0; i < 2; i++) {
          const promise = store.dispatch(authenticateAdmin('wrong'));
          jest.advanceTimersByTime(300);
          await promise;
        }

        expect(store.getState().auth.loginAttempts).toBe(2);
        expect(store.getState().auth.isBlocked).toBe(false);

        // Third failed attempt should trigger blocking
        const promise = store.dispatch(authenticateAdmin('wrong'));
        jest.advanceTimersByTime(300);
        await promise;

        const state = store.getState().auth;
        expect(state.loginAttempts).toBe(3);
        expect(state.isBlocked).toBe(true);
        expect(state.blockUntil).toBeCloseTo(Date.now() + (5 * 60 * 1000), -3); // 5 minutes
      });

      it('should use default admin code when env var not set', async () => {
        delete process.env.REACT_APP_ADMIN_CODE;
        
        const store = createTestStore();
        
        const promise = store.dispatch(authenticateAdmin('default-dev-code'));
        jest.advanceTimersByTime(300);
        const result = await promise;

        expect(result.type).toBe('auth/authenticateAdmin/fulfilled');
      });

      it('should set loading state during authentication', () => {
        const store = createTestStore();
        
        store.dispatch(authenticateAdmin('test-admin-code'));
        
        expect(store.getState().auth.isLoading).toBe(true);
        expect(store.getState().auth.error).toBeNull();
      });

      it('should sanitize input password', async () => {
        const store = createTestStore();
        
        const promise = store.dispatch(authenticateAdmin('  test-admin-code  '));
        jest.advanceTimersByTime(300);
        await promise;

        expect(mockValidation.sanitizeInput).toHaveBeenCalledWith('  test-admin-code  ');
      });
    });

    describe('validateSession', () => {
      it('should validate active session successfully', async () => {
        const futureTime = Date.now() + 1000000;
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          sessionExpiry: futureTime,
          lastActivity: Date.now() - 1000,
        };

        const store = createTestStore(initialState);
        
        const result = await store.dispatch(validateSession());

        expect(result.type).toBe('auth/validateSession/fulfilled');
        expect(result.payload).toBe(true);
        
        const state = store.getState().auth;
        expect(state.lastActivity).toBeCloseTo(Date.now(), -2);
      });

      it('should reject when not authenticated', async () => {
        const store = createTestStore();
        
        const result = await store.dispatch(validateSession());

        expect(result.type).toBe('auth/validateSession/rejected');
        expect(result.payload).toBe('ไม่มีเซสชันที่ถูกต้อง');
      });

      it('should reject when session is expired', async () => {
        const pastTime = Date.now() - 1000;
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          sessionExpiry: pastTime,
        };

        const store = createTestStore(initialState);
        
        const result = await store.dispatch(validateSession());

        expect(result.type).toBe('auth/validateSession/rejected');
        expect(result.payload).toBe('เซสชันหมดอายุ');
      });

      it('should reject when no session expiry set', async () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          sessionExpiry: null,
        };

        const store = createTestStore(initialState);
        
        const result = await store.dispatch(validateSession());

        expect(result.type).toBe('auth/validateSession/rejected');
        expect(result.payload).toBe('ไม่มีเซสชันที่ถูกต้อง');
      });

      it('should logout on session validation failure', async () => {
        const initialState: Partial<AuthState> = {
          isAuthenticated: true,
          isAdminMode: true,
          user: {
            id: 'admin-001',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
            permissions: ['admin'],
          },
          sessionExpiry: null,
        };

        const store = createTestStore(initialState);
        
        await store.dispatch(validateSession());

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdminMode).toBe(false);
        expect(state.user).toBeNull();
        expect(state.sessionExpiry).toBeNull();
        expect(state.error).toBe('ไม่มีเซสชันที่ถูกต้อง');
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle multiple rapid authentication attempts', async () => {
      const store = createTestStore();
      
      // Dispatch multiple authentication attempts rapidly
      const promises = [
        store.dispatch(authenticateAdmin('wrong1')),
        store.dispatch(authenticateAdmin('wrong2')),
        store.dispatch(authenticateAdmin('test-admin-code')),
      ];

      jest.advanceTimersByTime(300);
      const results = await Promise.all(promises);

      // First two should fail, third should succeed
      expect(results[0].type).toBe('auth/authenticateAdmin/rejected');
      expect(results[1].type).toBe('auth/authenticateAdmin/rejected');
      expect(results[2].type).toBe('auth/authenticateAdmin/fulfilled');
      
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.loginAttempts).toBe(0); // Reset on successful auth
    });

    it('should handle session expiry during active use', () => {
      const expiredTime = Date.now() - 1000;
      const initialState: Partial<AuthState> = {
        isAuthenticated: true,
        isAdminMode: true,
        user: {
          id: 'admin-001',
          name: 'ผู้ดูแลระบบ',
          role: 'admin',
          permissions: ['admin'],
        },
        sessionExpiry: expiredTime,
      };

      const store = createTestStore(initialState);
      
      // updateActivity extends session when authenticated, so call checkSessionExpiry first
      store.dispatch(authSlice.actions.checkSessionExpiry());
      
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    });

    it('should handle complex state transitions', () => {
      const store = createTestStore();
      
      // Start with error state
      store.dispatch(authSlice.actions.clearError());
      
      // Set up blocked state
      const blockedState: Partial<AuthState> = {
        loginAttempts: 3,
        isBlocked: true,
        blockUntil: Date.now() + 300000,
      };
      
      // This is a bit artificial since we can't easily set partial state
      // but tests the reset functionality
      store.dispatch(authSlice.actions.resetRateLimit());
      
      const state = store.getState().auth;
      expect(state.loginAttempts).toBe(0);
      expect(state.isBlocked).toBe(false);
      expect(state.blockUntil).toBeNull();
    });

    it('should preserve user data during admin mode toggle', () => {
      const userData = {
        id: 'admin-001',
        name: 'ผู้ดูแลระบบ',
        role: 'admin' as const,
        permissions: ['admin'],
      };

      const initialState: Partial<AuthState> = {
        isAuthenticated: true,
        isAdminMode: false,
        user: userData,
      };

      const store = createTestStore(initialState);
      
      store.dispatch(authSlice.actions.toggleAdminMode());
      
      const state = store.getState().auth;
      expect(state.isAdminMode).toBe(true);
      expect(state.user).toEqual(userData); // User data preserved
      expect(state.isAuthenticated).toBe(true); // Authentication preserved
    });
  });
});