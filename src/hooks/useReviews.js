import { collection, getDocs, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"
import { useFetchSuppliers } from "./useSupplier"

export const useFetchReviews = () => {
    const [reviews, setReviews] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { suppliers } = useFetchSuppliers()

    useEffect(() => {
        try {
            const reviewData = {}
            const fetchAllReviews = async () => {
                await Promise.all(suppliers.map(async (suppliers) => {
                    const reviewSnapShot = await getDocs(collection(db, "shops", suppliers.id, "reviews"))

                    reviewData[suppliers.id] = reviewSnapShot.docs.map(review => ({ id: review.id, ...review.data() }))

                }))


                setReviews(reviewData)
            }

            fetchAllReviews()

        }

        catch (e) {
            console.error(e)
            setIsLoading(false)
        }

        finally {
            setIsLoading(false)
        }
    }, [suppliers])

    return { reviews, isLoading }
}

export const useFetchReviewsById = (id) => {
    const [reviews, setReviews] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        try {
            const unsubscribe = onSnapshot(collection(db, "shops", id, "reviews"), (onsnapshot) => {
                setReviews(onsnapshot.docs.map(review => ({ id: review.id, ...review.data() })))
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

    return {reviews, isLoading}
}