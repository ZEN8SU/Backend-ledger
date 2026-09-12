import mongoose, { Schema } from "mongoose";
const blackListSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, //TTL index auto delete after expiry
    },
  },
  { timestamps: true }
);
export const BlackList = mongoose.model("BlackList", blackListSchema);
