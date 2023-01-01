console.time("Execution time");

const testInput = false;

const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const snafuNumbers = rawInput.split(/\r?\n/);

const snafuToDecimalDigit: Record<string, number> = {
  "=": -2,
  "-": -1,
  "0": 0,
  "1": 1,
  "2": 2,
};
const decimalToSnafuDigit: Record<string, string> = {
  "-2": "=",
  "-1": "-",
  "0": "0",
  "1": "1",
  "2": "2",
};

function snafuToDecimal(snafu: string): number {
  let result = 0;
  for (let index = 0; index < snafu.length; ++index) {
    const digitValue = 5 ** (snafu.length - index - 1);
    result += snafuToDecimalDigit[snafu[index]] * digitValue;
  }
  return result;
}
function decimalToSnafu(decimal: number): string {
  let result = "";
  let quotient = decimal;
  while (quotient > 0) {
    const remainder = ((quotient + 2) % 5) - 2;
    quotient = Math.floor((quotient + 2) / 5);
    result = decimalToSnafuDigit[remainder] + result;
  }
  return result;
}

console.log(
  "Answer: ",
  decimalToSnafu(snafuNumbers.map(snafuToDecimal).reduce((sum, value) => sum + value, 0))
);

console.timeEnd("Execution time");
export {};
