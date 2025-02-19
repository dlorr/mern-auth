import assert from "node:assert";
import AppError from "./AppError";
import { HttpStatusCode } from "../constant/http";
import AppErrorCode from "../constant/appErrorCode";

/**
 * Define a type for the appAssert function.
 *
 * @param condition - The condition to be asserted.
 * @param httpStatusCode - The HTTP status code to be used in the error.
 * @param message - The error message.
 * @param appErrorCode - The custom error code (optional).
 *
 * @returns asserts condition - If the condition is true, the function returns without throwing an error.
 *
 * @note This type alias represents a function that asserts a condition and throws an AppError if the condition is false.
 * The function takes four parameters:
 * - `condition`: a value of any type.
 * - `httpStatusCode`: a value of type `HttpStatusCode`.
 * - `message`: a string.
 * - `appErrorCode`: an optional value of type `AppErrorCode`.
 *
 * The function uses the `assert` function from the `node:assert` module.
 * If the `condition` is false, the `assert` function will throw an error.
 * In this case, the function passes a new `AppError` instance to the `assert` function.
 * The `AppError` instance is created with the `httpStatusCode`, `message`, and `appErrorCode` parameters.
 */
type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

/**
 * Define the appAssert function, which asserts a condition and throws an AppError if it is false.
 *
 * @param condition - The condition to be asserted.
 * @param httpStatusCode - The HTTP status code to be used in the error.
 * @param message - The error message.
 * @param appErrorCode - The custom error code (optional).
 *
 * @note This function takes four parameters:
 * - `condition`: a value of any type.
 * - `httpStatusCode`: a value of type `HttpStatusCode`.
 * - `message`: a string.
 * - `appErrorCode`: an optional value of type `AppErrorCode`.
 *
 * The function uses the `assert` function from the `node:assert` module.
 * If the `condition` is false, the `assert` function will throw an error.
 * In this case, the function passes a new `AppError` instance to the `assert` function.
 * The `AppError` instance is created with the `httpStatusCode`, `message`, and `appErrorCode` parameters.
 */
const appAssert: AppAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));
// Use the assert function to assert the condition.
// If the condition is false, the assert function will throw an error.
// In this case, we pass a new AppError instance to the assert function.

export default appAssert;
