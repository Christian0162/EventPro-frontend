import { Dialog, DialogPanel, } from '@headlessui/react'
import { useState } from 'react'
import { deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { X, MessageSquare, Clock } from 'lucide-react'
import { db } from '../firebase/firebase'

export default function NotificationModal({ notification }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

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
                className={`group relative w-full bg-white rounded-xl p-6 text-left shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${notification.unread
                    ? 'border-l-4 border-l-blue-500 border-slate-200'
                    : 'border-slate-200'
                    }`}
            >
                {/*Unread indicator */}
                {notification.unread && isHovered !== notification.id && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}

                <div className="flex items-start gap-4">
                    {/* Avatar with icon */}
                    <div className="relative">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-semibold text-lg bg-blue-600`}>
                            {notification.avatar}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className={`font-semibold text-slate-900 ${notification.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {notification.title}
                                </h3>
                                <p className={`mt-1 text-sm ${notification.unread ? 'text-slate-700' : 'text-slate-500'}`}>
                                    {notification.message}
                                </p>
                                <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {notification.timestamp.toDate().toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span onClick={() => deleteNotif(notification.id)} className="p-2 block text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </button>
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

                            <div className='p-8'>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <MessageSquare size={32} className="text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{notification.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {notification.timestamp.toDate().toLocaleString()}
                                    </p>
                                </div>

                                {notification.feedback && (
                                    <div className='w-full h-full bg-gray-100 rounded-2xl py-10'>{notification.feedback}</div>
                                )}

                                {!notification.feedback && (<>
                                    <h4 className="font-semibold text-gray-600 mb-1">Feedback:</h4>
                                    <div className='w-full h-full bg-gray-100 rounded-2xl py-10 flex justify-center text-gray-500'>No feedback</div>
                                </>
                                )}

                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}