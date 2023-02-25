import fs from "fs/promises";

const readFile = async () => {
  const jobs = JSON.parse(await fs.readFile("jobs.json", "utf-8"));
  console.log(new Set(jobs.map((job) => job.title)).size, jobs.length);
};

readFile();

const position = "software engineer";
const indeedPage = 10;

console.log(
  `https://ca.indeed.com/jobs?q=${new URLSearchParams(
    position.split(" ").join("+")
  )}&start=${indeedPage}`
);
