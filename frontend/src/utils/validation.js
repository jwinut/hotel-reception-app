// Input validation and sanitization utilities

/**
 * Sanitizes text input by removing potentially harmful characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates Thai phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidThaiPhone = (phone) => {
  // Allow Thai phone numbers: 08X-XXX-XXXX, 02-XXX-XXXX, etc.
  const phoneRegex = /^[0-9\-\s\+\(\)]{8,15}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validates Thai ID card number (13 digits)
 * @param {string} idNumber - ID number to validate
 * @returns {boolean} - True if valid Thai ID format
 */
export const isValidThaiId = (idNumber) => {
  // Remove all non-digit characters
  const digits = idNumber.replace(/\D/g, '');
  
  // Must be exactly 13 digits
  if (digits.length !== 13) return false;
  
  // Validate checksum using Thai ID algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (13 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === parseInt(digits[12]);
};

/**
 * Validates passport number (basic format check)
 * @param {string} passport - Passport number to validate
 * @returns {boolean} - True if valid passport format
 */
export const isValidPassport = (passport) => {
  // Basic passport validation: 6-12 alphanumeric characters
  const passportRegex = /^[A-Z0-9]{6,12}$/i;
  return passportRegex.test(passport.trim());
};

/**
 * Validates ID number (Thai ID or Passport)
 * @param {string} idNumber - ID number to validate
 * @returns {object} - Validation result with isValid and type
 */
export const validateIdNumber = (idNumber) => {
  const cleanId = idNumber.trim();
  
  if (cleanId.length === 0) {
    return { isValid: false, type: null, message: 'กรุณากรอกเลขบัตรประชาชน/หนังสือเดินทาง' };
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
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {object} - Validation result
 */
export const validateRequired = (value, fieldName, minLength = 1, maxLength = 255) => {
  const cleanValue = sanitizeInput(value);
  
  if (cleanValue.length === 0) {
    return { isValid: false, message: `กรุณากรอก${fieldName}` };
  }
  
  if (cleanValue.length < minLength) {
    return { isValid: false, message: `${fieldName}ต้องมีอย่างน้อย ${minLength} ตัวอักษร` };
  }
  
  if (cleanValue.length > maxLength) {
    return { isValid: false, message: `${fieldName}ต้องไม่เกิน ${maxLength} ตัวอักษร` };
  }
  
  return { isValid: true, message: '', value: cleanValue };
};

/**
 * Validates number input
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} - Validation result
 */
export const validateNumber = (value, fieldName, min, max) => {
  const numValue = parseInt(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName}ต้องเป็นตัวเลข` };
  }
  
  if (numValue < min || numValue > max) {
    return { isValid: false, message: `${fieldName}ต้องอยู่ระหว่าง ${min}-${max}` };
  }
  
  return { isValid: true, message: '', value: numValue };
};

/**
 * Validates date input
 * @param {string} dateString - Date string to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {boolean} allowPast - Whether to allow past dates (default: false)
 * @returns {object} - Validation result
 */
export const validateDate = (dateString, fieldName, allowPast = false) => {
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
    return { isValid: false, message: `${fieldName}ต้องไม่เป็นวันที่ผ่านมาแล้ว` };
  }
  
  return { isValid: true, message: '', value: date };
};

/**
 * Validates guest form data
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with errors object
 */
export const validateGuestForm = (formData) => {
  const errors = {};
  
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
      email: sanitizeInput(formData.email),
      idNumber: sanitizeInput(formData.idNumber),
      nationality: sanitizeInput(formData.nationality),
      numGuests: parseInt(formData.numGuests),
      specialRequests: sanitizeInput(formData.specialRequests)
    }
  };
};

/**
 * Rate limiting utility for preventing spam
 */
export class RateLimit {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  isAllowed(key) {
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
  
  getRemainingTime(key) {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingMs = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, Math.ceil(remainingMs / 1000)); // Return seconds
  }
}

// Global rate limiter for admin authentication
export const adminAuthRateLimit = new RateLimit(3, 300000); // 3 attempts per 5 minutes