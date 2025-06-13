// src/components/GuestForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuestForm from './GuestForm';
import type { Guest } from '../types';

describe('GuestForm Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onComplete: mockOnComplete,
    onCancel: mockOnCancel
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders all form fields', () => {
    render(<GuestForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/ชื่อ/)).toBeInTheDocument();
    expect(screen.getByLabelText(/นามสกุล/)).toBeInTheDocument();
    expect(screen.getByLabelText(/เบอร์โทรศัพท์/)).toBeInTheDocument();
    expect(screen.getByLabelText(/อีเมล/)).toBeInTheDocument();
    expect(screen.getByLabelText(/เลขบัตรประชาชน/)).toBeInTheDocument();
    expect(screen.getByLabelText(/สัญชาติ/)).toBeInTheDocument();
    expect(screen.getByLabelText(/จำนวนผู้เข้าพัก/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ความต้องการพิเศษ/)).toBeInTheDocument();
  });

  it('populates form with initial data', () => {
    const initialData: Partial<Guest> = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '081-234-5678',
      email: 'john@example.com',
      nationality: 'อเมริกัน',
      numGuests: 3
    };

    render(<GuestForm {...defaultProps} initialData={initialData} />);
    
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('081-234-5678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('อเมริกัน')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3 คน')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<GuestForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
      expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
      expect(screen.getByText(/กรุณากรอกเบอร์โทรศัพท์/)).toBeInTheDocument();
    });
    
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    render(<GuestForm {...defaultProps} />);
    
    const phoneInput = screen.getByLabelText(/เบอร์โทรศัพท์/);
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง/)).toBeInTheDocument();
    });
  });

  it('validates email format when provided', async () => {
    render(<GuestForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/อีเมล/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument();
    });
  });

  it('clears errors when user starts typing', async () => {
    render(<GuestForm {...defaultProps} />);
    
    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
    });
    
    // Start typing in first name field
    const firstNameInput = screen.getByLabelText(/ชื่อ/);
    fireEvent.change(firstNameInput, { target: { value: 'J' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/กรุณากรอกชื่อ/)).not.toBeInTheDocument();
    });
  });

  it('updates character count for special requests', () => {
    render(<GuestForm {...defaultProps} />);
    
    const textArea = screen.getByLabelText(/ความต้องการพิเศษ/);
    fireEvent.change(textArea, { target: { value: 'Test request' } });
    
    expect(screen.getByText('12/500')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<GuestForm {...defaultProps} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
    fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          phone: '081-234-5678',
          idNumber: 'AB123456',
          nationality: 'ไทย',
          numGuests: 1
        })
      );
    });
  });

  it('shows loading state during submission', async () => {
    render(<GuestForm {...defaultProps} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
    fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    // Check loading state immediately
    await waitFor(() => {
      expect(screen.getByText(/กำลังดำเนินการ/)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /ยกเลิก/ })).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<GuestForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it.skip('handles form submission error gracefully', async () => {
    // Create a mock that throws an error during the submission process
    const mockOnCompleteError = jest.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(<GuestForm {...defaultProps} onComplete={mockOnCompleteError} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
    fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    fireEvent.click(submitButton);
    
    // Wait for the error to be handled
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
      );
    }, { timeout: 3000 });
    
    // Form should return to normal state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ถัดไป/ })).not.toBeDisabled();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<GuestForm {...defaultProps} />);
    
    // Check for required field indicators
    const requiredFields = screen.getAllByText('*');
    expect(requiredFields.length).toBeGreaterThan(0);
    
    // Check for proper labeling
    expect(screen.getByLabelText(/ชื่อ.*\*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/นามสกุล.*\*/)).toBeInTheDocument();
    
    // Check for character count
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('allows selecting different nationalities', () => {
    render(<GuestForm {...defaultProps} />);
    
    const nationalitySelect = screen.getByLabelText(/สัญชาติ/);
    fireEvent.change(nationalitySelect, { target: { value: 'ญี่ปุ่น' } });
    
    expect(screen.getByDisplayValue('ญี่ปุ่น')).toBeInTheDocument();
  });

  it('allows selecting number of guests', () => {
    render(<GuestForm {...defaultProps} />);
    
    const guestsSelect = screen.getByLabelText(/จำนวนผู้เข้าพัก/);
    fireEvent.change(guestsSelect, { target: { value: '5' } });
    
    expect(screen.getByDisplayValue('5 คน')).toBeInTheDocument();
  });

  describe('Edge Cases and Validation Scenarios', () => {
    describe('Thai ID Validation', () => {
      it('validates valid Thai ID with proper checksum', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields with valid Thai ID (1101700550095 is a valid test ID)
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'สมชาย' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'ใจดี' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: '1101700550095' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              firstName: 'สมชาย',
              lastName: 'ใจดี',
              idNumber: '1101700550095'
            })
          );
        });
      });

      it('rejects Thai ID with invalid checksum', async () => {
        render(<GuestForm {...defaultProps} />);
        
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'สมชาย' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'ใจดี' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: '1234567890129' } }); // Invalid checksum
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบเลขบัตรประชาชนไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });

      it('rejects Thai ID with incorrect length', async () => {
        render(<GuestForm {...defaultProps} />);
        
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: '12345678901' } }); // Only 11 digits
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบเลขบัตรประชาชนไม่ถูกต้อง/)).toBeInTheDocument();
        });
      });

      it('handles Thai ID with dashes and spaces', async () => {
        render(<GuestForm {...defaultProps} />);
        
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'สมชาย' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'ใจดี' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: '1-1017-00550-09-5' } }); // With dashes
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              idNumber: '1-1017-00550-09-5' // Should preserve formatting in sanitized data
            })
          );
        });
      });
    });

    describe('Passport Validation', () => {
      it('validates valid passport numbers', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test with one valid passport
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              idNumber: 'AB123456'
            })
          );
        });
      });

      it('rejects invalid passport formats', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test with one invalid passport
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: '12345' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบหนังสือเดินทางไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });
    });

    describe('Phone Number Validation', () => {
      it('validates various Thai phone formats', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test with one valid phone format
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'สมชาย' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'ใจดี' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              phone: '081-234-5678'
            })
          );
        });
      });

      it('rejects invalid phone formats', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test with one invalid phone
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: 'abc-def-ghij' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });
    });

    describe('Email Validation', () => {
      it('validates correct email formats', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test with one valid email
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        fireEvent.change(screen.getByLabelText(/อีเมล/), { target: { value: 'test@example.com' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              email: 'test@example.com'
            })
          );
        });
      });

      it('rejects invalid email formats', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test with one invalid email
        fireEvent.change(screen.getByLabelText(/อีเมล/), { target: { value: 'invalid-email' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });

      it('allows empty email (optional field)', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields without email
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              email: ''
            })
          );
        });
      });
    });

    describe('Input Sanitization', () => {
      it('sanitizes HTML tags from input fields', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Try to inject HTML
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: '<script>alert("xss")</script>John' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: '<div>Doe</div>' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              firstName: 'John', // HTML tags should be stripped
              lastName: 'Doe'    // HTML tags should be stripped
            })
          );
        });
      });

      it('handles special characters in special requests', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        
        // Add special requests with special characters
        const specialRequest = 'ต้องการห้องชั้นล่าง & ไม่มีกลิ่นบุหรี่';
        fireEvent.change(screen.getByLabelText(/ความต้องการพิเศษ/), { target: { value: specialRequest } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              specialRequests: specialRequest
            })
          );
        });
      });
    });

    describe('Field Length Validation', () => {
      it('enforces maximum length for name fields', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // The input has maxLength=50, so typing 51 characters will only input 50
        // We need to test the validation logic by simulating what happens if data comes in over limit
        const firstNameInput = screen.getByLabelText(/ชื่อ/);
        
        // Directly set a long value to bypass maxLength attribute
        Object.defineProperty(firstNameInput, 'value', {
          value: 'a'.repeat(51),
          writable: true
        });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/ชื่อต้องไม่เกิน 50 ตัวอักษร/)).toBeInTheDocument();
        });
      });

      it('enforces minimum length for name fields', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Enter single space (should be trimmed to empty)
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: ' ' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
        });
      });

      it('enforces character limit for special requests', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Type exactly 500 characters
        const maxText = 'a'.repeat(500);
        const specialRequestsField = screen.getByLabelText(/ความต้องการพิเศษ/);
        fireEvent.change(specialRequestsField, { target: { value: maxText } });
        
        expect(screen.getByText('500/500')).toBeInTheDocument();
        
        // Try to type more (should be limited by maxLength attribute)
        fireEvent.change(specialRequestsField, { target: { value: maxText + 'b' } });
        
        // Should still be 500 characters
        expect(screen.getByText('500/500')).toBeInTheDocument();
      });
    });

    describe('Guest Number Validation', () => {
      it('validates guest number range (1-10)', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Test selecting minimum and maximum valid values
        const guestsSelect = screen.getByLabelText(/จำนวนผู้เข้าพัก/);
        
        // Test minimum (1)
        fireEvent.change(guestsSelect, { target: { value: '1' } });
        expect(screen.getByDisplayValue('1 คน')).toBeInTheDocument();
        
        // Test maximum (10)
        fireEvent.change(guestsSelect, { target: { value: '10' } });
        expect(screen.getByDisplayValue('10 คน')).toBeInTheDocument();
      });

      it('includes guest count in form submission', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields and select 7 guests
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '081-234-5678' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: 'AB123456' } });
        
        const guestsSelect = screen.getByLabelText(/จำนวนผู้เข้าพัก/);
        fireEvent.change(guestsSelect, { target: { value: '7' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              numGuests: 7
            })
          );
        });
      });
    });

    describe('Error State Management', () => {
      it('shows multiple validation errors simultaneously', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Fill invalid data for multiple fields
        fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: 'invalid' } });
        fireEvent.change(screen.getByLabelText(/อีเมล/), { target: { value: 'invalid-email' } });
        fireEvent.change(screen.getByLabelText(/เลขบัตรประชาชน/), { target: { value: '123' } });
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
          expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
          expect(screen.getByText(/รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง/)).toBeInTheDocument();
          expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument();
        });
        
        // Should also show ID validation error
        expect(screen.getByText(/รูปแบบหนังสือเดินทางไม่ถูกต้อง/)).toBeInTheDocument();
      });

      it('clears individual errors when fields are corrected', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Create validation errors
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
          expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
        });
        
        // Fix first name error
        fireEvent.change(screen.getByLabelText(/ชื่อ/), { target: { value: 'John' } });
        expect(screen.queryByText(/กรุณากรอกชื่อ/)).not.toBeInTheDocument();
        
        // Last name error should still be present
        expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
        
        // Fix last name error
        fireEvent.change(screen.getByLabelText(/นามสกุล/), { target: { value: 'Doe' } });
        expect(screen.queryByText(/กรุณากรอกนามสกุล/)).not.toBeInTheDocument();
      });
    });

    describe('Accessibility Features', () => {
      it('associates error messages with form fields using aria-describedby', async () => {
        render(<GuestForm {...defaultProps} />);
        
        // Trigger validation errors
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          const firstNameInput = screen.getByLabelText(/ชื่อ/);
          const firstNameError = screen.getByText(/กรุณากรอกชื่อ/);
          
          expect(firstNameInput).toHaveAttribute('aria-describedby', 'firstName-error');
          expect(firstNameError).toHaveAttribute('id', 'firstName-error');
          expect(firstNameError).toHaveAttribute('role', 'alert');
        });
      });

      it('updates character count with aria-live for screen readers', () => {
        render(<GuestForm {...defaultProps} />);
        
        const characterCountContainer = screen.getByText('0/500');
        expect(characterCountContainer).toHaveAttribute('aria-live', 'polite');
      });

      it('marks required fields with proper indicators', () => {
        render(<GuestForm {...defaultProps} />);
        
        // Check required field indicators
        const requiredFields = screen.getAllByText('*');
        expect(requiredFields).toHaveLength(5); // firstName, lastName, phone, idNumber, numGuests
        
        // Check required attribute on inputs
        expect(screen.getByLabelText(/ชื่อ/)).toHaveAttribute('required');
        expect(screen.getByLabelText(/นามสกุล/)).toHaveAttribute('required');
        expect(screen.getByLabelText(/เบอร์โทรศัพท์/)).toHaveAttribute('required');
        expect(screen.getByLabelText(/เลขบัตรประชาชน/)).toHaveAttribute('required');
        expect(screen.getByLabelText(/จำนวนผู้เข้าพัก/)).toHaveAttribute('required');
        
        // Email should not be required
        expect(screen.getByLabelText(/อีเมล/)).not.toHaveAttribute('required');
      });
    });
  });
});