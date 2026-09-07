import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import {app} from "./app.js"
import connectDB from "./db/db.js";

connectDB().then(()=>{
  app.listen(process.env.PORT || 8000 , () =>{
    console.log(`server is running at port : ${process.env.PORT}`)
  })
}).catch((err)=>{
  console.log("mongodb connection failed !!" , err);
})