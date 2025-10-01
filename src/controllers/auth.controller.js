import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  emailVerficationContent,
  resetPasswordEmailContent,
  sendMail,
} from "../utils/mail.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCookieOption } from "../utils/cookieOption.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    // console.error(error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens .....",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists ....");
  }

  const newUser = await User.create({
    username,
    email,
    password,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    newUser.generateTempToken();

  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationExpiry = tokenExpiry;

  await newUser.save({ validateBeforeSave: false });
  await sendMail({
    email: newUser?.email,
    subject: "Please verify your email.",
    emailContent: emailVerficationContent(
      newUser.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User registered successfully.Verification email is sent to your inbox.",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // user will give email and password

  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(409, "email is required for log-in ....");
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new ApiError(409, "User with this email doesn't exists ....");
  }

  // if user exists verify password
  const passwordVerificationResult =
    await existingUser.verifyPassword(password);

  if (passwordVerificationResult === false) {
    throw new ApiError(409, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id,
  );

  const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = getCookieOption();

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfuly"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // we have access to req.user because req came from auth middleware
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true, // why it is used ?
    },
  );

  const options = getCookieOption();

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Log out successful........"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully."));
});

const verifyEmail = asyncHandler(async (req, res) => {
  // getting the unhashed token from the url
  const unhashedToken = req.params.verificationToken;
  // console.log("unhashed", unhashedToken);
  if (!unhashedToken) {
    throw new ApiError(400, "Verification token is missing ....");
  }

  // if token is present verify it by hashing and checking the expiry
  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  // console.log("hashed", hashedToken);
  // find a user in the db having same unexpired emailVerificationToken
  const verifiedUser = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!verifiedUser) {
    throw new ApiError(400, "Token is invalid/expired");
  }

  verifiedUser.isEmailVerified = true;
  // since user is verified we can now set emailVerificaton token and expiry to null or ""
  verifiedUser.emailVerificationToken = "";
  verifiedUser.emailVerificationExpiry = "";

  // save the user
  await verifiedUser.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "email verification done ...."));
});

// According to the app design to request verification email again user must be logged in .......
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const loggedInUser = await User.findById(req.user._id);
  // In hypothetical case if user doesn't exist
  if (!loggedInUser) {
    throw new ApiError(404, "User doesn't exist");
  }

  // if user is already email verified
  if (loggedInUser.isEmailVerified) {
    throw new ApiError(409, "User already verified ....");
  }

  const { unhashedToken, hashedToken, tokenExpiry } =
    loggedInUser.generateTempToken();

  loggedInUser.emailVerificationToken = hashedToken;
  loggedInUser.emailVerificationExpiry = tokenExpiry;

  await loggedInUser.save({ validateBeforeSave: false });

  await sendMail({
    email: loggedInUser?.email,
    subject: "Please verify your email.",
    emailContent: emailVerficationContent(
      loggedInUser.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification email sent to your inbox."));
});

// refreshing access and refresh token .......... (when the access token gets expired )
const refreshAccessToken = asyncHandler(async (req, res) => {
  // console.log(req.cookies);
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    console.error(error);
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  // Even though the token is valid, the user might have been deleted from the DB
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // if everything is fine

  // getting the new 👇 access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );
  // new refresh token is saved in DB in the generateAccessAndRefreshToken function
  const options = getCookieOption();

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, user, "Tokens refreshed successfully !"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
};
