// src/tests/setup.ts
// src/test/setup.ts
import '@testing-library/jest-dom';

// Optional: Mock the window.matchMedia function used by hooks like `useMediaQuery`
// This prevents errors when testing components that rely on media queries in a JSDOM environment.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});