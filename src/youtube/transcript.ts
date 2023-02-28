import getPage from "../puppeteer/getPage.js";
import fs from "fs/promises";

const url = "https://www.youtube.com/watch?v=ZoObi17pv3k";
const videoId = url.split("=")[1];

const getTranscript = async (url: string): Promise<string | null> => {
  const { page, browser } = await getPage({ url });

  const threeDotsBtn = await page.$(
    "#button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill"
  );

  await threeDotsBtn?.click();

  const transcriptBtn = await page.$(
    "#items > ytd-menu-service-item-renderer:nth-child(2) > tp-yt-paper-item > yt-formatted-string"
  );
  await transcriptBtn?.click();

  await page.waitForSelector(".segment-text");

  const transcript = await page.$$eval(".segment-text", (el) => {
    return el.map((e) => e.textContent).join("\n");
  });

  await browser.close();

  await fs.writeFile(
    `./output/youtube/transcripts/${new Date().toISOString()}-yt-${videoId}.txt`,
    transcript
  );

  return transcript;
};

await getTranscript(url);
