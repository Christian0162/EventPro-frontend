import DashboardCard from "../../components/DashboardCards"
import { Link } from "react-router-dom"
import { CalendarDays, Star, DollarSignIcon, Users } from "lucide-react"
import { Title } from "react-head"

export default function EventDashboard({ userData }) {

    console.log('test')
    return (
        <>
            <Title>Dashboard</Title>
            <div className="flex justify-between items-center flex-col lg:flex-row md:flex-row">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
                    <span className={`mt-2 text-gray-600`}>Welcome back, {userData?.first_name}</span>
                </div>
                <Link to={'/events/create'} className={`${userData.role == 'admin' ? 'hidden' : 'block'} bg-blue-600 text-white rounded-md px-5 lg:px-10 md:px-8 sm:px-7 py-2 lg:py-3 font-bold mt-3`}>Create New Event</Link>
            </div>

            {/* supplier and event planner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-5">

                {/* total suppliers */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Total Supplier</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<Users width={50} height={50} />}</span>
                </DashboardCard>

                {/* upcoming events */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Upcoming Events</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<CalendarDays width={50} height={50} />}</span>
                </DashboardCard>

                {/* rated suppliers */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Rated Suppliers</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<Star width={50} height={50} />}</span>
                </DashboardCard>

                {/* budget spent */}
                <DashboardCard>
                    <div className="flex flex-col space-y-1">
                        <span className="block text-lg">Budget Spent</span>
                        <span className="block text-2xl font-bold">24</span>
                        <span className="block text-blue-600">from last month</span>
                    </div>
                    <span>{<DollarSignIcon width={50} height={50} />}</span>
                </DashboardCard>
            </div>
        </>
    )
}