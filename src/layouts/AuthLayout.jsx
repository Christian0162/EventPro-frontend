import NavBar from "../components/NavBar"
import Loading from "../components/Loading"

export default function AuthLayout({ children, user, userData }) {

    if (!userData) {
       return <Loading />
    }

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-pink-50 via-white to-rose-50">
            <NavBar user={user} userData={userData} />
            <div className="p-10 px-[5rem]">
                {children}
            </div>
        </div>
    )
}