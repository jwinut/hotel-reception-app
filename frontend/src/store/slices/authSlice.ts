// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminAuthRateLimit, sanitizeInput } from '../../utils/validation';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff' | 'readonly';
  permissions: string[];
  lastLogin?: string;
}

interface AuthState {
  // Authentication status
  isAuthenticated: boolean;
  isAdminMode: boolean;
  
  // User information
  user: User | null;
  
  // Session management
  sessionExpiry: number | null;
  lastActivity: number;
  
  // Rate limiting and security
  loginAttempts: number;
  isBlocked: boolean;
  blockUntil: number | null;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAdminMode: false,
  user: null,
  sessionExpiry: null,
  lastActivity: Date.now(),
  loginAttempts: 0,
  isBlocked: false,
  blockUntil: null,
  isLoading: false,
  error: null,
};

// Async thunk for admin authentication
export const authenticateAdmin = createAsyncThunk(
  'auth/authenticateAdmin',
  async (password: string, { rejectWithValue }) => {
    try {
      const clientId = 'admin-auth';
      
      // Check rate limiting
      if (!adminAuthRateLimit.isAllowed(clientId)) {
        const remainingTime = adminAuthRateLimit.getRemainingTime(clientId);
        throw new Error(`คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารออีก ${remainingTime} วินาที`);
      }
      
      // Sanitize input
      const sanitizedPassword = sanitizeInput(password);
      const adminCode = process.env.REACT_APP_ADMIN_CODE || 'default-dev-code';
      
      if (sanitizedPassword !== adminCode) {
        throw new Error('รหัสผ่านไม่ถูกต้อง');
      }
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return user data
      const user: User = {
        id: 'admin-001',
        name: 'ผู้ดูแลระบบ',
        role: 'admin',
        permissions: ['create', 'read', 'update', 'delete', 'admin'],
        lastLogin: new Date().toISOString(),
      };
      
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  }
);

// Async thunk for session validation
export const validateSession = createAsyncThunk(
  'auth/validateSession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { sessionExpiry, isAuthenticated } = state.auth;
      
      if (!isAuthenticated || !sessionExpiry) {
        throw new Error('ไม่มีเซสชันที่ถูกต้อง');
      }
      
      if (Date.now() > sessionExpiry) {
        throw new Error('เซสชันหมดอายุ');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'เซสชันไม่ถูกต้อง');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.isAdminMode = false;
      state.user = null;
      state.sessionExpiry = null;
      state.error = null;
    },
    
    // Toggle admin mode (when already authenticated)
    toggleAdminMode: (state) => {
      if (state.isAuthenticated && state.user?.role === 'admin') {
        state.isAdminMode = !state.isAdminMode;
      }
    },
    
    // Update last activity for session management
    updateActivity: (state) => {
      state.lastActivity = Date.now();
      // Extend session if authenticated
      if (state.isAuthenticated) {
        state.sessionExpiry = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
      }
    },
    
    // Clear authentication errors
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset rate limiting (for testing or admin override)
    resetRateLimit: (state) => {
      state.loginAttempts = 0;
      state.isBlocked = false;
      state.blockUntil = null;
    },
    
    // Update user permissions
    updateUserPermissions: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.permissions = action.payload;
      }
    },
    
    // Check and handle session expiry
    checkSessionExpiry: (state) => {
      if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
        state.isAuthenticated = false;
        state.isAdminMode = false;
        state.user = null;
        state.sessionExpiry = null;
        state.error = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
      }
    },
    
    // Handle inactivity
    handleInactivity: (state) => {
      const inactiveTime = Date.now() - state.lastActivity;
      const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
      
      if (inactiveTime > maxInactiveTime && state.isAuthenticated) {
        state.isAuthenticated = false;
        state.isAdminMode = false;
        state.user = null;
        state.sessionExpiry = null;
        state.error = 'เซสชันหมดอายุเนื่องจากไม่มีการใช้งาน';
      }
    },
  },
  
  extraReducers: (builder) => {
    // Admin authentication
    builder
      .addCase(authenticateAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isAdminMode = true;
        state.user = action.payload;
        state.sessionExpiry = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
        state.lastActivity = Date.now();
        state.loginAttempts = 0;
        state.isBlocked = false;
        state.blockUntil = null;
        state.error = null;
      })
      .addCase(authenticateAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isAdminMode = false;
        state.user = null;
        state.error = action.payload as string;
        state.loginAttempts += 1;
        
        // Handle blocking after too many attempts
        if (state.loginAttempts >= 3) {
          state.isBlocked = true;
          state.blockUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
        }
      });
    
    // Session validation
    builder
      .addCase(validateSession.fulfilled, (state) => {
        // Session is valid, update activity
        state.lastActivity = Date.now();
      })
      .addCase(validateSession.rejected, (state, action) => {
        // Session invalid, logout
        state.isAuthenticated = false;
        state.isAdminMode = false;
        state.user = null;
        state.sessionExpiry = null;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  toggleAdminMode,
  updateActivity,
  clearError,
  resetRateLimit,
  updateUserPermissions,
  checkSessionExpiry,
  handleInactivity,
} = authSlice.actions;