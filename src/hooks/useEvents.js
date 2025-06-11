import Swal from "sweetalert2"
import { addDoc, collection, updateDoc, doc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useNavigate } from "react-router-dom"

export default function useEvents() {

    const navigate = useNavigate()

    const createEvent = (user, event_name, event_location, event_date, event_time, event_status, type, event_budget, event_description, tags) => {
        addDoc(collection(db, "Events"), {
            user_id: user.uid,
            event_name: event_name,
            event_location: event_location,
            event_date: event_date,
            event_time: event_time,
            event_status: event_status,
            event_type: type,
            event_budget: event_budget,
            event_description: event_description,
            event_categories: tags,
            createdAt: serverTimestamp()
        })
        Swal.fire({
            icon: 'success',
            title: 'Added',
            text: `${event_name}'s data has been added`,
            showConfirmButton: false,
            timer: 1000,
        })
    }

    const updateEvent = (id, event_name, event_location, event_date, event_time, event_status, event_type, event_budget, event_description, tags) => {
        try {
            updateDoc(doc(db, 'Events', id), {
                event_name: event_name,
                event_location: event_location,
                event_date: event_date,
                event_time: event_time,
                event_status: event_status,
                event_type: event_type,
                event_budget: event_budget,
                event_description: event_description,
                event_categories: tags,
                updatedAt: serverTimestamp()

            })
            Swal.fire({
                icon: 'success',
                title: 'Update',
                text: `${event_name} has been updated successfully.`,
                showConfirmButton: false,
                timer: 1000
            })
            navigate("/events")
        }
        catch (error) {
            console.log(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update',
                confirmButtonText: 'Continue',
                timer: 1000
            })
        }
    }

    const getEvent = async (id) => {
        try {
            const docRef = await getDoc(doc(db, "Events", id));

            if (docRef.exists()) {
                const data = docRef.data()
                return { id: docRef.id, ...data }

            }

        } catch (err) {
            console.error("Error fetching document:", err);
        } finally {
            // setLoading(false);
        }

    }

    const deleteEvent = (id, setUserEvents) => {
        Swal.fire({
            icon: 'warning',
            title: 'are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it',
            cancelButtonText: 'No, Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteDoc(doc(db, "Events", id))
                setUserEvents(prev => prev.filter(event => event.id !== id));
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: `Event has been deleted.`,
                    showConfirmButton: false,
                    timer: 1000,
                })
            }
        })
    }

    return {
        createEvent,
        updateEvent,
        getEvent,
        deleteEvent
    }
}