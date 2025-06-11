// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { bookingSlice } from './slices/bookingSlice';
import { uiSlice } from './slices/uiSlice';
import { authSlice } from './slices/authSlice';
import { configSlice } from './slices/configSlice';

export const store = configureStore({
  reducer: {
    booking: bookingSlice.reducer,
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
    config: configSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export actions for easy access
export const { actions: bookingActions } = bookingSlice;
export const { actions: uiActions } = uiSlice;
export const { actions: authActions } = authSlice;
export const { actions: configActions } = configSlice;