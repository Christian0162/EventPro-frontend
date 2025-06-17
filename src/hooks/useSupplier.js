import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase"

export default function useSupplier() {

    const getSuppliers = async () => {
        try {
            const supplierSnapShot = await getDocs(collection(db, "Shops"))

            return supplierSnapShot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        }

        catch (e) {
            console.error(e)
        }
    }

    

    return {
        getSuppliers
    }

}