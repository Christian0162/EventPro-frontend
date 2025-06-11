import { Button, Dialog, DialogPanel, } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { MapPin, DollarSign, Clock, Phone, Mail, X, MessageCircleMore, Heart } from 'lucide-react'
import { db, auth } from '../firebase/firebase'
import { doc, addDoc, where, serverTimestamp, onSnapshot, collection, deleteDoc, query, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Star, Clock7, CircleCheck, Edit3 } from "lucide-react"
import ShopCards from './ShopCards'

export default function SupplierModal({ supplierData, applications, userData, reviews, averageRating, className }) {

    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    useEffect(() => {

        const unsubscribe = onSnapshot(collection(db, "Favorites"),
            (snapshot) => {
                const userFavorites = snapshot.docs
                    .filter(doc => doc.data().user_id === auth.currentUser.uid && doc.data().supplier_id === supplierData.id)
                    .map(doc => ({ id: doc.id, ...doc.data() }));

                setIsLiked(userFavorites[0]?.isActive || false);
            });

        return () => unsubscribe();

    }, [supplierData]);

    if (!supplierData) {
        return null;
    }

    const handleFavorites = async (e) => {
        e.preventDefault()

        if (isLiked) {
            const q = query(collection(db, "Favorites"),
                where("user_id", "==", auth.currentUser.uid),
                where("supplier_id", "==", supplierData.id)
            )
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, "Favorites", docSnapshot.id))
            })
            setIsLiked(false)
        }
        else {
            await addDoc(collection(db, "Favorites"), {
                user_id: auth.currentUser.uid,
                supplier_id: supplierData.id,
                isActive: true,
                createdAt: serverTimestamp(),
            })
            setIsLiked(true)
        }
    }

    const handleChat = async (e) => {
        e.preventDefault()

        const q = query(collection(db, "Contacts"),
            where("user_id", "==", auth.currentUser.uid),
            where("contact_id", "==", supplierData.id)
        )

        const querySnapShot = await getDocs(q)

        if (querySnapShot.empty) {
            await addDoc(collection(db, "Contacts"), {
                user_id: auth.currentUser.uid,
                contact_id: supplierData.id,
                name: supplierData.supplier_name,
                avatar: supplierData.supplier_name.slice(0, 1).toUpperCase(),
                last_message: "",
                isActive: false,
                createdAt: serverTimestamp()

            })
            navigate(`/chats/`)
        }
        else {
            navigate(`/chats/`)
        }
    }

    return (
        <>
            <Button
                onClick={open}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
            >
                View Details
            </Button>

            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            {/* Header with close button */}
                            <div className="relative">
                                <button
                                    onClick={close}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>

                                {/* Hero Image */}
                                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                                    <img
                                        src={supplierData.supplier_background_image}
                                        alt={supplierData.supplier_name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-4 left-6 text-white">
                                        <h1 className="text-2xl font-bold">{supplierData.supplier_name}</h1>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Location and Basic Info */}
                                <div className="flex items-center justify-between space-x-4 mb-4">
                                    <div className='flex gap-3'>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="text-gray-400" size={16} />
                                            <span className="text-gray-600">{supplierData.supplier_location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="text-gray-400" size={16} />
                                            <span className="text-gray-600">{supplierData.supplier_availability}</span>
                                        </div>
                                    </div>

                                    <div className='flex gap-5'>
                                        <div className="relative space-x-2">
                                            <form onSubmit={handleFavorites}>
                                                <button className='group transparent'>
                                                    <Heart className={`transition-all duration-200 ${isLiked ? 'fill-red-600 opacity-100 text-red-600' : 'opacity-50 text-gray-800 group-hover:text-red-600 group-hover:opacity-60 group-hover:scale-115'}`} size={21} />
                                                </button>
                                            </form>
                                        </div>

                                        <div className="relative space-x-2">
                                            <button onClick={handleChat} className='group'>
                                                <MessageCircleMore className="trasition-all duration-200 text-gray-400 group-hover:text-blue-600" size={21} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Functional Navigation Tabs */}
                                <TabGroup>
                                    <TabList className="mb-3">
                                        <div className="flex gap-1">
                                            <Tab className="px-6 py-1 rounded-full font-medium transition-colors focus:outline-none data-selected:bg-blue-500 data-selected:text-white data-selected:shadow-sm data-hover:text-gray-900 data-hover:bg-gray-50 text-gray-600">
                                                About
                                            </Tab>
                                            <Tab className="px-6 py-1 rounded-full font-medium transition-colors focus:outline-none data-selected:bg-blue-500 data-selected:text-white data-selected:shadow-sm data-hover:text-gray-900 data-hover:bg-gray-50 text-gray-600">
                                                Services
                                            </Tab>
                                            <Tab className="px-6 py-1 rounded-full font-medium transition-colors focus:outline-none data-selected:bg-blue-500 data-selected:text-white data-selected:shadow-sm data-hover:text-gray-900 data-hover:bg-gray-50 text-gray-600">
                                                Reviews
                                            </Tab>
                                        </div>
                                    </TabList>

                                    <TabPanels>
                                        {/* About Tab Panel */}
                                        <TabPanel className="focus:outline-none text-sm">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Description Card */}
                                                <ShopCards className="md:col-span-2">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2">About Our Business</h3>
                                                            <p className="text-gray-600">{supplierData.supplier_description}</p>
                                                        </div>
                                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                                                            <Edit3 size={16} />
                                                            Edit
                                                        </button>
                                                    </div>

                                                    <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                                                        Create stunning floral arrangements for weddings and events that leave lasting impressions.
                                                    </p>

                                                    <div>
                                                        <h4 className="font-bold text-gray-900 mb-3">Our Expertise</h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {supplierData?.supplier_expertise?.map((skill, index) => (
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
                                                                <p className="text-gray-600">{supplierData.supplier_email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                                <Phone size={24} className="text-green-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 mb-1">Phone Number</h4>
                                                                <p className="text-gray-600">{supplierData.supplier_number}</p>
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
                                                                <p className="text-xl font-bold text-green-600">₱{supplierData.supplier_price}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                                <Clock7 size={24} className="text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 mb-1">Availability</h4>
                                                                <p className="text-gray-600">{supplierData.supplier_availability}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <CircleCheck size={24} className="text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 mb-1">{supplierData.supplier_response_time?.label}</h4>
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
                                        <TabPanel className="focus:outline-none text-sm">
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
                                                                <span className="text-2xl font-bold text-blue-600">₱{supplierData.supplier_price}</span>
                                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Popular</span>
                                                            </div>
                                                        </div>

                                                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                                            <h4 className="font-bold text-gray-900 mb-3">Basic Package</h4>
                                                            <p className="text-gray-600 mb-4">Essential service package perfect for smaller events and budgets.</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-2xl font-bold text-green-600">₱{Math.floor(supplierData.supplier_price * 0.7)}</span>
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
                                        <TabPanel className="focus:outline-none text-sm">
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

                                {/* Action Buttons */}
                                {supplierData.id !== auth.currentUser.uid && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <Button
                                            onClick={close}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            Close
                                        </Button>

                                        {applications?.some(app => app.user_id === supplierData.id) || userData === "Event Planner" && (
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                Book Now
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {supplierData.id === auth.currentUser.uid && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <Button
                                            onClick={close}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}