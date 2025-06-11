// src/components/index.ts
// Design System Components Export

// Core Components
export { default as Button, ButtonGroup } from './Button';
export type { ButtonProps, ButtonGroupProps } from './Button';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card';

export { default as Badge, NotificationBadge } from './Badge';
export type { BadgeProps, NotificationBadgeProps } from './Badge';

// Accessibility Components
export { default as AccessibleButton } from './AccessibleButton';
export type { AccessibleButtonProps } from './AccessibleButton';

export {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormErrorSummary,
} from './AccessibleForm';

// Utility Components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as LanguageSwitcher } from './LanguageSwitcher';

// Legacy Components (to be migrated)
export { default as BookingCard } from './BookingCard';
export { default as BookingConfirmation } from './BookingConfirmation';
export { default as BookingDetails } from './BookingDetails';
export { default as BookingSearch } from './BookingSearch';
export { default as BookingWizard } from './BookingWizard';
export { default as CheckInProcess } from './CheckInProcess';
export { default as DateSelection } from './DateSelection';
export { default as GuestForm } from './GuestForm';
export { default as GuestLookup } from './GuestLookup';
export { default as RoomSelection } from './RoomSelection';