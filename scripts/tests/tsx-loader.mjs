// Lets node:test render the app's own .tsx components with react-dom/server.
// Node strips types from .ts on its own but not .tsx, and cannot import .css.
// TypeScript is already a dependency, so it does the JSX transform; nothing new is installed.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// next ships CommonJS entry points like next/navigation without a package
// "exports" map entry, which node's ESM resolver needs spelled out with .js.
export function resolve(specifier, context, next) {
  if (/^next\/[a-z-]+(\/[a-z-]+)*$/.test(specifier)) return next(specifier + ".js", context);
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith(".css")) {
    return { format: "module", source: "export default {};", shortCircuit: true };
  }
  if (url.startsWith("file:") && url.endsWith(".tsx")) {
    const src = fs.readFileSync(fileURLToPath(url), "utf8");
    const out = ts.transpileModule(src, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: fileURLToPath(url),
    });
    return { format: "module", source: out.outputText, shortCircuit: true };
  }
  return next(url, context);
}
