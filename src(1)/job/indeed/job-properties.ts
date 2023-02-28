import { JobProperty } from "./interface.js";

const jobProperties: JobProperty[] = [
  {
    name: "Title",
    key: "title",
    number: "single",
    selector: "div.jobsearch-JobInfoHeader-title-container"
  },
  {
    name: "Company",
    key: "company",
    number: "single",
    selector: "div[data-company-name='true']"
  },
  {
    name: "Location",
    key: "location",
    number: "single",
    selector: "div.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)"
  },
  {
    name: "Job Details",
    key: "jobDetails",
    number: "single",
    selector: "#jobDetailsSection"
  },
  {
    name: "Salary Info and Job Type",
    key: "salaryInfoAndJobType",
    number: "single",
    selector: "#salaryInfoAndJobType"
  },
  {
    name: "Qualifications",
    key: "qualifications",
    number: "single",
    selector: "#qualificationsSection"
  },
  {
    name: "Review",
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
