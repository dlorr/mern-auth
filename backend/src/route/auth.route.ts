import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controller/auth.controller";

const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/logout", logout);
authRoute.get("/refresh", refresh);
authRoute.get("/email/verify/:code", verifyEmail);
authRoute.post("/password/forgot", forgotPassword);
authRoute.post("/password/reset", resetPassword);

export default authRoute;
