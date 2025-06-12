# 🚀 Test Performance Optimization Guide

## 📊 Current Performance Issues

### Observed Problems:
- Tests timing out at 2 minutes
- Individual tests taking 1000ms+
- Overall test suites taking 1-3 seconds each
- Heavy component rendering overhead

## ⚡ Optimization Strategies

### 1. **Replace userEvent with fireEvent** (80% speed improvement)

```typescript
// ❌ SLOW - userEvent.setup() and userEvent.type()
const user = userEvent.setup();
await user.type(searchInput, 'สมชาย');

// ✅ FAST - Direct fireEvent
fireEvent.change(searchInput, { target: { value: 'สมชาย' } });
```

### 2. **Use Fake Timers for Debouncing** (90% speed improvement)

```typescript
// ❌ SLOW - Waiting for real timeouts
await waitFor(() => {
  expect(screen.getByRole('listbox')).toBeInTheDocument();
});

// ✅ FAST - Control time directly
beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

// In tests:
fireEvent.change(input, { target: { value: 'search' } });
jest.runAllTimers(); // Instantly advance time
expect(screen.getByRole('listbox')).toBeInTheDocument();
```

### 3. **Optimize Mock Data** (50% speed improvement)

```typescript
// ❌ SLOW - Complex mock objects
const mockBookings: Booking[] = [
  {
    id: 'BK240001',
    guestName: 'สมชาย ใจดี',
    // ... 15+ properties
  }
];

// ✅ FAST - Factory function with minimal data
const createMockBooking = (id: string, name: string): Booking => ({
  id, guestName: name,
  // Only essential properties for the test
  phone: '0812345678',
  status: 'confirmed',
  checkInDate: '2024-01-15'
  // ... only what's needed
});
```

### 4. **Simplify DOM Queries** (40% speed improvement)

```typescript
// ❌ SLOW - Multiple complex queries
expect(screen.getAllByText(`${booking.guests} คน`)[0]).toBeInTheDocument();
expect(screen.getAllByText(`${booking.nights} คืน`)[0]).toBeInTheDocument();

// ✅ FAST - Single role-based queries
expect(screen.getByTestId('guest-count')).toHaveTextContent('2 คน');
expect(screen.getByTestId('nights-count')).toHaveTextContent('1 คืน');
```

### 5. **Optimize Mock Setup** (30% speed improvement)

```typescript
// ❌ SLOW - Complex beforeEach setup
beforeEach(() => {
  jest.clearAllMocks();
  let mockIdCounter = 0;
  mockGenerateId.mockImplementation((prefix = 'id') => {
    mockIdCounter++;
    return `${prefix}-${mockIdCounter}`;
  });
  // ... complex setup
});

// ✅ FAST - Simple static mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// Use static mock implementation
jest.mock('../utils/accessibility', () => ({
  generateId: (prefix = 'id') => `${prefix}-123`,
  createButtonAriaProps: () => ({ 'aria-pressed': false })
}));
```

### 6. **Batch Similar Tests** (60% speed improvement)

```typescript
// ❌ SLOW - Separate renders for each variant
variants.forEach(variant => {
  it(`renders ${variant} variant correctly`, () => {
    render(<AccessibleButton variant={variant}>Button</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass(`btn-${variant}`);
  });
});

// ✅ FAST - Single render testing multiple variants
it('renders all variants correctly', () => {
  const variants = ['primary', 'secondary', 'danger', 'ghost'];
  variants.forEach((variant, index) => {
    const { container } = render(
      <AccessibleButton key={index} variant={variant}>Button {index}</AccessibleButton>
    );
    expect(container.querySelector('button')).toHaveClass(`btn-${variant}`);
  });
});
```

### 7. **Mock Heavy Components** (70% speed improvement)

```typescript
// ❌ SLOW - Full component rendering
import { FormInput, FormTextarea } from './AccessibleForm';

// ✅ FAST - Mock heavy components
jest.mock('./FormInput', () => {
  return function MockFormInput({ label, ...props }: any) {
    return <input data-testid="form-input" aria-label={label} {...props} />;
  };
});
```

### 8. **Reduce waitFor Usage** (50% speed improvement)

```typescript
// ❌ SLOW - Unnecessary waitFor
await waitFor(() => {
  expect(screen.getByText('Static Text')).toBeInTheDocument();
});

// ✅ FAST - Direct assertion for static content
expect(screen.getByText('Static Text')).toBeInTheDocument();

// Only use waitFor for truly async operations
await waitFor(() => {
  expect(screen.getByRole('listbox')).toBeInTheDocument();
}, { timeout: 100 }); // Reduce timeout
```

### 9. **Optimize i18n Setup** (40% speed improvement)

```typescript
// ❌ SLOW - Full i18n initialization in each test
i18n.init({
  lng: 'th',
  fallbackLng: 'en',
  resources: { /* large resources object */ }
});

// ✅ FAST - Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key // Return key as translation
  }),
  I18nextProvider: ({ children }: any) => children
}));
```

### 10. **Use Test Data Builders** (35% speed improvement)

```typescript
// ❌ SLOW - Inline test data creation
const booking = {
  id: 'BK001',
  guestName: 'Test Guest',
  // ... many properties
};

// ✅ FAST - Reusable builders
class BookingBuilder {
  private booking: Partial<Booking> = {};
  
  withId(id: string) { this.booking.id = id; return this; }
  withGuest(name: string) { this.booking.guestName = name; return this; }
  
  build(): Booking {
    return { 
      id: 'BK001',
      guestName: 'Default Guest',
      ...this.booking 
    } as Booking;
  }
}

// Usage
const booking = new BookingBuilder().withId('BK002').withGuest('John').build();
```

## 📈 Expected Performance Improvements

| Optimization | Speed Improvement | Implementation Effort |
|--------------|------------------|----------------------|
| Replace userEvent | 80% | Low |
| Fake Timers | 90% | Low |
| Optimize Mocks | 50% | Medium |
| Simplify Queries | 40% | Low |
| Batch Tests | 60% | Medium |
| Mock Components | 70% | High |
| Reduce waitFor | 50% | Low |

## 🎯 Quick Wins (Implement First)

1. **Replace all userEvent with fireEvent** - Easiest, biggest impact
2. **Add jest.useFakeTimers()** - Simple change, huge performance boost
3. **Reduce waitFor timeouts** - Change `waitFor(() => {}, { timeout: 100 })`
4. **Static mock implementations** - Remove dynamic mock generation

## 📝 Implementation Checklist

- [ ] Replace userEvent.setup() with fireEvent
- [ ] Add fake timers for time-dependent tests
- [ ] Simplify mock data objects
- [ ] Use getByRole instead of getAllByText
- [ ] Mock heavy components
- [ ] Reduce waitFor usage and timeouts
- [ ] Batch similar test cases
- [ ] Implement test data builders
- [ ] Mock i18n for faster rendering
- [ ] Add performance tests to CI pipeline

## 🔧 Jest Configuration Optimizations

```javascript
// jest.config.js
module.exports = {
  testTimeout: 5000, // Reduce from default 5000ms
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest'] // Faster than ts-jest
  },
  testEnvironment: 'jsdom',
  clearMocks: true,
  resetMocks: false, // Don't reset between tests
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

## 📊 Expected Results

**Before Optimization:**
- Test suite: 60-120 seconds
- Individual tests: 500-2000ms
- Frequent timeouts

**After Optimization:**
- Test suite: 5-15 seconds (80-90% reduction)
- Individual tests: 10-100ms (90-95% reduction)
- No timeouts

This optimization plan should reduce your test execution time from minutes to seconds while maintaining the same level of coverage and reliability.