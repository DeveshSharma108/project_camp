import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request ... !");
  }

  // if the token is invalid jwt.verify will throw error
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  // Even though the token is valid, the user might have been deleted from the DB
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  req.user = user;
  next();
});

export { verifyJWT };
