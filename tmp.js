// const jobDescription =
//   "We are looking for a candidate with at least 4 years of experience in web development. The ideal candidate should have five years or more of experience in software engineering, and we will consider candidates with 3+years of experience.";

// const yearsOfExperienceRegex = /\b(\d+|\w+)+\+?( |)(years|yrs|yr)\b/gi;
// const matches = jobDescription.match(yearsOfExperienceRegex);

// if (matches) {
//   console.log(matches);
//   // Output: ["4 years", "five years", "3+ years"]
// }

const jobDescription =
  "We are looking for a candidate with at least 4 years of experience in web development. The ideal candidate should have five years or more of experience in software engineering, and we will consider candidates with 3+years of experience.";

const yearsOfExperienceRegex = /(\d+|\w+)\s?\+?\s?(year|yr)s?/gi;
const matches = jobDescription.match(yearsOfExperienceRegex);

if (matches) {
  console.log(matches);
  // Output: ["4 years", "five years", "3+ years"]
}
