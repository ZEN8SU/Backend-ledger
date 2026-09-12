import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import { Account } from "../models/account.model.js";
import { Ledger } from "../models/ledger.model.js";
import { sendTransactionEmail } from "../utils/email.js";
import { sendTransactionFailureEmail } from "../utils/email.js";

const createTransaction = asyncHandler(async (req, res) => {
  // for email
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    throw new ApiError(
      400,
      "toAccount, amount and idempotencyKey are required"
    );
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }
  if (!isValidObjectId(toAccount)) {
    throw new ApiError(400, "Invalid receiver account id");
  }

  const toUserAccount = await Account.findOne({ _id: toAccount });
  if (!toUserAccount) {
    throw new ApiError(404, "Invalid Account");
  }
  if (!toUserAccount.status !== "ACTIVE") {
    throw new ApiError(400, "Account is not active");
  }

  const fromUserAccount = await Account.findOne({
    user: req.user?._id,
    status: "ACTIVE",
  });
  if (!fromUserAccount) {
    throw new ApiError(404, "Sender active account not found");
  }

  if (fromUserAccount.currency !== toUserAccount.currency) {
    throw new ApiError(400, "Sender and receiver must have the same currency");
  }

  const existingTransaction = await Transaction.findOne({
    idempotencyKey,
  });

  if (existingTransaction) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingTransaction,
          "Transaction already processed (idempotent)"
        )
      );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const senderBalance = await fromUserAccount.getBalance();

    if (senderBalance < amount) {
      throw new ApiError(400, "Insufficient baance");
    }

    const [transaction] = await Transaction.create(
      [
        {
          fromAccount: fromUserAccount?._id,
          toAccount: toUserAccount?._id,
          amount,
          currency: fromUserAccount.currency,
          status: "PENDING",
          idempotencyKey,
          initiatedBy: req.user?._id,
          isSystemTransaction: false,
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

    await session.commitTransaction();

    try {
      await sendTransactionEmail(
        user.email,
        user.name,
        amount,
        toUserAccount?._id
      );
    } catch (emailError) {
      console.error("Transaction email failed:", emailError);
    }
    const newBalance = await fromUserAccount.getBalance();
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { transaction, newBalance },
          "Transaction completed successfully"
        )
      );
  } catch (error) {
    await sendTransactionFailureEmail(
      user.email,
      user.name,
      amount,
      toUserAccount?._id
    );
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endsession();
  }
});

const getMyTransaction = asyncHandler(async (req, res) => {
  const myAccounts = await Account.find({ user: req.user?._id }).select("_id");
  const accountIds = myAccounts.map((a) => a._id);

  const transactions = await Transactions.find({
    $or: [
      { fromAccount: { $in: accountIds } },
      { toAccount: { $in: accountIds } },
    ],
  })
    .sort({ createdAt: -1 })
    .populate("fromAccount", "currency status")
    .populate("toAccount", "currency status")
    .limit(50);

  return res
    .status(200)
    .json(
      new ApiResponse(200, transactions, "Transactions fetched successfully")
    );
});

export { createTransaction, getMyTransaction };
