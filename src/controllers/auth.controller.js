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
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/:${unhashedToken}`,
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

export { registerUser, loginUser, logoutUser };
