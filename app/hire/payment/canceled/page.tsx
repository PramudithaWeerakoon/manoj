"use client"

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PaymentCancelPage() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const reason = searchParams?.get('reason') || '';
    const orderId = searchParams?.get('orderId') || '';

    useEffect(() => {
        setMounted(true);
    }, []);

    // Optional: Track cancellation analytics
    useEffect(() => {
        if (mounted && orderId) {
            console.log(`Payment cancelled for order ${orderId}, reason: ${reason || 'unknown'}`);
        }
    }, [orderId, reason, mounted]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <title>Payment Cancelled | Raido</title>
            <meta name="description" content="Your payment was cancelled" />

            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-3 text-lg font-medium text-gray-900">Payment Cancelled</h2>

                    {reason && (
                        <p className="mt-2 text-sm text-gray-500">
                            Reason: {decodeURIComponent(reason)}
                        </p>
                    )}

                    <p className="mt-4 text-gray-600">
                        Your payment was not completed. You can try again or contact support if you need assistance.
                    </p>

                    <div className="mt-6">
                        <Link
                            href="/checkout"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Return to Checkout
                        </Link>
                    </div>

                    <div className="mt-4">
                        <Link
                            href="/support"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}