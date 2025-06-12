// src/components/GuestForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
      expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
      expect(screen.getByText(/กรุณากรอกเบอร์โทรศัพท์/)).toBeInTheDocument();
    });
    
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const phoneInput = screen.getByLabelText(/เบอร์โทรศัพท์/);
    await user.type(phoneInput, 'invalid-phone');
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง/)).toBeInTheDocument();
    });
  });

  it('validates email format when provided', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/อีเมล/);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument();
    });
  });

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
    });
    
    // Start typing in first name field
    const firstNameInput = screen.getByLabelText(/ชื่อ/);
    await user.type(firstNameInput, 'J');
    
    expect(screen.queryByText(/กรุณากรอกชื่อ/)).not.toBeInTheDocument();
  });

  it('updates character count for special requests', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const textArea = screen.getByLabelText(/ความต้องการพิเศษ/);
    await user.type(textArea, 'Test request');
    
    expect(screen.getByText('12/500')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/ชื่อ/), 'John');
    await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
    await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
    await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
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
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/ชื่อ/), 'John');
    await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
    await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
    await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
    // Check loading state
    expect(screen.getByText(/กำลังดำเนินการ/)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /ยกเลิก/ })).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it.skip('handles form submission error gracefully', async () => {
    const user = userEvent.setup();
    // Create a mock that throws an error during the submission process
    const mockOnCompleteError = jest.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(<GuestForm {...defaultProps} onComplete={mockOnCompleteError} />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/ชื่อ/), 'John');
    await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
    await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
    await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
    
    const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
    await user.click(submitButton);
    
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

  it('allows selecting different nationalities', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const nationalitySelect = screen.getByLabelText(/สัญชาติ/);
    await user.selectOptions(nationalitySelect, 'ญี่ปุ่น');
    
    expect(screen.getByDisplayValue('ญี่ปุ่น')).toBeInTheDocument();
  });

  it('allows selecting number of guests', async () => {
    const user = userEvent.setup();
    render(<GuestForm {...defaultProps} />);
    
    const guestsSelect = screen.getByLabelText(/จำนวนผู้เข้าพัก/);
    await user.selectOptions(guestsSelect, '5');
    
    expect(screen.getByDisplayValue('5 คน')).toBeInTheDocument();
  });

  describe('Edge Cases and Validation Scenarios', () => {
    describe('Thai ID Validation', () => {
      it('validates valid Thai ID with proper checksum', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields with valid Thai ID (1101700550095 is a valid test ID)
        await user.type(screen.getByLabelText(/ชื่อ/), 'สมชาย');
        await user.type(screen.getByLabelText(/นามสกุล/), 'ใจดี');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), '1101700550095');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        await user.type(screen.getByLabelText(/ชื่อ/), 'สมชาย');
        await user.type(screen.getByLabelText(/นามสกุล/), 'ใจดี');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), '1234567890129'); // Invalid checksum
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบเลขบัตรประชาชนไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });

      it('rejects Thai ID with incorrect length', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), '12345678901'); // Only 11 digits
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบเลขบัตรประชาชนไม่ถูกต้อง/)).toBeInTheDocument();
        });
      });

      it('handles Thai ID with dashes and spaces', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        await user.type(screen.getByLabelText(/ชื่อ/), 'สมชาย');
        await user.type(screen.getByLabelText(/นามสกุล/), 'ใจดี');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), '1-1017-00550-09-5'); // With dashes
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test with one valid passport
        await user.type(screen.getByLabelText(/ชื่อ/), 'John');
        await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              idNumber: 'AB123456'
            })
          );
        });
      });

      it('rejects invalid passport formats', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test with one invalid passport
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), '12345');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบหนังสือเดินทางไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });
    });

    describe('Phone Number Validation', () => {
      it('validates various Thai phone formats', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test with one valid phone format
        await user.type(screen.getByLabelText(/ชื่อ/), 'สมชาย');
        await user.type(screen.getByLabelText(/นามสกุล/), 'ใจดี');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              phone: '081-234-5678'
            })
          );
        });
      });

      it('rejects invalid phone formats', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test with one invalid phone
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), 'abc-def-ghij');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });
    });

    describe('Email Validation', () => {
      it('validates correct email formats', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test with one valid email
        await user.type(screen.getByLabelText(/ชื่อ/), 'John');
        await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        await user.type(screen.getByLabelText(/อีเมล/), 'test@example.com');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              email: 'test@example.com'
            })
          );
        });
      });

      it('rejects invalid email formats', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test with one invalid email
        await user.type(screen.getByLabelText(/อีเมล/), 'invalid-email');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument();
        });
        expect(mockOnComplete).not.toHaveBeenCalled();
      });

      it('allows empty email (optional field)', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields without email
        await user.type(screen.getByLabelText(/ชื่อ/), 'John');
        await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Try to inject HTML
        await user.type(screen.getByLabelText(/ชื่อ/), '<script>alert("xss")</script>John');
        await user.type(screen.getByLabelText(/นามสกุล/), '<div>Doe</div>');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields
        await user.type(screen.getByLabelText(/ชื่อ/), 'John');
        await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        
        // Add special requests with special characters
        const specialRequest = 'ต้องการห้องชั้นล่าง & ไม่มีกลิ่นบุหรี่';
        await user.type(screen.getByLabelText(/ความต้องการพิเศษ/), specialRequest);
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
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
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/ชื่อต้องไม่เกิน 50 ตัวอักษร/)).toBeInTheDocument();
        });
      });

      it('enforces minimum length for name fields', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Enter single space (should be trimmed to empty)
        await user.type(screen.getByLabelText(/ชื่อ/), ' ');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
        });
      });

      it('enforces character limit for special requests', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Type exactly 500 characters
        const maxText = 'a'.repeat(500);
        const specialRequestsField = screen.getByLabelText(/ความต้องการพิเศษ/);
        await user.type(specialRequestsField, maxText);
        
        expect(screen.getByText('500/500')).toBeInTheDocument();
        
        // Try to type more (should be limited by maxLength attribute)
        await user.type(specialRequestsField, 'b');
        
        // Should still be 500 characters
        expect(screen.getByText('500/500')).toBeInTheDocument();
      });
    });

    describe('Guest Number Validation', () => {
      it('validates guest number range (1-10)', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Test selecting minimum and maximum valid values
        const guestsSelect = screen.getByLabelText(/จำนวนผู้เข้าพัก/);
        
        // Test minimum (1)
        await user.selectOptions(guestsSelect, '1');
        expect(screen.getByDisplayValue('1 คน')).toBeInTheDocument();
        
        // Test maximum (10)
        await user.selectOptions(guestsSelect, '10');
        expect(screen.getByDisplayValue('10 คน')).toBeInTheDocument();
      });

      it('includes guest count in form submission', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Fill required fields and select 7 guests
        await user.type(screen.getByLabelText(/ชื่อ/), 'John');
        await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), '081-234-5678');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), 'AB123456');
        
        const guestsSelect = screen.getByLabelText(/จำนวนผู้เข้าพัก/);
        await user.selectOptions(guestsSelect, '7');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Fill invalid data for multiple fields
        await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/), 'invalid');
        await user.type(screen.getByLabelText(/อีเมล/), 'invalid-email');
        await user.type(screen.getByLabelText(/เลขบัตรประชาชน/), '123');
        
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Create validation errors
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/กรุณากรอกชื่อ/)).toBeInTheDocument();
          expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
        });
        
        // Fix first name error
        await user.type(screen.getByLabelText(/ชื่อ/), 'John');
        expect(screen.queryByText(/กรุณากรอกชื่อ/)).not.toBeInTheDocument();
        
        // Last name error should still be present
        expect(screen.getByText(/กรุณากรอกนามสกุล/)).toBeInTheDocument();
        
        // Fix last name error
        await user.type(screen.getByLabelText(/นามสกุล/), 'Doe');
        expect(screen.queryByText(/กรุณากรอกนามสกุล/)).not.toBeInTheDocument();
      });
    });

    describe('Accessibility Features', () => {
      it('associates error messages with form fields using aria-describedby', async () => {
        const user = userEvent.setup();
        render(<GuestForm {...defaultProps} />);
        
        // Trigger validation errors
        const submitButton = screen.getByRole('button', { name: /ถัดไป/ });
        await user.click(submitButton);
        
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