import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Event from '../pages/events/Event';

// Mock all dependencies at the top
jest.mock('../firebase/firebase', () => ({
    db: {}
}));

jest.mock('../hooks/useEvents', () => ({
    useFetchEvents: jest.fn(),
    useDeleteEvent: jest.fn()
}));

jest.mock('../hooks/useApplication', () => ({
    useFetchAllApplication: jest.fn()
}));

jest.mock('../hooks/useContract', () => ({
    useFetchContract: jest.fn()
}));

jest.mock('../hooks/useTransaction', () => ({
    useFetchAllTransaction: jest.fn()
}));

jest.mock('../hooks/useSupplier', () => ({
    useFetchSuppliers: jest.fn(),
    useFetchSupplierServices: jest.fn()
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

// Fix the onSnapshot mock to return an unsubscribe function
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    onSnapshot: jest.fn(() => jest.fn()), // This returns an unsubscribe function
    serverTimestamp: jest.fn(),
    addDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    deleteDoc: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock('../components/EventModal', () => () => <div>Event Modal</div>);
jest.mock('../components/LoadingOverlay', () => () => <div>Loading Overlay</div>);
jest.mock('../components/PageLoading', () => () => <div>Page Loading</div>);

jest.mock('lucide-react', () => ({
    CalendarDays: () => 'CalendarDays',
    MapPin: () => 'MapPin',
    CircleDollarSign: () => 'CircleDollarSign',
    Trash: () => 'Trash',
    Users: () => 'Users',
    MessageCircleMore: () => 'MessageCircleMore',
    Heart: () => 'Heart',
    CircleCheck: () => 'CircleCheck',
    AlertTriangle: () => 'AlertTriangle'
}));

jest.mock('react-spinners', () => ({
    ClipLoader: () => <div>ClipLoader</div>
}));

jest.mock('react-head', () => ({
    Title: () => <title>Test Title</title>
}));

// Import mocked hooks after mocking
const { useFetchEvents, useDeleteEvent } = require('../hooks/useEvents');
const { useFetchAllApplication } = require('../hooks/useApplication');
const { useFetchContract } = require('../hooks/useContract');
const { useFetchAllTransaction } = require('../hooks/useTransaction');
const { useFetchSuppliers, useFetchSupplierServices } = require('../hooks/useSupplier');

const mockUserData = {
    id: 'user123',
    role: 'Supplier',
    verification_status: 'verified'
};

// Create events with future dates to pass the filtering logic
const mockEvents = [
    {
        id: 'event1',
        event_name: 'Wedding Event',
        event_location: 'Manila',
        event_date: {
            date_value: '2024-12-31', // Future date
            date_preview: ['Dec 31, 2024']
        },
        event_time: {
            valueStartAndEnd: ['10:00', '18:00'],
            previewStartAndEnd: '10:00 AM - 6:00 PM'
        },
        event_budget: 50000,
        event_description: 'A beautiful wedding event',
        event_categories: [{ label: 'Catering' }, { label: 'Photography' }],
        user_id: 'planner123',
        status: 'active' // Must be active to pass filtering
    }
];

const mockSupplierData = {
    id: 'user123',
    supplier_name: 'Test Catering',
    supplier_type: { label: 'Catering' },
    is_verified: true
};

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <Event userData={mockUserData} />
        </BrowserRouter>
    );
};

describe('Event Application Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Date to ensure events are considered "active"
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01')); // Set current date to before event date

        useFetchEvents.mockReturnValue({
            events: mockEvents,
            isLoading: false
        });

        useFetchAllApplication.mockReturnValue({
            applications: [],
            isLoading: false
        });

        useFetchContract.mockReturnValue({
            contracts: []
        });

        useFetchAllTransaction.mockReturnValue({
            transactions: []
        });

        useFetchSupplierServices.mockReturnValue({
            services: [{ id: 'service1', supplier_id: 'user123' }]
        });

        useFetchSuppliers.mockReturnValue({
            suppliers: [mockSupplierData],
            isLoading: false
        });

        useDeleteEvent.mockReturnValue({
            deleteEvent: jest.fn()
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Test Case ID: TC-88
    test('TC-88: Supplier with matching service category can apply for event', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Wedding Event')).toBeInTheDocument();
        });

        // Use getByText to find the button by its exact text content
        const applyButton = screen.getByText('Apply');
        expect(applyButton).toBeEnabled();
        expect(applyButton).toHaveTextContent('Apply');
    });

    // Test Case ID: TC-89  
    test('TC-89: Supplier with non-matching service category cannot apply', async () => {
        const nonMatchingSupplier = {
            ...mockSupplierData,
            supplier_type: { label: 'Florist' }
        };

        useFetchSuppliers.mockReturnValue({
            suppliers: [nonMatchingSupplier],
            isLoading: false
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Wedding Event')).toBeInTheDocument();
        });

        // Use the exact text with the curly apostrophe that appears in the DOM
        const applyButton = screen.getByText("Your shop isn’t eligible for this event.");
        expect(applyButton).toBeDisabled();
        expect(applyButton).toHaveTextContent("Your shop isn’t eligible for this event.");
    });

    // Test Case ID: TC-90
    test('TC-90: Unverified supplier cannot apply for events', async () => {
        const unverifiedSupplier = {
            ...mockSupplierData,
            is_verified: false
        };

        useFetchSuppliers.mockReturnValue({
            suppliers: [unverifiedSupplier],
            isLoading: false
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Wedding Event')).toBeInTheDocument();
        });

        // Use getByText with the exact text
        const applyButton = screen.getByText('Account not verified');
        expect(applyButton).toBeDisabled();
        expect(applyButton).toHaveTextContent('Account not verified');
    });

    // Test Case ID: TC-91
    test('TC-91: Supplier cannot apply twice to same event', async () => {
        const existingApplications = [{
            supplier_id: 'user123',
            event_id: 'event1',
            status: 'Pending'
        }];

        useFetchAllApplication.mockReturnValue({
            applications: existingApplications,
            isLoading: false
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Wedding Event')).toBeInTheDocument();
        });

        // Use getByText with the exact text
        const applyButton = screen.getByText('Pending');
        expect(applyButton).toBeDisabled();
        expect(applyButton).toHaveTextContent('Pending');
    });

    // Test Case ID: TC-92
    // test('TC-92: Supplier without services cannot apply for events', async () => {
    //     useFetchSupplierServices.mockReturnValue({
    //         services: [] // No services
    //     });

    //     renderComponent();

    //     await waitFor(() => {
    //         expect(screen.getByText('Wedding Event')).toBeInTheDocument();
    //     });

    //     // For the "no services" case, it's a Link component, not a button
    //     const applyLink = screen.getByText('Services required to apply');
    //     expect(applyLink).toBeInTheDocument();
    //     expect(applyLink).toHaveAttribute('href', '/shop');
    // });

    // // Test Case ID: TC-93
    // test('TC-93: Supplier without shop name cannot apply for events', async () => {
    //     const noShopSupplier = {
    //         ...mockSupplierData,
    //         supplier_name: '' // Empty shop name
    //     };

    //     useFetchSuppliers.mockReturnValue({
    //         suppliers: [noShopSupplier],
    //         isLoading: false
    //     });

    //     renderComponent();

    //     await waitFor(() => {
    //         expect(screen.getByText('Wedding Event')).toBeInTheDocument();
    //     });

    //     // For the "no shop name" case, it's also a Link component
    //     const applyLink = screen.getByText('Need shop to apply');
    //     expect(applyLink).toBeInTheDocument();
    //     expect(applyLink).toHaveAttribute('href', '/shop');
    // });
});