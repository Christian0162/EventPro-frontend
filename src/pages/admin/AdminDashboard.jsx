import { useMemo } from "react"
import { Title } from "react-head";
import { Users, IdCard,  Calendar, BarChart3, ChartNoAxesCombined, TrendingUp, AlertTriangle, ReceiptText, PhilippinePeso, Package, BanknoteArrowUp, ShieldAlert } from "lucide-react";
import { Tab, TabList, TabPanels, TabGroup, TabPanel } from "@headlessui/react";
import { PieChart, BarChart, LineChart } from "../../components/Charts";
import PageLoading from "../../components/PageLoading";
import { useFetchAllVerification } from "../../hooks/useVerification";
import { useFetchUsers } from "../../hooks/useUsers";
import { useFetchSuppliers } from "../../hooks/useSupplier";
import { useFetchEvents } from "../../hooks/useEvents";
import { useFetchAllTransaction } from "../../hooks/useTransaction";
import { useFetchContract } from "../../hooks/useContract";

export default function AdminDashboard({ userData }) {
    const { verifications, isLoading: isVerificationLoading } = useFetchAllVerification()
    const { users, isLoading: isUsersLoading } = useFetchUsers()
    const { suppliers } = useFetchSuppliers()
    const { events } = useFetchEvents()
    const { transactions } = useFetchAllTransaction()
    const { contracts } = useFetchContract()

    const allLoading = isUsersLoading || isVerificationLoading

    const pendingPlanner = users.filter(user => user.role === "Event Planner" && user.verification_status === "pending")
    const pendingSupplier = users.filter(user => user.role === "Supplier" && user.verification_status === "pending")

    const supplierVerification = verifications.filter(v => pendingSupplier.some(sup => v.id === sup.id))
    const eventVerification = verifications.filter(v => pendingPlanner.some(sup => v.id === sup.id))

    console.log(transactions)

    const totalUsers = users.length
    const totalEarnings = transactions.reduce((sum, t) => sum + (Number(t.platform_fee) || 0), 0);
    const activeEvents = useMemo(() => events.filter(e => e.status !== "completed").length, [events]);
    const totalSuppliers = suppliers.length;
    const verifiedUsers = users.filter(s => s.verification_status === "verified").length;
    const pendingRequests = supplierVerification.length + eventVerification.length;
    const totalContracts = contracts.length;
    const topEarningSupplier = useMemo(() => {
        if (!transactions.length) return "N/A";
        const supplierEarnings = {};
        transactions.forEach(t => {
            supplierEarnings[t.supplier_id] = (supplierEarnings[t.supplier_id] || 0) + t.amount;
        });
        const topSupplierId = Object.keys(supplierEarnings).reduce((a, b) => supplierEarnings[a] > supplierEarnings[b] ? a : b);
        const topSupplier = suppliers.find(s => s.id === topSupplierId);
        return topSupplier ? topSupplier.name : "N/A";
    }, [transactions, suppliers]);

    const userCountsPerMonth = Array(12).fill(null).map((_, month) =>
        users.filter(u => {
            const date = u.createdAt?.toDate ? u.createdAt.toDate() : null;
            return date && date.getMonth() === month;
        }).length
    );



    const AppliedColor = (status) => ({
        approved: 'bg-green-100',
        pending: 'bg-yellow-100',
        reject: 'bg-red-100',
    }[status]);

    // Example Pie chart data (you can replace with actual logic)
    const pieChartData = useMemo(() => ({
        labels: ["Catering", "Venue", "Photography", "Others"],
        dataValues: [45, 30, 15, 10],
        backgroundColors: ["#60a5fa", "#a78bfa", "#f97316", "#34d399"],
        borderColors: ["#60a5fa", "#a78bfa", "#f97316", "#34d399"]
    }), []);

    return (
        <>
            {allLoading && <PageLoading />}

            {!allLoading && (
                <>
                    <Title>Admin Dashboard</Title>

                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base mt-1">
                                Welcome back, <span className="font-semibold text-gray-800">{userData?.first_name}</span>
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {[
                            { title: "Total Platform Earnings", value: `₱${(totalEarnings)}`, icon: PhilippinePeso, color: "from-violet-500 to-violet-600" },
                            { title: "Active Events", value: activeEvents, icon: Calendar, color: "from-yellow-500 to-yellow-600" },
                            { title: "Total Suppliers", value: totalSuppliers, icon: Package, color: "from-blue-500 to-blue-600" },
                            { title: "Verified Users", value: verifiedUsers, icon: IdCard, color: "from-green-500 to-green-600" },
                            { title: "Pending Requests", value: pendingRequests, icon: ShieldAlert, color: "from-red-500 to-red-600" },
                            { title: "Total Contracts", value: totalContracts, icon: ReceiptText, color: "from-orange-500 to-orange-600" },
                            { title: "Top Earning Supplier", value: topEarningSupplier, icon: BanknoteArrowUp, color: "from-pink-500 to-pink-600" },
                            { title: "Total Users", value: totalUsers, icon: Users, color: "from-pink-500 to-pink-600" },
                            // { title: "Reported Issues", value: reportedIssues.length, icon: AlertTriangle, color: "from-gray-500 to-gray-600" },
                        ].map(({ title, value, icon: Icon, color }, i) => (
                            <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group overflow-hidden">
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${color} transition-opacity duration-300`} />
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
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
                        {/* Pie Chart */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 /> Supplier Distribution</h3>
                            <div className="flex justify-center">
                                <div className="w-full max-w-[250px] mt-5">
                                    <PieChart
                                        className="w-full h-64"
                                        labels={pieChartData.labels}
                                        dataValues={pieChartData.dataValues}
                                        backgroundColors={pieChartData.backgroundColors}
                                        borderColors={pieChartData.borderColors}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp />Registered Users Overview</h3>
                            <LineChart
                                className="w-full h-64"
                                dataPoints={userCountsPerMonth}
                                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                                label="Registerd Users"
                            />
                        </div>

                        {/* Bar Chart */}
                        <div className="xl:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><ChartNoAxesCombined /> Supplier Verification Comparison</h3>
                            <div className="mt-4 sm:mt-6 overflow-x-auto">
                                <div className="min-w-[300px]">
                                    <BarChart
                                        labels={["Suppliers", "Planners"]}
                                        datasets={[
                                            { label: "Pending", data: [supplierVerification.length, eventVerification.length], backgroundColor: "#facc15", borderRadius: 10 },
                                        ]}
                                        title="Pending Verifications"
                                        xLabel="Roles"
                                        yLabel="Count"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs for Verification */}
                    <TabGroup className="mt-5 bg-white border border-gray-200 rounded-2xl shadow-md p-3 transition-all">
                        <TabList className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                            {["Suppliers Request", "Planners Request"].map((tab, i) => (
                                <Tab
                                    key={i}
                                    className="rounded-full px-5 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-100 data-[selected]:bg-gradient-to-r data-[selected]:from-blue-500 data-[selected]:to-blue-600 data-[selected]:text-white shadow-sm transition-all"
                                >
                                    {tab}
                                </Tab>
                            ))}
                        </TabList>
                        <TabPanels className="rounded-xl border border-gray-300 bg-white shadow-xl">
                            <TabPanel className="p-3 sm:p-5 sm:px-7">
                                {supplierVerification.length ? supplierVerification.map((v, i) => (
                                    <div key={i} className={`flex flex-col sm:flex-row gap-2 justify-between ${AppliedColor("pending")} shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                        <div className="flex items-start sm:items-center space-x-3 flex-1">
                                            <Calendar size={20} className="text-blue-600 bg-gray-200 rounded-full h-8 w-8 p-2 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium text-gray-900">{v.supplier_name}</span>
                                                <span className="text-gray-500 text-xs sm:text-sm">
                                                    Requested: {v.createdAt?.toDate().toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <a href={`/review/${v.id}`} className="px-6 py-1 bg-blue-600 rounded-lg text-white">Review</a>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-500 py-10">No pending supplier verification.</p>
                                )}
                            </TabPanel>

                            <TabPanel className="p-3 sm:p-5 sm:px-7">
                                {eventVerification.length ? eventVerification.map((v, i) => (
                                    <div key={i} className={`flex flex-col sm:flex-row gap-2 justify-between ${AppliedColor("pending")} shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                        <div className="flex items-start sm:items-center space-x-3 flex-1">
                                            <Calendar size={20} className="text-blue-600 bg-gray-200 rounded-full h-8 w-8 p-2 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium text-gray-900">{v.first_name} {v.last_name}</span>
                                                <span className="text-gray-500 text-xs sm:text-sm">
                                                    Requested: {v.createdAt?.toDate().toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <a href={`/review/${v.id}`} className="px-6 py-1 bg-blue-600 rounded-lg text-white">Review</a>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-500 py-10">No pending planner verification.</p>
                                )}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </>
            )}
        </>
    )
}
