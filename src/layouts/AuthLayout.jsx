import NavBar from "../components/NavBar"
import Loading from "../components/Loading"

export default function AuthLayout({ children, user, userData }) {

    if (!userData) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-blue-50">
            <NavBar user={user} userData={userData} />
            <div className="p-10 px-[5rem]">
                {!userData ? (
                    <Loading />
                ) : (
                    children
                )}
            </div>
        </div>
    )
}