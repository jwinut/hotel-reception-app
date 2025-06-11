// src/services/index.ts
export { apiClient } from './apiClient';
export type { ApiResponse, ApiErrorResponse } from './apiClient';

export { bookingService } from './BookingService';
export type {
  BookingCreateRequest,
  BookingUpdateRequest,
  BookingSearchParams,
  BookingStats,
} from './BookingService';

export { configurationService } from './ConfigurationService';
export type {
  HotelConfiguration,
  RoomConfiguration,
  PricingConfiguration,
  BookingConfiguration,
  AppConfiguration,
} from './ConfigurationService';

export { authenticationService } from './AuthenticationService';
export type {
  User,
  Permission,
  AuthenticationResult,
  LoginCredentials,
  SessionInfo,
  SecurityLog,
} from './AuthenticationService';

// Re-export default classes for advanced usage
export { default as BookingService } from './BookingService';
export { default as ConfigurationService } from './ConfigurationService';
export { default as AuthenticationService } from './AuthenticationService';