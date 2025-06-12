import cron from "node-cron";
import { todoService } from "../services/todo.service";
import { User } from "../Schemas/User";
import { mailService } from "../config/mailService";

export const scheduler = async () => {
  // Schedule a task to run every day at 12:00 PM
  cron.schedule("0 12 * * *", async () => {
    //
    try {
      const users = await User.find({});
      let todos = [];
      for (const user of users) {
        const userTodos = await todoService.getTodosDueToday(user._id);
        todos = todos.concat(userTodos);
      }
      for (const todo of todos) {
        const user = await User.findById(todo.user);
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Reminder: ${todo.title} is due today`,
          text: `Don't forget to complete your task: ${todo.title}`,
        };
        await mailService.sendMail(mailOptions);
      }
      console.log("Email reminders sent successfully.");
    } catch (error) {
      console.error("Error sending email reminders:", error);
    }
  });
};
