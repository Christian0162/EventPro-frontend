import { Search, MapPin, PhilippinePeso, Clock, Star, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import Cards from "../../components/Cards";
import Select from 'react-select';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Loading from "../../components/Loading";
import SupplierModal from "../../components/SupplierModal";
import AIModal from "../../components/AIModal";

export default function Supplier({ userData }) {
    const [category, setCategory] = useState(null);
    const [shop, setShop] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [shopReviews, setShopReviews] = useState({});

    const categoriesOptions = [
        { label: 'Wedding', value: 'Wedding' },
        { label: 'Catering', value: 'Catering' },
        { label: 'Photography', value: 'Photography' },
        { label: 'Floral Design', value: 'Floral Design' },
        { label: 'Venues', value: 'Venues' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const snapShotShop = await getDocs(collection(db, "Shops"));
                const shops = snapShotShop.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const approvedShops = shops.filter(doc => doc.isApproved === "verified");

                const reviewsData = {};
                for (const shopItem of approvedShops) {
                    try {
                        const reviewsSnapshot = await getDocs(collection(db, "Shops", shopItem.id, "Reviews"));
                        const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        reviewsData[shopItem.id] = reviews;
                    } catch (error) {
                        console.log(`Error fetching reviews for shop ${shopItem.id}:`, error);
                        reviewsData[shopItem.id] = [];
                    }
                }

                setShopReviews(reviewsData);
                setShop(approvedShops);
                setFilteredShops(approvedShops);
                setIsLoading(false);
            } catch (error) {
                console.log('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = shop;

        if (category) {
            filtered = filtered.filter(shopItem =>
                shopItem.supplier_expertise?.includes(category.value)
            );
        }

        setFilteredShops(filtered);
    }, [searchTerm, category, shop]);

    const calculateAverageRating = (shopId) => {
        const reviews = shopReviews[shopId] || [];
        const validRatings = reviews
            .map(review => Number(review.rating))
            .filter(rating => !isNaN(rating) && rating > 0);

        if (validRatings.length === 0) return "N/A";

        const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
        return average.toFixed(1);
    };

    const getReviewCount = (shopId) => {
        const reviews = shopReviews[shopId] || [];
        return reviews.length;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = () => {

        let filtered = shop

        if (searchTerm) {
            filtered = filtered.filter(shopItem =>
                shopItem.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shopItem.supplier_expertise?.some(expertise =>
                    expertise.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredShops(filtered)

        }

    }


    console.log(filteredShops)
    return (
        <>
            {isLoading && (
                <Loading />
            )}

            <div className={`mb-8  ${isLoading ? 'hidden' : 'block'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Suppliers
                        </h1>
                    </div>
                    <div>
                        <AIModal />
                    </div>

                </div>

                {/* Search and Filter Section */}
                <div>
                    <div className="flex flex-col md:flex-row gap-4">
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
                            <button onClick={() => handleSearch()} className="transition-all duration-100 bg-blue-600 px-6 py-2 text-white font-semibold rounded-full hover:bg-blue-700">Search</button>
                            {/* Category Filter */}
                        </div>

                    </div>
                    <div className="w-full md:w-72 mt-3 ml-auto">
                        <Select
                            onChange={setCategory}
                            value={category}
                            options={categoriesOptions}
                            placeholder="Category"
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredShops.map((shopItem, index) => {
                    const averageRating = calculateAverageRating(shopItem.id);
                    const reviewCount = getReviewCount(shopItem.id);

                    return (
                        <Cards key={shopItem.id || index} className="group cursor-pointer">
                            {/* Image */}
                            <div className="relative overflow-hidden">
                                <img
                                    src={shopItem?.supplier_background_image}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    alt={`${shopItem.supplier_name} background`}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                                    <Star className="text-yellow-400 fill-current" size={14} />
                                    <span className="text-sm font-semibold">{averageRating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                    {shopItem.supplier_name}
                                </h3>

                                {/* Location */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="text-gray-400" size={16} />
                                    <span className="text-gray-600 text-sm">{shopItem.supplier_location}</span>
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
                                <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center space-x-1">
                                        <PhilippinePeso className="text-green-600" size={18} />
                                        <span className="text-lg font-bold text-gray-900">{shopItem.supplier_price}</span>
                                        <span className="text-sm text-gray-500">/day</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="text-gray-400" size={16} />
                                        <span className="text-sm text-gray-600">{shopItem.supplier_availability}</span>
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

                                {/* Action Button */}
                                <SupplierModal className={'py-2 rounded-lg font-semibold'} supplierData={shopItem} userData={userData.role} reviews={reviewCount} averageRating={averageRating} />
                            </div>
                        </Cards>
                    );
                })}
            </div>

            {filteredShops.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <span className="text-gray-400 text-xl mb-2">No Suppliers Found</span>
                    <span className="text-gray-500 text-sm">Try adjusting your search or filters</span>
                </div>
            )}
        </>
    );
}