import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
    if (!stripePromise) {
        const key = process.env.STRIPE_PUBLISHABLE_KEY;
        if (!key) {
            console.error('Missing Stripe publishable key');
            return null;
        }
        stripePromise = loadStripe(key);
    }
    return stripePromise;
};