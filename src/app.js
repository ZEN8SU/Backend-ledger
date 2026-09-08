import express from 'express'
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());




import userRouter from './routes/user.route.js'
app.use('/api/v1/users',userRouter);






export {app};