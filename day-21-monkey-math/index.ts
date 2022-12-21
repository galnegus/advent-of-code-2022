console.time("Execution time");

type Operator = "+" | "-" | "/" | "*" | "=";
interface Operation {
  monkey: string;
  left: string;
  operator: Operator;
  right: string;
}
type Expression = {
  left: Expression | number;
  operator: Operator;
  right: Expression | number;
};

const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const [numberInputs, operationInputs] = rawInput
  .split(/\r?\n/)
  .reduce<[Array<string>, Array<string>]>(
    (result, line) => (result[/\d$/.test(line) ? 0 : 1].push(line), result),
    [[], []]
  );
/** Maps from a monkey's name to its number (for monkeys who have a known number) */
const initialNumbers = new Map<string, number>(
  numberInputs.map((line) => line.split(": ")).map((split) => [split[0], Number(split[1])])
);
/** Contains all monkeys that have "operations" rather than numbers initially, e.g., something like "humn - dvpt" */
const initialOperations = operationInputs
  .map((line) => line.split(" "))
  .map<Operation>((split) => ({
    monkey: split[0].substring(0, split[0].length - 1),
    left: split[1],
    operator: split[2] as Operator,
    right: split[3],
  }));

function compute(left: number, operator: Operator, right: number): number {
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  if (operator === "*") return left * right;
  if (operator === "/") return left / right;
  return NaN;
}

function isNumber(expression: number | Expression | undefined): expression is number {
  return typeof expression === "number";
}

function solve(part2: boolean): number {
  const numbers = new Map<string, number>(initialNumbers);
  const expressions = new Map<string, number | Expression>();
  const operations = [...initialOperations];

  if (part2) {
    numbers.delete("humn");
    expressions.set("humn", { left: 0, operator: "+", right: 0 }); // A "NOOP" expression
    operations.find((operation) => operation.monkey === "root")!.operator = "=";
  }

  let operation: Operation | undefined;
  while ((operation = operations.shift()) !== undefined) {
    let { monkey, left, operator, right } = operation;
    const leftValue = expressions.get(left) ?? numbers.get(left);
    const rightValue = expressions.get(right) ?? numbers.get(right);
    if (isNumber(leftValue) && isNumber(rightValue))
      numbers.set(monkey, compute(leftValue, operator, rightValue));
    else if (part2 && leftValue !== undefined && rightValue !== undefined)
      expressions.set(monkey, { left: leftValue, operator: operator, right: rightValue });
    else operations.push(operation);
  }

  if (!part2) return numbers.get("root")!;

  let value = 0;
  let expression = expressions.get("root")!;
  while (!isNumber(expression)) {
    const { operator, left, right } = expression;
    if (isNumber(left)) {
      if (operator === "=") value = left;
      else if (operator === "+") value = value - left;
      else if (operator === "-") value = left - value;
      else if (operator === "/") value = left / value;
      else if (operator === "*") value = value / left;
      expression = expression.right;
    } else if (isNumber(right)) {
      if (operator === "=") value = right;
      else if (operator === "+") value = value - right;
      else if (operator === "-") value = value + right;
      else if (operator === "/") value = value * right;
      else if (operator === "*") value = value / right;
      expression = expression.left;
    }
  }
  return value;
}

console.log("Part 1 answer:", solve(false));
console.log("Part 2 answer:", solve(true));

console.timeEnd("Execution time");
export {};
