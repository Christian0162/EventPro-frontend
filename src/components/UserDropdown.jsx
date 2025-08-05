import { useState } from "react"
import { useAuthLogout } from "../hooks/useAuth"
import { auth } from "../firebase/firebase"
import { useNavigate } from "react-router-dom"

export default function UserDropDown({ userData }) {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    const { logout } = useAuthLogout()

    const handleLogout = async () => {
        await logout(auth)
        setIsOpen(false)
    }



    return (
        <>
            <div className="relative">

                <button className="bg-gradient-to-r from-blue-600 to-violet-600 w-8 h-8 rounded-full text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {userData?.first_name.charAt(0).toUpperCase()}
                </button>

                {isOpen && (
                    <>
                        <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40"></div>

                        <div className="absolute z-50 mt-2 right-0 w-48 rounded-lg p-1 text-sm bg-white border border-gray-100 shadow-lg">
                            <div className="py-1 flex flex-col text-left">
                                <button onClick={() => {navigate('/profile', { replace: true }); setIsOpen(false)}} className="transition-all duration-50 w-full p-2 text-left rounded text-gray-600 hover:text-black hover:bg-gray-100">Profile</button>
                                <button className="transition-all duration-50 w-full p-2 text-left rounded text-gray-600 hover:text-black hover:bg-gray-100">Settings</button>
                                <button onClick={() => handleLogout()} className="transition-all duration-50 w-full p-2 text-left rounded text-gray-600 hover:text-black hover:bg-gray-100">Logout</button>
                            </div>
                        </div>
                    </>


                )}
            </div>

        </>
    )
}