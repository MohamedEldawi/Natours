import { User } from "../models/userModel.js";
import catchAsync from "../utilis/catchAsync.js";
import { appError } from "../utilis/appError.js";
import * as handlerFactory from "./handlerFactory.js";
import { filterObj } from "../utilis/filterObj.js";
import multer from "multer";
import sharp from "sharp";

// implement multer for images
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError("Not an image! Please upload only images", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload images middleware
export const uploadUserPhoto = upload.single("photo");

// resize images middleware
export const userImageResize = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// update user account
export const updateMe = catchAsync(async (req, res, next) => {
  // 1) throw an error if user tried to update password
  if (req.body.password) {
    return next(
      new appError("use /updatePassword to change your password"),
      400
    );
  }

  // 2) filter the input fields
  const filteredbody = filterObj(req.body, ["email", "name"]);
  if (req.file) filteredbody.photo = req.file.filename;

  // 3) update user data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredbody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

// delete my account
export const deleteMe = catchAsync(async (req, res, next) => {
  const { password } = req.body || {};
  if (!password) {
    return next(new appError("Please write your password!", 400));
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.checkPassword(password, user.password))) {
    return next(new appError("Incorrect password please try again!", 401));
  }
  await User.findByIdAndUpdate(user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// get user account information
export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// admin operations on user model
export const getUsers = handlerFactory.readAll(User);
export const getUser = handlerFactory.readOne(User);
export const updateUser = handlerFactory.updateOne(User, ["role", "active"]);
export const deleteUser = handlerFactory.deleteOne(User);
