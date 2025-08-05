import { Link, NavLink } from "react-router-dom";
import { Heart, MessageCircleMore, BellDot, Calendar, X, Check, Trash2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, updateDoc, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { Popover } from '@headlessui/react'
import UserDropdown from './UserDropdown'
import DropDown from './DropDown'
import { auth, db } from "../firebase/firebase";

export default function NavBar({ user, userData }) {

    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            if (!userData) {
                return
            }

            const q = query(collection(db, "notifications"),
                where("user_id", "==", auth.currentUser?.uid)
            )

            const unsubscribe = onSnapshot(q, (onsnapshot) => {
                const notifications = onsnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setNotifications(notifications)

            })


        }
        fetchData()
    }, [])

    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAsRead = async (id) => {
        await updateDoc(doc(db, "notifications", id), {
            unread: false
        })
    };

    const markAllAsRead = async () => {
        const q = query(collection(db, "notifications"),
            where('user_id', '==', userData.id),
            where('unread', '==', true)
        )

        const onSnapShotNotif = await getDocs(q)
        const notificaions = onSnapShotNotif.docs.map((notficDoc) => updateDoc(doc(db, "notifications", notficDoc.id), {
            unread: false,
        }))

        await Promise.all(notificaions)
    }

    const deleteNotification = (id, e) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };



    return (
        <>
            <nav className="sticky top-0 left-0 w-full z-999 font-sans font-bold bg-white ">
                <div className="flex justify-between px-[3rem] items-center py-4 shadow-lg">
                    <div className="flex items-center justify-center space-x-5">
                        <div className="text-3xl ">
                            <NavLink
                                to={user ? '/dashboard' : '/'}
                                className={'text-2xl flex items-center group hover:scale-105 transition-transform duration-200'}
                            >
                                <Calendar className="w-6 h-6 mr-1 text-blue-600 group-hover:-rotate-12 transition-transform duration-200" />
                                <span className="texy-gray-800">
                                    Event
                                </span>
                                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    Pro
                                </span>
                            </NavLink>
                        </div>
                        <div className={`hidden ${user ? ' md:block' : 'hidden'}`}>
                            <div className="flex gap-3 text-md">
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/suppliers"
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    Suppliers
                                </NavLink>
                                <NavLink
                                    to="/events"
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    Events
                                </NavLink>

                                {userData?.role === 'Event Planner' && (
                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            }`
                                        }
                                    >
                                        Profile
                                    </NavLink>
                                )}

                                {userData?.role === "Supplier" && (
                                    <NavLink
                                        to="/shop"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            }`
                                        }
                                    >
                                        Shop
                                    </NavLink>
                                )}
                            </div>
                        </div>
                    </div>
                    {user
                        ?
                        <div className="hidden sm:flex gap-2 items-center">
                            <NavLink to="/favorites" className={({ isActive }) =>
                                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`
                            }><Heart size={20} /></NavLink>

                            <NavLink to="/chats" className={({ isActive }) =>
                                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`
                            }><MessageCircleMore size={20} /></NavLink>


                            {/* Notification button - dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="relative transition-all duration-200 focus:outline-none focus:bg-blue-50 focus:text-blue-700 focus:shadow-sm focus:ring-2 focus:ring-blue-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full text-sm flex items-center justify-center group"
                                >
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    )}
                                    <BellDot size={20} />
                                </button>

                                {isOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsOpen(false)}
                                        />

                                        {/* Popover Panel */}
                                        <div className="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                                            {unreadCount} new
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {notifications.length > 0 && (
                                                        <>
                                                            <button
                                                                onClick={() => markAllAsRead()}
                                                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors duration-150"
                                                                title="Mark all as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                onClick={clearAll}
                                                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md transition-colors duration-150"
                                                                title="Clear all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors duration-150"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Notifications List */}
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <BellDot size={48} className="mx-auto text-gray-300 mb-3" />
                                                        <p className="text-sm text-gray-500 font-medium">No notifications</p>
                                                        <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                                                    </div>
                                                ) : (
                                                    <div className="py-2">
                                                        {notifications.map((notification, index) => (
                                                            <div
                                                                key={notification.id}
                                                                onClick={() => markAsRead(notification.id)}
                                                                className={`relative cursor-pointer hover:bg-gray-50 px-4 py-3 transition-colors duration-150 border-l-4 ${notification.unread
                                                                    ? 'border-transparent bg-white'
                                                                    : 'border-blue-500 bg-blue-50/30'
                                                                    } ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-1">
                                                                        {notification.unread && (
                                                                            <div className={`w-3 h-3 rounded-full flex-shrink-0" bg-blue-500`}></div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 group">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <h4 className={`text-sm font-medium ${notification.unread ? 'text-gray-700' : 'text-gray-900'
                                                                                } truncate`}>
                                                                                {notification.title}
                                                                            </h4>
                                                                            <button
                                                                                onClick={(e) => deleteNotification(notification.id, e)}
                                                                                className="opacity-0 group-hover:opacity-100 text-black hover:text-red-500 transition-all duration-150 p-1 hover:bg-red-50 rounded"
                                                                                title="Delete notification"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </div>
                                                                        <p className={`text-sm mt-1 ${notification.unread ? 'text-gray-500' : 'text-gray-700'
                                                                            } line-clamp-2`}>
                                                                            {notification.message}
                                                                        </p>
                                                                        <div className="flex items-center justify-between mt-2">
                                                                            <span className="text-xs text-gray-400">
                                                                                {notification.timestamp.toDate().toLocaleTimeString([] , {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                            {!notification.unread && (
                                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            {notifications.length > 0 && (
                                                <div className="border-t border-gray-100 p-3">
                                                    <Link to={'/notification'} className="w-full text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 px-3 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2">
                                                        <Settings size={14} />
                                                        View All Notifications
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>



                            <div className="flex items-center gap-5 ml-3">
                                <div className="border-l h-6 border-gray-700 "></div>
                                <UserDropdown userData={userData} />
                            </div>
                        </div>


                        :
                        <div className="space-x-8 text-sm hidden sm:block">
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`
                                }
                            >
                                Login
                            </NavLink>

                            <NavLink
                                to="/Register"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`
                                }
                            >
                                Register
                            </NavLink>
                        </div>
                    }

                    <DropDown user={user} />
                </div>
            </nav>
        </>
    );
}