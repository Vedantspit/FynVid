import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const getAccessRefreshTokens = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  // console.log("How body looks in backend: ", req.body);

  if (
    //input validation
    [fullName, email, userName, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  const existUser = await User.findOne({
    $or: [{ userName }, { email }],
  }); //check if an entry is present with same email or username
  if (existUser) {
    throw new ApiError(409, "The username or email already exists !!");
  }
  // console.log("FILES req.files: ", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // console.log(" AVATAR file path", avatarLocalPath);

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required !!");
  }

  //uploading cover image and avatar image on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("Response from cloudinary AVATAR", avatar);
  const coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }
  if (!avatar) {
    throw new ApiError(400, "Avatar File is required !!");
  }

  const user = await User.create({
    fullName,
    email,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  //verifying if user was created and then removing fields like password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the User !!"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered successfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Usename or email is required ");
  }
  if (!password) {
    throw new ApiError(400, "Password is required ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exists !!");
  }

  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid user credentials !!");
  }

  const { accessToken, refreshToken } = await getAccessRefreshTokens(user._id);
  //query db and remove certain fields to send data in response
  // const loggedInUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );
  const safeUser = user.toObject();
  console.log("Safe user before deleting password", safeUser);

  delete safeUser.password;
  delete safeUser.refreshToken;
  console.log("Safe user ", safeUser);

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken, refreshToken },
        "User loggedin Success"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  //we created auth.js middleware because we wanted which user we want to delete, we cant have a form based input
  // for taking user details for logout, thus using middleware ( takes cookie from request and adds user field in REQ)
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export { registerUser, loginUser, logoutUser };
