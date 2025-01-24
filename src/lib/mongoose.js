import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

export const initMongoose = async () => {
    if(mongoose.connection.readyState === 1 ){
        return mongoose.connection.asPromise();
    }
    return await mongoose.connect(process.env.MONGODB_URL);
}