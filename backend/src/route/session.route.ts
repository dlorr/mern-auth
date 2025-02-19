import { Router } from "express";
import { getSessions, deleteSession } from "../controller/session.controller";

const sessionRoute = Router();

sessionRoute.get("/sessions", getSessions);
sessionRoute.delete("/:id", deleteSession);

export default sessionRoute;
