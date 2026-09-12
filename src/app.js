import express from 'express'
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());




import userRouter from './routes/user.route.js'
import accountRouter from './routes/account.route.js'
import transactionRouter from './routes/transaction.route.js'
import systemRouter from "./routes/system.route.js"
app.use('/api/v1/users',userRouter);
app.use('/api/v1/accounts',accountRouter);
app.use('/api/v1/transactions',transactionRouter);
app.use("/api/v1/system" , systemRouter);






export {app};