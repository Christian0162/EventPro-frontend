import Select from "react-select"
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AddressAutocomplete from "../../components/AddressAutoComplete";
import { FileText, IdCard } from "lucide-react";
import VerificationCheckbox from "../../components/VerificationCheckBox";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import UploadWidget from "../../components/UploadWidgen";
import { SupplierOptions, idOptions, documentOptions, exampleIds, exampleDocuments } from "../../constants/categories";
import Swal from "sweetalert2";

export default function Verification({ userData }) {

    const [shop, setShop] = useState([])
    const [errorUpload, setErrorUpload] = useState('')
    const [errorId, setErrorId] = useState('')
    const [errorDoc, setErrorDoc] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [supplierType, setSupplierType] = useState(null)
    const [location, setLocation] = useState('')
    const [supplier_id, setSupplier_Id] = useState(null)
    const [business_name, setBusiness_name] = useState('')
    const [contact_number, setContact_number] = useState('')
    const [additional_information, setAdditional_information] = useState('')
    const [first_name, setFirst_Name] = useState('')
    const [last_name, setLast_Name] = useState('')
    const [email_address, setEmail_Address] = useState('')
    const [id_picture, setId_picture] = useState([]);
    const [agree, setAgree] = useState(false)
    const [redirect, setRedirect] = useState(false)
    const [documents, setDocuments] = useState(null)
    const [uploadDocs, setUploadDocs] = useState([])
    const [exampleId, setExampleId] = useState([])
    const [exampleDocument, setExampleDocument] = useState([])

    useEffect(() => {
        if (supplier_id && exampleIds) {
            const exampleId = exampleIds[supplier_id.value] || []

            setExampleId(exampleId)
        }

        if (documents && exampleDocuments) {
            const exampleDoc = exampleDocuments[documents.value] || []

            setExampleDocument(exampleDoc)
        }
    }, [supplier_id, documents])

    useEffect(() => {
        const fetchData = async () => {
            try {

                if (userData.role === 'Supplier') {
                    const snapShotShop = await getDoc(doc(db, "shops", auth.currentUser.uid));
                    const data = snapShotShop.data()

                    setShop(data)
                    setBusiness_name(data?.supplier_name)
                    setContact_number(data?.supplier_number)
                    setLocation(data?.supplier_location)
                    setSupplierType(data?.supplier_type)
                    setIsLoading(false)

                }

                else {
                    const snapShotShop = await getDoc(doc(db, "userProfile", auth.currentUser.uid));
                    const data = snapShotShop.data()
                    setFirst_Name(userData.first_name)
                    setLast_Name(userData.last_name)
                    setEmail_Address(userData.email_address)
                    setContact_number(data.contact_number)
                    setIsLoading(false)

                }
            }
            catch (e) {
                console.log(e)
            }

        }
        fetchData()
    }, [userData])

    useEffect(() => {

        try {
            const fetchVerification = async () => {
                const onSnapShotVerification = await getDoc(doc(db, "verification", userData.id));

                if (onSnapShotVerification.exists()) {
                    setRedirect(true)
                }

            }

            fetchVerification()
        }
        catch (e) {
            console.error(e)
        }

    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        if (supplier_id?.length > 1) {
            setErrorId('At least 2 ID images required');
            setIsLoading(false)
            return
        }

        if (documents?.length === 0) {
            setErrorDoc('Must upload At least 1 document');
            setIsLoading(false)
            return
        }

        try {

            if (userData.role === 'Supplier') {
                await setDoc(doc(db, "verification", auth.currentUser.uid), {
                    supplier_name: business_name,
                    supplier_number: contact_number,
                    supplier_location: location,
                    supplier_id: supplier_id,
                    supplier_type: supplierType,
                    id_picture: id_picture,
                    documents_information: uploadDocs,
                    additional_information: additional_information,
                    isAgree: agree,
                    status: "pending"
                })

                await updateDoc(doc(db, "shops", auth.currentUser.uid), {
                    status: "pending"
                })
            }

            else {
                await setDoc(doc(db, "verification", auth.currentUser.uid), {
                    first_name: first_name,
                    last_name: last_name,
                    email_address: email_address,
                    location: location,
                    contact_number: contact_number,
                    id_picture: id_picture,
                    documents_information: uploadDocs,
                    additional_information: additional_information,
                    isAgree: agree,
                    status: "pending"
                })

                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    status: 'pending'
                })
            }

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
        finally {
            setIsLoading(false)
        }
    }

    if (redirect) {
        return <Navigate to={'/dashboard'} />
    }

    console.log(redirect)

    return (
        <>

            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 py-10 px-15">
                <div className="flex items-center space-x-5">
                    <span className="text-3xl font-semibold">{userData.role === 'Supplier' ? 'Supplier Verification' : 'Planner Verification'}</span>
                    <IdCard size={50} strokeWidth={1} />
                </div>
                <span className="block text-gray-600">Submit your business information for verification to get verified</span>
                <form onSubmit={handleSubmit} className="mt-8">

                    {/* business name */}
                    {userData.role === 'Supplier' && (
                        <div className="flex flex-col mb-5">
                            <label htmlFor="business_name">Business Name</label>
                            <input value={business_name} onChange={(e) => setBusiness_name(e.target.value)} type="text" name="business_name" placeholder="Floral Design" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                        </div>
                    )}

                    {/* first name, last name and email address */}
                    {userData.role === 'Event Planner' && (
                        <>
                            <div className="flex flex-col mb-5">
                                <label htmlFor="contact_number">First Name</label>
                                <input value={first_name} onChange={(e) => setFirst_Name(e.target.value)} type="text" name="first_name" placeholder="e.g Juan Dela" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                            </div>

                            <div className="flex flex-col mb-5">
                                <label htmlFor="contact_number">Last Name</label>
                                <input value={last_name} onChange={(e) => setLast_Name(e.target.value)} type="text" name="last_name" placeholder="e.g Cruz" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                            </div>

                            <div className="flex flex-col mb-5">
                                <label htmlFor="contact_number">Email Address</label>
                                <input value={email_address} onChange={(e) => setEmail_Address(e.target.value)} type="email" name="email_addess" placeholder="e.g test@gmail.com" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                            </div>
                        </>
                    )}

                    {/* address */}
                    <div className="flex flex-col mb-5">
                        <label htmlFor="address">Address</label>
                        <AddressAutocomplete setLocation={setLocation} default_location={location} className={'mt-2 py-1 rounded-sm ring-1 ring-black'} />
                    </div>

                    {/* contact number */}
                    <div className="flex flex-col mb-5">
                        <label htmlFor="contact_number">Contact</label>
                        <input value={contact_number} onChange={(e) => setContact_number(e.target.value)} type="tel" name="contact_number" maxLength={11} placeholder="e.g 09123456789" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-8 ring-black" />
                    </div>

                    {/* supplier type */}
                    {userData.role === 'Supplier' && (

                        < div className="flex flex-col mb-5">
                            <label htmlFor="supplier_type" className="mb-2">Supplier Type</label>
                            <Select
                                onChange={setSupplierType}
                                options={SupplierOptions}
                                value={supplierType}
                                isClearable
                            />
                        </div>
                    )}

                    {/* additional information */}
                    <div className="flex flex-col w-full mb-5">
                        <label htmlFor="addtional_information">Additional Information (Optional)</label>
                        <textarea onChange={(e) => setAdditional_information(e.target.value)} placeholder="Optional" name="addtional_information" id="addtional_information" className="mt-2 focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 rounded-sm w-full h-38 py-2 ring-black"></textarea>
                    </div>

                    <div className="flex flex-col mb-8">
                        <div className="flex items-center space-x-1 mb-2">
                            <IdCard size={24} />
                            <span className="block font-semibold">Upload Your Valid ID</span>
                        </div>
                        <span className="block text-gray-600 mb-2 text-sm">To verify your business credentials, please upload a clear photo or scanned copy of a valid government-issued ID (e.g., Passport, Driver’s License, or National ID).</span>
                        <Select
                            onChange={(e) => { setSupplier_Id(e); setErrorId('') }}
                            options={idOptions}
                            value={supplier_id}
                            placeholder="Select ID"
                            isClearable
                        />
                        {supplier_id && (
                            <div className="mt-3">
                                <span className="ml-1 text-gray-600 block text-sm">Refer to the sample id below. Only 2 pictures are allowed. </span>
                                <div className="flex justify-center">
                                    <div className="flex mt-5 gap-4 justify-center">
                                        {exampleId?.map((id, index) => (
                                            <img
                                                key={index}
                                                src={id}
                                                alt={`Example ${index + 1}`}
                                                className="w-[35rem] rounded  object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <UploadWidget className={'w-80 mt-5'} type={'id'} setId={setId_picture} setError={setErrorId} />
                            </div>

                        )}
                        {errorId && (
                            <span className="block mt-2 text-red-500 text-sm">{errorId}</span>
                        )}
                    </div>

                    <div className="flex flex-col mb-5">
                        <div className="flex items-center space-x-1 mb-2">
                            <FileText size={24} />
                            <span className="block font-semibold">Document Upload</span>
                        </div>
                        <span className="block text-gray-600 mb-2 text-sm">Upload documents to verify your business credentials</span>
                        <Select
                            onChange={(e) => { setDocuments(e); setErrorDoc('') }}
                            options={documentOptions}
                            value={documents}
                            placeholder="Business Document"
                            isClearable
                        />
                        {documents && (
                            <div className="mt-3">
                                <span className="ml-1 text-gray-600 block text-sm">Refer to the sample document below. Only 2 pictures are allowed. </span>
                                <div className="flex justify-center">
                                    <div className="flex mt-5 gap-4 justify-center">
                                        {exampleDocument?.map((doc, index) => (
                                            <img
                                                key={index}
                                                src={doc}
                                                alt={`Example ${index + 1}`}
                                                className="w-[35rem] rounded  object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <UploadWidget className={'w-80 mt-5'} type={'doc'} setDoc={setUploadDocs} setError={setErrorDoc} />
                            </div>
                        )}
                        {errorDoc && (
                            <span className="block mt-2 text-red-500 text-sm">{errorDoc}</span>

                        )}
                    </div>

                    {/* verification */}
                    <VerificationCheckbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />

                    {/* cancel/submit */}
                    <div className="flex space-x-3 mt-7 justify-center text-white">
                        <Link to={'/dashboard'} className="transition-all duration-75 bg-blue-600 px-7 py-2 rounded-xl hover:bg-blue-700">Cancel</Link>
                        <button disabled={isLoading} className={`${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-75 px-7 py-2 rounded-xl flex space-x-3`}>

                            <span>{isLoading ? <div className="px-7">
                                <div className="h-6 w-6 rounded-full border-t-2 border-blue-600 animate-spin"></div>
                            </div> : <div className="flex items-center gap-2"><IdCard strokeWidth={2} /> Submit</div>}</span>
                        </button>
                    </div>\
                </form >
            </div >
        </>
    )
}