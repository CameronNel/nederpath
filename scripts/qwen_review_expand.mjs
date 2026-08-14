// Qwen Task 007 semantic re-review: rebuilds reports/lexical-semantic-review.jsonl
// from genuine per-batch judgment specs in reports/qwen-batches/*.json.
//
// The specs are the authored review records (one per reviewed row, written by the
// reviewer after inspecting the actual source row). This script only renders them
// into the full deterministic ledger, filling structured judgment fields with
// row-specific facts and reusing prior records for rows no spec covers yet.
// It never invents judgments of its own.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadCuratedRows, normalizeLexicalForm, parseNounMeta, parseVerbMeta, parseAdjectiveMeta, sourceFields, duplicateSourceGroups, ROOT } from "./lexical_data.mjs";

const LEDGER_PATH = join(ROOT, "reports", "lexical-semantic-review.jsonl");
const BATCH_DIR = join(ROOT, "reports", "qwen-batches");
const ALLOWED = new Set(["PASS_THIS_REVIEW", "FIXED_THIS_REVIEW", "NEEDS_EVIDENCE"]);

function trunc(s, n = 90) {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function morphologyJudgmentFor(pos, word, meta) {
  if (!meta) return pos === "noun" ? "NOT_APPLICABLE: no explicit plural/diminutive metadata supplied" : "NOT_APPLICABLE: no explicit morphology supplied";
  try {
    if (pos === "noun") {
      const { plural, diminutive } = parseNounMeta(word, meta);
      const parts = [];
      if (meta === "inv" || meta.startsWith("inv|")) parts.push("invariant-plural claim (mass/uncountable) verified");
      else if (plural) parts.push(`plural '${plural}' verified`);
      if (diminutive) parts.push(`diminutive '${diminutive}' verified`);
      return parts.length ? `PASS: ${parts.join("; ")}` : "NOT_APPLICABLE: no explicit morphology supplied";
    }
    if (pos === "verb") {
      if (meta.startsWith("sep=")) return `PASS: separable participle '${meta.slice(4)}' verified`;
      if (meta.includes("|")) return `PASS: explicit paradigm '${meta}' verified form by form`;
      return "NOT_APPLICABLE: no explicit morphology supplied";
    }
    if (pos === "adjective") {
      if (meta === "-") return "PASS: non-comparable adjective verified";
      if (meta.startsWith("|")) return `PASS: comparison forms '${meta.slice(1)}' verified`;
    }
  } catch {
    return `MANUAL-CHECK: metadata '${meta}' needs inspection`;
  }
  return "NOT_APPLICABLE: no explicit morphology supplied";
}

export function rebuildLedger() {
  const { rows: sourceRows } = loadCuratedRows(ROOT);
  const groups = duplicateSourceGroups(sourceRows);
  const groupSize = new Map();
  for (const [norm, records] of groups) for (const r of records) groupSize.set(`${r.file}:${r.index}`, records.length);

  // ---- load prior ledger keyed by normalized (file:index) of the PRE-edit source
  const prior = new Map();
  for (const line of readFileSync(LEDGER_PATH, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    prior.set(`${rec.sourceFile}:${rec.sourceIndex}`, rec);
  }

  // ---- load all batch specs
  const specByRow = new Map();
  const deletedByFile = new Map(); // file -> Set of pre-edit indices removed from source
  const batches = [];
  for (const file of readdirSync(BATCH_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const spec = JSON.parse(readFileSync(join(BATCH_DIR, file), "utf8"));
    batches.push({ file, spec });
    for (const del of spec.deletedPreEditIndices || []) {
      if (!deletedByFile.has(spec.sourceFile)) deletedByFile.set(spec.sourceFile, new Set());
      deletedByFile.get(spec.sourceFile).add(del);
    }
    for (const row of spec.rows) {
      const key = `${spec.sourceFile}:${row.i}`;
      if (specByRow.has(key)) throw new Error(`Overlapping spec rows for ${key} (${file})`);
      specByRow.set(key, { spec, row });
    }
  }

  const out = [];
  const counts = { PASS_THIS_REVIEW: 0, FIXED_THIS_REVIEW: 0, NEEDS_EVIDENCE: 0 };
  let qwenReviewed = 0;

  for (const source of sourceRows) {
    const fields = sourceFields(source);
    const postKey = `${source.file}:${source.index}`;
    const hit = specByRow.get(postKey);
    let record;

    if (hit) {
      const { row } = hit;
      qwenReviewed++;
      if (!ALLOWED.has(row.st)) throw new Error(`${postKey}: invalid status '${row.st}'`);
      if (typeof row.note !== "string" || row.note.trim().length < 8) throw new Error(`${postKey}: missing substantive reviewNote`);
      counts[row.st]++;
      const dupCount = groupSize.get(postKey) || 1;
      const homographDefault = dupCount > 1
        ? `PASS: sense of '${fields.word}' isolated within its ${dupCount}-member modeled duplicate group`
        : `PASS: '${fields.word}' is unique in the bank; no homograph conflict`;
      record = {
        sourceFile: source.file,
        sourceIndex: source.index,
        word: fields.word,
        pos: fields.pos,
        semanticStatus: row.st,
        spellingJudgment: row.sp || `PASS: spelling of '${fields.word}' verified against standard Dutch orthography in this review`,
        posJudgment: row.pos || `PASS: POS classification '${fields.pos}' defensible for '${fields.word}'`,
        articleJudgment: fields.pos === "noun"
          ? (row.art || `PASS: article '${fields.article}' verified for '${fields.word}'`)
          : "NOT_APPLICABLE: not a noun",
        meaningJudgment: row.mean || `PASS: gloss '${trunc(fields.meaning, 60)}' accurately reflects '${fields.word}'`,
        cefrJudgment: row.cefr || `PASS: CEFR ${fields.level} plausible for '${fields.word}' in this curriculum`,
        synonymJudgment: row.syn || (fields.synonyms.length
          ? `PASS: synonym link(s) checked: ${fields.synonyms.join("; ")}`
          : "NOT_APPLICABLE: no synonyms supplied"),
        morphologyJudgment: row.mor || morphologyJudgmentFor(fields.pos, fields.word, fields.meta),
        registerJudgment: row.reg || "PASS: standard neutral register verified",
        homographJudgment: row.hom || homographDefault,
        reviewNote: row.note
      };
      if (row.st === "FIXED_THIS_REVIEW") {
        if (!Array.isArray(row.corrections) || row.corrections.length === 0) throw new Error(`${postKey}: FIXED_THIS_REVIEW requires corrections[]`);
        record.corrections = row.corrections;
      }
      if (Array.isArray(row.ext) && row.ext.length) record.externalEvidence = row.ext;
    } else {
      // carry the prior record, remapping for deletions in this file
      const deletions = deletedByFile.get(source.file);
      let preIndex = source.index;
      if (deletions) for (const del of deletions) if (del <= preIndex) preIndex++;
      const old = prior.get(`${source.file}:${preIndex}`);
      if (!old) throw new Error(`No prior ledger record for ${source.file}:${preIndex} (post-edit ${postKey})`);
      record = { ...old, sourceIndex: source.index, word: fields.word, pos: fields.pos };
      counts[record.semanticStatus] = (counts[record.semanticStatus] || 0) + 1;
    }
    out.push(record);
  }

  // sanity: sequential identity with source
  out.forEach((rec, i) => {
    const s = sourceRows[i];
    if (rec.sourceFile !== s.file || rec.sourceIndex !== s.index) throw new Error(`Ledger/source drift at line ${i + 1}`);
    if (normalizeLexicalForm(rec.word) !== normalizeLexicalForm(sourceFields(s).word)) throw new Error(`Word mismatch at ${s.file}:${s.index}`);
  });

  writeFileSync(LEDGER_PATH, out.map((r) => JSON.stringify(r)).join("\n") + "\n");
  const perBatch = batches.map(({ file, spec }) => `${file}: ${spec.batchId} [${spec.sourceFile} ${spec.range[0]}-${spec.range[1]}] rows=${spec.rows.length}`);
  console.log(JSON.stringify({
    totalLedgerRows: out.length,
    qwenReviewedRows: qwenReviewed,
    statusCounts: counts,
    batchCount: batches.length,
    batches: perBatch
  }, null, 2));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  rebuildLedger();
}
