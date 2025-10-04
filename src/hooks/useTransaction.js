import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"

export const useFetchAllTransaction = (user_id) => {
    const [transactions, setTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user_id) return
        
        setIsLoading(true)

        const q = query(collection(db, "transactions"),
            where("user_id", "==", user_id),
            orderBy('created_at', 'desc')
        )

        try {
            const unsubscribe = onSnapshot(q, (onsnapshot) => {
                setTransactions(onsnapshot.docs.map(transaction => ({ id: transaction.id, ...transaction.data() })))
                setIsLoading(false)

            })

            return () => unsubscribe()

        }

        catch (e) {
            console.error(e)
            setIsLoading(false)
        }

    }, [user_id])

    return { transactions, isLoading }
}