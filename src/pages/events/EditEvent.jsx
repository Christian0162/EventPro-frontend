import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import AddressAutoComplete from "../../components/AddressAutoComplete";
import Select from "react-select"
import { X, MessageCircleMore } from "lucide-react";
import PrimaryButton from "../../components/PrimaryButton";
import { Link } from "react-router-dom";
import useEvents from "../../hooks/useEvents";
import Loading from "../../components/Loading";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import Swal from "sweetalert2";
import SupplierModal from "../../components/SupplierModal";
import ReviewModal from "../../components/ReviewModal";

export default function EditEvent({ userData }) {

    const { id } = useParams();
    const [event_name, setEvent_name] = useState('')
    const [event_location, setEvent_location] = useState('')
    const [event_date, setEvent_date] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [event_status, setEvent_status] = useState(null)
    const [event_type, setEvent_type] = useState(null)
    const [event_description, setEvent_description] = useState('')
    const [categories, setCategories] = useState(null)
    const [event_budget, setEvent_budget] = useState('')
    const [tags, setTags] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [applications, setApplications] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [reviews, setReviews] = useState([])
    const [eventUser, setEventUser] = useState([])
    const [isGettingData, setIsGettingData] = useState(false)
    const { updateEvent, getEvent } = useEvents()

    const categoriesOptions = [
        { label: 'Catering', value: 'catering' },
        { label: 'Photography', value: 'photography' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Decoration', value: 'decoration' },
        { label: 'Security', value: 'security' },
        { label: 'Transportation', value: 'transportation' },
        { label: 'Audio/Visual', value: 'audiovisual' },
        { label: 'Venue', value: 'venue' },
    ];

    const statusOptions = [
        { label: 'Planning', value: 'planning' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Complete', value: 'complete' },
    ];

    const typeOptions = [
        { label: 'Corporate', value: 'corporate' },
        { label: 'Wedding', value: 'wedding' },
        { label: 'Birthday Party', value: 'birthday' },
        { label: 'Conference', value: 'conference' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Social Event', value: 'social' },
        { label: 'Other', value: 'other' },
    ];

    const addTag = () => {
        if (categories?.value.trim() && !tags.includes(categories?.value.trim())) {
            setTags([...tags, categories.value])
            setCategories(null)
        }
    }

    const removeTag = (index) => {
        setTags(tags.filter((tag, i) => i !== index))
    }

    useEffect(() => {
        const q = query(collection(db, "Applications"),
            where("event_id", "==", id))

        const unsubscribe = onSnapshot(q, (onsnapshot) => {
            const applications = onsnapshot.docs.map(app => ({ id: app.id, ...app.data() }))
            setApplications(applications)
        })

        return () => unsubscribe()

    }, [])

    useEffect(() => {

        setIsGettingData(true)


        let allReviews = {}

        const unsubscribe = onSnapshot(collection(db, "Shops"), async (snapshot) => {
            const shops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const filteredShops = shops.filter(shop => applications.some(app => app.user_id === shop.id))

            for (const reviews of filteredShops) {
                const snapShotReview = await getDocs(collection(db, "Shops", reviews.id, "Reviews"));
                const review = snapShotReview.docs.map(doc => ({ id: doc.id, ...doc.data() }))

                allReviews[reviews.id] = review

            }
            setReviews(allReviews)
            setSuppliers(filteredShops)
            setIsGettingData(false)
        })




        return () => unsubscribe()
    }, [applications])


    useEffect(() => {
        const loadEvent = async () => {
            try {
                setIsLoading(true)
                const data = await getEvent(id);

                if (data) {
                    setEventUser(data)
                    setEvent_name(data.event_name)
                    setEvent_location(data.event_location)
                    setEvent_date(data.event_date)
                    setEvent_status(data.event_status)
                    setEvent_type(data.event_type)
                    setEvent_budget(data.event_budget)
                    setEvent_description(data.event_description)
                    setTags(data.event_categories)
                    setStartTime(data.event_time.valueStartAndEnd[0])
                    setEndTime(data.event_time.valueStartAndEnd[1])
                }
            } catch (e) {
                console.log(e)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            loadEvent()
        }
    }, [id])

    const handleDate = (e) => {
        const dateString = e.target.value;
        const date = new Date(dateString)

        const years = date.getFullYear();
        const months = date.toLocaleDateString([], { month: 'long' })
        const days = date.toLocaleDateString([], { weekday: 'long' })

        const previewDate = [years, months, days]

        setEvent_date({
            date_value: dateString,
            date_preview: previewDate
        })

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const previewStartAndEnd = [
                new Date(`1970-01-01T${startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                new Date(`1970-01-01T${endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
            ].join(' - ')

            const valueStartAndEnd = [startTime, endTime]

            const newTime = ({ previewStartAndEnd, valueStartAndEnd })

            await updateEvent(id,
                event_name,
                event_location,
                event_date,
                newTime,
                event_status,
                event_type,
                event_budget,
                event_description,
                tags)
        }
        catch (e) {
            console.log(e)
        }
    }

    if (isLoading) {
        return <Loading />
    }

    const handleApprove = async (supplier_id) => {
        Swal.fire({
            title: 'Confirm Request',
            text: 'This action will confirm the request and notify the user.',
            icon: 'question',
            confirmButtonText: 'Approve',
            showCancelButton: true
        }).then(async (result) => {

            if (result.isConfirmed) {

                const q = query(collection(db, "Applications"),
                    where("event_id", "==", id),
                    where("user_id", "==", supplier_id))
                const snapShotApplications = await getDocs(q)
                const applications = snapShotApplications.docs.map(doc => ({ id: doc.id, ...doc.data() }))

                console.log(applications)

                for (const app of applications) {
                    const appRef = doc(db, "Applications", app.id);
                    await updateDoc(appRef, {
                        status: "Approved"
                    });

                    await addDoc(collection(db, "Notifications"), {
                        user_id: app.user_id,
                        avatar: 'A',
                        title: 'Your application has been approved!',
                        message: `The event "${event_name}" you applied for has been approved.`,
                        timestamp: serverTimestamp(),
                        unread: true
                    });
                }
                Swal.fire('Success', 'The supplier has been approved and notified.', 'success')
            }
        })

    }

    const handleReject = async (supplier_id) => {
        Swal.fire({
            title: 'Reject Request',
            text: 'This action will reject the request and notify the user.',
            icon: 'question',
            confirmButtonText: 'Reject',
            showCancelButton: true
        }).then(async (result) => {

            if (result.isConfirmed) {

                const q = query(collection(db, "Applications"),
                    where("event_id", "==", id),
                    where("user_id", "==", supplier_id))
                const snapShotApplications = await getDocs(q)
                const applications = snapShotApplications.docs.map(doc => ({ id: doc.id, ...doc.data() }))

                console.log(applications)

                for (const app of applications) {
                    const appRef = doc(db, "Applications", app.id);
                    await deleteDoc(appRef);

                    await addDoc(collection(db, "Notifications"), {
                        user_id: app.user_id,
                        avatar: 'A',
                        title: 'Application Rejected',
                        message: `We're sorry, your application for the event "${event_name}" has been rejected.`,
                        timestamp: serverTimestamp(),
                        unread: true
                    });

                }
                Swal.fire('Reject', 'The supplier has been rejected and notified.', 'success')
            }
        })
    }

    const calculateAverageRating = (shopId) => {
        const Allreviews = reviews[shopId] || [];
        const validRatings = Allreviews
            .map(review => Number(review.rating))
            .filter(rating => !isNaN(rating) && rating > 0);

        if (validRatings.length === 0) return "N/A";

        const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
        return average.toFixed(1);
    };

    const getReviewCount = (shopId) => {
        const Allreviews = reviews[shopId] || [];
        return Allreviews.length;
    };

    console.log(isGettingData)


    return (
        <>
            <form onSubmit={handleSubmit} className="w-full h-full mt-5 space-y-5">

                {/* event name and location */}
                <div className="justify-between gap-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
                    {/* event name */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="event_name">Event Name</label>
                        <input type="text" name="event_name" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black"
                            required
                            placeholder="Event name"
                            onChange={(e) => setEvent_name(e.target.value)}
                            value={event_name} />
                    </div>

                    {/* location */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="location">Location</label>
                        <AddressAutoComplete setLocation={setEvent_location} default_location={event_location} className={'mt-2 py-1 rounded-sm'} />
                    </div>
                </div>

                {/* date, time and status */}
                <div className="gap-3 items-center grid grid-cols-1 sm:grid-cols-3">

                    {/* date */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="date">Date</label>
                        <input type="date" name="event_date" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black"
                            required
                            onChange={handleDate}
                            value={event_date.date_value}
                        />
                    </div>

                    {/* time */}
                    <div className="flex flex-col w-full">
                        <div className="gap-2 grid grid-cols-1 sm:grid-cols-2">
                            <div>
                                <label htmlFor="time">Time Start</label>
                                <input type="time" name="event_time" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black"
                                    required
                                    onChange={(e) => setStartTime(e.target.value)}
                                    value={startTime}
                                />
                            </div>
                            <div>
                                <label htmlFor="time">Time End</label>
                                <input type="time" name="event_time" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black"
                                    required
                                    onChange={(e) => setEndTime(e.target.value)}
                                    value={endTime}
                                />
                            </div>
                        </div>
                    </div>

                    {/* status */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="status">Status</label>
                        <Select
                            name="event_status"
                            value={event_status}
                            onChange={setEvent_status}
                            options={statusOptions}
                            placeholder="Upcoming"
                            className="mt-2"
                        />
                    </div>
                </div>

                {/* type */}
                <div className="flex flex-col w-full">
                    <label htmlFor="type" className="mb-2">Type</label>
                    <Select
                        name="event_type"
                        options={typeOptions}
                        value={event_type}
                        onChange={setEvent_type}
                        placeholder="Event Type"
                    />
                </div>

                {/* Budget */}
                <div className="flex flex-col w-full">
                    <label htmlFor="type">Budget</label>
                    <input placeholder="₱ 25,500" type="text" name="event_budget" className="mt-2 focus:ring-2 focus:outline-none px-5 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black"
                        required
                        onChange={(e) => setEvent_budget(e.target.value)}
                        value={event_budget}
                    />
                </div>

                {/* description */}
                <div className="flex flex-col w-full">
                    <label htmlFor="description">Description</label>
                    <textarea name="event_description" id="desctipion" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-38 py-2 ring-black"
                        required
                        onChange={(e) => setEvent_description(e.target.value)}
                        value={event_description}
                    ></textarea>
                </div>

                {/* sepcify supplier */}
                <div className="flex flex-col space-y-4">
                    <span className="block font-medium">Specify the supplier you are looking for:</span>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(index)}
                                        className="hover:bg-blue-100 rounded-full p-1 transition-colors"
                                    >
                                        <X width={14} height={14} strokeWidth={2} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Add Supplier Controls */}
                    <div className="flex md:grid md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2">
                            <Select
                                options={categoriesOptions}
                                value={categories}
                                onChange={setCategories}
                                placeholder="Select supplier category"
                                isClearable
                                className="w-full"
                            />
                        </div>
                        <button
                            type="button"
                            className="py-2 px-4 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onClick={addTag}
                            disabled={!categories || !categories.value.trim()}
                        >
                            Add Supplier
                        </button>
                    </div>
                </div>

                <div className="w-full sm:w-full md:w-full lg:w-[40rem] grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <PrimaryButton>Update Event</PrimaryButton>
                    <Link to={'/events'} className="flex items-center py-2 w-full text-center justify-center border-1 hover:boder-1 hover:border-blue-500 rounded-sm">
                        <span className="block">Cancel</span>
                    </Link>
                </div>
            </form>

            {/* Event Suppliers Section */}
            <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">Event Suppliers</h3>

                {suppliers.filter(supplier => applications.some(app => app.user_id === supplier.id && app.status === "Approved")).length > 0 && (
                    <div className="space-y-3">
                        {suppliers.filter(supplier => applications.some(app => app.user_id === supplier.id && app.status === "Approved")).map((supplier) => {

                            const averageRating = calculateAverageRating(supplier.id);
                            const reviewCount = getReviewCount(supplier.id);

                            return (
                                <div key={supplier.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {supplier.supplier_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{supplier.supplier_name}</p>
                                            <p className="text-sm text-gray-500 capitalize">{supplier.supplier_type.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm gap-3">
                                        <SupplierModal className={'px-4 py-1 text-sm rounded-md'} supplierData={supplier} applications={applications} userData={userData.role} reviews={reviews[supplier.id]} averageRating={averageRating} />
                                        <ReviewModal supplier_id={supplier.id} event_name={event_name} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
                {isGettingData && (
                    <div className="flex justify-center">
                        <div className="border border-t-2 rounded-full h-8 w-8 border-blue animate-spin"></div>
                    </div>
                )}
                {!isGettingData && suppliers.filter(supplier => applications.some(app => app.user_id === supplier.id && app.status === "Approved")).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No suppliers have applied for this event yet.</p>
                    </div>
                )}

                {/* Suppliers who applied for this event - separate section */}
                <div className="mt-6">
                    <h4 className="text-md font-medium mb-3">Suppliers who applied for this event</h4>
                    {suppliers.length > 0 && (
                        <div className="space-y-3">
                            {suppliers.filter(supplier => applications.some(app => app.user_id === supplier.id && app.status === "Pending")).map((supplier) => {
                                const averageRating = calculateAverageRating(supplier.id);
                                const reviewCount = getReviewCount(supplier.id);

                                return (
                                    <div key={supplier.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {supplier.supplier_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{supplier.supplier_name}</p>
                                                <p className="text-sm text-gray-500 capitalize">{supplier.supplier_type?.label}</p>
                                            </div>
                                        </div>


                                        <div className="flex items-center space-x-2">
                                            <SupplierModal className={'px-4 py-1 text-sm rounded-md'} supplierData={supplier} applications={applications} userData={userData.role} reviews={reviews[supplier.id]} averageRating={averageRating} />
                                            <button
                                                onClick={() => handleApprove(supplier.id)}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(supplier.id)}
                                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {isGettingData && (
                        <div className="flex justify-center">
                            <div className="border border-t-2 rounded-full h-8 w-8 border-blue animate-spin"></div>
                        </div>
                    )}
                    {!isGettingData && suppliers.filter(supplier => applications.some(app => app.user_id === supplier.id && app.status === "Pending")).length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                            <p>No new supplier applications for this event.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}