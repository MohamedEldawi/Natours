import express from "express";
import * as bookingController from "../controllers/bookingController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);

// protected routes
router.post("/checkout-session", bookingController.getCheckout);

// admin routes
router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route("/:id")
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBookings)
  .patch(bookingController.updateBooking);
export { router };
