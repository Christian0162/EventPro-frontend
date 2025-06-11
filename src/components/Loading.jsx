import { SyncLoader } from "react-spinners"
import { Title } from "react-head"

export default function Loading() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center">
                <SyncLoader size={10} color="#1d5cc7" />
            </div>
        </>
    )
}