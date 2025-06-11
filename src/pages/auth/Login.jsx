import { Link } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../firebase/firebase";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Title } from "react-head";

export default function Login({ user }) {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null)
        setIsLoading(true);

        try {
            await login(auth, email, password, setError)
            setError(setError)
        }
        catch (error) {
            console.log(error.code)


        }

        setIsLoading(false);
    }

    if (user) {
        return <Navigate to={'/dashboard'} />;
    }

    return (
        <>
            <Title>Login</Title>

            <div className="flex w-full h-full justify-center items-center mt-10">
                <form onSubmit={handleSubmit}>
                    <div className="p-13 w-[30rem] shadow-2xl border border-gray-200 rounded-lg">
                        <div className="space-y-2 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold ">Welcome back</span>
                            <div>
                                <span className="text-gray-600"> Enter your credentials to access your account</span>
                            </div>
                        </div>
                        {/* email */}
                        <div className="flex flex-col mt-10 mb-5">
                            <label htmlFor="email" className="font-bold mb-3">Email</label>
                            <input type="email" name="email" id="email" className="py-2 border border-gray-500 rounded-md px-3 focus:ring-blue-600 focus:ring-1 focus:outline-none" placeholder="email@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <span className={`mt-1 ml-1 ${error ? 'block text-red-500' : 'hidden'}`}>{error}</span>
                        </div>

                        {/* password */}
                        <div className="flex flex-col mt-3">
                            <label htmlFor="password" className="font-bold mb-3">Password</label>
                            <input type="password" name="password" id="password" className="py-2 border border-gray-500 rounded-md px-3 focus:ring-blue-600 focus:ring-1 focus:outline-none" placeholder="******"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className={`mt-1 ml-1 ${error ? 'block text-red-500' : 'hidden'}`}>{error}</span>
                        </div>

                        <button className={`w-full py-2 rounded-md text-white text-md mt-4 ${isLoading ? 'bg-blue-300' : 'bg-blue-600'}`} disabled={isLoading}>{isLoading ? 'Logging in..' : 'Login'}</button>

                        <div className="text-center mt-8">
                            <span>Don't have an account? <Link to={'/register'} className="text-blue-500 hover:text-blue-700">Register</Link></span>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}