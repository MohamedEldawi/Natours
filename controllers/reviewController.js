import catchAsync from "../utilis/catchAsync.js";
import { Review } from "../models/reviewModel.js";
import * as handlerFactoury from "./handlerFactory.js";

// set IDs to create review
export const setTourAndUserId = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
});

// CRUD
export const getReviews = handlerFactoury.readAll(Review);
export const getReview = handlerFactoury.readOne(Review);
export const createReview = handlerFactoury.createOne(Review);
export const deleteReview = handlerFactoury.deleteOne(Review);
export const updateReview = handlerFactoury.updateOne(Review);
