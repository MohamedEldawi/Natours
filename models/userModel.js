import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
const saltRounds = 10;
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every user must have a name "],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Every user must have an email address"],
      lowercase: true,
      unique: true,

      validate: [validator.isEmail, "Invalid Email"],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [8, "Password must be more than 8 chars"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Confirm Password Please"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password didn't match",
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "guide", "Lead-guide", "admin", "CEO"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    tokenExpireDate: {
      type: Date,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// hashing passowords
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, saltRounds);
  this.passwordConfirm = undefined;
});

// change password change time when user update the password
userSchema.pre("save", async function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

// removing inactive users from the find querys
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

// check password
userSchema.methods.checkPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

// check for old JWT
userSchema.methods.checkChangePassword = function (JWTTimeIat) {
  if (this.passwordChangedAt) {
    const passwordChangedByTime = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimeIat < passwordChangedByTime;
  }
  return false;
};

// create token for reset password
userSchema.methods.createResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordToken = tokenHash;
  this.tokenExpireDate = Date.now() + 10 * 60 * 1000;
  return token;
};

// update password
userSchema.methods.updatePassword = function (password, passwordConfirm) {
  this.password = password;
  this.passwordConfirm = passwordConfirm;
  this.resetPasswordToken = undefined;
  this.tokenExpireDate = undefined;
};

const User = new mongoose.model("User", userSchema);
export { User };
