// Lets plain node resolve the "@/..." alias that tsconfig defines for the app,
// so scripts/ can import application modules directly instead of duplicating
// their logic in a test. TypeScript source omits the file extension, which node
// requires, so the extension is added back here.
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");
const EXTS = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

export function resolve(specifier, context, next) {
  if (!specifier.startsWith("@/")) return next(specifier, context);

  const base = path.join(ROOT, specifier.slice(2));
  for (const ext of EXTS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return next(pathToFileURL(candidate).href, context);
    }
  }
  return next(pathToFileURL(base).href, context);
}
