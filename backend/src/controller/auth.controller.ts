import catchError from "../util/catchError";
import {
  createUser,
  loginUser,
  refreshUserAccessToken,
  verifyUserEmail,
  sendPasswordResetEmail,
  resetUserPassword,
} from "../service/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constant/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../util/cookie";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  requestPasswordSchema,
  verificationCodeSchema,
} from "../schema/auth.schema";
import { verifyToken } from "../util/jwt";
import SessionModel from "../model/session.model";
import appAssert from "../util/appAssert";

export const register = catchError(async (req, res) => {
  //validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //call service
  const { user, accessToken, refreshToken } = await createUser(request);

  //return response
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

export const login = catchError(async (req, res) => {
  //validate request
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //call service
  const { user, accessToken, refreshToken } = await loginUser(request);

  //return response
  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: "Login successful",
  });
});

export const logout = catchError(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const { payload } = verifyToken(accessToken);
  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }
  return clearAuthCookies(res).status(OK).json({
    message: "Logout successful",
  });
});

export const refresh = catchError(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({
      message: "Access token refreshed",
      refreshToken: newRefreshToken,
    });
});

export const verifyEmail = catchError(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyUserEmail(verificationCode);

  return res.status(OK).json({
    message: "Email was successfully verified",
  });
});

export const forgotPassword = catchError(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordResetEmail(email);

  return res.status(OK).json({
    message: "Password reset email sent",
  });
});

export const resetPassword = catchError(async (req, res) => {
  const request = requestPasswordSchema.parse(req.body);

  await resetUserPassword(request);

  return clearAuthCookies(res).status(OK).json({
    message: "Password reset successful",
  });
});
