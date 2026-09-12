import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Ledger } from "../models/ledger.model.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";

const createInitialFunds = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    throw new ApiError(
      400,
      "Something is missing like toAccount , amount and idempotencyKey"
    );
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0 and in Numbers");
  }
  if (!isValidObjectId(toAccount)) {
    throw new ApiError(400, "Invalid toaccountId");
  }

  const toUserAccount = await Account.findOne({ _id: toAccount });

  if (!toUserAccount) {
    throw new ApiError(404, "Invalid Account");
  }

  if (!toUserAccount.status !== "ACTIVE") {
    throw new ApiError(400, "Account is not active");
  }

  const systemUser = await User.findOne({ systemUser: true });
  if (!systemUser) {
    throw new ApiError(500, "System user not found");
  }

  const fromUserAccount = await Account.findOne({ user: systemUser._id });
  if (!fromUserAccount) {
    throw new ApiError(500, "System user not found");
  }
  if (fromUserAccount.status !== "ACTIVE") {
    throw new ApiError(400, "System account is not active");
  }

  const existingTransaction = await Transaction.findOne({ idempotencyKey });
  if (existingTransaction) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingTransaction,
          "Transaction already processed"
        )
      );
  }

  if (fromUserAccount.currency !== toUserAccount) {
    throw new ApiError(
      400,
      "fromAccount and toAccount have diff-diff curencies"
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const [transaction] = await Transaction.create(
      [
        {
          fromAccount: fromUserAccount?._id,
          toAccount: toUserAccount?._id,
          amount,
          currency: toUserAccount.currency,
          status: "PENDING",
          idempotencyKey,
          initiatedBy: req.user?._id,
          isSystemTransaction: true,
        },
      ],
      { session }
    );

    await Ledger.create(
      [
        {
          account: fromUserAccount?._id,
          transaction: transaction?._id,
          amount,
          type: "DEBIT",
        },
      ],
      { session }
    );
    await Ledger.create(
      [
        {
          account: toUserAccount?._id,
          transaction: transaction?._id,
          amount,
          type: "CREDIT",
        },
      ],
      { session }
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();

    const balance = await toUserAccount.getBalance();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { newBalance: balance },
          "Initial funds credited successfully"
        )
      );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

const promoteToSystemUser = asyncHandler(async (req, res) => {
  const { email, masterKey } = req.body;
  if (!email || !masterKey) {
    throw new ApiError(400, "Email and master key are required");
  }
  if (masterKey !== process.env.SYSTEM_MASTER_KEY) {
    throw new ApiError(403, "Invalid master key");
  }
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.systemUser) {
    throw new ApiError(400, "User is already a system user");
  }
  const result = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        systemUser: true,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!result) {
    throw new ApiError(
      500,
      "Something happend while set your account to systemUser account"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "User promoted to system user successfully")
    );
});

export { createInitialFunds, promoteToSystemUser };
