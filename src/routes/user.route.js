import express , {Router} from 'express';
import {userLogin, userRegister} from '../controllers/user.controller.js'
import {verifyJwt} from '../middlewares/auth.middleware.js'
const router = Router();

router.route("/register").post(userRegister);
router.route("/login").post(userLogin);

export default router;