import { promisify } from "util";
import { User } from "../models/userModel.js";
import catchAsync from "../utilis/catchAsync.js";
import { appError } from "../utilis/appError.js";
import Email from "../utilis/emailHandler.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// validate user input middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      console.log(result.error.issues[0]);
      const errors = result.error.issues
        .map((err) => {
          const field = err.path[0];
          if (
            err.code === "invalid_type" &&
            err.message.split(" ").at(-1) === "undefined"
          ) {
            return `${field} is required`;
          }
          return `${field} ${err.message}`;
        })
        .join(", ");
      return next(new appError(`${errors}`, 400));
    }
    req.validatedBody = result.data;
    next();
  };
};

// create JWT and send it to the user
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  const token = signToken(user._id);
  res.cookie("JWT", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

// signup
export const signup = catchAsync(async (req, res, next) => {
  let newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

// login
export const login = catchAsync(async (req, res, next) => {
  let { email, password } = req.validatedBody;

  let user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new appError("Wrong email or password", 401));
  }
  createSendToken(user, 200, res);
});

// logout
export const logout = catchAsync(async (req, res, next) => {
  res.cookie("JWT", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
});

// protect routes middleware
export const protect = catchAsync(async (req, res, next) => {
  // 1) checking if the token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // to check token when using postman
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.JWT) {
    // to check cookie when using the browser
    token = req.cookies.JWT;
  }
  if (!token) {
    return next(
      new appError("Your are not logged in! Please log in to get access", 401)
    );
  }

  // 2) Token verfication
  let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  let currentUser = await User.findById(decoded.id).select(
    "+passwordChangedAt"
  );
  if (!currentUser) {
    return next(
      new appError("The user belonging to this token is no longer exists", 401)
    );
  }

  // 4) check if user changed the password after this token is issued
  if (currentUser.checkChangePassword(decoded.iat)) {
    return next(
      new appError("User recently changed the password! Please log in again")
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// to check if user logged in
export const isLoggedIn = async (req, res, next) => {
  // 1) checking if the cookie exist
  try {
    if (req.cookies && req.cookies.JWT) {
      let decoded = await promisify(jwt.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exist
      let currentUser = await User.findById(decoded.id).select(
        "+passwordChangedAt"
      );
      if (!currentUser) {
        return next();
      }

      // 3) check if user changed the password after this token is issued
      if (currentUser.checkChangePassword(decoded.iat)) {
        return next();
      }

      // 4) send the user to the next middleware by req
      res.locals.user = currentUser;
      return next();
    }
  } catch (error) {
    return next();
  }

  next();
};

// restrict to middleware
export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const role = req.user.role;
    if (!roles.includes(role)) {
      return next(
        new appError("You do not have permission to perform this action", 403)
      );
    }

    next();
  });
};

// Forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user by email
  const { email } = req.body || {};
  if (!email) {
    return next(new appError("Please provide an email", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError("There is no user with this email", 404));
  }

  // 2) generate user token
  const resetPasswordToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) send token to user's email

  try {
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetPasswordToken}`;
    await new Email(user, resetPasswordUrl).sendPasswordReset();
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.tokenExpireDate = undefined;
    console.error(err);
    await user.save({ validateBeforeSave: false });
    return next(
      new appError(
        "There was a error sending the email! Please Try again later",
        500
      )
    );
  }
  res.status(200).json({
    status: "success",
    message: "Token send to email",
  });
});

// reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const { token } = req.params || {};
  if (!token) {
    return next(new appError("Unauthorized Action!", 401));
  }
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    tokenExpireDate: { $gt: Date.now() },
  });

  // 2) check for token expire date
  if (!user) {
    return next(new appError("This Token has expired!", 400));
  }

  // 3) Update user password
  const { password, passwordConfirm } = req.body || {};
  if (!password) {
    return next(new appError("Please enter your new password!", 400));
  }
  user.updatePassword(password, passwordConfirm);
  await user.save();

  // 4) Log the user in
  createSendToken(user, 200, res);
});

// update password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body || {};
  const id = req.user._id;
  const user = await User.findById(id).select("+password");
  if (!currentPassword) {
    return next(new appError("Please write your current password!", 400));
  }
  const correct = await user.checkPassword(currentPassword, user.password);
  if (!correct) {
    return next(
      new appError("you current password is Incorrect! Please try again", 401)
    );
  }
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
