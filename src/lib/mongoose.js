import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

export const initMongoose = async () => {
    
    if(mongoose.connections[0].readyState >= 1 ){
        console.log("Database already connected!");
        
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "ecomm"
        });
        console.log("Connected to DB:", mongoose.connection.name);

    } catch (error) {
        console.log(error);
        throw error;  
    }
}