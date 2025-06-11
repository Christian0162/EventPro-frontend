import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, lazy, Suspense } from "react";
import { auth } from "./firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import Loading from "./components/Loading";
import { HeadProvider } from "react-head";


const GuestLayout = lazy(() => import("./layouts/GuestLayout"))
const AuthLayout = lazy(() => import("./layouts/AuthLayout"))
const HomePage = lazy(() => import("./pages/HomePage"))
const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Review = lazy(() => import("./pages/admin/Review"));
const SupplierVerification = lazy(() => import("./pages/suppliers/SupplierVerification"));
const Event = lazy(() => import("./pages/events/Event"));
const CreateEvent = lazy(() => import("./pages/events/CreateEvent"));
const EditEvent = lazy(() => import("./pages/events/EditEvent"));
const Supplier = lazy(() => import("./pages/suppliers/Supplier"));
const SupplierShop = lazy(() => import("./pages/suppliers/SupplierShop"));
const Favorites = lazy(() => import("./pages/favorites/Favorites"));
const ChatWindow = lazy(() => import("./pages/chat/ChatWindow"));
const Notification = lazy(() => import("./pages/notifications/Notification"));
const Error404 = lazy(() => import("./components/Error404"));


function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setIsLoading(true);
                if (user) {
                    setUser(user);
                    const userDocRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }

                    else {
                        console.warn("No user data found");
                        setUserData(null);
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (error) {

                console.error("Error in auth state change:", error);
                setUser(null);
                setUserData(null);

            } finally {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [user])

    if (isLoading) {
        return <Loading />
    }

    return (
        <>
            <HeadProvider>
                <BrowserRouter>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={
                                <GuestLayout user={user} userData={userData}>
                                    <HomePage user={user} />
                                </GuestLayout>}></Route>

                            <Route path="/register" element={
                                <GuestLayout user={user} userData={userData}>
                                    <Register user={user} />
                                </GuestLayout>
                            }></Route>

                            <Route path="/login" element={
                                <GuestLayout user={user} userData={userData}>
                                    <Login user={user} />
                                </GuestLayout>}>
                            </Route>

                            <Route path="/dashboard" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <Dashboard user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/admin/dashboard" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <AdminDashboard user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/review/:id" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <Review user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/verify" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <SupplierVerification user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/events" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <Event user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/events/create" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <CreateEvent user={user} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/events/edit/:id" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <EditEvent user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/suppliers" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <Supplier user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/shop" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <SupplierShop user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/favorites" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <Favorites user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/chats" element={user ? (
                                <AuthLayout user={user} userData={userData}>
                                    <ChatWindow user={user} userData={userData} />
                                </AuthLayout>
                            ) : <Navigate to="/login" />} />

                            <Route path="/chats/:id" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <ChatWindow user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="/notification" element={user ?
                                <AuthLayout user={user} userData={userData}>
                                    <Notification user={user} userData={userData} />
                                </AuthLayout> : <Navigate to={'/login'} />}></Route>

                            <Route path="*" element={<Error404 user={user} userData={userData} />}></Route>

                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </HeadProvider >

        </>
    )
}

export default App;
