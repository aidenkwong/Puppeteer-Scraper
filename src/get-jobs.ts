import puppeteer from "puppeteer";
import fs from "fs/promises";

type JobProperty = {
  name: string;
  key: string;
  number: "single" | "multiple";
  selector: string;
  type?: "text" | "attribute";
  attribute?: string;
};

interface Job extends Record<string, string | string[]> {
  title: string;
  company: string;
  salary: string;
  location: string;
  stars: string;
  reviews: string;
  jobType: string[];
  jobDescription: string;
  jobActivity: string[];
}

const jobProperties: JobProperty[] = [
  {
    name: "title",
    key: "title",
    number: "single",
    selector: "div.jobsearch-JobInfoHeader-title-container"
  },
  {
    name: "company",
    key: "company",
    number: "single",
    selector: "div[data-company-name='true']"
  },
  {
    name: "salary",
    key: "salary",
    number: "single",
    selector: "#jobDetailsSection > div:nth-child(2) > div"
  },
  {
    name: "location",
    key: "location",
    number: "single",
    selector: "div.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)"
  },
  {
    name: "reviews",
    key: "reviews",
    number: "single",
    selector:
      "#viewJobSSRRoot > div.jobsearch-ViewJobLayout.mobRefresh.jasxrefreshcombotst.jobsearch-ViewJobLayout-changeTextSize.jobsearch-ViewJobLayout-changeTextColor > div > div.icl-Grid.jobsearch-ViewJobLayout-content.jobsearch-ViewJobLayout-mainContent > div > div > div.jobsearch-ViewJobLayout-rightRail > div.jobsearch-ViewJobLayout-companyPromo > div > div > div > div > div > a > div > span"
  },
  {
    name: "Stars",
    key: "stars",
    number: "single",
    selector:
      "#viewJobSSRRoot > div.jobsearch-ViewJobLayout.mobRefresh.jasxrefreshcombotst.jobsearch-ViewJobLayout-changeTextSize.jobsearch-ViewJobLayout-changeTextColor > div > div.icl-Grid.jobsearch-ViewJobLayout-content.jobsearch-ViewJobLayout-mainContent > div > div > div.jobsearch-ViewJobLayout-rightRail > div.jobsearch-ViewJobLayout-companyPromo > div > div > div > div > div > a > div > div",
    type: "attribute",
    attribute: "aria-label"
  },
  {
    name: "Job Type",
    key: "jobType",
    number: "multiple",
    selector: "#jobDetailsSection > div:nth-child(2) > div"
  },
  {
    name: "Job Description",
    key: "jobDescription",
    number: "single",
    selector: "#jobDescriptionText"
  },
  {
    name: "Benefits",
    key: "benefits",
    number: "multiple",
    selector: "#benefits > div > div"
  },
  {
    name: "Hiring Insights",
    key: "hiringInsights",
    number: "multiple",
    selector: "#mosaic-belowFullJobDescription + div > p"
  },
  {
    name: "Job Activity",
    key: "jobActivity",
    number: "multiple",
    selector:
      "div.jobsearch-JobComponent-description > div:last-child > ul > li"
  }
];

const browser = await puppeteer.launch();

const getJobs = async (position: string, indeedPage: number) => {
  console.log(`Getting jobs for ${position} on page ${indeedPage}...`);

  const positionSlug = position.split(" ").join("+");

  const page = await browser.newPage();

  await page.setViewport({
    width: 1400,
    height: 789
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9"
  });

  await page
    .goto(
      `https://indeed.com/jobs?q=${new URLSearchParams(
        positionSlug
      )}&start=${indeedPage}`,
      {
        waitUntil: "networkidle0"
      }
    )
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
    await page.goto(`https://indeed.com/viewjob?jk=${jk}`, {
      waitUntil: "networkidle0"
    });
    let job: Job = {
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
    `${positionSlug}-${indeedPage}.json`,
    JSON.stringify(jobs, null, 2)
  );
  await fs.writeFile(
    `${positionSlug}-${indeedPage}errors.json`,
    JSON.stringify(errors, null, 2)
  );
};

const positions = ["software engineer"];

const numOfPage = 3; // Number of pages opened at the same time
const numOfIteration = 5; // Number of iterations

const arr = new Array(numOfPage).map((_, i) => i * 10);
const arr2 = new Array(numOfIteration).map((_, i) => i);

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
