import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { hireId } = body; // Get amount from request

        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Stripe secret key is not defined');
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const product = await stripe.products.create({
            name: 'Hire Ticket',
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 100 * 100,
            currency: 'usd',
        });

        // Use this price ID in your checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/hire/payment/success?session_id={CHECKOUT_SESSION_ID}&hireId=${hireId}`,
            cancel_url: `${request.headers.get('origin')}/hire/payment/canceled`,
        });

        return NextResponse.json({ id: session.id });
    } catch (err: any) {
        console.error('Stripe error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}