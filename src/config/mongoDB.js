import mongoose from "mongoose";
import { env } from "./env.js";


export const connectMongoDB = async () => {
    try {
        await mongoose.connect("mongodb://KMILA:12345678@localhost:27018/?authSource=admin");
            
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}