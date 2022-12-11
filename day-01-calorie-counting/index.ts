import Heap from "heap-js";

console.time("Execution time");
const bags: Array<Array<number>> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/(\r?\n){2,}/)
  .map((bag: string) => bag.split(/\r?\n/).filter(Boolean).map(Number))
  .filter((bag: Array<Array<number>>) => bag.length > 0);

const bagSums = bags.map((bag) => bag.reduce((sum, item) => sum + item, 0));
console.log("Part 1 answer:", Math.max(...bagSums));

const bagHeap = Heap.heapify(bagSums, (a, b) => b - a);
const top3Sum = bagHeap.top(3).reduce((sum, item) => sum + item, 0);
console.log("Part 2 answer:", top3Sum);

console.timeEnd("Execution time");
export {};
