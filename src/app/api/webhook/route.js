import { initMongoose } from "../../../lib/mongoose";
import Stripe from "stripe";
import Order from "../../../models/Order";
import { buffer } from "micro";
import getRawBody from "raw-body";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req, res){
    await initMongoose();
    try {
        const signingSecret = process.env.SIGNING_SECRET;

        const rawBody = await req.arrayBuffer();
        const payload =  Buffer.from(rawBody);
        // console.log(payload);
        
        const signature = req.headers.get('stripe-signature'); 
        const event = stripe.webhooks.constructEvent(payload, signature, signingSecret);

        if(event?.type === 'checkout.session.completed'){
            const metadata = event.data?.object?.metadata;
            const paymentStatus = event.data?.object?.payment_status;
            if(metadata?.orderId && paymentStatus==='paid'){
               await Order.findByIdAndUpdate(metadata.orderId, {paid: true});
            }
        }

        return new Response("Webhook received successfully", { status: 200 });
    } catch (error) {
        console.log(error);  
    }
}

export const config = {
    api: {
        bodyParser: false,
    }
}