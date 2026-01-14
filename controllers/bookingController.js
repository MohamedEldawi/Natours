import catchAsync from "../utilis/catchAsync.js";
import { Tour } from "../models/tourModel.js";
import { User } from "../models/userModel.js";
import { Booking } from "../models/bookingModel.js";
import { appError } from "../utilis/appError.js";
import * as handlerFactory from "./handlerFactory.js";
import Stripe from "stripe";
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

// create checkout wiht stripe
export const getCheckout = catchAsync(async (req, res, next) => {
  const { tourId } = req.body || {};
  if (!tourId) {
    return next(new appError("Please provide the tourId", 400));
  }
  const tour = await Tour.findById(tourId);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/my-bookings`,
    cancel_url: `${req.protocol}://${req.get("host")}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name}`,
            description: tour.summary,
            images: [
              `https://natours-api-iy0p.onrender.com/img/tours/${tour.imageCover}`,
            ],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

// create booking on payment success
export const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

// webhook middleware
export const webhook = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(error);
    console.log(error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createBookingCheckout(event.data.object);
    return res.status(200).json({
      received: true,
    });
  }
});

// CRUD
export const getBooking = handlerFactory.readOne(Booking);
export const getAllBookings = handlerFactory.readAll(Booking);
export const deleteBookings = handlerFactory.deleteOne(Booking);
export const updateBooking = handlerFactory.updateOne(Booking);
export const createBooking = handlerFactory.createOne(Booking);
