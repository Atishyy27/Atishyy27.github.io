// node --import ./scripts/tests/register.mjs --test scripts/tests/*.test.mjs
import { register } from "node:module";

register("../alias-hook.mjs", import.meta.url);
register("./tsx-loader.mjs", import.meta.url);
// The tests must pass with no network. A stray real request fails loudly.
globalThis.fetch = () => {
  throw new Error("test tried to use the real network");
};
