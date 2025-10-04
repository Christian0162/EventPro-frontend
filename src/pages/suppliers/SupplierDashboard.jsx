import DashboardCard from "../../components/DashboardCards"
import { Eye, PhilippinePeso, CalendarPlus, Calendar, Star } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { Title } from "react-head"
import { where, query, collection, onSnapshot, serverTimestamp, addDoc, getDocs, getDoc, doc } from "firebase/firestore"
import { db, auth } from "../../firebase/firebase"
import { useEffect, useState } from "react"
import { LineChart, PieChart, BarChart } from "../../components/Charts"
import { useFetchReviewsById } from "../../hooks/useReviews"
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { formatDistanceToNow } from "date-fns"
import { useFetchContract } from "../../hooks/useContract"
import { useFetchEvents } from "../../hooks/useEvents"
import ContractModal from "../../components/ContractModal"
import { useFetchSupplierById } from "../../hooks/useSupplier"
import { useMemo } from "react";
import Swal from "sweetalert2"

export default function SupplierDashboard({ userData }) {

    const [applications, setApplications] = useState([])
    const { reviews } = useFetchReviewsById(userData.id)
    const { contracts } = useFetchContract()
    const { events } = useFetchEvents()
    const { supplier } = useFetchSupplierById(userData.id)
    const [now, setNow] = useState(new Date())

    const pendingContracts = useMemo(() =>
        contracts.filter(contract => contract?.status === "Pending"),
        [contracts]);

    const activeContracts = useMemo(() =>
        contracts.filter(contract => contract?.status === "Approved" && contract.supplier_id === userData.id),
        [contracts, userData.id]);

    const completeContracts = useMemo(() =>
        contracts.filter(contract => contract?.status === "Completed" && contract.supplier_id === userData.id),
        [contracts, userData.id]);


    const contractEventsforPending = useMemo(() =>
        pendingContracts.map(contract =>
            events.find(event => event.id === contract.event_id)
        ).filter(Boolean),
        [pendingContracts, events]);

    const contractEventsforActive = useMemo(() =>
        activeContracts.map(contract =>
            events.find(event => event.id === contract.event_id)
        ).filter(Boolean),
        [activeContracts, events]);

    console.log(activeContracts)

    useEffect(() => {

        const sendDeliveryNotif = async () => {

            for (let i = 0; i < activeContracts.length; i++) {
                const contract = activeContracts[i];
                const eventData = contractEventsforActive[i];

                if (!supplier?.id || !contract?.id) return;


                if (!eventData?.event_date?.date_value) break;

                const eventDate = new Date(eventData.event_date.date_value);

                const isSameDay =
                    now.getFullYear() === eventDate.getFullYear() &&
                    now.getMonth() === eventDate.getMonth() &&
                    now.getDate() === eventDate.getDate();


                if (isSameDay) {

                    const notifQuery = query(
                        collection(db, "notifications"),
                        where("contract_id", "==", contract.id),
                        where("user_id", "==", supplier?.id),
                        where("type", "==", "delivery_day")
                    );


                    const notifSnap = await getDocs(notifQuery);

                    if (notifSnap.empty) {
                        Swal.fire({
                            title: "Delivery Reminder",
                            text: `Today is the delivery day for "${eventData.event_name}"!`,
                            icon: "info",
                            confirmButtonText: "Got it",
                        });

                        await addDoc(collection(db, "notifications"), {
                            avatar: supplier.supplier_name.charAt(0).toUpperCase(),
                            message: `Today is the delivery day for contract ID: ${contract.id} with supplier "${eventData.event_name}".`,
                            createdAt: serverTimestamp(),
                            title: "Delivery Day Reminder",
                            unread: true,
                            user_id: supplier?.id,
                            contract_id: contract.id,
                            type: "delivery_day",
                        });




                        console.log("Notification created for delivery day:", contract.id);
                    } else {
                        console.log("Notification already exists for this delivery day.");
                    }
                }
            }
        };

        sendDeliveryNotif();
    }, [activeContracts, contractEventsforActive, now, supplier?.id, supplier?.supplier_name]);


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




    const AppliedColor = (status) => {

        const colors = {
            Approved: 'bg-green-100',
            Pending: 'bg-yellow-100',
            Reject: 'bg-red-100',
        }
        return colors[status]
    }


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
            <div className="mt-6 grid grid-cols-2 gap-3">
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

                        <Tab className="rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-white transition-colors whitespace-nowrap">
                            Contracts
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
                                                        Event name: {events.find(events => events.id === application.event_id)?.event_name}
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
                            <div className="p-1 sm:p-3 lg:p-5 flex flex-col gap-3">
                                {pendingContracts.map((offers, index) => (
                                    <div key={index}>
                                        <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between ${AppliedColor(offers.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                            <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                        Event name: {contractEventsforPending[index]?.event_name}
                                                    </span>

                                                    <span className="text-gray-500 text-xs sm:text-sm">
                                                        Applied: {offers.created_at.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <ContractModal event_id={offers.event_id} supplier_id={offers.supplier_id} supplierData={supplier} eventData={contractEventsforPending[index]} user_id={userData.id} />

                                        </div>
                                    </div>
                                ))}

                                {pendingContracts.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                        No Offers Found
                                    </div>
                                )}
                            </div>
                        </TabPanel>

                        {/* Offers Tab */}
                        <TabPanel>
                            <div className="p-1 sm:p-3 lg:p-5 flex flex-col gap-3">
                                {activeContracts.map((offers, index) => (
                                    <div key={index}>
                                        <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between ${AppliedColor(offers.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                            <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                        Event name: {contractEventsforActive[index]?.event_name}
                                                    </span>

                                                    <span className="text-gray-500 text-xs sm:text-sm">
                                                        Contract: {offers.created_at?.toDate()?.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <ContractModal userData={userData} event_id={offers.event_id} supplier_id={offers.supplier_id} supplierData={supplier} eventData={contractEventsforActive[index]} user_id={userData.id} />

                                        </div>
                                    </div>
                                ))}

                                {activeContracts.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                        No Contracts Found
                                    </div>
                                )}
                            </div>
                        </TabPanel>

                    </TabPanels>
                </TabGroup>

                {/* Recent Contracts Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-300 shadow-xl rounded-xl p-5 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📑 Recent Done Contracts</h3>

                        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                            {completeContracts.slice(0, 5).map((contract, index) => (
                                <div
                                    key={contract.id}
                                    className="p-3 rounded-lg border flex justify-between border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {contractEventsforActive[index]?.event_name || "Untitled Event"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {contract.created_at?.toDate().toLocaleDateString([], {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700`}>
                                            {contract.status}
                                        </span>
                                    </div>

                                    <ContractModal userData={userData} event_id={contract.event_id} supplier_id={contract.supplier_id} supplierData={supplier} eventData={contractEventsforActive[index]} user_id={userData.id} />

                                </div>
                            ))}

                            {completeContracts.length === 0 && (
                                <p className="text-center text-gray-500 text-sm">No recent contracts</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}  