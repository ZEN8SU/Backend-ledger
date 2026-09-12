import express, { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createAccountController,
  getBalance,
  getMyAccount,
} from "../controllers/account.controller.js";

const router = Router();

router.route("/").post(verifyJwt, createAccountController);
router.route("/getAccount").get(verifyJwt, getMyAccount);
router.route("/:accountId/balance").get(verifyJwt, getBalance);

export default router;
