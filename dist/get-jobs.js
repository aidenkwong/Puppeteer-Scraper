import puppeteer from "puppeteer";
import fs from "fs/promises";
const getJobs = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://ca.indeed.com/jobs?q=software+engineer", {
        waitUntil: "networkidle0"
    });
    const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll("*[data-jk]");
        return [...jobElements].map((jobElement) => jobElement.getAttribute("data-jk"));
    });
    await browser.close();
    await fs.writeFile("jobs.txt", jobs.join("\n"));
};
getJobs();
//# sourceMappingURL=get-jobs.js.map