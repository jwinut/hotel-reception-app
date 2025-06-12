// src/components/Card.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card, { CardHeader, CardBody, CardFooter } from './Card';

// Mock the useTranslation hook
jest.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'accessibility.loading': 'Loading'
      };
      return translations[key] || key;
    }
  })
}));

describe('Card Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        'card',
        'card--default',
        'card--size-md',
        'card--padding-md',
        'card--radius-md',
        'card--shadow-sm'
      );
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <h1>Title</h1>
          <p>Description</p>
        </Card>
      );
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      
      const card = screen.getByText('Content');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'outlined', 'elevated', 'filled'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Card variant={variant}>Content</Card>);
        
        const card = screen.getByText('Content');
        expect(card).toHaveClass(`card--${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<Card size={size}>Content</Card>);
        
        const card = screen.getByText('Content');
        expect(card).toHaveClass(`card--size-${size}`);
      });
    });
  });

  describe('Padding', () => {
    const paddings = ['none', 'sm', 'md', 'lg'] as const;
    
    paddings.forEach(padding => {
      it(`renders ${padding} padding correctly`, () => {
        render(<Card padding={padding}>Content</Card>);
        
        const card = screen.getByText('Content');
        expect(card).toHaveClass(`card--padding-${padding}`);
      });
    });
  });

  describe('Radius', () => {
    const radiuses = ['none', 'sm', 'md', 'lg', 'xl'] as const;
    
    radiuses.forEach(radius => {
      it(`renders ${radius} radius correctly`, () => {
        render(<Card radius={radius}>Content</Card>);
        
        const card = screen.getByText('Content');
        expect(card).toHaveClass(`card--radius-${radius}`);
      });
    });
  });

  describe('Shadow', () => {
    const shadows = ['none', 'sm', 'md', 'lg', 'xl'] as const;
    
    shadows.forEach(shadow => {
      it(`renders ${shadow} shadow correctly`, () => {
        render(<Card shadow={shadow}>Content</Card>);
        
        const card = screen.getByText('Content');
        expect(card).toHaveClass(`card--shadow-${shadow}`);
      });
    });
  });

  describe('States', () => {
    it('renders hoverable state correctly', () => {
      render(<Card hoverable>Content</Card>);
      
      const card = screen.getByText('Content');
      expect(card).toHaveClass('card--hoverable');
    });

    it('renders loading state correctly', () => {
      render(<Card loading>Content</Card>);
      
      const card = screen.getByText('Content');
      expect(card).toHaveClass('card--loading');
      expect(card).toHaveAttribute('aria-busy', 'true');
      expect(card).toHaveAttribute('aria-label', 'Loading');
      
      // Check for loading overlay and spinner
      expect(card.querySelector('.card__loading-overlay')).toBeInTheDocument();
      expect(card.querySelector('.card__spinner')).toBeInTheDocument();
      expect(card.querySelector('.card__spinner-icon')).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('renders interactive card correctly', () => {
      const onClick = jest.fn();
      
      render(
        <Card interactive onClick={onClick}>
          Interactive Content
        </Card>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveClass('card--interactive');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('handles click events on interactive cards', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onClick={onClick}>
          Clickable Content
        </Card>
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('handles Enter key on interactive cards', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onClick={onClick}>
          Keyboard Content
        </Card>
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key on interactive cards', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onClick={onClick}>
          Keyboard Content
        </Card>
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not handle click events on non-interactive cards', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card onClick={onClick}>
          Non-Interactive Content
        </Card>
      );
      
      const card = screen.getByText('Non-Interactive Content');
      await user.click(card);
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('calls custom onKeyDown handler', async () => {
      const onKeyDown = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onKeyDown={onKeyDown}>
          Content
        </Card>
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('a');
      
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes for loading state', () => {
      render(<Card loading>Loading Content</Card>);
      
      const card = screen.getByText('Loading Content');
      expect(card).toHaveAttribute('aria-busy', 'true');
      expect(card).toHaveAttribute('aria-label', 'Loading');
    });

    it('maintains custom aria-label when not loading', () => {
      render(<Card aria-label="Custom Label">Content</Card>);
      
      const card = screen.getByText('Content');
      expect(card).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('supports custom role', () => {
      render(<Card role="article">Article Content</Card>);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('supports custom tabIndex', () => {
      render(<Card tabIndex={1}>Content</Card>);
      
      const card = screen.getByText('Content');
      expect(card).toHaveAttribute('tabIndex', '1');
    });

    it('loading overlay is hidden from screen readers', () => {
      render(<Card loading>Content</Card>);
      
      const overlay = document.querySelector('.card__loading-overlay');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      
      render(<Card ref={ref}>Content</Card>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toContain('Content');
    });
  });

  describe('HTML Attributes', () => {
    it('passes through additional HTML attributes', () => {
      render(
        <Card 
          id="test-card"
          data-testid="custom-card"
          title="Card Title"
        >
          Content
        </Card>
      );
      
      const card = screen.getByText('Content');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('data-testid', 'custom-card');
      expect(card).toHaveAttribute('title', 'Card Title');
    });
  });
});

describe('CardHeader Component', () => {
  it('renders with title only', () => {
    render(<CardHeader title="Card Title" />);
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders with subtitle only', () => {
    render(<CardHeader subtitle="Card Subtitle" />);
    
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
  });

  it('renders with both title and subtitle', () => {
    render(
      <CardHeader 
        title="Main Title"
        subtitle="Subtitle Text"
      />
    );
    
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders with action element', () => {
    render(
      <CardHeader 
        title="Title"
        action={<button>Action</button>}
      />
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders custom children', () => {
    render(
      <CardHeader>
        <div>Custom Content</div>
      </CardHeader>
    );
    
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-header" title="Title" />);
    
    const header = screen.getByText('Title').closest('.card__header');
    expect(header).toHaveClass('custom-header');
  });

  it('passes through HTML attributes', () => {
    render(
      <CardHeader 
        title="Title"
        id="header-id"
        data-testid="header-test"
      />
    );
    
    const header = screen.getByText('Title').closest('.card__header');
    expect(header).toHaveAttribute('id', 'header-id');
    expect(header).toHaveAttribute('data-testid', 'header-test');
  });

  it('renders complex title and subtitle elements', () => {
    render(
      <CardHeader 
        title={<span>Complex <strong>Title</strong></span>}
        subtitle={<span>Different <em>Subtitle</em></span>}
      />
    );
    
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Different')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });
});

describe('CardBody Component', () => {
  it('renders children correctly', () => {
    render(
      <CardBody>
        <p>Body content</p>
      </CardBody>
    );
    
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardBody className="custom-body">Content</CardBody>);
    
    const body = screen.getByText('Content');
    expect(body).toHaveClass('card__body', 'custom-body');
  });

  it('passes through HTML attributes', () => {
    render(
      <CardBody id="body-id" data-testid="body-test">
        Content
      </CardBody>
    );
    
    const body = screen.getByText('Content');
    expect(body).toHaveAttribute('id', 'body-id');
    expect(body).toHaveAttribute('data-testid', 'body-test');
  });

  it('renders complex content', () => {
    render(
      <CardBody>
        <div>
          <h4>Section Title</h4>
          <p>Section content</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </CardBody>
    );
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

describe('CardFooter Component', () => {
  it('renders with default alignment (right)', () => {
    render(
      <CardFooter>
        <button>Footer Button</button>
      </CardFooter>
    );
    
    const footer = screen.getByRole('button').parentElement;
    expect(footer).toHaveClass('card__footer', 'card__footer--right');
  });

  it('renders with different alignments', () => {
    const alignments = ['left', 'center', 'right', 'between'] as const;
    
    alignments.forEach(align => {
      const { container } = render(
        <CardFooter align={align}>
          <span>Content</span>
        </CardFooter>
      );
      
      const footer = container.querySelector('.card__footer');
      expect(footer).toHaveClass(`card__footer--${align}`);
    });
  });

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Content</CardFooter>);
    
    const footer = screen.getByText('Content');
    expect(footer).toHaveClass('card__footer', 'custom-footer');
  });

  it('passes through HTML attributes', () => {
    render(
      <CardFooter id="footer-id" data-testid="footer-test">
        Content
      </CardFooter>
    );
    
    const footer = screen.getByText('Content');
    expect(footer).toHaveAttribute('id', 'footer-id');
    expect(footer).toHaveAttribute('data-testid', 'footer-test');
  });

  it('renders multiple action buttons', () => {
    render(
      <CardFooter>
        <button>Cancel</button>
        <button>Save</button>
      </CardFooter>
    );
    
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});

describe('Card Composition', () => {
  it('renders complete card with all components', () => {
    render(
      <Card>
        <CardHeader 
          title="Card Title"
          subtitle="Card Subtitle"
          action={<button>Action</button>}
        />
        <CardBody>
          <p>This is the card body content.</p>
        </CardBody>
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      </Card>
    );
    
    // Check all parts are rendered
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    expect(screen.getByText('This is the card body content.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('works with interactive card containing all components', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Card interactive onClick={onClick}>
        <CardHeader title="Interactive Card" />
        <CardBody>Click me!</CardBody>
        <CardFooter>
          <span>Footer</span>
        </CardFooter>
      </Card>
    );
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Interactive Card')).toBeInTheDocument();
    expect(screen.getByText('Click me!')).toBeInTheDocument();
  });
});