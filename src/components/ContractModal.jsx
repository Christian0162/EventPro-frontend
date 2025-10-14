import { Button, Dialog, DialogPanel, } from '@headlessui/react'
import { useEffect, useState, useRef } from 'react'
import { X, Check, ArrowLeftRight } from 'lucide-react'
import { FileText, MapPin, Calendar, Building, User, TriangleAlert, CreditCard, PhilippinePeso, Package } from 'lucide-react'
import { collection, doc, getDocs, query, where, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import { paymentMethods, statusStyles } from '../constants/categories'
import { nanoid } from 'nanoid'
import { useCreatePayment } from '../hooks/usePayment'
import { useFetchTransactionById } from '../hooks/useTransaction'
import SubmissionModal from './SubmissionModal'
import { useFetchDeliveries } from '../hooks/useDeliveries'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import LoadingOverlay from './LoadingOverlay'
import { RejectReview } from './ReviewModal'
import { useFetchUsers } from '../hooks/useUsers'
import { useFetchContract } from '../hooks/useContract'
import DamagePenaltiesModal from './DamagePenaltiesModal'
import ReportModal from './ReportModal'

export default function ContractModal({ userData, event_id, supplier_id, eventData, supplierData, user_id }) {
    const [isOpen, setIsOpen] = useState(false)
    const [payment_method, setPayment_method] = useState([])
    const [payment_method_error, setPayment_method_error] = useState('')
    const [contract_transaction, setContract_Transaction] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isProcecssing, setIsProcessing] = useState(false)
    const [isReleasing, setIsReleasing] = useState(false)
    const { createPayment, isProcessing } = useCreatePayment()
    const { transactions } = useFetchTransactionById(eventData?.user_id)
    const [contract, setContract] = useState([])
    const [eventUser, setEventUser] = useState([])
    const { deliveries } = useFetchDeliveries()
    const { contracts: AllContracts } = useFetchContract()
    const { users } = useFetchUsers()
    const paymentSectionRef = useRef(null);
    const navigate = useNavigate()
    const [now, setNow] = useState(new Date())

    const contractDeliveries = deliveries.filter(del => del.contract_id === contract?.id && del.supplier_id === supplier_id)

    const computeTotalDeductions = (delivery, servicePrice) => {
        let totalDeduction = 0;

        delivery.forEach((d) => {
            if (!d.penalty_applied || d.penalty_applied.length === 0) return;

            d.penalty_applied.forEach((penalty) => {
                // 🕒 Late Delivery
                if (penalty.includes("Late Delivery")) {
                    const planned = new Date(d.planned_date);
                    const delivered = d.delivered_date?.seconds
                        ? new Date(d.delivered_date.seconds * 1000)
                        : new Date(d.delivered_date);

                    // Calculate days late (if any)
                    const diffDays = Math.max(
                        0,
                        Math.ceil((delivered - planned) / (1000 * 60 * 60 * 24))
                    );

                    const perDay = servicePrice * 0.005; // 0.5% per day
                    const maxDeduction = servicePrice * 0.2; // Max 20%
                    const lateDeduction = Math.min(diffDays * perDay, maxDeduction);

                    totalDeduction += lateDeduction;
                }

                // ⚙️ Service Non-Conformity
                if (penalty.includes("Service Non-Conformity")) {
                    if (penalty.includes("Slight Damage")) {
                        totalDeduction += servicePrice * 0.05; // Example: 5% deduction
                    } else if (penalty.includes("Badly Damaged")) {
                        totalDeduction += servicePrice * 0.5; // Example: 50% deduction
                    }
                }
            });
        });

        return totalDeduction;
    };
    const isDownPayment = contract?.service_plan?.service_payment_notice?.label === "Down Payment required atleast 50 percent."

    console.log("downpayment:", isDownPayment)
    const platformFee = Number(contract?.service_plan?.service_price) > 5000 ? Number(contract?.service_plan?.service_price) * 0.10 : Number(contract?.service_plan?.service_price) * 0.05
    const service_price = Number(contract?.service_plan?.service_price) || 0;
    const process_fee = payment_method?.process_fee || 0;
    const processFee = isDownPayment ? (service_price / 2) * process_fee : service_price * process_fee;

    const totalDeductions = computeTotalDeductions(contractDeliveries, service_price);

    const fullAmount = contract?.service_plan?.service_price + processFee
    const netAmount = Number(service_price - platformFee);
    const finalAmount = netAmount - totalDeductions;

    const downpayment = (service_price / 2) + processFee;
    const nextpayment = (service_price / 2) + processFee;

    const total_paid = contract_transaction.reduce((sum, trans) => sum + trans.amount, 0)
    const total_fees = contract_transaction.reduce((sum, trans) => sum + trans.process_fee, 0)

    const not_include_fees = total_paid - total_fees

    // Collect and count unique issues
    const issueCount = contractDeliveries
        .flatMap((d) => d.penalty_applied || [])
        .filter((p) => p && p.trim() !== "")
        .reduce((acc, issue) => {
            acc[issue] = (acc[issue] || 0) + 1;
            return acc;
        }, {});


    useEffect(() => {
        const eventUser = users.filter(user => user.id === eventData?.user_id)

        const contract = AllContracts.filter(contract => contract?.event_id === eventData?.id && contract?.supplier_id === supplierData?.id)
        setEventUser(eventUser[0])
        setContract(contract[0])
    }, [AllContracts, users, eventData, supplierData])

    console.log(eventUser)

    useEffect(() => {
        const filteredTransaction = transactions.filter(trans => trans.contract_id === contract?.id && trans.status === "HOLD")

        setContract_Transaction(filteredTransaction)
    }, [user_id, transactions, contract])




    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const eventDate = new Date(eventData?.event_date?.date_value);

    const showSubmitButton = userData?.role === "Supplier" && now.getDate() >= eventDate.getDate();

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    const handleDeliveryStatus = async (deliveryId) => {
        Swal.fire({
            title: 'Mark as Received?',
            text: 'Are you sure you want to confirm that this delivery has been received?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Mark as Received',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#d33',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                // proceed to mark as received
                const deliveryRef = doc(db, "deliveries", deliveryId);
                await updateDoc(deliveryRef, {
                    status: "Confirmed",
                    confirmed_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                });

                Swal.fire({
                    title: 'Delivery Received!',
                    text: 'The delivery has been successfully marked as received.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    }

    const handleApprove = async (contract_id) => {
        setIsSubmitting(false)

        Swal.fire({
            title: "Are you sure?",
            text: "Once you approve this, the contract will begin and be treated as an approved agreement.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, approve it",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire(
                        "Approved!",
                        "The contract has been approved successfully.",
                        "success"
                    );

                    await updateDoc(doc(db, "contracts", contract_id), {
                        status: "Approved"
                    })

                    await addDoc(collection(db, "notifications"), {
                        avatar: supplierData?.supplier_name.charAt(0).toUpperCase(),
                        message: `The supplier "${supplierData?.supplier_name}" has approved the contract with ID: ${contract?.id}.`,
                        createdAt: serverTimestamp(),
                        sender_id: supplierData.id,
                        referenced_type: 'contract',
                        referenced_id: contract?.id,
                        title: "Contract approved by supplier",
                        unread: true,
                        receiver_id: eventData?.user_id
                    });

                }
                catch (e) {
                    console.error(e)
                    setIsSubmitting(false)
                }
                finally {
                    setIsSubmitting(false)
                }
            }
        });
    }

    const handlePaymentMethod = (method) => {
        if (method !== payment_method) {
            setPayment_method(method)
            setPayment_method_error('')
        }
        else {
            setPayment_method([])
        }
    }

    const handleRelease = async (e, platform_fee, netAmount) => {
        e.preventDefault()
        setIsReleasing(true)

        const result = await Swal.fire({
            title: 'Release Payment?',
            text: "If you release this, the money will be released to the supplier.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, release it!',
            cancelButtonText: 'Cancel'
        })

        if (result.isConfirmed) {
            try {

                await addDoc(collection(db, "transactions"), {
                    contract_id: contract?.id || null,
                    user_id: supplier_id,
                    payment_method: null,
                    event_email: eventUser.email_address,
                    event_contact: eventUser?.contact_number || null,
                    amount: finalAmount,
                    platform_fee: platform_fee,
                    process_fee: 0,
                    type: "CREDIT",
                    status: "COMPLETED",
                    created_at: serverTimestamp()
                })

                await updateDoc(doc(db, 'users', contract.supplier_id), {
                    balance: finalAmount
                })

                await addDoc(collection(db, "notifications"), {
                    avatar: eventData?.event_name?.charAt(0).toUpperCase(),
                    message: `The Event ${eventData?.event_name} has been completed Contract ID: "${contract?.id}". Your balance will be updated accordingly.`,
                    createdAt: serverTimestamp(),
                    referenced_type: 'contract',
                    sender_id: eventData.id,
                    referenced_id: contract?.id,
                    title: 'Contract Completed',
                    unread: true,
                    receiver_id: supplier_id
                })


                // Update contract status
                await updateDoc(doc(db, "contracts", contract?.id), {
                    status: "Completed"
                })

                setIsReleasing(false)


                Swal.fire(
                    'Released!',
                    'The payment has been released to the supplier.',
                    'success'
                )
            } catch (error) {
                console.error(error)
                setIsReleasing(false)

                Swal.fire(
                    'Error!',
                    'Something went wrong while releasing the payment.',
                    'error'
                )
            }
            setIsReleasing(false)
        }
    }


    const handlePayment = async (downpayment, nextpayment, processingFee) => {
        if (payment_method.length === 0) {

            if (paymentSectionRef.current) {
                paymentSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            return setPayment_method_error("Select Payment Method")
        }

        const payment_data = {
            external_id: nanoid(20),
            contract_id: contract?.id,
            event_name: eventData?.event_name,
            event_id: event_id,
            user_id: user_id,
            payment_method: payment_method.method,
            event_email: eventUser.email_address,
            event_contact: eventUser?.contact_number,
            amount: isDownPayment ? contract_transaction?.length > 0 ? downpayment : nextpayment : fullAmount,
            process_fee: processingFee
        }


        try {
            setPayment_method_error('')
            await createPayment(payment_data, supplierData)
        }

        catch (e) {
            console.error(e)
        }

    }

    const handleChat = async (e) => {
        e.preventDefault();
        setIsProcessing(true)
        try {
            const targetId = userData?.role === "Supplier" ? eventData?.user_id : supplierData.id;
            const targetName = userData?.role === "Supplier"
                ? `${eventUser.first_name} ${eventUser.last_name}`
                : supplierData?.supplier_name;

            const q = query(
                collection(db, "contacts"),
                where("user_id", "==", auth.currentUser.uid),
                where("contact_id", "==", targetId)
            );

            const querySnapShot = await getDocs(q);

            if (querySnapShot.empty) {
                await addDoc(collection(db, "contacts"), {
                    user_id: auth.currentUser.uid,
                    contact_id: targetId,
                    name: targetName,
                    avatar: targetName.slice(0, 1).toUpperCase(),
                    last_message: "",
                    isActive: false,
                    createdAt: serverTimestamp(),
                });
                navigate(`/chats/`);
            } else {
                navigate(`/chats/`);
            }
        }
        catch (e) {
            console.error(e)
        }
        finally {
            setIsProcessing(false)
        }
    };


    if (contract && contract?.length === 0) {
        return <div className='h-6 w-6 rounded-full animate-spin border border-t-blue-600'></div>
    }

    return (
        <>
            <Button onClick={open} className={'transition-all duration-100 hover:bg-blue-700 self-center px-3 py-2 text-sm rounded-md bg-blue-600 text-white '}>View Contract</Button>

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

                            <LoadingOverlay isLoading={isProcecssing || isSubmitting} message='Processing...' />

                            <div>
                                <div>
                                    {/* Header */}
                                    <div className="flex justify-between bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-xl mb-2 px-7 py-7 gap-2">
                                        <div>
                                            <div className='flex items-center gap-3'>
                                                <FileText size={26} className="text-white" />
                                                <h2 className="text-2xl font-bold text-white">Event Service Contract</h2>
                                            </div>
                                            <p className='text-white'>Contract ID: {contract?.id}</p>
                                        </div>

                                        <div className='flex flex-col gap-2 text-sm items-center'>
                                            <div className='flex items-center gap-2  px-12'>
                                                <span className='block text-gray-200'>Contract status:</span>
                                                <span className={`block text-xs text-white px-3 ${contract?.status === "Pending" ? "bg-yellow-600" : contract?.status === "Cancelled" ? "bg-red-500" : "bg-green-500"} py-1 rounded-full text-sm`}>{contract?.status}</span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='grid grid-cols-2 px-9 py-4 gap-5 mx-auto'>
                                        <div className='flex items-center gap-3'>
                                            <Calendar className='text-blue-600' />
                                            <div className='flex flex-col'>
                                                <span className='block text-sm text-gray-400'>Event Name</span>
                                                <span className='block font-semibold'>{eventData?.event_name}</span>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3'>
                                            <MapPin className='text-blue-600' />
                                            <div className='flex flex-col'>
                                                <span className='block text-sm text-gray-400'>Venue & Date</span>
                                                <span className='block font-semibold'>{eventData?.event_location}</span>
                                                <span className='block text-sm text-gray-400'>{eventData?.event_date?.date_value}</span>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3'>
                                            <User className='text-blue-600' />
                                            <div className='flex flex-col'>
                                                <span className='block text-sm text-gray-400'>Event Planner</span>
                                                <span className='block font-semibold'>{eventUser?.first_name} {eventUser?.last_name}</span>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3'>
                                            <Building className='text-blue-600' />
                                            <div className='flex flex-col'>
                                                <span className='block text-sm text-gray-400'>Event Supplier</span>
                                                <span className='block font-semibold'>{supplierData?.supplier_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col items-start px-9 py-8 justify-center'>

                                        <div className="w-full rounded-xl p-6 mb-7 border border-gray-200 shadow-sm bg-gray-50">
                                            {/* Header */}
                                            <div className='flex items-center gap-3 mb-6'>
                                                <Package className='text-blue-600' size={24} />
                                                <span className='font-bold text-lg text-gray-800'>Delivery Submissions</span>
                                            </div>

                                            {/* No Deliveries */}
                                            {(contractDeliveries.length === 0) && (
                                                <div className='flex justify-center py-12'>
                                                    <span className='text-gray-500 text-sm'>No deliveries have been submitted yet.</span>
                                                </div>
                                            )}

                                            {/* Deliveries */}
                                            {contractDeliveries.length > 0 && (
                                                <div className="space-y-5 max-h-[350px] overflow-y-auto">
                                                    {contractDeliveries.map((delivery, index) => (
                                                        <div
                                                            key={index}
                                                            className="border border-gray-300 rounded-lg p-5 shadow-md bg-white hover:shadow-lg transition"
                                                        >
                                                            {/* Header */}
                                                            <div className="flex justify-between items-center mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">
                                                                        <strong>Status:</strong>{" "}
                                                                        <span
                                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${delivery.status === "Pending"
                                                                                ? "bg-yellow-100 text-yellow-600"
                                                                                : delivery.status === "Confirmed"
                                                                                    ? "bg-green-100 text-green-600"
                                                                                    : delivery.status === "Damaged"
                                                                                        ? "bg-red-100 text-red-600"
                                                                                        : "bg-gray-100 text-gray-600"
                                                                                }`}
                                                                        >
                                                                            {delivery.status}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-400">
                                                                    Submitted:{" "}
                                                                    {delivery.submitted_at?.toDate
                                                                        ? delivery.submitted_at.toDate().toLocaleString()
                                                                        : "N/A"}
                                                                </span>
                                                            </div>

                                                            {/* Notes */}
                                                            {delivery.notes && (
                                                                <p className="text-sm text-gray-700 mb-4">
                                                                    <strong>Note:</strong> {delivery.notes}
                                                                </p>
                                                            )}

                                                            {delivery.issue_reason && (
                                                                <p className="text-sm text-red-700 mb-4">
                                                                    <strong>Issue:</strong> {delivery.issue_reason}
                                                                </p>
                                                            )}

                                                            {/* Proofs */}
                                                            {delivery.proof?.length > 0 && (
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                                                    <a
                                                                        key={index}
                                                                        href={delivery.proof}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block rounded-lg overflow-hidden border hover:ring hover:ring-blue-400 transition"
                                                                    >
                                                                        <img
                                                                            src={delivery.proof}
                                                                            alt={`Proof ${index + 1}`}
                                                                            className="w-full h-32 object-cover"
                                                                        />
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* Action Buttons - Only show if user is event planner and delivery is pending */}
                                                            {userData?.role !== "Supplier" && delivery.status === "Pending" && (
                                                                <div className="flex justify-end gap-2 mt-4">
                                                                    <DamagePenaltiesModal delivery={delivery} deliveryId={delivery.id} eventData={eventData} />

                                                                    <button
                                                                        onClick={() => handleDeliveryStatus(delivery.id, "Confirmed")}
                                                                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                                                    >
                                                                        Received
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Status message for non-pending deliveries */}
                                                            {delivery.status !== "Pending" && userData?.role !== "Supplier" && (
                                                                <div className="mt-3 text-sm">
                                                                    <span className="text-gray-600">
                                                                        You marked this delivery as:{" "}
                                                                        <span
                                                                            className={`font-medium ${delivery.status === "Confirmed"
                                                                                ? "text-green-600"
                                                                                : delivery.status === "Damaged"
                                                                                    ? "text-orange-600"
                                                                                    : "text-red-600"
                                                                                }`}
                                                                        >
                                                                            {delivery.status}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Submit Button for Supplier */}
                                            {showSubmitButton && (contract?.status !== "Pending" && contract?.status !== "Completed") && contractDeliveries.length === 0 && (
                                                <div className="flex justify-end mt-6">
                                                    <SubmissionModal
                                                        contract={contract}
                                                        eventData={eventData}
                                                        supplierData={supplierData}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className={`w-full flex flex-col rounded-lg transition-all duration-200 shadow-md border border-gray-300
                                            bg-blue-50`}
                                        >
                                            <div>
                                                <div className="rounded-t-md bg-blue-600 text-white">
                                                    <h3 className="font-bold text-2xl text-center py-5">{contract?.service_plan.service_plan?.label}</h3>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <p className="text-gray-900 text-2xl font-bold leading-relaxed mt-3">
                                                        ₱{contract?.service_plan?.service_price}.0/deliver
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-between gap-3 h-full space-x-4">

                                                <div className="text-left px-6 mt-3">
                                                    {contract?.service_plan?.service_inclusions?.map((inclusion, inclusionIndex) => (
                                                        <div className="flex gap-3 space-y-3" key={inclusionIndex}>
                                                            <Check className="text-green-400" />
                                                            <span className="flex text-sm text-gray-600" >{inclusion}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div>
                                                    <div className="px-6 mb-5 text-left">
                                                        <hr className="border-b-0 border-gray-400 mb-1" />
                                                        <span className="text-left text-sm text-gray-600">Note: {contract?.service_plan?.service_payment_notice?.label}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* penlaties for service failure */}
                                        <div className="w-full h-[300px] rounded-lg overflow-y-auto bg-red-50 p-6 mt-8 border border-gray-300">
                                            <div className='flex gap-2 items-center'>
                                                <TriangleAlert className='text-red-600' />
                                                <p className="font-bold text-lg">{contract?.penalty_clauses?.title}</p>
                                            </div>
                                            <span className="text-gray-600 mt-3 block">{contract?.penalty_clauses?.description}</span>
                                            {contract?.penalty_clauses?.clauses.map((clause, penalIndex) => (
                                                <div className="mb-3" key={penalIndex}>
                                                    <span className="text-red-600 mt-5 block font-semibold">{penalIndex + 1}. {clause.title}</span>
                                                    {clause?.details?.map((details, detailIndex) => (
                                                        <p className="text-gray-600 mt-2" key={detailIndex}>{details}</p>
                                                    ))}
                                                </div>

                                            ))}
                                        </div>

                                        {(contract?.status === "Approved" || contract?.status === "Completed" || contract?.status === "Cancelled") && (
                                            <>
                                                {/* payment method */}
                                                {(total_paid - total_fees) !== service_price && userData?.role != "Supplier" && contract.status !== "Cancelled" && (
                                                    <div ref={paymentSectionRef} className="w-full bg-blue-50 p-6 mt-8 border rounded-lg border-gray-300">
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
                                                <div className={`w-full ${userData?.role === "Supplier" ? 'h-[470px]' : 'h-[410px]'}  rounded-lg p-6 mt-8 border border-gray-300`}>
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <div className='flex gap-2 items-center'>
                                                            <PhilippinePeso className='text-green-600' />
                                                            <p className="font-bold text-lg">Payment Summary</p>
                                                        </div>

                                                        <div className='flex items-center gap-2'>
                                                            <span className='block text-sm text-gray-800 font-semibold'>Payment status:</span>
                                                            <span className={`block text-white px-3 py-[2px] rounded-full text-sm ${(total_paid - total_fees) === service_price ? "bg-green-600" : contract_transaction.length > 0 ? "bg-orange-500" : 'bg-gray-400'}`}>{(total_paid - total_fees) === service_price ? 'FULLY PAID' : contract_transaction.length > 0 ? 'PARTIAL PAID' : 'UNPAID'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className='flex justify-between flex-col'>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-gray-600">Services Subtotal</span>
                                                                    <span className="font-semibold">₱{service_price.toLocaleString()}</span>
                                                                </div>
                                                                {userData?.role === "Supplier" && (
                                                                    <>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-gray-600">Platform Fee</span>
                                                                            <span className="font-semibold text-red-600"> - ₱{platformFee.toLocaleString()}</span>
                                                                        </div>

                                                                        <div className="flex flex-col gap-2">

                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-gray-600 font-medium">Total Deductions (from deliveries)</span>
                                                                                    <span className="font-semibold text-red-600">
                                                                                        - ₱{totalDeductions.toLocaleString()}
                                                                                    </span>
                                                                                </div>

                                                                                {Object.keys(issueCount).length > 0 && (
                                                                                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                                                                        {Object.entries(issueCount).map(([issue, count]) => (
                                                                                            <li key={issue}>
                                                                                                {issue} {count > 1 && <span className="text-gray-500">(×{count})</span>}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="border-t border-gray-300 pt-3">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-md font-semibold text-gray-800">Amount To Recieve</span>
                                                                                <span className="text-lg font-semibold text-gray-800">₱{userData?.role === "Supplier" ? finalAmount.toLocaleString() : service_price}</span>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}


                                                                {userData?.role === "Event Planner" && (
                                                                    <>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-gray-600">Processing Fee ({process_fee * 100}% Xendit)</span>
                                                                            <span className="font-semibold">₱{processFee.toLocaleString()}</span>
                                                                        </div>
                                                                        {isDownPayment ? (
                                                                            <>
                                                                                <div>
                                                                                    <div className="border-t pt-2 border-gray-300 flex justify-between items-center">
                                                                                        <span className="text-md  text-gray-800">To Pay Now (Down Payment)</span>
                                                                                        <span className="text-lg font-semibold text-blue-600">₱{contract_transaction?.length > 0 ? 0 : downpayment.toLocaleString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-md text-gray-800">Next Payment (Balance)</span>
                                                                                        <span className="text-lg font-semibold text-orange-600">₱{contract_transaction?.length > 1 ? 0 : nextpayment.toLocaleString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div>
                                                                                <div className="border-t pt-2 border-gray-300 flex justify-between items-center">
                                                                                    <span className="text-md  text-gray-800">To Pay Now (Full Payment)</span>
                                                                                    <span className="text-lg font-semibold text-blue-600">₱{contract_transaction?.length > 0 ? 0 : contract.service_plan.service_price.toLocaleString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                    </>
                                                                )}

                                                                <div className="border-t border-gray-300 mt-12 mb-1 pt-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className='flex gap-2 items-baseline'>
                                                                            <span className="text-lg font-semibold text-gray-800">Total Paid by Planner</span>
                                                                            <span className="text-md text-gray-600">(Not incl. fees)</span>
                                                                        </div>
                                                                        <span className="text-2xl font-semibold text-green-600">₱{not_include_fees.toLocaleString()}</span>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                            <p className='text-sm mt-4 text-gray-600'>
                                                                Note: Your payment is securely processed via Xendit. The downpayment is received by our platform and only released to the supplier once confirmed
                                                            </p>
                                                        </div>



                                                        {/* <div className='relative top-8 w-full rounded-2xl p-1 border border-gray-600 h-5'>
                                                                    <div className={`transition-all bg-green-500 h-2.5 rounded-2xl`} style={{ width: `${(totalpaid / netAmount) * 100}%`}}></div>
                                                                </div> */}
                                                    </div>

                                                </div>

                                                <div className={`w-full mt-5 flex flex-col px-7 py-7 rounded-lg transition-all duration-200 shadow-md border border-gray-300 `}
                                                >
                                                    <div className='flex gap-2 items-center'>
                                                        <ArrowLeftRight className='text-blue-600' />
                                                        <p className="font-bold text-lg">Recent Transactions</p>
                                                    </div>

                                                    <div className={`flex flex-col mt-5 gap-3 overflow-y-auto ${transactions.length > 2 && 'h-[200px]'}`}>
                                                        {transactions.map((t, i) => (
                                                            <div className='bg-gray-50 border border-gray-200 shadow-lg rounded-lg py-5 px-6 flex items-center justify-between'>
                                                                <div className='flex flex-col space-y-2'>
                                                                    <div className='flex items-baseline gap-2'>
                                                                        <span className='font-semibold'>Payment Transaction</span>
                                                                        <span className={`py-1 w-18 text-xs rounded-full ${statusStyles[t.status.toLowerCase()]} block text-center `}>{t.status}</span>
                                                                    </div>
                                                                    <span className='text-gray-500 text-sm'>{t?.created_at?.toDate().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>

                                                                <span className='text-gray-800 font-semibold'>₱ {t.amount}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>


                                    <div className='flex mb-2 relative bottom-3 right-10'>
                                        <div className='flex left-20 gap-2 relative '>
                                            <button
                                                onClick={handleChat}
                                                className=" transition-all duration-50 text-sm items-center hover:bg-gray-700 py-2 px-5 rounded-md bg-gray-600 text-white"
                                            >
                                                {userData?.role === "Supplier"
                                                    ? `Message Planner`
                                                    : `Message Supplier`}
                                            </button>

                                            <ReportModal contractData={contract} userData={userData} eventData={eventData} supplierData={supplierData} />
                                        </div>
                                        {userData?.role != "Supplier" && contract?.status !== "Completed" && (
                                            <>
                                                {(total_paid - total_fees) === service_price && deliveries?.length > 0 && (
                                                    <div className='flex justify-end ml-auto gap-3 '>
                                                        {/* <button className='transition-all duration-50 text-sm items-center hover:bg-gray-700 py-2 px-5 rounded-md bg-gray-600 text-white'>Contact Supplier</button> */}

                                                        <button
                                                            onClick={(e) => handleRelease(e, platformFee, netAmount)}
                                                            disabled={isReleasing}
                                                            className={`transition-all duration-50 text-sm items-center py-2 px-5 rounded-md text-white ${isReleasing ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                                                }`}
                                                        >
                                                            {isReleasing ? (
                                                                <div className='flex items-center gap-2'>
                                                                    Processing...
                                                                    <div className='border-t-2 h-4 w-4 rounded-full animate-spin'></div>
                                                                </div>
                                                            ) : (
                                                                'Complete Transaction'
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                {contract?.status === "Approved" && (total_paid - total_fees) !== service_price && (
                                                    <button
                                                        onClick={() => handlePayment(downpayment, nextpayment, processFee)}
                                                        disabled={(contractDeliveries.length === 0 && contract_transaction.length > 0) || isProcessing}
                                                        className={`px-7 py-2 ${isProcessing
                                                            ? 'bg-blue-300'
                                                            : (contractDeliveries.length === 0 && contract_transaction.length > 0)
                                                                ? 'bg-blue-300 cursor-not-allowed'
                                                                : 'bg-blue-500 hover:bg-blue-600'
                                                            } text-white text-sm rounded flex justify-end items-end ml-auto `}
                                                    >
                                                        {isProcessing ? (
                                                            <div className='flex items-center gap-3 '>
                                                                Processing..
                                                                <div className='border-t-2 h-4 w-4 rounded-full animate-spin'></div>
                                                            </div>
                                                        ) : (contractDeliveries.length === 0 && contract_transaction.length > 0) ? (
                                                            'Must deliver before pay'
                                                        ) : (
                                                            'Pay Contract'
                                                        )}
                                                    </button>
                                                )}

                                                {event_id === user_id && contract?.status === "Pending" && (
                                                    <button disabled={true} className='px-7 py-2 flex justify-end items-end ml-auto bg-gray-400 text-white text-sm rounded'>Awaiting Approval</button>
                                                )}


                                            </>
                                        )}

                                        {supplier_id === user_id && contract?.status === "Pending" && (
                                            <div className='flex p-2 justify-end items-end ml-auto '>
                                                <RejectReview contract={contract} supplier={supplierData} event_id={eventData.id} supplier_id={supplierData.id} className={`transition duration-50 py-1 px-5 border rounded-md hover:bg-red-600 hover:text-white`} />
                                                <button onClick={() => handleApprove(contract?.id)} disabled={isSubmitting} className={`transition-all duration-50 px-7 py-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm rounded`}>{isSubmitting ?
                                                    <>
                                                        <div className='h-5 w-5 border-t-2 rounded-full animate-spin border-white'></div>
                                                    </> : 'Approve Offer'}
                                                </button>
                                            </div>
                                        )}
                                    </div>


                                </div>

                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}