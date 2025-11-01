import { initMongoose } from "../../../lib/mongoose";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

await initMongoose();

export async function POST(req){

    const productId = await req.json();
    
    const session = await getServerSession(authOptions);

    if(!session){
        return NextResponse.json({status: 400}, {message: "Not Authenticated"});
    }
    const userId = session.user._id;

    // await User.updateOne(
    //     {'_id' : new ObjectId(userId)},
    //     { $set: {"cart": cartProducts}}
    // )

    // for (const item of cartProducts){
        // if(item.quantity>0){
        const result = await User.updateOne(
            {'_id' : new ObjectId(userId), "cart.productId" : productId}, 
            { $inc: {"cart.$.quantity" : 1} }
        );
        // console.log(result);
        if(result.matchedCount === 0){
            await User.updateOne(
                {'_id' : new ObjectId(userId)},
                {$push: {cart: { productId: productId, quantity: 1 }}}
            )
        }
    // } 
    // else if(item.quantity === 0){

    // }
// }

    return NextResponse.json({status: 200}, {message: "Items updated"});
    // return NextResponse.json(cartProducts);
    
}

// export async function PATCH(req) {

//     const session = await getServerSession(authOptions);

//     if(!session){
//         return NextResponse.json({error: "Not Authenticated"}, {status: 400});
//     }

//     const id = awair req.searchParams();
// }

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
    const {cart} = await user;
    return NextResponse.json(cart);
    
}