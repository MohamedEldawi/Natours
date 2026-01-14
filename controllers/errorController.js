import { log } from "console";
import { appError } from "../utilis/appError.js";

// errors
const handleCastErroDb = (err) => {
  let message = `Invalid ${err.path} : ${err.value}`;
  return new appError(message, 400);
};
const handleDublicateErroDb = (err) => {
  let field = Object.keys(err.keyValue)[0];
  let message = `Dublicate ${field}:  ${err.keyValue[field]}  `;
  return new appError(message, 400);
};
const handleValidatorErroDb = (err) => {
  let errors = Object.values(err.errors).map((el) => el.message);
  return new appError(`Invalid Input Data: ${errors.join(". ")}`, 400);
};
const handleJwtError = (err) => {
  let message = "Invalid token! Please login again";
  return new appError(message, 401);
};
const handleJwtExpiredError = (err) => {
  let message = "Your token has expired! Please log in again";
  return new appError(message, 401);
};

// error when development
const developmentError = (error, req, res) => {
  // for api
  if (req.originalUrl.startsWith("/api")) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      stack: error.stack,
    });
  }
  // for websites views
  console.log(error);
  return res
    .status(error.statusCode)
    .render("error", { title: "Some thing went wrong!", msg: error.message });
};

// error when production
const productiontError = (error, req, res) => {
  // For API
  if (req.originalUrl.startsWith("/api")) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  // For website views
  if (error.isOperational) {
    return res
      .status(error.statusCode)
      .render("error", { title: "Some thing went wrong!", msg: error.message });
  }
  console.log(error);
  return res.status(error.statusCode).render("error", {
    title: "Some thing went wrong!",
    msg: "Some thing went wrong! Try again later",
  });
};

// error handler middlerware
export const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  if (process.env.NODE_ENV === "development") {
    developmentError(err, req, res);

    // in production
  } else if (process.env.NODE_ENV === "production") {
    let error = err;
    if (error.cause) error = error.cause;
    if (error.name === "CastError") error = handleCastErroDb(error);
    if (error.code === 11000) error = handleDublicateErroDb(error);
    if (error.name === "ValidationError") error = handleValidatorErroDb(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError(error);
    if (error.name === "TokenExpiredError")
      error = handleJwtExpiredError(error);
    productiontError(error, req, res);
  }
};
