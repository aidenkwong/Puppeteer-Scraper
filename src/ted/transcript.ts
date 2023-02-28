import getPage from "../puppeteer/getPage.js";
import fs from "fs/promises";

const url =
  "https://www.ted.com/talks/james_lyne_everyday_cybercrime_and_what_you_can_do_about_it?language=en";

// Somehow not working, need to investigate
const getTranscript = async (url: string): Promise<string | null> => {
  const { page, browser } = await getPage({ url });

  await page.waitForSelector("button.bg-white.text-black");

  const transcriptBtn = await page.$("button.bg-white.text-black");

  console.log("clicking transcript button");
  await transcriptBtn?.click();

  await page.waitForSelector("span.w-full.block");

  const transcript = await page.$$eval("span.w-full.block", (el) => {
    return el.map((e) => e.textContent).join("\n");
  });

  await browser.close();

  await fs.writeFile(
    `./output/ted/transcripts/${new Date().toISOString()}-ted.txt`,
    transcript
  );

  return transcript;
};

await getTranscript(url);
