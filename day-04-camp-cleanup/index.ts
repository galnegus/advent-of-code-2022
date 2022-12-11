console.time("Execution time");
const elfPairs: Array<Array<Array<number>>> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line: string) =>
    line.split(",").map((range) => range.split("-").map(Number))
  );

const fullyContainedPairs = elfPairs.filter((elfPair) =>
  isInsideOf(elfPair[0], elfPair[1])
);
console.log("Part 1 answer:", fullyContainedPairs.length);

const overlappingPairs = elfPairs.filter((elfPair) =>
  overlapsAtAll(elfPair[0], elfPair[1])
);
console.log("Part 2 answer:", overlappingPairs.length);

/** Returns true if `a` is inside of `b` or vice versa */
function isInsideOf(
  [aStart, aEnd]: Array<number>,
  [bStart, bEnd]: Array<number>
): boolean {
  return (
    (aStart >= bStart && aEnd <= bEnd) || (bStart >= aStart && bEnd <= aEnd)
  );
}
/** Returns true if `a` and `b` overlaps at all */
function overlapsAtAll(
  [aStart, aEnd]: Array<number>,
  [bStart, bEnd]: Array<number>
): boolean {
  return bStart <= aEnd && aStart <= bEnd;
}

console.timeEnd("Execution time");
export {};
