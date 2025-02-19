import { Router } from "express";
import { getUser } from "../controller/user.controller";

const userRoute = Router();

userRoute.get("/", getUser);

export default userRoute;
