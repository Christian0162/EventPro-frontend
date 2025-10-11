import { Search, MapPin, PhilippinePeso, Clock, Star, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import Cards from "../../components/Cards";
import Select from 'react-select';
import { SupplierOptions } from "../../constants/categories";
import SupplierModal from "../../components/SupplierModal";
import AIModal from "../../components/AIModal";
import { Typewriter } from 'react-simple-typewriter'
import { useFetchSuppliers, useFetchSupplierServices } from "../../hooks/useSupplier";
import { useFetchReviews } from "../../hooks/useReviews";
import { useFetchAllApplication } from "../../hooks/useApplication";
import { useFetchEventsById } from "../../hooks/useEvents";
import PageLoading from "../../components/PageLoading";

export default function Supplier({ userData }) {
    const [category, setCategory] = useState(null);
    const [shop, setShop] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [ai_response, setAi_response] = useState('')
    const { services, isLoading: isServicesLoading } = useFetchSupplierServices()
    const { reviews, isLoading: isReviewsLoading } = useFetchReviews()
    const { suppliers, isLoading: isSupplierLoading } = useFetchSuppliers()
    const { applications, isLoading: isApplicationLoading } = useFetchAllApplication()
    const { events, isLoading: isEventsLoading } = useFetchEventsById(userData.id)

    const isAllLoading = isSupplierLoading || isEventsLoading || isApplicationLoading || isServicesLoading || isReviewsLoading

    useEffect(() => {
        const filteredSupplier = suppliers.filter(supplier =>
            supplier.is_verified &&
            supplier.status === "active" &&
            services.some(serv => serv.supplier_id === supplier.id)
        );

        setShop(filteredSupplier);
    }, [suppliers, services]);

    console.log(events)

    useEffect(() => {
        let filtered = shop;

        if (searchTerm) {
            filtered = filtered.filter(shopItem =>
                shopItem.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shopItem.supplier_expertise?.some(expertise =>
                    expertise.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredShops(filtered)

        }

        if (category) {
            filtered = filtered.filter(shopItem =>
                shopItem.supplier_expertise?.some(exp =>
                    exp.toLowerCase().includes(category.value.toLowerCase())
                )
            );
        }

        setFilteredShops(filtered);
    }, [searchTerm, category, shop]);

    const calculateAverageRating = (shopId) => {
        const shopReviews = reviews.filter(r => r.reviewed_id === shopId);
        const validRatings = shopReviews
            .map(review => Number(review.rating))
            .filter(rating => !isNaN(rating) && rating > 0);

        if (validRatings.length === 0) return "N/A";

        const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
        return average.toFixed(1);
    };

    const getReviewCount = (shopId) => {
        const shopReviews = reviews.filter(r => r.reviewed_id === shopId);
        return shopReviews.length;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <>
            {isAllLoading && (
                <PageLoading />
            )}

            <div className={`mb-8  ${isAllLoading ? 'hidden' : 'block'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Suppliers
                        </h1>
                    </div>
                    {userData.role !== "Supplier" && (
                        <div>
                            <AIModal ai_response={setAi_response} ai_shops={setFilteredShops} />
                        </div>
                    )}
                </div>

                {/* Search and Filter Section */}
                <div className="flex items-center">
                    <div className="flex flex-col  md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex w-full gap-3">
                            <div className="flex w-[35rem] relative">
                                <Search className="absolute left-4 top-[1.30rem] transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full pl-12 pr-4 py-2 bg-gray-50 border shadow-lg border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
                                    placeholder="Search suppliers by name or service..."
                                />
                            </div>
                        </div>
                    </div>
                    {/* Category Filter */}
                    <div className="w-full md:w-72 mt-3 ml-auto">
                        <Select
                            onChange={setCategory}
                            value={category}
                            options={SupplierOptions}
                            placeholder="Category"
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {ai_response?.length > 0 && (
                <div className="mb-8 max-w-[800px] px-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md rounded-2xl p-6 relative">

                        {/* Close Button */}
                        <button
                            onClick={() => (setAi_response(""), setFilteredShops(shop))}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                        >
                            ✕
                        </button>

                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow">
                                <Bot size={20} />
                            </div>
                            <h2 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                AI Suggestion
                            </h2>
                        </div>

                        <div className="text-gray-700 leading-relaxed text-md">
                            <Typewriter
                                words={[ai_response]}
                                typeSpeed={20}
                                delaySpeed={500}
                            />
                        </div>
                    </div>
                </div >
            )
            }

            {/* Suppliers Grid */}
            {!isAllLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredShops.map((shopItem, index) => {
                        const averageRating = calculateAverageRating(shopItem.id);
                        const reviewCount = getReviewCount(shopItem.id);

                        const userServices = services.filter(serv => serv.supplier_id === shopItem.id)
                        return (
                            <Cards key={shopItem.id || index} className="group cursor-pointer flex flex-col justify-between">
                                {/* Header - Applied Badge */}
                                <div className="relative">
                                    {applications.some(app =>
                                        app.supplier_id === shopItem.id &&
                                        events.some(event => event.id === app.event_id)
                                    ) && (
                                            <div className="absolute top-3 left-3 z-10 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-green-700">
                                                Applied
                                            </div>
                                        )}


                                    {/* Image */}
                                    <div className="relative overflow-hidden rounded-t-lg">
                                        {shopItem.supplier_background_image.length > 0 ? (
                                            <img
                                                src={shopItem?.supplier_background_image}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                alt={`${shopItem.supplier_name} background`}
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-r from-pink-500 to-violet-500"></div>
                                        )}

                                        {/* Rating Badge */}
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                                            <Star className="text-yellow-400 fill-current" size={14} />
                                            <span className="text-sm font-semibold text-gray-900">{averageRating}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                            {shopItem.supplier_name}
                                        </h3>

                                        {/* Location */}
                                        <div className="flex items-center space-x-2 mb-4">
                                            <MapPin className="text-gray-400 shrink-0" size={16} />
                                            <span className="text-gray-600 text-sm">{shopItem.supplier_location}</span>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-4">
                                            <Clock className="text-gray-400 shrink-0" size={16} />
                                            <span className="text-sm text-gray-600">{shopItem.supplier_availability}</span>
                                        </div>

                                        {/* Categories */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {shopItem?.supplier_expertise?.map((expertise, expertiseIndex) => (
                                                <span
                                                    key={expertiseIndex}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                                                >
                                                    {expertise}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Price and Hours */}
                                        <div className="flex flex-col mb-5 gap-2">


                                            <div className="flex items-center space-x-1">
                                                <PhilippinePeso className="text-green-600" size={18} />
                                                <span className="text-lg font-bold text-gray-900">{userServices[0]?.service_price}</span>
                                                <span className="text-sm text-gray-500">/service</span>
                                            </div>

                                        </div>

                                        {/* Reviews */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={
                                                                i < Math.floor(averageRating !== "N/A" ? parseFloat(averageRating) : 0)
                                                                    ? "text-yellow-400 fill-current"
                                                                    : "text-gray-300"
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <SupplierModal
                                        className={'py-2 rounded-lg font-semibold w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}
                                        services={userServices}
                                        supplierData={shopItem}
                                        userData={userData}
                                        reviews={reviews.filter(r => r.reviewed_id === shopItem.id)}
                                        averageRating={averageRating}
                                    />
                                </div>
                            </Cards>
                        );
                    })}
                </div>
            )
            }

            {
                filteredShops.length === 0 && !isAllLoading && (
                    <div className="flex flex-col items-center justify-center py-[12rem]">
                        <span className="text-gray-400 text-xl mb-2">No Suppliers Found</span>
                        <span className="text-gray-500 text-sm">Try adjusting your search or filters</span>
                    </div>
                )
            }
        </>
    );
}