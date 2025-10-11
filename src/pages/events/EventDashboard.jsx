import DashboardCard from "../../components/DashboardCards"
import { } from "react-router-dom"
import { CalendarDays, Star, PhilippinePeso, ShieldCheck, Calendar, ReceiptText, BarChart3, ChartNoAxesCombined } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { PieChart, BarChart } from "../../components/Charts"
import { Title } from "react-head"
import { useFetchContract } from "../../hooks/useContract"
import { useEffect, useMemo, useState } from "react"
import { useFetchEventsById } from "../../hooks/useEvents"
import ContractModal from "../../components/ContractModal"
import { useFetchSuppliers } from "../../hooks/useSupplier"
import { useFetchTransactionById } from "../../hooks/useTransaction"
import PageLoading from "../../components/PageLoading"
import { useFetchReviews } from "../../hooks/useReviews"
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react"
import EventModal from "../../components/EventModal"
import GenerateReport from "../../components/GeneraeReport"

export default function EventDashboard({ userData }) {

    const { contracts, isLoading: isContractsLoading } = useFetchContract()
    const { events, isLoading: isEventLoading } = useFetchEventsById(userData?.id)
    const { suppliers, isLoading: isSuppliersLoading } = useFetchSuppliers()
    const { transactions, isLoading: isTransactionsLoading } = useFetchTransactionById(userData?.id)
    const { reviews, isLoading: isReviewsLoading } = useFetchReviews()
    const [barEventData, setBarEventData] = useState({
        labels: [],
        planned: [],
        actual: []
    });

    const isAllLoading = isEventLoading || isSuppliersLoading || isTransactionsLoading || isReviewsLoading

    const totalEvents = events.length;
    const approvedContracts = contracts.filter(c => c.status === "Approved").length;
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : "N/A";

    const fields = [
        { label: "Total Events Organized".toUpperCase(), value: totalEvents },
        { label: "Approved Contracts".toUpperCase(), value: approvedContracts },
        { label: "Total Budget Spent".toUpperCase(), value: `PHP ${totalSpent.toLocaleString()}` },
        { label: "Average Supplier Rating".toUpperCase(), value: avgRating },
    ];

    const sections = useMemo(() => [
        {
            title: "Event Summary",
            head: ["Event Name", "Type", "Budget", "Status"],
            body: events.map(e => [
                e.event_name.toUpperCase(),
                e.event_type?.value.toUpperCase() || "N/A",
                `PHP ${(Number(e.event_budget) || 0).toLocaleString()}`,
                e.event_status?.value.toUpperCase() || "N/A",
            ]),
        },
    ], [events]);

    const reviewedSuppliers = reviews.filter(rev => rev.user_id === userData.id)

    const totalUpcomingsEvents = events.filter(event => event.event_status.value === "upcoming").length

    useEffect(() => {
        if (events.length) {
            setBarEventData({
                labels: events.map(event => event.event_name),
                planned: events.map(event => Number(event.event_budget)),
                actual: events.map(event =>
                    transactions.filter(trans => trans.event_id === event.id)
                        .reduce((sum, value) => sum + value.amount, 0)
                )
            });
        }
    }, [events, transactions]);


    const bookingContracts = useMemo(() =>
        contracts.filter(contract => events.some(event => event.id === contract.event_id)),
        [contracts, events]);

    const eventContracts = events.filter(event =>
        bookingContracts.some(cont => cont.event_id === event.id)
    );

    const activeContracts = useMemo(() =>
        contracts.filter(contract => events.some(event => contract?.status === "Approved" && event.id === contract.event_id)),
        [contracts, events]);

    const contractEventsforPending = useMemo(() =>
        bookingContracts.map(contract =>
            events.find(event => event.id === contract.event_id)
        ).filter(Boolean),
        [bookingContracts, events]);

    const contractSuppliers = useMemo(() =>
        suppliers.reduce((acc, supplier) => {
            const contract = bookingContracts.find(c => c.supplier_id === supplier.id);
            if (contract) {
                acc[supplier.id] = { ...supplier, contract };
            }
            return acc;
        }, {}),
        [bookingContracts, suppliers]
    );

    const eventsByType = useMemo(() => {
        const result = {};

        events.forEach(event => {
            const type = event.event_type?.value || "Unknown";
            const budget = Number(event.event_budget || 0);

            if (!result[type]) {
                result[type] = { count: 0, totalBudget: 0 };
            }

            result[type].count += 1;
            result[type].totalBudget += budget;
        });

        return result;
    }, [events]);

    const pieChartData = useMemo(() => {
        const labels = Object.keys(eventsByType);
        const dataValues = Object.values(eventsByType).map(e => e.totalBudget);

        const backgroundColors = [
            "#4ade80", "#facc15", "#f87171", "#60a5fa", "#a78bfa", "#f472b6", "#34d399"
        ].slice(0, labels.length);

        const borderColors = backgroundColors.map(color => color);

        return { labels, dataValues, backgroundColors, borderColors };
    }, [eventsByType]);

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
            {isAllLoading && (
                <PageLoading />
            )}

            {!isAllLoading && (
                <>
                    <Title>Dashboard</Title>
                    {/* Header Section */}
                    <div>
                        <div className="flex justify-between items-baseline">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-10">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                        Event Dashboard
                                    </h1>
                                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                                        Welcome back, <span className="font-semibold text-gray-800">{userData?.first_name}</span>
                                    </p>
                                </div>
                            </div>

                            <GenerateReport
                                title="Planner Event Summary Report"
                                filename={`${userData.first_name}_Event_Report`}
                                userData={userData}
                                fields={fields}
                                sections={sections}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {userData.role !== 'Supplier' && userData.verification_status === 'unverified' && (
                                <a href='/verify' className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors text-center">
                                    Verify Account
                                </a>
                            )}

                            {userData?.verification_status === 'pending' && (
                                <span className="px-4 py-2 bg-yellow-400 text-white text-sm font-medium rounded-lg text-center">
                                    Pending
                                </span>
                            )}

                            {userData?.status === 'verified' && (
                                <span className="px-4 py-2 border-2 flex items-center justify-center gap-2 border-green-400 text-green-400 text-sm font-medium rounded-lg">
                                    Verified <ShieldCheck className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards - Modern Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {[
                            { title: "Active Contracts", value: activeContracts.length, icon: ReceiptText, color: "from-blue-500 to-blue-600" },
                            { title: "Upcoming Events", value: totalUpcomingsEvents, icon: CalendarDays, color: "from-green-500 to-green-600" },
                            { title: "Rated Suppliers", value: reviewedSuppliers.length, icon: Star, color: "from-yellow-500 to-yellow-600" },
                            { title: "Budget Spent", value: transactions.reduce((sum, trans, i) => sum + trans.amount, 0), icon: PhilippinePeso, color: "from-violet-500 to-violet-600" },
                        ].map(({ title, value, icon: Icon, color }, i) => (
                            <div
                                key={i}
                                className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group overflow-hidden"
                            >
                                {/* Glow effect */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${color} transition-opacity duration-300`} />

                                {/* Content */}
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <p className="text-sm text-gray-500">{title}</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                                    </div>
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r ${color} shadow-md`}>
                                        <Icon className="text-white w-6 h-6" />
                                    </div>
                                </div>

                            </div>
                        ))}

                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

                        {/* Pie Chart - Supplier Distribution */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <div className="mb-4 sm:mb-6">
                                <div className="w-full lg:w-auto">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 /> Budget Utilization</h3>
                                </div>
                            </div>

                            <div className="mb-4 sm:mb-6 flex justify-center">
                                <div className="w-full max-w-[250px] mt-5">
                                    <PieChart
                                        className="w-full h-64"
                                        labels={pieChartData.labels || []}
                                        dataValues={pieChartData.dataValues || []}
                                        backgroundColors={pieChartData.backgroundColors || []}
                                        borderColors={pieChartData.borderColors || []}
                                        title="Event Budget Distribution by Type"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {pieChartData.labels.map((label, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pieChartData.backgroundColors[idx] }}></div>
                                            <span className="text-sm text-gray-600">{label}</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {((pieChartData.dataValues[idx] / pieChartData.dataValues.reduce((sum, value) => sum + value, 0)) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bar Chart - Supplier Category Comparison */}
                        <div className="xl:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                                <div className="w-full lg:w-auto">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><ChartNoAxesCombined /> Budget Utilization</h3>
                                </div>

                            </div>
                            <div className="mt-4 sm:mt-6 overflow-x-auto">
                                <div className="min-w-[300px]">
                                    <BarChart
                                        className="h-96 w-full"
                                        labels={barEventData.labels || []}
                                        datasets={[
                                            {
                                                label: "Planned Budget",
                                                data: barEventData.planned,
                                                backgroundColor: "#60a5fa",
                                                borderRadius: 10,
                                            },
                                            {
                                                label: "Actual Spending",
                                                data: barEventData.actual,
                                                backgroundColor: "#34d399",
                                                borderRadius: 10,
                                            },
                                        ]}
                                        title="Budget vs Actual"
                                        xLabel="Events"
                                        yLabel="Amount"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <TabGroup className={'mt-5 bg-white border border-gray-200 rounded-2xl shadow-md p-3 transition-all'}>
                        <TabList className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                            {["Upcoming events", "Supplier Bookings", "Calendar"].map((tab, i) => (
                                <Tab
                                    key={i}
                                    className="rounded-full px-5 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-100 data-[selected]:bg-gradient-to-r data-[selected]:from-blue-500 data-[selected]:to-blue-600 data-[selected]:text-white shadow-sm transition-all"
                                >
                                    {tab}
                                </Tab>
                            ))}
                        </TabList>

                        {/* Upcoming events */}
                        <TabPanels className={'rounded-xl border border-gray-300 bg-white shadow-xl'}>
                            <TabPanel>
                                {events.length ? (
                                    <div className="space-y-3 p-3 h-[250px] overflow-y-auto">
                                        {events.map((event) => (
                                            <div key={event.id} className="p-4 flex justify-between items-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all shadow-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{event.event_name}</p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        Date: {event.event_date?.date_value || "TBA"}
                                                    </p>
                                                </div>

                                                <EventModal eventData={event} event_purpose={'dashboard'} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-10">No upcoming events.</p>
                                )}
                            </TabPanel>

                            {/* Supplier Booking */}
                            <TabPanel>
                                <div className="p-2 flex flex-col gap-3">
                                    {bookingContracts.map((offers, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between ${AppliedColor(offers.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                                <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                    <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                            Supplier name: {contractSuppliers[offers.supplier_id].supplier_name}
                                                        </span>

                                                        <span className="text-gray-500 text-xs sm:text-sm">
                                                            Applied: {offers.created_at.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ContractModal userData={userData} eventData={eventContracts[index]} event_id={offers.event_id} supplier_id={offers.supplier_id} supplierData={contractSuppliers[offers.supplier_id]} user_id={userData.id} />

                                            </div>
                                        </div>
                                    ))}

                                    {bookingContracts.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            <span className="block font-semibold">No applied bookings.</span>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>

                            {/* Calendar */}
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
                                                events={events.map(e => ({ title: e.event_name, date: e.event_date?.date_value }))}

                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabPanel >
                        </TabPanels>
                    </TabGroup>
                </>
            )}
        </>
    )
}