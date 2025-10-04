import { useState, useEffect } from "react"
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Title } from "react-head";
import DashboardCard from "../../components/DashboardCards";
import { Users, IdCard, CalendarPlus, Calendar } from "lucide-react";
import { Tab, TabList, TabPanels, TabPanel, TabGroup } from "@headlessui/react";
import { BarChart, PieChart } from "../../components/Charts";

export default function AdminDashboard() {

    const [isLoading, setIsLoading] = useState(false);
    const [supplierVerification, setSupplierVerification] = useState([])
    const [eventVerification, setEventVerification] = useState([])

    useEffect(() => {
        setIsLoading(true)
        try {
            const unsubscribe = onSnapshot(collection(db, "verification"), async (onsnapshot) => {
                const verified = onsnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

                const onSnapshotUser = await getDocs(collection(db, "users"))
                const user = onSnapshotUser.docs.map(supplier => ({ id: supplier.id, ...supplier.data() }))
                const filteredSupplier = user.filter(user => user.role === "Supplier" && user.verification_status === "pending")
                const filteredEvent = user.filter(user => user.role === "Event Planner" && user.verification_status === "pending")

                const supplierFilteredVerification = verified.filter(verified => filteredSupplier.some(supplier => !verified.is_verified && verified.id === supplier.id))
                const eventFilteredVerification = verified.filter(verified => filteredEvent.some(event => !verified.is_verified && verified.id === event.id))
                setSupplierVerification(supplierFilteredVerification)
                setEventVerification(eventFilteredVerification)
                setIsLoading(false)

            })

            return () => unsubscribe()
        }
        catch (e) {
            console.error(e)
        }

    }, [])

    const AppliedColor = (status) => {

        const colors = {
            approved: 'bg-green-100',
            pending: 'bg-yellow-100',
            reject: 'bg-red-100',
        }
        return colors[status]
    }


    return (
        <>
            {isLoading && (
                <div className="flex justify-center items-center  py-[15rem]">
                    <div className="h-12 w-12 border border-t-blue-600 rounded-full animate-spin "></div>
                </div>
            )}

            {!isLoading && (
                <>
                    <Title>Admin - Dashboard</Title>
                    <div className="flex justify-between items-center flex-col lg:flex-row md:flex-row">
                        <div className="flex flex-col">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mt-5">

                        {/* Pie Chart - Supplier Distribution */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <div className="mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                    Supplier Distribution
                                </h3>
                                <p className="text-sm text-gray-500">Number of suppliers by category</p>
                            </div>

                            <div className="mb-4 sm:mb-6 flex justify-center">
                                <div className="w-full max-w-[250px]">
                                    <PieChart />
                                </div>
                            </div>

                            {/* Distribution Stats */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm text-gray-600">Catering</span>
                                    </div>
                                    <span className="text-sm font-medium">45%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm text-gray-600">Venue</span>
                                    </div>
                                    <span className="text-sm font-medium">30%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm text-gray-600">Photography</span>
                                    </div>
                                    <span className="text-sm font-medium">15%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-sm text-gray-600">Others</span>
                                    </div>
                                    <span className="text-sm font-medium">10%</span>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart - Supplier Category Comparison */}
                        <div className="xl:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                                <div className="w-full lg:w-auto">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                                        Supplier Category Comparison
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">Average rating over time</p>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-6 gap-2 sm:gap-0">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-sm text-gray-600">Catering</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-sm text-gray-600">Venue</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-sm text-gray-600">Photography</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left lg:text-right w-full lg:w-auto">
                                    <div className="text-sm text-gray-500">This Month</div>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-800">4.8</div>
                                    <div className="text-sm text-green-600">+0.2 from last month</div>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6 overflow-x-auto">
                                <div className="min-w-[300px]">
                                    <BarChart />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {/* Total Supplier*/}
                        <DashboardCard>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-lg text-gray-800 font-bold">Active Events</span>
                                <span className="block text-2xl text-gray-900 font-bold">24</span>
                                <span className="block text-gray-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full py-1 px-1">{<Users width={50} height={50} className="p-3 text-white" />}</span>
                        </DashboardCard>

                        {/* Verify Supplier */}
                        <DashboardCard>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-lg text-gray-800 font-bold">Verified Supplier</span>
                                <span className="block text-2xl text-gray-900 font-bold">24</span>
                                <span className="block text-gray-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full py-1 px-1">{<IdCard width={50} height={50} className="p-3 text-white" />}</span>
                        </DashboardCard>

                        {/* Active Events*/}
                        <DashboardCard>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-lg text-gray-800 font-bold">Active Events</span>
                                <span className="block text-2xl text-gray-900 font-bold">24</span>
                                <span className="block text-gray-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-green-500 to-green-600 rounded-full py-1 px-1">{<CalendarPlus width={50} height={50} className="p-3 text-white" />}</span>
                        </DashboardCard>

                        <DashboardCard>
                            <div className="flex flex-col space-y-1">
                                <span className="block text-lg text-gray-800 font-bold">Total Earnings</span>
                                <span className="block text-2xl text-gray-900 font-bold">24</span>
                                <span className="block text-gray-600 text-sm">from last month</span>
                            </div>
                            <span className="bg-gradient-to-r from-green-500 to-green-600 rounded-full py-1 px-1">{<CalendarPlus width={50} height={50} className="p-3 text-white" />}</span>
                        </DashboardCard>
                    </div>

                    <TabGroup className={'mt-8'}>
                        <TabList className="flex gap-4 mb-3">
                            <Tab
                                className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors"
                            >
                                Supplier
                            </Tab>

                            <Tab
                                className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors"
                            >
                                Planner
                            </Tab>

                            <Tab
                                className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors"
                            >
                                Reported
                            </Tab>

                        </TabList>
                        <TabPanels className={'rounded-xl border border-gray-300 bg-white shadow-xl'}>
                            <TabPanel className="p-5  px-7">
                                <div className="flex flex-col gap-3">
                                    {supplierVerification.map((verification, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between bg-yellow-100 shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                                <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                    <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                            Supplier name: {verification.supplier_name}
                                                        </span>

                                                        <span className="text-gray-500 text-xs sm:text-sm">
                                                            Requested: {verification.createdAt?.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <a href={`/review/${verification.id}`} className="px-6 py-1 bg-blue-600 rounded-lg text-white">Review</a>

                                            </div>
                                        </div>
                                    ))}

                                    {supplierVerification.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            No verification application found Supplier.
                                        </div>
                                    )}
                                </div>
                            </TabPanel>

                            {/* Planner panel */}
                            <TabPanel className="p-5  px-7">
                                <div className="flex flex-col gap-3">
                                    {eventVerification.map((verification, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between bg-yellow-100 shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                                <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                    <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                            Planner name: {verification.last_name + ", " + verification.first_name}
                                                        </span>

                                                        <span className="text-gray-500 text-xs sm:text-sm">
                                                            Requested: {verification.createdAt?.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <a href={`/review/${verification.id}`} className="px-6 py-1 bg-blue-600 rounded-lg text-white">Review</a>

                                            </div>
                                        </div>
                                    ))}

                                    {eventVerification.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            No verification application found Event.
                                        </div>
                                    )}
                                </div>
                            </TabPanel>

                            {/* reports panel */}
                            <TabPanel className="p-5  px-7">
                                <div className="flex flex-col gap-3">
                                    {eventVerification.map((verification, index) => (
                                        <div key={index}>
                                            <div className={`flex flex-col sm:flex-row gap- sm:gap-2 justify-between ${AppliedColor(verification.status)} shadow-gray-200 shadow-lg items-start sm:items-center p-3 sm:py-4 rounded-lg sm:px-5`}>
                                                <div className="flex items-start sm:items-center space-x-3 flex-1">
                                                    <Calendar size={20} className="sm:size-6 text-blue-600 bg-gray-200 rounded-full h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                                            Planner name: {verification.first_name}
                                                        </span>

                                                        <span className="text-gray-500 text-xs sm:text-sm">
                                                            Requested: {verification.createdAt?.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <a href={`/review/${verification.id}`} className="px-6 py-1 bg-blue-600 rounded-lg text-white">Review</a>

                                            </div>
                                        </div>
                                    ))}

                                    {eventVerification.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                            No verification application found.
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>

                    {/* admin tabs */}
                    {/* <div className="w-full border-1 mt-7 font-semibold border-black rounded-lg py-7 px-8">
                <span className="block text-2xl">Verify Supplier Accounts</span>
                <div className="flex flex-col mt-5 px-5 space-y-3">
                    {!isLoading && data.map((datas, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="text-white flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-100% via-blue-600 to-pink-600 h-10 w-10">
                                        <span className="text-xl">{datas.first_name ? datas.first_name.charAt(0).toUpperCase() : datas?.supplier_name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>{datas.first_name ? datas.first_name : datas?.supplier_name}</span>
                                        {datas.last_name && (
                                            <span>{datas.last_name}</span>
                                        )}
                                    </div>
                                </div>
                                <Link to={`/review/${datas.id}`} className="px-6 py-1 bg-blue-600 rounded-lg text-white">Review</Link>
                            </div>
                            {index !== data.length - 1 && (
                                <hr className="border-t mt-3 border-gray-800" />
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <span className="text-center">Loading..</span>
                    )}
                    <span className={` ${data.length > 0 || isLoading ? 'hidden' : 'block'} text-center text-gray-500`}>No Pending Request..</span>

                </div>
            </div> */}
                </>
            )}
        </>
    )
}