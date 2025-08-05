import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import bcrypt from "bcryptjs";
import Swal from "sweetalert2";
import { useState } from "react";

export const useAuthLogin = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const login = async (auth, email, password) => {
        try {
            setIsLoading(true)

            const user = await signInWithEmailAndPassword(auth, email, password);

            if (user) {
                Swal.fire({
                    icon: 'success',
                    title: 'Signed in',
                    text: 'Successfully Signed in',
                    timer: 1000,
                    showConfirmButton: false
                })

                await updateDoc(doc(db, "users", user.user.uid), {
                    lastLoginAt: serverTimestamp()
                })

            }
            else {
                console.log('no user found')
                setIsLoading(true)

            }
        }
        catch (e) {
            if (e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-credentials') {
                setError("invalid credentials")
            }
        }

        finally {
            setIsLoading(false)
        }
    }

    return { login, isLoading, error }

}

export const useAuthLogout = () => {

    const logout = async (auth) => {

        Swal.fire({
            icon: 'success',
            title: 'Sign out',
            text: 'Successfully logout',
            timer: 1000,
            showConfirmButton: false

        })

        await signOut(auth)
    }

    return { logout }
}

export const useAuthRegister = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const register = async (auth, email, password, userData) => {
        try {
            setIsLoading(true)

            const user = await createUserWithEmailAndPassword(auth, email, password)

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            console.log(userData)

            if (user) {
                Swal.fire({
                    icon: 'success',
                    title: 'Signed in',
                    text: 'Successfully registered',
                    timer: 1000,
                    showConfirmButton: false
                })

                await setDoc(doc(db, "users", user.user.uid), {
                    first_name: userData?.first_name,
                    last_name: userData?.last_name,
                    email_address: email,
                    password: hashedPassword,
                    role: userData?.role,
                    status: userData?.role === "Event Planner" ? 'unverified' : '',
                    createdAt: serverTimestamp()
                })

                await setDoc(doc(db, "userProfiles", user.user.uid), {
                    first_name: userData?.first_name,
                    last_name: userData?.last_name,
                    email_address: email,
                    description: '',
                    profile_pic: '',
                    contact_number: '',
                    createdAt: serverTimestamp()
                })
            }

        }

        catch (e) {
            if (e.code === "auth/email-already-in-use") {
                setError("The email is already exist.");
                setIsLoading(false)
                return
            }
            else { setError('') }
        }

        finally {
            setIsLoading(false)
        }
    }

    return { register, isLoading, error }
}

