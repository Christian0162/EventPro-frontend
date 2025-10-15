import { Title } from "react-head";
import Cards from "../../components/Cards";
import { MapPin, Clock, Star, DollarSign, MessageCircleMore, Heart, Trash, CalendarDays, CircleDollarSign, Users } from "lucide-react";
import SupplierModal from "../../components/SupplierModal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchFavorites } from "../../hooks/useFavorites";
import { useFetchSuppliers } from "../../hooks/useSupplier";
import { useFetchSupplierServices } from "../../hooks/useSupplier";
import { useFetchReviews } from "../../hooks/useReviews";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useFetchEvents } from "../../hooks/useEvents";
import Swal from "sweetalert2";
import { useFetchSupplierById } from "../../hooks/useSupplier";
import EventModal from "../../components/EventModal";
import { Link } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader"; // Add this import
import PageLoading from "../../components/PageLoading";

export default function Favorites({ userData }) {

    const { favorites, isLoading: isFavoritesLoading } = useFetchFavorites()
    const { suppliers } = useFetchSuppliers()
    const { services } = useFetchSupplierServices()
    const [applications, setApplications] = useState([])
    const [isApplying, setIsApplying] = useState(false)
    const [applyingEventId, setApplyingEventId] = useState(null)
    const { reviews: shopReviews, isLoading: isReviewLoading } = useFetchReviews()
    const { events } = useFetchEvents()
    const { supplier, isLoading: isSupplierLoading } = useFetchSupplierById(userData.id)
    const [isCreatingFavorites, setIsCreatingFavorites] = useState(false)
    const [isCreatingContact, setIsCreatingContact] = useState(false)
    const [likedEvents, setLikedEvents] = useState({});
    const navigate = useNavigate()

    const isAllLoading = isReviewLoading || isSupplierLoading || isFavoritesLoading

    const favoritesEvents = events.filter(event =>
        favorites.some(fav => event.id === fav.event_id)
    )

    const userFavorites = favorites.filter(favorite => favorite.user_id === userData.id)
    const activeSuppliers = suppliers.filter(supplier => supplier.is_verified && supplier.status === "active" && services.some(serv => serv.supplier_id === supplier.id))

    const shop = activeSuppliers.filter(shop => {
        return userFavorites.some(favorite => shop.id === favorite.supplier_id)
    })

    // Fix: Check if applications exist for debugging
    console.log("Applications:", applications)
    console.log("Supplier verification status:", supplier?.is_verified)

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "favorites"), (snapshot) => {
            const userFavorites = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.user_id === userData.id) {
                    userFavorites[data.event_id] = data.isActive;
                }
            });
            setLikedEvents(userFavorites);
        });

        return () => unsubscribe();
    }, [userData.id]);

    const handleApply = async (event_id, user_id) => {
        setIsApplying(true)
        setApplyingEventId(event_id)

        Swal.fire({
            title: 'Confirm Application',
            text: "Are you sure you want to apply for this event?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Apply',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await addDoc(collection(db, "applications"), {
                        supplier_id: userData.id,
                        event_id: event_id,
                        AppliedAt: serverTimestamp(),
                        status: 'Pending'
                    })

                    await addDoc(collection(db, "notifications"), {
                        avatar: userData.id.charAt(0).toUpperCase(),
                        message: `The supplier "${supplier.supplier_name}" applied to your event.`,
                        createdAt: serverTimestamp(),
                        sender_id: supplier.id,
                        referenced_type: 'event',
                        referenced_id: event_id,
                        title: 'You have a new application for your event.',
                        unread: true,
                        receiver_id: user_id
                    })

                    Swal.fire('Applied!', 'Your application has been submitted.', 'success');
                } catch (e) {
                    Swal.fire('Error!', 'Failed to apply. Please try again.', 'error');
                    console.error("Apply error:", e);
                } finally {
                    setIsApplying(false)
                    setApplyingEventId(null)
                }
            } else {
                setIsApplying(false)
                setApplyingEventId(null)
            }
        });
    }

    const handleFavorites = async (e, event) => {
        e.preventDefault();
        setIsCreatingFavorites(true);

        try {
            const eventLiked = likedEvents[event.id] || false;

            if (eventLiked) {
                const q = query(collection(db, "favorites"),
                    where("user_id", "==", userData.id),
                    where("event_id", "==", event.id)
                );
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async docSnapshot => {
                    await deleteDoc(doc(db, "favorites", docSnapshot.id));
                });

                setLikedEvents(prev => ({ ...prev, [event.id]: false }));
            } else {
                await addDoc(collection(db, "favorites"), {
                    user_id: userData.id,
                    event_id: event.id,
                    isActive: true,
                    createdAt: serverTimestamp(),
                });

                setLikedEvents(prev => ({ ...prev, [event.id]: true }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreatingFavorites(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "applications"), (onsnapshot) => {
            const applications = onsnapshot.docs.map(app => ({ id: app.id, ...app.data() }))
            setApplications(applications)
        })

        return () => unsubscribe()
    }, [userData])

    const handleChat = async (e, event_id, event_name) => {
        e.preventDefault()
        setIsCreatingContact(true)
        try {
            const q = query(collection(db, "contacts"),
                where("user_id", "==", userData.id),
                where("contact_id", "==", event_id)
            )

            const querySnapShot = await getDocs(q)

            if (querySnapShot.empty) {
                await addDoc(collection(db, "contacts"), {
                    user_id: userData.id,
                    contact_id: event_id,
                    name: event_name,
                    avatar: event_name.slice(0, 1).toUpperCase(),
                    last_message: "",
                    isActive: false,
                    createdAt: serverTimestamp()
                })
                navigate(`/chats/${supplier.id}`)
            } else {
                navigate(`/chats/${supplier.id}`)
            }
        }
        catch (e) {
            console.error(e)
            setIsCreatingContact(false)
        }
        finally {
            setIsCreatingContact(false)
        }
    }

    const handleDelete = async (favoriteId) => {
        try {
            await deleteDoc(doc(db, "favorites", favoriteId));
            Swal.fire('Deleted!', 'Favorite has been removed.', 'success');
        } catch (error) {
            console.error("Error deleting favorite:", error);
            Swal.fire('Error!', 'Failed to delete favorite.', 'error');
        }
    }

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

    // Helper function to check application status
    const getApplicationStatus = (eventId) => {
        const application = applications.find(app =>
            app.event_id === eventId && app.supplier_id === userData.id
        );
        return application ? application.status : null;
    };

    return (
        <>
            <Title>Favorites</Title>
            {isAllLoading && (
                <PageLoading />
            )}

            {(isCreatingContact || isCreatingFavorites) && (
                <LoadingOverlay isLoading={isCreatingContact || isCreatingFavorites} message="Processing..." />
            )}

            {!isAllLoading && (
                <>
                    <div className={`flex flex-col mb-5`}>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Favorites</h1>
                        <span className="mt-2 text-gray-600">Look at your favorite {userData.role === "Supplier" ? 'events' : 'suppliers'}</span>
                    </div>

                    {userData.role === "Event Planner" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {shop.map((shopItem, index) => {
                                const averageRating = calculateAverageRating(shopItem.id);
                                const reviewCount = getReviewCount(shopItem.id);

                                return (
                                    <Cards key={shopItem.id || index} className="group cursor-pointer">
                                        {/* Image */}

                                        <div className="relative">
                                            {applications.some(app =>
                                                app.supplier_id === shopItem.id &&
                                                events.some(event => event.id === app.event_id)
                                            ) && (
                                                    <div className="absolute top-3 left-3 z-10 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-green-700">
                                                        Applied
                                                    </div>
                                                )}

                                            <div className="relative overflow-hidden">
                                                {shopItem.supplier_background_image.length > 0 && (
                                                    <img
                                                        src={shopItem?.supplier_background_image}
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                        alt={`${shopItem.supplier_name} background`}
                                                    />
                                                )}
                                                {shopItem.supplier_background_image.length === 0 && (
                                                    <div className="w-full h-48 bg-gradient-to-r from-pink-500 to-violet-500"></div>
                                                )}
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

                                                {/* Action Button - FIXED: Added proper props */}
                                                <SupplierModal
                                                    className={`py-2 rounded-lg font-semibold w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                                    services={services[shopItem.id]}
                                                    supplierData={shopItem}  // Changed from supplier to supplierData
                                                    userData={userData}
                                                    reviews={shopReviews[shopItem.id]}
                                                    averageRating={averageRating}
                                                />
                                            </div>
                                        </div>
                                    </Cards>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {favoritesEvents.map((event, index) => {
                                const applicationStatus = getApplicationStatus(event.id);
                                const isApplied = applicationStatus !== null;

                                return (
                                    <div key={index} className="group flex flex-col justify-between transition-all duration-200 h-full w-full border border-gray-200 bg-white hover:shadow-2xl hover:-translate-y-3 p-6 rounded-lg">
                                        <div className="flex flex-col justify-between flex-1">
                                            <div className="relative">

                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <EventModal eventData={event} />
                                                        <button
                                                            onClick={(e) => handleChat(e, event.user_id, event.event_name)}
                                                            className='group hover:text-blue-600 transition-colors'
                                                        >
                                                            <MessageCircleMore className="text-gray-400 group-hover:text-blue-600" size={21} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleFavorites(e, event)}
                                                            className='group hover:text-red-600 transition-colors'
                                                        >
                                                            <Heart
                                                                className={`transition-all duration-200 ${likedEvents[event.id]
                                                                    ? 'fill-red-600 text-red-600'
                                                                    : 'text-gray-400 group-hover:text-red-600'
                                                                    }`}
                                                                size={21}
                                                            />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const favorite = favorites.find(fav => fav.event_id === event.id);
                                                            if (favorite) handleDelete(favorite.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-600"
                                                    >
                                                        <Trash width={20} height={20} />
                                                    </button>
                                                </div>

                                                {/* Event name and status */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
                                                    <span className="text-2xl font-bold text-gray-900 break-words">
                                                        {event.event_name}
                                                    </span>
                                                    <span className={`${event.event_status?.value === "upcoming" ? "bg-purple-600" :
                                                        event.event_status?.value === "planning" ? "bg-sky-500" :
                                                            "bg-green-500"
                                                        } rounded-full shadow-lg py-1 px-4 text-white text-sm whitespace-nowrap`}>
                                                        {event.event_status?.label || 'Unknown'}
                                                    </span>
                                                </div>

                                                {/* Event details */}
                                                <div className="space-y-4 mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="rounded-xl bg-blue-200 h-10 w-10 flex items-center justify-center text-blue-600 shrink-0">
                                                            <CalendarDays size={20} />
                                                        </span>
                                                        <span className="text-gray-900">
                                                            {event?.event_date?.date_preview?.join(", ")}<br />
                                                            {event?.event_time?.previewStartAndEnd}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="rounded-xl bg-green-200 h-10 w-10 flex items-center justify-center text-green-600 shrink-0">
                                                            <MapPin size={20} />
                                                        </span>
                                                        <span className="text-gray-700 break-words">{event.event_location}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="rounded-xl bg-yellow-200 h-10 w-10 flex items-center justify-center text-yellow-600 shrink-0">
                                                            <CircleDollarSign size={20} />
                                                        </span>
                                                        <span className="font-bold text-gray-900">₱ {event.event_budget}</span>
                                                    </div>

                                                    <div>
                                                        <div className="flex gap-2 items-center mb-3">
                                                            <Users className="text-gray-600 h-5 w-5" />
                                                            <span className="text-md text-gray-800">Looking for supplier:</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {event.event_categories?.map((category, index) => (
                                                                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                                                    {category.label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <span className="block px-2 mb-1 text-gray-600 font-bold">Description:</span>
                                                <p className="text-gray-600 break-words rounded-lg px-2 mb-5 min-h-[60px]">
                                                    {event.event_description?.length > 1 ? event.event_description : "No description provided"}
                                                </p>

                                                {userData.role === "Supplier" && (
                                                    <button
                                                        onClick={() => handleApply(event.id, event.user_id)}
                                                        disabled={
                                                            isApplied ||
                                                            (isApplying && applyingEventId === event.id) ||
                                                            !supplier?.is_verified
                                                        }
                                                        className={`flex items-center justify-center gap-2 text-center py-3 w-full ${isApplied
                                                            ? 'bg-blue-300 cursor-not-allowed'
                                                            : (isApplying && applyingEventId === event.id)
                                                                ? 'bg-blue-400 cursor-not-allowed'
                                                                : !supplier?.is_verified
                                                                    ? 'bg-blue-400 cursor-not-allowed'
                                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                            } text-white font-bold rounded-lg transition-colors duration-200`}
                                                    >
                                                        {isApplying && applyingEventId === event.id ? (
                                                            <>
                                                                <ClipLoader size={16} color="#ffffff" />
                                                                Applying...
                                                            </>
                                                        ) : isApplied ? (
                                                            applicationStatus
                                                        ) : !supplier?.is_verified ? (
                                                            'Account not verified'
                                                        ) : (
                                                            'Apply'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {!isFavoritesLoading && (
                <>
                    {userData.role === "Event Planner" ? (
                        shop.length === 0 && (
                            <div className="flex justify-center text-xl items-center py-[10rem] text-gray-500">
                                No favorite suppliers found.
                            </div>
                        )
                    ) : (
                        favoritesEvents.length === 0 && (
                            <div className="flex justify-center text-xl items-center py-[10rem] text-gray-500">
                                No favorite events found.
                            </div>
                        )
                    )}
                </>
            )}
        </>
    )
}