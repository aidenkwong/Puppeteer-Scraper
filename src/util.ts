export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const errToObj = (err: Error) => ({
  message: err.message,
  name: err.name,
  stack: err.stack
});
