import bcrypt from "bcryptjs";
import { User } from "../Schemas/User";
import { generateToken } from "../utils/jwt";
import { AppError } from "../helpers/AppError";

export const userService = {
  registerUserService: async (userData) => {
    const userPayload: any = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    };

    const user = new User(userPayload);

    try {
      const savedUser = await user.save();
      return { message: "User registered successfully", savedUser };
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.email) {
        throw new AppError("Email already exists", 409);
      }
      throw new AppError("User registration failed", 500);
    }
  },

  loginUserService: async (credentials) => {
    try {
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        throw new AppError("User not found", 404);
      }
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!isPasswordValid) {
        throw new AppError("Invalid password", 401);
      }

      const userPayload = {
        id: user._id.toString(),
        email: user.email,
      };

      const token = generateToken(userPayload);

      if (!token) {
        throw new AppError("Token generation failed", 500);
      }

      return token;
    } catch (error) {
      throw new AppError(error.message || "Login failed", error.status || 500);
    }
  },
};
