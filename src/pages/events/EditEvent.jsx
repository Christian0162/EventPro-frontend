import { useState, useEffect } from "react"
import AddressAutoComplete from "../../components/AddressAutoComplete";
import Select from "react-select"
import { X, Calendar, Clock, MapPin, Tag, Users, FileText, Send } from "lucide-react";
import PrimaryButton from "../../components/PrimaryButton";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Swal from "sweetalert2";
import { useFetchEvents, useUpdateEvent } from "../../hooks/useEvents";
import SupplierModal from "../../components/SupplierModal";
import { Review } from '../../components/ReviewModal'
import { useNavigate, useParams, Link } from "react-router-dom";
import { useFetchReviews } from "../../hooks/useReviews";
import { useFetchSupplierServices, useFetchSuppliers } from "../../hooks/useSupplier";
import ContractModal from "../../components/ContractModal";
import { useFetchContract } from "../../hooks/useContract";
import { statusOptions, SupplierOptions } from "../../constants/categories";
import { RejectReview } from "../../components/ReviewModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useFetchUserProfiles } from "../../hooks/useProfile";
import { useFetchUsers } from "../../hooks/useUsers";
import ProfileHover from "../../components/ProfileHover";
import PageLoading from "../../components/PageLoading";
import { UpdateEventBackground } from "../../components/UpdateModal";

export default function EditEvent({ userData }) {

    const navigate = useNavigate()

    const { id } = useParams();
    const [event_name, setEvent_name] = useState('')
    const [event_location, setEvent_location] = useState('')
    const [event_date, setEvent_date] = useState('')
    const [eventBackground, setEventBackround] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [event_status, setEvent_status] = useState(null)
    const [event_type, setEvent_type] = useState(null)
    const [event_description, setEvent_description] = useState('')
    const [categories, setCategories] = useState(null)
    const [event_budget, setEvent_budget] = useState('')
    const [tags, setTags] = useState([])
    const [applications, setApplications] = useState([])
    const [eventData, setEventData] = useState([])
    const { contracts } = useFetchContract()
    const { reviews } = useFetchReviews()
    const { services } = useFetchSupplierServices()
    const { suppliers } = useFetchSuppliers()
    const { events, isLoading } = useFetchEvents(userData.id)
    const [suggestedEvents, setSuggestedEvents] = useState([])
    const { updateEvent, isLoading: isUpdating } = useUpdateEvent()
    const [hoverState, setHoverState] = useState({ id: null, section: null });
    const { users } = useFetchUsers()
    const { userProfiles } = useFetchUserProfiles()

    const data = events.find(event => event.id === id)

    console.log(tags)

    useEffect(() => {
        if (!suppliers?.length || !tags?.length) return;

        const suggestedEvents = suppliers.filter(supplier =>
            tags.some(tag =>
                tag?.value?.toLowerCase() === supplier?.supplier_type?.value?.toLowerCase()
            )
        );

        setSuggestedEvents(suggestedEvents);
    }, [suppliers, tags]);


    console.log(tags)
    console.log(suppliers)

    const addTag = () => {
        if (categories?.value.trim() && !tags.some(tag => tag.value === categories.value)) {
            setTags([...tags, categories]);
            setCategories(null);
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((tag, i) => i !== index))
    }

    useEffect(() => {
        const q = query(collection(db, "applications"),
            where("event_id", "==", id))

        const unsubscribe = onSnapshot(q, (onsnapshot) => {
            const applications = onsnapshot.docs.map(app => ({ id: app.id, ...app.data() }))
            setApplications(applications)
        })

        return () => unsubscribe()

    }, [])

    useEffect(() => {
        if (data) {
            setEventData(data)
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
            setEventBackround(data.event_background)
        }

    }, [data])

    const handleDate = (e) => {
        const dateString = e.target.value;
        const date = new Date(dateString)

        const years = date.getFullYear();
        const months = date.toLocaleDateString([], { month: 'long' })
        const days = date.getDate()

        const previewDate = [years, months, days]

        setEvent_date({
            date_value: dateString,
            date_preview: previewDate
        })

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (startTime === endTime) {
                Swal.fire({
                    title: "Invalid Time",
                    text: "Start time and end time cannot be the same.",
                    icon: "error",
                });
                return; // stop submission
            }

            const previewStartAndEnd = [
                new Date(`1970-01-01T${startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                new Date(`1970-01-01T${endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
            ].join(' - ')

            const valueStartAndEnd = [startTime, endTime]

            const newTime = ({ previewStartAndEnd, valueStartAndEnd })

            const data = {
                event_name: event_name,
                event_location: event_location,
                event_date: event_date,
                event_time: newTime,
                event_status: event_status,
                event_type: event_type,
                event_budget: event_budget,
                event_description: event_description,
                event_categories: tags,
            }

            updateEvent(id, data)
        }

        catch (e) {
            console.error(e)
        }

    }

    const handleApprove = async (supplier) => {
        Swal.fire({
            title: 'Approve',
            text: 'This action you will be redirecting to contract',
            icon: 'question',
            showCancelButton: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                return navigate(`/events/${id}/contract/${supplier.id}`)
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

    // Background images for header - you can replace these with your actual images
    const headerBackgrounds = [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ];

    const headerBackground = headerBackgrounds[Math.floor(Math.random() * headerBackgrounds.length)];

    return (
        <>
            {isLoading && (
                <PageLoading />
            )}

            {!isLoading && (
                <>
                    {/* Header with Background Image */}
                    <div
                        className="relative h-64 rounded-xl mb-8 overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${eventBackground || headerBackground})` }}
                    >

                        <div className="absolute inset-0 bg-blue-900/30"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center px-8">
                            <h1 className="text-4xl font-bold text-white mb-2">Manage Events</h1>
                            <p className="text-blue-100 text-lg">Edit and manage your event details</p>
                            <div className="flex items-center mt-4 space-x-4 text-white">
                                <div className="flex items-center">
                                    <Calendar size={18} className="mr-2" />
                                    <span>{event_date?.date_preview?.join(' ') || 'Select date'}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin size={18} className="mr-2" />
                                    <span>{event_location || 'Add location'}</span>
                                </div>
                            </div>
                        </div>
                        <UpdateEventBackground id={id} className={`absolute top-4 right-5 z-50`} />

                    </div>


                    <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg mb-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FileText className="mr-2 text-blue-600" size={24} />
                                Event Details
                            </h2>
                            <p className="text-gray-600 mt-1">Update your event information</p>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full h-full space-y-6">
                            {/* event name and location */}
                            <div className="justify-between gap-6 grid grid-cols-1 md:grid-cols-2">
                                {/* event name */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="event_name" className="text-sm font-medium text-gray-700 mb-2">Event Name</label>
                                    <input
                                        type="text"
                                        name="event_name"
                                        className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        required
                                        placeholder="Enter event name"
                                        onChange={(e) => setEvent_name(e.target.value)}
                                        value={event_name || ""}
                                    />
                                </div>

                                {/* location */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <AddressAutoComplete
                                        setLocation={setEvent_location}
                                        default_location={event_location || ""}
                                        className={'py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
                                    />
                                </div>
                            </div>

                            {/* date, time and status */}
                            <div className="gap-6 items-center grid grid-cols-1 md:grid-cols-3">

                                {/* date */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            name="event_date"
                                            className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            required
                                            onChange={handleDate}
                                            value={event_date.date_value || ""}
                                        />
                                    </div>
                                </div>

                                {/* Time Section */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="start_time" className="text-sm font-medium text-gray-700 mb-2">
                                        Event Time
                                    </label>
                                    <div className="gap-3 grid grid-cols-2">
                                        {/* Start Time */}
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                Start
                                            </span>
                                            <input
                                                type="time"
                                                id="start_time"
                                                name="start_time"
                                                className="pl-12 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                required
                                                onChange={(e) => setStartTime(e.target.value)}
                                                value={startTime || ""}
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                End
                                            </span>
                                            <input
                                                type="time"
                                                id="end_time"
                                                name="end_time"
                                                className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                required
                                                onChange={(e) => setEndTime(e.target.value)}
                                                value={endTime || ""}
                                            />
                                        </div>
                                    </div>
                                </div>


                                {/* status */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <Select
                                        name="event_status"
                                        value={event_status}
                                        onChange={setEvent_status}
                                        options={statusOptions}
                                        placeholder="Select status"
                                        className="mt-1"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: '4px 0',
                                                borderRadius: '8px',
                                                borderColor: '#d1d5db',
                                                '&:hover': {
                                                    borderColor: '#d1d5db'
                                                }
                                            })
                                        }}
                                    />
                                </div>
                            </div>

                            {/* type and budget */}
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                {/* type */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2">Event Type</label>
                                    <Select
                                        name="event_type"
                                        options={SupplierOptions}
                                        value={event_type || ""}
                                        onChange={setEvent_type}
                                        placeholder="Select event type"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: '4px 0',
                                                borderRadius: '8px',
                                                borderColor: '#d1d5db',
                                                '&:hover': {
                                                    borderColor: '#d1d5db'
                                                }
                                            })
                                        }}
                                    />
                                </div>

                                {/* Budget */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2">Budget</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                        <input
                                            placeholder="25,500"
                                            type="text"
                                            name="event_budget"
                                            className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            required
                                            onChange={(e) => setEvent_budget(e.target.value)}
                                            value={event_budget || ""}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* description */}
                            <div className="flex flex-col w-full">
                                <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="event_description"
                                    id="description"
                                    rows="4"
                                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    required
                                    onChange={(e) => setEvent_description(e.target.value)}
                                    value={event_description || ""}
                                    placeholder="Describe your event..."
                                ></textarea>
                            </div>

                            {/* specify supplier */}
                            <div className="flex flex-col space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center">
                                    <Tag className="mr-2 text-blue-600" size={20} />
                                    <span className="font-medium text-gray-800">Specify the supplier you are looking for:</span>
                                </div>

                                {/* Tags Display */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-2 py-2 px-3 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-800 font-medium"
                                            >
                                                {tag.label}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                                                >
                                                    <X width={14} height={14} strokeWidth={2} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Add Supplier Controls */}
                                <div className="flex flex-col md:flex-row gap-3 items-end">
                                    <div className="flex-grow">
                                        <Select
                                            options={SupplierOptions}
                                            value={categories}
                                            onChange={setCategories}
                                            placeholder="Select supplier category"
                                            isClearable
                                            className="w-full"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: '8px',
                                                    borderColor: '#d1d5db',
                                                    '&:hover': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                })
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="flex items-center justify-center py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                        onClick={addTag}
                                        disabled={!categories || !categories.value.trim()}
                                    >
                                        <Tag size={18} className="mr-2" />
                                        Add Category
                                    </button>
                                </div>
                            </div>

                            {isUpdating && (
                                <LoadingOverlay isLoading={isUpdating} message="Processing.." />
                            )}

                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <PrimaryButton className="w-full flex items-center justify-center">
                                    <Send size={18} className="mr-2" />
                                    Update Event
                                </PrimaryButton>
                                <Link
                                    to={'/events'}
                                    className="flex items-center justify-center py-3 w-full text-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Suppliers Sections */}
                    <div className="space-y-8">
                        {/* Filtered Suppliers Section */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                            <div className="flex items-center mb-4">
                                <Users className="mr-2 text-blue-600" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Suggested Suppliers</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Suppliers matching your selected categories</p>

                            {tags.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <Tag className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-gray-500">No categories selected. Please add categories above to see suppliers.</p>
                                </div>
                            ) : (
                                <>
                                    {suppliers.filter(supplier =>
                                        tags.some(tag => tag.value === supplier.supplier_type?.value)
                                    ).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {suggestedEvents
                                                .map((supplier) => {
                                                    const averageRating = calculateAverageRating(supplier.id);
                                                    const userProfile = userProfiles.find(
                                                        profile => profile.id === supplier.id
                                                    )
                                                    const userDetail = users.find(user => user.id === supplier.id)
                                                    const userServices = services.filter(serv => serv.supplier_id === supplier.id)

                                                    return (
                                                        <div
                                                            key={supplier.id}
                                                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex items-start space-x-3">
                                                                {supplier.supplier_background_image ? (
                                                                    <img src={supplier.supplier_background_image} alt="" className='h-12 w-12 rounded-full object-cover' />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                                                        {supplier.supplier_name.charAt(0).toUpperCase()}
                                                                    </div>)
                                                                }
                                                                <div className="flex-1">
                                                                    <div
                                                                        className="relative inline-block"
                                                                        onMouseEnter={() => setHoverState({ id: supplier.id, section: "suggested" })}
                                                                        onMouseLeave={() => setHoverState({ id: null, section: null })}
                                                                    >
                                                                        <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                                                                        {hoverState.id === supplier.id && hoverState.section === "suggested" && (
                                                                            <ProfileHover hoveredReviewer={userProfile} user={userDetail} review={supplier} />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center mt-1">
                                                                        <span className="text-sm text-gray-600 mr-2">Rating: {averageRating}</span>
                                                                        <SupplierModal
                                                                            className={'text-sm text-blue-600 hover:text-blue-800 font-medium'}
                                                                            supplierData={supplier}
                                                                            applications={applications}
                                                                            userData={userData.role}
                                                                            services={userServices}
                                                                            reviews={reviews.filter(r => r.reviewed_id === supplier.id)}
                                                                            averageRating={averageRating}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <Users className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-gray-500">No suppliers match your selected categories.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Recent Suppliers */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                            <div className="flex items-center mb-4">
                                <Users className="mr-2 text-green-600" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Recent Suppliers</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Suppliers from completed contracts</p>
                            {suppliers.length > 0 &&
                                <div className="space-y-4">
                                    {suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                        contracts.some(c => c.supplier_id === supplier.id && c.status === "Completed" && c.event_id === id)
                                    ).map((supplier) => {

                                        const averageRating = calculateAverageRating(supplier.id);
                                        const userProfile = userProfiles.find(
                                            profile => profile.id === supplier.id
                                        )
                                        const userDetail = users.find(user => user.id === supplier.id)
                                        const userServices = services.filter(serv => serv.supplier_id === supplier.id)

                                        return (
                                            <div key={supplier.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    {supplier.supplier_background_image ? (
                                                        <img src={supplier.supplier_background_image} alt="" className='h-12 w-12 rounded-full object-cover' />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                                                            {supplier.supplier_name.charAt(0).toUpperCase()}
                                                        </div>)
                                                    }
                                                    <div className="flex-1">
                                                        <div
                                                            className="relative inline-block"
                                                            onMouseEnter={() => setHoverState({ id: supplier.id, section: "recent" })}
                                                            onMouseLeave={() => setHoverState({ id: null, section: null })}
                                                        >
                                                            <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                                                            {hoverState.id === supplier.id && hoverState.section === "recent" && (
                                                                <ProfileHover hoveredReviewer={userProfile} user={userDetail} review={supplier} />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-sm text-gray-600 mr-2">Rating: {averageRating}</span>
                                                            <SupplierModal
                                                                className={'text-sm text-blue-600 hover:text-blue-800 font-medium'}
                                                                supplierData={supplier}
                                                                applications={applications}
                                                                userData={userData.role}
                                                                services={userServices}
                                                                reviews={reviews.filter(r => r.reviewed_id === supplier.id)}
                                                                averageRating={averageRating}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="flex items-center space-x-2">
                                                        <ContractModal userData={userData} event_id={id} user_id={userData.id} supplier_id={supplier.id} eventData={eventData} supplierData={supplier} />
                                                    </div>

                                                    <div className="flex items-center text-sm gap-3">
                                                        {reviews.find(rev => rev.reviewed_id === supplier.id && rev.user_id === userData.id && rev.event_id === eventData.id) ? (
                                                            <span className="text-white py-1 px-4 rounded-md text-sm bg-gray-500 ">Reviewed</span>
                                                        ) : (
                                                            <Review reviewed_id={supplier.id} reviewer_name={event_name} eventData={eventData} />
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                    })}
                                </div>
                            }

                            {!isLoading && suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                contracts.some(c => c.supplier_id === supplier.id && c.status === "Completed" && c.event_id === id)
                            ).length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <Users className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-gray-500">No recent suppliers for this event.</p>
                                    </div>
                                )}
                        </div>

                        {/* current event suppliers */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                            <div className="flex items-center mb-4">
                                <Users className="mr-2 text-purple-600" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Current Event Suppliers</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Suppliers currently working on this event</p>

                            {suppliers.length > 0 &&
                                <div className="space-y-4">
                                    {suppliers.filter(supplier =>
                                        applications.filter(app => app.supplier_id === supplier.id).every(app => app.status === "Approved") &&
                                        contracts.some(c => c.supplier_id === supplier.id && c.status === "Approved" && c.event_id === id)
                                    ).map((supplier) => {

                                        const averageRating = calculateAverageRating(supplier.id);
                                        const userProfile = userProfiles.find(
                                            profile => profile.id === supplier.id
                                        )
                                        const userDetail = users.find(user => user.id === supplier.id)
                                        const userServices = services.filter(serv => serv.supplier_id === supplier.id)

                                        return (
                                            <div key={supplier.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    {supplier.supplier_background_image ? (
                                                        <img src={supplier.supplier_background_image} alt="" className='h-12 w-12 rounded-full object-cover' />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                                            {supplier.supplier_name.charAt(0).toUpperCase()}
                                                        </div>)
                                                    }
                                                    <div className="flex-1">
                                                        <div
                                                            className="relative inline-block"
                                                            onMouseEnter={() => setHoverState({ id: supplier.id, section: "event suppliers" })}
                                                            onMouseLeave={() => setHoverState({ id: null, section: null })}
                                                        >
                                                            <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                                                            {hoverState.id === supplier.id && hoverState.section === "event suppliers" && (
                                                                <ProfileHover hoveredReviewer={userProfile} user={userDetail} review={supplier} />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-sm text-gray-600 mr-2">Rating: {averageRating}</span>
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Approved</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <ContractModal
                                                        userData={userData}
                                                        event_id={id}
                                                        user_id={userData.id}
                                                        supplier_id={supplier.id}
                                                        eventData={eventData}
                                                        supplierData={supplier}
                                                    />
                                                    <SupplierModal
                                                        className={'text-sm text-blue-600 hover:text-blue-800 font-medium'}
                                                        supplierData={supplier}
                                                        applications={applications}
                                                        userData={userData.role}
                                                        services={userServices}
                                                        reviews={reviews.filter(r => r.reviewed_id === supplier.id)}
                                                        averageRating={averageRating}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            }

                            {!isLoading && suppliers.filter(supplier => applications.filter(app => app.supplier_id === supplier.id).every(app => app.status === "Approved") &&
                                contracts.some(c => c.supplier_id === supplier.id && c.status === "Approved" && c.event_id === id)
                            ).length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <Users className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-gray-500">No suppliers currently assigned to this event.</p>
                                    </div>
                                )}
                        </div>

                        {/* Applied Suppliers Section */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Users className="mr-2 text-amber-600" size={24} />
                                    <h3 className="text-xl font-bold text-gray-800">Supplier Applications</h3>
                                </div>
                                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Pending")).length} Pending
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">Suppliers who have applied to work on this event</p>

                            {suppliers.length > 0 && (
                                <div className="space-y-4">
                                    {suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Pending")).map((supplier) => {
                                        const averageRating = calculateAverageRating(supplier.id);
                                        const userProfile = userProfiles.find(
                                            profile => profile.id === supplier.id
                                        )
                                        const userDetail = users.find(user => user.id === supplier.id)
                                        const userServices = services.filter(serv => serv.supplier_id === supplier.id)
                                        return (
                                            <div key={supplier.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    {supplier.supplier_background_image ? (
                                                        <img src={supplier.supplier_background_image} alt="" className='h-12 w-12 rounded-full object-cover' />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                                                            {supplier.supplier_name.charAt(0).toUpperCase()}
                                                        </div>)
                                                    }
                                                    <div className="flex-1">
                                                        <div
                                                            className="relative inline-block"
                                                            onMouseEnter={() => setHoverState({ id: supplier.id, section: "applied" })}
                                                            onMouseLeave={() => setHoverState({ id: null, section: null })}
                                                        >
                                                            <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                                                            {hoverState.id === supplier.id && hoverState.section === "applied" && (
                                                                <ProfileHover hoveredReviewer={userProfile} user={userDetail} review={supplier} />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center mt-1 space-x-2">
                                                            <span className="text-sm text-gray-600">Rating: {averageRating}</span>
                                                            <SupplierModal
                                                                className={'text-sm text-blue-600 hover:text-blue-800 font-medium mr-4'}
                                                                supplierData={supplier}
                                                                applications={applications}
                                                                userData={userData.role}
                                                                services={userServices}
                                                                reviews={reviews.filter(r => r.reviewed_id === supplier.id)}
                                                                averageRating={averageRating}
                                                            />                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">

                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(supplier)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Approve
                                                        </button>

                                                        <RejectReview
                                                            className={`px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center`}
                                                            userData={userData}
                                                            event_id={id}
                                                            event_name={event_name}
                                                            supplier_id={supplier.id}
                                                            supplier={supplier}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {!isLoading && suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Pending")).length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <Users className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-gray-500">No pending supplier applications for this event.</p>
                                </div>
                            )}
                        </div>

                        {/* Your Offers Section */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <FileText className="mr-2 text-indigo-600" size={24} />
                                    <h3 className="text-xl font-bold text-gray-800">Your Contract Offers</h3>
                                </div>
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {suppliers.filter(supplier =>
                                        applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                        contracts.some(contracts => contracts.status === "Pending" && supplier.id === contracts.supplier_id)
                                    ).length} Pending
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">Contract offers waiting for supplier response</p>

                            {contracts.length > 0 && (
                                <div className="space-y-4">
                                    {suppliers.filter(supplier =>
                                        applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                        contracts.some(contracts => contracts.status === "Pending" && supplier.id === contracts.supplier_id))
                                        .map((supplier) => {
                                            const averageRating = calculateAverageRating(supplier.id);
                                            const userProfile = userProfiles.find(
                                                profile => profile.id === supplier.id
                                            )
                                            const userDetail = users.find(user => user.id === supplier.id)
                                            const userServices = services.filter(serv => serv.supplier_id === supplier.id)

                                            return (
                                                <div key={supplier.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        {supplier.supplier_background_image ? (
                                                            <img src={supplier.supplier_background_image} alt="" className='h-12 w-12 rounded-full object-cover' />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                                                {supplier.supplier_name.charAt(0).toUpperCase()}
                                                            </div>)
                                                        }
                                                        <div className="flex-1">
                                                            <div
                                                                className="relative inline-block"
                                                                onMouseEnter={() => setHoverState({ id: supplier.id, section: "offers" })}
                                                                onMouseLeave={() => setHoverState({ id: null, section: null })}
                                                            >
                                                                <p className="font-semibold text-gray-900">{supplier.supplier_name}</p>
                                                                {hoverState.id === supplier.id && hoverState.section === "offers" && (
                                                                    <ProfileHover hoveredReviewer={userProfile} user={userDetail} review={supplier} />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center mt-1 space-x-2">
                                                                <span className="text-sm text-gray-600">Rating: {averageRating}</span>
                                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Offer Sent</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-3">
                                                        <SupplierModal
                                                            className={'text-sm text-blue-600 hover:text-blue-800 font-medium mr-4'}
                                                            supplierData={supplier}
                                                            applications={applications}
                                                            userData={userData.role}
                                                            services={userServices}
                                                            reviews={reviews.filter(r => r.reviewed_id === supplier.id)}
                                                            averageRating={averageRating}
                                                        />
                                                        <ContractModal
                                                            userData={userData}
                                                            event_id={id}
                                                            supplier_id={supplier.id}
                                                            eventData={eventData}
                                                            supplierData={supplier}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            )}

                            {!isLoading && suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                contracts.some(contracts => contracts.status === "Pending" && supplier.id === contracts.supplier_id)).length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-gray-500">No pending contract offers for this event.</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg mt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Event Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Recent Suppliers</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {suppliers.filter(supplier =>
                                                applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                                contracts.some(c => c.supplier_id === supplier.id && c.status === "Completed" && c.event_id === id)
                                            ).length}
                                        </p>
                                    </div>
                                    <Users className="text-green-500" size={24} />
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600 font-medium">Pending Applications</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {suppliers.filter(supplier => applications.some(app => app.supplier_id === supplier.id && app.status === "Pending")).length}
                                        </p>
                                    </div>
                                    <FileText className="text-amber-500" size={24} />
                                </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">Contract Offers</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {suppliers.filter(supplier =>
                                                applications.some(app => app.supplier_id === supplier.id && app.status === "Approved") &&
                                                contracts.some(contracts => contracts.status === "Pending" && supplier.id === contracts.supplier_id)
                                            ).length}
                                        </p>
                                    </div>
                                    <Send className="text-purple-500" size={24} />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Suggested Matches</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {suggestedEvents.length}
                                        </p>
                                    </div>
                                    <Tag className="text-blue-500" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}