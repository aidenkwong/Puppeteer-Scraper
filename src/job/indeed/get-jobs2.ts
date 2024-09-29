import fs from "fs/promises";
import getBrowser from "../../puppeteer/getBrowser.js";
import chalk from "chalk";

type GetJobOptions = {
  positions: string[];
  numOfPage?: number;
  numOfIteration?: number;
};

getJobs({
  positions: [
    "software developer",
    "junior developer",
    "nodejs developer",
    "software engineer"
  ],
  numOfPage: 3,
  numOfIteration: 4
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

  const arr = new Array(numOfPage).fill(0).map((_, i) => i * 10);
  const arr2 = new Array(numOfIteration).fill(0).map((_, i) => i);

  for (const position of positions) {
    for await (const j of arr2) {
      await Promise.all(
        arr.map(async (i) => {
          const page = i + numOfPage * 10 * j;
          const jobs = await scrape(position, page);
          await fs.writeFile(
            `./output/jobs/indeed/raw/${new Date().toISOString()}-${getPositionSlug(
              position
            )}-${page}.json`,
            JSON.stringify(jobs, null, 2)
          );
        })
      );
    }
  }
}

async function scrape(position: string, indeedPage: number): Promise<any[]> {
  console.log(
    `Getting jobs for ${chalk.blue(position)} on page ${chalk.blue(
      indeedPage / 10 + 1
    )}...`
  );
  const browser = await getBrowser({});
  const positionSlug = getPositionSlug(position);

  const page = await browser.newPage();

  // Use this viewport to get the appropriate UI for scraping
  await page.setViewport({
    width: 1400,
    height: 789
  });

  // User agent and http header is required, otherwise there will be a 403 error
  // await page.setUserAgent(
  //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
  // );
  // await page.setExtraHTTPHeaders({
  //   "Accept-Language": "en-US,en;q=0.9"
  // });

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

  const jobs = [];

  for (const jk of jks) {
    if (!jk) continue;

    // Go to the page of the job with the jk
    await page.goto(`https://ca.indeed.com/viewjob?jk=${jk}`, {
      waitUntil: "networkidle0"
    });

    const pageText = await page.$eval(
      "script[type='application/ld+json']",
      (div) => div.innerText
    );

    jobs.push(JSON.parse(pageText));
  }

  await browser.close();
  return jobs;
}
