import puppeteer from "puppeteer";

type GetPageOptions = {
  url: string;
  headless?: boolean;
};

const getPage = async ({
  url,
  headless = true
}: GetPageOptions): Promise<{
  page: puppeteer.Page;
  browser: puppeteer.Browser;
}> => {
  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1400,
    height: 789
  });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9"
  });

  console.log(`Navigating to ${url}`);
  await page.goto(url, {
    waitUntil: "networkidle0"
  });

  return { page, browser };
};

export default getPage;
