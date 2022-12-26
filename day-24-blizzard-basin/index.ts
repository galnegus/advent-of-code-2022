console.time("Execution time");

const testInput = false;

type State = [row: number, column: number, minutes: number];
type Position = [row: number, column: number];
type Visited = Array<Array<Array<boolean>>>;

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const inputLines = rawInput.split(/\r?\n/);

const rows = inputLines.length - 2;
const columns = inputLines[0].length - 2;
const start: Position = [0, 1];
const end: Position = [rows + 1, columns];

const winds = inputLines.slice(1, -1).map((line) => line.substring(1, line.length - 1));
function hasWind(row: number, column: number, minutes: number): boolean {
  row -= 1;
  column -= 1;
  return (
    winds[mod(row - minutes, rows)][column] === "v" ||
    winds[mod(row + minutes, rows)][column] === "^" ||
    winds[row][mod(column - minutes, columns)] === ">" ||
    winds[row][mod(column + minutes, columns)] === "<"
  );
}
function canMove(row: number, column: number, minutes: number, visited: Visited): boolean {
  if ((row === start[0] && column === start[1]) || (row === end[0] && column === end[1]))
    return true; // starting positions
  if (
    row < 0 ||
    row > rows ||
    row === 0 ||
    row === rows + 1 ||
    column === 0 ||
    column === columns + 1
  )
    return false; // boundary
  return !hasWind(row, column, minutes) && !visited[row][column][minutes % (rows * columns)];
}

function travelTime(from: Position, to: Position, initialMinutes: number): number {
  const visited: Visited = new Array(rows + 2)
    .fill(undefined)
    .map(() =>
      new Array(columns + 2).fill(undefined).map(() => new Array(rows * columns).fill(false))
    );
  const stack: Array<State> = [[from[0], from[1], initialMinutes]];
  while (stack.length > 0) {
    const [row, column, minutes] = stack.shift()!;
    if (row === to[0] && column === to[1]) {
      return minutes;
    }

    const next: Array<State> = [];
    if (canMove(row, column, minutes + 1, visited)) next.push([row, column, minutes + 1]);
    if (canMove(row + 1, column, minutes + 1, visited)) next.push([row + 1, column, minutes + 1]);
    if (canMove(row - 1, column, minutes + 1, visited)) next.push([row - 1, column, minutes + 1]);
    if (canMove(row, column + 1, minutes + 1, visited)) next.push([row, column + 1, minutes + 1]);
    if (canMove(row, column - 1, minutes + 1, visited)) next.push([row, column - 1, minutes + 1]);

    for (const nextState of next) {
      stack.push(nextState);
      visited[nextState[0]][nextState[1]][nextState[2] % (rows * columns)] = true;
    }
  }
  return -1;
}

const firstTime = travelTime(start, end, 0);
const backForSnacks = travelTime(end, start, firstTime);
const secondTime = travelTime(start, end, backForSnacks);

console.log("Part 1 answer:", firstTime);
console.log("Part 2 answer:", secondTime);

console.timeEnd("Execution time");
export {};
