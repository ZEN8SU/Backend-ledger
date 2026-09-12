import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {BlackList} from "../models/blackList.model.js"

import jwt from "jsonwebtoken";

export const verifySystemUser = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }
     const isBlacklisted = await BlackList.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(401, "Unauthorized request - token is invalid");
  }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken +systemUser"
    );

    if (!user.systemUser) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Forbidden access , not a system user"));
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
