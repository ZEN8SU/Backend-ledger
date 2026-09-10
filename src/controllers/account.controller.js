import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../models/account.model.js";

const createAccountController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Invalid user id");
  }
  const account = await Account.create({
    user: userId,
  });
  if (!account) {
    throw new ApiError(500, "Something went wrong while create account");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, account, "account created successfully"));
});
export {createAccountController};
