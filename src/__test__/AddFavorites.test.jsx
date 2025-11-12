import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import Event from '../pages/events/Event';
import { addDoc, deleteDoc, getDocs, collection, query, where, doc } from 'firebase/firestore';

// Mock Firebase and other dependencies
jest.mock('../firebase/firebase', () => ({
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(), // Add this line - mock the doc function
    serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

// Mock react-spinners
jest.mock('react-spinners', () => ({
    ClipLoader: () => <div data-testid="clip-loader">Loading...</div>
}));

// Mock components
jest.mock('../components/EventModal', () => () => <div data-testid="event-modal">Event Modal</div>);
jest.mock('../components/LoadingOverlay', () => ({ isLoading, message }) =>
    isLoading ? <div data-testid="loading-overlay">{message}</div> : null
);
jest.mock('../components/PageLoading', () => () => <div data-testid="page-loading">Page Loading...</div>);

// Mock custom hooks with stable data references
const mockEvents = [
    {
        id: 'event1',
        event_name: 'Test Wedding',
        user_id: 'planner1',
        event_date: { date_value: '2024-12-31', date_preview: ['Dec 31, 2024'] },
        event_time: { previewStartAndEnd: '6:00 PM - 10:00 PM', valueStartAndEnd: ['18:00', '22:00'] },
        event_location: 'Test Venue',
        event_budget: 50000,
        event_description: 'Test wedding description',
        event_categories: [{ label: 'Catering' }, { label: 'Photography' }],
        status: 'active'
    }
];

const mockSuppliers = [
    {
        id: 'supplier1',
        supplier_name: 'Test Supplier',
        supplier_type: { label: 'Catering' },
        is_verified: true
    }
];

const mockServices = [
    {
        id: 'service1',
        supplier_id: 'supplier1',
        service_name: 'Test Service'
    }
];

jest.mock('../hooks/useEvents', () => ({
    useFetchEvents: () => ({
        events: mockEvents,
        isLoading: false
    }),
    useDeleteEvent: () => ({
        deleteEvent: jest.fn()
    })
}));

jest.mock('../hooks/useApplication', () => ({
    useFetchAllApplication: () => ({
        applications: [],
        isLoading: false
    })
}));

jest.mock('../hooks/useContract', () => ({
    useFetchContract: () => ({
        contracts: []
    })
}));

jest.mock('../hooks/useTransaction', () => ({
    useFetchAllTransaction: () => ({
        transactions: []
    })
}));

jest.mock('../hooks/useSupplier', () => ({
    useFetchSuppliers: () => ({
        suppliers: mockSuppliers,
        isLoading: false
    }),
    useFetchSupplierServices: () => ({
        services: mockServices
    })
}));

// Mock react-head Title component
jest.mock('react-head', () => ({
    HeadProvider: ({ children }) => children,
    Title: () => null
}));

// Mock the constants
jest.mock('../constants/categories', () => ({
    eventStatusStyles: {
        planning: 'bg-gray-100 text-gray-800',
        open: 'bg-green-100 text-green-800',
        in_progress: 'bg-blue-100 text-blue-800',
        payment_pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-purple-100 text-purple-800'
    }
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    CalendarDays: () => <div data-testid="calendar-icon">Calendar</div>,
    MapPin: () => <div data-testid="map-icon">Map</div>,
    CircleDollarSign: () => <div data-testid="dollar-icon">Dollar</div>,
    Trash: () => <div data-testid="trash-icon">Trash</div>,
    Users: () => <div data-testid="users-icon">Users</div>,
    MessageCircleMore: () => <div data-testid="message-icon">Message</div>,
    Heart: () => <div data-testid="heart-icon">Heart</div>,
    CircleCheck: () => <div data-testid="check-icon">Check</div>,
    AlertTriangle: () => <div data-testid="alert-icon">Alert</div>
}));

const mockUserData = {
    id: 'supplier1',
    role: 'Supplier',
    verification_status: 'verified'
};

// Create a stable date for testing to avoid infinite loops
const stableDate = new Date('2024-01-01T00:00:00.000Z');

// Mock Date to return a stable value
beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(stableDate);
});

afterAll(() => {
    jest.useRealTimers();
});

const renderComponent = () => {
    return render(
        <HeadProvider>
            <BrowserRouter>
                <Event userData={mockUserData} />
            </BrowserRouter>
        </HeadProvider>
    );
};

describe('Add to Favorites Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock onSnapshot for favorites to return stable data
        const mockOnSnapshot = require('firebase/firestore').onSnapshot;
        mockOnSnapshot.mockImplementation((collectionRef, callback) => {
            callback({
                docs: []
            });
            return jest.fn(); // unsubscribe function
        });

        // Mock collection to return a mock object instead of string
        collection.mockImplementation(() => ({
            type: 'collection',
            path: 'favorites'
        }));

        query.mockImplementation(() => ({
            type: 'query',
            path: 'favorites'
        }));

        where.mockImplementation(() => 'where-clause');

        // Mock doc function
        doc.mockImplementation((db, collectionName, id) => ({
            type: 'doc',
            path: `${collectionName}/${id}`,
            id: id
        }));
    });

    // TC-92: Add Event to Favorites Successfully
    test('TC-92: Should add event to favorites when heart button is clicked', async () => {
        // Mock addDoc to resolve successfully
        addDoc.mockResolvedValueOnce({ id: 'favorite1' });

        renderComponent();

        // Wait for events to load
        await waitFor(() => {
            expect(screen.getByText('Test Wedding')).toBeInTheDocument();
        });

        // Find the heart button using the test id from our mock
        const heartButtons = screen.getAllByTestId('heart-icon');
        expect(heartButtons.length).toBeGreaterThan(0);

        // Get the parent button element
        const heartButton = heartButtons[0].closest('button');
        expect(heartButton).toBeInTheDocument();

        // Click the heart button
        fireEvent.click(heartButton);

        // Verify addDoc was called with correct parameters
        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(expect.any(Object), {
                user_id: 'supplier1',
                event_id: 'event1',
                isActive: true,
                created_at: 'mock-timestamp'
            });
        });
    });

    // TC-93: Remove Event from Favorites
    test('TC-93: Should remove event from favorites when heart button is clicked again', async () => {
        // Mock existing favorite with stable data
        const mockOnSnapshot = require('firebase/firestore').onSnapshot;
        mockOnSnapshot.mockImplementation((collectionRef, callback) => {
            callback({
                docs: [{
                    id: 'favorite1',
                    data: () => ({
                        user_id: 'supplier1',
                        event_id: 'event1',
                        isActive: true
                    })
                }]
            });
            return jest.fn();
        });

        // Mock getDocs to return existing favorite document
        const mockQuerySnapshot = {
            forEach: jest.fn((callback) => {
                callback({
                    id: 'favorite1',
                    ref: 'favorite-ref'
                });
            })
        };
        getDocs.mockResolvedValueOnce(mockQuerySnapshot);
        deleteDoc.mockResolvedValueOnce();

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Test Wedding')).toBeInTheDocument();
        });

        // Find the heart button
        const heartButtons = screen.getAllByTestId('heart-icon');
        const heartButton = heartButtons[0].closest('button');
        expect(heartButton).toBeInTheDocument();

        // Click the heart button
        fireEvent.click(heartButton);

        // Verify deleteDoc was called with the correct document reference
        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    // TC-94: Handle Favorites Error Gracefully
    test('TC-94: Should handle favorites operation error gracefully', async () => {
        // Mock addDoc to reject with error
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        addDoc.mockRejectedValueOnce(new Error('Firestore error'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Test Wedding')).toBeInTheDocument();
        });

        // Find the heart button
        const heartButtons = screen.getAllByTestId('heart-icon');
        const heartButton = heartButtons[0].closest('button');
        expect(heartButton).toBeInTheDocument();

        // Click the heart button
        fireEvent.click(heartButton);

        // Verify error is logged
        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
        });

        consoleError.mockRestore();
    });
});