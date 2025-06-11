// Input validation and sanitization utilities
import type { Guest, FormErrors, ValidationResult } from '../types';

interface IdValidationResult {
  isValid: boolean;
  type: 'thai_id' | 'passport' | null;
  message: string;
}

interface GuestFormValidationResult {
  isValid: boolean;
  errors: FormErrors;
  sanitizedData: Guest;
}

/**
 * Sanitizes text input by removing potentially harmful characters
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates Thai phone number
 */
export const isValidThaiPhone = (phone: string): boolean => {
  // Allow Thai phone numbers: 08X-XXX-XXXX, 02-XXX-XXXX, etc.
  const phoneRegex = /^[0-9\-\s+()]{8,15}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validates Thai ID card number (13 digits)
 */
export const isValidThaiId = (idNumber: string): boolean => {
  // Remove all non-digit characters
  const digits = idNumber.replace(/\D/g, '');
  
  // Must be exactly 13 digits
  if (digits.length !== 13) return false;
  
  // Validate checksum using Thai ID algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = digits[i];
    if (digit === undefined) return false;
    sum += parseInt(digit, 10) * (13 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  const lastDigit = digits[12];
  if (lastDigit === undefined) return false;
  
  return checkDigit === parseInt(lastDigit, 10);
};

/**
 * Validates passport number (basic format check)
 */
export const isValidPassport = (passport: string): boolean => {
  // Basic passport validation: 6-12 alphanumeric characters
  const passportRegex = /^[A-Z0-9]{6,12}$/i;
  return passportRegex.test(passport.trim());
};

/**
 * Validates ID number (Thai ID or Passport)
 */
export const validateIdNumber = (idNumber: string): IdValidationResult => {
  const cleanId = idNumber.trim();
  
  if (cleanId.length === 0) {
    return { 
      isValid: false, 
      type: null, 
      message: 'กรุณากรอกเลขบัตรประชาชน/หนังสือเดินทาง' 
    };
  }
  
  // Check if it's a Thai ID
  if (/^\d/.test(cleanId)) {
    const isValidThai = isValidThaiId(cleanId);
    return {
      isValid: isValidThai,
      type: 'thai_id',
      message: isValidThai ? '' : 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง'
    };
  }
  
  // Check if it's a passport
  const isValidPass = isValidPassport(cleanId);
  return {
    isValid: isValidPass,
    type: 'passport',
    message: isValidPass ? '' : 'รูปแบบหนังสือเดินทางไม่ถูกต้อง (6-12 ตัวอักษร/ตัวเลข)'
  };
};

/**
 * Validates required text field
 */
export const validateRequired = (
  value: string, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength: number = 255
): ValidationResult => {
  const cleanValue = sanitizeInput(value);
  
  if (cleanValue.length === 0) {
    return { isValid: false, message: `กรุณากรอก${fieldName}` };
  }
  
  if (cleanValue.length < minLength) {
    return { 
      isValid: false, 
      message: `${fieldName}ต้องมีอย่างน้อย ${minLength} ตัวอักษร` 
    };
  }
  
  if (cleanValue.length > maxLength) {
    return { 
      isValid: false, 
      message: `${fieldName}ต้องไม่เกิน ${maxLength} ตัวอักษร` 
    };
  }
  
  return { isValid: true, message: '', value: cleanValue };
};

/**
 * Validates number input
 */
export const validateNumber = (
  value: any, 
  fieldName: string, 
  min: number, 
  max: number
): ValidationResult => {
  const numValue = parseInt(value, 10);
  
  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName}ต้องเป็นตัวเลข` };
  }
  
  if (numValue < min || numValue > max) {
    return { 
      isValid: false, 
      message: `${fieldName}ต้องอยู่ระหว่าง ${min}-${max}` 
    };
  }
  
  return { isValid: true, message: '', value: numValue };
};

/**
 * Validates date input
 */
export const validateDate = (
  dateString: string, 
  fieldName: string, 
  allowPast: boolean = false
): ValidationResult => {
  if (!dateString) {
    return { isValid: false, message: `กรุณาเลือก${fieldName}` };
  }
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: `รูปแบบ${fieldName}ไม่ถูกต้อง` };
  }
  
  if (!allowPast && date < today) {
    return { 
      isValid: false, 
      message: `${fieldName}ต้องไม่เป็นวันที่ผ่านมาแล้ว` 
    };
  }
  
  return { isValid: true, message: '', value: date };
};

/**
 * Validates guest form data
 */
export const validateGuestForm = (formData: any): GuestFormValidationResult => {
  const errors: FormErrors = {};
  
  // First name validation
  const firstNameResult = validateRequired(formData.firstName, 'ชื่อ', 1, 50);
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.message;
  }
  
  // Last name validation
  const lastNameResult = validateRequired(formData.lastName, 'นามสกุล', 1, 50);
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.message;
  }
  
  // Phone validation
  const phoneResult = validateRequired(formData.phone, 'เบอร์โทรศัพท์', 8, 15);
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.message;
  } else if (!isValidThaiPhone(formData.phone)) {
    errors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
  }
  
  // Email validation (optional)
  if (formData.email && formData.email.trim()) {
    if (!isValidEmail(formData.email.trim())) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
  }
  
  // ID number validation
  const idResult = validateIdNumber(formData.idNumber);
  if (!idResult.isValid) {
    errors.idNumber = idResult.message;
  }
  
  // Number of guests validation
  const guestsResult = validateNumber(formData.numGuests, 'จำนวนผู้เข้าพัก', 1, 10);
  if (!guestsResult.isValid) {
    errors.numGuests = guestsResult.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      phone: sanitizeInput(formData.phone),
      email: sanitizeInput(formData.email || ''),
      idNumber: sanitizeInput(formData.idNumber),
      nationality: sanitizeInput(formData.nationality),
      numGuests: parseInt(formData.numGuests, 10),
      specialRequests: sanitizeInput(formData.specialRequests || '')
    }
  };
};

/**
 * Rate limiting utility for preventing spam
 */
export class RateLimit {
  private attempts: Map<string, number[]>;
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }
  
  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingMs = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, Math.ceil(remainingMs / 1000)); // Return seconds
  }
}

// Global rate limiter for admin authentication
export const adminAuthRateLimit = new RateLimit(3, 300000); // 3 attempts per 5 minutes