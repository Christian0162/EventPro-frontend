import { Dialog, DialogPanel, Button } from '@headlessui/react'
import { useState } from 'react'
import { X, Package } from 'lucide-react'
import UploadWidget from './UploadWidgen'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import Swal from 'sweetalert2'

export default function SubmissionModal({ contract, supplierData, eventData }) {
    const [isOpen, setIsOpen] = useState(false)
    const [picture, setPicture] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [note, setNote] = useState('')

    console.log(contract.id)

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await addDoc(collection(db, "deliveries"), {
                contract_id: contract?.id,
                supplier_id: contract?.supplier_id,
                status: "Pending",
                submitted_at: serverTimestamp(),
                delivered_date: serverTimestamp(),
                planned_date: eventData.event_date.date_value,
                confirmed_at: null,
                notes: note,
                proof: picture,
                created_at: serverTimestamp(),
                updated_at: null,
            })

            await addDoc(collection(db, "notifications"), {
                avatar: supplierData.supplier_name.charAt(0).toUpperCase(),
                message: `The supplier "${supplierData.supplier_name}" submitted a delivery for contract ID: ${contract?.id}.`,
                createdAt: serverTimestamp(),
                referenced_type: 'contract',
                referenced_id: contract?.id,
                title: 'New delivery submission received.',
                unread: true,
                user_id: eventData.user_id
            })

            Swal.fire(
                'Submitted Successfully',
                'Your delivery has been submitted successfully.',
                'success'
            )

            setIsOpen(false)
            setNote('')
            setPicture([])
            setIsSubmitting(false)
        }
        catch (e) {
            console.error(e)
            setIsSubmitting(false)

            Swal.fire(
                'Submission Failed',
                'Something went wrong. Please try again.',
                'error'
            );
        }
    }

    return (
        <>
            <Button onClick={open} className={'transition-all duration-100 hover:bg-blue-700 px-6 py-2 text-sm rounded-md bg-blue-600 text-white '}>Submit Delivery</Button>

            <Dialog open={isOpen} as='div' className={'z-999 relative focus:outline-none'} onClose={close}>
                <div className="fixed inset-0 bg-black/25 " />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            <div className='relative'>
                                <button
                                    onClick={close}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            <div className='px-8'>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="mt-8 inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <Package size={32} className="text-blue-600" />
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Submission</h2>

                                    <div className="mt-7">
                                        <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                                            Additional Information (Optional)
                                        </label>
                                        <textarea
                                            onChange={(e) => setNote(e.target.value)}
                                            name="additional_information"
                                            className="w-full p-3 border focus:outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
                                            placeholder="Enter any additional notes..."
                                        />
                                    </div>

                                    <div className='flex items-center justify-between mt-5'>
                                        <UploadWidget className={`w-60`} setPicture={setPicture} />
                                        <button onClick={() => handleSubmit()} disabled={isSubmitting || picture.length === 0} className={`transition-all py-2 px-5 ${isSubmitting || picture.length === 0 ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} rounded-md text-white`}>Submit</button>
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