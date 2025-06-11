import { db } from "../../firebase/firebase";
import { getDoc, doc, updateDoc, collection, addDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react"
import { IdCard } from "lucide-react";
import AddressAutocomplete from "../../components/AddressAutoComplete";
import Select from 'react-select'
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

export default function Review() {

    const [isLoading, setIsLoading] = useState(false);
    const [reviewData, setReviewData] = useState(null)
    const [submitLoading, setSubmitLoading] = useState(false)

    const { id } = useParams();

    console.log(reviewData)


    useEffect(() => {
        const fetchReviewData = async () => {

            setIsLoading(true)
            const snapData = await getDoc(doc(db, 'ShopVerification', id))
            const data = snapData.data()
            setReviewData(data)
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
            showDenyButton: true,
            showCloseButton: true,
            denyButtonText: "Reject",
            reverseButtons: false
        })

        try {
            if (result.isConfirmed) {

                setIsLoading(true)

                await updateDoc(doc(db, 'Shops', id), {
                    isApproved: "verified"
                })

                await updateDoc(doc(db, 'ShopVerification', id), {
                    isApproved: "verified"
                })

                await addDoc(collection(db, "Notifications"), {
                    user_id: id,
                    avatar: 'A',
                    title: 'Your Verification Has Been approved!',
                    message: "You're verified! Your business is now publicly visible to planners in the Suppliers directory!",
                    timestamp: Timestamp.now(),
                    unread: true
                })

                await Swal.fire({
                    title: 'Success',
                    text: 'The request has been confirmed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                setIsLoading(false)
                setSubmitLoading(true)
            }
            else if (result.isDenied) {
                setIsLoading(true)
                await updateDoc(doc(db, 'Shops', id), {
                    isApproved: "unverified"
                })

                await deleteDoc(doc(db, 'ShopVerification', id))

                await addDoc(collection(db, "Notifications"), {
                    user_id: id,
                    avatar: 'A',
                    title: 'Your Verification Has Been Denied',
                    message: "Unfortunately, your verification request was not approved. Please review your submission and try again.",
                    timestamp: Timestamp.now(),
                    unread: true
                })
                console.log('test')

                await Swal.fire({
                    title: 'Success',
                    text: 'The request has been denied.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                setIsLoading(false)
                setSubmitLoading(true)
            }
        }
        catch (e) {
            console.log(e)
            await Swal.fire('Error', 'Something went wrong!', 'error');
            setSubmitLoading(false);
        }
    }


    if (submitLoading) {
        return <Navigate to={'/dashboard'} />
    }

    console.log(submitLoading)
    return (
        <>
            {isLoading && (
                <Loading />
            )}

            <div className="flex items-center space-x-5">
                <span className="text-3xl font-semibold">Supplier Verification</span>
                <IdCard size={50} strokeWidth={1} />
            </div>
            <span className="block text-gray-600">Submit your business information for verification to get verified</span>
            <form onSubmit={handleSubmit} className="mt-8">
                {/* business name */}
                <div className="flex flex-col">
                    <label htmlFor="business_name">Business Name</label>
                    <input disabled value={reviewData?.supplier_name} type="text" name="business_name" placeholder="Floral Design" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                </div>

                {/* address */}
                <div className="flex flex-col mt-5">
                    <label htmlFor="address">Address</label>
                    <AddressAutocomplete disabled={true} default_location={reviewData?.supplier_location} className={'mt-2 rounded-md py-1'} />
                </div>

                {/* contact number */}
                <div className="flex flex-col mt-5">
                    <label htmlFor="contact_number">Contact</label>
                    <input disabled value={reviewData?.supplier_number} type="tel" name="contact_number" maxLength={11} placeholder="09XXXX" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                </div>

                {/* supplier type */}
                <div className="flex flex-col mt-5">
                    <label htmlFor="supplier_type" className="mb-2">Supplier Type</label>
                    <Select
                        value={reviewData?.supplier_type}
                        isDisabled
                        isClearable
                    />
                </div>

                {/* additional information */}
                <div className="flex flex-col w-full mt-5">
                    <label htmlFor="addtional_information">Additional Information (Optional)</label>
                    <textarea disabled value={reviewData?.additional_information} name="addtional_information" id="addtional_information" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-38 py-2 ring-black"
                        required
                    ></textarea>
                </div>

                <div className="flex flex-col mt-5">
                    <div className="flex space-x-1 mb-2">
                        <FileText size={21} />
                        <span className="block font-semibold">Document Upload</span>
                    </div>
                    <span className="block text-gray-600 mb-2">Upload documents to verify your business credentials</span>
                    <div className="h-[300px] w-full flex items-center justify-center gap-3">
                        <img src={reviewData?.id_picture[0]} alt="" className="object-contain w-1/2 h-full" />
                        <img src={reviewData?.id_picture[1]} alt="" className="object-contain w-1/2 h-full" />
                    </div>
                </div>

                {/* cancel/submit */}
                <div className="flex space-x-3 justify-center text-white mt-15">
                    <Link to={'/dashboard'} className="transition-all duration-75 bg-blue-600 px-7 py-2 rounded-xl hover:bg-blue-700">Cancel</Link>
                    <button disabled={isLoading} className={`${isLoading ? 'bg-blue-300' : 'bg-blue-600'} transition-all duration-75  hover:bg-blue-700 px-7 py-2 rounded-xl flex space-x-3`}>
                        <IdCard strokeWidth={2} />
                        <span>{isLoading ? 'Submitting..' : 'Submit'}</span>
                    </button>
                </div>

            </form>
        </>
    )
}