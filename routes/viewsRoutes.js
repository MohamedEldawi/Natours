import express from "express";
import * as viewsConroller from "../controllers/viewsController.js";
import * as authController from "../controllers/authController.js";
const router = express.Router();

router
  .route("/")
  .get(authController.isLoggedIn, viewsConroller.getOverviewPage);
router
  .route("/tour/:slug")
  .get(authController.isLoggedIn, viewsConroller.getTourPage);
router.get("/login", authController.isLoggedIn, viewsConroller.getLogIn);
router.get("/signup", authController.isLoggedIn, viewsConroller.getSignup);

// protected routes
router.get("/me", authController.protect, viewsConroller.accountPage);
router.get("/my-bookings", authController.protect, viewsConroller.getMyTours);
router.get(
  "/manage-tours",
  authController.protect,
  authController.restrictTo("admin"),
  viewsConroller.getManageToursPage
);
export { router };
