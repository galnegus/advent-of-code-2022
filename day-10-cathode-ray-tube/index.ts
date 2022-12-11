console.time("Execution time");

type Addition = ["addx", number];
type Noop = ["noop"];
type Instruction = Addition | Noop;

const instructions: Array<Instruction> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line: string) => line.split(" "))
  .map((tokens: Array<string>) => [tokens[0], ...(tokens[1] !== undefined ? [+tokens[1]] : [])])
  .reverse();

function isAddition(instruction: Instruction): instruction is Addition {
  return instruction[0] === "addx";
}

const xValues = new Array(241).fill(undefined);
let nextInstructionOn = 1;
let nextAdditionValue = 0;
xValues[0] = 1;
for (let i = 1; i < xValues.length; ++i) {
  xValues[i] = xValues[i - 1];
  if (nextInstructionOn === i) {
    xValues[i] += nextAdditionValue;
    const instruction = instructions.pop();
    if (instruction === undefined) break;
    if (isAddition(instruction)) {
      nextInstructionOn = i + 2;
      nextAdditionValue = instruction[1];
    } else {
      nextInstructionOn = i + 1;
      nextAdditionValue = 0;
    }
  }
}

function signalStrength(cycles: Array<number>): number {
  return cycles.reduce((sum, cycle) => sum + cycle * xValues[cycle], 0);
}

console.log("Part 1 answer:", signalStrength([20, 60, 100, 140, 180, 220]));

function doesSpriteCover(row: number, position: number): boolean {
  const cycle = row * 40 + position;
  const spritePosition = Math.min(Math.max(xValues[cycle + 1], 1), 38);
  return Math.abs(position - spritePosition) <= 1;
}

const image: Array<Array<"." | "#">> = new Array(6)
  .fill(undefined)
  .map((_, rowIndex) =>
    new Array(40)
      .fill(undefined)
      .map((_, positionIndex) => (doesSpriteCover(rowIndex, positionIndex) ? "#" : "."))
  );
console.log("Part 2 answer:");
console.log(image.map((row) => row.join("")).join("\n"));

console.timeEnd("Execution time");
export {};
