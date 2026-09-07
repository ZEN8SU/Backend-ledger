import mongoose from "mongoose";
import {DB_NAME} from "../default.js"

const connectDB = async() =>{
 try {
   const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
   console.log(`mongoDB connected Successfully !! DB HOST : ${connectionInstance.connection.host}`);
 } catch (error) {
  console.log("MONGODB connection FAILED " , error);
  process.exit(1);
 }
};
export default connectDB;