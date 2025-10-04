import DashboardCard from "../../components/DashboardCards"
import { } from "react-router-dom"
import { CalendarDays, Star, PhilippinePeso, ShieldCheck, Calendar, ReceiptText } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"
import { PieChart, BarChart } from "../../components/Charts"
import { Title } from "react-head"
import { useFetchContract } from "../../hooks/useContract"
import { useEffect, useMemo, useState } from "react"
import { useFetchEventsById } from "../../hooks/useEvents"
import ContractModal from "../../components/ContractModal"
import { useFetchSuppliers } from "../../hooks/useSupplier"
import { useFetchAllTransaction } from "../../hooks/useTransaction"

export default function EventDashboard({ userData }) {

    const { contracts } = useFetchContract()
    const { events, isLoading } = useFetchEventsById(userData?.id)
    const { suppliers } = useFetchSuppliers()
    const { transactions } = useFetchAllTransaction(userData?.id)
    const [barEventData, setBarEventData] = useState({
        labels: [],
        planned: [],
        actual: []
    });

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


    const pendingContracts = useMemo(() =>
        contracts.filter(contract => events.some(event => contract?.status === "Pending" && event.id === contract.event_id)),
        [contracts, events]);

    const eventContracts = events.filter(event =>
        pendingContracts.some(cont => cont.event_id === event.id)
    );

    console.log(eventContracts)


    const activeContracts = useMemo(() =>
        contracts.filter(contract => events.some(event => contract?.status === "Approved" && event.id === contract.event_id)),
        [contracts, events]);

    const contractEventsforPending = useMemo(() =>
        pendingContracts.map(contract =>
            events.find(event => event.id === contract.event_id)
        ).filter(Boolean),
        [pendingContracts, events]);

    const contractSuppliersForPending = useMemo(() =>
        suppliers.reduce((acc, supplier) => {
            const contract = pendingContracts.find(c => c.supplier_id === supplier.id);
            if (contract) {
                acc[supplier.id] = { ...supplier, contract };
            }
            return acc;
        }, {}),
        [pendingContracts, suppliers]
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

        // Generate colors dynamically (can adjust if needed)
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
            {isLoading && (
                <div className="flex justify-center items-center py-[15rem]">
                    <div className="relative">
                        {/* Background glow effect */}
                        <div className="absolute inset-0 h-12 w-12 bg-blue-500/10 rounded-full blur-sm animate-pulse"></div>
                        {/* Main spinner */}
                        <div className="h-12 w-12 border-2 border-blue-100 rounded-full animate-spin border-t-blue-600 border-r-blue-600"></div>
                        {/* Inner ring */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/1 h-6 w-6 border border-blue-200 rounded-full"></div>
                    </div>
                </div>
            )}

            {!isLoading && (
                <>
                    <Title>Dashboard</Title>
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Event Dashboard
                            </h1>
                            <span className="text-sm text-gray-600">
                                Manage your Events
                            </span>
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

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

                        {/* Bar Chart - Supplier Category Comparison */}
                        <div className="xl:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                                <div className="w-full lg:w-auto">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                        Budget Utilization
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">Actual spending vs. planned budget</p>

                                </div>

                            </div>
                            <div className="mt-4 sm:mt-6 overflow-x-auto">
                                <div className="min-w-[300px]">
                                    <BarChart
                                        className="h-96 w-full"
                                        labels={barEventData.labels}
                                        datasets={[
                                            {
                                                label: "Planned Budget",
                                                data: barEventData.planned,
                                                backgroundColor: "#60a5fa",
                                                borderRadius: 5,
                                            },
                                            {
                                                label: "Actual Spending",
                                                data: barEventData.actual,
                                                backgroundColor: "#34d399",
                                                borderRadius: 5,
                                            },
                                        ]}
                                        title="Budget vs Actual"
                                        xLabel="Events"
                                        yLabel="Amount (₱)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart - Supplier Distribution */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <div className="mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                    Budget Allocation
                                </h3>
                                <p className="text-sm text-gray-500">How your event budget is distributed</p>
                            </div>

                            <div className="mb-4 sm:mb-6 flex justify-center">
                                <div className="w-full max-w-[250px]">
                                    <PieChart
                                        className="w-full h-64"
                                        labels={pieChartData.labels}
                                        dataValues={pieChartData.dataValues}
                                        backgroundColors={pieChartData.backgroundColors}
                                        borderColors={pieChartData.borderColors}
                                        title="Event Budget Distribution by Type"
                                    />
                                </div>
                            </div>

                            {/* Optional: show legend dynamically */}
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
                    </div>

                    {/* Stats Cards - Modern Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">

                        {/* total suppliers */}
                        <DashboardCard className={'py-6 sm:py-10'}>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-base sm:text-lg">Active Contracts</span>
                                <span className="block text-xl sm:text-2xl font-bold">{activeContracts.length}</span>
                                <span className="block text-blue-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full py-1 px-1 flex-shrink-0">
                                <ReceiptText width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                            </span>
                        </DashboardCard>

                        {/* upcoming events */}
                        <DashboardCard className={'py-6 sm:py-10'}>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-base sm:text-lg">Upcoming Events</span>
                                <span className="block text-xl sm:text-2xl font-bold">{totalUpcomingsEvents}</span>
                                <span className="block text-blue-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full py-1 px-1 flex-shrink-0">
                                <CalendarDays width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                            </span>
                        </DashboardCard>

                        {/* rated suppliers */}
                        <DashboardCard className={'py-6 sm:py-10'}>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-base sm:text-lg">Rated Suppliers</span>
                                <span className="block text-xl sm:text-2xl font-bold">24</span>
                                <span className="block text-blue-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full py-1 px-1 flex-shrink-0">
                                <Star width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                            </span>
                        </DashboardCard>

                        {/* budget spent */}
                        <DashboardCard className={'py-6 sm:py-10'}>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-base sm:text-lg">Budget Spent</span>
                                <span className="block text-xl sm:text-2xl font-bold">{transactions.map(trans => trans.amount)}</span>
                                <span className="block text-blue-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-green-500 to-green-600 rounded-full py-1 px-1 flex-shrink-0">
                                <PhilippinePeso width={40} height={40} className="sm:w-[50px] sm:h-[50px] p-2 sm:p-3 text-white" />
                            </span>
                        </DashboardCard>
                    </div>

                    <TabGroup className={'mt-6 sm:mt-8'}>
                        <TabList className="flex gap-2 sm:gap-4 mb-3 overflow-x-auto">
                            <Tab
                                className="rounded-full px-4 sm:px-5 py-2 sm:py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors whitespace-nowrap"
                            >
                                Applied Supplier
                            </Tab>
                        </TabList>
                        <TabPanels className={'rounded-xl border border-gray-300 bg-white shadow-xl'}>
                            <TabPanel className="p-3 sm:p-5 sm:px-7">
                                <div className="p-1  flex flex-col gap-3">
                                    {pendingContracts.map((offers, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between ${AppliedColor(offers.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                                <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                    <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                            Supplier name: {contractSuppliersForPending[offers.supplier_id].supplier_name}
                                                        </span>

                                                        <span className="text-gray-500 text-xs sm:text-sm">
                                                            Applied: {offers.created_at.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ContractModal eventData={eventContracts[index]} event_id={offers.event_id} supplier_id={offers.supplier_id} supplierData={contractSuppliersForPending[offers.supplier_id]} barEventData={contractEventsforPending[index]} user_id={userData.id} />

                                            </div>
                                        </div>
                                    ))}

                                    {pendingContracts.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            <span className="block font-semibold">No applied bookings.</span>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </>
            )}
        </>
    )
}