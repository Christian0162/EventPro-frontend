import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Star, BadgeCheck, Badge } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { useFetchUserProfileById } from '../hooks/useProfile';

export default function Profile({ userData }) {

    const [descriptionEditing, setDescriptionEditing] = useState(false)
    const [descriptionLoading, setDescriptionLoading] = useState(false)
    const [contactInformationEditing, setContactInformationEditing] = useState(false)
    const [contactInformationLoading, setContactInformationLoading] = useState(false)
    const [email_address, setEmail_address] = useState('')
    const [contact_number, setContact_number] = useState('')
    const [description, setDescription] = useState('')
    const { userProfile } = useFetchUserProfileById(userData?.id)

    const reviews = [
        {
            id: 1,
            initials: 'ET',
            name: 'Emma Thompson',
            timeAgo: '1 week ago',
            rating: 5,
            comment: 'Friendly and kind!'
        },
        {
            id: 2,
            initials: 'DC',
            name: 'David Chen',
            timeAgo: '2 weeks ago',
            rating: 4,
            comment: 'Great!'
        },
        {
            id: 3,
            initials: 'SR',
            name: 'Sophia Rodriguez',
            timeAgo: '3 weeks ago',
            rating: 4,
            comment: 'Exceed my expectations'
        }
    ];

    const StarRating = ({ rating }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                            ? 'fill-orange-400 text-orange-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "userProfiles", userData.id), (onsnapshot) => {
            const userProfile = onsnapshot.data()

            setContact_number(userProfile?.contact_number)
            setEmail_address(userProfile?.email_address)
            setDescription(userProfile?.description)
        })

        return () => unsubscribe()
    }, [])

    const handleDescription = async (e) => {
        e.preventDefault()
        setDescriptionLoading(true)

        try {
            await updateDoc(doc(db, "userProfiles", userData.id), {
                description: description
            })
        }

        catch (e) {
            console.error(e)
        }

        finally {
            setDescriptionLoading(false)
            setDescriptionEditing(false)
        }
    }

    const handleContactInformation = async (e) => {
        e.preventDefault()
        setContactInformationLoading(true)

        try {
            await updateDoc(doc(db, "userProfiles", userData.id), {
                contact_number: contact_number,
                email_address: email_address
            })
        }

        catch (e) {
            console.error(e)
        }

        finally {
            setContactInformationLoading(false)
            setContactInformationEditing(false)

        }
    }

    console.log(descriptionEditing)

    return (
        <div className="max-w-7xl mx-auto bg-white border border-gray-200 shadow-xl rounded-md p-5">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    {userProfile.profile_pic ? (
                        <img src={userProfile.profile_pic} alt="" className='h-20 w-20 rounded-full object-cover' />
                    ) : (
                        <div className='text-5xl h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-pink-600 text-white flex items-center justify-center'><span>{userData.first_name.charAt(0).toUpperCase()}</span></div>
                    )}                    <div>
                        <div className='flex items-center gap-2'>
                            <h1 className="text-2xl font-bold text-gray-900 capitalize">{userData.first_name}</h1>
                            {userData.verification_status === 'verified' && (
                                <BadgeCheck className='text-blue-600 mt-1' />
                            )}
                        </div>
                        <p className="text-md text-gray-500">{userData.role}</p>
                    </div>
                </div>
                {(userData.verification_status === 'unverified' || userData.verification_status === 'rejected') && (
                    <a href={'/verify'} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                        Verify
                    </a>
                )}

                {userData.verification_status === "pending" && (
                    <span className="flex group items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
                        <span className={`text-yellow-700 font-medium text-sm`}>Pending</span>
                    </span>
                )}
            </div>

            <div className="p-4 space-y-6">
                {/* Description Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900 mt-2 ml-1">Description</h2>
                        <button type='button' onClick={() => setDescriptionEditing(!descriptionEditing)} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                            {descriptionEditing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    {!descriptionLoading && (
                        <form className='flex flex-col' onSubmit={handleDescription}>
                            <textarea
                                className={`w-full p-3 rounded-lg bg-gray-50 text-gray-700 resize-none ${descriptionEditing ? 'border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'border border-gray-300'} `}
                                rows="3"
                                disabled={!descriptionEditing}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g Kian is an event planner for almost a decade."
                                value={description}
                            />
                            {descriptionEditing && (
                                <button className='px-7 py-2 mt-5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors self-center'>Save</button>
                            )}
                        </form>
                    )}

                    {descriptionLoading && (
                        <div className='flex justify-center items-center h-30'>
                            <div className='h-10 w-10 border-t border-blue-600 animate-spin rounded-full'></div>
                        </div>
                    )}
                </div>

                {/* Contact Information Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                        <button type='button' onClick={() => setContactInformationEditing(!contactInformationEditing)} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                            {contactInformationEditing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    {!contactInformationLoading && (
                        <form onSubmit={handleContactInformation} className='flex justify-center flex-col'>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email:
                                    </label>
                                    <input
                                        type="email"
                                        onChange={(e) => setEmail_address(e.target.value)}
                                        value={email_address}
                                        disabled={!contactInformationEditing}
                                        className={`w-full p-3 rounded-lg bg-gray-50 text-gray-700 ${contactInformationEditing ? 'border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'border border-gray-300'}`}
                                        placeholder='e.g test@gmail.com'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number:
                                    </label>
                                    <input
                                        type="tel"
                                        onChange={(e) => setContact_number(e.target.value)}
                                        value={contact_number}
                                        disabled={!contactInformationEditing}
                                        className={`w-full p-3 rounded-lg bg-gray-50 text-gray-700 ${contactInformationEditing ? 'border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'border border-gray-300'}`}
                                        placeholder="e.g 09487623432"
                                    />
                                </div>
                            </div>
                            {contactInformationEditing && (
                                <button className='px-7 py-2 mt-5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors self-center'>Save</button>
                            )}
                        </form>
                    )}
                    {contactInformationLoading && (
                        <div className='flex justify-center items-center h-40'>
                            <div className='h-10 w-10 border-t border-blue-600 animate-spin rounded-full'></div>
                        </div>
                    )}
                </div>

                {/* Recent Reviews Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>

                    <div className="space-y-4">
                        {reviews.map((review, index) => (
                            <div key={review.id}>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {review.initials}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{review.name}</h4>
                                                <p className="text-xs text-gray-500">{review.timeAgo}</p>
                                            </div>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                                    </div>
                                </div>

                                {index < reviews.length - 1 && (
                                    <hr className="my-4 border-gray-200" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

