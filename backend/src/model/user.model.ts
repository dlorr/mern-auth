import mongoose from "mongoose";
import { compareValue, hashValue } from "../util/bcrypt";

export interface UserDocument extends mongoose.Document {
  email: string;
  userName: string;
  password: string;
  verified: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | "_id"
    | "email"
    | "userName"
    | "verified"
    | "firstName"
    | "middleName"
    | "lastName"
    | "createdAt"
    | "updatedAt"
  >;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: mongoose.Schema.Types.String, required: true, unique: true },
    userName: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    password: { type: mongoose.Schema.Types.String, required: true },
    verified: {
      type: mongoose.Schema.Types.Boolean,
      required: true,
      default: false,
    },
    firstName: { type: mongoose.Schema.Types.String, required: true },
    middleName: { type: mongoose.Schema.Types.String },
    lastName: { type: mongoose.Schema.Types.String, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  //hashValue is called with await.
  //means that the hook will wait for the promise returned by hashValue to resolve before continuing.
  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  //the method itself is defined as async.
  //means that the method returns a promise that resolves to the result of compareValue.
  //compareValue is called without await.
  //the caller of comparePassword will need to use await or .then() to wait for the promise to resolve.
  //await user.comparePassword(params.password) in auth.service.ts loginUser function uses await.
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
