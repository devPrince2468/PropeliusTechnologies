import { NextFunction, Response, Request } from "express";
import { loginUserSchema, registerUserSchema, User } from "../Schemas/User";
import { userService } from "../services/user.service";

export const userController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;

      const { error } = registerUserSchema.validate(body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      const userExists = await User.findOne({ email: body.email });
      if (userExists) {
        return res.status(409).json({ message: "User already exists" });
      }
      const response = await userService.registerUserService(body);
      res.status(201).json({
        message: `User with email :${response.savedUser.email} registered successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const credentials = req.body;

      const { error } = loginUserSchema.validate(credentials);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const response = await userService.loginUserService(credentials);

      // in case of cookie based error --send the token in the response
      res
        .cookie("token", response, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 1000,
          sameSite: "lax",
        })
        .json({
          message: "Logged in successfully",
          token: response,
        });
    } catch (error) {
      next(error);
    }
  },
};
export default userController;
