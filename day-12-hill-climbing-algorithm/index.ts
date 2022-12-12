import Heap from "heap-js";

console.time("Execution time");

interface State {
  row: number;
  column: number;
  steps: number;
}

const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const heightMap: Array<Array<string>> = input.split(/\r?\n/).map((line) => line.split(""));

let startState: State | null = null;
let lowestStates: Array<State> = [];
heightMap.forEach((row, rowIndex) =>
  row.forEach((height, columnIndex) => {
    if (height === "S") startState = { row: rowIndex, column: columnIndex, steps: 0 };
    if (height === "S" || height === "a")
      lowestStates.push({ row: rowIndex, column: columnIndex, steps: 0 });
  })
);
if (startState === null) throw new Error("Starting position wasn't found!");

const rows = heightMap.length;
const columns = heightMap[0].length;

function canMove(fromRow: number, fromColumn: number, toRow: number, toColumn: number): boolean {
  let fromHeight = heightMap[fromRow][fromColumn];
  if (fromHeight === "S") fromHeight = "a";
  let toHeight = heightMap[toRow][toColumn];
  if (toHeight === "E") toHeight = "z";
  return toHeight.charCodeAt(0) - fromHeight.charCodeAt(0) <= 1;
}

const offset = (1 << 16) / 2;
function positionHash(row: number, column: number): number {
  return row + offset + ((column + offset) << 16);
}

function numberOfSteps(startingStates: Array<State>): number {
  const states = Heap.heapify<State>(startingStates, (a, b) => a.steps - b.steps);
  const visited = new Set<number>();

  const tryToMove = (fromState: State, row: number, column: number): void => {
    const hash = positionHash(row, column);
    if (!visited.has(hash) && canMove(fromState.row, fromState.column, row, column)) {
      states.add({ row: row, column, steps: fromState.steps + 1 });
      visited.add(hash);
    }
  };

  while (states.length > 0) {
    const state = states.pop();
    if (state === undefined) throw new Error("This shouldn't happen...");
    const { row, column, steps } = state;

    if (heightMap[row][column] === "E") {
      return steps;
    }

    if (row > 0) tryToMove(state, row - 1, column);
    if (column > 0) tryToMove(state, row, column - 1);
    if (row < rows - 1) tryToMove(state, row + 1, column);
    if (column < columns - 1) tryToMove(state, row, column + 1);
  }

  return -1;
}

console.log("Part 1 answer:", numberOfSteps([startState]));
console.log("Part 2 answer:", numberOfSteps(lowestStates));

console.timeEnd("Execution time");
export {};
