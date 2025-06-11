import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import { AlignJustify } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Link } from "react-router-dom";

export default function DropDown({ user }) {

    const handleSignOut = async () => {
        await signOut(auth)
    }

    return (
        <div className="block sm:hidden">
            <Menu as="div" className="relative">
                <MenuButton>
                    <div className="transition-all text-black hover:text-gray-500 duration-75 ">
                        <AlignJustify size={24} strokeWidth={2} color="currentColor" />
                    </div>
                </MenuButton>

                <MenuItems className="absolute right-0 origin-bottom-left mt-2 w-50 text-sm border border-gray-200 bg-white focus:outline-none shadow-lg rounded z-50">
                    <div className="p-1">
                        {!user && (
                            <div>
                                <MenuItem>
                                    <Link to={'/login'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Login</Link>
                                </MenuItem>

                                <MenuItem>
                                    <Link to={'/register'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Register</Link>
                                </MenuItem>
                            </div>
                        )}

                        {user && (
                            <div>
                                <MenuItem>
                                    <Link to={'/dashboard'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Dashboard</Link>
                                </MenuItem>

                                <MenuItem>
                                    <Link to={'/suppliers'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Supplier</Link>
                                </MenuItem>

                                <MenuItem>
                                    <Link to={'/events'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Events</Link>
                                </MenuItem>

                                <MenuItem>
                                    <Link to={'/dashboard'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Profile</Link>
                                </MenuItem>

                                <MenuItem>
                                    <Link to={'/dashboard'} className="px-4 block py-2 w-full text-left rounded-md hover:bg-gray-100 duration-75">Settings</Link>
                                </MenuItem>

                                <MenuItem>
                                    <button onClick={() => handleSignOut()} className="px-4 block py-2 w-full text-left rounded-md text-red-600 hover:bg-red-200 duration-75">Sign out</button>
                                </MenuItem>
                            </div>
                        )}
                    </div>
                </MenuItems>
            </Menu>
        </div>
    );
}