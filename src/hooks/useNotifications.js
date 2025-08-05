import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"

export const useFetchNotificationsById = (id) => {
    const [isLoading, setIsLoading] = useState(false)
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        try {
            setIsLoading(true)
            const q = query(collection(db, "notifications"),
                where("user_id", "==", id),
                orderBy('createdAt', 'asc'))
            const unsubscribe = onSnapshot(q, (onsnapshot) => {
                setNotifications(onsnapshot.docs.map(notification => ({ id: notification.id, ...notification.data() })))
            })

            return () => unsubscribe()
        }

        catch (e) {
            console.error(e)
            setIsLoading(false)
        }

        finally {
            setIsLoading(false)
        }

    }, [id])

    return { notifications, isLoading }
}