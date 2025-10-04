import { db } from "../../firebase/firebase";
import { getDoc, doc, updateDoc, collection, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react"
import { IdCard } from "lucide-react";
import AddressAutocomplete from "../../components/AddressAutoComplete";
import Select from 'react-select'
import { FileText } from "lucide-react";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";
import { RejectReview } from "../../components/ReviewModal";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function Review({ userData }) {

    const [isLoading, setIsLoading] = useState(false);
    const [reviewData, setReviewData] = useState(null)
    const [user, setUser] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSumitted, setIsSubmitted] = useState(false)

    const { id } = useParams();

    console.log(reviewData)


    useEffect(() => {
        const fetchReviewData = async () => {

            setIsLoading(true)
            const onSnapShotVerification = await getDoc(doc(db, 'verification', id))

            const onSnapShotUser = await getDoc(doc(db, "users", id))

            setUser(onSnapShotUser.data())
            setReviewData(onSnapShotVerification.data())
            setIsLoading(false)

        }

        fetchReviewData()

    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await Swal.fire({
            title: 'Confirm Request',
            text: 'This action will confirm the request and notify the user.',
            icon: 'question',
            confirmButtonText: 'Approve',
            showCancelButton: true,
            showCloseButton: true,
        })

        try {
            if (result.isConfirmed) {

                setIsSubmitting(true)

                if (user.role === "Event Planner") {

                    await updateDoc(doc(db, "users", id), {
                        verification_status: 'verified'
                    })

                    await updateDoc(doc(db, 'verification', id), {
                        is_verified: true
                    })

                    await addDoc(collection(db, "notifications"), {
                        user_id: id,
                        avatar: 'A',
                        title: 'Verification Approved!',
                        message: "Congratulations! Your account is now verified. You can now post events and showcase your plans to suppliers!",
                        createdAt: serverTimestamp(),
                        unread: true
                    });

                }

                else {
                    await updateDoc(doc(db, "users", id), {
                        verification_status: 'verified'
                    })

                    await updateDoc(doc(db, 'shops', id), {
                        is_verified: true
                    })

                    await updateDoc(doc(db, 'verification', id), {
                        is_verified: true
                    })

                    await addDoc(collection(db, "notifications"), {
                        user_id: id,
                        avatar: 'A',
                        title: 'Your Verification Has Been approved!',
                        message: "You're verified! Your business is now publicly visible to planners in the Suppliers directory!",
                        createdAt: serverTimestamp(),
                        unread: true
                    })

                }

                await Swal.fire({
                    title: 'Success',
                    text: 'The request has been confirmed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                setIsSubmitting(false)
                setIsSubmitted(true)
            }
        }
        catch (e) {
            console.log(e)
            await Swal.fire('Error', 'Something went wrong!', 'error');
            setIsSubmitting(false)
            setIsSubmitted(false);
        }

        finally {
            setIsSubmitting(false)
            setIsSubmitted(true)
        }
    }


    if (isSumitted || reviewData?.is_verified) {
        return <Navigate to={'/dashboard'} />
    }


    console.log(isSumitted)
    return (
        <>
            {isLoading && (
                <Loading />
            )}

            {isSubmitting && (
                <LoadingOverlay isLoading={isSubmitting} message="Proccesing.." />
            )}

            {!isLoading && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <IdCard size={40} strokeWidth={1.5} className="text-blue-600" />
                            <span className="text-2xl font-bold">
                                {user.role === "Event Planner"
                                    ? "Planner Verification Request"
                                    : "Supplier Verification Request"}
                            </span>
                        </div>
                        <span
                            className={`px-3 py-1 text-sm rounded-full ${user.role === "Supplier"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                                }`}
                        >
                            {user.role}
                        </span>
                    </div>

                    <p className="text-gray-500 mb-10">
                        Review the details below before approving or rejecting the verification
                        request.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.role === "Supplier" ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Business Name</label>
                                    <input
                                        disabled
                                        value={reviewData?.supplier_name || ""}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name</label>
                                        <input
                                            disabled
                                            value={user?.first_name || ""}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name</label>
                                        <input
                                            disabled
                                            value={user?.last_name || ""}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <input
                                            disabled
                                            value={user?.email_address || ""}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <AddressAutocomplete
                                    disabled
                                    default_location={
                                        reviewData?.supplier_location || reviewData?.location || ""
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Contact Number</label>
                                <input
                                    disabled
                                    value={reviewData?.supplier_number || reviewData?.contact_number || ""}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700"
                                />
                            </div>

                            {user.role === "Supplier" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Supplier Type</label>
                                    <Select value={reviewData?.supplier_type} isDisabled isClearable />
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Additional Information
                            </label>
                            <textarea
                                disabled
                                value={
                                    reviewData?.additional_information ||
                                    "No additional information provided."
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 h-28 bg-gray-100 text-gray-700"
                            />
                        </div>

                        {/* ID Upload */}
                        <div className="pt-6 border-t">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="text-blue-600" size={20} />
                                <span className="font-semibold">Uploaded Valid IDs</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reviewData?.valid_id?.length ? (
                                    reviewData.valid_id.map((id, idx) => (
                                        <img
                                            key={idx}
                                            src={id}
                                            alt={`ID ${idx + 1}`}
                                            className="rounded-lg border shadow-sm object-contain h-64 w-full"
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm col-span-2">
                                        No IDs uploaded by the user.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Documents Upload */}
                        <div className="pt-6 border-t">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="text-blue-600" size={20} />
                                <span className="font-semibold">Uploaded Documents</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {reviewData?.documents_information ? (
                                    <img
                                        src={reviewData?.documents_information}
                                        alt="Business Document"
                                        className="rounded-lg border shadow-sm object-contain h-64 w-full"
                                    />
                                ) : (
                                    <p className="text-gray-400 text-sm col-span-2">
                                        No documents uploaded by the user.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 pt-6">
                            <RejectReview
                                className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                userData={userData}
                                id={id}
                            />
                            <button
                                disabled={isLoading}
                                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition font-semibold ${isLoading
                                    ? "bg-blue-300 cursor-not-allowed text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                            >
                                {isLoading ? "Processing..." : "Approve"}
                            </button>
                        </div>
                    </form>
                </div>
            )}


        </>
    )
}