import { collection, getDocs, onSnapshot } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"

export default function useSupplier() {

    const getSuppliers = async () => {
        try {
            const supplierSnapShot = await getDocs(collection(db, "shops"))
            return supplierSnapShot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        }
        
        catch (e) {
            console.error(e)
            return []
        }
    }

    const getReviews = async (id) => {
        try {

            const reviewSnapShot = await getDocs(collection(db, "shops", id, "reviews"))


            return reviewSnapShot.docs.map(rev => ({ id: rev.id, ...rev.data() }))
        }

        catch (e) {
            console.error(e)
        }
    }



    return {
        getSuppliers,
        getReviews
    }

}