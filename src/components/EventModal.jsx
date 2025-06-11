import { Button, Dialog, DialogPanel, } from '@headlessui/react'
import { MapPin, X, Eye, CalendarDays, CircleDollarSign, Users, Mail } from 'lucide-react'
import { useState } from 'react'

export default function EventModal({ eventData }) {

    const [isOpen, setIsOpen] = useState(false)

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    console.log(eventData)
    return (
        <>
            <Button
                onClick={open}
            >
                <Eye size={24} className='transition-all duration-200 text-gray-400 group-hover:text-green-600' />
            </Button>

            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            <div className="relative">
                                <button
                                    onClick={close}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Company Name */}
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                        {eventData?.event_name.toUpperCase()}
                                    </h2>

                                    <div className="flex flex-col mb-4">
                                        <span className='text-sm font-bold text-gray-900 mb-2'>Event Budget:</span>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <MapPin size={16} className="mr-1" />
                                            <span>{eventData?.event_location || "Our Lady of Consolation Paris, San Roque, Philippines"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6">
                                    <div className="flex items-baseline flex-col font-bold text-gray-900">
                                        <span className='text-sm mb-1'>Event Budget:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            ₱{eventData?.event_budget || "5900"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Look for Supplier:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {eventData?.event_categories &&
                                            eventData.event_categories.map((category, index) => (
                                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {category}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600 text-sm">
                                        {eventData?.event_description || "Professional event planning and floral arrangement services for corporate events, weddings, and special occasions."}
                                    </p>
                                </div>

                                {/* Contact Information */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h3>
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Mail size={16} className="mr-2" />
                                        <span>{eventData?.contact_email || "test123@example.com"}</span>
                                    </div>
                                </div>

                                {/* Event Details (if available) */}
                                {eventData?.event_date && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Event Details</h3>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <CalendarDays size={16} className="mr-2" />
                                                <span>{eventData.event_date.date_preview?.join(", ")}</span>
                                            </div>
                                            {eventData.event_time && (
                                                <div className="ml-6 text-gray-500">
                                                    {eventData.event_time.previewStartAndEnd}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Close Button */}
                                <button
                                    onClick={close}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}