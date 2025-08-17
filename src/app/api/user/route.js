import { initMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

await initMongoose();

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
    // console.log(user);
    
    // const {email, address, cart} = await user;
    // console.log(email);
    // console.log(address);
    // console.log(cart);
    return NextResponse.json(user);
    
}