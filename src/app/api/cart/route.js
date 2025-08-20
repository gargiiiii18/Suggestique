import { initMongoose } from "../../../lib/mongoose";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

await initMongoose();

export async function POST(req){

    const cartProducts = await req.json();
    console.log(cartProducts);
    

    const session = await getServerSession(authOptions);

    if(!session){
        return NextResponse.json({status: 400}, {message: "Not Authenticated"});
    }
    const userId = session.user._id;

    await User.updateOne(
        {'_id' : new ObjectId(userId)},
        { $set: {"cart": cartProducts}}
    )

//     for (const item of cartProducts){
//         if(item.quantity>0){
//         const result = await User.updateOne(
//             {'_id' : new ObjectId(userId), "cart.productId" : item.productId}, 
//             { $set: {"cart.$.quantity" : item.quantity} }
//         );
//         // console.log(result);
//         if(result.matchedCount === 0){
//             await User.updateOne(
//                 {'_id' : new ObjectId(userId)},
//                 {$push: {cart: { productId: item.productId, quantity: item.quantity }}}
//             )
//         }
//     } 
//     else if(item.quantity === 0){
//        await User.updateOne(
//             {'_id' : new ObjectId(userId), "cart.productId" : item.productId}, 
//             { $pull: {cart : {productId: item.productId}} }
//         ); 
//     }
// }

    return NextResponse.json({status: 200}, {message: "Items updated"});
    
}

export async function GET() {
    // console.log(authOptions);
    const session = await getServerSession(authOptions);
    
    // console.log(session);

    if(!session){
       return NextResponse.json({error: "Not Authenticated"}, {status: 400});
    }
    
    const userId = session.user._id;
    const user = await User.findOne({'_id' : new ObjectId(userId)});
    if(!user){
        throw new Error("No User Found");
        
    } 
    const {email, address, cart} = await user;
    return NextResponse.json(cart);
    
}