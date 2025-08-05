import DashboardCard from "../../components/DashboardCards"
import { Eye, PhilippinePeso, CalendarPlus, Calendar, Star } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { Title } from "react-head"
import { where, query, collection, onSnapshot, getDocs } from "firebase/firestore"
import { db, auth } from "../../firebase/firebase"
import { useEffect, useState } from "react"
import useEvents from "../../hooks/useEvents"
import { LineChart, PieChart, BarChart } from "../../components/Charts"
import useSupplier from "../../hooks/useSupplier"
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { formatDistanceToNow } from "date-fns"

export default function SupplierDashboard({ userData }) {

    const [applications, setApplications] = useState([])
    const [userEvents, setUserEvents] = useState([])
    const [reviews, setReviews] = useState([])

    const { getReviews } = useSupplier()
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
                const reviews = await getReviews(userData.id)

                setReviews(reviews)

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
            <div className="flex justify-between items-center flex-col lg:flex-row md:flex-row">

                <div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-left">Supplier Dashboard</h1>
                    </div>
                    <span className={`text-sm text-gray-600`}>Welcome back, <span className="font-bold">{userData?.first_name}</span></span>
                </div>
            </div>

            {/* supplier*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-5">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                    {/* profile views*/}
                    <DashboardCard>
                        <div className="flex flex-col space-y-1">
                            <span className="block text-lg text-gray-800 font-bold">Profile Views</span>
                            <span className="block text-2xl text-gray-900 font-bold">24</span>
                            <span className="block text-gray-600 text-sm">from last month</span>
                        </div>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full py-1 px-1">{<Eye width={50} height={50} className="p-3 text-white" />}</span>
                    </DashboardCard>

                    {/* upcoming events */}
                    <DashboardCard>
                        <div className="flex flex-col space-y-1">
                            <span className="block text-lg text-gray-800 font-bold">Revenue</span>
                            <span className="block text-2xl text-gray-900 font-bold">24</span>
                            <span className="block text-gray-600 text-sm">from last month</span>
                        </div>
                        <span className="bg-gradient-to-r from-green-500 to-green-600 rounded-full py-1 px-1">{<PhilippinePeso width={50} height={50} className="p-3 text-white" />}</span>
                    </DashboardCard>

                    {/* rated suppliers */}
                    <DashboardCard>
                        <div className="flex flex-col space-y-1">
                            <span className="block text-lg text-gray-800 font-bold">Bookings</span>
                            <span className="block text-2xl text-gray-900 font-bold">24</span>
                            <span className="block text-gray-600 text-sm">from last month</span>
                        </div>
                        <span className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full py-1 px-1">{<CalendarPlus width={50} height={50} className="p-3 text-white" />}</span>
                    </DashboardCard>
                </div>

                <div className="p-5 px-7 bg-white rounded-xl border border-gray-300 shadow-xl mt-5 flex flex-col w-full">
                    <span className="font-bold text-md text-gray-800 mb-5">Rating Trend</span>
                    <LineChart />
                </div>
            </div>

            <TabGroup className={'mt-8'}>
                <TabList className="flex gap-4 mb-3">
                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors"
                    >
                        Applied Events
                    </Tab>

                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors"
                    >
                        Reviews
                    </Tab>

                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors"
                    >
                        Calendars
                    </Tab>

                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors"
                    >
                        Offers
                    </Tab>
                </TabList>
                <TabPanels className={'rounded-xl border border-gray-300 bg-white shadow-xl'}>
                    <TabPanel className="p-5  px-7">
                        <div className="flex flex-col space-y-2">
                            {applications.map((application) => (

                                <div key={application.id}>

                                    <div className={`grid grid-cols-1 gap-2 md:flex lg:flex justify-between ${AppliedColor(application.status)} items-center py-4 rounded-lg px-5`}>
                                        <div className="flex items-center space-x-3">
                                            <Calendar size={24} className="text-blue-600 bg-gray-200 rounded-full h-9 w-9 p-2" />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">Event name: {userEvents.find(events => events.id === application.event_id)?.event_name}</span>
                                                <span className="text-gray-500 text-sm">
                                                    Applied: {application.AppliedAt?.toDate().toLocaleDateString([], {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={`px-4 py-1 rounded-lg text-white text-sm ${application.status === 'Approved'
                                                ? 'bg-green-600 hover:bg-blue-700'
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
                                <div className="text-center py-8 text-gray-500">
                                    No applications found
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    {/* reviews */}
                    <TabPanel>
                        {reviews && (
                            <div className="px-5 py-5">
                                <div className="space-y-6">
                                    {reviews.map((review, index) => (
                                        <div key={index} className="border-b border-gray-100 bg-gray-100 p-5 rounded-md pb-6 last:border-b-0">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {review.event_name?.charAt(0).toUpperCase() || 'A'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900">{review.event_name || 'Anonymous'}</h4>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-   text-gray-500">{review?.createdAt ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : 'Recent'}</span>
                                                    </div>
                                                    <p className="text-gray-700">{review.comment || 'Great service!'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!reviews.length > 0 && (
                            <span className="block text-center mb-10 font-semibold text-gray-600">No reviews.</span>
                        )}
                    </TabPanel>

                    {/* Calendar */}
                    <TabPanel>
                        <div className="p-10">
                            <FullCalendar
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                events={[
                                    { title: 'Wedding', date: '2025-06-18' },
                                    { title: 'Party', date: '2025-06-21' }
                                ]}
                            />
                        </div>
                    </TabPanel>


                    {/* Offers */}
                    <TabPanel>
                        <div className="p-10">
                            <FullCalendar
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                events={[
                                    { title: 'Wedding', date: '2025-06-18' },
                                    { title: 'Party', date: '2025-06-21' }
                                ]}
                            />
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </>
    )
}