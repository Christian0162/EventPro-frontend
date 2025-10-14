import { Dialog, DialogPanel } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { X, MessageSquare, Clock } from 'lucide-react'
import { db } from '../firebase/firebase'
import { formatDistanceToNow } from 'date-fns'
import { useFetchUsers } from '../hooks/useUsers'
import { useFetchUserProfiles } from '../hooks/useProfile'
import { useFetchSuppliers } from '../hooks/useSupplier'

export default function NotificationModal({ notification }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const { users } = useFetchUsers()
    const { userProfiles } = useFetchUserProfiles()
    const { suppliers } = useFetchSuppliers()
    const [senderData, setSenderData] = useState([])

    const selectedUser = users?.find(u => u.id === notification.sender_id)

    useEffect(() => {
        if (selectedUser?.role === "Event Planner") {
            const userProfile = userProfiles?.find(u => u.id === selectedUser?.id)
            setSenderData(userProfile)
        }
        else {
            const supplierProfile = suppliers?.find(s => s.id === selectedUser?.id)
            setSenderData(supplierProfile)
        }
    }, [suppliers, selectedUser, userProfiles])

    console.log(senderData)

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    const updateNotif = async () => {
        await updateDoc(doc(db, "notifications", notification.id), {
            unread: false
        })
    }

    const deleteNotif = async (id) => {
        await deleteDoc(doc(db, "notifications", id))
    }

    return (
        <>
            <button
                onMouseEnter={() => setIsHovered(notification.id)}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => { updateNotif(); open() }}
                className={`group relative w-full bg-white rounded-xl p-5 text-left shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${notification.unread
                    ? 'border-l-4 border-l-blue-500 border-slate-200'
                    : 'border-slate-200'
                    }`}
            >
                {/*Unread indicator */}
                {notification.unread && isHovered !== notification.id && (
                    <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                )}

                <div className="flex items-start gap-4">
                    {/* Avatar with icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold bg-gradient-to-tr from-blue-500 to-blue-700 shadow-md">
                        {senderData?.profile_pic || senderData?.supplier_background_image ? (
                            <img src={senderData?.profile_pic || senderData?.supplier_background_image} alt="" className='h-full w-full rounded-full object-cover' />
                        ) : (
                            notification.avatar
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className={`font-semibold text-base leading-snug ${notification.unread ? 'text-gray-900' : 'text-gray-700'
                                }`}
                        >
                            {notification.title}
                        </h3>
                        <p
                            className={`mt-1 text-sm line-clamp-2 ${notification.unread ? 'text-gray-700' : 'text-gray-500'
                                }`}
                        >
                            {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.createdAt.toDate().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                            onClick={() => deleteNotif(notification.id)}
                            className="p-2 block text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </button>

            {/* Modal */}
            <Dialog
                open={isOpen}
                as="div"
                className={'relative z-[999] focus:outline-none'}
                onClose={close}
            >
                {/* Overlay */}
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

                <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full max-w-2xl relative rounded-2xl bg-white shadow-2xl transform transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
                    >
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X size={18} className="text-gray-600" />
                        </button>

                        <div className="p-8">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full shadow-sm mb-4">
                                    <MessageSquare size={28} className="text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {notification.title}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {notification.createdAt
                                        ? formatDistanceToNow(
                                            new Date(notification.createdAt.seconds * 1000),
                                            { addSuffix: true }
                                        )
                                        : 'recent'}
                                </p>
                            </div>

                            {/* Message Section */}
                            <div className="mt-6 text-left">
                                <h3 className="text-sm font-medium text-gray-800 mb-2">Message</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 shadow-sm">
                                    {notification.message || "No message available."}
                                </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="mt-6 text-left">
                                <h3 className="text-sm font-medium text-gray-800 mb-2">Feedback</h3>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 shadow-sm">
                                    {notification.feedback || "No feedback provided."}
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    )
}
