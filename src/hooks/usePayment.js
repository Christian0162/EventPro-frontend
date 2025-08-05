import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { useState, useRef,  } from "react"
import { db } from "../firebase/firebase"
import Swal from "sweetalert2"

export const useCreatePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false)
    const payment_window_ref = useRef()

    const createPayment = async (payment_data) => {

        // console.log(payment_data)
        setIsProcessing(true)

        const payment_terms = await Swal.fire({
            title: '<strong class="text-2xl font-bold text-gray-800">Payment Terms and Conditions</strong>',
            icon: 'info',
            html: `
            <div class="text-left max-h-[300px] overflow-y-auto pr-2">
            <h4 class="text-lg font-semibold text-gray-700 mt-4">1. Payment Methods</h4>
            <p class="text-gray-600 mb-3">We accept Visa, MasterCard, American Express, and PayPal.</p>
            
            <h4 class="text-lg font-semibold text-gray-700 mt-4">2. Billing Cycle</h4>
            <p class="text-gray-600 mb-3">Payments are due monthly on the same date as your initial purchase.</p>
            
            <h4 class="text-lg font-semibold text-gray-700 mt-4">3. Late Payments</h4>
            <p class="text-gray-600 mb-3">A late fee of 5% will be applied to payments received more than 7 days after the due date.</p>
            
            <h4 class="text-lg font-semibold text-gray-700 mt-4">4. Refund Policy</h4>
            <p class="text-gray-600 mb-3">Refunds are available within 30 days of purchase for unused services.</p>
            
            <h4 class="text-lg font-semibold text-gray-700 mt-4">5. Automatic Renewal</h4>
            <p class="text-gray-600 mb-3">Your subscription will automatically renew unless canceled at least 24 hours before the end of the current period.</p>
            <div class="flex items-center">
            <input type="checkbox" id="acceptTerms" class="mt-1 mr-2">
            <label for="acceptTerms" class="text-gray-700">I agree to the payment terms and conditions</label>
            </div>
            </div>
      `,
            showCancelButton: true,
            confirmButtonText: "Pay Contract",
            showConfirmButton: true,
            width: '800px',
            preConfirm: () => {
                const isChecked = document.getElementById("acceptTerms").checked

                if (!isChecked) {
                    Swal.showValidationMessage("You must accept the terms to proceed")
                    return false
                }

                return true;
            }

        })

        if (payment_terms.isConfirmed) {
            try {
                const response = await fetch("http://127.0.0.1:8000/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        external_id: payment_data.external_id,
                        net_amount: payment_data.net_amount,
                        payer_email: payment_data.event_email,
                        payment_method: payment_data.payment_method,
                    })
                })

                const data = await response.json()

                console.log(data)
                const invoice_id = data?.data?.id

                // window.location.href = data.invoice_url
                payment_window_ref.current = window.open(data.invoice_url, "_blank")

                const checkStatus = setInterval(async () => {
                    const res = await fetch(`http://127.0.0.1:8000/check-status?id=${invoice_id}`)
                    const status = await res.json()

                    try {
                        if (status.status === "PAID") {
                            setIsProcessing(false)
                            // await updateDoc(doc(db, "contracts", payment_data.contract_id), {
                            //     status: "PAID"
                            // })
                            Swal.fire('Payment Successful', 'Your payment has been processed successfully.', 'success')

                            await addDoc(collection(db, "contracts", payment_data.contract_id, "payments"), {
                                external_id: payment_data.external_id,
                                contract_id: payment_data.contract_id,
                                event_name: payment_data.event_name,
                                event_id: payment_data.event_id,
                                supplier_id: payment_data.supplier_id,
                                payment_method: payment_data.payment_method,
                                event_email: payment_data.event_email,
                                event_contact: payment_data.contact_number ?? 0,
                                total_amount: payment_data.total_amount,
                                service_fee: payment_data.service_fee,
                                process_fee: payment_data.process_fee,
                                net_amount: payment_data.net_amount,
                                status: "PAID",
                                created_at: serverTimestamp()
                            })
                            clearInterval(checkStatus)
                        }

                        else if (status.status === "EXPIRED") {
                            setIsProcessing(false)
                            Swal.fire('Payment Expired', 'Your payment link has expired. Please try again.', 'error')
                            clearInterval(checkStatus)
                        }
                    }
                    catch (e) {
                        console.error(e)
                        clearInterval(checkStatus)
                    }

                    console.log(status)
                }, 3000)

            }
            catch (e) {
                console.error(e)
                setIsProcessing(false)

            }

        }
        else {
            setIsProcessing(false)
        }

    }

    return { createPayment, isProcessing }
}
