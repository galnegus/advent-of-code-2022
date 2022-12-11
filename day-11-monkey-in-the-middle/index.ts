console.time("Execution time");

interface Monkey {
  /** The worry level of the items that the monkey is carrying */
  items: Array<number>;
  /** How the worry level of the item changes as the monkey inspects it. */
  operation: (old: number) => number;
  /** What divisor the monkey uses, needed for "worry management" in part 2 */
  testDivisor: number;
  /** Monkey decides to which other monkey to throw the item to next (returns monkey index). */
  test: (worry: number) => number;
  /** Number of inspections performed by the monkey */
  inspections: number;
}

const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);

const initialMonkeys = input
  .split(/\r?\n\r?\n/)
  .filter(Boolean)
  .map((line: string) =>
    line
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.trim())
  )
  .map<Monkey>((monkeyInput) => {
    const items = monkeyInput[1].split("Starting items: ")[1].split(", ").map(Number);
    const operationInput = monkeyInput[2].split("Operation: new = old ")[1].split(" ");
    const operation = (old: number) => {
      const operator = operationInput[0];
      const operand = operationInput[1] === "old" ? old : +operationInput[1];
      return operator === "+" ? old + operand : old * operand;
    };
    const testDivisor = +monkeyInput[3].split("Test: divisible by ")[1];
    const testTrue = +monkeyInput[4].split("If true: throw to monkey ")[1];
    const testFalse = +monkeyInput[5].split("If false: throw to monkey ")[1];
    const test = (worry: number) => (worry % testDivisor === 0 ? testTrue : testFalse);
    return {
      items,
      operation,
      testDivisor,
      test,
      inspections: 0,
    };
  });

const monkeysDivisorsProduct = initialMonkeys.reduce(
  (product, monkey) => product * monkey.testDivisor,
  1
);

function levelOfMonkeyBusiness(naiveWorryManagement: boolean, numberOfRounds: number): number {
  const monkeys = initialMonkeys.map<Monkey>((monkey) => ({ ...monkey, items: [...monkey.items] }));
  for (let round = 1; round <= numberOfRounds; ++round) {
    for (const monkey of monkeys) {
      while (monkey.items.length > 0) {
        monkey.inspections += 1;
        let itemWorry = monkey.items.shift();
        if (itemWorry === undefined) throw new Error("No item found :(");
        itemWorry = monkey.operation(itemWorry);

        if (naiveWorryManagement) itemWorry = Math.floor(itemWorry / 3);
        else itemWorry %= monkeysDivisorsProduct;

        const nextMonkey = monkey.test(itemWorry);
        monkeys[nextMonkey].items.push(itemWorry);
      }
    }
  }
  return monkeys
    .sort((a, b) => b.inspections - a.inspections)
    .filter((_, index) => index < 2)
    .reduce((product, monkey) => product * monkey.inspections, 1);
}

console.log("Part 1 answer:", levelOfMonkeyBusiness(true, 20));
console.log("Part 2 answer:", levelOfMonkeyBusiness(false, 10000));

console.timeEnd("Execution time");
export {};
