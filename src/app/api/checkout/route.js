import { initMongoose } from "../../../lib/mongoose";
import Stripe from "stripe";
import Product from "../../../models/Product";
import Order from "../../../models/Orders";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function POST(req, res) {
    await initMongoose();
    try {
       
        const {address, email, products} = await req.json();
        const productIds = products.split(',');
        const uniqueIds = [...new Set(productIds)];
        // console.log(uniqueIds);
        
        const productsPayable = await Product.find({_id: {$in:uniqueIds}}).exec();

        // console.log(address);
        // console.log(email);
        // console.log(productIds);
        // console.log(productsPayable);

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
              currency: 'USD',
              product_data: {name:product.name},
              unit_amount: (product.price)*100,
            }
          });

        }

        const totalProductAmount = line_items.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
        
        line_items.push({
          quantity: 1,
          price_data: {
            currency: 'USD',
            product_data: {name: 'Tax: (8%)'},
            unit_amount: Math.round(totalProductAmount*0.08),
          }
        });

        line_items.push({
          quantity: 1,
          price_data: {
            currency: 'USD',
            product_data: {name: 'Delivery Charges: ($5)'},
            unit_amount: 500,
          }
        });

        const order = await Order.create({
          products: line_items,
          address,
          email,
          paid: false,
        });

        const session = await stripe.checkout.sessions.create({
          line_items: line_items,
          mode: "payment",
          customer_email: email,
          success_url: `${req.headers.get('origin')}?success=true`,
          cancel_url: `${req.headers.get('origin')}?canceled=true`,
          metadata: {orderId: order._id.toString()},
        });


        return new Response(JSON.stringify({url: session.url}), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      
    }  catch(error){
        console.log(error);
        
    }  

}
