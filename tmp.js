import puppeteer from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import ollama from "ollama";

(async () => {
  // Launch Puppeteer
  puppeteer.use(Stealth());
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the webpage
  await page.goto("https://ca.indeed.com/viewjob?jk=ba989fe1a1d98e16", {
    waitUntil: "networkidle0"
  });

  // Extract the plain text from the page
  const pageText = await page.$eval(
    "script[type='application/ld+json']",
    (div) => div.innerText
  );

  // Output the plain text
  console.log(JSON.parse(pageText), pageText.length);

  // Close the browser
  await browser.close();

  // const response = await ollama.chat({
  //   model: "llama3.1",
  //   messages: [
  //     {
  //       role: "user",
  //       content:
  //         "Give me a list of what information can be extracted from the job post and show me in camelcase\n" +
  //         pageText
  //     }
  //   ]
  // });
  // console.log(response.message.content);
})();
