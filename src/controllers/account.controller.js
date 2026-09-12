import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../models/account.model.js";
import { isValidObjectId } from "mongoose";

const createAccountController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { currency = "INR" } = req.body;

  if (!userId) {
    throw new ApiError(401, "Invalid user id");
  }
  const account = await Account.create({
    user: userId,
    currency: currency.toUppedCase(),
  });
  if (!account) {
    throw new ApiError(500, "Something went wrong while create account");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, account, "account created successfully"));
});

const geyMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Invalid user id");
  }
  const account = await Account.find({ user: userId }).sort({ createdAt: -1 });
  if (!account) {
    throw new ApiError(404, "Account not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, account, "Accounts fetched successfully"));
});

const getBalance = asyncHandler(async(req , res) =>{
  const {accountId} = req.params;
  if(!isValidObjectId(accountId)){
    throw new ApiError(401, "Invalid account id")
  }
  
  const account = await Account.findById(accountId);
  if(!account){
    throw new ApiError(404 , "Account not found")
  }

  if(account.user.toString() !== req.user?._id.toString()){
    throw new ApiError(403 , "You are not authorized to view this account")
  };

  const balance = await account.getBalance();
   return res.status(200).json(new ApiResponse(200 , balance , "Balance fetched successfully"))

})
export { createAccountController, geyMyAccount , getBalance };
