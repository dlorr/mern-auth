import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDb from "./config/db";
import { APP_ORIGIN, PORT } from "./constant/env";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constant/http";
import authRoute from "./route/auth.route";
import authenticate from "./middleware/authenticate";
import userRoute from "./route/user.route";
import sessionRoute from "./route/session.route";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(OK).json({
    status: "Success",
    message: "Connected Successfully",
  });
});

app.use("/auth", authRoute);
//protected routes
app.use("/user", authenticate, userRoute);
app.use("/session", authenticate, sessionRoute);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}/`);
  await connectToDb();
});
