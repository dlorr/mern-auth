import { Response, ErrorRequestHandler } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constant/http";
import { z } from "zod";
import AppError from "../util/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../util/cookie";

/**
 * Define a function to handle Zod validation errors.
 *
 * @param error - The Zod error object.
 * @param res - The Express response object.
 *
 * @note This function maps over the Zod error object to extract error messages and paths.
 * It returns a JSON response with a 400 (BAD_REQUEST) status code, containing the error messages and paths.
 * This allows the client to display specific error messages for each invalid field.
 */
const handleZodErrror = (res: Response, error: z.ZodError) => {
  // Extract error messages and paths from the Zod error object
  // The `errors` array contains objects with `path` and `message` properties
  const errors = error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  // Return a JSON response with the error messages and a 400 status code
  res.status(BAD_REQUEST).json({
    errors,
    message: error.message,
  });
};

/**
 * Define a function to handle AppError instances.
 *
 * @param error - The AppError instance.
 * @param res - The Express response object.
 *
 * @note This function returns a JSON response with the error message, error code, and a status code corresponding to the error.
 * The status code is determined by the `statusCode` property of the AppError instance.
 */
const handleAppError = (res: Response, error: AppError) => {
  // Return a JSON response with the error message, error code, and a status code corresponding to the error
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

/**
 * Define the error handler function.
 *
 * @param error - The error object.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next function in the middleware chain.
 *
 * @note This function catches and handles errors in the application, including Zod validation errors and AppError instances.
 * It logs the error and the request path to the console for debugging purposes.
 * It also clears authentication cookies for the refresh path to prevent unauthorized access.
 */
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  // Clear authentication cookies for the refresh path
  // This is necessary to prevent unauthorized access after an error occurs
  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }
  // Handle Zod validation errors
  // If the error is a ZodError instance, call the handleZodError function to return a JSON response with error messages
  if (error instanceof z.ZodError) {
    return handleZodErrror(res, error);
  }
  // Handle AppError instances
  // If the error is an AppError instance, call the handleAppError function to return a JSON response with error message and code
  if (error instanceof AppError) {
    return handleAppError(res, error);
  }
  // Return a generic internal server error response with a 500 status code
  // If the error is not a ZodError or AppError instance, return a generic error response
  res.status(INTERNAL_SERVER_ERROR).send("Internal server error");
};

export default errorHandler;
