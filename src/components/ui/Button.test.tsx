import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button'; // Assuming correct path

describe('Button', () => {
  // Test Case 1: Renders the button with the correct text
  it('renders correctly with default content', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  // Test Case 2: Applies the correct default Tailwind classes
  it('applies default classes from Button.tsx', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    // Check for a class defined in the default variant of Button.tsx
    expect(button).toHaveClass('bg-gray-900'); 
    // Check for a class defined in the default size of Button.tsx
    expect(button).toHaveClass('h-11'); 
  });

  // Test Case 3: Applies classes for a different variant
  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    // Check for a class defined in the destructive variant of Button.tsx
    expect(button).toHaveClass('bg-red-500');
  });

  // Test Case 4: Checks the disabled state
  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Cannot Click</Button>);
    const button = screen.getByRole('button', { name: /cannot click/i });
    expect(button).toBeDisabled();
    // Also checks for the style applied to disabled buttons
    expect(button).toHaveClass('disabled:opacity-50'); 
  });
});