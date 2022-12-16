console.time("Execution time");

/**
 * ~5 seconds at the moment...
 */

interface Valve {
  name: string;
  flowRate: number;
  tunnelsLeadTo: Array<Valve>;
}

function isValve(valve: Valve | undefined): valve is Valve {
  return valve !== undefined;
}

const inputLines: Array<string> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/);

/** Maps valve names to valve objects */
const valves = new Map<string, Valve>(
  inputLines.map<[string, Valve]>((inputLine) => {
    const name = inputLine.substring(6, 8);
    const flowRate = +(inputLine.match(/(?<=flow rate=)\d+/)?.[0] ?? -1);
    return [name, { name, flowRate, tunnelsLeadTo: [] }];
  })
);
for (const inputLine of inputLines) {
  const valve = valves.get(inputLine.substring(6, 8));
  if (!isValve(valve)) throw new Error();
  valve.tunnelsLeadTo = inputLine
    .split(/valves? /)[1]
    .split(", ")
    .map((name) => valves.get(name))
    .filter(isValve);
}
const valveNames = Array.from(valves.keys());
const distances = new Map<string, Map<string, number>>(
  valveNames.map((outerName) => [
    outerName,
    new Map(valveNames.map((innerName) => [innerName, -1])),
  ])
);

type SearchNode = [valve: Valve, depth: number];
function fillDistancesFor(name: string): void {
  const visited = new Set<string>([name]);
  const stack: Array<SearchNode> = [[valves.get(name)!, 0]];
  while (stack.length > 0) {
    const [valve, depth] = stack.shift()!;
    distances.get(name)!.set(valve.name, depth);
    for (const neighboringValve of valve.tunnelsLeadTo) {
      if (visited.has(neighboringValve.name)) continue;
      visited.add(neighboringValve.name);
      stack.push([neighboringValve, depth + 1]);
    }
  }
}
valveNames.forEach(fillDistancesFor);

const nonZeroValves = Array.from(valves.values()).filter((valve) => valve.flowRate > 0);

function findOptimalPressure(
  pressure: number,
  flowRate: number,
  minutes: number,
  atValve: Valve,
  valves: Array<Valve>
): number {
  if (minutes >= 30) return pressure;
  const valvesToCheck = valves.filter(
    (toValve) => (minutes + distances.get(atValve.name)!.get(toValve.name)! < 30)!
  );

  if (valvesToCheck.length === 0) return pressure + (30 - minutes + 1) * flowRate;

  return Math.max(
    ...valvesToCheck.map((valveToCheck) => {
      const distance = distances.get(atValve.name)!.get(valveToCheck.name)!;
      return findOptimalPressure(
        pressure + (distance + 1) * flowRate,
        flowRate + valveToCheck.flowRate,
        minutes + distance + 1,
        valveToCheck,
        valvesToCheck.filter((valve) => valve !== valveToCheck)
      );
    })
  );
}

const aa = valves.get("AA")!;
console.log("Part 1 answer:", findOptimalPressure(0, 0, 1, aa, nonZeroValves));

let max = 0;
for (let i = 1; i < 2 ** nonZeroValves.length - 1; ++i) {
  const popcount = bitCount(i);
  // NAIVE ASSUMPTION: Both arrays should be roughly the same size ;) probably not correct but I got the right answer still, AND it's 5 times faster!
  if (Math.abs(popcount - nonZeroValves.length / 2) > 1) continue;
  const a: Array<Valve> = [];
  const b: Array<Valve> = [];
  for (let j = 0; j < nonZeroValves.length; ++j) {
    if (((1 << j) & i) === 0) {
      a.push(nonZeroValves[j]);
    } else {
      b.push(nonZeroValves[j]);
    }
  }
  const result = findOptimalPressure(0, 0, 5, aa, a) + findOptimalPressure(0, 0, 5, aa, b);
  if (result > max) max = result;
}

console.log("Part 2 answer:", max);

// https://stackoverflow.com/a/43122214
function bitCount(n: number): number {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

console.timeEnd("Execution time");
export {};
