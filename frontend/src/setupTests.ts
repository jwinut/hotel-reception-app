// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.REACT_APP_ADMIN_CODE = 'test-admin-code';
process.env.REACT_APP_API_URL = 'http://localhost:3001';
process.env.REACT_APP_ENABLE_LOGGING = 'false';
process.env.REACT_APP_ENABLE_DEBUGGING = 'false';
process.env.REACT_APP_HOTEL_NAME = 'Test Hotel';
process.env.REACT_APP_HOTEL_VERSION = '1.0.0';

// Router mocks will be done per test file as needed

// Mock fetch for tests
global.fetch = jest.fn();

// Mock window.alert for tests
global.alert = jest.fn();

// Mock window.prompt for tests
global.prompt = jest.fn();

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});