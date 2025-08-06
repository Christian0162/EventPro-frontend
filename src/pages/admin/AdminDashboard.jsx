import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Title } from "react-head";
import DashboardCard from "../../components/DashboardCards";
import { Users, IdCard, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Tab, TabList, TabPanels, TabPanel, TabGroup } from "@headlessui/react";

export default function AdminDashboard() {

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([])

    useEffect(() => {
        setIsLoading(true)
        const unsubscribe = onSnapshot(collection(db, "verification"), (onsnapshot) => {
            const verified = onsnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const filteredVerified = verified.filter(verifed => verifed.status === 'pending')

            setData(filteredVerified)
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    console.log(data)

    return (
        <>
            <Title>Admin - Dashboard</Title>
            <div className="flex justify-between items-center flex-col lg:flex-row md:flex-row">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {/* Total Supplier*/}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg text-gray-800 font-bold">Revenue</span>
                        <span className="block text-2xl text-gray-900 font-bold">24</span>
                        <span className="block text-gray-600 text-sm">from last month</span>
                    </div>
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full py-1 px-1">{<Users width={50} height={50} className="p-3 text-white" />}</span>
                </DashboardCard>

                {/* Verify Supplier */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg text-gray-800 font-bold">Revenue</span>
                        <span className="block text-2xl text-gray-900 font-bold">24</span>
                        <span className="block text-gray-600 text-sm">from last month</span>
                    </div>
                    <span className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full py-1 px-1">{<IdCard width={50} height={50} className="p-3 text-white" />}</span>
                </DashboardCard>

                {/* Active Events*/}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg text-gray-800 font-bold">Revenue</span>
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
                                    
                                </tbody>
                            </table>
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
    )
}