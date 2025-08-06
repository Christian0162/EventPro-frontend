import { MapPin, CircleCheckBig, Star, Edit3, X } from "lucide-react"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { useEffect, useState } from "react"
import Loading from "../../components/Loading"
import { Link, Navigate } from "react-router-dom"
import UploadWidget from "../../components/UploadWidgen"
import { ShopBackgroundModal } from "../../components/ShopBackgroundModal"
import SupplierRegistration from "./SupplierRegistration"
import SupplierPanels from "../../components/SupplierPanels"
import { SupplierDetails } from "../../components/UpdateModal"
import { useFetchSupplierById, useFetchSupplierServices } from "../../hooks/useSupplier"
import { useFetchReviewsById } from "../../hooks/useReviews"

export default function SupplierShop({ userData }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false)
    const [countdown, setCountdown] = useState(1)
    const [background, setBackground] = useState('')
    const { supplier } = useFetchSupplierById(userData.id)
    const { reviews } = useFetchReviewsById(userData.id)
    const { services } = useFetchSupplierServices()

    const supplierService = services[userData.id]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        await updateDoc(doc(db, "shops", userData.id), {
            supplier_background_image: background
        })
        setIsLoading(false)
        window.location.reload();
    }

    useEffect(() => {
        if (countdown <= 0) { return setIsLoading(false) }

        const countDown = setInterval(() => {
            setCountdown(prev => prev - 1)
        }, [1000])

        return () => clearInterval(countDown)
    }, [countdown])

    if (!supplier) {
        return <SupplierRegistration />
    }

    if (userData.role !== 'Supplier') {
        return <Navigate to={'/dashboard'} />
    }

    const validRatings = reviews
        .map(review => Number(review.rating))
        .filter(rating => !isNaN(rating));

    const averageRating = validRatings.length > 0
        ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
        : "N/A";

    // console.log(services)

    return (
        <>
            {isLoading && (
                <Loading />
            )}

            {!isLoading && (
                <div className="px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Shop</h1>
                        <p className="text-gray-600 mt-2">Manage your business profile and showcase your services</p>
                    </div>

                    {/* Main Content Container */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                        {/* Hero Image */}
                        <div className="relative h-64 md:h-80 overflow-hidden">
                            <div className="absolute top-4 right-4 z-50">
                                {!isOpen && (
                                    <button
                                        className="transition-all duration-200 text-white text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-md py-2 px-3"
                                        onClick={() => setIsOpen(true)}
                                    >
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                )}
                            </div>
                            <ShopBackgroundModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-2xl border-b border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Upload Files
                                        </h2>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2 hover:bg-white/70 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:scale-105 active:scale-95 shadow-sm"
                                            aria-label="Close modal"
                                        >
                                            <X size={22} strokeWidth={2} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <form className="relative justify-between" onSubmit={handleSubmit}>
                                        <UploadWidget className={'py-2'} setPicture={setBackground} />
                                        <button disabled={!background} className={`transition-all duration-75 px-4 h-10 absolute bottom-0 right-0 rounded-md text-white ${background ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300'}`}>Submit</button>
                                    </form>
                                </div>
                            </ShopBackgroundModal>
                            {supplier?.supplier_background_image && (
                                <img src={supplier?.supplier_background_image} className="absolute inset-0 " alt="background image" />
                            )}
                            <div className="absolute inset-0 w-full bg-gradient-to-r from-pink-600 via-blue-600 via-100% to-violet-600 rounded-t-lg"></div>
                        </div>

                        <div className="p-8 md:p-10">
                            {/* Business Header */}
                            <div className="mb-8">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <h2 className="text-3xl font-bold text-gray-900">{supplier?.supplier_name}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                            {supplier?.supplier_type?.label}
                                        </span>
                                        <Link to={'/verify'} className={`${supplier?.status === "unverified" ? 'block' : 'hidden'} transtion-all duration-75 flex group items-center gap-2 bg-blue-50 border border-blue-200 hover:bg-blue-400 rounded-full px-4 py-2`}>
                                            <span className={`text-blue-700 group-hover:text-white font-medium text-sm`}>Verify</span>
                                        </Link>

                                        {supplier.status === "pending" && (
                                            <span className="flex group items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
                                                <span className={`text-yellow-700 font-medium text-sm`}>Pending</span>
                                            </span>
                                        )}

                                        {supplier.status === "verified" && (
                                            <span className="flex group items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                                                <span className={`text-green-700 font-medium text-sm`}>Verified</span>
                                                <CircleCheckBig size={16} className="text-green-600" />
                                            </span>
                                        )}
                                    </div>
                                    <SupplierDetails supplierData={supplier} />

                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={20} className="text-blue-500" />
                                        <span className="font-medium">{supplier?.supplier_location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium">{averageRating}</span>
                                        <span className="text-gray-500">{reviews.length}</span>
                                    </div>
                                </div>
                            </div>

                            <SupplierPanels userData={userData} reviews={reviews} shop={supplier} services={supplierService} averageRating={averageRating} />

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}