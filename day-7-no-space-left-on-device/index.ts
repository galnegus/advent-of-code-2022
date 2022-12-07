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
function isRealItem(name: string): boolean {
  return name !== "..";
}
function computeDirectorySize(directory: Directory): number {
  if (directory.size !== null) return directory.size;
  const size = Object.keys(directory.items)
    .filter(isRealItem)
    .reduce<number>((sum, name) => {
      const item = directory.items[name];
      if (isDirectory(item)) return sum + computeDirectorySize(item);
      else return sum + item.size;
    }, 0);
  directory.size = size;
  return size;
}
function findItems(
  directory: Directory,
  predicate: (item: Item) => boolean
): Array<Item> {
  const realItems = Object.keys(directory.items)
    .filter(isRealItem)
    .map((name) => directory.items[name]);

  const subDirectories = realItems.filter(isDirectory);
  return [
    ...realItems.filter(predicate),
    ...subDirectories
      .map((subDirectory) => findItems(subDirectory, predicate))
      .flat(),
  ];
}

const root: Directory = {
  items: {},
  size: null,
};
let cwdir: Directory = root;
for (const line of input) {
  const tokens = line.split(" ");
  if (tokens[0] === "$") {
    if (tokens[1] === "cd") {
      if (tokens[2] === "/") {
        cwdir = root;
      } else {
        const newDir = cwdir.items[tokens[2]];
        if (!isDirectory(newDir)) {
          throw new Error("Trying to access non-existant directory.");
        }
        cwdir = newDir;
      }
    } else if (tokens[1] !== "ls") {
      throw new Error(
        `Something's wrong, expected "ls" or "cd". Input line: "${line}"`
      );
    }
  } else {
    const directoryItemName = tokens[1];
    if (cwdir.items[directoryItemName] != null) continue;
    if (tokens[0] === "dir") {
      cwdir.items[directoryItemName] = {
        items: { [".."]: cwdir },
        size: null,
      };
    } else {
      cwdir.items[directoryItemName] = {
        size: Number.parseInt(tokens[0], 10),
      };
    }
  }
}

computeDirectorySize(root);

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
    ...findItems(
      root,
      (item) => item.size !== null && item.size > requiredSpace
    )
      .filter(isDirectory)
      .map((item) => item.size ?? 0)
  )
);

console.timeEnd("Execution time");
export {};
