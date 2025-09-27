import { describe, it, expect } from 'vitest';
import { cn } from './utils'; // Import the utility function

describe('cn utility', () => {
  // Test Case 1: Simple combination of classes
  it('should correctly combine simple class names', () => {
    expect(cn('text-red-500', 'font-bold')).toBe('text-red-500 font-bold');
  });

  // Test Case 2: Class merging with overrides (tailwind-merge functionality)
  it('should override conflicting classes based on the tailwind-merge logic', () => {
    // 'p-4' should be overridden by 'p-6'
    expect(cn('p-4 text-lg', 'p-6')).toBe('text-lg p-6');
    // 'bg-white' should be overridden by 'bg-gray-900'
    expect(cn('bg-white hover:bg-black', 'bg-gray-900')).toBe('hover:bg-black bg-gray-900');
  });

  // Test Case 3: Handling conditional classes (clsx functionality)
  it('should handle conditional classes passed as objects', () => {
    const isActive = true;
    const isError = false;
    expect(cn('base', { 'active-class': isActive, 'error-class': isError }, 'final-class')).toBe('base active-class final-class');
  });

  // Test Case 4: Handling empty or null inputs gracefully
  it('should filter out empty, null, and undefined values', () => {
    expect(cn(null, undefined, 'class-a', false, 0, 'class-b')).toBe('class-a class-b');
  });

  // Test Case 5: Complex combination of inputs
  it('should correctly process a complex mix of inputs including overrides', () => {
    const size = 'lg';
    const hasBorder = true;
    expect(cn(
      'flex items-center',
      `h-${size}`, // h-lg
      { 'border-2': hasBorder, 'p-10': true, 'p-4': false }, // border-2, p-10
      'p-4' // overridden by p-10
    )).toBe('flex items-center h-lg border-2 p-4'); 
    // Note: tailwind-merge often removes the older class, so 'p-10' is lost if 'p-4' comes last and is the same group.
    // Testing with an actual conflict merge:
    expect(cn(
      'text-sm', 
      'font-medium',
      { 'text-lg': true }, // overrides text-sm
      'text-gray-900'
    )).toBe('font-medium text-lg text-gray-900');
  });
});