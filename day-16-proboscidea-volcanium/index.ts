console.time("Execution time");

/**
 * <1 second after finding inspiration on reddit 😅
 * original version was like 20 seconds
 */

interface Valve {
  name: string;
  flowRate: number;
  tunnelsLeadTo: Array<Valve>;
  /** Only for non-zero valves */
  bitMask?: number;
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
    new Map(valveNames.map((innerName) => [innerName, Number.POSITIVE_INFINITY])),
  ])
);
for (const valve of valves.values()) {
  for (const neighbor of valve.tunnelsLeadTo) {
    distances.get(valve.name)!.set(neighbor.name, 1);
  }
  distances.get(valve.name)!.set(valve.name, 0);
}
for (const k of valveNames) {
  for (const i of valveNames) {
    for (const j of valveNames) {
      const testDist = distances.get(i)!.get(k)! + distances.get(k)!.get(j)!;
      if (distances.get(i)!.get(j)! > testDist) {
        distances.get(i)!.set(j, testDist);
      }
    }
  }
}
const nonZeroValves = Array.from(valves.values()).filter((valve) => valve.flowRate > 0);
for (let i = 0; i < nonZeroValves.length; ++i) {
  nonZeroValves[i].bitMask = 1 << i;
}

function explorePressureSpace(
  pressure: number,
  flowRate: number,
  minutesLeft: number,
  currentValve: Valve,
  valvesLeft: Array<Valve>,
  bitmask: number,
  pressurePaths: Array<number>
): void {
  const valvesToSearch = valvesLeft.filter(
    (valveToSearch) =>
      (minutesLeft - distances.get(currentValve.name)!.get(valveToSearch.name)! > 0)!
  );
  pressurePaths[bitmask] = Math.max(pressure + minutesLeft * flowRate, pressurePaths[bitmask] ?? 0);
  if (valvesToSearch.length === 0) {
    return;
  }
  for (const valveToSearch of valvesToSearch) {
    const distance = distances.get(currentValve.name)!.get(valveToSearch.name)!;
    explorePressureSpace(
      pressure + (distance + 1) * flowRate,
      flowRate + valveToSearch.flowRate,
      minutesLeft - distance - 1,
      valveToSearch,
      valvesToSearch.filter((valve) => valve !== valveToSearch),
      bitmask | valveToSearch.bitMask!,
      pressurePaths
    );
  }
}
/** Pressure paths is an array where the index is the bitmask of the valves,
 * and the value is the best pressure found with those (masked) valves open */
function findPressurePaths(minutes: number): Array<number> {
  const pressurePaths: Array<number> = new Array(2 ** nonZeroValves.length).fill(0);
  explorePressureSpace(0, 0, minutes, valves.get("AA")!, nonZeroValves, 0, pressurePaths);
  return pressurePaths;
}

console.log("Part 1 answer:", Math.max(...findPressurePaths(30)));

const twoPlayerPaths = findPressurePaths(26);
let max = 0;
for (let human = 0; human < 2 ** nonZeroValves.length; ++human) {
  for (let elephant = 0; elephant < 2 ** nonZeroValves.length; ++elephant) {
    if (elephant & human) continue;
    max = Math.max(max, twoPlayerPaths[human] + twoPlayerPaths[elephant]);
  }
}
console.log("Part 2 answer:", max);

console.timeEnd("Execution time");
export {};
