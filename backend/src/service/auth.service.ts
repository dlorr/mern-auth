import VerificationCodeType from "../constant/verificationCodeType";
import UserModel from "../model/user.model";
import VerificationCodeModel from "../model/verificationCode.model";
import {
  fiveMinutesAgo,
  ONE_DAY_IN_MILLISECONDS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../util/date";
import SessionModel from "../model/session.model";
import { APP_ORIGIN } from "../constant/env";
import appAssert from "../util/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constant/http";
import {
  refreshTokenSignOptions,
  refreshTokenVerifyOptions,
  signToken,
  verifyToken,
} from "../util/jwt";
import { sendEmail } from "../util/sendEmail";
import {
  getForgotPasswordTemplate,
  getVerifyEmailTemplate,
} from "../util/emailTemplate";
import { hashValue } from "../util/bcrypt";

type CreateUserParams = {
  email: string;
  userName: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userAgent?: string;
};
type LoginUserParams = {
  userName: string;
  password: string;
  userAgent?: string;
};
type ResetPasswordParams = {
  password: string;
  verificationCode: string;
};

export const createUser = async (params: CreateUserParams) => {
  //verify existence of email
  const existingEmail = await UserModel.exists({ email: params.email });
  appAssert(!existingEmail, CONFLICT, "Email already exists");

  //verify existence of username
  const existingUserName = await UserModel.exists({
    userName: params.userName,
  });
  appAssert(!existingUserName, CONFLICT, "Username already exists");

  //create user
  const user = await UserModel.create({
    email: params.email,
    userName: params.userName,
    password: params.password,
    firstName: params.firstName,
    middleName: params.middleName,
    lastName: params.lastName,
  });
  const userId = user._id;

  //create verification token
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

  //send verification email
  const { data, error } = await sendEmail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });
  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  //create session
  const session = await SessionModel.create({
    userId,
    userAgent: params.userAgent,
    expiresAt: thirtyDaysFromNow(),
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  //sign access token and refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userId,
  });

  //return user and tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (params: LoginUserParams) => {
  //get user by username
  const user = await UserModel.findOne({ userName: params.userName });
  appAssert(user, UNAUTHORIZED, "Invalid username or password");

  //validate password
  const isValid = await user.comparePassword(params.password);
  appAssert(isValid, UNAUTHORIZED, "Invalid username or password");

  const userId = user._id;

  //create session
  const session = await SessionModel.create({
    userId,
    userAgent: params.userAgent,
    expiresAt: thirtyDaysFromNow(),
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  //sign access token and refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userId,
  });

  //return user & tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken(refreshToken, refreshTokenVerifyOptions);
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);
  const dateNow = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > dateNow,
    UNAUTHORIZED,
    "Session expired"
  );

  //refresh session if it expires in the next 24 hours
  const sessionNeedsRefresh =
    session.expiresAt.getTime() - dateNow < ONE_DAY_IN_MILLISECONDS;

  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const sessionInfo = {
    sessionId: session._id,
  };

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(sessionInfo, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    ...sessionInfo,
    userId: session.userId,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyUserEmail = async (code: string) => {
  //get verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  //update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    { verified: true },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  //delete verification code
  await validCode.deleteOne();

  //return user
  return {
    user: updatedUser.omitPassword(),
  };
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    //get user by email
    const user = await UserModel.findOne({ email });
    appAssert(user, NOT_FOUND, "User not found");

    //check email rate limit
    const fiveMinsAgo = fiveMinutesAgo();
    const count = await VerificationCodeModel.countDocuments({
      userId: user._id,
      type: VerificationCodeType.ForgotPassword,
      createdAt: { $gt: fiveMinsAgo },
    });
    appAssert(
      count <= 1,
      TOO_MANY_REQUESTS,
      "Too many requests, please try again later"
    );

    //create verification code
    const expiresAt = oneHourFromNow();
    const verificationCode = await VerificationCodeModel.create({
      userId: user._id,
      type: VerificationCodeType.ForgotPassword,
      expiresAt,
    });

    //send verification email
    const url = `${APP_ORIGIN}/password/reset?code=${
      verificationCode._id
    }&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendEmail({
      to: email,
      ...getForgotPasswordTemplate(url),
    });
    appAssert(
      data?.id,
      INTERNAL_SERVER_ERROR,
      `${error?.name} - ${error?.message}`
    );

    //return success
    return {
      url,
      emailId: data.id,
    };
  } catch (error: any) {
    console.log("SendPasswordResetEmailError:", error.message);
    return {};
  }
};

export const resetUserPassword = async ({
  password,
  verificationCode,
}: ResetPasswordParams) => {
  //get verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.ForgotPassword,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  //update user's password
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      password: await hashValue(password),
    },
    {
      new: true,
    }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  //delete verification code
  await validCode.deleteOne();

  //clear all sessions
  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });

  //return user
  return {
    user: updatedUser.omitPassword(),
  };
};
