import { z } from "zod";
import {
  ALPHA_NUMERIC,
  ONE_LETTER,
  ONE_LOWERCASE_LETTER,
  ONE_NUMBER,
  ONE_SPECIAL_CHARACTER,
  ONE_UPPERCASE_LETTER,
} from "../constant/regex";

//email
export const emailSchema = z.string().email().min(6).max(100);

//password
export const passwordSchema = z
  .string()
  .min(8)
  .max(100)
  .regex(ONE_NUMBER, { message: "At least one number is required" })
  .regex(ONE_LETTER, { message: "At least one letter is required" })
  .regex(ONE_LOWERCASE_LETTER, {
    message: "At least one lowercase letter is required",
  })
  .regex(ONE_UPPERCASE_LETTER, {
    message: "At least one uppercase letter is required",
  })
  .regex(ONE_SPECIAL_CHARACTER, {
    message: "At least one special character is required",
  });

//username
export const userNameSchema = z
  .string()
  .min(8)
  .max(12)
  .regex(ALPHA_NUMERIC, { message: "Username only allows alpha numeric" })
  .regex(ONE_NUMBER, { message: "At least one number is required" })
  .regex(ONE_LETTER, { message: "At least one letter is required" });

//verification code
export const verificationCodeSchema = z.string().min(6).max(24);

//confirm password
export const confirmPasswordSchema = z.string().min(8).max(100);

//register
export const registerSchema = z
  .object({
    email: emailSchema,
    userName: userNameSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    firstName: z.string().max(100).regex(ALPHA_NUMERIC, {
      message: "First name only allows alpha numeric",
    }),
    middleName: z
      .string()
      .optional()
      .refine((val) => val === undefined || val === "" || val.length <= 100, {
        message: "String must contain at most 100 character(s)",
      })
      .refine(
        (val) => val === undefined || val === "" || ALPHA_NUMERIC.test(val),
        {
          message: "Middle name only allows alpha numeric",
        }
      ),
    lastName: z.string().max(100).regex(ALPHA_NUMERIC, {
      message: "Last name only allows alpha numeric",
    }),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

//login
export const loginSchema = z.object({
  userName: userNameSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

//request password
export const requestPasswordSchema = z
  .object({
    verificationCode: verificationCodeSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
