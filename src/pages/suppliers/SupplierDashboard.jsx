import DashboardCard from "../../components/DashboardCards"
import { Eye, DollarSignIcon, CalendarPlus, Calendar } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { Title } from "react-head"
import { where, query, collection, onSnapshot, getDocs } from "firebase/firestore"
import { db, auth } from "../../firebase/firebase"
import { useEffect, useState } from "react"

export default function SupplierDashboard({ userData }) {

    const [applications, setApplications] = useState([])
    const [userEvents, setUserEvents] = useState([])

    useEffect(() => {

        const q = query(collection(db, "Applications"),
            where("user_id", "==", auth.currentUser.uid))

        const unsubscribe = onSnapshot(q, (onsnapshot) => {
            const applications = onsnapshot.docs.map(app => ({ id: app.id, ...app.data() }))
            setApplications(applications)
        })

        return () => unsubscribe()

    }, [])

    useEffect(() => {
        const fetchEvents = async () => {
            const snapShotEvents = await getDocs(collection(db, "Events"));
            const events = snapShotEvents.docs.map(doc => ({ id: doc.id, ...doc.data() }))

            setUserEvents(events)
        }
        fetchEvents()
    }, [])

    console.log(userEvents)
    return (
        <>
            <Title>Dashboard</Title>
            <div className="flex justify-between items-center flex-col lg:flex-row md:flex-row">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
                    <span className={`block mt-2 text-gray-600`}>Welcome back, {userData?.first_name}</span>
                </div>
            </div>

            {/* supplier*/}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-5">

                {/* profile views*/}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Profile Views</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<Eye width={50} height={50} />}</span>
                </DashboardCard>

                {/* upcoming events */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Revenue</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<DollarSignIcon width={50} height={50} />}</span>
                </DashboardCard>

                {/* rated suppliers */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Bookings</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<CalendarPlus width={50} height={50} />}</span>
                </DashboardCard>
            </div>

            <TabGroup className={'mt-8'}>
                <TabList className="flex gap-4 mb-5">
                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-blue-100 data-selected:text-blue-700 data-hover:bg-gray-100 transition-colors"
                    >
                        Applied Events
                    </Tab>

                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-blue-100 data-selected:text-blue-700 data-hover:bg-gray-100 transition-colors"
                    >
                        Reviews
                    </Tab>
                </TabList>
                <TabPanels className={'rounded-xl border border-gray-300 shadow-md shadow-gray-700'}>
                    <TabPanel className="p-5  px-7">
                        <div className="flex flex-col space-y-4">
                            {applications.map((application) => (
                                <div key={application.id}>

                                    <div className="flex justify-between items-center py-3">
                                        <div className="flex items-center space-x-3">
                                            <Calendar size={24} className="text-blue-600 bg-gray-200 rounded-full h-9 w-9 p-2" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">Event name: {userEvents.find(events => events.id === application.event_id)?.event_name}</span>
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
                                    {application !== applications[applications.length - 1] && (
                                        <hr className="border-t border-gray-200" />
                                    )}
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No applications found
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </>
    )
}