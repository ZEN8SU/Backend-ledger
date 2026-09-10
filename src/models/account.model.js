import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with user"],
      index : true
    },
    status: {
      type : String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE , FROZEN and CLOSED",
      },
      default : "ACTIVE"
    },
    currency: {
      type: String,
      required: [true, "Currency is required for making an account"],
      default: "INR",
    },
  },
  { timestamps: true }
);

accountSchema.index({user : 1 , status : 1}) // compound index -> use for searching easy and 1 means ascending order

export const Account = mongoose.model("Account", accountSchema);
