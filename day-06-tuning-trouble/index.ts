console.time("Execution time");

const input: string = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8");

function findMarker(str: string, distinctChars: number): number {
  const slidingCharCount = new Map<string, number>();
  for (let end = 0; end < str.length; ++end) {
    const start = end - distinctChars + 1;

    slidingCharCount.set(str[end], (slidingCharCount.get(str[end]) ?? 0) + 1);
    if (start > 0) {
      slidingCharCount.set(str[start - 1], (slidingCharCount.get(str[start - 1]) ?? 0) - 1);
    }

    if (
      start >= 0 &&
      hasDuplicatesInRange(str, start, end, slidingCharCount)
    ) { 
      return end + 1;
    }
  }
  throw new Error("Should've found something by now...");
}
function hasDuplicatesInRange(str: string, start: number, end: number, slidingCharCount: Map<string, number>): boolean {
  for (let i = start; i <= end; ++i) {
    if ((slidingCharCount.get(str[i]) ?? 0) > 1) {
      return false;
    }
  }
  return true;
}

function testFindMarker(): void {
  console.assert(findMarker("mjqjpqmgbljsphdztnvjfqwrcgsmlb", 4) === 7);
  console.assert(findMarker("bvwbjplbgvbhsrlpgdmjqwftvncz", 4) === 5);
  console.assert(findMarker("nppdvjthqldpwncqszvftbrmjlhg", 4) === 6);
  console.assert(findMarker("nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg", 4) === 10);
  console.assert(findMarker("zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw", 4) === 11);
  console.assert(findMarker("mjqjpqmgbljsphdztnvjfqwrcgsmlb", 14) === 19);
  console.assert(findMarker("bvwbjplbgvbhsrlpgdmjqwftvncz", 14) === 23);
  console.assert(findMarker("nppdvjthqldpwncqszvftbrmjlhg", 14) === 23);
  console.assert(findMarker("nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg", 14) === 29);
  console.assert(findMarker("zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw", 14) === 26);
}

testFindMarker();
console.log("Part 1 answer:", findMarker(input, 4));
console.log("Part 2 answer:", findMarker(input, 14));

console.timeEnd("Execution time");
export {};
