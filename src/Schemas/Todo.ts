import { Schema, model, Document, Types } from "mongoose";
import Joi from "joi";

export interface ITodo extends Document {
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  user: Types.ObjectId;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [2, "Title must be at least 2 characters long"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
  },
  { timestamps: true }
);

export const Todo = model<ITodo>("Todo", TodoSchema);

// Joi validation schema
export const todoJoiSchema = Joi.object({
  title: Joi.string().min(2).required(),
  description: Joi.string().required(),
  dueDate: Joi.date().optional(),
  completed: Joi.boolean().optional(),
  user: Joi.string().optional(),
});
export const todoUpdateJoiSchema = Joi.object({
  title: Joi.string().min(2).optional(),
  description: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  completed: Joi.boolean().optional(),
});
