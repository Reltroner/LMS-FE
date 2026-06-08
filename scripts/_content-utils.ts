import fs from "node:fs";
import path from "node:path";

export type FrontmatterValue = string | number | string[];

export type LessonFile = Readonly<{
  filePath: string;
  relativePath: string;
  courseSlug: string;
  lessonSlug: string;
  frontmatter: Record<string, FrontmatterValue>;
}>;

const repoRoot = process.cwd();

function stripQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "");
}

export function parseFrontmatter(filePath: string): Record<string, FrontmatterValue> {
  const source = fs.readFileSync(filePath, "utf8");
  const normalizedSource = source.replace(/\r\n/g, "\n");

  if (!normalizedSource.startsWith("---\n")) {
    throw new Error(`${filePath} is missing frontmatter.`);
  }

  const endIndex = normalizedSource.indexOf("\n---", 4);

  if (endIndex < 0) {
    throw new Error(`${filePath} has an unterminated frontmatter block.`);
  }

  const frontmatter = normalizedSource.slice(4, endIndex);
  const result: Record<string, FrontmatterValue> = {};
  let currentListKey: string | undefined;

  for (const line of frontmatter.split("\n")) {
    if (!line.trim()) {
      continue;
    }

    const listItemMatch = line.match(/^\s+-\s+(.*)$/);

    if (listItemMatch && currentListKey) {
      const currentValue = result[currentListKey];
      const values = Array.isArray(currentValue) ? currentValue : [];

      result[currentListKey] = [...values, stripQuotes(listItemMatch[1].trim())];
      continue;
    }

    const fieldMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);

    if (!fieldMatch) {
      continue;
    }

    const [, key, rawValue] = fieldMatch;
    const value = rawValue.trim();

    if (!value) {
      result[key] = [];
      currentListKey = key;
      continue;
    }

    currentListKey = undefined;

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      result[key] = Number(value);
    } else {
      result[key] = stripQuotes(value);
    }
  }

  return result;
}

export function readLessonFiles(): LessonFile[] {
  const coursesDir = path.join(repoRoot, "content", "courses");

  if (!fs.existsSync(coursesDir)) {
    return [];
  }

  const lessonFiles: LessonFile[] = [];

  for (const courseDirName of fs.readdirSync(coursesDir)) {
    const lessonsDir = path.join(coursesDir, courseDirName, "lessons");

    if (!fs.existsSync(lessonsDir)) {
      continue;
    }

    for (const fileName of fs.readdirSync(lessonsDir)) {
      if (!fileName.endsWith(".mdx")) {
        continue;
      }

      const filePath = path.join(lessonsDir, fileName);

      lessonFiles.push({
        filePath,
        relativePath: path.relative(repoRoot, filePath),
        courseSlug: courseDirName,
        lessonSlug: fileName.replace(/\.mdx$/, ""),
        frontmatter: parseFrontmatter(filePath),
      });
    }
  }

  return lessonFiles.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates];
}

export function reportValidationResult(label: string, errors: readonly string[]) {
  if (errors.length > 0) {
    console.error(`${label} failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`${label} passed.`);
}
