console.time("Execution time");

/**
 * This sucks...
 *
 * I had grand ideas of implementing a generalized solution, but it felt like I lacked the time and the tools.
 * So a hard-coded solution it is.
 */

type Direction = [row: number, column: number];

const directions: Array<Direction> = [
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
  [-1, 0], // up
];
const right = directions[0];
const down = directions[1];
const left = directions[2];
const up = directions[3];
function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}
function turn(direction: Direction, move: "L" | "R") {
  // compares by reference, so make sure all direction used are picked from the directions array!
  let index = directions.findIndex((dir) => direction === dir);
  if (move === "L") index = mod(index - 1, directions.length);
  if (move === "R") index = mod(index + 1, directions.length);
  return directions[index];
}
/** For debugging */
function directionSymbol(direction: Direction) {
  let index = directions.findIndex((dir) => direction === dir);
  return [">", "v", "<", "^"][index];
}

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test2" : "input"),
  "utf-8"
);
const [mapInput, movementInput] = rawInput.split(/\r?\n\r?\n/);
const splitMapInput = mapInput.split(/\r?\n/);
const columns = Math.max(...splitMapInput.map((row) => row.length));
/** Access with map[row][column] */
const map = splitMapInput.map((line) => line.padEnd(columns).split(""));
const rows = map.length;
const instructions = movementInput
  .split(/([LR])/)
  .map((move) => (move === "L" || move === "R" ? move : Number(move)));

function isOutOfBounds(row: number, column: number): boolean {
  return row < 0 || column < 0 || row >= map.length || column >= map[row].length;
}

function boundarySearch(row: number, column: number, [deltaRow, deltaColumn]: Direction): number {
  while (row >= 0 && column >= 0 && row < rows && column < columns) {
    if (map[row][column] !== " ") {
      break;
    }
    row += deltaRow;
    column += deltaColumn;
  }
  return deltaRow !== 0 ? row : column;
}
const zip = <U>(a: Array<U>, b: Array<U>) => a.map((k, i) => [k, b[i]]);
const rowBoundaries = zip(
  new Array(rows).fill(undefined).map((_, row) => boundarySearch(row, 0, right)),
  new Array(rows).fill(undefined).map((_, row) => boundarySearch(row, columns - 1, left))
);
const columnBoundaries = zip(
  new Array(columns).fill(undefined).map((_, column) => boundarySearch(0, column, down)),
  new Array(columns).fill(undefined).map((_, column) => boundarySearch(rows - 1, column, up))
);

const faceSize = testInput ? 4 : 50;

function invert(num: number): number {
  return faceSize - 1 - num;
}
type CubeDirection = "right" | "down" | "left" | "up";
type CubeConnectionResult = [
  cube: number,
  faceRow: number,
  faceColumn: number,
  direction: Direction
];
type CubeConnection = (faceRow: number, faceColumn: number) => CubeConnectionResult;
const cubeMap = [
  [0, 1, 2],
  [0, 3, 0],
  [4, 5, 0],
  [6, 0, 0],
];
function getCube(row: number, column: number): number {
  if (isOutOfBounds(row, column)) return 0;
  return cubeMap[Math.floor(row / faceSize)][Math.floor(column / faceSize)];
}
function getCubePosition(cube: number): [number, number] {
  for (let row = 0; row < cubeMap.length; ++row) {
    for (let column = 0; column < cubeMap[row].length; ++column) {
      if (cubeMap[row][column] === cube) return [row * faceSize, column * faceSize];
    }
  }
  return [0, 0];
}
function getCubeDirection(direction: Direction): CubeDirection {
  if (direction === right) return "right";
  if (direction === down) return "down";
  if (direction === left) return "left";
  if (direction === up) return "up";
  throw new Error();
}
const cubeBoundaries: Record<number, Record<CubeDirection, CubeConnection>> = {
  1: {
    right: (faceRow, _) => [2, faceRow, 0, right],
    down: (_, faceColumn) => [3, 0, faceColumn, down],
    left: (faceRow, _) => [4, invert(faceRow), 0, right],
    up: (_, faceColumn) => [6, faceColumn, 0, right],
  },
  2: {
    right: (faceRow, _) => [5, invert(faceRow), faceSize - 1, left],
    down: (_, faceColumn) => [3, faceColumn, faceSize - 1, left],
    left: (faceRow, _) => [1, faceRow, faceSize - 1, left],
    up: (_, faceColumn) => [6, faceSize - 1, faceColumn, up],
  },
  3: {
    right: (faceRow, _) => [2, faceSize - 1, faceRow, up],
    down: (_, faceColumn) => [5, 0, faceColumn, down],
    left: (faceRow, _) => [4, 0, faceRow, down],
    up: (_, faceColumn) => [1, faceSize - 1, faceColumn, up],
  },
  4: {
    right: (faceRow, _) => [5, faceRow, 0, right],
    down: (_, faceColumn) => [6, 0, faceColumn, down],
    left: (faceRow, _) => [1, invert(faceRow), 0, right],
    up: (_, faceColumn) => [3, faceColumn, 0, right],
  },
  5: {
    right: (faceRow, _) => [2, invert(faceRow), faceSize - 1, left],
    down: (_, faceColumn) => [6, faceColumn, faceSize - 1, left],
    left: (faceRow, _) => [4, faceRow, faceSize - 1, left],
    up: (_, faceColumn) => [3, faceSize - 1, faceColumn, up],
  },
  6: {
    right: (faceRow, _) => [5, faceSize - 1, faceRow, up],
    down: (_, faceColumn) => [2, 0, faceColumn, down],
    left: (faceRow, _) => [1, 0, faceRow, down],
    up: (_, faceColumn) => [4, faceSize - 1, faceColumn, up],
  },
};

function solve(part2: boolean): number {
  let row = 0;
  let column = rowBoundaries[0][0];
  let direction = right;

  for (const instruction of instructions) {
    if (instruction === "L" || instruction === "R") {
      direction = turn(direction, instruction);
      continue;
    }

    for (let step = 0; step < instruction; ++step) {
      let nextRow = row + direction[0];
      let nextColumn = column + direction[1];
      const cube = getCube(row, column);
      let nextCube = getCube(nextRow, nextColumn);
      let nextDirection = direction;
      if (!part2) {
        if (direction === up && nextRow < columnBoundaries[nextColumn][0])
          nextRow = columnBoundaries[nextColumn][1];
        else if (direction === down && nextRow > columnBoundaries[nextColumn][1])
          nextRow = columnBoundaries[nextColumn][0];
        else if (direction === left && nextColumn < rowBoundaries[nextRow][0])
          nextColumn = rowBoundaries[nextRow][1];
        else if (direction === right && nextColumn > rowBoundaries[nextRow][1])
          nextColumn = rowBoundaries[nextRow][0];
      } else if (cube !== nextCube) {
        const cubePos = getCubePosition(cube);
        const faceRow = row - cubePos[0];
        const faceColumn = column - cubePos[1];
        [nextCube, nextRow, nextColumn, nextDirection] = cubeBoundaries[cube][
          getCubeDirection(direction)
        ](faceRow, faceColumn);
        const [nextCubeRow, nextCubeColumn] = getCubePosition(nextCube);
        nextRow += nextCubeRow;
        nextColumn += nextCubeColumn;
      }
      if (map[nextRow][nextColumn] === "#") {
        break;
      } else {
        row = nextRow;
        column = nextColumn;
        direction = nextDirection;
      }
    }
  }
  return 1000 * (row + 1) + 4 * (column + 1) + directions.findIndex((dir) => dir === direction);
}

function printMap(): void {
  console.log(map.map((row) => row.join("")).join("\n"));
}

console.log("Part 1 answer:", solve(false));
console.log("Part 2 answer:", solve(true));

console.timeEnd("Execution time");
export {};
