"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const updateHireStatus = async () => {
            const session_id = searchParams.get('session_id');
            const hireId = searchParams.get('hireId');

            if (!hireId) {
                setLoading(false);
                setError('Hire ID not found in URL. Please contact support.');
                return;
            }

            try {
                const response = await fetch(`/api/hire/${hireId}/success`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ session_id }),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setSuccess(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        updateHireStatus();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Processing Payment</h2>
                        <p className="text-gray-600 mt-2">Please wait while we confirm your payment...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-red-100 rounded-full p-4 mb-4">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Payment Error</h2>
                        <p className="text-red-600 mt-2 text-center">{error}</p>
                        <Link href="/dashboard" className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition-colors">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="flex flex-col items-center justify-center">
                    <div className="bg-green-100 rounded-full p-4 mb-4">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Payment Successful</h2>
                    <p className="text-gray-600 mt-2 text-center">
                        Thank you for your payment. Your hire request has been processed successfully.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition-colors text-center">
                            Go to Dashboard
                        </Link>
                        <Link href="/hire/history" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md font-medium transition-colors text-center">
                            View Hire History
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}