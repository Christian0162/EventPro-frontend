import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import bcrypt from "bcryptjs";
import Swal from "sweetalert2";

export default function useAuth() {


    const login = async (auth, email, password, setError) => {
        try {
            const currentUser = await signInWithEmailAndPassword(auth, email, password);

            const user = currentUser.user

            if (user) {
                await updateDoc(doc(db, "Users", user.uid), {
                    lastLoginAt: serverTimestamp()
                })
                Swal.fire({
                    icon: 'success',
                    title: 'Signed in',
                    text: 'Successfully Signed in',
                    timer: 1000,
                    showConfirmButton: false
                })
            }
            else {
                console.log('no user found')
            }
        }
        catch (e) {
            if (e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-credentials') {
                setError("invalid credentials")
            }
        }
    }

    const logout = (auth) => {
        return signOut(auth)
    }

    const register = async (auth, email, password, firstName, lastName, role, setErrorEmail) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)

            const user = userCredential.user.uid

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            await setDoc(doc(db, "Users", user), {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: hashedPassword,
                role: role,
                isApproved: false,
                createdAt: serverTimestamp()
            })

        }
        catch (e) {
            if (e.code === "auth/email-already-in-use") {
                setErrorEmail("The email is already exist.");
                return
            }
            else { setErrorEmail('') }
        }
    }

    return {
        login,
        logout,
        register
    }
}