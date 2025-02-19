import AppErrorCode from "../constant/appErrorCode";
import { HttpStatusCode } from "../constant/http";

/**
 * Define a custom error class, AppError, that extends the built-in Error class.
 *
 * @note This class is used to create custom error objects that contain additional information,
 * such as an HTTP status code and a custom error code.
 */
class AppError extends Error {
  /**
   * Constructor for the AppError class.
   *
   * @param statusCode - The HTTP status code associated with the error.
   * @param message - The error message.
   * @param errorCode - The custom error code (optional).
   *
   * @note The constructor takes three parameters: `statusCode`, `message`, and `errorCode`.
   * The `statusCode` parameter is used to set the HTTP status code associated with the error.
   * The `message` parameter is used to set the error message.
   * The `errorCode` parameter is optional and is used to set a custom error code.
   */
  constructor(
    public statusCode: HttpStatusCode, // HTTP status code
    public message: string, // Error message
    public errorCode?: AppErrorCode // Custom error code (optional)
  ) {
    // Call the superclass constructor with the error message
    // This sets the `message` property of the error object
    super(message);
  }
}

export default AppError;
