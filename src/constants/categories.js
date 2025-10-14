export const SupplierOptions = [
    { label: 'Floral (Flowers & Arrangements)', value: 'floral' },
    { label: 'Wedding (Planners & Services)', value: 'wedding' },
    { label: 'Events (General Event Services)', value: 'events' },
    { label: 'Corporate (Business Functions)', value: 'corporate' },
    { label: 'Catering (Food & Beverages)', value: 'catering' },
    { label: 'Photography (Photo & Video)', value: 'photography' },
    { label: 'Music & Entertainment (Bands, DJs, Performers)', value: 'entertainment' },
    { label: 'Lighting & Sound (Audio/Visual Setup)', value: 'lighting' },
    { label: 'Decor & Styling (Design & Decorations)', value: 'decor' },
    { label: 'Transportation (Guest & Event Transport)', value: 'transportation' },
    { label: 'Makeup & Styling (Hair & Beauty)', value: 'makeup' },
    { label: 'Invitations & Printing (Cards & Materials)', value: 'printing' }
]


export const statusOptions = [
    { label: 'Planning', value: 'planning' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
];

export const createStatusOptions = [
    { label: 'Planning', value: 'planning' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'In Progress', value: 'in_progress' },
];

export const headerBackgrounds = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
];

export const eventStatusStyles = {
    planning: "bg-violet-100 text-violet-700",
    in_progress: "bg-blue-100 text-blue-700",
    open: "bg-blue-100 text-blue-700",
    payment_pending: "bg-orange-100 text-orange-700",
    completed: "bg-green-100 text-green-700",
};

export const statusStyles = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    reject: "bg-red-100 text-red-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    hold: "bg-amber-100 text-amber-700",
    refunded: "bg-blue-100 text-blue-700",
    succeeded: "bg-green-100 text-green-700",
};

export const supplierTypeToExpertise = {
    floral: ['Floral', 'Seasonal Arrangements', 'Exotic Flowers', 'Local Flowers', 'Bouquets', 'Centerpieces'],
    wedding: ['Wedding Planning', 'Bridal Bouquets', 'Wedding Centerpieces', 'Ceremony Setup', 'Reception Styling'],
    events: ['Event Planning', 'Corporate Events', 'Social Gatherings', 'Special Occasions', 'Festivals'],
    corporate: ['Corporate Functions', 'Office Decor', 'Executive Gifts', 'Team Building', 'Business Conferences'],
    catering: ['Catering', 'Buffet Services', 'Plated Meals', 'Beverage Service', 'Desserts & Pastries'],
    photography: ['Photography', 'Videography', 'Photo Editing', 'Event Coverage', 'Portrait Sessions'],
    entertainment: ['Live Bands', 'DJs', 'Performers', 'Hosts/MCs', 'Cultural Shows'],
    lighting: ['Lighting Setup', 'Sound Systems', 'Stage Effects', 'Audio/Visual Equipment'],
    decor: ['Decor Styling', 'Stage Design', 'Table Arrangements', 'Thematic Decorations', 'Balloon & Props'],
    venue: ['Banquet Halls', 'Outdoor Venues', 'Hotels & Resorts', 'Conference Rooms', 'Private Spaces'],
    transportation: ['Guest Transportation', 'Shuttle Services', 'Luxury Cars', 'Bridal Cars', 'Logistics Support'],
    makeup: ['Bridal Makeup', 'Hairstyling', 'Grooming', 'Special Occasion Looks', 'On-site Services'],
    printing: ['Invitations', 'Event Cards', 'Menus & Programs', 'Signage', 'Souvenirs & Giveaways']
};


export const termsOfCondition = {
    title: "Terms and Conditions",
    description:
        "These terms and conditions outline the responsibilities, penalties, and obligations of both planners and suppliers to ensure fairness, accountability, and the successful execution of contracted services.",
    clauses: [
        {
            title: "Late Delivery",
            details: [
                "A penalty of 0.5% of the total contract value per day of delay will be applied to the supplier.",
                "Total penalties shall not exceed 10% to 20% of the total contract amount.",
            ],
        },
        {
            title: "Non-Delivery / No Service",
            details: [
                "A full refund of the total contract amount will be issued to the planner.",
                "All payments made by the planner must be reimbursed if no service or delivery was provided.",
                "Supplier’s account will be subject to termination due to failure to deliver the agreed service or fulfill contractual obligations.",
            ],
        },
        {
            title: "Service Non-Conformity or Damage",
            details: [
                "The supplier shall bear the cost of repair, replacement, or any loss incurred due to defective or non-conforming service.",
                "Deductions will be made from the supplier’s payment based on the actual cost verified by the client.",
            ],
        },
        {
            title: "Non-Payment by Planner",
            details: [
                "Planners are required to complete all agreed payments as stated in the contract.",
                "Failure to pay the supplier without valid justification will result in account suspension or permanent termination.",
                "Repeated payment violations may also lead to platform-wide banning of the planner’s account.",
            ],
        },
    ],

};

export const paymentMethods = [
    {
        name: "Gcash",
        method: "GCASH",
        payment_method_logo: '/payment_methods/gcashlogo.png',
        type: 'Digital Wallet',
        process_fee: 0.027,
        color: 'bg-blue-600'
    },
    {
        name: "Maya",
        method: "PAYMAYA",
        payment_method_logo: '/payment_methods/mayalogo.jpg',
        type: 'Digital Wallet',
        process_fee: 0.027,
        color: 'bg-green-400'
    },
    {
        name: "Credit Card",
        method: "CREDIT_CARD",
        payment_method_logo: '/payment_methods/creditcardlogo.jpg',
        type: 'Visa, Mastercard',
        process_fee: 0.03,
        color: 'bg-violet-500'
    }
]


export const responseTimeOptions = [
    { label: 'Within 1 Hour', value: 'within 1 hour' },
    { label: 'Within 4 Hour', value: 'within 4 hour' },
    { label: 'Within 24 Hour', value: 'within 24 hour' },
    { label: 'Within 48 Hour', value: 'within 48 hour' },
]

export const planTypeOptions = [
    { label: 'Basic Plan', value: 'basic plan' },
    { label: 'Premium Plan', value: 'premium plan' },
]

export const paymentNoticeOptions = [
    { label: 'Pay after service delivered', value: 'pay after service delivered' },
    { label: 'Down Payment required atleast 50 percent.' }
]

export const idOptions = [
    { label: "Driver's License", value: "driver_license" },
    { label: 'Social Security System (SSS) ID', value: 'sss' },
    { label: 'Unified Multi-Purpose (UMID) ID', value: 'umid' },
    { label: 'National ID', value: 'national' },
    { label: 'Philippine Identification (PhilID) / ePhilID', value: 'philid' },
]

export const documentOptions = [
    { label: 'DTI (Department of Trade and Industry', value: 'dti' },
    { label: 'Business Permit', value: 'business_permit' },
]

export const exampleIds = {
    driver_license: ['id/driver_license_front.jpg', 'id/driver_license_back.jpg'],
    sss: ['id/sss_front.jpg', 'id/sss_back.jpg'],
    umid: ['id/umid_front.jpg', 'id/umid_back.jpg'],
    national: ['id/national_id_front.jpg', 'id/national_id_back.jpg'],
    philid: ['id/ephil_front_back.jpg']
};

export const exampleDocuments = {
    dti: ['documents/dti.jpg'],
    business_permit: ['documents/business_permit.jpg'],

};
