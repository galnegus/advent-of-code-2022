import Heap from "heap-js";

console.time("Execution time");

interface Position {
  row: number;
  column: number;
  steps: number;
}

const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const heightMap: Array<Array<string>> = input.split(/\r?\n/).map((line) => line.split(""));

let startingPosition: Position | null = null;
let lowestPositions: Array<Position> = [];
heightMap.forEach((row, rowIndex) =>
  row.forEach((height, columnIndex) => {
    if (height === "S") startingPosition = { row: rowIndex, column: columnIndex, steps: 0 };
    if (height === "S" || height === "a")
      lowestPositions.push({ row: rowIndex, column: columnIndex, steps: 0 });
  })
);
if (startingPosition === null) throw new Error("Starting position wasn't found!");

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

function numberOfSteps(initialPositions: Array<Position>): number {
  const positions = Heap.heapify<Position>(initialPositions, (a, b) => a.steps - b.steps);
  const visited = new Set<number>();

  const tryToMove = (from: Position, row: number, column: number): void => {
    const hash = positionHash(row, column);
    if (!visited.has(hash) && canMove(from.row, from.column, row, column)) {
      positions.add({ row: row, column, steps: from.steps + 1 });
      visited.add(hash);
    }
  };

  while (positions.length > 0) {
    const position = positions.pop();
    if (position === undefined) throw new Error("This shouldn't happen...");
    const { row, column, steps } = position;

    if (heightMap[row][column] === "E") {
      return steps;
    }

    if (row > 0) tryToMove(position, row - 1, column);
    if (column > 0) tryToMove(position, row, column - 1);
    if (row < rows - 1) tryToMove(position, row + 1, column);
    if (column < columns - 1) tryToMove(position, row, column + 1);
  }

  return -1;
}

console.log("Part 1 answer:", numberOfSteps([startingPosition]));
console.log("Part 2 answer:", numberOfSteps(lowestPositions));

console.timeEnd("Execution time");
export {};
