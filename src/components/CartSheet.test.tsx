import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppContext, useApp } from '../contexts/AppContext'; // Import both
import { CartSheet } from './CartSheet';

// --- MOCK DEPENDENCIES ---
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal() as Record<string, unknown>;
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

// Mock the useApp hook directly
vi.mock('../contexts/AppContext', async (importOriginal) => {
    const actual = await importOriginal() as Record<string, unknown>;
    return {
        ...actual,
        useApp: vi.fn(), // We will provide its implementation in beforeEach
    };
});


const MOCK_CART_ITEM = { product_id: 1, title: 'Modern Chair', price: 2500, image: 'chair.jpg', quantity: 2 };
const MOCK_ADDRESS = { _id: 'a1', street: '123 Main St', city: 'Anytown', state: 'CA', postalCode: '90210', country: 'USA', isDefault: true };

// A helper to wrap the component in the necessary provider
const TestWrapper = ({ mockContext, children }: any) => (
    <AppContext.Provider value={mockContext}>
        <BrowserRouter>
            {children}
        </BrowserRouter>
    </AppContext.Provider>
);

describe('CartSheet', () => {
    let mockContext: any;
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        mockContext = {
            cartOpen: true,
            setCartOpen: vi.fn(),
            cart: [MOCK_CART_ITEM],
            changeQty: vi.fn(),
            removeFromCart: vi.fn(),
            checkout: vi.fn(),
            formatPrice: (p: number) => `₹${p.toFixed(2)}`,
            addresses: [MOCK_ADDRESS],
            selectedAddressId: MOCK_ADDRESS._id,
            setSelectedAddressId: vi.fn(),
        };
        
        // Provide the mock implementation for useApp for each test
        (useApp as vi.Mock).mockReturnValue(mockContext);
    });

    it('renders the empty cart message when cart is empty', () => {
        // Override context for this specific test
        (useApp as vi.Mock).mockReturnValue({ ...mockContext, cart: [] });
        render(<CartSheet />, { wrapper: ({ children }) => <TestWrapper mockContext={mockContext}>{children}</TestWrapper> });

        expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /discover products/i })).toBeInTheDocument();
    });

    it('renders cart items and calculates subtotal correctly', () => {
        render(<CartSheet />, { wrapper: ({ children }) => <TestWrapper mockContext={mockContext}>{children}</TestWrapper> });
        
        const cartItem = screen.getByText('Modern Chair').closest('div')!.parentElement!;
        expect(within(cartItem).getByText(/₹2500\.00/i)).toBeInTheDocument();
        expect(within(cartItem).getByText('2')).toBeInTheDocument();

        expect(screen.getByText('Subtotal').parentElement).toHaveTextContent('₹5000.00');
    });

    it('calls changeQty with correct quantity when + button is clicked', () => {
        render(<CartSheet />, { wrapper: ({ children }) => <TestWrapper mockContext={mockContext}>{children}</TestWrapper> });
    
        const cartItem = screen.getByText('Modern Chair').closest('div')!.parentElement!;
        
        // FIX: Get all buttons and select the second one, which is the "plus" button.
        const buttons = within(cartItem).getAllByRole('button');
        const plusButton = buttons[1]; // [0] is minus, [1] is plus, [2] is remove
    
        fireEvent.click(plusButton);
        expect(mockContext.changeQty).toHaveBeenCalledWith(MOCK_CART_ITEM.product_id, MOCK_CART_ITEM.quantity + 1);
    });

    it('calls checkout when "Proceed to Checkout" is clicked', () => {
        render(<CartSheet />, { wrapper: ({ children }) => <TestWrapper mockContext={mockContext}>{children}</TestWrapper> });

        const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
        fireEvent.click(checkoutButton);

        expect(mockContext.checkout).toHaveBeenCalled();
    });

    it('navigates to addresses page when "Add / Manage Addresses" is clicked', () => {
        render(<CartSheet />, { wrapper: ({ children }) => <TestWrapper mockContext={mockContext}>{children}</TestWrapper> });

        const manageButton = screen.getByRole('button', { name: /add \/ manage addresses/i });
        fireEvent.click(manageButton);

        expect(mockContext.setCartOpen).toHaveBeenCalledWith(false);
        expect(mockNavigate).toHaveBeenCalledWith('/profile/addresses');
    });
});