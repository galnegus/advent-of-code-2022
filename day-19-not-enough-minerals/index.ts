console.time("Execution time");

/**
 * This one sucks...
 *
 * Could not figure out what the heck to do, so had to look up some hints 😭
 * 
 * Just added a bunch of bullshit heuristics until I got under 1 second. 😂
 */

type Resources = [ore: number, clay: number, obsidian: number, geode: number];
type RobotCosts = [ore: Resources, clay: Resources, obsidian: Resources, geode: Resources];
interface Blueprint {
  id: number;
  robots: RobotCosts;
  maxCost: Resources;
}
function encodeResources([ore, clay, obsidian, geode]: Resources): number {
  return ore | (clay << 8) | (obsidian << 16) | (geode << 24);
}

const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const blueprints = input.split(/\r?\n/).map<Blueprint>((line) => {
  const id = Number(line.match(/(?<=Blueprint )\d+/)?.[0] ?? -1);
  const robots = line
    .substring(0, line.length - 1)
    .split(".")
    .map<Resources>((robotInput) => [
      Number(robotInput.match(/\d+(?= ore)/)?.[0] ?? 0),
      Number(robotInput.match(/\d+(?= clay)/)?.[0] ?? 0),
      Number(robotInput.match(/\d+(?= obsidian)/)?.[0] ?? 0),
      0,
    ]) as RobotCosts;
  const maxCost = robots.reduce(
    (maxByResource, robot) => maxByResource.map((max, i) => Math.max(max, robot[i])) as Resources,
    [0, 0, 0, 0]
  );
  maxCost[3] = Number.MAX_VALUE;
  return {
    id,
    robots,
    maxCost,
  };
});

let maxSoFar: Array<number>;
let memo: Array<Array<Array<number>>>;
function reset(): void {
  memo = new Array(33).fill(undefined).map(() => new Array());
  maxSoFar = new Array(33).fill(0);
}
const coolmask = 2 ** 24 - 1;
function addToMemo(
  minutesLeft: number,
  robots: Resources,
  resources: Resources,
  result: number
): void {
  const robotCode = encodeResources(robots);
  const resourceCode = encodeResources(resources) & coolmask;
  if (memo[minutesLeft][robotCode] === undefined) memo[minutesLeft][robotCode] = new Array();
  memo[minutesLeft][robotCode][resourceCode] = result;
}
function checkMemo(minutesLeft: number, robots: Resources, resources: Resources): number | null {
  const robotCode = encodeResources(robots);
  const resourceCode = encodeResources(resources) & coolmask;
  return memo[minutesLeft][robotCode]?.[resourceCode] ?? null;
}

function add(robots: Resources, robotIndex: number): Resources {
  const result = [...robots] as Resources;
  result[robotIndex] += 1;
  return result;
}
function pay(resources: Resources, blueprint: Blueprint, robotIndex: number): Resources {
  const result = [...resources] as Resources;
  for (let i = 0; i < 4; ++i) {
    if (blueprint.robots[robotIndex][i] > 0) result[i] -= blueprint.robots[robotIndex][i];
  }
  return result;
}

const limits: Resources = [3, 7, 7, 32];
function shouldCreateRobot(
  blueprint: Blueprint,
  robots: Resources,
  resources: Resources,
  resourceIndex: number
): boolean {
  return (
    robots[resourceIndex] <= limits[resourceIndex] &&
    (robots[resourceIndex] < blueprint.maxCost[resourceIndex] ||
      resources[resourceIndex] < blueprint.maxCost[resourceIndex])
  );
}

type BuildFlags = [oreRobot: boolean, clayRobot: boolean, obsidianRobot: boolean];
const trueBuild: BuildFlags = [true, true, true];
// TODO: Optimisations
// 2. If a result better than max is not reachable (i.e., by building greedily), STOP
function opt(
  blueprint: Blueprint,
  minutesLeft: number,
  robots: Resources,
  resources: Resources,
  canBuild: BuildFlags
): number {
  if (resources[3] < maxSoFar[minutesLeft + 1]) return 0;
  if (resources[3] > maxSoFar[minutesLeft])
    maxSoFar[minutesLeft] = resources[3];
  for (let resourceIndex = 0; resourceIndex < 3; ++resourceIndex) {
    if (
      robots[resourceIndex] >= blueprint.maxCost[resourceIndex] &&
      resources[resourceIndex] >= blueprint.maxCost[resourceIndex]
    ) {
      resources[resourceIndex] = 100;
      robots[resourceIndex] = 100;
    }
  }
  const memoLookup = checkMemo(minutesLeft, robots, resources);
  if (memoLookup !== null) return memoLookup;
  if (minutesLeft === 0) {
    return resources[3];
  }
  let result: number;

  const updatedResources = resources.map((resource, i) => resource + robots[i]) as Resources;
  if (resources[0] >= blueprint.robots[3][0] && resources[2] >= blueprint.robots[3][2]) {
    result = opt(
      blueprint,
      minutesLeft - 1,
      add(robots, 3),
      pay(updatedResources, blueprint, 3),
      trueBuild
    );
  } else {
    let max = 0;

    const canCreateObsidianRobot =
      canBuild[2] &&
      resources[0] >= blueprint.robots[2][0] &&
      resources[1] >= blueprint.robots[2][1] &&
      shouldCreateRobot(blueprint, robots, resources, 2);
    const canCreateClayRobot =
      canBuild[1] &&
      resources[0] >= blueprint.robots[1][0] &&
      shouldCreateRobot(blueprint, robots, resources, 1);
    const canCreateOreRobot =
      canBuild[0] &&
      resources[0] >= blueprint.robots[0][0] &&
      shouldCreateRobot(blueprint, robots, resources, 0);

    if (canCreateObsidianRobot && minutesLeft > 3) {
      max = Math.max(
        max,
        opt(
          blueprint,
          minutesLeft - 1,
          add(robots, 2),
          pay(updatedResources, blueprint, 2),
          trueBuild
        )
      );
    }
    if (canCreateClayRobot && minutesLeft > 8)
      max = Math.max(
        max,
        opt(
          blueprint,
          minutesLeft - 1,
          add(robots, 1),
          pay(updatedResources, blueprint, 1),
          trueBuild
        )
      );
    if (canCreateOreRobot && minutesLeft > 12)
      max = Math.max(
        max,
        opt(
          blueprint,
          minutesLeft - 1,
          add(robots, 0),
          pay(updatedResources, blueprint, 0),
          trueBuild
        )
      );
    max = Math.max(
      max,
      opt(blueprint, minutesLeft - 1, robots, updatedResources, [
        !canCreateOreRobot,
        !canCreateClayRobot,
        !canCreateObsidianRobot,
      ])
    );
    result = max;
  }
  addToMemo(minutesLeft, robots, resources, result);
  return result;
}

console.log(
  "Part 1 answer:",
  blueprints.reduce(
    (sum, blueprint) => (
      reset(), sum + blueprint.id * opt(blueprint, 24, [1, 0, 0, 0], [0, 0, 0, 0], trueBuild)
    ),
    0
  )
);
console.log(
  "Part 2 answer:",
  blueprints
    .slice(0, 3)
    .reduce(
      (product, blueprint) => (
        reset(), product * opt(blueprint, 32, [1, 0, 0, 0], [0, 0, 0, 0], trueBuild)
      ),
      1
    )
);

console.timeEnd("Execution time");
export {};
