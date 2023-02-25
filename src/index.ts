import fs from "fs/promises";
import puppeteer from "puppeteer";
import { logJobError } from "./error.js";
import { Job } from "./interface.js";
import jobProperties from "./job-properties.js";

const positions = ["software engineer"];
const numOfPage = 1; // Number of pages opened at the same time
const numOfIteration = 1; // Number of iterations

const headless = true;
const viewPort = {
  width: 1400,
  height: 789
};

const getPositionSlug = (position: string): string => {
  return position.split(" ").join("+");
};

const browser = await puppeteer.launch({ headless });

const getJobs = async (
  position: string,
  indeedPage: number
): Promise<Job[]> => {
  console.log(`Getting jobs for ${position} on page ${indeedPage}...`);

  const positionSlug = getPositionSlug(position);

  const page = await browser.newPage();

  await page.setViewport(viewPort);

  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9"
  });

  const url = `https://ca.indeed.com/jobs?q=${positionSlug}&start=${indeedPage}`;

  console.log(`Visiting ${url} for ${position}...`);

  await page
    .goto(url, {
      waitUntil: "networkidle0"
    })
    .catch(() => {
      console.log(`Warning: Fail to load page ${indeedPage} for ${position}`);
    });

  const jks = await page.evaluate(async () => {
    const jobElements = document.querySelectorAll("*[data-jk]");
    return [...jobElements].map((jobElement) =>
      jobElement.getAttribute("data-jk")
    );
  });

  console.log(`Found ${jks.length} jobs:\n${jks.join(", ")}`);

  const jobs: Job[] = [];

  for (const jk of jks) {
    await page.goto(`https://ca.indeed.com/viewjob?jk=${jk}`, {
      waitUntil: "networkidle0"
    });
    const job: Job = {
      title: "",
      company: "",
      salary: "",
      location: "",
      reviews: "",
      stars: "",
      jobType: [],
      jobDescription: "",
      jobActivity: []
    };
    for (const jobProperty of jobProperties) {
      if (jobProperty.number === "single") {
        let jobPropertyElement: string;
        if (jobProperty.type === "attribute" && jobProperty.attribute) {
          jobPropertyElement =
            (await page
              .evaluate(
                (selector: string, attribute: string) => {
                  const el = document.querySelector(selector);
                  return el?.getAttribute(attribute) || "";
                },
                jobProperty.selector,
                jobProperty.attribute
              )
              .catch((err) => {
                console.log(
                  `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                );
                logJobError({
                  job: jk || "",
                  property: jobProperty.name || "",
                  name: err.name,
                  message: err.message,
                  stack: err.stack
                });
              })) || "";
        } else {
          jobPropertyElement =
            (await page
              .$eval(jobProperty.selector, (el) => el?.textContent?.trim())
              .catch((err) => {
                console.log(
                  `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                );
                logJobError({
                  job: jk || "",
                  property: jobProperty.name || "",
                  name: err.name,
                  message: err.message,
                  stack: err.stack
                });
              })) || "";
        }

        if (jobPropertyElement) job[jobProperty.key] = jobPropertyElement;
      } else if (jobProperty.number === "multiple") {
        let jobPropertyElements: Array<string>;
        if (jobProperty.type === "attribute" && jobProperty.attribute) {
          jobPropertyElements =
            (await page
              .evaluate(
                (selector: string, attribute: string) => {
                  const els = document.querySelectorAll(selector);
                  return [...els].map(
                    (el) => el?.getAttribute(attribute) || ""
                  );
                },
                jobProperty.selector,
                jobProperty.attribute
              )
              .catch((err) => {
                console.log(
                  `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                );
                logJobError({
                  job: jk || "",
                  property: jobProperty.name || "",
                  name: err.name,
                  message: err.message,
                  stack: err.stack
                });
              })) || [];
        } else {
          jobPropertyElements =
            (await page
              .$$eval(jobProperty.selector, (els) =>
                els
                  .map((el) => el?.textContent?.trim() || "")
                  .filter((itm) => itm !== "")
              )
              .catch((err) => {
                console.log(
                  `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                );
                logJobError({
                  job: jk || "",
                  property: jobProperty.name || "",
                  name: err.name,
                  message: err.message,
                  stack: err.stack
                });
              })) || [];
        }

        if (jobPropertyElements) job[jobProperty.key] = jobPropertyElements;
      }
    }
    jobs.push(job);
  }

  return jobs;
};

const arr = new Array(numOfPage).fill(0).map((_, i) => i * 10);
const arr2 = new Array(numOfIteration).fill(0).map((_, i) => i);

for (const position of positions) {
  for await (const j of arr2) {
    await Promise.all(
      arr.map(async (i) => {
        const page = i + numOfPage * 10 * j;
        const jobs = await getJobs(position, page);
        await fs.writeFile(
          `./output/jobs/${getPositionSlug(position)}-${page}.json`,
          JSON.stringify(jobs, null, 2)
        );
      })
    );
  }
}

await browser.close();
