console.time("Execution time");

/** [0, 0] is the bottom-left corner of the rock's "coordinate system" */
type Rock = Array<[x: number, y: number]>;
const rocks: Array<Rock> = [
  // "Minus"
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  // "Plus"
  [
    [0, 1],
    [1, 2],
    [1, 1],
    [1, 0],
    [2, 1],
  ],
  // "Reverse L"
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  // "Vertical line"
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  // "Square"
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
];
/** The height of each rock, used to update floor level */
const rockHeights = [1, 3, 3, 4, 2];

const jetPattern: Array<"<" | ">"> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split("");

/** Just needs to be big enough to find an answer / not get error! */
const boardRows = 10000;
/** Check for collisions: board[x][y] */
const board: Array<Array<boolean>> = new Array(7)
  .fill(undefined)
  .map(() => new Array(boardRows).fill(false)); // big enough to find cycles

function collides(x: number, y: number): boolean {
  return x < 0 || x > 6 || y < 0 || board[x][y];
}
function canMoveTo(rock: Rock, x: number, y: number): boolean {
  return rock.every((rockPiece) => !collides(x + rockPiece[0], y + rockPiece[1]));
}

/**
 * Store how many jets have been used and how many floors there are after placing each rock
 * We'll need these later to find cycles where the same number of jets are used between n rocks being placed
 */
const jetsUsedAt: Array<number> = [];
const floorsAt: Array<number> = [];

let floor = -1;
let jetsUsed = 0;
for (let rockNo = 0; rockNo < boardRows; ++rockNo) {
  floorsAt[rockNo] = floor;
  jetsUsedAt[rockNo] = jetsUsed;

  let rockX = 2;
  let rockY = floor + 4;
  const rock = rocks[rockNo % rocks.length];
  while (true) {
    // Jet movement
    const jet = jetPattern[jetsUsed % jetPattern.length];
    if (jet === "<" && canMoveTo(rock, rockX - 1, rockY)) rockX -= 1;
    else if (jet === ">" && canMoveTo(rock, rockX + 1, rockY)) rockX += 1;
    jetsUsed += 1;

    // Vertical movement
    if (canMoveTo(rock, rockX, rockY - 1)) {
      rockY -= 1;
    } else {
      for (const rockPiece of rock) {
        board[rockX + rockPiece[0]][rockY + rockPiece[1]] = true;
      }
      floor = Math.max(rockY + rockHeights[rockNo % rocks.length] - 1, floor);
      break;
    }
  }
}

let cycleLength = 0;
// cycle length must be divisble with 5 (the number of rock types), set test accordingly
for (let test = rocks.length; test < boardRows; test += rocks.length) {
  let cycleFound = true;
  for (let i = test * 3; i <= test * 5; i += test) {
    if (jetsUsedAt[i] - jetsUsedAt[i - test] !== jetsUsedAt[i - test] - jetsUsedAt[i - test * 2]) {
      cycleFound = false;
      continue;
    }
  }
  if (cycleFound) {
    cycleLength = test;
    break;
  }
}

function howManyFloors(rocks: bigint): bigint {
  // Start counting cycles only after cycleLength, since I'm not sure where the cycles start,
  // think it's somewhere between cycleLength and cycleLength * 2.
  const floorsPerCycle = BigInt(floorsAt[cycleLength * 2] - floorsAt[cycleLength]);
  return (
    BigInt(floorsAt[cycleLength + Number(rocks % BigInt(cycleLength))]) +
    BigInt(Math.floor(Number(rocks / BigInt(cycleLength)) - 1)) * floorsPerCycle +
    1n
  );
}

console.log("Part 1 answer:", howManyFloors(2022n).toString());
console.log("Part 2 answer:", howManyFloors(1000000000000n).toString());

console.timeEnd("Execution time");
export {};
