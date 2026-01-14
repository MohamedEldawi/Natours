import { Tour } from "./../models/tourModel.js";
import catchAsync from "../utilis/catchAsync.js";
import { appError } from "../utilis/appError.js";
import * as handlerFactory from "./handlerFactory.js";
import multer from "multer";
import sharp from "sharp";

// multer implementation for tour images
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

// upload tour images middleware
export const uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// resize images middleware
export const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.images) return next();
  // 1) tour cover image
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }
  // 2) tour images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

// get top tours
export const aliasTopTours = (req, res, next) => {
  req.url =
    req.path +
    "?limit=5&sort=-ratingsAverage,price&fields=name,ratingsAverage,price,difficulty";
  next();
};

// CRUD operations in tour model
export const getTours = handlerFactory.readAll(Tour, {
  populationOptions: {
    path: "reviews",
    select: "review rating user",
  },
});
export const getTour = handlerFactory.readOne(Tour, {
  path: "reviews",
  select: "review rating user",
});

export const addTour = handlerFactory.createOne(Tour);
export const updateTour = handlerFactory.updateOne(Tour);
export const deleteTour = handlerFactory.deleteOne(Tour);

// to get tours with start locations in a specific distance from you
export const getTourWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new appError("Please provide lat and lng like this: lat,lng", 400)
    );
  }
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; // to convert it to radiate based on the unit input
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

// to get the nearest tours sorted from the clinet location
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new appError("Please provide lat and lng like this: lat,lng", 400)
    );
  }
  const multiplier = unit === "mi" ? 0.0006213712 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [+lng, +lat],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: { name: 1, distance: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: distances,
  });
});

// get tour stats
export const toursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        toursNum: {
          $sum: 1,
        },
        ratingsNum: {
          $sum: "$ratingsQuantity",
        },
        avgRating: {
          $avg: "$ratingsAverage",
        },
        avgPrice: {
          $avg: "$price",
        },
        minPrice: {
          $min: "$price",
        },
        maxPrice: {
          $max: "$price",
        },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    stats,
  });
});

// Monthly stats
export const getMonthlyStats = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const stats = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: { startDates: { $gte: new Date(`${year}-01-01`) } },
    },
    {
      $match: { startDates: { $lt: new Date(`${year + 1}-01-01`) } },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        toursNum: {
          $sum: 1,
        },
        tours: { $push: "$name" },
        dates: { $push: "$startDates" },
      },
    },

    {
      $sort: { toursNum: -1 },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  res.status(200).json({
    status: "success",
    stats,
  });
});
