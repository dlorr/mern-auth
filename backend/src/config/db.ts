import mongoose from "mongoose";
import { MONGO_URI } from "../constant/env";

const connectToDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to the database");
  } catch (error) {
    console.log("Error connecting to the database", error);
    process.exit(1);
  }
};

export default connectToDb;
