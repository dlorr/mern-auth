import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDocument } from "../model/session.model";
import { UserDocument } from "../model/user.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constant/env";

export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};
export type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
};
const defaults: SignOptions = {
  audience: ["user"],
};

// Define the SignOptionsAndSecret type
type SignOptionsAndSecret = SignOptions & {
  secret: string;
};
const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  secret: JWT_SECRET,
};
export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

// Define the VerifyOptionsAndSecret type
type VerifyOptionsAndSecret = VerifyOptions & {
  secret: string;
};
const accessTokenVerifyOptions: VerifyOptionsAndSecret = {
  secret: JWT_SECRET,
};
export const refreshTokenVerifyOptions: VerifyOptionsAndSecret = {
  secret: JWT_REFRESH_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOptions } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaults,
    ...signOptions,
  });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptionsAndSecret
) => {
  const { secret, ...verifyOptions } = options || accessTokenVerifyOptions;
  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOptions,
    }) as TPayload;

    return {
      payload,
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
