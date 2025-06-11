import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { auth } from "../firebase/firebase";
import Swal from "sweetalert2";

export default function UserDropdown() {

    const { logout } = useAuth()

    const handleLogout = async () => {

        logout(auth)
        Swal.fire({
            icon: 'success',
            title: 'Sign out',
            text: 'Successfully logout',
            timer: 1000,
            showConfirmButton: false

        })

    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center hover:ring-2 ring-blue-400 transition">
                <User size={20} strokeWidth={1.5} />
            </MenuButton>

            <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                <div className="p-1">
                    <MenuItem>
                        <Link
                            to="/profile"
                            className="transition-all duration-75 block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100"
                        >
                            Profile
                        </Link>
                    </MenuItem>
                    <MenuItem>
                        <Link
                            to="/settings"
                            className="transition-all duration-75 block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100"

                        >
                            Settings
                        </Link>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => handleLogout()}
                            className="transition-all duration-75 w-full text-left px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-100"
                        >
                            Sign Out
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
}
