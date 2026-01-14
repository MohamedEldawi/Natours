import mongoose from "mongoose";
import slugify from "slugify";

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every tour must have a name"],
      unique: true,
      trim: true,
      maxLength: [40, "tour name must be less than or equal to 40 char"],
      minLength: [10, "tour name must be more than or equal to 10 char"],
    },
    slug: String,

    duration: {
      type: Number,
      required: [true, "Every tour must have a duaration"],
    },

    maxGroupSize: {
      type: Number,
      required: [true, "Every tour must have max group size"],
    },

    difficulty: {
      type: String,
      required: [true, "Every tour must have difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "difficulty must be easy , medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Tour rating must be more than 1"],
      max: [5, "Tour rating must be less than 5"],
      set: (value) => Math.round(value * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Every tour must have a price"],
    },

    priceDiscount: {
      type: Number,
      validate: {
        // custom validator

        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price ({VALUE}) must be less than the price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Every tour must have summary"],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, "Every tour must have cover image"],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },

    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: "2dsphere" });

// virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// Middlewares

// create slug from tour name
tourSchema.pre("save", function () {
  this.slug = slugify(this.name, { lower: true });
});

// to remove secret tours from the find query
tourSchema.pre(/^find/, function (doc) {
  this.find({ secretTour: { $ne: true } });
});

// populate the guides
tourSchema.pre(/^find/, function () {
  this.populate({
    path: "guides",
    select: "-__v",
  });
});

// to remove secret tours from aggregation
tourSchema.pre("aggregate", function () {
  if (this.pipeline().length > 0 && this.pipeline()[0].$geoNear) {
    this.pipeline().splice(1, 0, { $match: { secretTour: { $ne: true } } });
  } else {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
});

const Tour = mongoose.model("Tour", tourSchema);
export { Tour };
