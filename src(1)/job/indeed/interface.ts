export interface JobProperty {
  name: string;
  key: string;
  number: "single" | "multiple";
  selector: string;
  type?: "text" | "attribute";
  attribute?: string;
}

export interface Job extends Record<string, string | string[]> {
  jk: string;
  title: string;
  company: string;
  location: string;
  jobDetails: string;
  salaryInfoAndJobType: string;
  qualifications: string;
  reviews: string;
  stars: string;
  jobDescription: string;
  benefits: string;
  hiringInsights: string;
  jobActivity: string;
}

export interface JobError {
  job: string;
  property: string;
  name: string;
  message: string;
  stack?: string | undefined;
}
