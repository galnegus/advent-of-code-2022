console.time("Execution time");
const input: Array<string> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean);

function prioritization(char: string): number {
  const isLowerCase = /[a-z]/.test(char);
  const charCode = char.charCodeAt(0);
  return isLowerCase ? charCode - 96 : charCode - 38;
}

const overlapPerRucksack = input.map((line) => {
  const charSet = new Set<string>();
  const result = new Set<string>();
  for (let i = 0; i < line.length / 2; ++i) {
    charSet.add(line[i]);
  }
  for (let i = line.length / 2; i < line.length; ++i) {
    if (charSet.has(line[i])) result.add(line[i]);
  }
  return [...result];
});

const overlapPrioritizationSum = overlapPerRucksack
  .flat()
  .reduce((sum, char) => sum + prioritization(char), 0);
console.log("Part 1 answer:", overlapPrioritizationSum);

const inputByGroup = [];
for (let i = 0; i < input.length; i += 3) {
  inputByGroup.push(input.slice(i, i + 3));
}
const overlappingChars = (charSet: Set<string>, line: string): Set<string> => {
  const result = new Set<string>();
  for (const char of line) {
    if (charSet.has(char)) result.add(char);
  }
  return result;
};
const overlapPerGroup = inputByGroup.map((groupLines) => {
  let charSet = new Set<string>();
  [...groupLines[0]].forEach(charSet.add.bind(charSet));
  charSet = overlappingChars(charSet, groupLines[1]);
  charSet = overlappingChars(charSet, groupLines[2]);
  return [...charSet];
});
const groupOverlapPrioritizationSum = overlapPerGroup
  .flat()
  .reduce((sum, char) => sum + prioritization(char), 0);
console.log("Part 2 answer:", groupOverlapPrioritizationSum);

console.timeEnd("Execution time");
export {};
