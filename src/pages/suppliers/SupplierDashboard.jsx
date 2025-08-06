import DashboardCard from "../../components/DashboardCards"
import { Eye, PhilippinePeso, CalendarPlus, Calendar, Star } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { Title } from "react-head"
import { where, query, collection, onSnapshot } from "firebase/firestore"
import { db, auth } from "../../firebase/firebase"
import { useEffect, useState } from "react"
import useEvents from "../../hooks/useEvents"
import { LineChart, PieChart, BarChart } from "../../components/Charts"
import { useFetchReviewsById } from "../../hooks/useReviews"
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { formatDistanceToNow } from "date-fns"

export default function SupplierDashboard({ userData }) {

    const [applications, setApplications] = useState([])
    const [userEvents, setUserEvents] = useState([])

    const { reviews } = useFetchReviewsById(userData.id)
    const { getEvents } = useEvents()

    useEffect(() => {
        try {
            const q = query(collection(db, "applications"),
                where("user_id", "==", auth.currentUser.uid))

            const unsubscribe = onSnapshot(q, (onsnapshot) => {
                const applications = onsnapshot.docs.map(app => ({ id: app.id, ...app.data() }))
                setApplications(applications)
            })

            return () => unsubscribe()

        }
        catch (e) {
            console.error(e)
        }


    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const events = await getEvents()

                setUserEvents(events)

            }
            catch (e) {
                console.error(e)
            }


        }
        fetchData()
    }, [auth.currentUser])

    const AppliedColor = (status) => {

        const colors = {
            Approved: 'bg-green-100',
            Pending: 'bg-yellow-100',
            Reject: 'bg-red-100',
        }
        return colors[status]
    }

    console.log(reviews)
    return (
        <>
            <Title>Dashboard</Title>
            {/* Header Section */}
            <div className="flex justify-between items-start flex-col lg:flex-row gap-4 mb-6 sm:mb-8">
                <div className="w-full lg:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-left">
                        Supplier Dashboard
                    </h1>
                    <span className="text-sm text-gray-600">
                        Welcome back, <span className="font-bold">{userData?.first_name}</span>
                    </span>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">

                {/* Stats Cards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-5">

                    {/* Profile Views */}
                    <DashboardCard className="py-6 sm:py-8">
                        <div className="flex flex-col space-y-1">
                            <span className="block text-base sm:text-lg text-gray-800 font-bold">Profile Views</span>
                            <span className="block text-xl sm:text-2xl text-gray-900 font-bold">24</span>
                            <span className="block text-gray-600 text-xs sm:text-sm">from last month</span>
                        </div>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full py-1 px-1 flex-shrink-0">
                            <Eye width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                        </span>
                    </DashboardCard>

                    {/* Revenue */}
                    <DashboardCard className="py-6 sm:py-8">
                        <div className="flex flex-col space-y-1">
                            <span className="block text-base sm:text-lg text-gray-800 font-bold">Revenue</span>
                            <span className="block text-xl sm:text-2xl text-gray-900 font-bold">24</span>
                            <span className="block text-gray-600 text-xs sm:text-sm">from last month</span>
                        </div>
                        <span className="bg-gradient-to-r from-green-500 to-green-600 rounded-full py-1 px-1 flex-shrink-0">
                            <PhilippinePeso width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                        </span>
                    </DashboardCard>

                    {/* Bookings */}
                    <DashboardCard className="py-6 sm:py-8 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                        <div className="flex flex-col space-y-1">
                            <span className="block text-base sm:text-lg text-gray-800 font-bold">Bookings</span>
                            <span className="block text-xl sm:text-2xl text-gray-900 font-bold">24</span>
                            <span className="block text-gray-600 text-xs sm:text-sm">from last month</span>
                        </div>
                        <span className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full py-1 px-1 flex-shrink-0">
                            <CalendarPlus width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                        </span>
                    </DashboardCard>
                </div>

                {/* Chart Section */}
                <div className="p-4 sm:p-5 sm:px-7 bg-white rounded-xl border border-gray-300 shadow-xl flex flex-col w-full">
                    <span className="font-bold text-sm sm:text-md text-gray-800 mb-4 sm:mb-5">Rating Trend</span>
                    <div className="flex-1 min-h-[200px] sm:min-h-[250px]">
                        <LineChart />
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <TabGroup className="mt-6 sm:mt-8">
                <TabList className="flex gap-2 sm:gap-4 mb-3 overflow-x-auto pb-2">
                    <Tab className="rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors whitespace-nowrap">
                        Applied Events
                    </Tab>

                    <Tab className="rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors whitespace-nowrap">
                        Reviews
                    </Tab>

                    <Tab className="rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors whitespace-nowrap">
                        Calendars
                    </Tab>

                    <Tab className="rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors whitespace-nowrap">
                        Offers
                    </Tab>
                </TabList>

                <TabPanels className="rounded-xl border border-gray-300 bg-white shadow-xl">
                    {/* Applied Events Tab */}
                    <TabPanel className="p-3 sm:p-5 sm:px-7">
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                            {applications.map((application) => (
                                <div key={application.id}>
                                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-2 justify-between ${AppliedColor(application.status)} items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                        <div className="flex items-start sm:items-center space-x-3 flex-1">
                                            <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                    Event name: {userEvents.find(events => events.id === application.event_id)?.event_name}
                                                </span>
                                                <span className="text-gray-500 text-xs sm:text-sm">
                                                    Applied: {application.AppliedAt?.toDate().toLocaleDateString([], {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-white text-xs sm:text-sm flex-shrink-0 w-full sm:w-auto ${application.status === 'Approved'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : application.status === 'Pending'
                                                    ? 'bg-yellow-500 hover:bg-yellow-600'
                                                    : 'bg-red-500 hover:bg-red-600'
                                                } transition-colors`}
                                        >
                                            {application.status}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                    No applications found
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    {/* Reviews Tab */}
                    <TabPanel>
                        {reviews && reviews.length > 0 ? (
                            <div className="px-3 sm:px-5 py-3 sm:py-5">
                                <div className="space-y-4 sm:space-y-6">
                                    {reviews.map((review, index) => (
                                        <div key={index} className="border-b border-gray-100 bg-gray-100 p-3 sm:p-5 rounded-md pb-4 sm:pb-6 last:border-b-0">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                                                    {review.event_name?.charAt(0).toUpperCase() || 'A'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                                            {review.event_name || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                            <div className="flex items-center gap-0.5 sm:gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={14}
                                                                        className={`sm:size-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                                                {review?.createdAt ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : 'Recent'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 text-sm sm:text-base break-words">
                                                        {review.comment || 'Great service!'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                <span className="block font-semibold">No reviews yet.</span>
                            </div>
                        )}
                    </TabPanel>

                    {/* Calendar Tab */}
                    <TabPanel>
                        <div className="p-3 sm:p-6 lg:p-10">
                            <div className="overflow-x-auto">
                                <div className="min-w-[300px]">
                                    <FullCalendar
                                        plugins={[dayGridPlugin]}
                                        initialView="dayGridMonth"
                                        height="auto"
                                        aspectRatio={window.innerWidth < 768 ? 1 : 1.35}
                                        headerToolbar={{
                                            left: 'prev,next',
                                            center: 'title',
                                            right: window.innerWidth < 640 ? '' : 'today'
                                        }}
                                        titleFormat={window.innerWidth < 640 ? { month: 'short', year: 'numeric' } : { month: 'long', year: 'numeric' }}
                                        events={[
                                            { title: 'Wedding', date: '2025-06-18' },
                                            { title: 'Party', date: '2025-06-21' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Offers Tab */}
                    <TabPanel>
                        <div className="p-3 sm:p-6 lg:p-10">
                            <div className="overflow-x-auto">
                                <div className="min-w-[300px]">
                                    <FullCalendar
                                        plugins={[dayGridPlugin]}
                                        initialView="dayGridMonth"
                                        height="auto"
                                        aspectRatio={window.innerWidth < 768 ? 1 : 1.35}
                                        headerToolbar={{
                                            left: 'prev,next',
                                            center: 'title',
                                            right: window.innerWidth < 640 ? '' : 'today'
                                        }}
                                        titleFormat={window.innerWidth < 640 ? { month: 'short', year: 'numeric' } : { month: 'long', year: 'numeric' }}
                                        events={[
                                            { title: 'Wedding', date: '2025-06-18' },
                                            { title: 'Party', date: '2025-06-21' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </>
    )
}