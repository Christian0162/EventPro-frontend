import { CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetchAllTransaction } from "../hooks/useTransaction";
import { useEffect } from "react";
import Loading from "./Loading";

export default function PaymentSuccess({ userData }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const { transactions, isLoading } = useFetchAllTransaction(userData.id);

    const transaction_exist = transactions.filter(
        (trans) => trans.external_id === id
    );

    console.log(transaction_exist.length === 0)
    console.log(isLoading)

    useEffect(() => {
        if (!isLoading) {
            if (transaction_exist.length === 0) {
                navigate("/", { replace: true });
            }
        }
    }, [isLoading, transaction_exist, navigate]);

    if (isLoading) {
        return <div className="flex justify-center items-center py-[15rem]">
            <div className="h-12 w-12 border border-t-blue-600 rounded-full animate-spin "></div>
        </div>
    }

    return (
        <div className="flex items-center justify-center py-[5rem]">
            <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
                <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto" />

                <h1 className="text-2xl font-bold mt-4 text-gray-800">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mt-2">
                    Your payment for the contract has been successfully processed.
                </p>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={() => navigate("/orders")}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        View My Contract
                    </button>
                    <a
                        href="/"
                        className="block w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
