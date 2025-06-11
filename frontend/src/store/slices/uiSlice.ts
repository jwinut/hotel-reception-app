// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  type: 'booking-details' | 'check-in' | 'check-out' | 'cancel' | 'edit' | null;
  data?: any;
}

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  // Navigation and layout
  sidebarOpen: boolean;
  currentPage: string;
  
  // Modals
  modal: ModalState;
  
  // Notifications/Toasts
  notifications: NotificationState[];
  
  // Loading states for different operations
  loadingStates: {
    [key: string]: boolean;
  };
  
  // Form states
  forms: {
    guestForm: {
      isDirty: boolean;
      hasErrors: boolean;
      currentStep: number;
    };
    bookingWizard: {
      isOpen: boolean;
      currentStep: number;
      canGoNext: boolean;
      canGoPrevious: boolean;
    };
  };
  
  // Theme and preferences
  theme: 'light' | 'dark';
  language: 'th' | 'en';
  
  // Search and filters UI state
  searchUI: {
    isSearching: boolean;
    showSuggestions: boolean;
    recentSearches: string[];
  };
}

const initialState: UIState = {
  sidebarOpen: false,
  currentPage: '/',
  
  modal: {
    isOpen: false,
    type: null,
  },
  
  notifications: [],
  
  loadingStates: {},
  
  forms: {
    guestForm: {
      isDirty: false,
      hasErrors: false,
      currentStep: 0,
    },
    bookingWizard: {
      isOpen: false,
      currentStep: 0,
      canGoNext: false,
      canGoPrevious: false,
    },
  },
  
  theme: 'light',
  language: 'th',
  
  searchUI: {
    isSearching: false,
    showSuggestions: false,
    recentSearches: [],
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navigation and layout
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    
    // Modal management
    openModal: (state, action: PayloadAction<{ type: ModalState['type']; data?: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: undefined,
      };
    },
    
    // Notification management
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id' | 'timestamp'>>) => {
      const notification: NotificationState = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.isLoading;
    },
    
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },
    
    // Form states
    setGuestFormDirty: (state, action: PayloadAction<boolean>) => {
      state.forms.guestForm.isDirty = action.payload;
    },
    
    setGuestFormErrors: (state, action: PayloadAction<boolean>) => {
      state.forms.guestForm.hasErrors = action.payload;
    },
    
    setGuestFormStep: (state, action: PayloadAction<number>) => {
      state.forms.guestForm.currentStep = action.payload;
    },
    
    // Booking wizard states
    openBookingWizard: (state) => {
      state.forms.bookingWizard.isOpen = true;
      state.forms.bookingWizard.currentStep = 0;
    },
    
    closeBookingWizard: (state) => {
      state.forms.bookingWizard.isOpen = false;
      state.forms.bookingWizard.currentStep = 0;
      state.forms.bookingWizard.canGoNext = false;
      state.forms.bookingWizard.canGoPrevious = false;
    },
    
    setWizardStep: (state, action: PayloadAction<number>) => {
      state.forms.bookingWizard.currentStep = action.payload;
      state.forms.bookingWizard.canGoPrevious = action.payload > 0;
    },
    
    setWizardCanGoNext: (state, action: PayloadAction<boolean>) => {
      state.forms.bookingWizard.canGoNext = action.payload;
    },
    
    // Theme and preferences
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<'th' | 'en'>) => {
      state.language = action.payload;
    },
    
    // Search UI
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.searchUI.isSearching = action.payload;
    },
    
    setShowSuggestions: (state, action: PayloadAction<boolean>) => {
      state.searchUI.showSuggestions = action.payload;
    },
    
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const term = action.payload.trim();
      if (term && !state.searchUI.recentSearches.includes(term)) {
        state.searchUI.recentSearches.unshift(term);
        // Keep only last 10 searches
        if (state.searchUI.recentSearches.length > 10) {
          state.searchUI.recentSearches.pop();
        }
      }
    },
    
    clearRecentSearches: (state) => {
      state.searchUI.recentSearches = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setCurrentPage,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setLoading,
  clearLoading,
  setGuestFormDirty,
  setGuestFormErrors,
  setGuestFormStep,
  openBookingWizard,
  closeBookingWizard,
  setWizardStep,
  setWizardCanGoNext,
  setTheme,
  setLanguage,
  setSearching,
  setShowSuggestions,
  addRecentSearch,
  clearRecentSearches,
} = uiSlice.actions;