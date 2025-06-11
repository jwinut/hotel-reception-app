// src/pages/DesignSystemShowcase.tsx
import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  NotificationBadge,
} from '../components';
import { useTranslation } from '../hooks/useTranslation';
import './DesignSystemShowcase.css';

const DesignSystemShowcase: React.FC = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="showcase">
      <div className="showcase__header">
        <h1>Design System Showcase</h1>
        <p>Comprehensive collection of reusable UI components</p>
      </div>

      {/* Color Palette */}
      <section className="showcase__section">
        <h2>Color Palette</h2>
        <div className="color-grid">
          <div className="color-group">
            <h3>Primary</h3>
            <div className="color-swatches">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div
                  key={shade}
                  className="color-swatch"
                  style={{ backgroundColor: `var(--color-primary-${shade})` }}
                  title={`Primary ${shade}`}
                >
                  {shade}
                </div>
              ))}
            </div>
          </div>
          
          <div className="color-group">
            <h3>Success</h3>
            <div className="color-swatches">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div
                  key={shade}
                  className="color-swatch"
                  style={{ backgroundColor: `var(--color-success-${shade})` }}
                  title={`Success ${shade}`}
                >
                  {shade}
                </div>
              ))}
            </div>
          </div>
          
          <div className="color-group">
            <h3>Warning</h3>
            <div className="color-swatches">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div
                  key={shade}
                  className="color-swatch"
                  style={{ backgroundColor: `var(--color-warning-${shade})` }}
                  title={`Warning ${shade}`}
                >
                  {shade}
                </div>
              ))}
            </div>
          </div>
          
          <div className="color-group">
            <h3>Error</h3>
            <div className="color-swatches">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                <div
                  key={shade}
                  className="color-swatch"
                  style={{ backgroundColor: `var(--color-error-${shade})` }}
                  title={`Error ${shade}`}
                >
                  {shade}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="showcase__section">
        <h2>Typography</h2>
        <div className="typography-grid">
          <div className="typography-example">
            <h1 style={{ fontSize: 'var(--font-size-6xl)', fontWeight: 'var(--font-weight-bold)' }}>
              Heading 1 (6xl/Bold)
            </h1>
          </div>
          <div className="typography-example">
            <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-semibold)' }}>
              Heading 2 (4xl/Semibold)
            </h2>
          </div>
          <div className="typography-example">
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-medium)' }}>
              Heading 3 (2xl/Medium)
            </h3>
          </div>
          <div className="typography-example">
            <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-normal)' }}>
              Body text (base/Normal) - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div className="typography-example">
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Small text (sm/Secondary) - Supporting information and metadata
            </small>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="showcase__section">
        <h2>Buttons</h2>
        
        <div className="component-group">
          <h3>Variants</h3>
          <div className="component-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
          </div>
        </div>

        <div className="component-group">
          <h3>Sizes</h3>
          <div className="component-row">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>

        <div className="component-group">
          <h3>Shapes</h3>
          <div className="component-row">
            <Button shape="rectangle">Rectangle</Button>
            <Button shape="rounded">Rounded</Button>
            <Button shape="pill">Pill</Button>
            <Button shape="circle" iconOnly>●</Button>
          </div>
        </div>

        <div className="component-group">
          <h3>States</h3>
          <div className="component-row">
            <Button>Normal</Button>
            <Button loading loadingText="Loading...">Loading</Button>
            <Button disabled>Disabled</Button>
            <Button 
              leftIcon={<span>👍</span>}
            >
              With Icon
            </Button>
          </div>
        </div>

        <div className="component-group">
          <h3>Button Groups</h3>
          <ButtonGroup>
            <Button variant="secondary">Left</Button>
            <Button variant="secondary">Center</Button>
            <Button variant="secondary">Right</Button>
          </ButtonGroup>
          
          <ButtonGroup attached>
            <Button variant="primary">Attached</Button>
            <Button variant="primary">Group</Button>
          </ButtonGroup>
        </div>
      </section>

      {/* Inputs */}
      <section className="showcase__section">
        <h2>Inputs</h2>
        
        <div className="component-group">
          <h3>Variants</h3>
          <div className="input-grid">
            <Input
              variant="default"
              label="Default Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              variant="filled"
              label="Filled Input"
              placeholder="Enter text..."
            />
            <Input
              variant="outlined"
              label="Outlined Input"
              placeholder="Enter text..."
            />
            <Input
              variant="underlined"
              label="Underlined Input"
              placeholder="Enter text..."
            />
          </div>
        </div>

        <div className="component-group">
          <h3>Sizes</h3>
          <div className="input-grid">
            <Input size="sm" label="Small" placeholder="Small input" />
            <Input size="md" label="Medium" placeholder="Medium input" />
            <Input size="lg" label="Large" placeholder="Large input" />
          </div>
        </div>

        <div className="component-group">
          <h3>States</h3>
          <div className="input-grid">
            <Input
              label="Normal"
              placeholder="Normal state"
              helperText="This is helper text"
            />
            <Input
              label="Error"
              placeholder="Error state"
              error="This field has an error"
            />
            <Input
              label="Success"
              placeholder="Success state"
              success
              helperText="Validation passed"
            />
            <Input
              label="Loading"
              placeholder="Loading state"
              loading
            />
            <Input
              label="Disabled"
              placeholder="Disabled state"
              disabled
            />
          </div>
        </div>

        <div className="component-group">
          <h3>With Icons & Addons</h3>
          <div className="input-grid">
            <Input
              label="With Left Icon"
              placeholder="Search..."
              leftIcon={<span>🔍</span>}
            />
            <Input
              label="With Right Icon"
              placeholder="Password"
              type="password"
              rightIcon={<span>👁️</span>}
            />
            <Input
              label="Clearable"
              placeholder="Type to clear"
              clearable
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClear={() => setInputValue('')}
            />
            <Input
              label="With Addons"
              placeholder="Amount"
              leftAddon="$"
              rightAddon="USD"
            />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="showcase__section">
        <h2>Cards</h2>
        
        <div className="card-grid">
          <Card variant="default">
            <CardHeader
              title="Default Card"
              subtitle="Basic card with default styling"
            />
            <CardBody>
              <p>This is the card body content. Cards are flexible containers for displaying content.</p>
            </CardBody>
            <CardFooter>
              <Button size="sm" variant="primary">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined" shadow="none">
            <CardHeader
              title="Outlined Card"
              subtitle="Card with border outline"
            />
            <CardBody>
              <p>This card uses the outlined variant with no shadow.</p>
            </CardBody>
          </Card>

          <Card variant="elevated" shadow="lg" hoverable>
            <CardHeader
              title="Elevated Card"
              subtitle="Card with large shadow"
              action={<Badge variant="primary">New</Badge>}
            />
            <CardBody>
              <p>This card has elevation and hover effects.</p>
            </CardBody>
          </Card>

          <Card variant="filled" interactive onClick={() => alert('Card clicked!')}>
            <CardHeader
              title="Interactive Card"
              subtitle="Clickable card"
            />
            <CardBody>
              <p>This card is interactive and responds to clicks and keyboard navigation.</p>
            </CardBody>
          </Card>

          <Card loading>
            <CardHeader
              title="Loading Card"
              subtitle="Card in loading state"
            />
            <CardBody>
              <p>This card shows a loading overlay.</p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="showcase__section">
        <h2>Badges</h2>
        
        <div className="component-group">
          <h3>Variants</h3>
          <div className="component-row">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>

        <div className="component-group">
          <h3>Sizes</h3>
          <div className="component-row">
            <Badge size="xs">XS</Badge>
            <Badge size="sm">SM</Badge>
            <Badge size="md">MD</Badge>
            <Badge size="lg">LG</Badge>
          </div>
        </div>

        <div className="component-group">
          <h3>Shapes</h3>
          <div className="component-row">
            <Badge shape="rounded">Rounded</Badge>
            <Badge shape="pill">Pill</Badge>
            <Badge shape="square">Square</Badge>
          </div>
        </div>

        <div className="component-group">
          <h3>Outline</h3>
          <div className="component-row">
            <Badge variant="primary" outline>Primary</Badge>
            <Badge variant="success" outline>Success</Badge>
            <Badge variant="warning" outline>Warning</Badge>
            <Badge variant="error" outline>Error</Badge>
          </div>
        </div>

        <div className="component-group">
          <h3>Dots</h3>
          <div className="component-row">
            <Badge dot variant="primary" />
            <Badge dot variant="success" />
            <Badge dot variant="warning" />
            <Badge dot variant="error" />
          </div>
        </div>

        <div className="component-group">
          <h3>Notification Badges</h3>
          <div className="component-row">
            <NotificationBadge count={5}>
              <Button>Messages</Button>
            </NotificationBadge>
            
            <NotificationBadge count={99} max={99}>
              <Button>Notifications</Button>
            </NotificationBadge>
            
            <NotificationBadge count={1000} max={999}>
              <Button>Updates</Button>
            </NotificationBadge>
            
            <NotificationBadge count={0} showZero>
              <Button>Zero Count</Button>
            </NotificationBadge>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="showcase__section">
        <h2>Interactive Demo</h2>
        <Card>
          <CardHeader
            title="Component Interaction"
            subtitle="Try out different component combinations"
          />
          <CardBody>
            <div className="demo-grid">
              <Input
                label="Search Hotels"
                placeholder="Enter hotel name..."
                leftIcon={<span>🏨</span>}
                clearable
              />
              
              <ButtonGroup>
                <Button variant="primary" onClick={handleLoadingDemo}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button variant="secondary">
                  Filter
                </Button>
              </ButtonGroup>
              
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <span>Status:</span>
                <Badge variant="success">Available</Badge>
                <Badge variant="warning">Limited</Badge>
                <Badge variant="error">Sold Out</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

export default DesignSystemShowcase;