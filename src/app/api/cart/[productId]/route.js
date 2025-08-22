import { initMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

await initMongoose();

export async function PATCH(req, {params}) {

    const session = await getServerSession(authOptions);

    if(!session){
        return NextResponse.json({error: "Not Authenticated"}, {status: 400});
    }

    const userId = session.user._id;

    const {productId} = await params;
    const {op} = await req.json();

    // console.log(productId);
    // console.log(op);
    

    if(op == 'dec'){
    const result = await User.updateOne(
        {'_id' : new ObjectId(userId), "cart.productId": productId, "cart.quantity" : 1},
        {$pull: {"cart" : { productId }}}
    );
    // console.log(item);
    if(result.matchedCount === 0){
    const result = await User.updateOne(
        {'_id' : new ObjectId(userId), "cart.productId": productId},
        {$inc: {"cart.$.quantity" : -1}}
    );
    if(result.matchedCount === 0){
        throw new Error("Failed to update cart");
    }
    return NextResponse.json({status: 200}, {message: "Cart updated"});
} 
    }
else if(op == 'inc'){
    const result = await User.updateOne(
        {'_id' : new ObjectId(userId), "cart.productId": productId},
        {$inc: {"cart.$.quantity" : 1}}
    );
    if(result.matchedCount === 0){
        throw new Error("Failed to update cart");
    }
} else{
    return NextResponse.json({message: 'Failed to update cart'}, {status: 400});
}
    return NextResponse.json({message: "Cart updated"}, {status: 200}, );

}