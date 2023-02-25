import fs from "fs/promises";
import puppeteer from "puppeteer";
import { Job } from "./interface.js";
import jobProperties from "./job-properties.js";

const positions = ["software engineer"];
const numOfPage = 1; // Number of pages opened at the same time
const numOfIteration = 1; // Number of iterations

const browser = await puppeteer.launch({ headless: false });

const getJobs = async (
  position: string,
  indeedPage: number
): Promise<Job[]> => {
  console.log(`Getting jobs for ${position} on page ${indeedPage}...`);

  const positionSlug = position.split(" ").join("+");

  const page = await browser.newPage();
  const url = `https://ca.indeed.com/jobs?q=${positionSlug}&start=${indeedPage}`;
  console.log(url);

  await page
    .goto(url, {
      waitUntil: "networkidle0"
    })
    .catch((err) => {
      console.log(`Error: Fail to load page ${indeedPage} for ${position}`);
    });

  const jks = await page.evaluate(() => {
    const jobElements = document.querySelectorAll("*[data-jk]");
    return [...jobElements].map((jobElement) =>
      jobElement.getAttribute("data-jk")
    );
  });

  console.log(`Found ${jks.length} jobs: ${jks.join(", ")}`);

  const jobs = [];
  const errors: any = [];
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
                  `Error: Fail to find ${jobProperty.name} for job ${jk}`
                );
                errors.push({
                  job: jk,
                  property: jobProperty.name
                });
              })) || "";
        } else {
          jobPropertyElement =
            (await page
              .$eval(jobProperty.selector, (el) => el?.textContent?.trim())
              .catch((err) => {
                console.log(
                  `Error: Fail to find ${jobProperty.name} for job ${jk}`
                );
                errors.push({
                  job: jk,
                  property: jobProperty.name
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
                  `Error: Fail to find ${jobProperty.name} for job ${jk}`
                );
                errors.push({
                  job: jk,
                  property: jobProperty.name
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
                  `Error: Fail to find ${jobProperty.name} for job ${jk}`
                );
                errors.push({
                  job: jk,
                  property: jobProperty.name
                });
              })) || [];
        }

        if (jobPropertyElements) job[jobProperty.key] = jobPropertyElements;
      }
    }
    jobs.push(job);
  }

  await fs.writeFile(
    `./output/jobs/${positionSlug}-${indeedPage}.json`,
    JSON.stringify(jobs, null, 2)
  );
  await fs.writeFile(
    `${positionSlug}-${indeedPage}errors.json`,
    JSON.stringify(errors, null, 2)
  );
  return jobs;
};

const arr = new Array(numOfPage).fill(0).map((_, i) => i * 10);
const arr2 = new Array(numOfIteration).fill(0).map((_, i) => i);

for (const position of positions) {
  for await (const j of arr2) {
    await Promise.all(
      arr.map(async (i) => {
        await getJobs(position, i + numOfPage * 10 * j);
      })
    );
  }
}

await browser.close();
