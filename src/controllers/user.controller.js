import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //STEPS:-
  //take input from user
  //validation - not empty
  //check if user already exists - username,email
  //chack for images, check for avatar
  //upload them to cloudinary
  // create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);

  // if(fullname === "") {
  //     throw new ApiError(400, "fullname is required")
  // } this is very slow and time taking method to write validation for every field, so we used "some" method to do it in one go.

  // check if any required field is empty?
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //checked if user already exists?

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(req.files?.avatar[0]?.path);
  
  console.log("uploaded file in local");

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload the files on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Please reupload Avatar file");
  }


  //creating new user in MongoDB.
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  console.log(user);
  

  //remove password and refershToken from data before sending it to user.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  //check if user created successfully?
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //send response to the user
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

export { registerUser };
