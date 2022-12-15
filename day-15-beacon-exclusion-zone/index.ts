console.time("Execution time");

/**
 * Takes around ~1s on my desktop, good enough I think :)
 */

interface Position {
  x: number;
  y: number;
}
interface SensorReading {
  sensor: Position;
  closestReading: Position;
  distance: number;
}
interface Line {
  start: number;
  end: number;
}

const testInput: boolean = false;
const input: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const sensorReadings: Array<SensorReading> = input.split(/\r?\n/).map((line) => {
  const lineSplit = line.split(": closest beacon is at");
  const xMatcher = /(?<=x=)-?\d+/;
  const yMatcher = /(?<=y=)-?\d+/;
  const sensor: Position = {
    x: +(lineSplit[0].match(xMatcher)?.[0] ?? Number.NaN),
    y: +(lineSplit[0].match(yMatcher)?.[0] ?? Number.NaN),
  };
  const closestReading: Position = {
    x: +(lineSplit[1].match(xMatcher)?.[0] ?? Number.NaN),
    y: +(lineSplit[1].match(yMatcher)?.[0] ?? Number.NaN),
  };
  return {
    sensor,
    closestReading,
    distance: Math.abs(sensor.x - closestReading.x) + Math.abs(sensor.y - closestReading.y),
  };
});

function findLinesAt(y: number, min: number, max: number): Array<Line> {
  const lines: Array<Line> = [];
  for (const sensorReading of sensorReadings) {
    const yDiff = sensorReading.distance - Math.abs(y - sensorReading.sensor.y);
    if (yDiff < 0) continue;
    const sensorLine: Line = {
      start: Math.max(sensorReading.sensor.x - yDiff, min),
      end: Math.min(sensorReading.sensor.x + yDiff, max),
    };
    const numberOfLines = lines.length;
    for (let i = 0; i < numberOfLines; ++i) {
      const otherLine = lines.shift();
      if (otherLine === undefined) throw new Error("typescript no");
      if (sensorLine.start - otherLine.end <= 1 && otherLine.start - sensorLine.end <= 1) {
        sensorLine.start = Math.min(sensorLine.start, otherLine.start);
        sensorLine.end = Math.max(sensorLine.end, otherLine.end);
      } else {
        lines.push(otherLine);
      }
    }
    lines.push(sensorLine);
  }
  return lines;
}

function numberOfBlockedPositions(y: number): number {
  const lines: Array<Line> = findLinesAt(y, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  const beacons = new Set<string>();
  for (const sensorReading of sensorReadings) {
    if (sensorReading.closestReading.y === y)
      beacons.add(`${sensorReading.closestReading.x},${sensorReading.closestReading.y}`);
  }
  return lines.reduce((sum, line) => sum + line.end - line.start + 1, 0) - beacons.size;
}
function findTuningFrequency(max: number): number {
  for (let y = 0; y <= max; ++y) {
    const lines: Array<Line> = findLinesAt(y, 0, max);
    if (lines.length > 1) {
      // ASSUMPTION: The hidden beacon is in a gap between two "lines"
      const x = (lines[0].start === 0 ? lines[0].end : lines[1].end) + 1;
      return x * 4000000 + y;
    }
  }
  return -1;
}

console.log("Part 1 answer:", numberOfBlockedPositions(testInput ? 10 : 2000000));
console.log("Part 2 answer:", findTuningFrequency(testInput ? 20 : 4000000));

console.timeEnd("Execution time");
export {};
