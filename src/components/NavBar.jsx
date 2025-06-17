import { Link } from "react-router-dom";
import { Heart, MessageCircleMore, BellDot } from "lucide-react";
import { lazy, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const UserDropdown = lazy(() => import("./UserDropdown"))
const DropDown = lazy(() => import("./DropDown"))

export default function NavBar({ user, userData }) {

    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const q = await query(collection(db, "Notifications"),
                where("user_id", "==", auth.currentUser.uid)
            )

            const notifOnSnapShot = await getDocs(q)
            const notifications = notifOnSnapShot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

            setNotifications(notifications)

        }
        fetchData()
    }, [])


    return (
        <>
            <nav className="font-sans font-bold">
                <div className="flex justify-between px-[3rem] items-center py-4 shadow-lg">
                    <div className="flex items-center justify-center space-x-5">
                        <div className="text-3xl">
                            <Link to={user ? '/dashboard' : '/'} className="text-3xl font-bold">
                                <span>Event</span>
                                <span className="text-blue-700">Pro</span>
                            </Link>
                        </div>
                        <div className={`hidden ${user ? ' md:block' : 'hidden'}`}>
                            <div className="flex space-x-3 text-md">
                                <Link to={'/dashboard'} className="text-gray-700 hover:text-black">Dashboard</Link>
                                <Link to={'/suppliers'} className="text-gray-700 hover:text-black">Suppliers</Link>
                                <Link to={'/events'} className="text-gray-700 hover:text-black">Events</Link>
                                {
                                    userData?.role == "Supplier" ?
                                        <Link to={'/shop'} className="text-gray-700 hover:text-black">Shop</Link>
                                        :
                                        ""
                                }
                            </div>
                        </div>
                    </div>
                    {user
                        ?
                        <div className="hidden sm:flex space-x-6 items-center">
                            <Link to="/favorites" className="hover:text-blue-600"><Heart size={20} /></Link>
                            <Link to="/chats" className="hover:text-blue-600"><MessageCircleMore size={20} /></Link>
                            <Link to="/notification" className="hover:text-blue-600">
                                <div className="relative">
                                    {notifications.length > 0 && (
                                        <div className="h-[0.35rem] w-[0.35rem] left-[0.80rem] bottom-[0.71rem] rounded-full bg-red-500 absolute animate-pulse"></div>
                                    )}
                                    <BellDot size={20} />
                                </div></Link>
                            <UserDropdown />
                        </div>

                        :
                        <div className="space-x-8 text-sm hidden sm:block">
                            <Link to={'/login'}>LOGIN</Link>
                            <Link to={'/register'}>REGISTER</Link>
                        </div>
                    }

                    <DropDown user={user} />
                </div>
            </nav>
        </>
    );
}