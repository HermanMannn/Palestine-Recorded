import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const includeDirs = ["src/components", "src/routes", "src/data"];
const excludedParts = ["src/components/ui"];
const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".html"]);

async function walk(dir) {
  const entries = await fs.readdir(path.join(root, dir), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = path.join(dir, entry.name).replaceAll("\\", "/");
    if (excludedParts.some((part) => rel.startsWith(part))) continue;
    if (entry.isDirectory()) files.push(...await walk(rel));
    else if (exts.has(path.extname(entry.name))) files.push(rel);
  }
  return files;
}

function cleanText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

const contentAttrs = new Set(["alt", "title", "placeholder", "aria-label", "label", "content"]);
const nonContentAttrs = new Set([
  "className",
  "style",
  "src",
  "href",
  "to",
  "id",
  "key",
  "type",
  "name",
  "value",
  "rel",
  "target",
  "fill",
  "stroke",
  "viewBox",
  "d",
  "xmlns",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "width",
  "height",
  "accept",
]);

const classNoise =
  /^(bg-|text-|border-|flex|grid|h-|w-|p-|m-|rounded|shadow|hover:|focus:|dark:|absolute|relative|fixed|sticky|z-|top-|left-|right-|bottom-|translate|scale|opacity|duration|transition|ease|cursor|items-|justify-|gap-|space-|overflow|object|font-|leading|tracking|uppercase|lowercase|capitalize|min-|max-|ring|outline|resize|select-|touch-|animate|slide|fade|zoom|from-|to-|via-|row-|col-|order-|shrink|grow|hidden|block|inline|sr-only|container|mx-|my-|px-|py-|pt-|pb-|pl-|pr-|mt-|mb-|ml-|mr-|inset|backdrop|blur|drop|line-clamp|whitespace|tabular|italic|underline|decoration|accent|disabled|group|peer|prose|aspect|basis|origin|rotate|skew)/;

function shouldKeep(value, context = {}) {
  const text = cleanText(value);
  if (!text || text.length < 2) return false;
  if (/^https?:\/\//.test(text)) return true;
  if (context.attr && nonContentAttrs.has(context.attr) && !contentAttrs.has(context.attr)) return false;
  if (/^[@./#:_a-zA-Z0-9-]+$/.test(text) && classNoise.test(text)) return false;
  if (/^[A-Za-z0-9_-]+$/.test(text) && text.length < 3) return false;
  if (/^[{}()[\].,;:+\-*/<>=!?|&%$#@~`'"]+$/.test(text)) return false;
  return /[A-Za-z\u0600-\u06FF0-9]/.test(text);
}

function parseHtml(source) {
  const text = source
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return [...new Set(text.split(/(?<=[.!?])\s+|\n+/).map(cleanText).filter((item) => shouldKeep(item)))];
}

function parseSource(rel, source) {
  if (rel.endsWith(".html")) return parseHtml(source);

  const kind = rel.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : rel.endsWith(".ts")
      ? ts.ScriptKind.TS
      : rel.endsWith(".jsx")
        ? ts.ScriptKind.JSX
        : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(rel, source, ts.ScriptTarget.Latest, true, kind);
  const values = [];

  function enclosingAttr(node) {
    let parent = node.parent;
    while (parent) {
      if (ts.isJsxAttribute(parent) && parent.name) return parent.name.getText(sourceFile);
      parent = parent.parent;
    }
    return undefined;
  }

  function visit(node) {
    if (ts.isJsxText(node)) {
      const value = cleanText(node.getText(sourceFile));
      if (shouldKeep(value)) values.push(value);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      const importLike = ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent);
      const isTranslationKey = ts.isCallExpression(parent) && parent.expression.getText(sourceFile) === "t";
      const attr = enclosingAttr(node);
      if (!importLike && !isTranslationKey && shouldKeep(node.text, { attr })) {
        values.push(cleanText(node.text));
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...new Set(values)];
}

const files = (await Promise.all(includeDirs.map(walk))).flat().sort();
const inventory = {
  generatedAt: new Date().toISOString(),
  purpose:
    "Raw source content inventory for webpage and page-adjacent visible strings. Dynamic database/user content is not included.",
  files: {},
};

let totalStrings = 0;
for (const rel of files) {
  const source = await fs.readFile(path.join(root, rel), "utf8");
  const strings = parseSource(rel, source);
  if (strings.length) {
    inventory.files[rel] = strings;
    totalStrings += strings.length;
  }
}
inventory.totalStrings = totalStrings;

await fs.mkdir(path.join(root, "src/locales"), { recursive: true });
await fs.writeFile(
  path.join(root, "src/locales/content-inventory.json"),
  `${JSON.stringify(inventory, null, 2)}\n`,
  "utf8",
);

console.log(
  `Wrote src/locales/content-inventory.json with ${totalStrings} strings across ${
    Object.keys(inventory.files).length
  } files.`,
);
