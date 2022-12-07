console.time("Execution time");

const input: Array<string> = require("fs")
  .readFileSync(require("path").resolve(__dirname, "input"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean);

type File = {
  size: number;
};
interface Directory {
  size: number | null;
  items: Record<string, Item>;
}
type Item = File | Directory;
function isDirectory(item: Item): item is Directory {
  return item.hasOwnProperty("items");
}

function computeDirectorySizes(item: Item): number {
  if (!isDirectory(item) || item.size !== null) return item.size ?? 0;
  const size = Object.values(item.items)
    .reduce<number>((sum, item) => sum + computeDirectorySizes(item), 0);
  item.size = size;
  return size;
}
function findItems(
  directory: Directory,
  predicate: (item: Item) => boolean
): Array<Item> {
  const items = Object.values(directory.items);
  return [
    ...items.filter(predicate),
    ...items.filter(isDirectory)
      .map((subDirectory) => findItems(subDirectory, predicate))
      .flat(),
  ];
}

const root: Directory = {
  items: {},
  size: null,
};

let cwdir: Array<Directory> = [root];
const cwdirPeek = () => cwdir[cwdir.length - 1];
for (const line of input) {
  const tokens = line.split(" ");
  if (tokens[0] === "$") {
    if (tokens[1] === "cd") {
      if (tokens[2] === "/") {
        cwdir = [root];
      } else if (tokens[2] === "..") {
        cwdir.pop();
      } else {
        const newDir = cwdirPeek().items[tokens[2]];
        if (!isDirectory(newDir)) throw new Error("Trying to access non-existant directory.");
        cwdir.push(newDir);
      }
    } else if (tokens[1] !== "ls") {
      throw new Error(`Something's wrong, expected "ls" or "cd". Input line: "${line}"`);
    }
  } else {
    const directoryItemName = tokens[1];
    if (cwdirPeek().items[directoryItemName] != null) continue;
    if (tokens[0] === "dir") {
      cwdirPeek().items[directoryItemName] = {
        items: {},
        size: null,
      };
    } else {
      cwdirPeek().items[directoryItemName] = {
        size: Number.parseInt(tokens[0], 10),
      };
    }
  }
}

computeDirectorySizes(root);

console.log(
  "Part 1 answer:",
  findItems(root, (item) => item.size !== null && item.size < 100000)
    .filter(isDirectory)
    .reduce((sum, item) => sum + (item.size ?? 0), 0)
);
const requiredSpace = 30000000 - 70000000 + (root.size ?? 0);
console.log(
  "Part 2 answer:",
  Math.min(
    ...findItems(root, (item) => item.size !== null && item.size > requiredSpace)
      .filter(isDirectory)
      .map((item) => item.size ?? 0)
  )
);

console.timeEnd("Execution time");
export {};
