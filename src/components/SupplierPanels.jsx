
import ShopCards from '../components/ShopCards'
import { TabList, Tab, TabPanel, TabPanels, TabGroup } from '@headlessui/react'
import { Edit3, Mail, Phone, DollarSign, Clock7, CircleCheck, Star } from 'lucide-react'

export default function SupplierPanels({ shop, reviews, averageRating }) {
    return (
        <>
            {/* Functional Navigation Tabs */}
            <TabGroup>
                <TabList className="border-b border-gray-200 mb-8">
                    <div className="flex gap-1">
                        <Tab className="px-6 py-3 rounded-t-lg font-medium transition-colors focus:outline-none data-selected:bg-blue-500 data-selected:text-white data-selected:shadow-sm data-hover:text-gray-900 data-hover:bg-gray-50 text-gray-600">
                            About
                        </Tab>
                        <Tab className="px-6 py-3 rounded-t-lg font-medium transition-colors focus:outline-none data-selected:bg-blue-500 data-selected:text-white data-selected:shadow-sm data-hover:text-gray-900 data-hover:bg-gray-50 text-gray-600">
                            Services
                        </Tab>
                        <Tab className="px-6 py-3 rounded-t-lg font-medium transition-colors focus:outline-none data-selected:bg-blue-500 data-selected:text-white data-selected:shadow-sm data-hover:text-gray-900 data-hover:bg-gray-50 text-gray-600">
                            Reviews
                        </Tab>
                    </div>
                </TabList>

                <TabPanels>
                    {/* About Tab Panel */}
                    <TabPanel className="focus:outline-none">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Description Card */}
                            <ShopCards className="md:col-span-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">About Our Business</h3>
                                        <p className="text-gray-600">{shop.supplier_description}</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                </div>
{/* 
                                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                                    Create stunning floral arrangements for weddings and events that leave lasting impressions.
                                </p> */}

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">Our Expertise</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {shop?.supplier_expertise?.map((skill, index) => (
                                            <span
                                                key={index}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${index === 0
                                                    ? 'bg-blue-500 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </ShopCards>

                            {/* Contact Information */}
                            <ShopCards>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
                                        <p className="text-gray-600">How customers can reach you</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Mail size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Email Address</h4>
                                            <p className="text-gray-600">{shop.supplier_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Phone size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Phone Number</h4>
                                            <p className="text-gray-600">{shop.supplier_number}</p>
                                        </div>
                                    </div>
                                </div>
                            </ShopCards>

                            {/* Booking Information */}
                            <ShopCards>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Details</h3>
                                        <p className="text-gray-600">Pricing and availability information</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <DollarSign size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Starting Price</h4>
                                            <p className="text-xl font-bold text-green-600">₱{shop.supplier_price}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Clock7 size={24} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Availability</h4>
                                            <p className="text-gray-600">{shop.supplier_availability}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <CircleCheck size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">{shop.supplier_response_time?.label}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Within 24 Hours</span>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                    Fast Response
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ShopCards>
                        </div>
                    </TabPanel>

                    {/* Services Tab Panel */}
                    <TabPanel className="focus:outline-none">
                        <div className="grid md:grid-cols-1 gap-8">
                            <ShopCards>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Our Services</h3>
                                        <p className="text-gray-600">What we offer to our clients</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                        <h4 className="font-bold text-gray-900 mb-3">Premium Service</h4>
                                        <p className="text-gray-600 mb-4">Our flagship service with full customization and premium materials.</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-blue-600">₱{shop.supplier_price}</span>
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Popular</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                        <h4 className="font-bold text-gray-900 mb-3">Basic Package</h4>
                                        <p className="text-gray-600 mb-4">Essential service package perfect for smaller events and budgets.</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-green-600">₱{Math.floor(shop.supplier_price * 0.7)}</span>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Budget</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Service Includes:</h5>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• Initial consultation and planning</li>
                                        <li>• Professional setup and arrangement</li>
                                        <li>• Quality materials and supplies</li>
                                        <li>• Post-event cleanup (Premium only)</li>
                                    </ul>
                                </div>
                            </ShopCards>
                        </div>
                    </TabPanel>

                    {/* Reviews Tab Panel */}
                    <TabPanel className="focus:outline-none">
                        <div className="grid md:grid-cols-1 gap-8">
                            <ShopCards>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                                        <p className="text-gray-600">What our clients are saying about us</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                                <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">{reviews.length} reviews</p>
                                        </div>
                                    </div>
                                </div>

                                {reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.map((review, index) => (
                                            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {review.reviewer_name?.charAt(0).toUpperCase() || 'A'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="font-semibold text-gray-900">{review.reviewer_name || 'Anonymous'}</h4>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={16}
                                                                        className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-500">{review.date || 'Recent'}</span>
                                                        </div>
                                                        <p className="text-gray-700">{review.comment || 'Great service!'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Star size={48} className="text-gray-300 mx-auto mb-4" />
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                                        <p className="text-gray-600">Be the first to share your experience with this supplier!</p>
                                    </div>
                                )}
                            </ShopCards>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </>
    )
}