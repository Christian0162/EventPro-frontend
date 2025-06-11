import { Link } from "react-router-dom";

export default function VerificationCheckbox({ onChange, checked }) {
    return (
        <div className="flex space-x-3 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm w-full text-sm text-gray-800">
            <input
                type="checkbox"
                id="confirm"
                name="confirm"
                required
                checked={checked}
                onChange={onChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirm" className="flex-1 cursor-pointer">
                <p className="font-semibold">
                    I confirm that all information provided is accurate and authentic.
                </p>
                <p className="mt-1">
                    I understand that submitting false information may result in rejection of verification.
                </p>
                <p className="mt-3 text-gray-600">
                    By submitting this form, you agree to our{' '}
                    <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                        verification process and terms of service
                    </Link>.
                </p>
            </label>
        </div>
    );
};

