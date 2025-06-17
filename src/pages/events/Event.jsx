import { Link } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Title } from "react-head";
import { CalendarDays, MapPin, CircleDollarSign, Trash, Users, MessageCircleMore } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import { db, auth } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { collection, onSnapshot, serverTimestamp, addDoc, query, where, getDoc, doc, getDocs } from "firebase/firestore";
import { ClipLoader } from "react-spinners";
import useEvents from "../../hooks/useEvents";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import EventModal from "../../components/EventModal";

export default function Event({ userData }) {

    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true)
    const [applications, setApplications] = useState([])
    const [supplierData, setSupplierData] = useState({})
    const [gettingShop, setGettingShop] = useState(false)
    const navigate = useNavigate()
    const { deleteEvent } = useEvents()


    useEffect(() => {
        const eventRef = collection(db, "Events")
        setLoading(true)
        const unsubscribe = onSnapshot(eventRef, (querySnapShot) => {
            const data = querySnapShot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            if (userData.role == "Event Planner") {
                const filteredData = data.filter(event => event.user_id === auth.currentUser.uid)
                setUserEvents(filteredData)
            }
            else {
                setUserEvents(data)

            }
            setLoading(false)

        }, (e) => {
            console.log(e)
            setLoading(false)
        })

        return () => unsubscribe()

    }, [userData])

    useEffect(() => {

        const q = query(collection(db, "Applications"),
            where("user_id", "==", auth.currentUser.uid))

        const unsubscribe = onSnapshot(q, (onsnapshot) => {
            const applications = onsnapshot.docs.map(app => ({ id: app.id, ...app.data() }))
            setApplications(applications)
        })

        return () => unsubscribe()

    }, [])

    const handleDelete = async (id) => {
        deleteEvent(id, setUserEvents)
    }

    const handleApply = async (event_id, user_id) => {

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
                    await addDoc(collection(db, "Applications"), {
                        user_id: auth.currentUser.uid,
                        event_id: event_id,
                        AppliedAt: serverTimestamp(),
                        status: 'Pending'
                    })

                    await addDoc(collection(db, "Notifications"), {
                        avatar: auth.currentUser.uid.charAt(0).toUpperCase(),
                        message: `The supplier "${supplierData.supplier_name}" applied to your event.`,
                        timestamp: serverTimestamp(),
                        title: 'You have a new application for your event.',
                        unread: true,
                        user_id: user_id
                    })

                    Swal.fire('Applied!', 'Your application has been submitted.', 'success');
                }
                catch (e) {

                    Swal.fire('Error!', 'Failed to apply. Please try again.', 'error');
                    console.error("Apply error:", e);
                }
            }
        });
    }

    useEffect(() => {
        setGettingShop(true)
        const fetchData = async () => {
            const fetchShop = await getDoc(doc(db, "Shops", auth.currentUser.uid))

            if (fetchShop.exists()) {
                setSupplierData({ ...fetchShop.data(), id: fetchShop.id })
                setGettingShop(false)
            }
            else {
                setGettingShop(false)
            }

        }
        fetchData()
    }, [])

    const handleChat = async (e, event_id, event_name) => {
        e.preventDefault()

        const q = query(collection(db, "Contacts"),
            where("user_id", "==", auth.currentUser?.uid),
            where("contact_id", "==", event_id)
        )

        // const contactsRef = collection(db, "Contacts");

        //         const q = query(contactsRef,
        //             where("user_id", "==", selectedContact.contact_id),
        //             where("contact_id", "==", auth.currentUser.uid)
        //         );

        const querySnapShot = await getDocs(q)

        if (querySnapShot.empty) {
            console.log('test')
            await addDoc(collection(db, "Contacts"), {
                user_id: auth.currentUser.uid,
                contact_id: event_id,
                name: event_name,
                avatar: event_name.slice(0, 1).toUpperCase(),
                last_message: "",
                isActive: false,
                createdAt: serverTimestamp()
            })

            navigate(`/chats/${supplierData.id}`)
        }
        else {
            console.log('wa ni gana')
            navigate(`/chats/${supplierData.id}`)

        }
    }

    console.log(gettingShop)
    return (
        <>
            <Title>Event</Title>

            {loading && (
                <div className="absolute top-95 lg:top-85 left-0 right-0 flex items-center justify-center">
                    <ClipLoader size={55} color="#1d5cc7" />
                </div>
            )}

            <div className="flex justify-between md:items-center lg:items-center flex-col lg:flex-row md:flex-row">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Events</h1>

                    {userEvents.length === 0 && (
                        <span className="mt-2 text-gray-600">Create and manage your events in one place</span>
                    )}
                </div>

                {userData.role === "Event Planner" && (
                    <Link to={'/events/create'}>
                        <button className="bg-blue-600 text-white rounded-md px-5 lg:px-10 md:px-8 sm:px-7 py-2 lg:py-3 font-bold mt-3">Create New Event</button>
                    </Link>
                )}

            </div>

            {userEvents.length > 0 && (
                <div className="grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid gap-5">
                    {userEvents.map((events, index) => (
                        <div
                            key={index}
                        >
                            {/* event cards */}
                            <div className="group transition-all duration-200 h-full w-full border-1 border-gray-200 hover:shadow-2xl hover:-translate-y-3 p-6 rounded-lg mt-6 ">
                                <div className="flex justify-between">
                                    {events.user_id !== auth.currentUser.uid && (
                                        <div className="relative flex items-center gap-2">
                                            <EventModal eventData={events} />

                                            <button onClick={(e) => handleChat(e, events.user_id, events.event_name)} className='group'>
                                                <MessageCircleMore className="trasition-all duration-200 text-gray-400 group-hover:text-blue-600" size={21} />
                                            </button>

                                        </div>
                                    )}

                                    <div className={`${userData.role === "Supplier" ? 'hidden' : 'ml-auto'}`}>
                                        <button onClick={() => handleDelete(events.id)} className="self-end transition-all duration-200 opacity-0 group-hover:opacity-100 active:text-violet-600"><Trash width={24} height={24} strokeWidth={2} /></button>
                                    </div>
                                </div>

                                {/* event name */}
                                <div className="flex justify-between items-center mb-7 mt-3">
                                    <span className="block text-3xl font-bold text-gray-900">{events.event_name.length > 10 ? events.event_name.slice(0, 10) + ".." : events.event_name}</span>
                                    <span className={`${events.event_status.value === "upcoming" ? "bg-purple-600" : events.event_status.value === "planning" ? "bg-sky-500" : "bg-green-500"} rounded-full shadow-lg py-1 px-5 text-white`}>{events.event_status.value}</span>
                                </div>

                                {/* event date and time */}
                                <div className="flex flex-col space-y-5">
                                    <div className="flex space-x-2 items-center gap-2">
                                        <span className="rounded-xl bg-blue-200 h-10 w-10 flex items-center justify-center text-blue-600"><CalendarDays /></span>
                                        <span className="text-gray-900 font-bold">{events?.event_date?.date_preview?.join(", ")}
                                            <br></br> {events?.event_time?.previewStartAndEnd}</span>
                                    </div>

                                    {/* event location */}
                                    <div className="flex space-x-2 items-center gap-2">
                                        <span className="rounded-xl bg-green-200 h-10 w-10 flex items-center justify-center text-green-600"><MapPin /></span>
                                        <span className="text-gray-700">{events.event_location}</span>
                                    </div>

                                    {/* event budget */}
                                    <div className="flex space-x-2 items-center gap-2">
                                        <span className="rounded-xl bg-yellow-200 h-10 w-10 flex items-center justify-center text-yellow-600"><CircleDollarSign /></span>
                                        <span className="font-bold text-gray-900">₱ {events.event_budget}</span>
                                    </div>

                                    {/* event suppliers */}
                                    <div>
                                        <div className="flex gap-2 items-center mb-5">
                                            <Users className="text-gray-600 h-5 w-5" />
                                            <span className="text-md text-gray-800">Looking for supplier:</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-2">
                                            {events.event_categories.map((categories, index) => (
                                                <span key={index} className="text-center items-center w-36  sm:w-34 md:w-34 lg:w-30 py-1 rounded-full text-sm font-medium bg-gray-300 text-gray-500">{categories}</span>
                                            ))}
                                        </div>

                                        {/* description */}

                                        <p className="mt-5 text-gray-800 break-wordsrounded-lg px-2 mb-5">{events.event_description.length > 1 ? events.event_description : "No description provided"}</p>
                                        {userData.role === "Event Planner" && (
                                            <Link to={`/events/edit/${events.id}`} className="block text-center mt-5 py-3 w-full bg-blue-600 text-white font-bold rounded-lg">Manage Event</Link>
                                        )}

                                        {userData.role === "Supplier" && (
                                            <>
                                                {gettingShop && (
                                                    <div className="flex justify-center">
                                                        <div className="w-10 h-10 rounded-full border border-t-2 animate-spin border-blue-600"></div>
                                                    </div>
                                                )}

                                                {!gettingShop && supplierData?.supplier_name?.length > 0 && (
                                                    <button onClick={() => handleApply(events.id, events.user_id)} disabled={applications.find(app => app.event_id === events.id)?.status === "Pending" || applications.find(app => app.event_id === events.id)?.status === "Approved"} className={`block text-center mt-5 py-3 w-full ${applications.find(app => app.event_id === events.id)?.status === "Pending" || applications.find(app => app.event_id === events.id)?.status === "Approved" ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-lg`}>
                                                        {applications.find(app => app.event_id === events.id)?.status === "Pending" ? 'Pending' : applications.find(app => app.event_id === events.id)?.status === "Approved" ? 'Approved' : 'Apply'}
                                                    </button>
                                                )}

                                                {!gettingShop && !supplierData.supplier_name?.length > 0 &&  (
                                                    <span className="block text-center bg-gray-200 py-2 relative top-5 rounded-md text-gray-600">
                                                        Need shop to apply
                                                    </span>
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

            {!loading && userEvents.length === 0 && (
                <div className="absolute top-90 lg:top-85 left-0 right-0 flex items-center justify-center">
                    <span className="block text-gray-500 text-2xl">No events.</span>
                </div>
            )}
        </>
    );
};