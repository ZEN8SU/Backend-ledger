import express , {Router} from 'express';
import {verifyJwt} from '../middlewares/auth.middleware.js'
import { createAccountController } from '../controllers/account.controller.js';

const router = Router();

router.route("/").post(verifyJwt , createAccountController );

export default router;