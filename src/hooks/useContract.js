import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useEffect, useState } from "react"

export const useFetchContractPaymentById = (id, event_id, supplier_id) => {
    const [payments, setPayments] = useState([])

    useEffect(() => {
        if (!id) { return }

        const q = query(
            collection(db, "contracts", id, "payments"),
            where("event_id", "==", event_id),
            where("supplier_id", "==", supplier_id)
        )

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const paymentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPayments(paymentsData)
        })

        return () => unsubscribe()
    }, [id, event_id, supplier_id])

    return { payments }
}

export const useFetchContract = () => {
    const [contracts, setContracts] = useState([])

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "contracts"), (onsnapshot) => {
            const contracts = onsnapshot.docs.map(contracts => ({ id: contracts.id, ...contracts.data() }))
            setContracts(contracts)
        })

        return () => unsubscribe()
    }, [])

    return { contracts }
}
