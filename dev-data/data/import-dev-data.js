import fs from "fs";
import path from "path";
const __dirname = import.meta.dirname;
import { Tour } from "./../../models/tourModel.js";
import { User } from "./../../models/userModel.js";
import { Review } from "./../../models/reviewModel.js";
import "./../../config.env.js";
import mongoose from "mongoose";

// 1) database connection
const connString = process.env.CONN_STRING.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);
try {
  await mongoose.connect(connString);
  console.log("Connected successfully");
} catch (error) {
  console.error("Failed to connect to database: ", error.message);
}

// 2) reading json file
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/tours.json"), "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/users.json"), "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/reviews.json"), "utf-8")
);

// 3) importing data
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    process.exit();
  } catch (error) {
    console.error("Could not post data: ", error);
  }
};

// 4) deleting data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    process.exit();
  } catch (error) {
    console.error("Could not delete data: ", error);
  }
};

// 5) excution
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
