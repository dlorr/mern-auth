import { RequestHandler } from "express";
import appAssert from "../util/appAssert";
import { UNAUTHORIZED } from "../constant/http";
import AppErrorCode from "../constant/appErrorCode";
import { verifyToken } from "../util/jwt";

const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Not authorized",
      AppErrorCode.InvalidAccessToken
    );

    const { error, payload } = verifyToken(accessToken);
    appAssert(
      payload,
      UNAUTHORIZED,
      error === "jwt expired" ? "Token expired" : "Invalid Token",
      AppErrorCode.InvalidAccessToken
    );

    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
