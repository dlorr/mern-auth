import catchError from "../util/catchError";
import SessionModel from "../model/session.model";
import { NOT_FOUND, OK } from "../constant/http";
import { z } from "zod";
import appAssert from "../util/appAssert";

export const getSessions = catchError(async (req, res) => {
  const sessions = await SessionModel.find(
    {
      userId: req.userId,
      expiresAt: { $gt: new Date() },
    },
    {
      _id: 1,
      userAgent: 1,
      createdAt: 1,
    },
    {
      sort: { createdAt: -1 },
    }
  );
  return res.status(OK).json(
    sessions.map((session) => ({
      ...session.toObject(),
      ...(session.id === req.sessionId && {
        isCurrent: true,
      }),
    }))
  );
});

export const deleteSession = catchError(async (req, res) => {
  const sessionId = z.string().parse(req.params.id);
  const deletedSession = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId: req.userId,
  });
  appAssert(deletedSession, NOT_FOUND, "Session not found");
  return res.status(OK).json({
    message: "Session removed",
  });
});
