import catchAsync from "../utilis/catchAsync.js";
import { Tour } from "../models/tourModel.js";
import { appError } from "../utilis/appError.js";
import { Booking } from "../models/bookingModel.js";

// overview page
export const getOverviewPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", { title: "All Tours", tours });
});

// tour page
export const getTourPage = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    select: "review user rating -tour ",
  });
  if (!tour) {
    return next(new appError("There is no tour with that name", 404));
  }
  res.status(200).render("tour", { tour, title: `${tour.name} Tour` });
});

// login page
export const getLogIn = catchAsync(async (req, res, next) => {
  if (res.locals.user) return res.redirect("/");
  res.status(200).render("login", { title: "Log Into Your Account" });
});

// signup page
export const getSignup = catchAsync(async (req, res, next) => {
  if (res.locals.user) return res.redirect("/");
  res.status(200).render("signup", {
    title: "Create New Account",
  });
});

// my account page
export const accountPage = catchAsync(async (req, res, next) => {
  res.status(200).render("account", {
    title: "Your account",
  });
});

// my tours page
export const getMyTours = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const bookings = await Booking.find({ user });
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } }); // you could done this in one step with populate but we did it like this to try $in opreator which find all the elements that is in the list
  res.status(200).render("overview", { title: "My Tours", tours });
});

// manage tours page
export const getManageToursPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("manageTours", {
    title: "Manage Tours",
    tours,
  });
});
