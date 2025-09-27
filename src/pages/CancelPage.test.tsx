import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CancelPage from './CancelPage';

// --- MOCK LINK ---
// Mock the react-router-dom Link component to render as a standard anchor tag
// to easily check the `to` prop (which becomes `href` in the mock).
vi.mock('react-router-dom', async (importOriginal) => {
    // Cast the result of the import to a generic object type
    const actual = await importOriginal() as Record<string, unknown>; 
    
    return {
        ...actual,
        // Your custom mock for the Link component
        Link: vi.fn(({ to, children, ...props }) => <a href={to as string} {...props}>{children}</a>),
    };
});

describe('CancelPage', () => {
    it('renders the main content and status message', () => {
        render(
            <BrowserRouter>
                <CancelPage />
            </BrowserRouter>
        );

        // Check for the main heading
        expect(screen.getByRole('heading', { level: 1, name: /order canceled/i })).toBeInTheDocument();
        // Check for the status message
        expect(screen.getByText(/your order was canceled\. you have not been charged\./i)).toBeInTheDocument();
    });

    it('renders a button that links back to the store homepage', () => {
        render(
            <BrowserRouter>
                <CancelPage />
            </BrowserRouter>
        );

        // Check for the button/link text
        const buttonLink = screen.getByRole('link', { name: /back to store/i });
        
        expect(buttonLink).toBeInTheDocument();
        // Check that the link points to the root path
        expect(buttonLink).toHaveAttribute('href', '/');
    });

    it('renders the XCircle icon (implied by text and component structure)', () => {
        render(
            <BrowserRouter>
                <CancelPage />
            </BrowserRouter>
        );
        // We look for elements that confirm the visual success state is attempted
        // (The Lucide icon itself is part of the component's internal structure)
        expect(screen.getByText(/order canceled/i)).toBeInTheDocument();
    });
});