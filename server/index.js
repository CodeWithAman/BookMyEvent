import express from "express";

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import mongoose from "mongoose";
import AuthRoutes from "./routes/auth.route.js"

const app = express();
app.use(cors());
app.use(express.json())

// Routes
app.use('/auth', AuthRoutes);

// connect to  mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
