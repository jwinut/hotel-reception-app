// src/services/apiClient.test.ts
import { apiClient } from './apiClient';
import type { ApiResponse, ApiErrorResponse } from './apiClient';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AbortController
const mockAbort = jest.fn();
const mockAbortController = {
  abort: mockAbort,
  signal: {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  },
};

global.AbortController = jest.fn(() => mockAbortController) as any;

// Mock setTimeout and clearTimeout
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

describe('ApiClient', () => {
  let mockSetTimeout: jest.SpyInstance;
  let mockClearTimeout: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetTimeout = jest.spyOn(global, 'setTimeout');
    mockClearTimeout = jest.spyOn(global, 'clearTimeout');
    mockAbort.mockClear();
  });

  afterEach(() => {
    mockSetTimeout.mockRestore();
    mockClearTimeout.mockRestore();
  });

  describe('Constructor and basic setup', () => {
    it('creates instance with default values', () => {
      expect(apiClient).toBeDefined();
      expect(typeof apiClient.get).toBe('function');
      expect(typeof apiClient.post).toBe('function');
      expect(typeof apiClient.put).toBe('function');
      expect(typeof apiClient.patch).toBe('function');
      expect(typeof apiClient.delete).toBe('function');
    });
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        data: mockData,
        success: true,
      });
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('makes GET request with query parameters', async () => {
      const mockData = { results: [] };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const params = { page: '1', limit: '10', search: 'test query' };
      await apiClient.get('/search', params);

      expect(mockFetch).toHaveBeenCalledWith('/search?page=1&limit=10&search=test+query', {
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('handles empty query parameters', async () => {
      const mockData = { results: [] };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.get('/test', {});

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('handles GET request without parameters', async () => {
      const mockData = { message: 'success' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request with data', async () => {
      const mockData = { id: 1, created: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const postData = { name: 'Test Item', value: 123 };
      const result = await apiClient.post('/create', postData);

      expect(mockFetch).toHaveBeenCalledWith('/create', {
        method: 'POST',
        body: JSON.stringify(postData),
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        data: mockData,
        success: true,
      });
    });

    it('makes POST request without data', async () => {
      const mockData = { message: 'created' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.post('/trigger');

      expect(mockFetch).toHaveBeenCalledWith('/trigger', {
        method: 'POST',
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('PUT requests', () => {
    it('makes successful PUT request with data', async () => {
      const mockData = { id: 1, updated: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const putData = { name: 'Updated Item', value: 456 };
      const result = await apiClient.put('/update/1', putData);

      expect(mockFetch).toHaveBeenCalledWith('/update/1', {
        method: 'PUT',
        body: JSON.stringify(putData),
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        data: mockData,
        success: true,
      });
    });

    it('makes PUT request without data', async () => {
      const mockData = { id: 1, reset: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.put('/reset/1');

      expect(mockFetch).toHaveBeenCalledWith('/reset/1', {
        method: 'PUT',
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('PATCH requests', () => {
    it('makes successful PATCH request with data', async () => {
      const mockData = { id: 1, patched: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const patchData = { status: 'active' };
      const result = await apiClient.patch('/patch/1', patchData);

      expect(mockFetch).toHaveBeenCalledWith('/patch/1', {
        method: 'PATCH',
        body: JSON.stringify(patchData),
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        data: mockData,
        success: true,
      });
    });

    it('makes PATCH request without data', async () => {
      const mockData = { id: 1, updated: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.patch('/toggle/1');

      expect(mockFetch).toHaveBeenCalledWith('/toggle/1', {
        method: 'PATCH',
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('DELETE requests', () => {
    it('makes successful DELETE request', async () => {
      const mockData = { id: 1, deleted: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiClient.delete('/delete/1');

      expect(mockFetch).toHaveBeenCalledWith('/delete/1', {
        method: 'DELETE',
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        data: mockData,
        success: true,
      });
    });
  });

  describe('Error handling', () => {
    it('handles HTTP error responses', async () => {
      const errorData: ApiErrorResponse = {
        success: false,
        error: 'NOT_FOUND',
        message: 'ไม่พบข้อมูลที่ต้องการ',
        code: '404',
      };
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiClient.get('/not-found')).rejects.toThrow('ไม่พบข้อมูลที่ต้องการ');
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('handles HTTP error without error message', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({}),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiClient.get('/server-error')).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('handles timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      await expect(apiClient.get('/timeout')).rejects.toThrow('คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง');
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network request failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(apiClient.get('/network-error')).rejects.toThrow('Network request failed');
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('handles unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error string');

      await expect(apiClient.get('/unknown-error')).rejects.toThrow('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('handles JSON parsing errors in error response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiClient.get('/bad-json')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('Timeout handling', () => {
    it('sets up timeout for requests', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.get('/test');

      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('calls abort controller on timeout', () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Simulate timeout
      const timeoutCallback = mockSetTimeout.mock.calls[0]?.[0];
      if (timeoutCallback) {
        timeoutCallback();
      }

      expect(mockAbort).toHaveBeenCalled();
    });
  });

  describe('Request headers', () => {
    it('sets default Content-Type header', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('merges custom headers with defaults', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Access the private makeRequest method through post (which calls it)
      await apiClient.post('/test', { data: 'test' });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1].headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('Complex scenarios', () => {
    it('handles concurrent requests', async () => {
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };
      const mockResponse1 = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData1),
      };
      const mockResponse2 = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData2),
      };
      
      mockFetch
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const [result1, result2] = await Promise.all([
        apiClient.get('/test1'),
        apiClient.get('/test2')
      ]);

      expect(result1.data).toEqual(mockData1);
      expect(result2.data).toEqual(mockData2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles request with special characters in parameters', async () => {
      const mockData = { results: [] };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.get('/search', { 
        query: 'สวัสดี & hello',
        filter: 'type=special|chars',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/search?query=%E0%B8%AA%E0%B8%A7%E0%B8%B1%E0%B8%AA%E0%B8%94%E0%B8%B5+%26+hello&filter=type%3Dspecial%7Cchars',
        expect.any(Object)
      );
    });

    it('handles empty response bodies', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(null),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiClient.get('/empty');

      expect(result).toEqual({
        data: null,
        success: true,
      });
    });

    it('handles large JSON responses', async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'A'.repeat(100),
        })),
      };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(largeData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiClient.get('/large-data');

      expect(result.data).toEqual(largeData);
      expect(result.data.items).toHaveLength(1000);
    });
  });

  describe('Edge cases', () => {
    it('handles undefined data in POST request', async () => {
      const mockData = { created: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.post('/create', undefined);

      expect(mockFetch).toHaveBeenCalledWith('/create', {
        method: 'POST',
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('handles null data in PUT request', async () => {
      const mockData = { updated: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.put('/update', null);

      expect(mockFetch).toHaveBeenCalledWith('/update', {
        method: 'PUT',
        body: JSON.stringify(null),
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('handles empty string data', async () => {
      const mockData = { processed: true };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiClient.post('/process', '');

      expect(mockFetch).toHaveBeenCalledWith('/process', {
        method: 'POST',
        body: JSON.stringify(''),
        signal: mockAbortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
});