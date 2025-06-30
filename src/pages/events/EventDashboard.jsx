import DashboardCard from "../../components/DashboardCards"
import { Link } from "react-router-dom"
import { CalendarDays, Star, PhilippinePeso, Users, ShieldCheck, } from "lucide-react"
import { TabGroup, TabPanel, TabPanels, TabList, Tab } from "@headlessui/react"

import { PieChart, BarChart } from "../../components/Charts"
import { Title } from "react-head"
import { useState } from "react"

export default function EventDashboard({ userData }) {
    console.log('test')
    const [isHovered, setIsHovered] = useState(false)

    return (
        <>
            <Title>Dashboard</Title>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Event Dashboard
                    </h1>
                    <span className="text-sm text-gray-600">
                        Manage your Events
                    </span>
                </div>

                {userData.role !== 'Supplier' && userData.status === 'unverified' && (
                    <Link to={'/verify'} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                        Verify Account
                    </Link>
                )}

                {userData?.status === 'pending' && (
                    <span className="px-4 py-2 border-2 border-yellow-400 text-yellow-400 text-sm font-medium rounded-lg">
                        Pending
                    </span>
                )}

                {userData?.status === 'verified' && (
                    <span className="px-4 py-2 border-2 flex items-center gap-2 border-green-400 text-green-400 text-sm font-medium rounded-lg">
                        Verified <ShieldCheck />
                    </span>
                )}
            </div>



            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Bar Chart - Supplier Category Comparison */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Supplier Category Comparison
                            </h3>
                            <p className="text-sm text-gray-500">Average rating over time</p>

                            {/* Legend */}
                            <div className="flex items-center space-x-6 mt-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Catering</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Venue</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Photography</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">This Month</div>
                            <div className="text-2xl font-bold text-gray-800">4.8</div>
                            <div className="text-sm text-green-600">+0.2 from last month</div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <BarChart />
                    </div>
                </div>

                {/* Pie Chart - Supplier Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Supplier Distribution
                        </h3>
                        <p className="text-sm text-gray-500">Number of suppliers by category</p>
                    </div>

                    <div className="mb-6">
                        <PieChart />
                    </div>

                    {/* Distribution Stats */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Catering</span>
                            </div>
                            <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Venue</span>
                            </div>
                            <span className="text-sm font-medium">30%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Photography</span>
                            </div>
                            <span className="text-sm font-medium">15%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Others</span>
                            </div>
                            <span className="text-sm font-medium">10%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Modern Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

                {/* total suppliers */}
                <DashboardCard className={'py-10'}>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Total Supplier</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full py-1 px-1">{<Users width={50} height={50} className="p-3 text-white" />}</span>
                </DashboardCard>

                {/* upcoming events */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Upcoming Events</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full py-1 px-1">{<CalendarDays width={50} height={50} className="p-3 text-white" />}</span>
                </DashboardCard>

                {/* rated suppliers */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Rated Suppliers</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full py-1 px-1">{<Star width={50} height={50} className="p-3 text-white" />}</span>
                </DashboardCard>

                {/* budget spent */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Budget Spent</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span className="bg-gradient-to-r from-green-500 to-green-600 rounded-full py-1 px-1">{<PhilippinePeso width={50} height={50} className="p-3 text-white" />}</span>
                </DashboardCard>
            </div>

            <TabGroup className={'mt-8'}>
                <TabList className="flex gap-4 mb-3">
                    <Tab
                        className="rounded-full px-5 py-3 text-sm font-semibold text-gray-700 focus:outline-none data-selected:bg-white shadow-xl data-selected:text-gray-800 data-hover:bg-gray-100 transition-colors"
                    >
                        Applied Supplier
                    </Tab>

                </TabList>
                <TabPanels className={'rounded-xl border border-gray-300 bg-white shadow-xl'}>
                    <TabPanel className="p-5  px-7">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded overflow-hidden">
                                <thead className="border-b border-gray-400">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">User</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-5 px-4 text-gray-700">John Doe</td>
                                        <td className="py-5 px-4 text-gray-700">john@example.com</td>
                                        <td className="py-5 px-4 text-gray-700 flex gap-1">
                                            <button className="transition-all duration-200 bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-full text-white text-sm">View</button>
                                            <button className="transition-all duration-200 bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-white text-sm">Cancel</button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-5 px-4 text-gray-700">John Doe</td>
                                        <td className="py-5 px-4 text-gray-700">john@example.com</td>
                                        <td className="py-5 px-4 text-gray-700 flex gap-1">
                                            <button className="transition-all duration-200 bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-full text-white text-sm">View</button>
                                            <button className="transition-all duration-200 bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-white text-sm">Cancel</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </>
    )
}