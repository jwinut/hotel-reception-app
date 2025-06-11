// Core hotel management types

export interface Guest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  idNumber: string;
  nationality: string;
  numGuests: number;
  specialRequests?: string;
}

export interface DateRange {
  checkInDate: string;
  checkOutDate: string;
  nights: number;
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  capacity: number;
  amenities: string[];
  basePrice: number;
  isAvailable: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
  description?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  phone: string;
  email?: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  totalPrice: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'confirmed'
  | 'arriving_today'
  | 'checked_in'
  | 'departing_today'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export interface BookingFilters {
  searchTerm: string;
  statusFilter: BookingStatus | 'all';
  dateFilter: string;
}

export interface BookingWizardData {
  guest: Guest;
  dates: DateRange;
  room: {
    selectedRoom: Room;
    roomType: RoomType;
  };
  pricing: {
    subtotal: number;
    tax: number;
    total: number;
    breakdown: PriceBreakdown[];
  };
}

export interface PriceBreakdown {
  description: string;
  amount: number;
  type: 'room' | 'tax' | 'service' | 'discount';
}

export interface CheckInData {
  bookingId: string;
  actualArrivalTime: string;
  keyCardsIssued: number;
  depositAmount?: number;
  notes?: string;
  signatureUrl?: string;
}

export interface HotelConfiguration {
  hotelName: string;
  rooms: Room[];
  roomTypes: RoomType[];
  pricing: PricingConfiguration;
  policies: HotelPolicies;
}

export interface PricingConfiguration {
  taxRate: number;
  serviceChargeRate: number;
  seasonalRates: SeasonalRate[];
  cancellationFees: CancellationFee[];
}

export interface SeasonalRate {
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
}

export interface CancellationFee {
  daysBeforeArrival: number;
  feePercentage: number;
}

export interface HotelPolicies {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  childPolicy: string;
  petPolicy: string;
  smokingPolicy: string;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  message: string;
  value?: any;
}

export interface FormErrors {
  [key: string]: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  adminOnly?: boolean;
  section: 'guest' | 'booking' | 'admin';
}

// Admin types
export interface AdminConfig {
  isAdminMode: boolean;
  adminCode: string;
}

// Search and filter types
export interface SearchSuggestion {
  id: string;
  type: 'booking' | 'guest' | 'room';
  title: string;
  subtitle: string;
  data: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Event types for components
export interface BookingEvent {
  type: 'create' | 'update' | 'cancel' | 'check_in' | 'check_out';
  bookingId: string;
  timestamp: string;
  data?: any;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export interface FormComponentProps extends BaseComponentProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Environment configuration types
export interface EnvironmentConfig {
  adminCode: string;
  apiUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  enableDebugging: boolean;
  hotelName: string;
  hotelVersion: string;
}