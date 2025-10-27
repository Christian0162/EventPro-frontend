import { Eye, PhilippinePeso, CalendarPlus, Calendar, Star, TrendingUp, ChartNoAxesCombined, Package, ReceiptText } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { Title } from "react-head"
import { where, query, collection, serverTimestamp, addDoc, getDocs } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { useEffect, useRef, useState } from "react"
import { LineChart, PieChart, BarChart } from "../../components/Charts"
import { useFetchReviews } from "../../hooks/useReviews"
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useFetchContract } from "../../hooks/useContract"
import { useFetchEvents } from "../../hooks/useEvents"
import { useFetchSupplierById, useFetchSuppliers, useFetchSupplierServices } from "../../hooks/useSupplier"
import { useMemo } from "react";
import Swal from "sweetalert2"
import { Review } from "../../components/ReviewModal"
import { useFetchUserProfiles } from "../../hooks/useProfile"
import PageLoading from "../../components/PageLoading"
import { useFetchDeliveries } from "../../hooks/useDeliveries"
import { useFetchTransactionById } from "../../hooks/useTransaction"
import { useFetchAllApplication } from "../../hooks/useApplication"
import GenerateReport from "../../components/GeneraeReport"
import { lazy, Suspense } from "react";
import LoadingOverlay from "../../components/LoadingOverlay"
import { statusStyles } from "../../constants/categories"

export default function SupplierDashboard({ userData }) {

    const analyticsRef = useRef(null);
    const { reviews: reviewed } = useFetchReviews()
    const { contracts } = useFetchContract()
    const { events, isLoading: isEventLoading } = useFetchEvents()
    const { services, isLoading: isServicesLoading } = useFetchSupplierServices()
    const { supplier, isLoading: isSupplierLoading } = useFetchSupplierById(userData.id)
    const { suppliers, isLoading: isSuppliersLoading } = useFetchSuppliers()
    const [now, setNow] = useState(new Date())
    const { userProfiles } = useFetchUserProfiles()
    const { deliveries, isLoading: isDeliveriesLoading } = useFetchDeliveries()
    const { transactions, isLoading: isTransactionLoading } = useFetchTransactionById(userData.id)
    const { applications: userApplications, isLoading: isApplicationLoading } = useFetchAllApplication()
    const ContractModal = useMemo(() => lazy(() => import("../../components/ContractModal")), []);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null)

    const applications = userApplications.filter(app => app.supplier_id === userData.id &&
        contracts.some(cont => cont.supplier_id === app.supplier_id && cont.event_id === app.event_id && (cont.status !== 'Completed' && cont.status !== 'Cancelled')))

    const isAllLoading = isSupplierLoading || isEventLoading || isDeliveriesLoading || isSuppliersLoading || isTransactionLoading || isApplicationLoading

    const userDeliveries = deliveries.filter(del => del.supplier_id === userData.id)


    // price competitive 
    const suppleirsWithSameType = suppliers.filter(sup => sup.supplier_type?.value === supplier.supplier_type?.value && sup.id != userData.id)
    const supplierSameTypeServices = services.filter(serv => suppleirsWithSameType.some(supp => serv.supplier_id === supp.id))
    const avgPrice = supplierSameTypeServices.length
        ? supplierSameTypeServices.reduce((sum, s) => sum + parseFloat(s.service_price || 0), 0) /
        supplierSameTypeServices.length
        : 0;

    const price = parseFloat(supplier?.service_price || 0);
    const competitiveness = avgPrice
        ? ((avgPrice - price) / avgPrice) * 100
        : 0;

    const earningTransactions = transactions.filter(trans => trans.type === "CREDIT")

    const totalEarning = earningTransactions.reduce((sum, transaction) => sum + transaction.amount || 0, 0)

    // ontime deliveries
    const onTimeDeliveries = userDeliveries.filter(
        d => {
            const deliveredDate = d.delivered_date?.toDate ? d.delivered_date.toDate() : new Date(d.delivered_date)
            const plannedDate = d.planned_date?.toDate ? d.planned_date.toDate() : new Date(d.planned_date)

            return deliveredDate && plannedDate && deliveredDate < plannedDate
        }
    ).length;
    const totalDeliveries = userDeliveries.length;
    const onTimeRate = totalDeliveries ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    // barchar data
    const labels = ["Price Competitiveness", "On-Time Delivery"];
    const datasets = [
        {
            label: "Performance (%)",
            data: [competitiveness, onTimeRate],
            backgroundColor: ["#60a5fa", "#34d399"],
            borderRadius: [10, 10],
        },
    ];

    const totalAppliedEvents = applications.filter(app => app.status === 'Pending').length

    const reviews = reviewed.filter(rev => rev.reviewed_id === userData.id)

    const pendingContracts = useMemo(() =>
        contracts.filter(contract => contract?.status === "Pending" && contract.supplier_id === userData.id),
        [contracts]);

    const activeContracts = useMemo(() =>
        contracts.filter(contract => contract?.status === "Approved" && contract.supplier_id === userData.id),
        [contracts, userData.id]);

    const activeEventsContracts = useMemo(() =>
        events.filter(event => activeContracts.some(cont => event.id === cont.event_id)),
        [events, activeContracts])

    const completeContracts = useMemo(() =>
        contracts.filter(contract => contract?.status === "Completed" && contract.supplier_id === userData.id),
        [contracts, userData.id]);

    const contractHistory = useMemo(() => contracts.filter(contract => contract?.status === "Completed" || contract?.status === "Cancelled" && contract.supplier_id === userData.id), [contracts, userData.id])

    const contractHistoryEvents = useMemo(() =>
        contractHistory.map(contract =>
            events.find(event => event.id === contract.event_id)
        ).filter(Boolean),
        [contractHistory, events]);

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

    const contractEventsforComplete = useMemo(() =>
        completeContracts.map(contract =>
            events.find(event => event.id === contract.event_id)
        ).filter(Boolean),
        [completeContracts, events]);

    const monthlyRatings = Array(12).fill(null).map((_, i) => {
        const monthlyReviews = reviews?.filter(rev => {
            const date = rev.createdAt?.toDate ? rev.createdAt.toDate() : null;
            return date && date.getMonth() === i;
        });

        if (monthlyReviews.length === 0) return null;
        const avg = monthlyReviews.reduce((sum, rev) => sum + rev.rating, 0) / monthlyReviews.length;
        return avg;
    });



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

                    console.log('is sameday', isSameDay)


                if (isSameDay) {

                    const notifQuery = query(
                        collection(db, "notifications"),
                        where("referenced_id", "==", contract.id),
                        where("receiver_id", "==", supplier?.id),
                        where("referenced_type", "==", "contract")
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
                            referenced_type: 'contract',
                            referenced_id: contract.id,
                            unread: true,
                            receiver_id: supplier?.id,
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

    const AppliedColor = (status) => {

        const colors = {
            Approved: 'bg-green-100',
            Pending: 'bg-yellow-100',
            Reject: 'bg-red-100',
        }
        return colors[status]
    }

    const openContractModal = (contract) => {
        setSelectedContract(contract)
        setIsContractModalOpen(true)
    };

    const closeContractModal = () => {
        setIsContractModalOpen(false)
        setSelectedContract(null)
    };


    return (
        <>
            <Title>Supplier Dashboard</Title>

            {isContractModalOpen && selectedContract && (
                <Suspense fallback={<LoadingOverlay isLoading={true} message="Pleasee waitt.." />}>
                    <ContractModal
                        isOpen={isContractModalOpen}
                        onClose={closeContractModal}
                        userData={userData}
                        event_id={selectedContract.event_id}
                        user_id={userData.id}
                        supplier_id={selectedContract.supplier_id}
                        eventData={selectedContract.eventData}
                        supplierData={selectedContract.supplierData}
                    />
                </Suspense>
            )}

            {isAllLoading ? (
                <PageLoading />
            ) : (
                <div className="bg-gradient-to-br ">
                    {/* Header */}

                    <div className="flex justify-between items-baseline">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-10">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                    Supplier Dashboard
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base mt-1">
                                    Welcome back, <span className="font-semibold text-gray-800">{userData?.first_name}</span>
                                </p>
                            </div>
                        </div>

                        <GenerateReport
                            title="Supplier Performance Report"
                            filename={`${userData.first_name}_Supplier_Report`}
                            userData={userData}
                            fields={[
                                { label: "Total Earnings", value: `PHP ${totalEarning.toLocaleString()}` },
                                { label: "On-Time Delivery Rate", value: `${onTimeRate.toFixed(0)}%` },
                                { label: "Price Competitiveness", value: `${competitiveness.toFixed(1)}%` },
                                { label: "Total Applied Events", value: totalAppliedEvents },
                            ]}
                            sections={[
                                {
                                    title: "Monthly Ratings",
                                    head: ["Month", "Average Rating"],
                                    body: monthlyRatings.map((rating, i) => [
                                        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
                                        rating ? rating.toFixed(1) : "N/A",
                                    ]),
                                },
                            ]}
                        />
                    </div>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[
                            { title: "On-Time Delivery", value: onTimeRate.toFixed(0) + "%", icon: Package, color: "from-blue-500 to-blue-600" },
                            {
                                title: "Price Competitiveness", value: competitiveness >= 0 ? competitiveness.toFixed(1) + "%" : competitiveness.toFixed(1) + "%", icon: ChartNoAxesCombined, color: "from-yellow-500 to-yellow-600"
                            },
                            { title: "Total Earnings", value: `₱${totalEarning}`, icon: PhilippinePeso, color: "from-green-500 to-green-600" },
                            { title: "Applied Events", value: totalAppliedEvents, icon: CalendarPlus, color: "from-violet-500 to-violet-600" },
                        ].map(({ title, value, icon: Icon, color }, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-sm text-gray-500">{title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                                </div>
                                <div className={`p-3 rounded-full bg-gradient-to-r ${color}`}>
                                    <Icon className="text-white w-6 h-6" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div ref={analyticsRef} className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-10">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><ChartNoAxesCombined /> Performance Metrics</h3>
                            <BarChart
                                labels={labels}
                                datasets={datasets}
                                title="Supplier Performance"
                                yLabel="%"
                            />

                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp /> Raiting Trends</h3>
                            <LineChart
                                className="w-full h-64"
                                dataPoints={monthlyRatings}
                                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                                label="Average Rating"
                            />
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <TabGroup>
                        <TabList className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                            {["Applied Events", "Reviews", "Calendar", "Offers", "Contracts"].map((tab, i) => (
                                <Tab
                                    key={i}
                                    className="rounded-full px-5 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-100 data-[selected]:bg-gradient-to-r data-[selected]:from-blue-500 data-[selected]:to-violet-600 data-[selected]:text-white shadow-sm transition-all"
                                >
                                    {tab}
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels className="bg-white border border-gray-200 rounded-2xl shadow-md p-3 transition-all">
                            {/* Applied Events */}
                            <TabPanel>
                                {applications.length ? (
                                    <div className="space-y-3">
                                        {applications.map((app) => (
                                            <div
                                                key={app.id}
                                                className={`p-4 rounded-xl flex justify-between items-center border border-gray-300 ${AppliedColor(app.status)} hover:shadow-lg transition-all`}
                                            >
                                                <div className="flex gap-3 items-center">
                                                    <Calendar className="text-blue-500" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {events.find((ev) => ev.id === app.event_id)?.event_name}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            Applied:{" "}
                                                            {app.AppliedAt?.toDate().toLocaleDateString("en-US", {
                                                                month: "long",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 text-xs rounded-full font-medium ${app.status === "Approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : app.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {app.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-10">No applications found.</p>
                                )}
                            </TabPanel >

                            {/* Reviews */}
                            < TabPanel >
                                {
                                    reviews.length ? (
                                        <div className="space-y-4">
                                            {reviews.map((rev, i) => (
                                                <div
                                                    key={i}
                                                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all shadow-sm"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {userProfiles.find((u) => u.id === rev.user_id)?.profile_pic ? (
                                                            <img
                                                                loading="lazy"
                                                                src={userProfiles.find((u) => u.id === rev.user_id).profile_pic}
                                                                alt="Reviewer"
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 text-white font-semibold flex items-center justify-center rounded-full">
                                                                {rev.reviewer_name?.[0]?.toUpperCase() || "A"}
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-800">{rev.reviewer_name}</p>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {[...Array(5)].map((_, j) => (
                                                                    <Star
                                                                        key={j}
                                                                        className={`w-4 h-4 ${j < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <p className="text-sm text-gray-700 mt-2">{rev.comment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">No reviews yet.</p>
                                    )
                                }
                            </TabPanel >

                            {/* Calendar Tab */}
                            < TabPanel >
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
                                                events={activeEventsContracts.map(e => ({ title: e.event_name, date: e.event_date?.date_value }))}

                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabPanel >

                            {/* Offers Tab */}
                            < TabPanel >
                                <div className="space-y-3">
                                    {pendingContracts.map((offers, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row sm:gap-2 justify-between ${AppliedColor(offers.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
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

                                                <button
                                                    onClick={() => openContractModal({
                                                        supplierData: supplier,
                                                        eventData: contractEventsforPending[index],
                                                        supplier_id: offers.supplier_id,
                                                        user_id: userData.id,
                                                        userData: userData,
                                                        event_id: offers.event_id,
                                                    })}
                                                    className={'transition-all duration-100 hover:bg-blue-700 self-center px-3 py-2 text-sm rounded-md bg-blue-600 text-white '}
                                                >
                                                    View Contract
                                                </button>

                                            </div>
                                        </div>
                                    ))}

                                    {pendingContracts.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            No Offers Found
                                        </div>
                                    )}
                                </div>
                            </TabPanel >

                            {/* Contracts Tab */}
                            < TabPanel >
                                <div className="flex flex-col gap-3">
                                    {activeContracts.map((offers, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row sm:gap-2 justify-between ${AppliedColor(offers.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
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

                                                <button
                                                    onClick={() => openContractModal({
                                                        supplierData: supplier,
                                                        eventData: contractEventsforActive[index],
                                                        supplier_id: offers.supplier_id,
                                                        user_id: userData.id,
                                                        userData: userData,
                                                        event_id: offers.event_id,
                                                    })}
                                                    className={'transition-all duration-100 hover:bg-blue-700 self-center px-3 py-2 text-sm rounded-md bg-blue-600 text-white '}
                                                >
                                                    View Contract
                                                </button>

                                                {/* <ContractModal userData={userData}
                                                    event_id={offers.event_id}
                                                    supplier_id={offers.supplier_id}
                                                    supplierData={supplier}
                                                    eventData={contractEventsforActive[index]}
                                                    user_id={userData.id} /> */}

                                            </div>
                                        </div>
                                    ))}

                                    {activeContracts.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            No Contracts Found
                                        </div>
                                    )}
                                </div>
                            </TabPanel >

                        </TabPanels >
                    </TabGroup >

                    {/* Recent Contracts Sidebar */}
                    < div className="lg:col-span-1 mt-5" >
                        <div className="bg-white border border-gray-300 shadow-xl rounded-xl p-6 flex flex-col h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="p-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full"><ReceiptText size={20} /></div> Recent Contract History</h3>

                            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                                {contractHistory.slice(0, 5).map((contract, index) => (
                                    <div
                                        key={contract.id}
                                        className="p-3 rounded-lg border flex justify-between items-center border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">
                                                {contractHistoryEvents[index]?.event_name || "Untitled Event"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {contract.created_at?.toDate().toLocaleDateString([], {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[contract.status.toLowerCase()]}`}>
                                                {contract.status}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openContractModal({
                                                    supplierData: supplier,
                                                    eventData: contractHistoryEvents[index],
                                                    supplier_id: contract.supplier_id,
                                                    user_id: userData.id,
                                                    userData: userData,
                                                    event_id: contract.event_id,
                                                })}
                                                className={'transition-all duration-100 hover:bg-blue-700 self-center px-3 py-2 text-sm rounded-md bg-blue-600 text-white '}
                                            >
                                                View Contract
                                            </button>
                                            {contract.status === "Completed" && (
                                                <>
                                                    {reviewed.find(rev => rev.reviewed_id === contract.supplier_id && rev.user_id === contract.planner_id && contract.event_id === rev.event_id) ? (
                                                        <span className="text-white py-1 px-4 rounded-md text-sm flex items-center bg-gray-400">Reviewed</span>
                                                    ) : (
                                                        <Review reviewed_id={contract?.planner_id} reviewer_name={supplier.supplier_name} eventData={contract} />
                                                    )}
                                                </>
                                            )}
                                        </div>

                                    </div>
                                ))}

                                {contractHistory.length === 0 && (
                                    <p className="text-center text-gray-500 text-md pb-5 pt-3">No recent ended contracts</p>
                                )}
                            </div>
                        </div>
                    </div >

                </div >
            )
            }
        </>
    )
}  