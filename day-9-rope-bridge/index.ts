console.time("Execution time");

/** [x, y] */
type Position = [number, number];
type Direction = "U" | "R" | "D" | "L";
type Move = [Direction, number];

const directionDelta: Record<Direction, Position> = {
  U: [0, 1],
  R: [1, 0],
  D: [0, -1],
  L: [-1, 0],
};

// For convenience/readability, so that I can write position[x] and position[y].
const x = 0;
const y = 1;

const inputFile: "test" | "input" = "input";
const moves: Array<Move> = require("fs")
  .readFileSync(require("path").resolve(__dirname, inputFile), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line: string) => line.split(" ").map((value, index) => (index === 0 ? value : +value)));

/**
 * Offset is used to be able to handle negative numbers, since positions can have negative values (we start at [0, 0]).
 * Largest step size seems to be around 20, and there's at most around 500 steps in any direction.
 * So 16 bits per axis should be enough since (2^16)/2 > 20*500.
 */
const offset = (1 << 16) / 2;
function posHash([x, y]: Position): number {
  return x + offset + ((y + offset) << 16);
}

function numberOfVisitedPositions(numberOfKnots: number): number {
  const knots: Array<Position> = new Array(numberOfKnots).fill(undefined).map(() => [0, 0]);
  const visited = new Set<number>([posHash([0, 0])]);
  for (const [direction, steps] of moves) {
    for (let step = 0; step < steps; ++step) {
      let [dx, dy] = directionDelta[direction];
      knots[0][x] += dx;
      knots[0][y] += dy;

      for (let i = 1; i < knots.length; ++i) {
        const prevKnot = knots[i - 1];
        const currentKnot = knots[i];
        const yMoved = Math.abs(prevKnot[y] - currentKnot[y]) > 1;
        const xMoved = Math.abs(prevKnot[x] - currentKnot[x]) > 1;
        if (!yMoved && !xMoved) continue;

        dx = (!xMoved ? prevKnot[x] : prevKnot[x] - dx) - currentKnot[x];
        dy = (!yMoved ? prevKnot[y] : prevKnot[y] - dy) - currentKnot[y];
        currentKnot[x] += dx;
        currentKnot[y] += dy;
      }
      visited.add(posHash(knots[knots.length - 1]));
      printTestKnots(knots);
    }
  }
  return visited.size;
}

console.log("Part 1 answer:", numberOfVisitedPositions(2));
console.log("Part 2 answer:", numberOfVisitedPositions(10));

/** Prints the "test" file positions to look like the examples in the assignment, just for debugging. */
function printTestKnots(knots: Array<Position>): void {
  if (inputFile !== "test") return;

  const board: Array<Array<string>> = new Array(5)
    .fill(undefined)
    .map(() => new Array(6).fill("."));
  for (let i = knots.length - 1; i >= 0; --i) {
    const [x, y] = knots[i];
    board[4 - y][x] = i === 0 ? "H" : `${i}`;
  }
  console.log(board.map((row) => row.join("")).join("\n"), "\n");
}

console.timeEnd("Execution time");
export {};
