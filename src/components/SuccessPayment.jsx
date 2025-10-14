import { CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetchTransactionById } from "../hooks/useTransaction";
import { useEffect } from "react";
import Loading from "./Loading";
import ContractModal from "./ContractModal";
import { useFetchContract } from "../hooks/useContract";
import { useFetchEvents } from "../hooks/useEvents";
import { useFetchSuppliers } from "../hooks/useSupplier";

export default function PaymentSuccess({ userData }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const { transactions, isLoading } = useFetchTransactionById(userData.id);
    const { contracts } = useFetchContract()
    const { events } = useFetchEvents()
    const { suppliers } = useFetchSuppliers()


    const transaction_exist = transactions.filter(
        (trans) => trans.external_id === id
    );
    const selectedContracts = contracts.find(c => c.id === transactions[0].contract_id)
    const contractEvents = events.find(e => e.id === selectedContracts.event_id)
    const contractSupplier = suppliers.find(s => s.id === selectedContracts.supplier_id)

    console.log(contractSupplier)

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

                <div className="mt-10 flex gap-2 items-center justify-center">
                    {/* userData, event_id, supplier_id, eventData, supplierData, user_id */}
                    <a
                        href="/"
                        className="block border border-gray-300 text-sm hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Back to Home
                    </a>
                    <ContractModal userData={userData} event_id={contractEvents.id} eventData={contractEvents} supplierData={contractSupplier} supplier_id={contractSupplier.id} user_id={userData.id} />

                </div>
            </div>
        </div>
    );
}
