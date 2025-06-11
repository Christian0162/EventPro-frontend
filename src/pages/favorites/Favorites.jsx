import { Title } from "react-head";
import Cards from "../../components/Cards";
import { MapPin, Clock, Star, DollarSign, DoorClosed } from "lucide-react";
import SupplierModal from "../../components/SupplierModal";
import { useEffect, useState } from "react";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import Loading from "../../components/Loading";

export default function Favorites() {

    const [shop, setShop] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [shopReviews, setShopReviews] = useState({});


    useEffect(() => {
        setIsLoading(true)

        const unsubscribe = onSnapshot(collection(db, "Favorites"), (snapshot) => {
            const userFavorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const favorites = userFavorites.filter(doc => doc.user_id === auth.currentUser.uid)

            setFavorites(favorites);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)

                if (favorites.length > 0) {
                    const snapShotShop = await getDocs(collection(db, "Shops"));
                    const shops = snapShotShop.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const favoriteShop = shops.filter(shop =>
                        favorites.some(fav => fav.supplier_id === shop.id)
                    );

                    const reviewsData = {};
                    for (const shopItem of favoriteShop) {
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
                    setShop(favoriteShop);
                    setIsLoading(false);

                }
                
                else {
                    setShop([])
                    setShopReviews([])
                }

            } catch (error) {
                console.log('Error fetching data:', error);
                setIsLoading(false);
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [favorites]);

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

    console.log(favorites)

    return (
        <>
            <Title>Favorites</Title>
            {isLoading && (
                <Loading />
            )}

            {!isLoading && (
                <div className={`flex flex-col mb-5`}>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Favorites</h1>
                    <span className="mt-2 text-gray-600">Look at your favorite suppliers</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {shop.map((shopItem, index) => {
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
                                        <DollarSign className="text-green-600" size={18} />
                                        <span className="text-lg font-bold text-gray-900">₱{shopItem.supplier_price}</span>
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
                                <SupplierModal supplierData={shopItem}  reviews={reviewCount} averageRating={averageRating} className={'py-2 rounded-md '}/>
                            </div>
                        </Cards>
                    );
                })}

            </div>
            {!isLoading && shop.length === 0 && (
                <div className="flex justify-center text-xl items-center mt-36 text-gray-500">
                    No favorite suppliers found.
                </div>
            )}
        </>
    )
}