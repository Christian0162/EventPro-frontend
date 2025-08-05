import { NavLink } from "react-router-dom";
import { Heart, MessageCircleMore, Calendar } from "lucide-react";
import UserDropDown from "./UserDropdown";
import UserNotifications from "./UserNotification";

export default function NavBar({ user, userData }) {

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


                            <UserNotifications />


                            <div className="flex items-center gap-5 ml-3">
                                <div className="border-l h-6 border-gray-700 "></div>
                                <UserDropDown userData={userData} />
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

                </div>
            </nav>
        </>
    );
}