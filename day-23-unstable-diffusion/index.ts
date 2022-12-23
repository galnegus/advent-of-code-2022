console.time("Execution time");

const testInput = false;

const offset = 50;
const board: Array<Array<boolean>> = new Array(200)
  .fill(undefined)
  .map(() => new Array(200).fill(false));
const elves = new Map<number, Vector>();

const encodeOffset = (1 << 16) / 2;
function encodePosition(row: number, column: number): number {
  return ((row + encodeOffset) << 16) | (column + encodeOffset);
}

function addElf(row: number, column: number): void {
  board[row + offset][column + offset] = true;
  elves.set(encodePosition(row, column), [row, column]);
}
function removeElf(row: number, column: number): void {
  board[row + offset][column + offset] = false;
  elves.delete(encodePosition(row, column));
}
function hasElf(row: number, column: number): boolean {
  return board[row + offset][column + offset];
}

function hasNoPotentialMoves(row: number, column: number): boolean {
  return (
    !hasElf(row - 1, column - 1) &&
    !hasElf(row - 1, column) &&
    !hasElf(row - 1, column + 1) &&
    !hasElf(row, column - 1) &&
    !hasElf(row, column + 1) &&
    !hasElf(row + 1, column - 1) &&
    !hasElf(row + 1, column) &&
    !hasElf(row + 1, column + 1)
  );
}

type Vector = [row: number, column: number];
type ElfMove = [from: Vector, to: Vector];
type PotentialMove = (row: number, column: number) => ElfMove | null;
const potentialMoves: Array<PotentialMove> = [
  (row, column) =>
    !hasElf(row - 1, column - 1) && !hasElf(row - 1, column) && !hasElf(row - 1, column + 1)
      ? [
          [row, column],
          [row - 1, column],
        ]
      : null,
  (row, column) =>
    !hasElf(row + 1, column - 1) && !hasElf(row + 1, column) && !hasElf(row + 1, column + 1)
      ? [
          [row, column],
          [row + 1, column],
        ]
      : null,
  (row, column) =>
    !hasElf(row + 1, column - 1) && !hasElf(row, column - 1) && !hasElf(row - 1, column - 1)
      ? [
          [row, column],
          [row, column - 1],
        ]
      : null,
  (row, column) =>
    !hasElf(row + 1, column + 1) && !hasElf(row, column + 1) && !hasElf(row - 1, column + 1)
      ? [
          [row, column],
          [row, column + 1],
        ]
      : null,
];

const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const input = rawInput.split(/\r?\n/);

for (let row = 0; row < input.length; ++row) {
  for (let column = 0; column < input[row].length; ++column) {
    if (input[row][column] === "#") addElf(row, column);
  }
}

for (let round = 0; round < 1000; ++round) {
  const moves: Array<ElfMove> = [];
  const moveDupeChecker = new Map<number, number>();

  for (const [row, column] of elves.values()) {
    if (hasNoPotentialMoves(row, column)) continue;
    for (let moveIndex = round; moveIndex < round + 4; ++moveIndex) {
      const tryMove = potentialMoves[moveIndex % potentialMoves.length](row, column);
      if (tryMove === null) continue;
      moves.push(tryMove);
      const position = encodePosition(tryMove[1][0], tryMove[1][1]);
      moveDupeChecker.set(position, (moveDupeChecker.get(position) ?? 0) + 1);
      break;
    }
  }

  for (const move of moves) {
    const position = encodePosition(move[1][0], move[1][1]);
    if (moveDupeChecker.get(position) === 1) {
      removeElf(move[0][0], move[0][1]);
      addElf(move[1][0], move[1][1]);
    }
  }

  if (round === 9) {
    const rows = [...elves.values()].map(([row]) => row);
    const columns = [...elves.values()].map(([_, column]) => column);
    let emptyTiles =
      (Math.max(...rows) - Math.min(...rows) + 1) *
        (Math.max(...columns) - Math.min(...columns) + 1) -
      elves.size;
    console.log("Part 1 answer:", emptyTiles);
  }

  if (moves.length === 0) {
    console.log("Part 2 answer:", round + 1);
    break;
  }
}

console.timeEnd("Execution time");
export {};
