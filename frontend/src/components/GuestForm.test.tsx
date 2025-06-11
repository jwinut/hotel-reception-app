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

  it('handles form submission error gracefully', async () => {
    const user = userEvent.setup();
    // Create a mock that throws an error during the submission process
    const mockOnCompleteError = jest.fn().mockImplementation(async () => {
      throw new Error('Submission failed');
    });
    
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
});