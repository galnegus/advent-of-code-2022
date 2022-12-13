console.time("Execution time");

type List = Array<List | number>;
type ListPair = [List, List];

const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const listPairs: Array<ListPair> = input
  .split(/\r?\n\r?\n/)
  .map<ListPair>(
    (pairInput) => pairInput.split(/\r?\n/).map((listInput) => JSON.parse(listInput)) as ListPair
  );
const allLists = listPairs.flat(1);

function isList(listItem: List | number): listItem is List {
  return Array.isArray(listItem);
}

/** Return <0 if left is smaller than right, 0 if they're equal, >0 if left is bigger than right. Compatible with Array.sort() */
function comparePair(leftList: List, rightList: List): number {
  for (let i = 0; i < Math.min(leftList.length, rightList.length); ++i) {
    let left = leftList[i];
    let right = rightList[i];
    if (!isList(left) && !isList(right)) {
      if (left > right) return 1;
      if (right > left) return -1;
    } else if (isList(left) && isList(right)) {
      const isInOrder = comparePair(left, right);
      if (isInOrder !== 0) return isInOrder;
    } else if (!isList(left) && isList(right)) {
      const isInOrder = comparePair([left], right);
      if (isInOrder !== 0) return isInOrder;
    } else if (isList(left) && !isList(right)) {
      const isInOrder = comparePair(left, [right]);
      if (isInOrder !== 0) return isInOrder;
    }
  }
  return leftList.length - rightList.length;
}

console.log(
  "Part 1 answer:",
  listPairs
    .map<[ListPair, number]>((listPair, index) => [listPair, index + 1])
    .filter(([listPair]) => comparePair(listPair[0], listPair[1]) < 0)
    .reduce((sum, [_, index]) => sum + index, 0)
);

const decoderOne: List = [[2]];
const decoderTwo: List = [[6]];
allLists.push(...[decoderOne, decoderTwo]);
allLists.sort(comparePair);
console.log(
  "Part 2 answer:",
  (allLists.findIndex((list) => comparePair(list, decoderOne) === 0) + 1) *
    (allLists.findIndex((list) => comparePair(list, decoderTwo) === 0) + 1)
);

console.timeEnd("Execution time");
export {};
