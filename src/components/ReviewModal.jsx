import { Button, Dialog, DialogPanel, } from '@headlessui/react'
import { useState } from 'react'
import { X, Star, User, ThumbsUp, MessageSquare } from 'lucide-react'
import { addDoc, collection, query, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'
import Swal from 'sweetalert2'

    export default function ReviewModal({ supplier_id, event_name }) {
        const [isOpen, setIsOpen] = useState(false)
        const [rating, setRating] = useState(0)
        const [hoverRating, setHoverRating] = useState(0)
        const [reviewText, setReviewText] = useState('')
        const [reviewerName, setReviewerName] = useState('')
        const [isSubmitting, setIsSubmitting] = useState(false)

        function open() {
            setIsOpen(true)
        }

        function close() {
            setIsOpen(false)
            // Reset form when closing
            setRating(0)
            setHoverRating(0)
            setReviewText('')
            setReviewerName('')
            setIsSubmitting(false)
        }

        function handleStarClick(starRating) {
            setRating(starRating)
        }

        function handleStarHover(starRating) {
            setHoverRating(starRating)
        }

        function handleStarLeave() {
            setHoverRating(0)
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            setIsSubmitting(true)
            Swal.fire({
                title: 'Are you sure',
                text: 'Do you want to submit this for review?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it',
                cancelButtonText: 'Cancel'
            }).then(async (result) => {
                try {
                    if (result.isConfirmed) {
                        await addDoc(collection(db, "Shops", supplier_id, 'Reviews'), {
                            event_id: auth.currentUser.uid,
                            event_name: event_name,
                            supplier_id: supplier_id,
                            rating: rating,
                            comment: reviewText,
                            createdAt: serverTimestamp()
                        })

                        Swal.fire('Success', 'Review has been submitted', 'success')
                        close()
                        setIsSubmitting(false)
                    }
                }
                catch (e) {
                    console.log(e)
                }
            })
        }

        const getRatingText = (rating) => {
            const texts = {
                1: 'Poor',
                2: 'Fair',
                3: 'Good',
                4: 'Very Good',
                5: 'Excellent'
            }
            return texts[rating] || ''
        }

        return (
            <>
                <Button onClick={open} className={'transition-all duration-100 hover:bg-blue-700 px-6 py-1 text-sm rounded-md bg-blue-600 text-white '}>Review</Button>

                <Dialog open={isOpen} as='div' className={'z-50 relative focus:outline-none'} onClose={close}>
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
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h2>
                                        <p className="text-gray-600">Share your experience with others</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Rating Section */}
                                        <div className="text-center">
                                            <label className="block text-lg font-semibold text-gray-900 mb-4">
                                                How would you rate your experience?
                                            </label>
                                            <div className="flex justify-center items-center space-x-2 mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => handleStarClick(star)}
                                                        onMouseEnter={() => handleStarHover(star)}
                                                        onMouseLeave={handleStarLeave}
                                                        className="transition-all duration-200 transform hover:scale-110"
                                                    >
                                                        <Star
                                                            size={35}
                                                            className={`${star <= (hoverRating || rating)
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                                } transition-colors duration-200`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            {rating > 0 && (
                                                <p className="text-lg font-medium text-gray-700">
                                                    {getRatingText(rating)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Name Input */}
                                        <div>
                                            <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Name (Optional)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="reviewer-name"
                                                    value={event_name}
                                                    onChange={(e) => setReviewerName(e.target.value)}
                                                    placeholder="Enter your name"
                                                    className="w-full pl-5 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Review Text */}
                                        <div>
                                            <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Review
                                            </label>
                                            <textarea
                                                id="review-text"
                                                rows={5}
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                placeholder="Tell us about your experience..."
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                            />
                                            <div className="text-right text-sm text-gray-500 mt-1">
                                                {reviewText.length}/500
                                            </div>
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="flex space-x-4 pt-6">
                                            <button
                                                type="button"
                                                onClick={close}
                                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || rating === 0}
                                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Submitting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ThumbsUp size={20} />
                                                        <span>Submit Review</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                        <p className="text-sm text-gray-500">
                                            Your review helps others make informed decisions
                                        </p>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </>
        )
    }