import puppeteer from "puppeteer";
import fs from "fs/promises";
import { errToObj, sleep } from "./util.js";
import { ErrorObj } from "./type.js";

(async () => {
  // Launch a new browser instance

  // Create an array to store the jobs
  const jobs: any[] = [];

  // Create an array to store the errors
  const errors: ErrorObj[] = [];

  const browser = await puppeteer.launch({ headless: false });

  // Create a new page
  const page = await browser.newPage();
  // Set the user agent and http headers
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9"
  });

  // Navigate to a webpage
  await page.goto("https://ca.indeed.com/jobs?q=software+engineer", {
    waitUntil: "networkidle0"
  });

  // Select all job card elements
  const scrapeJobs = async (pageCount: number) => {
    if (pageCount > 1) return;
    console.log("Page count: ", pageCount);
    console.log(page.url());

    let popUpClose = await page.$(
      "#mosaic-modal-mosaic-provider-desktopserp-jobalert-popup > div > div > div.icl-Modal > div > button"
    );
    await popUpClose?.click().catch((err) => {
      errors.push(errToObj(err));
      console.log(err);
    });

    let liElements = await page.$$("#mosaic-provider-jobcards > ul > li");

    if (liElements.length === 0) {
      throw new Error("No li elements found");
    }
    const jobSet = new Set();
    for (let i = 0; i < liElements.length; i++) {
      // Get the clickable element
      const clickable = await liElements[i]?.$("a");

      await clickable?.click().catch((err) => {
        errors.push(errToObj(err));
        console.log(err);
      });
      await Promise.race([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.waitForNetworkIdle(),
        new Promise((resolve) => setTimeout(resolve, 5000))
      ]).catch((err) => {
        errors.push(errToObj(err));
        console.log(err);
      });

      const jobPostEl = await page.$("#jobsearch-ViewjobPaneWrapper");

      const title = (
        await jobPostEl
          ?.$eval(
            "div.jobsearch-JobInfoHeader-title-container",
            (el) => el.textContent
          )
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })
      )?.replace(" - job post", "");

      // Get the company name
      const company =
        (await jobPostEl
          ?.$eval("div[data-company-name=true]", (el) => el.textContent)
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })) || undefined;

      // Get the company info
      const companyInfo = (
        await jobPostEl
          ?.$eval("div.jobsearch-CompanyInfoContainer", (el) => el.textContent)
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })
      )
        ?.replace(company ?? "", "")
        .split("reviews");

      // Get the number of reviews
      const reviews =
        (companyInfo?.[0] && parseInt(companyInfo?.[0].replace(",", ""))) ||
        undefined;

      // Get the location
      const location = companyInfo?.[1];

      const salary =
        (await jobPostEl
          ?.$eval(
            "#jobDetailsSection > div:nth-child(2) > div > span",
            (el) => el.textContent
          )
          .catch((err) => {
            errors.push(errToObj(err));
          })) || undefined;

      const jobType =
        (await jobPostEl
          ?.$$eval("#jobDetailsSection > div:nth-child(3) > div", (el) => {
            const jobType: string[] = [];
            for (let i = 0; i < el.length; i++) {
              const text = el[i].textContent;
              if (text !== "Job type" && text !== null) {
                jobType.push(text);
              }
            }
            return jobType.length > 0 ? jobType : undefined;
          })
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })) || undefined;

      const qualifications =
        (await jobPostEl
          ?.$$eval(
            "#qualificationsSection > div.jobsearch-ReqAndQualSection-item--wrapper > div > ul > li",
            (el) => {
              const qualifications: string[] = [];
              for (let i = 0; i < el.length; i++) {
                const text = el[i].textContent;
                if (text !== null) qualifications.push(text);
              }
              return qualifications.length > 0 ? qualifications : undefined;
            }
          )
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })) || undefined;

      // Get the benefits
      const benefits =
        (await jobPostEl
          ?.$$eval("#benefits > div > div > div", (el) => {
            const benefits: string[] = [];

            for (let i = 0; i < el.length; i++) {
              const text = el[i].textContent;
              text && benefits.push(text);
            }
            return benefits.length > 0 ? benefits : undefined;
          })
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })) || undefined;

      // Get the job description
      const jobDescription =
        (await jobPostEl
          ?.$eval("#jobDescriptionText", (el) => el.textContent)
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })) || undefined;

      // Get the job insights
      const jobInsights =
        (await jobPostEl
          ?.$$eval(
            "#belowFullJobDescription + div > p, #mosaic-belowFullJobDescription + div > ul > li",
            (el) => {
              const insights: string[] = [];
              for (let i = 0; i < el.length; i++) {
                const text = el[i].textContent;
                text && insights.push(text);
              }

              const insightsFiltered = insights
                .map((insight: string) =>
                  insight
                    .replace("Hiring Insights", "")
                    .replace("Job activity", "")
                )
                .filter((insight: string) => insight !== "");
              return insightsFiltered.length > 0 ? insightsFiltered : undefined;
            }
          )
          .catch((err) => {
            errors.push(errToObj(err));
            console.log(err);
          })) || undefined;

      if (!jobSet.has(title || "" + company))
        jobs.push({
          title,
          company,
          reviews,
          location,
          salary,
          jobType,
          qualifications,
          benefits,
          jobDescription,
          jobInsights
        });
      console.log(title || "" + company);
      jobSet.add(title || "" + company);
    }

    const nextPageButton = await page.$(
      "#jobsearch-JapanPage > div > div > div.jobsearch-SerpMainContent > div.jobsearch-LeftPane > nav > div > a"
    );
    await nextPageButton?.click().catch((err) => {
      errors.push(errToObj(err));
      console.log(err);
    });

    await page
      .waitForNavigation({ waitUntil: "domcontentloaded" })
      .catch((err) => {
        errors.push(errToObj(err));
        console.log("Navigation failed");
      });

    await scrapeJobs(pageCount + 1);
  };

  await scrapeJobs(1);
  console.log("Number of jobs: ", jobs.length);
  console.log("Error count: ", errors.length);
  // Write file
  await fs.writeFile("jobs.json", JSON.stringify(jobs, null, 2));
  await fs.writeFile("errors.json", JSON.stringify(errors, null, 2));

  // Close the browser
  await browser.close();
})();
