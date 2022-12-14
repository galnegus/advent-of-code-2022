console.time("Execution time");

type Coordinate = [x: number, y: number];

const x = 0;
const y = 1;

const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);

const min: Coordinate = [Number.MAX_VALUE, Number.MAX_VALUE];
const max: Coordinate = [Number.MIN_VALUE, Number.MIN_VALUE];
const paths = input.split(/\r?\n/).map((line) =>
  line.split(" -> ").map((coordinateInput) => {
    const splitInput = coordinateInput.split(",").map(Number);
    const coordinate: Coordinate = [splitInput[0], splitInput[1]];
    if (coordinate[x] < min[x]) min[x] = coordinate[x];
    if (coordinate[y] < min[y]) min[y] = coordinate[y];
    if (coordinate[x] > max[x]) max[x] = coordinate[x];
    if (coordinate[y] > max[y]) max[y] = coordinate[y];
    return coordinate;
  })
);

const board: Array<Array<boolean>> = new Array(500 + max[y] + 3)
  .fill(undefined)
  .map(() => new Array(max[y] + 3).fill(false)); // + 3 is very important here!

for (const path of paths) {
  for (let i = 1; i < path.length; ++i) {
    const dx = path[i][x] - path[i - 1][x];
    const dy = path[i][y] - path[i - 1][y];
    const dxSign = Math.sign(dx);
    const dySign = Math.sign(dy);
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
    for (let step = 0; step < steps; ++step) {
      board[path[i - 1][x] + dxSign * step][path[i - 1][y] + dySign * step] = true;
    }
  }
}

function isBlocked(boardX: number, boardY: number, hasFloor: boolean): boolean {
  return board[boardX][boardY] || (hasFloor && boardY === max[y] + 2);
}

function drop(sand: Coordinate, hasFloor = false): boolean {
  while (true) {
    if (!isBlocked(sand[x], sand[y] + 1, hasFloor)) {
      sand[y] += 1;
    } else if (!hasFloor && sand[x] - 1 < min[x]) {
      return false;
    } else if (!isBlocked(sand[x] - 1, sand[y] + 1, hasFloor)) {
      sand[y] += 1;
      sand[x] -= 1;
    } else if (!hasFloor && sand[x] + 1 > max[x]) {
      return false;
    } else if (!isBlocked(sand[x] + 1, sand[y] + 1, hasFloor)) {
      sand[y] += 1;
      sand[x] += 1;
    } else if (hasFloor && sand[y] === 0) {
      return false;
    } else {
      break;
    }
  }
  return true;
}

let unitsOfSand = 0;
while (true) {
  const sand: Coordinate = [500, 0];
  const result = drop(sand);
  if (!result) {
    console.log("Part 1 answer:", unitsOfSand);
    break;
  } else board[sand[x]][sand[y]] = true;
  ++unitsOfSand;
}
while (true) {
  const sand: Coordinate = [500, 0];
  const result = drop(sand, true);
  if (!result) {
    console.log("Part 2 answer:", unitsOfSand + 1);
    break;
  } else board[sand[x]][sand[y]] = true;
  ++unitsOfSand;
}

console.timeEnd("Execution time");
export {};
