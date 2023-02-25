import fs from "fs/promises";
import { JobError } from "./interface.js";

export const logJobError = async (err: JobError): Promise<void> => {
  const fileName = `./logs/job-error-${new Date()
    .toISOString()
    .slice(0, 10)}.log`;
  try {
    return await fs.appendFile(
      fileName,
      `
Timestamp: ${new Date().toISOString()}
Error message: ${err.message.replace("Error:", "")}
Name: ${err.name}
Stack trace: ${err.stack}
Job: ${err.job}
Property: ${err.property}
`
    );
  } catch (error) {
    return await fs.writeFile(
      fileName,
      `
Timestamp: ${new Date().toISOString()}
Error message: ${err.message.replace("Error:", "")}
Name: ${err.name}
Stack trace: ${err.stack}
Job: ${err.job}
Property: ${err.property}
`
    );
  }
};
