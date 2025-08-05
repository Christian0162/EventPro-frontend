import { Button, Dialog, DialogPanel, } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import Swal from 'sweetalert2'
import { FileText, MapPin, Calendar, Building, User, TriangleAlert, CreditCard, PhilippinePeso } from 'lucide-react'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { paymentMethods } from '../constants/categories'
import { nanoid } from 'nanoid'
import { useCreatePayment } from '../hooks/usePayment'
import { useFetchContractPaymentById } from '../hooks/useContract'

export default function ContractModal({ event_id, supplier_id, eventData, supplierData }) {
    const [isOpen, setIsOpen] = useState(false)
    const [contract, setContract] = useState([])
    const [eventUser, setEventUser] = useState([])
    const [payment_method, setPayment_method] = useState([])
    const [payment_method_error, setPayment_method_error] = useState('')
    const { createPayment, isProcessing } = useCreatePayment()

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    const handlePaymentMethod = (method) => {
        if (method !== payment_method) {
            setPayment_method(method)
        }
        else {
            setPayment_method([])
        }
    }

    useEffect(() => {
        const fetchContract = async () => {

            const q = query(collection(db, "contracts"),
                where("event_id", "==", event_id),
                where("supplier_id", "==", supplier_id))

            const contractSnapShot = await getDocs(q)
            const contract = contractSnapShot.docs.map(contract => ({ id: contract.id, ...contract.data() }))
            setContract(contract)
        }

        const fetchEventById = async () => {
            const fetchEventUser = await getDoc(doc(db, "users", eventData.user_id))
            setEventUser(fetchEventUser.data())
        }

        fetchEventById()
        fetchContract()
    }, [event_id, supplier_id])

    const handlePayment = async (service_price, service_fee, processingFee, netAmount) => {
        if (payment_method.length === 0) {
            return setPayment_method_error("Select Payment Method")
        }

        const payment_data = {
            external_id: nanoid(20),
            contract_id: contract[0].id,
            event_name: eventData.event_name,
            event_id: event_id,
            supplier_id: supplier_id,
            payment_method: payment_method.method,
            event_email: eventUser.email_address,
            event_contact: eventUser?.contact_number,
            total_amount: service_price,
            service_fee: service_fee,
            process_fee: processingFee,
            net_amount: Number(netAmount)
        }


        try {
            setPayment_method_error('')
            await createPayment(payment_data)
        }

        catch (e) {
            console.error(e)
        }

    }

    const { payments } = useFetchContractPaymentById(contract[0]?.id, event_id, supplier_id)

    if (contract.length === 0) {
        return <div>loading..</div>
    }

    console.log(payments)

    console.log(nanoid(20))
    console.log(contract[0])

    return (
        <>
            <Button onClick={open} className={'transition-all duration-100 hover:bg-blue-700 self-center px-3 py-1 text-sm rounded-sm bg-blue-600 text-white '}>View Contract</Button>

            <Dialog open={isOpen} as='div' className={'z-999 relative focus:outline-none'} onClose={close}>
                <div className="fixed inset-0 bg-black/25 " />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            <div className='relative'>
                                <button
                                    onClick={close}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            <div>
                                {contract.map((cont, index) => {
                                    const service_fee = Number(cont?.service_plan?.service_price) * 0.005
                                    const service_price = Number(cont?.service_plan?.service_price) || 0;
                                    const process_fee = payment_method?.process_fee || 0;
                                    const processingFee = Number.isNaN(service_price * process_fee)
                                        ? 0
                                        : service_price * process_fee;
                                    const netAmount = Number(service_price + service_fee + processingFee);

                                    return (
                                        <div key={index}>
                                            {/* Header */}
                                            <div className="flex justify-between bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-xl mb-2 px-7 py-7 gap-2">
                                                <div>
                                                    <div className='flex items-center gap-3'>
                                                        <FileText size={26} className="text-white" />
                                                        <h2 className="text-2xl font-bold text-white">Event Service Contract</h2>
                                                    </div>
                                                    <p className='text-white'>Contract ID: {cont.id}</p>
                                                </div>

                                                <div className='flex items-center gap-2  px-12'>
                                                    <span className='block text-gray-200'>Contract status:</span>
                                                    <span className={`block text-white px-3 ${cont.status === "Pending" ? "bg-yellow-600" : "bg-green-500"} py-1 rounded-full text-sm`}>{cont.status}</span>
                                                </div>

                                            </div>

                                            <div className='grid grid-cols-2 px-9 py-4 gap-5 mx-auto'>
                                                <div className='flex items-center gap-3'>
                                                    <Calendar className='text-blue-600' />
                                                    <div className='flex flex-col'>
                                                        <span className='block text-sm text-gray-400'>Event Name</span>
                                                        <span className='block font-semibold'>{eventData.event_name}</span>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-3'>
                                                    <MapPin className='text-blue-600' />
                                                    <div className='flex flex-col'>
                                                        <span className='block text-sm text-gray-400'>Venue & Date</span>
                                                        <span className='block font-semibold'>{eventData.event_location}</span>
                                                        <span className='block text-sm text-gray-400'>{eventData.event_date.date_value}</span>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-3'>
                                                    <User className='text-blue-600' />
                                                    <div className='flex flex-col'>
                                                        <span className='block text-sm text-gray-400'>Event Planner</span>
                                                        <span className='block font-semibold'>{eventUser.first_name} {eventUser.last_name}</span>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-3'>
                                                    <Building className='text-blue-600' />
                                                    <div className='flex flex-col'>
                                                        <span className='block text-sm text-gray-400'>Event Supplier</span>
                                                        <span className='block font-semibold'>{supplierData.supplier_name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex flex-col items-start px-9 py-8 justify-center'>
                                                <div
                                                    className={`w-full flex flex-col rounded-lg transition-all duration-200 shadow-md border border-gray-300
                                            bg-blue-50`}
                                                    key={index}
                                                >
                                                    <div>
                                                        <div className="rounded-t-md bg-blue-600 text-white">
                                                            <h3 className="font-bold text-2xl text-center py-5">{cont?.service_plan.service_plan?.label}</h3>
                                                        </div>

                                                        <div className="flex items-center justify-center">
                                                            <p className="text-gray-900 text-2xl font-bold leading-relaxed mt-3">
                                                                ₱{cont?.service_plan?.service_price}.0/deliver
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between gap-3 h-full space-x-4">

                                                        <div className="text-left px-6 mt-3">
                                                            {cont?.service_plan.service_inclusions?.map((inclusion, inclusionIndex) => (
                                                                <div className="flex gap-3 space-y-3" key={inclusionIndex}>
                                                                    <Check className="text-green-400" />
                                                                    <span className="flex text-sm text-gray-600" >{inclusion}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div>
                                                            <div className="px-6 mb-5 text-left">
                                                                <hr className="border-b-0 border-gray-400 mb-1" />
                                                                <span className="text-left text-sm text-gray-600">Note: {cont?.service_plan.service_payment_notice?.label}</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* penlaties for service failure */}
                                                <div className="w-full h-[300px] rounded-lg overflow-y-auto bg-red-50 p-6 mt-8 border border-gray-300">
                                                    <div className='flex gap-2 items-center'>
                                                        <TriangleAlert className='text-red-600' />
                                                        <p className="font-bold text-lg">{cont.penalty_clauses.title}</p>
                                                    </div>
                                                    <span className="text-gray-600 mt-3 block">{cont.penalty_clauses.description}</span>
                                                    {cont.penalty_clauses.clauses.map((clause, penalIndex) => (
                                                        <div className="mb-3" key={penalIndex}>
                                                            <span className="text-red-600 mt-5 block font-semibold">{penalIndex + 1}. {clause.title}</span>
                                                            {clause?.details?.map((details, detailIndex) => (
                                                                <p className="text-gray-600 mt-2" key={detailIndex}>{details}</p>
                                                            ))}
                                                        </div>

                                                    ))}
                                                </div>

                                                {cont.status === "Approved" && (
                                                    <>
                                                        {/* payment method */}
                                                        {payments?.length === 0 && (
                                                            <div className="w-full bg-blue-50 p-6 mt-8 border rounded-lg border-gray-300">
                                                                <div className='flex gap-2 items-center'>
                                                                    <CreditCard className='text-blue-600' />
                                                                    <p className="font-bold text-lg">Payment Methods</p>
                                                                </div>

                                                                <div className='flex flex-col gap-5 mt-5'>
                                                                    {paymentMethods.map((methods, methodIndex) => (
                                                                        <button onClick={() => handlePaymentMethod(methods)} className={`transition-all duration-100 rounded-lg flex justify-between border hover:ring hover:ring-blue-600
                                                         ${payment_method.method === methods.method ? 'border border-blue-600' : 'border-gray-300'} shadow-lg p-5`}
                                                                            key={methodIndex}
                                                                        >

                                                                            <div className='flex items-center gap-3'>
                                                                                <div className='flex items-center gap-1'>
                                                                                    <img src={methods.payment_method_logo} className='w-12 h-12 object-cover rounded-xl' alt="" />
                                                                                </div>
                                                                                <div className='flex flex-col gap-1'>
                                                                                    <span className='block text-left text-gray-900 font-semibold'>{methods.name}</span>
                                                                                    <span className='block text-left text-sm text-gray-500'>{methods.type}</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className={`rounded-full h-5 w-5 border flex items-center justify-center border-gray-300 ${payment_method.method === methods.method ? methods.color : 'bg-gray-300'}`}>
                                                                                {payment_method.method === methods.method && <Check className='w-3 h-3 text-white' />}
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                    {payment_method_error && (
                                                                        <span className='ml-3 text-sm text-red-500'>{payment_method_error}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Payment Summary */}
                                                        <div className="w-full h-[300px] rounded-lg p-6 mt-8 border border-gray-300">
                                                            <div className='flex items-center justify-between'>
                                                                <div className='flex gap-2 items-center'>
                                                                    <PhilippinePeso className='text-green-600' />
                                                                    <p className="font-bold text-lg">Payment Summary</p>
                                                                </div>

                                                                <div className='flex items-center gap-2'>
                                                                    <span className='block text-sm text-gray-800 font-semibold'>Payment status:</span>
                                                                    <span className={`block text-white px-3 py-[2px] rounded-full text-sm ${payments[0]?.status === "PAID" ? "bg-green-400" : "bg-gray-400"}`}>{payments[0]?.status === "PAID" ? payments[0]?.status : "UNPAID"}</span>
                                                                </div>
                                                            </div>

                                                            <div className="bg-gray-50 rounded-lg p-6">
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-600">Services Subtotal</span>
                                                                        <span className="font-semibold">₱{payments[0]?.total_amount > 0 ? payments[0]?.total_amount : service_price}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-600">Service Fee</span>
                                                                        <span className="font-semibold">₱{payments[0]?.service_fee > 0 ? payments[0]?.service_fee : service_fee}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-600">Processing Fee</span>
                                                                        <span className="font-semibold">₱{payments[0]?.process_fee > 0 ? payments[0]?.process_fee : processingFee}</span>
                                                                    </div>
                                                                    <div className="border-t border-gray-300 pt-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-lg font-bold text-gray-800">Net Amount</span>
                                                                            <span className="text-2xl font-bold text-green-600">₱{payments[0]?.net_amount > 0 ? payments[0]?.net_amount : netAmount}</span>
                                                                        </div>
                                                                    </div>


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>



                                            {cont.status === "Approved" && payments?.length === 0 ? (
                                                <button
                                                    onClick={() => handlePayment(service_price, service_fee, processingFee, netAmount)}
                                                    className={`px-7 py-2 ${isProcessing ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm rounded flex justify-end items-end ml-auto relative bottom-3 right-10`}
                                                >
                                                    {isProcessing ?
                                                        <div className='flex items-center gap-3 '>
                                                            Processing..
                                                            <div className='border-t-2  h-4 w-4 rounded-full animate-spin '></div>
                                                        </div> : 'Pay Contract'}
                                                </button>
                                            ) :
                                                (
                                                    <button disabled={true} className='px-7 py-2 flex justify-end items-end ml-auto relative bottom-3 right-10 bg-gray-400 text-white text-sm rounded'>{payments[0]?.status === "PAID" ? "Contract Paid" : "Awaiting Approval"}</button>
                                                )
                                            }
                                        </div>
                                    )
                                })}

                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}