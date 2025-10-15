import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useEffect, useState } from "react"

export const useFetchAllContact = () => {
    const [contacts, setContacts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        try {
            const unsubscribe = onSnapshot(collection(db, "contacts"), (onsnapshot) => {
                const contracts = onsnapshot.docs.map(contracts => ({ id: contracts.id, ...contracts.data() }))
                setContacts(contracts)
            })

            return () => unsubscribe()
        }

        catch (e) {
            console.error(e)
            setIsLoading(false)
        }


    }, [])

    return { contacts, isLoading }
}
