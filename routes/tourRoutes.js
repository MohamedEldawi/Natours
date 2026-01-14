import express from "express";
import * as tourController from "../controllers/tourController.js";
import * as authController from "../controllers/authController.js";
import { router as reviewRouter } from "./reviewRoutes.js";
const router = express.Router();

// nested route for tour/reviews
router.use("/:tourId/reviews", reviewRouter);

// tours routes
router
  .route("/Top-5-cheapest")
  .get(tourController.aliasTopTours, tourController.getTours);

router.route("/tours-stats").get(tourController.toursStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyStats
  );
router
  .route("/")
  .get(tourController.getTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.addTour
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getTourWithIn);
router.route("/distance/:latlng/unit/:unit").get(tourController.getDistances);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );
export { router };
