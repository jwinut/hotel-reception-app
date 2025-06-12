// src/store/slices/uiSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { uiSlice } from './uiSlice';

// Define local interfaces for testing since not all types may be exported
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
  sidebarOpen: boolean;
  currentPage: string;
  modal: ModalState;
  notifications: NotificationState[];
  loadingStates: { [key: string]: boolean };
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
  theme: 'light' | 'dark';
  language: 'th' | 'en';
  searchUI: {
    isSearching: boolean;
    showSuggestions: boolean;
    recentSearches: string[];
  };
}

// Helper function to create a test store
const createTestStore = (initialState?: Partial<UIState>) => {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
    },
    preloadedState: initialState ? { ui: { ...uiSlice.getInitialState(), ...initialState } } : undefined,
  });
  return store;
};

describe('uiSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = createTestStore();
      const state = store.getState().ui;

      expect(state.sidebarOpen).toBe(false);
      expect(state.currentPage).toBe('/');
      expect(state.modal).toEqual({
        isOpen: false,
        type: null,
      });
      expect(state.notifications).toEqual([]);
      expect(state.loadingStates).toEqual({});
      expect(state.forms).toEqual({
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
      });
      expect(state.theme).toBe('light');
      expect(state.language).toBe('th');
      expect(state.searchUI).toEqual({
        isSearching: false,
        showSuggestions: false,
        recentSearches: [],
      });
    });
  });

  describe('Navigation and Layout Actions', () => {
    describe('toggleSidebar', () => {
      it('should toggle sidebar state from false to true', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.toggleSidebar());
        
        expect(store.getState().ui.sidebarOpen).toBe(true);
      });

      it('should toggle sidebar state from true to false', () => {
        const initialState: Partial<UIState> = {
          sidebarOpen: true,
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.toggleSidebar());
        
        expect(store.getState().ui.sidebarOpen).toBe(false);
      });
    });

    describe('setSidebarOpen', () => {
      it('should set sidebar open to true', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setSidebarOpen(true));
        
        expect(store.getState().ui.sidebarOpen).toBe(true);
      });

      it('should set sidebar open to false', () => {
        const initialState: Partial<UIState> = {
          sidebarOpen: true,
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.setSidebarOpen(false));
        
        expect(store.getState().ui.sidebarOpen).toBe(false);
      });
    });

    describe('setCurrentPage', () => {
      it('should update current page', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setCurrentPage('/bookings'));
        
        expect(store.getState().ui.currentPage).toBe('/bookings');
      });
    });
  });

  describe('Modal Management', () => {
    describe('openModal', () => {
      it('should open modal with type and data', () => {
        const store = createTestStore();
        const modalData = { bookingId: 'BK001' };
        
        store.dispatch(uiSlice.actions.openModal({
          type: 'booking-details',
          data: modalData,
        }));
        
        const state = store.getState().ui;
        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.type).toBe('booking-details');
        expect(state.modal.data).toEqual(modalData);
      });

      it('should open modal without data', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.openModal({
          type: 'check-in',
        }));
        
        const state = store.getState().ui;
        expect(state.modal.isOpen).toBe(true);
        expect(state.modal.type).toBe('check-in');
        expect(state.modal.data).toBeUndefined();
      });

      it('should handle all modal types', () => {
        const store = createTestStore();
        const modalTypes: Array<ModalState['type']> = [
          'booking-details',
          'check-in', 
          'check-out',
          'cancel',
          'edit',
        ];

        modalTypes.forEach(type => {
          store.dispatch(uiSlice.actions.openModal({ type }));
          expect(store.getState().ui.modal.type).toBe(type);
        });
      });
    });

    describe('closeModal', () => {
      it('should close modal and reset state', () => {
        const initialState: Partial<UIState> = {
          modal: {
            isOpen: true,
            type: 'booking-details',
            data: { bookingId: 'BK001' },
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.closeModal());
        
        const state = store.getState().ui;
        expect(state.modal.isOpen).toBe(false);
        expect(state.modal.type).toBeNull();
        expect(state.modal.data).toBeUndefined();
      });
    });
  });

  describe('Notification Management', () => {
    describe('addNotification', () => {
      it('should add notification with generated id and timestamp', () => {
        const store = createTestStore();
        const notificationData = {
          type: 'success' as const,
          title: 'สำเร็จ',
          message: 'การจองเสร็จสิ้น',
          duration: 5000,
        };
        
        store.dispatch(uiSlice.actions.addNotification(notificationData));
        
        const state = store.getState().ui;
        expect(state.notifications).toHaveLength(1);
        
        const notification = state.notifications[0];
        expect(notification?.type).toBe('success');
        expect(notification?.title).toBe('สำเร็จ');
        expect(notification?.message).toBe('การจองเสร็จสิ้น');
        expect(notification?.duration).toBe(5000);
        expect(notification?.id).toMatch(/^notification-\d+-\d+\.?\d*$/);
        expect(notification?.timestamp).toBeCloseTo(Date.now(), -2);
      });

      it('should add notification without duration', () => {
        const store = createTestStore();
        const notificationData = {
          type: 'error' as const,
          title: 'ข้อผิดพลาด',
          message: 'เกิดข้อผิดพลาดในการจอง',
        };
        
        store.dispatch(uiSlice.actions.addNotification(notificationData));
        
        const notification = store.getState().ui.notifications[0];
        expect(notification?.type).toBe('error');
        expect(notification?.duration).toBeUndefined();
      });

      it('should handle all notification types', () => {
        const store = createTestStore();
        const notificationTypes: Array<NotificationState['type']> = [
          'success',
          'error',
          'warning',
          'info',
        ];

        notificationTypes.forEach((type, index) => {
          store.dispatch(uiSlice.actions.addNotification({
            type,
            title: `Title ${index}`,
            message: `Message ${index}`,
          }));
        });

        const state = store.getState().ui;
        expect(state.notifications).toHaveLength(4);
        notificationTypes.forEach((type, index) => {
          expect(state.notifications[index]?.type).toBe(type);
        });
      });

      it('should generate unique IDs for multiple notifications', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        }));

        jest.advanceTimersByTime(1);

        store.dispatch(uiSlice.actions.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        }));

        const state = store.getState().ui;
        expect(state.notifications).toHaveLength(2);
        expect(state.notifications[0]?.id).not.toBe(state.notifications[1]?.id);
      });
    });

    describe('removeNotification', () => {
      it('should remove specific notification by id', () => {
        const notifications: NotificationState[] = [
          {
            id: 'notification-1',
            type: 'success',
            title: 'First',
            message: 'Message 1',
            timestamp: Date.now(),
          },
          {
            id: 'notification-2',
            type: 'error',
            title: 'Second',
            message: 'Message 2',
            timestamp: Date.now(),
          },
        ];

        const initialState: Partial<UIState> = {
          notifications,
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.removeNotification('notification-1'));
        
        const state = store.getState().ui;
        expect(state.notifications).toHaveLength(1);
        expect(state.notifications[0]?.id).toBe('notification-2');
      });

      it('should not fail when removing non-existent notification', () => {
        const notifications: NotificationState[] = [
          {
            id: 'notification-1',
            type: 'success',
            title: 'First',
            message: 'Message 1',
            timestamp: Date.now(),
          },
        ];

        const initialState: Partial<UIState> = {
          notifications,
        };

        const store = createTestStore(initialState);
        
        expect(() => {
          store.dispatch(uiSlice.actions.removeNotification('nonexistent-id'));
        }).not.toThrow();
        
        expect(store.getState().ui.notifications).toHaveLength(1);
      });
    });

    describe('clearAllNotifications', () => {
      it('should clear all notifications', () => {
        const notifications: NotificationState[] = [
          {
            id: 'notification-1',
            type: 'success',
            title: 'First',
            message: 'Message 1',
            timestamp: Date.now(),
          },
          {
            id: 'notification-2',
            type: 'error',
            title: 'Second',
            message: 'Message 2',
            timestamp: Date.now(),
          },
        ];

        const initialState: Partial<UIState> = {
          notifications,
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.clearAllNotifications());
        
        expect(store.getState().ui.notifications).toEqual([]);
      });
    });
  });

  describe('Loading States', () => {
    describe('setLoading', () => {
      it('should set loading state for specific key', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setLoading({
          key: 'bookings',
          isLoading: true,
        }));
        
        expect(store.getState().ui.loadingStates.bookings).toBe(true);
      });

      it('should handle multiple loading states', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setLoading({
          key: 'bookings',
          isLoading: true,
        }));
        
        store.dispatch(uiSlice.actions.setLoading({
          key: 'guests',
          isLoading: false,
        }));
        
        const state = store.getState().ui;
        expect(state.loadingStates.bookings).toBe(true);
        expect(state.loadingStates.guests).toBe(false);
      });

      it('should update existing loading state', () => {
        const initialState: Partial<UIState> = {
          loadingStates: {
            bookings: true,
          },
        };

        const store = createTestStore(initialState);
        
        store.dispatch(uiSlice.actions.setLoading({
          key: 'bookings',
          isLoading: false,
        }));
        
        expect(store.getState().ui.loadingStates.bookings).toBe(false);
      });
    });

    describe('clearLoading', () => {
      it('should remove loading state for specific key', () => {
        const initialState: Partial<UIState> = {
          loadingStates: {
            bookings: true,
            guests: false,
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.clearLoading('bookings'));
        
        const state = store.getState().ui;
        expect(state.loadingStates.bookings).toBeUndefined();
        expect(state.loadingStates.guests).toBe(false);
      });

      it('should not fail when clearing non-existent loading state', () => {
        const store = createTestStore();
        
        expect(() => {
          store.dispatch(uiSlice.actions.clearLoading('nonexistent'));
        }).not.toThrow();
      });
    });
  });

  describe('Form States', () => {
    describe('Guest Form', () => {
      describe('setGuestFormDirty', () => {
        it('should set guest form dirty state', () => {
          const store = createTestStore();
          
          store.dispatch(uiSlice.actions.setGuestFormDirty(true));
          
          expect(store.getState().ui.forms.guestForm.isDirty).toBe(true);
        });
      });

      describe('setGuestFormErrors', () => {
        it('should set guest form error state', () => {
          const store = createTestStore();
          
          store.dispatch(uiSlice.actions.setGuestFormErrors(true));
          
          expect(store.getState().ui.forms.guestForm.hasErrors).toBe(true);
        });
      });

      describe('setGuestFormStep', () => {
        it('should set guest form current step', () => {
          const store = createTestStore();
          
          store.dispatch(uiSlice.actions.setGuestFormStep(2));
          
          expect(store.getState().ui.forms.guestForm.currentStep).toBe(2);
        });
      });
    });

    describe('Booking Wizard', () => {
      describe('openBookingWizard', () => {
        it('should open booking wizard and reset to step 0', () => {
          const store = createTestStore();
          
          store.dispatch(uiSlice.actions.openBookingWizard());
          
          const wizardState = store.getState().ui.forms.bookingWizard;
          expect(wizardState.isOpen).toBe(true);
          expect(wizardState.currentStep).toBe(0);
        });
      });

      describe('closeBookingWizard', () => {
        it('should close booking wizard and reset all states', () => {
          const initialState: Partial<UIState> = {
            forms: {
              guestForm: {
                isDirty: false,
                hasErrors: false,
                currentStep: 0,
              },
              bookingWizard: {
                isOpen: true,
                currentStep: 3,
                canGoNext: true,
                canGoPrevious: true,
              },
            },
          };

          const store = createTestStore(initialState);
          store.dispatch(uiSlice.actions.closeBookingWizard());
          
          const wizardState = store.getState().ui.forms.bookingWizard;
          expect(wizardState.isOpen).toBe(false);
          expect(wizardState.currentStep).toBe(0);
          expect(wizardState.canGoNext).toBe(false);
          expect(wizardState.canGoPrevious).toBe(false);
        });
      });

      describe('setWizardStep', () => {
        it('should set wizard step and update canGoPrevious', () => {
          const store = createTestStore();
          
          store.dispatch(uiSlice.actions.setWizardStep(2));
          
          const wizardState = store.getState().ui.forms.bookingWizard;
          expect(wizardState.currentStep).toBe(2);
          expect(wizardState.canGoPrevious).toBe(true);
        });

        it('should set canGoPrevious to false for step 0', () => {
          const initialState: Partial<UIState> = {
            forms: {
              guestForm: {
                isDirty: false,
                hasErrors: false,
                currentStep: 0,
              },
              bookingWizard: {
                isOpen: true,
                currentStep: 2,
                canGoNext: false,
                canGoPrevious: true,
              },
            },
          };

          const store = createTestStore(initialState);
          store.dispatch(uiSlice.actions.setWizardStep(0));
          
          const wizardState = store.getState().ui.forms.bookingWizard;
          expect(wizardState.currentStep).toBe(0);
          expect(wizardState.canGoPrevious).toBe(false);
        });
      });

      describe('setWizardCanGoNext', () => {
        it('should set wizard canGoNext state', () => {
          const store = createTestStore();
          
          store.dispatch(uiSlice.actions.setWizardCanGoNext(true));
          
          expect(store.getState().ui.forms.bookingWizard.canGoNext).toBe(true);
        });
      });
    });
  });

  describe('Theme and Preferences', () => {
    describe('setTheme', () => {
      it('should set theme to dark', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setTheme('dark'));
        
        expect(store.getState().ui.theme).toBe('dark');
      });

      it('should set theme to light', () => {
        const initialState: Partial<UIState> = {
          theme: 'dark',
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.setTheme('light'));
        
        expect(store.getState().ui.theme).toBe('light');
      });
    });

    describe('setLanguage', () => {
      it('should set language to English', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setLanguage('en'));
        
        expect(store.getState().ui.language).toBe('en');
      });

      it('should set language to Thai', () => {
        const initialState: Partial<UIState> = {
          language: 'en',
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.setLanguage('th'));
        
        expect(store.getState().ui.language).toBe('th');
      });
    });
  });

  describe('Search UI', () => {
    describe('setSearching', () => {
      it('should set searching state', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setSearching(true));
        
        expect(store.getState().ui.searchUI.isSearching).toBe(true);
      });
    });

    describe('setShowSuggestions', () => {
      it('should set show suggestions state', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.setShowSuggestions(true));
        
        expect(store.getState().ui.searchUI.showSuggestions).toBe(true);
      });
    });

    describe('addRecentSearch', () => {
      it('should add new search term to beginning of list', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.addRecentSearch('สมชาย'));
        
        const searchUI = store.getState().ui.searchUI;
        expect(searchUI.recentSearches).toEqual(['สมชาย']);
      });

      it('should not add duplicate search terms', () => {
        const initialState: Partial<UIState> = {
          searchUI: {
            isSearching: false,
            showSuggestions: false,
            recentSearches: ['สมชาย', 'วิชัย'],
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.addRecentSearch('สมชาย'));
        
        const searchUI = store.getState().ui.searchUI;
        expect(searchUI.recentSearches).toEqual(['สมชาย', 'วิชัย']);
      });

      it('should add new term to beginning and maintain order', () => {
        const initialState: Partial<UIState> = {
          searchUI: {
            isSearching: false,
            showSuggestions: false,
            recentSearches: ['สมชาย', 'วิชัย'],
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.addRecentSearch('นิรันดร์'));
        
        const searchUI = store.getState().ui.searchUI;
        expect(searchUI.recentSearches).toEqual(['นิรันดร์', 'สมชาย', 'วิชัย']);
      });

      it('should trim whitespace from search terms', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.addRecentSearch('  สมชาย  '));
        
        const searchUI = store.getState().ui.searchUI;
        expect(searchUI.recentSearches).toEqual(['สมชาย']);
      });

      it('should not add empty or whitespace-only terms', () => {
        const store = createTestStore();
        
        store.dispatch(uiSlice.actions.addRecentSearch(''));
        store.dispatch(uiSlice.actions.addRecentSearch('   '));
        
        const searchUI = store.getState().ui.searchUI;
        expect(searchUI.recentSearches).toEqual([]);
      });

      it('should maintain maximum of 10 recent searches', () => {
        const initialState: Partial<UIState> = {
          searchUI: {
            isSearching: false,
            showSuggestions: false,
            recentSearches: [
              'search1', 'search2', 'search3', 'search4', 'search5',
              'search6', 'search7', 'search8', 'search9', 'search10'
            ],
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.addRecentSearch('new-search'));
        
        const searchUI = store.getState().ui.searchUI;
        expect(searchUI.recentSearches).toHaveLength(10);
        expect(searchUI.recentSearches[0]).toBe('new-search');
        expect(searchUI.recentSearches).not.toContain('search10');
      });
    });

    describe('clearRecentSearches', () => {
      it('should clear all recent searches', () => {
        const initialState: Partial<UIState> = {
          searchUI: {
            isSearching: false,
            showSuggestions: false,
            recentSearches: ['สมชาย', 'วิชัย', 'นิรันดร์'],
          },
        };

        const store = createTestStore(initialState);
        store.dispatch(uiSlice.actions.clearRecentSearches());
        
        expect(store.getState().ui.searchUI.recentSearches).toEqual([]);
      });
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle complete modal workflow', () => {
      const store = createTestStore();
      
      // Open modal
      store.dispatch(uiSlice.actions.openModal({
        type: 'booking-details',
        data: { bookingId: 'BK001' },
      }));
      
      let state = store.getState().ui;
      expect(state.modal.isOpen).toBe(true);
      expect(state.modal.type).toBe('booking-details');
      
      // Close modal
      store.dispatch(uiSlice.actions.closeModal());
      
      state = store.getState().ui;
      expect(state.modal.isOpen).toBe(false);
      expect(state.modal.type).toBeNull();
    });

    it('should handle booking wizard workflow', () => {
      const store = createTestStore();
      
      // Open wizard
      store.dispatch(uiSlice.actions.openBookingWizard());
      
      // Progress through steps
      store.dispatch(uiSlice.actions.setWizardStep(1));
      store.dispatch(uiSlice.actions.setWizardCanGoNext(true));
      
      store.dispatch(uiSlice.actions.setWizardStep(2));
      store.dispatch(uiSlice.actions.setWizardCanGoNext(false));
      
      let wizardState = store.getState().ui.forms.bookingWizard;
      expect(wizardState.isOpen).toBe(true);
      expect(wizardState.currentStep).toBe(2);
      expect(wizardState.canGoNext).toBe(false);
      expect(wizardState.canGoPrevious).toBe(true);
      
      // Close wizard
      store.dispatch(uiSlice.actions.closeBookingWizard());
      
      wizardState = store.getState().ui.forms.bookingWizard;
      expect(wizardState.isOpen).toBe(false);
      expect(wizardState.currentStep).toBe(0);
      expect(wizardState.canGoNext).toBe(false);
      expect(wizardState.canGoPrevious).toBe(false);
    });

    it('should handle multiple notifications lifecycle', () => {
      const store = createTestStore();
      
      // Add multiple notifications
      store.dispatch(uiSlice.actions.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Operation successful',
      }));
      
      store.dispatch(uiSlice.actions.addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please check this',
      }));
      
      jest.advanceTimersByTime(1);
      
      store.dispatch(uiSlice.actions.addNotification({
        type: 'error',
        title: 'Error',
        message: 'Something went wrong',
      }));
      
      let state = store.getState().ui;
      expect(state.notifications).toHaveLength(3);
      
      // Remove middle notification
      const warningId = state.notifications[1]?.id;
      if (warningId) {
        store.dispatch(uiSlice.actions.removeNotification(warningId));
      }
      
      state = store.getState().ui;
      expect(state.notifications).toHaveLength(2);
      expect(state.notifications[0]?.type).toBe('success');
      expect(state.notifications[1]?.type).toBe('error');
      
      // Clear all
      store.dispatch(uiSlice.actions.clearAllNotifications());
      
      expect(store.getState().ui.notifications).toEqual([]);
    });

    it('should handle concurrent UI state changes', () => {
      const store = createTestStore();
      
      // Perform multiple UI operations
      store.dispatch(uiSlice.actions.setSidebarOpen(true));
      store.dispatch(uiSlice.actions.setCurrentPage('/bookings'));
      store.dispatch(uiSlice.actions.setTheme('dark'));
      store.dispatch(uiSlice.actions.setLanguage('en'));
      store.dispatch(uiSlice.actions.setSearching(true));
      store.dispatch(uiSlice.actions.addRecentSearch('test search'));
      store.dispatch(uiSlice.actions.setLoading({ key: 'bookings', isLoading: true }));
      
      const state = store.getState().ui;
      expect(state.sidebarOpen).toBe(true);
      expect(state.currentPage).toBe('/bookings');
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('en');
      expect(state.searchUI.isSearching).toBe(true);
      expect(state.searchUI.recentSearches).toEqual(['test search']);
      expect(state.loadingStates.bookings).toBe(true);
    });
  });
});