export interface JobProperty {
  name: string;
  key: string;
  number: "single" | "multiple";
  selector: string;
  type?: "text" | "attribute";
  attribute?: string;
}

export interface Job extends Record<string, string | string[]> {
  title: string;
  company: string;
  salary: string;
  location: string;
  stars: string;
  reviews: string;
  jobType: string[];
  jobDescription: string;
  jobActivity: string[];
}
