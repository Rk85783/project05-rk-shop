import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1/rk-shop");
    console.info("Database connected successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
export default connectDB;
