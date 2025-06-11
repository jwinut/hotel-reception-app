// src/components/BookingSearch.js
import React, { useState, useEffect } from 'react';
import './BookingSearch.css';
import { sanitizeInput } from '../utils/validation';

function BookingSearch({ onSearchFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Call parent filter function whenever search criteria changes
  useEffect(() => {
    // Sanitize search term before filtering
    const sanitizedTerm = sanitizeInput(searchTerm);
    onSearchFilter(sanitizedTerm, statusFilter, dateFilter);
  }, [searchTerm, statusFilter, dateFilter, onSearchFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter;

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
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#666">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                id="search-input"
                type="text"
                placeholder="ชื่อผู้เข้าพัก, เบอร์โทร, รหัสจอง หรือหมายเลขห้อง"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="clear-search-button"
                  type="button"
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="arriving_today">เข้าพักวันนี้</option>
              <option value="checked_in">เช็คอินแล้ว</option>
              <option value="departing_today">ออกวันนี้</option>
              <option value="checked_out">เช็คเอาต์แล้ว</option>
              <option value="cancelled">ยกเลิก</option>
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
              onChange={(e) => setDateFilter(e.target.value)}
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
            <button
              onClick={() => {
                setStatusFilter('arriving_today');
                setDateFilter('');
                setSearchTerm('');
              }}
              className={`quick-filter-button ${statusFilter === 'arriving_today' ? 'active' : ''}`}
            >
              เข้าพักวันนี้
            </button>
            <button
              onClick={() => {
                setStatusFilter('departing_today');
                setDateFilter('');
                setSearchTerm('');
              }}
              className={`quick-filter-button ${statusFilter === 'departing_today' ? 'active' : ''}`}
            >
              ออกวันนี้
            </button>
            <button
              onClick={() => {
                setStatusFilter('checked_in');
                setDateFilter('');
                setSearchTerm('');
              }}
              className={`quick-filter-button ${statusFilter === 'checked_in' ? 'active' : ''}`}
            >
              อยู่ในโรงแรม
            </button>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setDateFilter(today);
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className={`quick-filter-button ${dateFilter === new Date().toISOString().split('T')[0] ? 'active' : ''}`}
            >
              วันนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSearch;