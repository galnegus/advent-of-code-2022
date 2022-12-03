console.time("Execution time");
const input: Array<[Opponent, Player]> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((row: string) => row.split(" "));

type Opponent = "A" | "B" | "C";
type Player = "X" | "Y" | "Z";
type Shape = "Rock" | "Paper" | "Scissors";
const lose = 0;
const draw = 3;
const win = 6;

const opponentToShape: Record<Opponent, Shape> = {
  A: "Rock",
  B: "Paper",
  C: "Scissors",
};
const playerToShape: Record<Player, Shape> = {
  X: "Rock",
  Y: "Paper",
  Z: "Scissors",
};
const playerToOutcome: Record<Player, number> = {
  X: lose,
  Y: draw,
  Z: win,
};
const shapeScore: Record<Shape, number> = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
};
const gameOutcome: Record<Shape, Record<Shape, number>> = {
  Rock: {
    Rock: draw,
    Paper: win,
    Scissors: lose,
  },
  Paper: {
    Rock: lose,
    Paper: draw,
    Scissors: win,
  },
  Scissors: {
    Rock: win,
    Paper: lose,
    Scissors: draw,
  },
};

const p1ScoreSum = input
  .map(([opponent, player]) => [
    opponentToShape[opponent],
    playerToShape[player],
  ])
  .reduce(
    (sum, [opponent, player]) =>
      sum + gameOutcome[opponent][player] + shapeScore[player],
    0
  );
console.log("Part 1 answer:", p1ScoreSum);

const p2ScoreSum = input
  .map<[Shape, number]>(([opponent, player]) => [
    opponentToShape[opponent],
    playerToOutcome[player],
  ])
  .map<[Shape, Shape]>(([opponent, outcome]) => {
    const player = Object.keys(gameOutcome[opponent]).find(
      (playerShape) => gameOutcome[opponent][playerShape as Shape] === outcome
    ) as Shape;
    return [opponent, player];
  })
  .reduce(
    (sum, [opponent, player]) =>
      sum + gameOutcome[opponent][player] + shapeScore[player],
    0
  );
console.log("Part 2 answer:", p2ScoreSum);

console.timeEnd("Execution time");
export {};
