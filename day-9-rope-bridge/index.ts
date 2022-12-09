console.time("Execution time");

/** [x, y] */
type Position = [number, number];
type Direction = "U" | "R" | "D" | "L";
type Move = [Direction, number];

// For convenience/readability, so you can write position[x] and position[y].
const x = 0;
const y = 1;

const inputFile: "test" | "input" = "input";
const moves: Array<Move> = require("fs")
  .readFileSync(require("path").resolve(__dirname, inputFile), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line: string) => line.split(" ").map((value, index) => (index === 0 ? value : +value)));

/** Prints the "test" file positions to look like the examples in the assignment, just for debugging. */
function printTestKnots(knots: Array<Position>): void {
  const board: Array<Array<string>> = new Array(5)
    .fill(undefined)
    .map(() => new Array(6).fill("."));
  for (let i = knots.length - 1; i >= 0; --i) {
    const [x, y] = knots[i];
    board[4 - y][x] = i === 0 ? "H" : `${i}`;
  }
  console.log(board.map((row) => row.join("")).join("\n"), "\n");
}

/**
 * Offset is used to be able to handle negative numbers, since positions can have negative values (we start at [0, 0]).
 * Largest step size seems to be around 20, and there's at most around 500 steps in any direction.
 * So 16 bits per axis should be enough since (2^16)/2 > 20*500.
 */ 
const offset = (1 << 16) / 2;
function posHash([x, y]: Position): number {
  return x + offset + ((y + offset) << 16);
}

function knotsTouch(head: Position, tail: Position): boolean {
  return Math.abs(head[x] - tail[x]) <= 1 && Math.abs(head[y] - tail[y]) <= 1;
}

function visitedPositions(numberOfKnots: number): number {
  const rope: Array<Position> = new Array(numberOfKnots).fill(undefined).map(() => [0, 0]);
  const head = rope[0];
  const tail = rope[rope.length - 1];
  const visited = new Set<number>([posHash(tail)]);
  for (const [direction, steps] of moves) {
    for (let i = 0; i < steps; ++i) {
      let prevX = head[x];
      let prevY = head[y];

      if (direction === "U") head[y] += 1;
      if (direction === "R") head[x] += 1;
      if (direction === "D") head[y] -= 1;
      if (direction === "L") head[x] -= 1;

      for (let knotIndex = 1; knotIndex < rope.length; ++knotIndex) {
        const currentKnot = rope[knotIndex];
        const prevKnot = rope[knotIndex - 1];
        if (knotsTouch(prevKnot, currentKnot)) continue;

        const nextPrevX = currentKnot[x];
        const nextPrevY = currentKnot[y];
        if (
          Math.abs(prevKnot[y] - currentKnot[y]) > 1 &&
          Math.abs(prevKnot[x] - currentKnot[x]) > 1
        ) {
          currentKnot[x] = prevX;
          currentKnot[y] = prevY;
        } else if (Math.abs(prevKnot[y] - currentKnot[y]) > 1) {
          currentKnot[x] = prevKnot[x];
          currentKnot[y] = prevY;
        } else {
          currentKnot[y] = prevKnot[y];
          currentKnot[x] = prevX;
        }
        prevX = nextPrevX;
        prevY = nextPrevY;
      }
      visited.add(posHash(tail));
      if (inputFile === "test") printTestKnots(rope);
    }
  }
  return visited.size;
}

console.log("Part 1 answer:", visitedPositions(2));
console.log("Part 2 answer:", visitedPositions(10));

console.timeEnd("Execution time");
export {};
