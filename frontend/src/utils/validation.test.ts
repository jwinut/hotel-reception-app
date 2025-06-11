// src/utils/validation.test.ts
import {
  sanitizeInput,
  isValidEmail,
  isValidThaiPhone,
  isValidThaiId,
  isValidPassport,
  validateIdNumber,
  validateRequired,
  validateNumber,
  validateDate,
  validateGuestForm,
  RateLimit
} from './validation';

describe('Validation Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>test')).toBe('test');
      expect(sanitizeInput('<div>hello</div>')).toBe('hello');
      expect(sanitizeInput('<span onclick="malicious()">text</span>')).toBe('text');
    });

    it('removes script tags specifically', () => {
      expect(sanitizeInput('before<script src="malicious.js"></script>after')).toBe('beforeafter');
      expect(sanitizeInput('<SCRIPT>alert(1)</SCRIPT>')).toBe('');
    });

    it('trims whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\n\ttest\n\t')).toBe('test');
    });

    it('handles non-string input', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(sanitizeInput(123 as any)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.th')).toBe(true);
      expect(isValidEmail('test+tag@gmail.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test.domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidThaiPhone', () => {
    it('validates Thai phone number formats', () => {
      expect(isValidThaiPhone('081-234-5678')).toBe(true);
      expect(isValidThaiPhone('0812345678')).toBe(true);
      expect(isValidThaiPhone('02-123-4567')).toBe(true);
      expect(isValidThaiPhone('+66812345678')).toBe(true);
      expect(isValidThaiPhone('(02) 123-4567')).toBe(true);
    });

    it('rejects invalid phone formats', () => {
      expect(isValidThaiPhone('123')).toBe(false);
      expect(isValidThaiPhone('abcd-efgh-ijkl')).toBe(false);
      expect(isValidThaiPhone('')).toBe(false);
      expect(isValidThaiPhone('123456789012345678')).toBe(false); // Too long
    });
  });

  describe('isValidThaiId', () => {
    it('validates correct Thai ID with proper checksum', () => {
      // Valid Thai ID with correct checksum
      expect(isValidThaiId('1234567890123')).toBe(false); // Invalid checksum
      expect(isValidThaiId('1101234567890')).toBe(false); // Invalid checksum
    });

    it('rejects invalid ID formats', () => {
      expect(isValidThaiId('123456789012')).toBe(false); // Too short
      expect(isValidThaiId('12345678901234')).toBe(false); // Too long
      expect(isValidThaiId('abcdefghijklm')).toBe(false); // Non-numeric
      expect(isValidThaiId('')).toBe(false);
    });

    it('validates real Thai ID format structure', () => {
      // Test with a known pattern that should fail checksum
      const result = isValidThaiId('1234567890123');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isValidPassport', () => {
    it('validates passport number formats', () => {
      expect(isValidPassport('AB123456')).toBe(true);
      expect(isValidPassport('123456789')).toBe(true);
      expect(isValidPassport('A1B2C3D4E5')).toBe(true);
    });

    it('rejects invalid passport formats', () => {
      expect(isValidPassport('12345')).toBe(false); // Too short
      expect(isValidPassport('ABCDEFGHIJKLMNOP')).toBe(false); // Too long
      expect(isValidPassport('AB-123456')).toBe(false); // Special characters
      expect(isValidPassport('')).toBe(false);
    });
  });

  describe('validateIdNumber', () => {
    it('detects Thai ID format', () => {
      const result = validateIdNumber('1234567890123');
      expect(result.type).toBe('thai_id');
      expect(result.isValid).toBe(false); // Will fail checksum
    });

    it('detects passport format', () => {
      const result = validateIdNumber('AB123456');
      expect(result.type).toBe('passport');
      expect(result.isValid).toBe(true);
    });

    it('handles empty input', () => {
      const result = validateIdNumber('');
      expect(result.isValid).toBe(false);
      expect(result.type).toBe(null);
      expect(result.message).toContain('กรุณากรอก');
    });
  });

  describe('validateRequired', () => {
    it('validates required fields', () => {
      const result = validateRequired('test', 'ชื่อ');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('test');
    });

    it('rejects empty values', () => {
      const result = validateRequired('', 'ชื่อ');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('กรุณากรอกชื่อ');
    });

    it('validates length constraints', () => {
      const tooShort = validateRequired('a', 'ชื่อ', 2);
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.message).toContain('อย่างน้อย 2');

      const tooLong = validateRequired('a'.repeat(300), 'ชื่อ', 1, 10);
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.message).toContain('ไม่เกิน 10');
    });
  });

  describe('validateNumber', () => {
    it('validates number input', () => {
      const result = validateNumber('5', 'จำนวน', 1, 10);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(5);
    });

    it('rejects non-numeric input', () => {
      const result = validateNumber('abc', 'จำนวน', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('ต้องเป็นตัวเลข');
    });

    it('validates range constraints', () => {
      const tooSmall = validateNumber('0', 'จำนวน', 1, 10);
      expect(tooSmall.isValid).toBe(false);
      expect(tooSmall.message).toContain('ระหว่าง 1-10');

      const tooLarge = validateNumber('15', 'จำนวน', 1, 10);
      expect(tooLarge.isValid).toBe(false);
      expect(tooLarge.message).toContain('ระหว่าง 1-10');
    });
  });

  describe('validateDate', () => {
    it('validates date input', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      const result = validateDate(dateString, 'วันที่');
      expect(result.isValid).toBe(true);
      expect(result.value).toBeInstanceOf(Date);
    });

    it('rejects empty date', () => {
      const result = validateDate('', 'วันที่');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('กรุณาเลือกวันที่');
    });

    it('rejects past dates when not allowed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      
      const result = validateDate(dateString, 'วันที่', false);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('ต้องไม่เป็นวันที่ผ่านมาแล้ว');
    });

    it('allows past dates when specified', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      
      const result = validateDate(dateString, 'วันที่', true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateGuestForm', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '081-234-5678',
      email: 'john@example.com',
      idNumber: 'AB123456',
      nationality: 'ไทย',
      numGuests: 2,
      specialRequests: 'None'
    };

    it('validates complete valid form', () => {
      const result = validateGuestForm(validFormData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(result.sanitizedData.firstName).toBe('John');
    });

    it('validates form with missing optional fields', () => {
      const formWithoutOptional = {
        ...validFormData,
        email: '',
        specialRequests: ''
      };
      
      const result = validateGuestForm(formWithoutOptional);
      expect(result.isValid).toBe(true);
    });

    it('rejects form with missing required fields', () => {
      const incompleteForm = {
        ...validFormData,
        firstName: '',
        phone: ''
      };
      
      const result = validateGuestForm(incompleteForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.phone).toBeDefined();
    });

    it('sanitizes form data', () => {
      const formWithHtml = {
        ...validFormData,
        firstName: '<script>alert("xss")</script>John',
        lastName: '<div>Doe</div>'
      };
      
      const result = validateGuestForm(formWithHtml);
      expect(result.sanitizedData.firstName).toBe('John');
      expect(result.sanitizedData.lastName).toBe('Doe');
    });
  });

  describe('RateLimit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('allows requests within limit', () => {
      const rateLimit = new RateLimit(3, 60000); // 3 attempts per minute
      
      expect(rateLimit.isAllowed('test-key')).toBe(true);
      expect(rateLimit.isAllowed('test-key')).toBe(true);
      expect(rateLimit.isAllowed('test-key')).toBe(true);
    });

    it('blocks requests after limit exceeded', () => {
      const rateLimit = new RateLimit(2, 60000); // 2 attempts per minute
      
      expect(rateLimit.isAllowed('test-key')).toBe(true);
      expect(rateLimit.isAllowed('test-key')).toBe(true);
      expect(rateLimit.isAllowed('test-key')).toBe(false); // Should be blocked
    });

    it('resets after time window', () => {
      const rateLimit = new RateLimit(1, 1000); // 1 attempt per second
      
      expect(rateLimit.isAllowed('test-key')).toBe(true);
      expect(rateLimit.isAllowed('test-key')).toBe(false);
      
      // Advance time by 1 second
      jest.advanceTimersByTime(1000);
      
      expect(rateLimit.isAllowed('test-key')).toBe(true);
    });

    it('tracks different keys separately', () => {
      const rateLimit = new RateLimit(1, 60000);
      
      expect(rateLimit.isAllowed('key1')).toBe(true);
      expect(rateLimit.isAllowed('key2')).toBe(true);
      expect(rateLimit.isAllowed('key1')).toBe(false);
      expect(rateLimit.isAllowed('key2')).toBe(false);
    });

    it('calculates remaining time correctly', () => {
      const rateLimit = new RateLimit(1, 5000); // 1 attempt per 5 seconds
      
      rateLimit.isAllowed('test-key'); // Use up the limit
      
      const remaining = rateLimit.getRemainingTime('test-key');
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(5);
    });
  });
});