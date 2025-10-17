import { NavLink } from "react-router-dom";
import { Heart, MessageCircleMore, Calendar, Menu, X } from "lucide-react";
import UserDropDown from "./UserDropdown";
import UserNotification from "./userNotification";
import React, { useState } from "react";

const NavBar = React.memo(function NavBar({ user, userData }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMenuOpen(false);

    const mainLinks = ["dashboard", "suppliers", "events", ...(userData?.role === "Supplier" ? ["shop"] : []), "profile"];
    const guestLinks = ["login", "register"];

    return (
        <nav className="sticky top-0 left-0 w-full z-[999] font-sans font-bold bg-white shadow-lg">
            <div className="flex justify-between items-center px-6 md:px-[3rem] py-4">
                {/* Logo */}
                <NavLink
                    to={user ? '/dashboard' : '/'}
                    className="text-2xl flex items-center group hover:scale-105 transition-transform duration-200"
                >
                    <Calendar className="w-6 h-6 mr-1 text-blue-600 group-hover:-rotate-12 transition-transform duration-200" />
                    <span className="text-gray-800">Event</span>
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        Pro
                    </span>
                </NavLink>

                {/* Desktop Menu */}
                {user && (
                    <div className="hidden md:flex gap-3 text-md">
                        {mainLinks.map((path) => (
                            <NavLink
                                key={path}
                                to={`/${path}`}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`
                                }
                            >
                                {path.charAt(0).toUpperCase() + path.slice(1)}
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* Right Side */}
                <div className="hidden sm:flex gap-2 items-center">
                    {user ? (
                        <>
                            <NavLink to="/favorites" className={({ isActive }) =>
                                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`
                            }>
                                <Heart size={20} />
                            </NavLink>

                            <NavLink to="/chats" className={({ isActive }) =>
                                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`
                            }>
                                <MessageCircleMore size={20} />
                            </NavLink>

                            <UserNotifications userData={userData} />

                            <div className="flex items-center gap-5 ml-3">
                                <div className="border-l h-6 border-gray-700"></div>
                                <UserDropDown userData={userData} />
                            </div>
                        </>
                    ) : (
                        <div className="hidden sm:flex space-x-5">
                            {guestLinks.map((path) => (
                                <NavLink
                                    key={path}
                                    to={`/${path}`}
                                    onClick={closeMenu}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    {path.charAt(0).toUpperCase() + path.slice(1)}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
                    <div className="flex flex-col items-start px-6 py-4 space-y-3">
                        {(user ? mainLinks : guestLinks).map((path) => (
                            <NavLink
                                key={path}
                                to={`/${path}`}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                {path.charAt(0).toUpperCase() + path.slice(1)}
                            </NavLink>
                        ))}

                        {user && (
                            <div className="flex gap-4 pt-3 border-t border-gray-100 w-full">
                                <Heart size={20} className="text-gray-600" />
                                <MessageCircleMore size={20} className="text-gray-600" />
                                <UserNotification userData={userData} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
});

export default NavBar;
