// The previous check flagged 8 files, but "line not found" conflates two very
// different things:
//   (a) I rewrote the line's COLOUR into a token  -> fine, same intent
//   (b) I genuinely do not have the change        -> a regression to restore
// This run normalises colours away first, so whatever is still missing is (b).
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BASE = "1c1e395";
const WIP = "7677a25";

const FILES = [
  "src/app/page.tsx",
  "src/components/DealsSection.tsx",
  "src/components/HeroSection.tsx",
  "src/components/MerchantDetail.tsx",
  "src/components/Navbar.tsx",
  "src/components/RideGuideSection.tsx",
  "src/app/merchants/page.tsx",
  "src/components/DetailModal.tsx",
];

const git = (args) => execSync(`git ${args}`, { encoding: "utf8", maxBuffer: 1 << 26 });

// Collapse every way of naming a colour to a single placeholder, so a line I
// rewrote from `bg-[#F5F5F7]` to `bg-surface-sunken` counts as unchanged.
// Alternations are sorted longest-first: JS regex is first-match, so
// `surface|surface-sunken` would eat `bg-surface` and leave a stray `-sunken`.
const TOKENS = [
  "surface-sunken", "surface-raised", "surface-hover", "surface",
  "line-soft", "line-strong", "line",
  "fg-hover", "fg", "muted", "subtle", "faint",
  "accent-hover", "accent-ink", "accent", "danger", "bg",
].sort((a, b) => b.length - a.length);
const PROPS = "bg|text|border|from|via|to|ring|fill|stroke|shadow|outline|divide|placeholder|caret";
const norm = (s) =>
  s
    // `[#hex]` and `[var(--token)]` are the same colour written two ways.
    .replace(/\[(?:#[0-9A-Fa-f]{3,8}|var\(--[a-z-]+\))\]/g, "[C]")
    .replace(new RegExp(`\\b(${PROPS})-\\[C\\]`, "g"), "$1-C")
    .replace(new RegExp(`\\b(${PROPS})-(?:${TOKENS.join("|")})(?![a-z-])`, "g"), "$1-C")
    .replace(/\s+/g, " ")
    .trim();

const addedLines = (from, to, file) =>
  git(`diff --unified=0 ${from} ${to} -- "${file}"`)
    .split("\n")
    .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
    .map((l) => l.slice(1))
    .filter((l) => l.trim().length > 0);

let real = 0;
for (const f of FILES) {
  // Read the working tree, not HEAD: during a conflict resolution the fix is on
  // disk but not yet committed, and checking HEAD would report it as missing.
  let mine;
  try {
    mine = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const mineNorm = norm(mine);
  const wipAdded = addedLines(BASE, WIP, f);
  const missing = wipAdded.filter((l) => !mineNorm.includes(norm(l)));

  if (missing.length === 0) {
    console.log(`OK    ${f}`);
  } else {
    real++;
    console.log(`\nGAP   ${f}   ${missing.length}/${wipAdded.length} genuinely missing:`);
    for (const m of missing) console.log(`        ${m.trim().slice(0, 120)}`);
  }
}

console.log(`\n${real} file(s) with a real gap.`);
