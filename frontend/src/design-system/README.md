# Hotel Reception App Design System

A comprehensive, accessible, and scalable design system for the Hotel Reception App.

## Overview

This design system provides a consistent visual language and component library that ensures:
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Support for Thai and English
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized for speed and bundle size
- **Maintainability**: Consistent tokens and patterns

## Architecture

### Design Tokens (`tokens.css`)

Centralized design values that ensure consistency across all components:

- **Colors**: Primary, secondary, success, warning, error palettes
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (4px base unit)
- **Border Radius**: Standardized corner radii
- **Shadows**: Elevation system
- **Z-Index**: Layering hierarchy
- **Transitions**: Animation timing and easing

### Component Library

#### Core Components

##### Button (`Button.tsx`)
- **Variants**: primary, secondary, tertiary, ghost, danger, success, warning
- **Sizes**: xs, sm, md, lg, xl
- **Shapes**: rectangle, rounded, pill, circle
- **Features**: Loading states, icons, full width, disabled states
- **Accessibility**: Keyboard navigation, screen reader support

```tsx
<Button variant="primary" size="md" loading>
  Save Changes
</Button>
```

##### Input (`Input.tsx`)
- **Variants**: default, filled, outlined, underlined
- **Sizes**: sm, md, lg
- **Features**: Icons, addons, clearable, validation states
- **Accessibility**: Proper labeling, error announcements

```tsx
<Input
  label="Email Address"
  type="email"
  error="Please enter a valid email"
  leftIcon={<EmailIcon />}
  required
/>
```

##### Card (`Card.tsx`)
- **Variants**: default, outlined, elevated, filled
- **Features**: Interactive states, loading overlay, hover effects
- **Subcomponents**: CardHeader, CardBody, CardFooter

```tsx
<Card variant="elevated" hoverable>
  <CardHeader title="Hotel Booking" subtitle="Room Details" />
  <CardBody>Booking information content</CardBody>
  <CardFooter>
    <Button>Confirm</Button>
  </CardFooter>
</Card>
```

##### Badge (`Badge.tsx`)
- **Variants**: default, primary, secondary, success, warning, error, info
- **Features**: Outline style, dot variant, notification positioning

```tsx
<NotificationBadge count={5} position="top-right">
  <Button>Messages</Button>
</NotificationBadge>
```

#### Accessibility Components

All components include:
- **ARIA attributes**: Proper roles, labels, and descriptions
- **Keyboard navigation**: Tab order and key event handling
- **Screen reader support**: Announcements and live regions
- **Focus management**: Visible focus indicators

## Usage Guidelines

### Getting Started

1. Import design tokens:
```css
@import '../design-system/tokens.css';
```

2. Use components:
```tsx
import { Button, Input, Card } from '../components';
```

### Design Principles

#### 1. Consistency
- Use design tokens for all styling
- Follow established patterns for component APIs
- Maintain consistent spacing and typography

#### 2. Accessibility First
- Always include proper ARIA attributes
- Test with screen readers
- Ensure keyboard navigation works
- Maintain color contrast ratios

#### 3. Performance
- Use CSS custom properties for theming
- Minimize bundle size with tree shaking
- Optimize for critical rendering path

#### 4. Responsiveness
- Mobile-first approach
- Use flexible units (rem, %, vw/vh)
- Test across different screen sizes

### Theme Customization

Override CSS custom properties to customize the theme:

```css
:root {
  --color-primary-600: #your-brand-color;
  --font-family-sans: 'Your Font', sans-serif;
  --radius-md: 8px;
}
```

### Dark Mode Support

Components automatically adapt to dark mode based on user preference:

```css
@media (prefers-color-scheme: dark) {
  /* Dark theme variables */
}
```

## Component API Reference

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Visual variant |
| size | string | 'md' | Size variant |
| loading | boolean | false | Loading state |
| disabled | boolean | false | Disabled state |
| fullWidth | boolean | false | Full width |
| leftIcon | ReactNode | - | Left icon |
| rightIcon | ReactNode | - | Right icon |

### Input

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Visual variant |
| size | string | 'md' | Size variant |
| label | string | - | Input label |
| error | string/boolean | - | Error state |
| helperText | string | - | Helper text |
| clearable | boolean | false | Show clear button |

### Card

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Visual variant |
| shadow | string | 'sm' | Shadow depth |
| interactive | boolean | false | Clickable |
| loading | boolean | false | Loading state |
| hoverable | boolean | false | Hover effects |

## Testing

### Accessibility Testing
- Use screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Verify color contrast ratios
- Check focus management

### Visual Regression Testing
- Test across browsers
- Verify responsive behavior
- Check dark mode support
- Validate print styles

## Migration Guide

### From Legacy Components

1. **Identify component usage**
2. **Map to new component API**
3. **Update imports and props**
4. **Test accessibility features**
5. **Verify visual consistency**

Example migration:
```tsx
// Before (legacy)
<button className="main-button primary">
  Save
</button>

// After (design system)
<Button variant="primary">
  Save
</Button>
```

## Contributing

### Adding New Components

1. **Create component file** in `/components/`
2. **Add CSS file** with design tokens
3. **Include TypeScript interfaces**
4. **Add accessibility features**
5. **Update index.ts exports**
6. **Add to showcase page**
7. **Write tests**

### Design Token Changes

1. **Update tokens.css**
2. **Verify component compatibility**
3. **Test across themes**
4. **Update documentation**

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Screen readers, keyboard navigation
- **Performance**: Optimized for slower devices

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [Material Design System](https://material.io/design)