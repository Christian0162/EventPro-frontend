export default function DashboardCard({ children }) {
    return (
        <div className="w-full h-full border-1 border-b-black rounded-md flex items-center justify-between p-10 px-[6rem]">
            {children}
        </div>
    )
}