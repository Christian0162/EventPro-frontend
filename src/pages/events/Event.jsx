import { Link } from "react-router-dom";
import { Title } from "react-head";
import { CalendarDays, MapPin, CircleDollarSign, Trash, Users, MessageCircleMore, Heart } from "lucide-react";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { collection, onSnapshot, serverTimestamp, addDoc, query, where, getDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useFetchEvents } from "../../hooks/useEvents";
import { useDeleteEvent } from "../../hooks/useEvents";
import { useNavigate } from "react-router-dom";
import EventModal from "../../components/EventModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useFetchAllApplication } from "../../hooks/useApplication";
import PageLoading from "../../components/PageLoading";

export default function Event({ userData }) {
    const [supplierData, setSupplierData] = useState({})
    const [gettingShop, setGettingShop] = useState(false)
    const [isCreatingFavorites, setIsCreatingFavorites] = useState(false)
    const [isCreatingContact, setIsCreatingContact] = useState(false)
    const [likedEvents, setLikedEvents] = useState({});
    const [allEvents, setAllEvents] = useState([])
    const [isApplying, setIsApplying] = useState(false)
    const [applyingEventId, setApplyingEventId] = useState(null)
    const { deleteEvent } = useDeleteEvent()
    const { events, isLoading: isEventLoading } = useFetchEvents()
    const { applications: supplierApplications, isLoading: isApplicationLoading } = useFetchAllApplication()
    const navigate = useNavigate()

    const applications = supplierApplications.filter(app => app.supplier_id === userData.id)

    const isAllLoading = isEventLoading || isApplicationLoading

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

    useEffect(() => {
        if (userData?.role === "Event Planner") {
            const createdEvents = events.filter(event => event.user_id === userData.id)
            setAllEvents(createdEvents)
        } else {
            const today = new Date().toISOString().split("T")[0];

            const activeEvents = events.filter(event =>
                event.status === "active" &&
                event.event_date?.date_value < today &&
                event.event_status?.value?.toLowerCase() !== "completed"
            ); setAllEvents(activeEvents)
        }
    }, [events, userData])

    const handleDelete = async (id) => {
        deleteEvent(id)
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


    const handleApply = async (event_id, user_id) => {
        setIsApplying(true)
        setApplyingEventId(event_id) // Set the event ID that's being applied to

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
                        message: `The supplier "${supplierData.supplier_name}" applied to your event.`,
                        createdAt: serverTimestamp(),
                        title: 'You have a new application for your event.',
                        unread: true,
                        user_id: user_id
                    })

                    Swal.fire('Applied!', 'Your application has been submitted.', 'success');
                } catch (e) {
                    Swal.fire('Error!', 'Failed to apply. Please try again.', 'error');
                    console.error("Apply error:", e);
                } finally {
                    setIsApplying(false)
                    setApplyingEventId(null) // Reset applying state
                }
            } else {
                setIsApplying(false)
                setApplyingEventId(null) // Reset applying state if cancelled
            }
        });
    }

    useEffect(() => {
        setGettingShop(true)
        const fetchData = async () => {
            const fetchShop = await getDoc(doc(db, "shops", userData.id))

            if (fetchShop.exists()) {
                setSupplierData({ ...fetchShop.data(), id: fetchShop.id })
                setGettingShop(false)
            } else {
                setGettingShop(false)
            }
        }
        fetchData()
    }, [])

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
                navigate(`/chats/${supplierData.id}`)
            } else {
                navigate(`/chats/${supplierData.id}`)
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

    return (
        <>
            <Title>Event</Title>

            {isAllLoading && (
                <PageLoading />
            )}

            {(isCreatingContact || isCreatingFavorites) && (
                <LoadingOverlay isLoading={isCreatingContact || isCreatingFavorites} message="Processing..." />
            )}

            {!isAllLoading && (
                <>
                    <div className="flex justify-between md:items-center lg:items-center flex-col lg:flex-row md:flex-row">
                        <div className="flex flex-col">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Events</h1>

                            <span className="mt-2 text-gray-600">
                                {userData.verification_status === "verified" ?
                                    'Create and manage your events in one place' :
                                    'Verify account to create and manage your events in one place'}
                            </span>

                        </div>

                        {userData.role === "Event Planner" && userData.verification_status === "verified" && (
                            <Link to={'/events/create'}>
                                <button className="bg-blue-600 text-white rounded-md px-5 lg:px-10 md:px-8 sm:px-7 py-2 lg:py-3 font-semibold mt-3">Create New Event</button>
                            </Link>
                        )}

                    </div>

                    {events?.length > 0 && (
                        <div className="grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid gap-5">
                            {allEvents.map((events, index) => (
                                <div key={index}>
                                    {/* event cards */}
                                    <div className="group flex justify-between transition-all duration-200 h-full w-full border-1 bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-3 p-6 rounded-lg mt-6 ">
                                        <div className="flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between">
                                                    {events.user_id !== userData.id && (
                                                        <div className="relative flex items-center gap-2">
                                                            <EventModal eventData={events} />

                                                            <button onClick={(e) => handleChat(e, events.user_id, events.event_name)} className='group'>
                                                                <MessageCircleMore className="trasition-all duration-200 text-gray-400 group-hover:text-blue-600" size={21} />
                                                            </button>

                                                            <button onClick={(e) => handleFavorites(e, events)} className='group transparent'>
                                                                <Heart
                                                                    className={`transition-all duration-200 ${likedEvents[events.id]
                                                                        ? 'fill-red-600 opacity-100 text-red-600'
                                                                        : 'opacity-50 text-gray-800 group-hover:text-red-600 group-hover:opacity-60'
                                                                        }`}
                                                                    size={21}
                                                                />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className={`${userData.role === "Supplier" ? 'hidden' : 'ml-auto'}`}>
                                                        <button onClick={() => handleDelete(events.id)} className="self-end transition-all duration-200 opacity-0 group-hover:opacity-100 active:text-violet-600"><Trash width={24} height={24} strokeWidth={2} /></button>
                                                    </div>
                                                </div>

                                                {/* event name */}
                                                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row justify-between items-center gap-3 mb-7 mt-3">
                                                    <span className="block text-3xl font-bold text-gray-900">{events.event_name.length > 10 ? events.event_name.slice(0, 10) + ".." : events.event_name}</span>
                                                    <span className={`${events.event_status.value === "upcoming" ? "bg-purple-600" : events.event_status.value === "planning" ? "bg-sky-500" : "bg-green-500"} rounded-full shadow-lg py-1 px-5 text-white`}>{events.event_status.label}</span>
                                                </div>

                                                {/* event date and time */}
                                                <div className="flex flex-col justify-between">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex space-x-2 items-center gap-2">
                                                            <span className="rounded-xl bg-blue-200 h-10 w-10 flex items-center justify-center text-blue-600"><CalendarDays /></span>
                                                            <span className="text-gray-900 font-bold">{events?.event_date?.date_preview?.join(", ")}
                                                                <br></br> {events?.event_time?.previewStartAndEnd}</span>
                                                        </div>

                                                        {/* event location */}
                                                        <div className="flex space-x-2 items-center gap-2">
                                                            <span className="rounded-xl bg-green-200 h-10 w-10 flex items-center justify-center shrink-0 text-green-600"><MapPin /></span>
                                                            <span className="text-gray-700 f">{events.event_location}</span>
                                                        </div>

                                                        {/* event budget */}
                                                        <div className="flex space-x-2 items-center gap-2">
                                                            <span className="rounded-xl bg-yellow-200 h-10 w-10 flex items-center justify-center text-yellow-600"><CircleDollarSign /></span>
                                                            <span className="font-bold text-gray-900">₱ {events.event_budget}</span>
                                                        </div>

                                                        {/* event suppliers */}
                                                        {/* event suppliers */}
                                                        <div>
                                                            <div className="flex gap-2 items-center mb-5">
                                                                <Users className="text-gray-600 h-5 w-5" />
                                                                <span className="text-md text-gray-800">Looking for supplier:</span>
                                                            </div>

                                                            {/* categories */}
                                                            <div className="flex flex-wrap gap-3 mt-2">
                                                                {events.event_categories?.filter(category => category?.label).length > 0 ? (
                                                                    events.event_categories
                                                                        .filter(category => category?.label)
                                                                        .map((category, index) => (
                                                                            <span
                                                                                key={index}
                                                                                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                                                                            >
                                                                                {category.label}
                                                                            </span>
                                                                        ))
                                                                ) : (
                                                                    <span className="text-gray-500 text-sm italic">No categories selected for this event</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="block px-2 mb-1 text-gray-600 font-bold">Description:</span>
                                                <p className="text-gray-600 break-wordsrounded-lg px-2 mb-5">{events.event_description.length > 1 ? events.event_description : "No description provided"}</p>

                                                {userData.role === "Event Planner" && (
                                                    <Link to={`/events/edit/${events.id}`} className="block text-center py-3 w-full bg-blue-600 text-white font-bold rounded-lg">Manage Event</Link>
                                                )}

                                                {userData.role === "Supplier" && (
                                                    <>
                                                        {!gettingShop ? (
                                                            supplierData?.supplier_name?.length > 0 ? (
                                                                <button
                                                                    onClick={() => handleApply(events.id, events.user_id)}
                                                                    disabled={
                                                                        applications.find(app => app.event_id === events.id)?.status === "Pending" ||
                                                                        applications.find(app => app.event_id === events.id)?.status === "Approved" ||
                                                                        (isApplying && applyingEventId === events.id) ||
                                                                        !supplierData.is_verified
                                                                    }
                                                                    className={`flex items-center justify-center gap-2 text-center py-2 w-full ${applications.find(app => app.event_id === events.id)?.status === "Pending" ||
                                                                        applications.find(app => app.event_id === events.id)?.status === "Approved"
                                                                        ? 'bg-blue-300 cursor-not-allowed'
                                                                        : (isApplying && applyingEventId === events.id)
                                                                            ? 'bg-blue-400 cursor-not-allowed'
                                                                            : !supplierData.is_verified
                                                                                ? 'bg-blue-400 cursor-not-allowed'
                                                                                : 'bg-blue-600 hover:bg-blue-700'
                                                                        } text-white font-bold rounded-lg`}
                                                                >
                                                                    {isApplying && applyingEventId === events.id ? (
                                                                        <>
                                                                            <ClipLoader size={16} color="#ffffff" />
                                                                            Applying...
                                                                        </>
                                                                    ) : applications.find(app => app.event_id === events.id)?.status === "Pending" ? (
                                                                        'Pending'
                                                                    ) : applications.find(app => app.event_id === events.id)?.status === "Approved" ? (
                                                                        'Approved'
                                                                    ) : !supplierData.is_verified ? (
                                                                        'Account not verified'
                                                                    ) : (
                                                                        'Apply'
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <Link
                                                                    to={'/shop'}
                                                                    className="block text-center bg-gray-200 py-2 rounded-md transition-all text-gray-600 hover:bg-blue-600 hover:text-white"
                                                                >
                                                                    Need shop to apply
                                                                </Link>
                                                            )
                                                        ) : (
                                                            <div className="py-2 bg-blue-400 rounded-lg flex justify-center items-center">
                                                                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span className="ml-3 text-white font-medium">Processing...</span>
                                                            </div>
                                                        )}

                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isAllLoading && allEvents?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-[12rem] text-gray-500">
                            <span className="text-2xl mb-4">No events found.</span>
                            {userData.verification_status === "unverified" && userData.role !== "Supplier" && (
                                <a href="/verify"
                                    className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors duration-200"
                                >
                                    Verify Account
                                </a>
                            )}
                        </div>
                    )}

                </>
            )}
        </>
    );
};
