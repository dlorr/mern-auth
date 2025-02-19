import { NextFunction, Request, Response } from "express";

/**
 * Define a type for an asynchronous controller function.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next function in the middleware chain.
 *
 * @returns Promise<any> - A promise that resolves to any value.
 *
 * @note This type represents an asynchronous function that takes an Express request, response, and next function as parameters.
 * The function returns a promise that resolves to any value, allowing for flexible error handling and response generation.
 */
type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Define a higher-order function, catchError, that catches and handles errors in asynchronous controller functions.
 *
 * @param controller - The asynchronous controller function to be wrapped.
 *
 * @returns AsyncController - A new asynchronous controller function that catches and handles errors.
 *
 * @note This function takes an asynchronous controller function as an argument and returns a new function that wraps the original function.
 * The new function catches any errors that occur during the execution of the original function and passes them to the next function in the middleware chain.
 */
const catchError =
  (controller: AsyncController): AsyncController =>
  async (req, res, next) => {
    try {
      // Call the original controller function and await its promise.
      // This allows the original function to complete its execution and return a promise.
      await controller(req, res, next);
    } catch (error) {
      // If an error occurs, pass it to the next function in the middleware chain.
      // This allows the error to be handled by the next function in the chain, such as an error handler middleware.
      next(error);
    }
  };

export default catchError;
