import express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoose from "mongoose";

import router from "./routers/index";
import { apiLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());

const allowedOrigins = [];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

const { PORT = 8000 } = process.env;

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to Todo app" });
});

app.get("*", (req: Request, res: Response) => {
  res.status(505).json({ message: "Bad Request" });
});

app.use(errorHandler);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB connected!");

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
})();
