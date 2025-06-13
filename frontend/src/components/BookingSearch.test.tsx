// src/components/BookingSearch.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingSearch from './BookingSearch';

// Mock validation utils
jest.mock('../utils/validation', () => ({
  sanitizeInput: jest.fn((input: string) => input ? input.trim() : '')
}));

// Mock Date to fix toISOString issues
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-12-15T10:00:00.000Z'));

describe('BookingSearch Component', () => {
  const mockOnSearchFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders all search components', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      expect(screen.getByLabelText('ค้นหาการจอง')).toBeInTheDocument();
      expect(screen.getByLabelText('สถานะการจอง')).toBeInTheDocument();
      expect(screen.getByLabelText('วันที่เข้า/ออก')).toBeInTheDocument();
      expect(screen.getByText('ตัวกรองด่วน:')).toBeInTheDocument();
    });

    it('renders quick filter buttons', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      // Use more specific queries to avoid conflicts with select options
      expect(screen.getByRole('button', { name: 'เข้าพักวันนี้' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ออกวันนี้' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'อยู่ในโรงแรม' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'วันนี้' })).toBeInTheDocument();
    });

    it('renders status filter options', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const statusSelect = screen.getByLabelText('สถานะการจอง');
      expect(statusSelect).toHaveValue('all');
      
      expect(screen.getByRole('option', { name: 'ทุกสถานะ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ยืนยันแล้ว' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'เช็คอินแล้ว' })).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('updates search term when typing', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'John Doe' } });
      
      expect(searchInput).toHaveValue('John Doe');
    });

    it('calls onSearchFilter when search term changes', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(mockOnSearchFilter).toHaveBeenCalledWith('test', 'all', '');
    });

    it('shows clear button when search has text', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'ล้างคำค้นหา' });
      expect(clearButton).toBeInTheDocument();
    });

    it('clears search term when clear button is clicked', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'ล้างคำค้นหา' });
      fireEvent.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Status Filter', () => {
    it('updates status filter when changed', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const statusSelect = screen.getByLabelText('สถานะการจอง');
      fireEvent.change(statusSelect, { target: { value: 'confirmed' } });
      
      expect(statusSelect).toHaveValue('confirmed');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'confirmed', '');
    });
  });

  describe('Date Filter', () => {
    it('updates date filter when changed', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const dateInput = screen.getByLabelText('วันที่เข้า/ออก');
      fireEvent.change(dateInput, { target: { value: '2024-12-15' } });
      
      expect(dateInput).toHaveValue('2024-12-15');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'all', '2024-12-15');
    });
  });

  describe('Quick Filters', () => {
    it('activates arriving today filter', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const arrivingButton = screen.getByText('เข้าพักวันนี้');
      fireEvent.click(arrivingButton);
      
      expect(arrivingButton).toHaveClass('active');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'arriving_today', '');
    });

    it('activates departing today filter', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const departingButton = screen.getByText('ออกวันนี้');
      fireEvent.click(departingButton);
      
      expect(departingButton).toHaveClass('active');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'departing_today', '');
    });

    it('activates checked in filter', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const checkedInButton = screen.getByText('อยู่ในโรงแรม');
      fireEvent.click(checkedInButton);
      
      expect(checkedInButton).toHaveClass('active');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'checked_in', '');
    });

    it('activates today date filter', async () => {
            const mockDate = '2024-12-15';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(`${mockDate}T00:00:00.000Z`);
      
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const todayButton = screen.getByText('วันนี้');
      fireEvent.click(todayButton);
      
      expect(todayButton).toHaveClass('active');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'all', mockDate);
    });
  });

  describe('Clear Filters', () => {
    it('shows clear filters button when filters are active', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearFiltersButton = screen.getByText('ล้างตัวกรอง');
      expect(clearFiltersButton).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      // Set some filters
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const statusSelect = screen.getByLabelText('สถานะการจอง');
      fireEvent.change(statusSelect, { target: { value: 'confirmed' } });
      
      const clearFiltersButton = screen.getByText('ล้างตัวกรอง');
      fireEvent.click(clearFiltersButton);
      
      expect(searchInput).toHaveValue('');
      expect(statusSelect).toHaveValue('all');
      expect(mockOnSearchFilter).toHaveBeenCalledWith('', 'all', '');
    });

    it('does not show clear filters button when no filters are active', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      expect(screen.queryByText('ล้างตัวกรอง')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all inputs', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      expect(screen.getByLabelText('ค้นหาการจอง')).toBeInTheDocument();
      expect(screen.getByLabelText('สถานะการจอง')).toBeInTheDocument();
      expect(screen.getByLabelText('วันที่เข้า/ออก')).toBeInTheDocument();
    });

    it('has proper placeholder text', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      expect(searchInput).toHaveAttribute('placeholder', 'ชื่อผู้เข้าพัก, เบอร์โทร, รหัสจอง หรือหมายเลขห้อง');
    });

    it('has aria-label for clear search button', async () => {
            render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchInput = screen.getByLabelText('ค้นหาการจอง');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'ล้างคำค้นหา' });
      expect(clearButton).toHaveAttribute('aria-label', 'ล้างคำค้นหา');
    });

    it('has aria-hidden on search icon', () => {
      render(<BookingSearch onSearchFilter={mockOnSearchFilter} />);
      
      const searchIcon = document.querySelector('.search-icon');
      expect(searchIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});