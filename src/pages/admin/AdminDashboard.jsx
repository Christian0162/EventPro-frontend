import { useState, useEffect } from "react"
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Title } from "react-head";
import DashboardCard from "../../components/DashboardCards";
import { Users, IdCard, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchingData = async () => {

            setIsLoading(true)
            const snapShotShop = await getDocs(collection(db, "Shops"))
            const allShop = snapShotShop.docs.map(data => ({ id: data.id, ...data.data() }))
            
            const snapShotVerification = await getDocs(collection(db, "ShopVerification"))
            const verification_data = snapShotVerification.docs.map(data => {
                const matchedUser = allShop.find(user => user.id === data.id)

                if (matchedUser?.isApproved === "pending") {
                    return {
                        id: data.id,
                        user: matchedUser,
                        ...data.data(),
                    }
                }
            }).filter(Boolean)

            setData(verification_data)
            setIsLoading(false)

        }
        fetchingData()
    }, [])


    const firstLetter = (name) => {
        if (name?.length > 3) {
            return name.slice(0, 1).toUpperCase()
        }
    }

    console.log(data)

    return (
        <>
            <Title>Admin - Dashboard</Title>
            <div className="flex justify-between items-center flex-col lg:flex-row md:flex-row">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-5">
                {/* Total Supplier*/}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Total Suppliers</span>
                        <span className="block text-2xl font-bold">50</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<Users width={50} height={50} />}</span>
                </DashboardCard>

                {/* Verify Supplier */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Revenue</span>
                        <span className="block text-2xl font-bold">5</span>
                        <span className="block text-blue-600">this week</span>
                    </div>
                    <span>{<IdCard width={50} height={50} />}</span>
                </DashboardCard>

                {/* Active Events*/}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Active Events</span>
                        <span className="block text-2xl font-bold">3</span>
                        <span className="block text-blue-600">this week</span>
                    </div>
                    <span>{<CalendarPlus width={50} height={50} />}</span>
                </DashboardCard>
            </div>

            {/* admin tabs */}
            <div className="w-full border-1 mt-7 font-semibold border-black rounded-lg py-7 px-8">
                <span className="block text-2xl">Verify Supplier Accounts</span>
                <div className="flex flex-col mt-5 px-5 space-y-3">
                    {!isLoading && data.map((datas, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center rounded-full bg-gray-300 h-10 w-10">
                                        <span className="text-xl">{firstLetter(datas?.supplier_name)}</span>
                                    </div>
                                    <span className="block">{datas?.supplier_name}</span>
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
            </div>
        </>
    )
}