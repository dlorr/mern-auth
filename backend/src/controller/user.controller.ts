import catchError from "../util/catchError";
import UserModel from "../model/user.model";
import appAssert from "../util/appAssert";
import { NOT_FOUND, OK } from "../constant/http";

export const getUser = catchError(async (req, res) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");
  return res.status(OK).json(user.omitPassword());
});
