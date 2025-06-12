import mongoose, { Schema, Document } from "mongoose";
import Joi from "joi";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (this: IUser, next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password as string, 10);
  }
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema);

export const registerUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
