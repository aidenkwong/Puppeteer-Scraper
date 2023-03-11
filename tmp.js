function getEnglishNumbers(str) {
  const englishNumbers = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine"
  ];
  const englishTens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  const englishMultiplesOfTen = [
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
  ];

  const words = str.toLowerCase().split(" ");
  const numbers = [];
  let currentNumber = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (englishNumbers.includes(word)) {
      currentNumber += englishNumbers.indexOf(word);
    } else if (englishTens.includes(word)) {
      currentNumber += englishTens.indexOf(word) + 10;
    } else if (englishMultiplesOfTen.includes(word)) {
      currentNumber += (englishMultiplesOfTen.indexOf(word) + 2) * 10;
    } else if (currentNumber) {
      numbers.push(parseInt(currentNumber));
      currentNumber = "";
    }
  }

  if (currentNumber) {
    numbers.push(parseInt(currentNumber));
  }

  return numbers;
}

function checkYoePattern(str) {
  // const yoePattern = /(\d+)\s*(year|years)|\((\d+)\)\s*years?/gi;
  const yoePattern = /(\d+|\d+\+\s?)\s*(year|years)|\((\d+)\)\s*years?/gi;

  const yoeMatches = str.match(yoePattern);

  return yoeMatches?.map((str) => {
    const match = str.match(/\d+/); // \d matches any digit, + matches one or more digits
    const firstNumber = match ? parseInt(match[0]) : null;
    return firstNumber;
  });
}

function getYoe(str) {
  const sentences = str
    .split("\n")
    .map((element) => element.split("."))
    .flat();
  const results = [];
  for (const sentence of sentences) {
    const yoeMatches = checkYoePattern(sentence);
    if (yoeMatches) {
      results.push([sentence, yoeMatches]);
    } else {
      const englishNumbers = getEnglishNumbers(sentence);
      if (englishNumbers) {
        results.push([sentence, englishNumbers]);
      }
    }
  }
  return results;
}

const testingStr =
  "5 years of experience in React and 2 years of experience in Angular\n 1+ year of experience in Vue. five (5) years of experience in NodeJS. Minimum of six";

console.log(getYoe(testingStr));
