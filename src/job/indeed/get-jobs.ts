import fs from "fs/promises";
import puppeteer from "puppeteer";
import getBrowser from "../../puppeteer/getBrowser.js";
import { Job } from "./interface.js";
import jobProperties from "./job-properties.js";
import chalk from "chalk";

type GetJobOptions = {
  positions: string[];
  numOfPage?: number;
  numOfIteration?: number;
};

getJobs({
  positions: ["software developer"],
  numOfPage: 3,
  numOfIteration: 10
});

function getPositionSlug(position: string): string {
  return position.split(" ").join("+");
}

async function getJobs({
  positions,
  numOfPage = 1,
  numOfIteration = 1
}: GetJobOptions): Promise<void> {
  // Indeed page is 0 indexed, with 2nd page being 10, 3rd page being 20, so on and so forth
  const browser = await getBrowser({});
  const arr = new Array(numOfPage).fill(0).map((_, i) => i * 10);
  const arr2 = new Array(numOfIteration).fill(0).map((_, i) => i);

  for (const position of positions) {
    for await (const j of arr2) {
      await Promise.all(
        arr.map(async (i) => {
          const page = i + numOfPage * 10 * j;
          const jobs = await scrape(browser, position, page);
          // await fs.writeFile(
          //   `./output/jobs/indeed/raw/${new Date().toISOString()}-${getPositionSlug(
          //     position
          //   )}-${page}.json`,
          //   JSON.stringify(jobs, null, 2)
          // );
        })
      );
    }
  }
  await browser.close();
}

async function scrape(
  browser: puppeteer.Browser,
  position: string,
  indeedPage: number
): Promise<Job[]> {
  console.log(
    `Getting jobs for ${chalk.blue(position)} on page ${chalk.blue(
      indeedPage / 10 + 1
    )}...`
  );

  const positionSlug = getPositionSlug(position);

  const page = await browser.newPage();

  // Use this viewport to get the appropriate UI for scraping
  await page.setViewport({
    width: 1400,
    height: 789
  });

  // User agent and http header is required, otherwise there will be a 403 error
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9"
  });

  const url = `https://ca.indeed.com/jobs?q=${positionSlug}&start=${indeedPage}&sort=date`;

  console.log(`Visiting ${chalk.blue(url)} for ${chalk.blue(position)}...`);

  await page
    .goto(url, {
      waitUntil: "networkidle0"
    })
    .catch(() => {
      console.log(`Warning: Fail to load page ${indeedPage} for ${position}`);
    });

  // jk is the job key on indeed
  const jks = await page.evaluate(async () => {
    const jobElements = document.querySelectorAll("*[data-jk]");
    return [...jobElements].map((jobElement) =>
      jobElement.getAttribute("data-jk")
    );
  });

  console.log(`Found ${chalk.green(jks.length)} jobs:\n${jks.join(",")}`);

  const jobs: Job[] = [];

  for (const jk of jks) {
    if (!jk) continue;

    // Go to the page of the job with the jk
    await page.goto(`https://ca.indeed.com/viewjob?jk=${jk}`, {
      waitUntil: "networkidle0"
    });

    const job: Job = {
      jk,
      title: "",
      company: "",
      location: "",
      jobDetails: "",
      salaryInfoAndJobType: "",
      qualifications: "",
      reviews: "",
      stars: "",
      jobDescription: "",
      benefits: "",
      hiringInsights: "",
      jobActivity: ""
    };

    // Get the job properties
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
                // console.log(
                //   `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                // );
              })) || "";
        } else {
          jobPropertyElement =
            (await page
              .$eval(jobProperty.selector, (el) => el?.textContent?.trim())
              .catch((err) => {
                // console.log(
                //   `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                // );
              })) || "";
        }

        if (jobPropertyElement) job[jobProperty.key] = jobPropertyElement;
      } else if (jobProperty.number === "multiple") {
        let jobPropertyElements: string;
        if (jobProperty.type === "attribute" && jobProperty.attribute) {
          jobPropertyElements =
            (await page
              .evaluate(
                (selector: string, attribute: string) => {
                  const els = document.querySelectorAll(selector);
                  return [...els]
                    .map((el) => el?.getAttribute(attribute) || "")
                    .join(", ");
                },
                jobProperty.selector,
                jobProperty.attribute
              )
              .catch((err) => {
                // console.log(
                //   `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                // );
              })) || "";
        } else {
          jobPropertyElements =
            (await page
              .$$eval(jobProperty.selector, (els) =>
                els
                  .map((el) => el?.textContent?.trim() || "")
                  .filter((itm) => itm !== "")
                  .join(", ")
              )
              .catch((err) => {
                // console.log(
                //   `Warning: Fail to find ${jobProperty.name} for job ${jk}`
                // );
              })) || "";
        }

        if (jobPropertyElements) job[jobProperty.key] = jobPropertyElements;
      }
    }

    const checkResult = await jobCheck(job);
    const fileName = `./output/jobs/indeed/selected/${new Date()
      .toISOString()
      .slice(0, 10)}-jobs.txt`;

    if (checkResult && checkResult.matchedKw.length > 0) {
      const { yoes, matchedKw } = checkResult;
      console.log(`Selected job: ${chalk.green(jk)}`);

      await writeFile(
        fileName,
        `https://ca.indeed.com/viewjob?jk=${jk} [yoe]${yoes} [Matched Keywords:]${matchedKw}\n`
      );
    } else if (checkResult && checkResult.yoeMatches.length === 0) {
      console.log(`Selected job: ${chalk.green(jk)} (no yoe)`);

      await writeFile(
        fileName,
        `No yoe: https://ca.indeed.com/viewjob?jk=${jk}\n`
      );
    }

    job.jobDetails = job.jobDetails
      .replace("Job details", "")
      .replace("Job type", "");
    job.qualifications = job.qualifications.replace("Qualifications", "");
    jobs.push(job);
  }

  return jobs;
}

async function jobCheck(job: Job): Promise<{
  yoeMatches: string[];
  yoes: string[];
  matchedKw: string[];
} | void> {
  const jobDescription = job.jobDescription.toLowerCase();
  const jobQualifications = job.qualifications.toLowerCase();
  const jobTitle = job.title.toLowerCase();

  const inTitle = ["software", "developer", "engineer", "programmer"];
  const notInTitle = [
    "senior",
    "lead",
    "manager",
    "director",
    "architect",
    "sr.",
    "sr",
    "principal",
    "intern",
    ".net",
    "ios",
    "android",
    "embedded",
    "c++",
    "security",
    "cloud",
    "xcode",
    "php",
    "devops",
    "blueprism"
  ].map((kw) => kw.toLowerCase());

  const inJobDescription = ["javascript", "python", "typescript"];
  const notInJobDescription: string[] = [".net", "c++"];

  // Gettting the right title
  let rightTitle = false;
  for (const inTitleWord of inTitle) {
    if (jobTitle.includes(inTitleWord)) {
      rightTitle = true;
      break;
    }
  }
  for (const notInTitleWord of notInTitle) {
    if (jobTitle.includes(notInTitleWord)) {
      rightTitle = false;
      break;
    }
  }
  if (rightTitle === false) return;

  // Getting the right keywords in the job description
  const matchedKw = [];
  for (const kw of inJobDescription) {
    if (jobDescription.includes(kw)) {
      matchedKw.push(kw);
    }
  }
  for (const kw in notInJobDescription) {
    if (jobDescription.includes(kw)) {
      return;
    }
  }

  // Find the years of experience in the job description
  const yoePattern = /(\d+|\w+)\s?\+?\s?(year|yr)s?/gi;
  const yoeMatches =
    jobDescription
      .match(yoePattern)
      ?.concat(jobQualifications.match(yoePattern) || []) || [];
  let yoes: string[] = [];
  if (yoeMatches?.length > 0) {
    const sentences = jobDescription
      .split("\n")
      .map((sentence) => sentence.split("."))
      .flat()
      .concat(jobQualifications.split("\n").flat());

    const matchingSentences = sentences.filter((sentence) => {
      for (const match of yoeMatches) {
        if (sentence.includes(match)) {
          const yoe = parseInt(match?.match(/\d+/)?.[0] || "", 10);
          if (yoe <= 1) {
            return true;
          }
        }
      }
      return false;
    });

    yoes = matchingSentences.map((sentence) => sentence.trim());
  }

  return { yoeMatches, yoes, matchedKw };
}

async function writeFile(fileName: string, text: string): Promise<void> {
  try {
    await fs.appendFile(fileName, text);
  } catch (error) {
    await fs.writeFile(fileName, text);
  }
}
