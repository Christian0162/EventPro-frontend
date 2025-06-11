import { IdCard } from "lucide-react";
import Select from "react-select"
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AddressAutocomplete from "../../components/AddressAutoComplete";
import { FileText } from "lucide-react";
import VerificationCheckbox from "../../components/VerificationCheckBox";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import UploadWidget from "../../components/UploadWidgen";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

export default function SupplierVerification({ userData }) {

    const [shop, setShop] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [supplierType, setSupplierType] = useState(null)
    const [location, setLocation] = useState(null)
    const [supplier_id, setSupplier_Id] = useState(null)
    const [business_name, setBusiness_name] = useState('')
    const [contact_number, setContact_number] = useState()
    const [additional_information, setAdditional_information] = useState('')
    const [id_picture, setId_picture] = useState([]);
    const [agree, setAgree] = useState(false)
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapShotShop = await getDoc(doc(db, "Shops", auth.currentUser.uid));
                const data = snapShotShop.data()

                setShop(data)
                setBusiness_name(data.supplier_name)
                setContact_number(data.supplier_number)
                setLocation(data.supplier_location)
                setSupplierType(data.supplier_type)

            }
            catch (e) {
                console.log(e)
            }
        }
        fetchData()
    }, [])


    const supplierOptions = [
        { label: 'Floral', value: 'floral' },
        { label: 'Photography', value: 'photography' },
        { label: 'Catering', value: 'catering' },
        { label: 'Decor', value: 'decor' },
        { label: 'Audio/Visual', value: 'audio/visual' },
        { label: 'Others', value: 'others' },
    ]

    const idOptions = [
        { label: "Driver's License", value: "driver's license" },
        { label: 'Social Security System (SSS) ID', value: 'sss' },
        { label: 'Unified Multi-Purpose (UMID) ID', value: 'umid' },
        { label: 'Tax Identification Number (TIN)', value: 'tin' },
        { label: 'Philippine Identification (PhilID) / ePhilID', value: 'philid' },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setIsLoading(true)

            await setDoc(doc(db, "ShopVerification", auth.currentUser.uid), {
                supplier_name: business_name,
                supplier_number: contact_number,
                supplier_location: location,
                supplier_id: supplier_id,
                supplier_type: supplierType,
                id_picture: id_picture,
                additional_information: additional_information,
                isAgree: agree,
                isApproved: "pending"
            })

            await updateDoc(doc(db, "Shops", auth.currentUser.uid), {
                isApproved: "pending"
            })

            Swal.fire({
                title: "Request Submitted",
                text: "We'll review your request and get back to you shortly.",
                icon: "success",
                confirmButtonText: "OK"
            });

            setIsLoading(false)
            setRedirect(true)
        }
        catch (e) {
            console.log(e)
        }
    }

    if (redirect || userData.role !== "Supplier") {
        return <Navigate to={'/dashboard'} />
    }

    console.log(shop)

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
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* business name */}
                <div className="flex flex-col">
                    <label htmlFor="business_name">Business Name</label>
                    <input value={shop.supplier_name} onChange={(e) => setBusiness_name(e.target.value)} type="text" name="business_name" placeholder="Floral Design" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                </div>

                {/* address */}
                <div className="flex flex-col">
                    <label htmlFor="address">Address</label>
                    <AddressAutocomplete setLocation={setLocation} default_location={location} className={'mt-2 py-1 rounded-sm'} />
                </div>

                {/* contact number */}
                <div className="flex flex-col">
                    <label htmlFor="contact_number">Contact</label>
                    <input value={contact_number} onChange={(e) => setContact_number(e.target.value)} type="tel" name="contact_number" maxLength={11} placeholder="09XXXX" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                </div>

                {/* supplier type */}
                <div className="flex flex-col">
                    <label htmlFor="supplier_type" className="mb-2">Supplier Type</label>
                    <Select
                        onChange={setSupplierType}
                        options={supplierOptions}
                        value={supplierType}
                        isClearable
                    />
                </div>

                {/* additional information */}
                <div className="flex flex-col w-full">
                    <label htmlFor="addtional_information">Additional Information (Optional)</label>
                    <textarea onChange={(e) => setAdditional_information(e.target.value)} name="addtional_information" id="addtional_information" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-38 py-2 ring-black"
                        required
                    ></textarea>
                </div>

                <div className="flex flex-col">
                    <div className="flex space-x-1 mb-2">
                        <FileText size={21} />
                        <span className="block font-semibold">Document Upload</span>
                    </div>
                    <span className="block text-gray-600 mb-2">Upload documents to verify your business credentials</span>
                    <Select
                        onChange={setSupplier_Id}
                        options={idOptions}
                        value={supplier_id}
                        placeholder="Select ID"
                        isClearable
                    />
                    {supplier_id && (
                        <UploadWidget className={'max-w-1/7'} setPicture={setId_picture} />
                    )}
                </div>

                {/* verification */}
                <VerificationCheckbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />

                {/* cancel/submit */}
                <div className="flex space-x-3 justify-center text-white">
                    <Link to={'/shop'} className="transition-all duration-75 bg-blue-600 px-7 py-2 rounded-xl hover:bg-blue-700">Cancel</Link>
                    <button disabled={isLoading} className={`${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-75 px-7 py-2 rounded-xl flex space-x-3`}>
                        <IdCard strokeWidth={2} />
                        <span>{isLoading ? 'Submitting..' : 'Submit'}</span>
                    </button>
                </div>

            </form>
        </>
    )
}