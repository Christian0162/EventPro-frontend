import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { collection, getDocs, onSnapshot, orderBy, query, updateDoc, where, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import NotificationModal from '../../components/NotificationModal';
import { useFetchNotificationsById } from '../../hooks/useNotifications';

export default function Notification({ userData }) {

    const { notifications } = useFetchNotificationsById(userData.id)
    const [isReading, setIsReading] = useState(false)

    const markAllAsRead = async () => {
        const unread = notifications.filter(notification => notification.unread)

        setIsReading(true)
        try {
            for (const updateUnread of unread) {
                await updateDoc(doc(db, "notifications", updateUnread.id), {
                    unread: false
                })
            }
        }
        catch (e) {
            console.error(e)
        }
        finally {
            setIsReading(false)

        }
    }

    return (
        <div className="">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Notifications
                </h1>
                <button onClick={() => markAllAsRead()} className='transition-all duration-200 flex items-center bg-blue-600 hover:bg-blue-700 py-2 px-5 gap-2 text-white rounded-xl'>
                    Mark All As Read
                    <Check size={20} className='text-white' />
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <NotificationModal key={notification.id} notification={notification} />
                ))}
            </div>

            {/* Empty state placeholder */}
            {notifications.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications yet</h3>
                    <p className="text-slate-500">When you have notifications, they'll appear here.</p>
                </div>
            )}

            {/* Load More */}
            {notifications.length > 4 && (
                <div className="text-center mt-8">
                    <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg">
                        Load More Notifications
                    </button>
                </div>
            )}
        </div>
    );
}