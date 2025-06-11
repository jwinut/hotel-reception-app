// src/components/BookingSearch.tsx
import React, { useState, useEffect } from 'react';
import './BookingSearch.css';
import { sanitizeInput } from '../utils/validation';
import type { BookingStatus } from '../types';

interface BookingSearchProps {
  onSearchFilter: (searchTerm: string, statusFilter: BookingStatus | 'all', dateFilter: string) => void;
}

type StatusFilterOption = BookingStatus | 'all';

interface QuickFilter {
  label: string;
  action: () => void;
  isActive: boolean;
}

const BookingSearch: React.FC<BookingSearchProps> = ({ onSearchFilter }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Call parent filter function whenever search criteria changes
  useEffect(() => {
    // Sanitize search term before filtering
    const sanitizedTerm = sanitizeInput(searchTerm);
    onSearchFilter(sanitizedTerm, statusFilter, dateFilter);
  }, [searchTerm, statusFilter, dateFilter, onSearchFilter]);

  const clearFilters = (): void => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as StatusFilterOption);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDateFilter(e.target.value);
  };

  const clearSearchTerm = (): void => {
    setSearchTerm('');
  };

  const setQuickFilter = (status: StatusFilterOption, date: string = '', search: string = ''): void => {
    setStatusFilter(status);
    setDateFilter(date);
    setSearchTerm(search);
  };

  const getTodayString = (): string => {
    const dateString = new Date().toISOString().split('T')[0];
    return dateString || '';
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter;

  const quickFilters: QuickFilter[] = [
    {
      label: 'เข้าพักวันนี้',
      action: () => setQuickFilter('arriving_today'),
      isActive: statusFilter === 'arriving_today'
    },
    {
      label: 'ออกวันนี้',
      action: () => setQuickFilter('departing_today'),
      isActive: statusFilter === 'departing_today'
    },
    {
      label: 'อยู่ในโรงแรม',
      action: () => setQuickFilter('checked_in'),
      isActive: statusFilter === 'checked_in'
    },
    {
      label: 'วันนี้',
      action: () => setQuickFilter('all', getTodayString()),
      isActive: dateFilter === getTodayString()
    }
  ];

  const statusOptions: { value: StatusFilterOption; label: string }[] = [
    { value: 'all', label: 'ทุกสถานะ' },
    { value: 'confirmed', label: 'ยืนยันแล้ว' },
    { value: 'arriving_today', label: 'เข้าพักวันนี้' },
    { value: 'checked_in', label: 'เช็คอินแล้ว' },
    { value: 'departing_today', label: 'ออกวันนี้' },
    { value: 'checked_out', label: 'เช็คเอาต์แล้ว' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ];

  return (
    <div className="booking-search">
      <div className="search-container">
        <div className="search-row">
          {/* Search Input */}
          <div className="search-field">
            <label htmlFor="search-input" className="search-label">
              ค้นหาการจอง
            </label>
            <div className="search-input-wrapper">
              <svg 
                className="search-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                height="20px" 
                viewBox="0 0 24 24" 
                width="20px" 
                fill="#666"
                aria-hidden="true"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                id="search-input"
                type="text"
                placeholder="ชื่อผู้เข้าพัก, เบอร์โทร, รหัสจอง หรือหมายเลขห้อง"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={clearSearchTerm}
                  className="clear-search-button"
                  type="button"
                  aria-label="ล้างคำค้นหา"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-field">
            <label htmlFor="status-filter" className="filter-label">
              สถานะการจอง
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusChange}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="filter-field">
            <label htmlFor="date-filter" className="filter-label">
              วันที่เข้า/ออก
            </label>
            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              className="filter-input"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="filter-actions">
              <button
                onClick={clearFilters}
                className="clear-filters-button"
                type="button"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="quick-filters">
          <h4 className="quick-filters-title">ตัวกรองด่วน:</h4>
          <div className="quick-filter-buttons">
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={filter.action}
                className={`quick-filter-button ${filter.isActive ? 'active' : ''}`}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSearch;