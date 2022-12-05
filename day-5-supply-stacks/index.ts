console.time("Execution time");

const [stackInput, moveInput]: Array<Array<string>> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n\r?\n/)
  .map((inputSection: string) => inputSection.split(/\r?\n/));

const numberOfStacks = Math.max(
  ...stackInput[stackInput.length - 1].split(/ +/).filter(Boolean).map(Number)
);

// leave 0th stack empty so we can stick to the "1-indexing" used in move instructions input
type Stack = Array<string>;
const stacks: Array<Stack> = new Array(numberOfStacks + 1)
  .fill(undefined)
  .map(() => []);
const initialStackInput = stackInput.slice(0, stackInput.length - 1);
for (const line of initialStackInput.reverse()) {
  for (let i = 0; i < numberOfStacks; ++i) {
    const charIndex = i * 4 + 1;
    if (line[charIndex] !== " ") stacks[i + 1].push(line[charIndex]);
  }
}

interface Move {
  n: number;
  from: number;
  to: number;
}
const moves: Array<Move> = moveInput
  .map((line) => line.split(" "))
  .map((splitLine) => ({
    n: +splitLine[1],
    from: +splitLine[3],
    to: +splitLine[5],
  }));

function applyMoves(
  stacks: Array<Stack>,
  moves: Array<Move>,
  reverse: boolean
): Array<Stack> {
  const newStacks = JSON.parse(JSON.stringify(stacks));
  for (const { n, from, to } of moves) {
    const popped = newStacks[from].splice(-n, n);
    if (reverse) popped.reverse();
    newStacks[to].push(...popped);
  }
  return newStacks;
}
function topOfEachStack(stacks: Array<Stack>): string {
  return stacks
    .map((stack) => stack.pop())
    .filter(Boolean)
    .join("");
}

const part1 = applyMoves(stacks, moves, true);
console.log("Part 1 answer:", topOfEachStack(part1));

const part2 = applyMoves(stacks, moves, false);
console.log("Part 2 answer:", topOfEachStack(part2));

console.timeEnd("Execution time");
export {};
