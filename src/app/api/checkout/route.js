import { initMongoose } from "../../../lib/mongoose";
import Stripe from "stripe";
import Product from "../../../models/Product";
import Order from "../../../models/Order";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  await initMongoose();

export async function POST(req) {
    try {

       const userSession = await getServerSession(authOptions);
        

        if(!userSession) {
          return NextResponse.json({status: 400}, {message: "Not Authenticated"});
        }
       
        const userId = await userSession.user._id;
        const {email, products} = await req.json();

        const productIds = products.split(',');
        const uniqueIds = [...new Set(productIds)];
        // console.log(uniqueIds);
        
        const productsPayable = await Product.find({_id: {$in:uniqueIds}}).exec();


        let line_items = [];
        for(let productId of uniqueIds){
          // console.log(productId);
          
          const quantity_array = productIds.filter(id => id == productId);
          const quantity = quantity_array.length;
          // console.log(quantity_array);
          
          // console.log(quantity);
          
          const product = productsPayable.find(p => p._id.toString() === productId.toString());
  
          line_items.push({
            quantity: quantity,
            price_data: {
              currency: 'INR',
              product_data: {name:product.name},
              unit_amount: (product.price)*100,
            }
          });

        }

        console.log(line_items);
        
        const totalProductAmount = line_items.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
        
        line_items.push({
          quantity: 1,
          price_data: {
            currency: 'INR',
            product_data: {name: 'Tax: (8%)'},
            unit_amount: Math.round(totalProductAmount*0.08),
          }
        });

        line_items.push({
          quantity: 1,
          price_data: {
            currency: 'INR',
            product_data: {name: 'Delivery Charges: (₹150)'},
            unit_amount: 15000,
          }
        });

        const order = await Order.create({
          products: line_items,
          paid: false,
        });


        const session = await stripe.checkout.sessions.create({
          line_items: line_items,
          mode: "payment",
          customer_email: email,
          success_url: `${req.headers.get('origin')}?success=true`,
          cancel_url: `${req.headers.get('origin')}?canceled=true`,
          metadata: {orderId: order._id.toString(), userId: userId.toString()},
        });


      //  if(session.success_url.includes("success")){
      //   await User.findByIdAndUpdate(userId, {$set: {cart: []}});
      //  }


        return new Response(JSON.stringify({url: session.url}), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      
    }  catch(error){
        console.log(error);
        
    }  

}
