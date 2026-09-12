import express , {Router} from 'express'
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { createTransaction  , getMyTransaction } from '../controllers/transaction.controller.js';
const router = Router();

router.route("/").post(verifyJwt , createTransaction).get(verifyJwt , getMyTransaction);

export default router;
