import bcrypt from "bcrypt";

//use async function that returns a promise from bcrypt.hash.
//the caller of hashValue will need to use await or .then() to wait for the promise to resolve.
//await hashValue(this.password) in user.model.ts pre save uses await.
export const hashValue = async (value: string, saltRounds?: number) => {
  return bcrypt.hash(value, saltRounds || 10);
};

//use async function that returns a promise from bcrypt.compare.
//it uses .catch() to handle any errors that might occur.
//the .catch() method returns a new promise that resolves to the value returned by the callback function, which is false in this case.
//the caller of compareValue will need to use await or .then() to wait for the promise to resolve.
export const compareValue = async (value: string, hash: string) => {
  return bcrypt.compare(value, hash).catch(() => false);
};
