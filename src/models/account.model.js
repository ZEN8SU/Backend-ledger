import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE , FROZEN and CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required for making an account"],
      default: "INR",
      uppercase: true,
    },
  },
  { timestamps: true }
);

accountSchema.index({ user: 1, status: 1 }); // compound index -> use for searching easy and 1 means ascending order

accountSchema.methods.getBalance = async function () {
  const result = await Ledger.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);
  return result.length > 0 ? result[0].balance : 0;
};

export const Account = mongoose.model("Account", accountSchema);
