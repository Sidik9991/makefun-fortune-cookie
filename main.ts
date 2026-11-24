// Fortune Cookie Wisdom for Developers
// make.fun bounty: u-gentle-koala-60-fortune-cookie-wisdom-for-developers-025ccf44
//
// The program holds candidate fortune lines as data, scores each one
// against the judge's brief (in the brief's own order), picks the winner
// at runtime, writes it to /output/entry.txt, then re-reads the file and
// validates it (non-blank, one line, <= 120 chars), failing loudly on
// any violation.
//
// Judge criteria, most important first (from RULES.txt):
//   1. Is one original line of fortune-cookie wisdom for a developer,
//      not a slogan, a punchline or generic advice.
//   2. Reads like a fortune cookie: one short balanced sentence that
//      lands in a single breath.
//   3. Says something true about a developer's day: bugs, reviews,
//      deploys, estimates or legacy code.
//   4. Turns that truth in a way the reader has not heard before.
//   5. Leaves a quiet twist or double meaning that rewards a second read.
//
// Scoring: each criterion is scored 0-2 per candidate, weighted in the
// brief's order (5, 4, 3, 2, 1). Highest weighted total wins; ties break
// toward the shorter line. The weights are the executable form of the
// brief's "most important first".

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Weights follow the brief's criterion order.
const WEIGHTS = [5, 4, 3, 2, 1]; // c1 fortune-cookie-ness, c2 cookie voice,
// c3 true about a dev day, c4 fresh turn, c5 quiet twist

// [line, c1, c2, c3, c4, c5]
const CANDIDATES = [
  // The bug you wrote comes back at night: true, specific, and the
  // fortune ("you will fix it") lands like a real cookie prediction.
  ["You will fix the bug at 3 a.m. — the one you wrote at 3 p.m. and swore was finished.", 2, 2, 2, 1, 1],
  // Legacy code as a mirror: the twist is that the feared author is you.
  ["The code you fear to touch is the code that already knows you.", 2, 2, 2, 2, 2],
  // Estimates vs calendar: true, but the turn is a plain metaphor.
  ["Your estimate was honest; the calendar simply never read it.", 2, 2, 2, 1, 1],
  // A Friday deploy as an unread fortune: the cookie talks about itself,
  // and the pun carries the thought instead of decorating it.
  ["A deploy on Friday is a fortune best left unread.", 2, 2, 2, 2, 2],
  // The curse lands on its author: concrete, second-read sting.
  ["The legacy code you curse was written by someone in a hurry — you, last year.", 2, 1, 2, 2, 2],
  // Passing tests, moving bug: true and fresh, but reads more like a joke
  // than a fortune; the "neighbourhood" image is doing the work.
  ["Your tests pass; the bug has simply moved to a quieter neighbourhood.", 1, 1, 2, 2, 1],
  // The reviewer as an unordered fortune: short and true, but the twist
  // is thin and the cookie voice is weak.
  ["The reviewer who asks 'why' is the fortune you did not order.", 2, 1, 2, 1, 1],
];

function score(candidate) {
  const [, ...marks] = candidate;
  return marks.reduce((total, mark, i) => total + mark * WEIGHTS[i], 0);
}

function main() {
  const ranked = CANDIDATES.map(([line]) => ({
    line,
    score: score(CANDIDATES.find((c) => c[0] === line)),
  })).sort((a, b) => b.score - a.score || a.line.length - b.line.length);

  for (const entry of ranked) {
    console.log(`${String(entry.score).padStart(2)}  (${entry.line.length} chars) ${entry.line}`);
  }

  const winner = ranked[0];
  console.log(`\nWinner (${winner.score} pts, ${winner.line.length} chars): ${winner.line}`);

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", winner.line + "\n", "utf8");

  // Re-read and validate, failing loudly on any violation.
  const back = readFileSync("/output/entry.txt", "utf8");
  const text = back.replace(/\n$/, "");
  if (text.length === 0) throw new Error("entry is blank");
  if (text !== winner.line) throw new Error("entry.txt does not match the chosen line byte for byte");
  if (text.includes("\n")) throw new Error("entry is more than one line");
  if (text.length > 120) throw new Error(`entry is ${text.length} chars, over the 120 limit`);
  console.log(`Verified: /output/entry.txt = ${text.length} chars, one line, non-blank.`);
}

main();
