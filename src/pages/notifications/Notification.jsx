import { useEffect, useState } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';

export default function Notification() {

    const [notifications, setNotications] = useState([])

    useEffect(() => {

        const q = query(collection(db, "Notifications"),
            where("user_id", "==", auth.currentUser.uid),
            orderBy("timestamp", "desc")
        )

        const unsubscribe = onSnapshot(q, (onsnapshot) => {
            const notifs = onsnapshot.docs.map(notif => ({ id: notif.id, ...notif.data() }))
            setNotications(notifs)
        })

        return () => unsubscribe()

    }, [])


    return (
        <div className="">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Notifications
                </h1>
            </div>


            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`group relative bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${notification.unread
                            ? 'border-l-4 border-l-blue-500 border-slate-200'
                            : 'border-slate-200'
                            }`}
                    >
                        {/* Unread indicator */}
                        {/* {notification.unread && (
                            <div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        )} */}

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
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
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