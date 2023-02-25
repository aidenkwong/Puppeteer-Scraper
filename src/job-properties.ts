import { JobProperty } from "./interface.js";

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

export default jobProperties;
