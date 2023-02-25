import { ErrorObj } from "./type.js";

export const sleep = (ms: number): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const errToObj = (err: Error): ErrorObj => ({
  message: err.message,
  name: err.name,
  stack: err.stack
});
