import { mailService } from "../config/mailService";
import { AppError } from "../helpers/AppError";
import { Todo } from "../Schemas/Todo";
import { User } from "../Schemas/User";

export const todoService = {
  getTodos: async (userId: string) => {
    try {
      let todos;

      todos = await Todo.find({ user: userId });

      if (!todos || todos.length === 0) {
        throw new AppError("No todos found for this user", 404);
      }
      return todos;
    } catch (error) {
      throw new AppError(error.message || "Error fetching todo", 500);
    }
  },
  getTodo: async (todoId: string, userId: string) => {
    try {
      let todo;

      todo = await Todo.findOne({ _id: todoId, user: userId });
      if (!todo) {
        throw new AppError("Todo not found", 404);
      }
      return todo;
    } catch (error) {
      throw new AppError(error.message || "Error fetching todo", 500);
    }
  },
  addTodo: async (todoData: any, userId: string) => {
    try {
      if (todoData.dueDate) {
        const dueDate = new Date(todoData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(dueDate.getTime())) {
          throw new AppError("Invalid dueDate format", 400);
        }
        if (dueDate < today) {
          throw new AppError("dueDate cannot be in the past", 400);
        }
        todoData.dueDate = dueDate;
      }
      todoData.user = userId;
      const newTodo = new Todo(todoData);
      await newTodo.save();
      // send email notification
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      console.log("Sending email notification for new todo");
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new AppError("Email configuration is not set", 500);
      }
      const emailSent = await mailService.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "New Todo Added",
        text: `A new todo has been added: ${newTodo.title}`,
        html: `<p>A new todo has been added: <strong>${newTodo.title}</strong></p>`,
      });
      if (!emailSent) {
        throw new AppError("Failed to send email notification", 500);
      }
      return newTodo;
    } catch (error) {
      throw new AppError(error.message || "Error adding todo", 500);
    }
  },
  updateTodo: async (todoId: string, todoData: any, userId: string) => {
    try {
      if (todoData.dueDate) {
        const dueDate = new Date(todoData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(dueDate.getTime())) {
          throw new AppError("Invalid dueDate format", 400);
        }
        if (dueDate < today) {
          throw new AppError("dueDate cannot be in the past", 400);
        }
        todoData.dueDate = dueDate;
      }
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: todoId, user: userId },
        { $set: todoData },
        { new: true }
      );
      if (!updatedTodo) {
        throw new AppError("Todo not found", 404);
      }
      return updatedTodo;
    } catch (error) {
      throw new AppError(error.message || "Error updating todo", 500);
    }
  },
  deleteTodo: async (todoId: string, userId: string) => {
    try {
      const deletedTodo = await Todo.findOneAndDelete({
        _id: todoId,
        user: userId,
      });
      if (!deletedTodo) {
        throw new AppError("Todo not found", 404);
      }
      return deletedTodo;
    } catch (error) {
      throw new AppError(error.message || "Error deleting todo", 500);
    }
  },
  markTodoComplete: async (todoId: string, userId: string) => {
    try {
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: todoId, user: userId },
        { completed: true },
        { new: true }
      );
      if (!updatedTodo) {
        throw new AppError("Todo not found", 404);
      }
      return updatedTodo;
    } catch (error) {
      throw new AppError(
        error.message || "Error marking todo as complete",
        500
      );
    }
  },
  unmarkTodoComplete: async (todoId: string, userId: string) => {
    try {
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: todoId, user: userId },
        { completed: false },
        { new: true }
      );
      if (!updatedTodo) {
        throw new AppError("Todo not found", 404);
      }
      return updatedTodo;
    } catch (error) {
      throw new AppError(
        error.message || "Error unmarking todo as complete",
        500
      );
    }
  },
};
