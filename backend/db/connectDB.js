import mongoose from "mongoose";

export const connectDB = async () => {
    try {

        const connection = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(`Error connecting to mongoDB: ${error.message}`);
        process.exit(1);
    }
}