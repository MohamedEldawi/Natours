import "./config.env.js";
import mongoose from "mongoose";
import { app } from "./app.js";

const port = process.env.PORT || 3000;

// 1) Database connection
const connString = process.env.CONN_STRING.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);
try {
  await mongoose.connect(connString);
  console.log("Connected successfully to DB");
} catch (err) {
  console.log("DB connection Failed: ", err.message);
}

// 2) Start the server
const server = app.listen(port, () => {
  console.log(`I am listing on port ${port}`);
});

// hanlde asynchrounous errors that is not caught by express
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("Unhandeled Rejection shutting down...");
  server.close(() => {
    process.exit(1);
  });
});

// handle syncronohous errors that is not caught by express
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("Uncaught Exception shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
