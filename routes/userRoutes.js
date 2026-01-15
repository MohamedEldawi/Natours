import express from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";
import { loginSchema, signupSchema } from "../validators/authSchema.js";

const router = express.Router();
// 1) not logged in routes
router.post(
  "/signup",
  authController.validate(signupSchema),
  authController.signup
);
router.post(
  "/login",
  authController.validate(loginSchema),
  authController.login
);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// 2) protected routes
router.use(authController.protect);
router.patch("/updatePassword", authController.updatePassword);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.userImageResize,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);
router.get("/me", userController.getMe, userController.getUser);

// 3) Adminstrator routes
router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
export { router };
