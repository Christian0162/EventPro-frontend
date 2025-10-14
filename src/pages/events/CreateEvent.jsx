import Select from "react-select";
import { useEffect, useState } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import { Link, Navigate } from "react-router-dom";
import { X, Calendar, Tag, Send } from "lucide-react";
import Loading from "../../components/Loading";
import AddressAutoComplete from "../../components/AddressAutoComplete";
import { useAddEvent } from "../../hooks/useEvents";
import { SupplierOptions } from "../../constants/categories";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function CreateEvent({ userData }) {

    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState('');
    const [eventType, setEventType] = useState([]);
    const [event_name, setEvent_name] = useState('');
    const [event_location, setEvent_location] = useState('');
    const [event_date, setEvent_date] = useState({ date_value: '', date_preview: [] });
    const [event_budget, setEvent_budget] = useState('');
    const [event_description, setEvent_description] = useState('');
    const [event_time, setEvent_time] = useState([])
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const { addEvent, isLoading } = useAddEvent()

    useEffect(() => {

        const previewStartAndEnd = [
            new Date(`1970-01-01T${startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
            new Date(`1970-01-01T${endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
        ].join(' - ')

        const valueStartAndEnd = [startTime, endTime]

        setEvent_time({ previewStartAndEnd, valueStartAndEnd })

    }, [startTime, endTime])

    const handleDate = (e) => {
        const dateString = e.target.value
        const date = new Date(dateString)

        const years = date.getFullYear();
        const months = date.toLocaleDateString([], { month: "long" })
        const days = date.getDate()

        const previewDate = [years, months, days]

        console.log("preview:", previewDate)

        setEvent_date({
            date_value: dateString,
            date_preview: previewDate
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            event_name: event_name,
            event_location: event_location,
            event_date: event_date,
            event_time: event_time,
            event_type: eventType,
            event_budget: event_budget,
            event_description: event_description,
            event_categories: tags,
        };

        try {
            if (userData) {
                addEvent(userData?.id, data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (userData.verification_status !== "verified") {
        return <Navigate to={'/dashboard'} replace />
    }

    const removeTag = (index) => {
        setTags(tags.filter((tag, i) => i !== index));
    }

    const addTag = () => {
        if (categories?.value.trim() && !tags.some(tag => tag.value === categories.value)) {
            // setTagError('');
            setTags([...tags, categories]);
            setCategories(null);
        }
    };

    return (
        <>
            <div className="flex flex-col mb-3">
                <h1 className="text-3xl font-bold text-blue-600">Create Events</h1>
                <span className="mt-2 text-gray-600">Add the details for your new event</span>
            </div>

            <div className="bg-white rounded-xl p-10 border border-gray-100 shadow-lg">

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
                    <div className="gap-6 items-center grid grid-cols-1 md:grid-cols-2">

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

                    </div>

                    {/* type and budget */}
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        {/* type */}
                        <div className="flex flex-col w-full">
                            <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2">Event Type</label>
                            <Select
                                name="event_type"
                                options={SupplierOptions}
                                value={eventType || ""}
                                onChange={setEventType}
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
                                    type="number"
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

                    {isLoading && (
                        <LoadingOverlay isLoading={isLoading} message="Processing.." />
                    )}

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <Link
                            to={'/events'}
                            className="flex items-center justify-center py-3 w-full text-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                        >
                            Cancel
                        </Link>

                        <PrimaryButton className="w-full flex items-center justify-center">
                            <Send size={18} className="mr-2" />
                            Create Event
                        </PrimaryButton>
                    </div>
                </form>
            </div >
        </>
    )
}