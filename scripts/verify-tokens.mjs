// Gate: every token class used in src/ must exist in the built CSS, and no
// palette colour may survive as a frozen literal.
//
// Why this exists: a token class that fails to compile is invisible. The element
// simply renders unstyled — no error, no warning, nothing in the build output.
// That is exactly how `text-[var(--fg)]/50` fails (Tailwind cannot inject an
// alpha into a bare var(), so it silently drops the alpha). This catches that
// class of mistake, and the "frozen literal" check catches the older one where a
// hex was baked into the bundle and stopped tracking the token.
//
// Run after `next build`:  npm run verify:tokens
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS_DIR = ".next/static/css";

let file;
try {
  file = readdirSync(CSS_DIR).find((f) => f.endsWith(".css"));
} catch {
  console.error(`No built CSS at ${CSS_DIR}. Run \`next build\` first.`);
  process.exit(1);
}
if (!file) {
  console.error(`${CSS_DIR} is empty. Run \`next build\` first.`);
  process.exit(1);
}

const css = readFileSync(`${CSS_DIR}/${file}`, "utf8");

// Token names, as declared in tailwind.config.ts. Keep in sync.
const TOKENS = [
  "bg", "surface", "surface-sunken", "surface-raised", "surface-hover",
  "line", "line-soft", "line-strong",
  "fg", "fg-hover", "muted", "subtle", "faint",
  "accent", "accent-hover", "accent-ink", "danger",
];
const PROPS = [
  "bg", "text", "border", "from", "via", "to", "ring", "fill", "stroke",
  "shadow", "outline", "divide", "decoration", "placeholder", "caret",
];
const VARIANTS = [
  "hover:", "focus:", "focus-visible:", "focus-within:", "disabled:", "active:",
  "group-hover:", "peer-focus:", "placeholder:",
  "sm:", "md:", "lg:", "xl:", "2xl:",
];

const tokenRe = new RegExp(
  `\\b((?:${VARIANTS.join("|")})*)((?:${PROPS.join("|")})-)((?:${TOKENS.join("|")}))(\\/[0-9]+)?`,
  "g",
);

const walk = (p) =>
  statSync(p).isDirectory() ? readdirSync(p).flatMap((c) => walk(join(p, c))) : [p];

const used = new Map();
for (const f of walk("src").filter((f) => /\.(tsx|ts)$/.test(f))) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(tokenRe)) {
    const [full] = m;
    // Skip prefix matches: `bg-surface` inside `bg-surface-sunken`.
    const after = src.slice(m.index + full.length, m.index + full.length + 1);
    if (/[a-z-]/.test(after)) continue;
    used.set(full, f);
  }
}

// Tailwind escapes these characters in the emitted selector.
const esc = (s) => s.replace(/[:/[\].%]/g, (c) => "\\" + c);

let miss = 0;
for (const [full, srcFile] of used) {
  if (!css.includes("." + esc(full))) {
    miss++;
    console.log(`MISSING  ${full}   (${srcFile})`);
  }
}

// A palette colour that survived as a literal is a token that stopped tracking.
// The :root block is exempt — that is where the tokens are defined, and a
// definition has to name its colour somehow.
const rootBlock = css.match(/:root\{[^}]*\}/)?.[0] ?? "";
const outsideRoot = css.replace(rootBlock, "");

const FROZEN = [
  [/rgba?\(\s*29,\s*29,\s*31\s*[,)]/g, "#1D1D1F (--fg)"],
  [/rgba?\(\s*81,\s*81,\s*84\s*[,)]/g, "#515154 (--muted)"],
  [/rgba?\(\s*0,\s*113,\s*227\s*[,)]/g, "#0071E3 (--accent)"],
];
let frozen = 0;
for (const [re, label] of FROZEN) {
  const hits = outsideRoot.match(re) ?? [];
  if (hits.length) {
    frozen += hits.length;
    console.log(`FROZEN   ${label} appears ${hits.length}x as a literal`);
  }
}

console.log(
  `\n${used.size} token class(es) used, ${used.size - miss} compiled, ${miss} missing; ` +
    `${frozen} frozen literal(s)`,
);
process.exit(miss || frozen ? 1 : 0);
