import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { useState } from "react";
import { doc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Swal from "sweetalert2";

export default function ReportModal({ onSuccess, eventData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [penalties, setPenalties] = useState({
        others: false,
        nonDelivery: false,
    });
    const [error, setError] = useState("");
    const [reason, setReason] = useState("");
    const [proofFiles, setProofFiles] = useState([]); // ✅ proof upload state

    const open = () => {
        setIsOpen(true);
        setError("");
        setReason("");
        setProofFiles([]);
    };

    const close = () => {
        if (loading) return;
        setIsOpen(false);
        setError("");
        setPenalties({
            lateDelivery: false,
            nonDelivery: false,
        });
        setReason("");
        setProofFiles([]);
    };

    const handleCheckboxChange = (e) => {
        const { id, checked } = e.target;
        setPenalties((prev) => ({
            ...prev,
            [id]: checked,
        }));
    };

    const handleProofUpload = (e) => {
        const files = Array.from(e.target.files);
        setProofFiles(files);
    };

    const handleSubmit = async () => {
        const { others, nonDelivery } = penalties;

        if (!others && !nonDelivery) {
            setError("Please select at least one issue.");
            return;
        }

        if (!reason.trim()) {
            setError("Please provide a brief review or reason for issuing the report.");
            return;
        }

        setError("");

        const penaltyDetails = [];
        if (others)
            penaltyDetails.push(`Others: ${reason.trim() || "No details provided."}`);

        if (nonDelivery)
            penaltyDetails.push(
                `Non-Delivery / No Service:
                - Full Refund of payment made.
                - Replacement Cost Coverage: Supplier shall shoulder any costs incurred by the client to secure an alternative service.
                - Direct Client Cost Recovery: Any additional costs directly resulting from the non-delivery must be reimbursed by the supplier.`
            );

        Swal.fire({
            title: "Confirm Issue Report",
            html: `
                <div style="text-align:left;">
                    <p><strong>Selected Issues:</strong></p>
                    <ul style="margin-left: 20px; text-align:left;">
                        ${penaltyDetails.map((d) => `<li>${d}</li>`).join("")}
                    </ul>
                    <p style="margin-top:10px;"><strong>Review/Reason:</strong> ${reason}</p>
                    <p style="margin-top:10px;"><strong>Proofs Attached:</strong> ${proofFiles.length} file(s)</p>
                </div>
                <p class="mt-3 text-gray-600">Are you sure you want to apply these issue details?</p>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Confirm",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: async () => {
                try {
                    setLoading(true);
                    // const deliveryRef = doc(db, "deliveries", deliveryId);
                    // await updateDoc(deliveryRef, {
                    //     status: "Damaged",
                    //     penalty_applied: penaltyDetails,
                    //     issue_reason: reason,
                    //     updated_at: serverTimestamp(),
                    // });

                    // await addDoc(collection(db, "notifications"), {
                    //     avatar: eventData?.event_name.charAt(0).toUpperCase(),
                    //     message: `The planner has reported issues with your delivery for the event "${eventData?.event_name}". Reason: "${reason}" Please review the penalties applied.`,
                    //     createdAt: serverTimestamp(),
                    //     referenced_type: "contract",
                    //     referenced_id: delivery?.contract_id,
                    //     title: "Delivery Issue Reported",
                    //     unread: true,
                    //     feedback: reason,
                    //     user_id: delivery?.supplier_id,
                    // });

                    // ✅ Optional: upload proofs to Firebase Storage (not yet implemented)
                    // You can add upload logic here if needed.

                    return true;
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                    return false;
                } finally {
                    setLoading(false);
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Issues Recorded",
                    text: "The delivery issues have been successfully applied.",
                    icon: "success",
                    confirmButtonColor: "#2563eb",
                });
                if (onSuccess) onSuccess();
                close();
            }
        });
    };

    return (
        <>
            <Button
                onClick={open}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                text-white py-2 px-5 rounded-md shadow-md hover:shadow-lg 
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                {loading ? "Processing..." : "Report"}
            </Button>

            <Dialog open={isOpen} as="div" className="relative z-1000 focus:outline-none" onClose={close}>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="overflow-hidden w-full max-w-2xl rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800">Report Issues</h2>
                                <button
                                    onClick={close}
                                    disabled={loading}
                                    className="text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <p className="text-gray-700 font-medium">Please select applicable issues:</p>




                                {/* Non-Delivery / No Service */}
                                <div className="p-3 border rounded-md">
                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="nonDelivery"
                                            checked={penalties.nonDelivery}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="mr-2 accent-blue-600"
                                        />
                                        <span className="font-medium text-gray-800">Non-Delivery / No Service</span>
                                    </label>
                                    <div className="text-sm text-gray-600 ml-6 space-y-1">
                                        <p>• Full Refund of payment made.</p>
                                        <p>• Replacement Cost Coverage: Supplier shall shoulder any costs incurred by the client to secure an alternative service.</p>
                                        <p>• Direct Client Cost Recovery: Any additional costs directly resulting from the non-delivery must be reimbursed by the supplier.</p>
                                    </div>
                                </div>

                                {/* Others (custom issue) */}
                                <div className="p-3 border rounded-md">
                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="lateDelivery"
                                            checked={penalties.lateDelivery}
                                            onChange={handleCheckboxChange}
                                            disabled={loading}
                                            className="mr-2 accent-blue-600"
                                        />
                                        <span className="font-medium text-gray-800">Others</span>
                                    </label>
                                    <p className="text-sm text-gray-600 ml-6">
                                        Please describe the issue or situation.
                                    </p>

                                    {/* When "Others" is checked, show input for description */}
                                    {penalties.lateDelivery && (
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Explain what happened or describe the issue in detail..."
                                            rows={3}
                                            disabled={loading}
                                            className="w-full mt-3 border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    )}
                                </div>

                                {/* ✅ Proof Upload */}
                                <div className="p-3 border rounded-md">
                                    <label className="font-medium text-gray-800 mb-1 block">Upload Proofs (images or documents)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleProofUpload}
                                        disabled={loading}
                                        className="w-full border border-gray-300 rounded-md p-2 text-gray-700 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    {proofFiles.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-2">{proofFiles.length} file(s) selected.</p>
                                    )}
                                </div>

                                {error && <p className="text-red-600 font-medium text-sm">{error}</p>}
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={close}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 
                                    hover:bg-gray-100 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`px-5 py-2 rounded-lg font-semibold text-white transition-all ${loading
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {loading ? "Saving..." : "Confirm"}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
