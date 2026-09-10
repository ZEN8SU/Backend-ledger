import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendRegistrationEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const userRegister = asyncHandler(async (req, res) => {
  const { username, name, password, email } = req.body;
  if ([username, name, password, email].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const isExistUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isExistUser) {
    throw new ApiError(
      409,
      "User with this email or username is already exist"
    );
  }

  const user = await User.create({
    username: username.toLowerCase(),
    name,
    password,
    email,
  });
  const checkUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!checkUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  await sendRegistrationEmail(user.email, user.name);

  return res
    .status(201)
    .json(new ApiResponse(201, checkUser, "registration successful"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User doesnt exist");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user loggedin successfully"
      )
    );
});
export { userRegister, userLogin };
