import { initMongoose } from "../../../lib/mongoose";
import Stripe from "stripe";
import Order from "../../../models/Order";
import User from "../../../models/User";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/options"
// import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log("hello world");

export async function POST(req){
    await initMongoose();
    try {
        
        const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // const rawBody = await req.text();

        const rawBody = await req.arrayBuffer();
        const payload =  Buffer.from(rawBody);
        // console.log(payload);
        
        const signature = req.headers.get('stripe-signature'); 
        const event = stripe.webhooks.constructEvent(payload, signature, signingSecret);

        // console.log(event.type);
        

        if(event?.type === 'checkout.session.completed'){
            const metadata = event.data?.object?.metadata;
            const paymentStatus = event.data?.object?.payment_status;
            if(metadata?.orderId && paymentStatus==='paid'){
               await Order.findByIdAndUpdate(metadata.orderId, {paid: true});
            }
            if(metadata?.userId){
                await User.findByIdAndUpdate(metadata.userId, {$set: {cart: []}});
            }
        }

        return new Response("Webhook received successfully", { status: 200 });
    } catch (error) {
        console.log(error);  
    }
}

// export const config = {
//     api: {
//         bodyParser: false,
//     }
// }