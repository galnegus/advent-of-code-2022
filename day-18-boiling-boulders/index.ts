console.time("Execution time");

type Cube = [x: number, y: number, z: number];
type CubeMap = Array<Array<Array<boolean>>>;

let largestSide = 0;
const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, "input"),
  "utf-8"
);
const cubes = input.split(/\r?\n/).map(
  (line) =>
    line.split(",").map((sideInput) => {
      const side = Number(sideInput) + 1;
      if (side > largestSide) largestSide = side;
      return side;
    }) as Cube
);

/** Initializes a cubeMap[x][y][z] of booleans */
function createMap(): CubeMap {
  // use "largestSide + 2" as size, so that we can use largestSide + 1 as a starting point to build the exterior map
  return new Array(largestSide + 2)
    .fill(undefined)
    .map(() =>
      new Array(largestSide + 2).fill(undefined).map(() => new Array(largestSide + 2).fill(false))
    );
}
/** cubeMap[x][y][z] says whether there is a cube at x,y,z or not */
const cubeMap = createMap();
for (const [x, y, z] of cubes) {
  cubeMap[x][y][z] = true;
}
function hasCube(x: number, y: number, z: number, map: CubeMap, boundary: boolean): boolean {
  if (x < 0 || y < 0 || z < 0 || x > largestSide + 1 || y > largestSide + 1 || z > largestSide + 1)
    return boundary;
  return map[x][y][z];
}
const cubeSides: Array<Cube> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

let surface = 0;
for (const [x, y, z] of cubes) {
  for (const [dx, dy, dz] of cubeSides) {
    if (!hasCube(x + dx, y + dy, z + dz, cubeMap, false)) surface += 1;
  }
}

console.log("Part 1 answer:", surface);

/** outsideMap[x][y][z] says whether x,y,z is outside or not */
const outsideMap = createMap();
const stack: Array<Cube> = [[largestSide + 1, largestSide + 1, largestSide + 1]];
while (stack.length > 0) {
  const [x, y, z] = stack.pop()!;
  for (const [dx, dy, dz] of cubeSides) {
    if (
      !hasCube(x + dx, y + dy, z + dz, cubeMap, true) &&
      !hasCube(x + dx, y + dy, z + dz, outsideMap, true)
    ) {
      outsideMap[x + dx][y + dy][z + dz] = true;
      stack.push([x + dx, y + dy, z + dz]);
    }
  }
}
let outerSurface = 0;
for (const [x, y, z] of cubes) {
  for (const [dx, dy, dz] of cubeSides) {
    if (
      !hasCube(x + dx, y + dy, z + dz, cubeMap, false) &&
      hasCube(x + dx, y + dy, z + dz, outsideMap, false)
    )
      outerSurface += 1;
  }
}

console.log("Part 2 answer:", outerSurface);

console.timeEnd("Execution time");
export {};
