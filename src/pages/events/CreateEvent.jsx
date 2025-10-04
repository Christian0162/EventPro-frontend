import Select from "react-select";
import { useEffect, useState } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import { Link, Navigate } from "react-router-dom";
import { X } from "lucide-react";
import Loading from "../../components/Loading";
import AddressAutoComplete from "../../components/AddressAutoComplete";
import { useAddEvent } from "../../hooks/useEvents";
import { createStatusOptions, SupplierOptions } from "../../constants/categories";

export default function CreateEvent({ userData }) {

    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState('');
    const [event_status, setEvent_status] = useState('');
    const [type, setType] = useState([]);
    const [event_name, setEvent_name] = useState('');
    const [event_location, setEvent_location] = useState('');
    const [event_date, setEvent_date] = useState({ date_value: '', date_preview: [] });
    const [event_budget, setEvent_budget] = useState('');
    const [event_description, setEvent_description] = useState('');
    const [event_time, setEvent_time] = useState([])
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [submitted, setSubmitted] = useState(false);

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
        const days = date.getDay()

        const previewDate = [years, months, days]

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
            event_status: event_status,
            event_type: type,
            event_budget: event_budget,
            event_description: event_description,
            event_categories: tags,
        }
        if (userData) {
            addEvent(userData?.id, data)
            setSubmitted(true)
        }
    }

    if (submitted) {
        return <Navigate to={'/events'} replace />
    }

    if (userData.verification_status !== "verified") {
        return <Navigate to={'/dashboard'} replace />
    }

    const removeTag = (index) => {
        setTags(tags.filter((tag, i) => i !== index));
    }

    const addTag = () => {
        if (categories.value.trim() && !tags.includes(categories.value.trim())) {
            setTags([...tags, categories.value])
            setCategories(null)
        }
    }

    if (isLoading) {
        return <Loading />
    }

    return (
        <>
            <div className="flex flex-col mb-3">
                <h1 className="text-3xl font-bold text-blue-600">Create Events</h1>
                <span className="mt-2 text-gray-600">Add the details for your new event</span>
            </div>

            <div className="bg-white rounded-xl p-10 border border-gray-100 shadow-lg">

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
                            <AddressAutoComplete className={'mt-2 py-1 rounded-sm ring-1 ring-black'} setLocation={setEvent_location} />
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
                                value={event_date?.date_value}
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
                            <label htmlFor="time">Status</label>
                            <Select
                                name="event_status"
                                value={event_status}
                                onChange={setEvent_status}
                                options={createStatusOptions}
                                placeholder="Upcoming"
                                isClearable
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* type */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="type" className="mb-2">Type</label>
                        <Select
                            name="event_type"
                            options={SupplierOptions}
                            value={type}
                            onChange={setType}
                            placeholder="Corporate"
                            isClearable
                        />
                    </div>

                    {/* Budget */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="type">Budget</label>
                        <input placeholder="₱ 25,500" type="number" name="event_budget" className="mt-2 focus:ring-2 focus:outline-none px-3 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black"
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
                            placeholder="Description too brief. Add details like purpose, activities, or audience."
                            onChange={(e) => setEvent_description(e.target.value)}
                            value={event_description}
                        ></textarea>
                    </div>

                    {/* specify supplier */}
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
                                    options={SupplierOptions}
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
                        <PrimaryButton>Create Event</PrimaryButton>
                        <Link to={'/events'} className="flex items-center py-2 w-full text-center justify-center border-1 hover:boder-1 hover:border-blue-500 rounded-sm">
                            <span className="block">Cancel</span>
                        </Link>
                    </div>
                </form>
            </div>
        </>
    )
}