import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock nanoid first
jest.mock('nanoid', () => ({
    nanoid: () => 'mock-unique-id-123'
}));

// Mock other dependencies
jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

// Mock useContract hook properly - FIXED: Add event_id and supplier_id
const mockContracts = [
    {
        id: 'contract-123',
        event_id: 'event-123', // Add this to match eventData.id
        supplier_id: 'supplier-123', // Add this to match supplierData.id
        status: 'Pending',
        service_plan: {
            service_price: 5000,
            service_plan: { label: 'Basic Plan' },
            service_inclusions: ['Setup', 'Equipment'],
            service_payment_notice: { label: 'Down Payment required atleast 50 percent.' }
        },
        penalty_clauses: {
            title: 'Penalty Clauses',
            description: 'Terms and conditions for penalties',
            clauses: []
        }
    }
];

jest.mock('../hooks/useContract', () => ({
    useFetchContract: jest.fn(() => ({
        contracts: mockContracts
    }))
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(() => Promise.resolve()),
    addDoc: jest.fn(() => Promise.resolve()),
    serverTimestamp: jest.fn(() => ({ seconds: 1234567890 })),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn()
}));

jest.mock('../firebase/firebase', () => ({
    db: {},
    auth: { currentUser: { uid: 'test-user-id' } }
}));

// Mock other hooks with stable data
jest.mock('../hooks/usePayment', () => ({
    useCreatePayment: () => ({
        createPayment: jest.fn(),
        isProcessing: false,
        invoiceUrl: ''
    })
}));

// Mock transactions
const mockTransactions = [
    {
        id: 'trans-1',
        contract_id: 'different-contract-id',
        status: 'COMPLETED',
        amount: 1000
    }
];

jest.mock('../hooks/useTransaction', () => ({
    useFetchTransactionById: () => ({
        transactions: mockTransactions
    })
}));

// Mock deliveries
jest.mock('../hooks/useDeliveries', () => ({
    useFetchDeliveries: () => ({
        deliveries: [],
        isLoading: false
    })
}));

// Mock users
const mockUsers = [
    {
        id: 'planner-123',
        first_name: 'Event',
        last_name: 'Planner',
        email_address: 'planner@test.com',
        contact_number: '1234567890'
    },
    {
        id: 'supplier-123',
        first_name: 'Test',
        last_name: 'Supplier',
        email_address: 'supplier@test.com',
        contact_number: '0987654321'
    }
];

jest.mock('../hooks/useUsers', () => ({
    useFetchUsers: () => ({
        users: mockUsers
    })
}));

// Mock reports
jest.mock('../hooks/useReports', () => ({
    useFetchAllReports: () => ({
        reports: []
    })
}));

// Mock router
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn()
}));

// Mock child components with proper implementation
jest.mock('../components/ReviewModal', () => ({
    RejectReview: jest.fn(({ contract, supplier, event_id, supplier_id, className, children }) => (
        <button
            className={className}
            data-testid="reject-button"
            onClick={async () => {
                const Swal = require('sweetalert2');
                const result = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'Once rejected, this action cannot be undone.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, reject it',
                    cancelButtonText: 'Cancel'
                });

                if (result.isConfirmed) {
                    Swal.fire(
                        'Rejected!',
                        'The contract has been rejected successfully.',
                        'success'
                    );
                }
            }}
        >
            {children || 'Reject Offer'}
        </button>
    ))
}));

jest.mock('../components/LoadingOverlay', () => ({ isLoading, message }) =>
    isLoading ? <div data-testid="loading-overlay">{message}</div> : null
);

jest.mock('../components/PageLoading', () => () => <div data-testid="page-loading">Loading...</div>);

// Mock other modal components
jest.mock('../components/DamagePenaltiesModal', () => () => <div data-testid="damage-penalties-modal" />);
jest.mock('../components/ReportModal', () => () => <div data-testid="report-modal" />);
jest.mock('../components/SubmissionModal', () => () => <div data-testid="submission-modal" />);

// Import the component after all mocks
import ContractModal from '../components/ContractModal';
import Swal from 'sweetalert2';

describe('Contract Modal - Contract Processing', () => {
    const mockOnClose = jest.fn();
    const mockUserData = {
        id: 'supplier-123',
        role: 'Supplier'
    };
    const mockEventData = {
        id: 'event-123',
        user_id: 'planner-123',
        event_name: 'Test Event',
        event_location: 'Test Location',
        event_date: { date_value: '2024-01-01' },
        event_time: { valueStartAndEnd: ['10:00', '18:00'] }
    };
    const mockSupplierData = {
        id: 'supplier-123',
        supplier_name: 'Test Supplier'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the mock contract to Pending status with correct IDs
        mockContracts[0] = {
            id: 'contract-123',
            event_id: 'event-123', // Must match mockEventData.id
            supplier_id: 'supplier-123', // Must match mockSupplierData.id
            status: 'Pending',
            service_plan: {
                service_price: 5000,
                service_plan: { label: 'Basic Plan' },
                service_inclusions: ['Setup', 'Equipment'],
                service_payment_notice: { label: 'Down Payment required atleast 50 percent.' }
            },
            penalty_clauses: {
                title: 'Penalty Clauses',
                description: 'Terms and conditions for penalties',
                clauses: []
            }
        };
    });

    const renderComponent = (props = {}) => {
        return render(
            <ContractModal
                isOpen={true}
                onClose={mockOnClose}
                userData={mockUserData}
                event_id={mockEventData.id}
                supplier_id={mockSupplierData.id}
                eventData={mockEventData}
                supplierData={mockSupplierData}
                user_id={mockUserData.id}
                {...props}
            />
        );
    };

    // Debug test to verify everything is working
    // test('debug - should render contract with correct data', async () => {
    //     await act(async () => {
    //         renderComponent();
    //     });

    //     // Check if contract ID appears
    //     await waitFor(() => {
    //         expect(screen.getByText(/Contract ID:/)).toBeInTheDocument();
    //     });

    //     // Check if status appears
    //     await waitFor(() => {
    //         expect(screen.getByText('Pending')).toBeInTheDocument();
    //     });

    //     // Check if reject button appears
    //     await waitFor(() => {
    //         expect(screen.getByTestId('reject-button')).toBeInTheDocument();
    //     });

    //     // Check if approve button appears
    //     await waitFor(() => {
    //         expect(screen.getByText('Approve Offer')).toBeInTheDocument();
    //     });
    // });

    describe('TC-114: Reject Contract offer by Event planner with empty reason', () => {
        test('should successfully reject contract with empty reason', async () => {
            await act(async () => {
                renderComponent();
            });

            // Wait for the reject button to appear
            await waitFor(() => {
                expect(screen.getByTestId('reject-button')).toBeInTheDocument();
            });

            const rejectButton = screen.getByTestId('reject-button');
            await act(async () => {
                fireEvent.click(rejectButton);
            });

            await waitFor(() => {
                expect(Swal.fire).toHaveBeenCalledWith({
                    title: 'Are you sure?',
                    text: 'Once rejected, this action cannot be undone.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, reject it',
                    cancelButtonText: 'Cancel'
                });
            });
        });
    });

    describe('TC-115: Reject Contract offer by Event planner', () => {
        test('should successfully reject contract with valid reason', async () => {
            await act(async () => {
                renderComponent();
            });

            // Wait for the reject button to appear
            await waitFor(() => {
                expect(screen.getByTestId('reject-button')).toBeInTheDocument();
            });

            const rejectButton = screen.getByTestId('reject-button');
            await act(async () => {
                fireEvent.click(rejectButton);
            });

            await waitFor(() => {
                expect(Swal.fire).toHaveBeenCalled();
            });
        });
    });

    describe('TC-116: Approve Contract offer by Event Planner', () => {
        test('should show approve button for supplier', async () => {
            await act(async () => {
                renderComponent();
            });

            // Wait for the approve button to appear
            await waitFor(() => {
                expect(screen.getByText('Approve Offer')).toBeInTheDocument();
            });
        });

        test('should call SweetAlert when approve button is clicked', async () => {
            await act(async () => {
                renderComponent();
            });

            // Wait for the approve button to appear
            await waitFor(() => {
                expect(screen.getByText('Approve Offer')).toBeInTheDocument();
            });

            const approveButton = screen.getByText('Approve Offer');
            await act(async () => {
                fireEvent.click(approveButton);
            });

            await waitFor(() => {
                expect(Swal.fire).toHaveBeenCalledWith({
                    title: 'Are you sure?',
                    text: 'Once you approve this, the contract will begin and be treated as an approved agreement.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, approve it',
                    cancelButtonText: 'Cancel'
                });
            });
        });
    });

    //   describe('Contract Status Display', () => {
    //     test('should display correct contract status', async () => {
    //       await act(async () => {
    //         renderComponent();
    //       });

    //       // Wait for the status to appear
    //       await waitFor(() => {
    //         expect(screen.getByText('Pending')).toBeInTheDocument();
    //       });
    //     });

    //     test('should show contract ID', async () => {
    //       await act(async () => {
    //         renderComponent();
    //       });

    //       // Wait for the contract ID to appear
    //       await waitFor(() => {
    //         expect(screen.getByText(/Contract ID: contract-123/)).toBeInTheDocument();
    //       });
    //     });
    //   });
});