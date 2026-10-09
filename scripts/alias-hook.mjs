// Lets plain node import the app's TypeScript modules directly, so scripts/
// can test real application code instead of duplicating its logic.
//
// Two things node will not do on its own:
//   1. resolve the "@/..." alias that tsconfig defines
//   2. add the file extension that TypeScript source omits, including on
//      ordinary relative imports like `./site`
import { pathToFileURL, fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");
const EXTS = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

function firstFile(base) {
  for (const ext of EXTS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function resolve(specifier, context, next) {
  // "@/content/site" -> src/content/site.ts
  if (specifier.startsWith("@/")) {
    const hit = firstFile(path.join(SRC, specifier.slice(2)));
    if (hit) return next(pathToFileURL(hit).href, context);
  }

  // "./site" from inside src/content -> src/content/site.ts
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const hit = firstFile(path.resolve(parentDir, specifier));
    if (hit) return next(pathToFileURL(hit).href, context);
  }

  return next(specifier, context);
}
