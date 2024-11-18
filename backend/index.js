import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
const app=express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.get("/" , (req,res) =>{
    res.send("Not Authentication Backend");
});

app.use(express.json());
app.use("/api/auth",authRoutes);

app.listen(PORT,()=>{
    console.log("Server is running on port",PORT);
    connectDB();
}); 
