import { doc, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"

export const useFetchUserProfileById = (id) => {
    const [userProfile, setUserProfile] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!id) return

        console.log(id)
        setIsLoading(true)
        try {
            const unsubscribe = onSnapshot(doc(db, "userProfiles", id), (onsnapshot) => {
                setUserProfile(onsnapshot.data())
                setIsLoading(false)
            })

            return () => unsubscribe()
        }
        catch (e) {
            console.error(e)
        }
    }, [id])

    return {
        userProfile,
        isLoading
    }
}