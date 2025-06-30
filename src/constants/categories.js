export const SupplierOptions = [
    { label: 'Floral', value: 'floral' },
    { label: 'Wedding', value: 'wedding' },
    { label: 'Events', value: 'events' },
    { label: 'Corporate', value: 'corporate' },
    { label: 'Funeral', value: 'funeral' },
]

export const supplierTypeToExpertise = {
    floral: ['Floral', 'Seasonal', 'Exotic Flowers', 'Local Flowers'],
    wedding: ['Wedding', 'Bridal Bouquets', 'Wedding Centerpieces', 'Boutonnieres'],
    events: ['Events', 'Corporate Events', 'Social Events', 'Special Occasions'],
    corporate: ['Corporate', 'Office Decor', 'Executive Gifts', 'Corporate Events'],
    funeral: ['Funeral', 'Sympathy Arrangements', 'Memorial Flowers', 'Wreaths']
};

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
    {label: 'DTI (Department of Trade and Industry', value: 'dti'},
    {label: 'Business Permit', value: 'business_permit'},
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
