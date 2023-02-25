export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const errToObj = (err) => ({
    message: err.message,
    name: err.name,
    stack: err.stack
});
//# sourceMappingURL=util.js.map