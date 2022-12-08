console.time("Execution time");

/** Access with board[row][column] */
type Board = Array<Array<number>>;
type Builder = (board: Board, row: number, col: number, rowDelta: number, colDelta: number) => void;

const input: Board = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line: string) => line.split("").map(Number));
const rows = input.length;
const cols = input[0].length;

function isOutOfBounds(row: number, col: number): boolean {
  return row < 0 || row >= rows || col < 0 || col >= cols;
}
function computeBoard({
  rowRange: [rowStart, rowEnd] = [0, rows - 1],
  rowDelta = 0,
  colRange: [colStart, colEnd] = [0, cols - 1],
  colDelta = 0,
  builder,
}: {
  rowRange?: [number, number];
  rowDelta?: number;
  colRange?: [number, number];
  colDelta?: number;
  builder: Builder;
}): Board {
  const board = new Array(rows).fill(undefined).map(() => new Array(cols).fill(0));
  const rowIncrement = Math.sign(rowEnd - rowStart);
  const colIncrement = Math.sign(colEnd - colStart);
  for (let row = rowStart; row != rowEnd + rowIncrement; row += rowIncrement) {
    for (let col = colStart; col != colEnd + colIncrement; col += colIncrement) {
      builder(board, row, col, rowDelta, colDelta);
    }
  }
  return board;
}

function generateBoards(builder: Builder): Array<Board> {
  return [
    computeBoard({ rowRange: [rows - 1, 0], rowDelta: -1, builder }),
    computeBoard({ colDelta: 1, builder }),
    computeBoard({ rowDelta: 1, builder }),
    computeBoard({ colRange: [cols - 1, 0], colDelta: -1, builder }),
  ];
}

const tallestPeaksBuilder: Builder = (board, row, col, rowDelta, colDelta) => {
  const prevRow = row - rowDelta;
  const prevCol = col - colDelta;
  if (isOutOfBounds(prevRow, prevCol)) {
    board[row][col] = -1;
  } else {
    board[row][col] = Math.max(input[prevRow][prevCol], board[prevRow][prevCol]);
  }
};
const viewBuilder: Builder = (board, row, col, rowDelta, colDelta) => {
  const prevRow = row - rowDelta;
  const prevCol = col - colDelta;
  if (isOutOfBounds(prevRow, prevCol)) {
    board[row][col] = 0;
  } else {
    let counter = 1;
    let currentRow = prevRow;
    let currentCol = prevCol;
    while (true) {
      const valueAtCurrent = board[currentRow][currentCol];
      if (input[currentRow][currentCol] >= input[row][col] || valueAtCurrent === 0) {
        break;
      } else {
        counter += valueAtCurrent;
        currentRow += -rowDelta * valueAtCurrent;
        currentCol += -colDelta * valueAtCurrent;
      }
    }
    board[row][col] = counter;
  }
};

const tallestPeakByDirection: Array<Board> = generateBoards(tallestPeaksBuilder);
let treesVisibleFromOutside = 0;
const viewByDirection: Array<Board> = generateBoards(viewBuilder);
const scenicScores: Array<number> = [];
for (let row = 0; row < rows; ++row) {
  for (let col = 0; col < cols; ++col) {
    if (tallestPeakByDirection.some((board) => board[row][col] < input[row][col])) {
      treesVisibleFromOutside++;
    }
    if (row > 0 && row < rows - 1 && col > 0 && col < cols - 1) {
      scenicScores.push(
        viewByDirection.reduce((product, directionBoard) => product * directionBoard[row][col], 1)
      );
    }
  }
}
console.log("Part 1 answer:", treesVisibleFromOutside);
console.log("Part 2 answer:", Math.max(...scenicScores));

console.timeEnd("Execution time");
export {};
