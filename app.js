import { router as userRouter } from "./routes/userRoutes.js";
import { router as tourRouter } from "./routes/tourRoutes.js";
import { router as reviewRouter } from "./routes/reviewRoutes.js";
import { router as viewsRouter } from "./routes/viewsRoutes.js";
import { router as bookingRouter } from "./routes/bookingRoutes.js";
import { webhook } from "./controllers/bookingController.js";
import { appError } from "./utilis/appError.js";
import { errorController } from "./controllers/errorController.js";
import rateLimit from "express-rate-limit";
import normalzieQuery from "./utilis/normalzieQuery.js";
import helmet from "helmet";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import expressEjsLayouts from "express-ejs-layouts";

const app = express();

// Global middlerwares

// Security & headers
app.use(helmet({ contentSecurityPolicy: false }));
app.set("trust proxy", 1);

// CORS
app.use(cors());
app.options(/./, cors());

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP! try again in an hour",
});
app.use("/api", limiter);

// stripe webhook route
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhook
);

// Body & cookie parsing
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// Query parsing
app.set("query parser", "extended");
app.use(normalzieQuery); // customized  middleware to prevent parameter pollution

// logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// static files
app.use(express.static("public"));

// View engine
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "base");

// Compression
app.use(compression());

// Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/", viewsRouter);

// 404 handler
app.all(/./, (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorController);

// exporting  app
export { app };
