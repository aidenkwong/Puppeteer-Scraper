// const jobDescription =
//   "We are looking for a candidate with at least 4 years of experience in web development. The ideal candidate should have five years or more of experience in software engineering, and we will consider candidates with 3+years of experience.";

// const yearsOfExperienceRegex = /\b(\d+|\w+)+\+?( |)(years|yrs|yr)\b/gi;
// const matches = jobDescription.match(yearsOfExperienceRegex);

// if (matches) {
//   console.log(matches);
//   // Output: ["4 years", "five years", "3+ years"]
// }

const jobDescription =
  "This is your opportunity to join AXIS Capital – a trusted global provider of specialty lines insurance and reinsurance. We stand apart for our outstanding client service, intelligent risk taking and superior risk adjusted returns for our shareholders. We also proudly maintain an entrepreneurial, disciplined and ethical corporate culture. As a member of AXIS, you join a team that is among the best in the industry. At AXIS, we believe that we are only as strong as our people. We strive to create an inclusive and welcoming culture where employees of all backgrounds and from all walks of life feel comfortable and empowered to be themselves. This means that we bring our whole selves to work. All qualified applicants will receive consideration for employment without regard to race, color, religion or creed, sex, pregnancy, sexual orientation, gender identity or expression, national origin or ancestry, citizenship, physical or mental disability, age, marital status, civil union status, family or parental status, or any other characteristic protected by law. Accommodation is available upon request for candidates taking part in the selection process. This is your opportunity to join AXIS Capital – a trusted global provider of specialty lines insurance and reinsurance. We stand apart for our outstanding client service, intelligent risk taking, and superior risk adjusted returns for our shareholders. We also proudly maintain an entrepreneurial, disciplined, and ethical corporate culture. As a member of AXIS, you join a team that is among the best in the industry. To support our growth objectives at AXIS, we are investing significantly in our Business & Technology Center in Halifax, Nova Scotia. As part of a global team, you will be working with highly experienced team to maintain and enhance different components of our Customer Facing Digital Solutions. As an Application Developer - WPP (Workplace Productivity), you will be placed in one of the technologies in Workplace Productivity at AXIS and specific assignments will depend on upon your skills set and team needs. Responsibilities: Write optimized, secure, and scalable code using .NET programming languages and follow best practices like unit testing and peer reviews. Assure code meets business requirements through quality assurance. Remain up to date with the terminology, concepts, and best practices for coding web apps Participate in and develop end-to-end technology solutions that solve our business needs. Work closely with multiple stakeholders in a cross-functional organization within an Agile environment. Collaborate and partner with vendors, creating a blended / unified team Expected to be available to work in the office as needed/required Required Skills and Qualifications: Bachelor's degree in Computer Science, Computer Engineering, Minimum of 2 year of work experience as a developer Familiarity and preferred experience in at least one programming language or technology including, but not limited, to C/C++, C#, .NET, python, JavaScript, SharePoint 2019, SharePoint Online, REACT, HTML Understanding of SDLC process Preferred Skills and Qualifications: Experience in Insurance industry in a technology role preferred Understanding and experience with ALM tooling, preferably Azure DevOps (formerly TFS); experience with code versioning using TFVC and/or Git Familiarity with architecture styles/APIs (REST, RPC) Document process, designs, test results, and analysis Dedicated and detail oriented Conscientious team player Ability to communicate effectively and efficiently across the organization Excellent Analytical skills Adaptability";

const yearsOfExperienceRegex = /(\d+|\w+)\s?\+?\s?(year|yr)s?/gi;
const yoeMatches = jobDescription.match(yearsOfExperienceRegex);

// const yoePattern = /\b\d+\+?( |)(years|yrs|yr)\b/gi;
// const yoeMatches = jobDescription.match(yoePattern);

let yoes = [];
if (yoeMatches?.length > 0) {
  const sentences = jobDescription
    .split("\n")
    .map((sentence) => sentence.split("."))
    .flat();

  const matchingSentences = sentences.filter((sentence) => {
    for (const match of yoeMatches) {
      if (sentence.includes(match)) {
        const yoe = parseInt(match?.match(/\d+/)?.[0] || "", 10);
        if (yoe <= 1) {
          return true;
        }
      }
    }
    return false;
  });

  yoes = matchingSentences.map((sentence) => sentence.trim());
}
console.log(yoeMatches, yoeMatches, yoes);
