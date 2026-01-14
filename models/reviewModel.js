import mongoose from "mongoose";
import { Tour } from "./tourModel.js";
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "review can not be empty"],
    },
    rating: {
      type: Number,
      required: [true, "review must have a rating"],
      max: [5, "rating can't be more than 5"],
      min: [1, "rating can't be less than 1"],
    },
    createdAt: Date,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to user"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "review must belong to a tour"],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: "user",
    select: "name photo",
  });
});

// calculatin tour average rating
reviewSchema.statics.calcRatingsAverage = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        reviewsNum: {
          $sum: 1,
        },
        ratingsAverage: {
          $avg: "$rating",
        },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].ratingsAverage,
      ratingsQuantity: stats[0].reviewsNum,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
reviewSchema.post("save", async function () {
  await this.constructor.calcRatingsAverage(this.tour);
});

// make the calculation again when findOneAnd
reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.model.findOne(this.getQuery());
});
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcRatingsAverage(this.r.tour);
  }
});

const Review = mongoose.model("Review", reviewSchema);
export { Review };
