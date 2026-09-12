import express , {Router} from 'express';
import {userLogin, userRegister,userLogout , getCurrentUser , refreshAccessToken} from '../controllers/user.controller.js'
import {verifyJwt} from '../middlewares/auth.middleware.js'
const router = Router();

router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJwt , userLogout);
router.route("/current-user").post(verifyJwt , getCurrentUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;