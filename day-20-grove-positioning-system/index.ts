console.time("Execution time");

const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const input: Array<number> = rawInput.split(/\r?\n/).map((line) => Number(line));
const numbers = input.length;

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

function getOrder(list: Array<number>): Array<number> {
  return list.map((_, i) => i);
}

function mix(list: Array<number>, order?: Array<number>): Array<number> {
  const result = [...list];
  if (order === undefined) order = getOrder(result);
  for (let i = 0; i < numbers; ++i) {
    const pointer = order.findIndex((orderItem) => orderItem === i);
    let moveTo = pointer + result[pointer];
    if (moveTo < 0 || moveTo >= numbers) moveTo = mod(moveTo, numbers - 1);
    const item = result.splice(pointer, 1)[0];
    result.splice(moveTo, 0, item);
    const orderItem = order.splice(pointer, 1)[0];
    order.splice(moveTo, 0, orderItem);
  }
  return result;
}

function coordinates(mixedList: Array<number>): number {
  const zeroIndex = mixedList.findIndex((num) => num === 0);
  return (
    mixedList[mod(zeroIndex + 1000, numbers)] +
    mixedList[mod(zeroIndex + 2000, numbers)] +
    mixedList[mod(zeroIndex + 3000, numbers)]
  );
}

console.log("Part 1 answer:", coordinates(mix(input)));

const decryptionKey = 811589153;
const decryptedInput = input.map((item) => item * decryptionKey);
const order = getOrder(decryptedInput);
console.log(
  "Part 2 answer:",
  coordinates(
    new Array(10).fill(undefined).reduce((mixedInput) => mix(mixedInput, order), decryptedInput)
  )
);
console.timeEnd("Execution time");
export {};
