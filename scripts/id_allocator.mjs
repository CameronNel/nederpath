// NederPath stable-ID allocator (pure and independently testable).
//
// Historical registry invariants enforced here:
//  - Every normalized owner string keeps its exact historical ID across regenerations.
//  - An ID is never reassigned to a different normalized owner.
//  - New IDs are append-only above the monotonic high-water mark.
//  - Retired IDs (owners absent from a regeneration) stay in the registry and
//    are never recycled.
//
// The registry schema is: { version: 1, highWaterMark: <int>, entries: { norm: "<prefix>00001" } }
// where `norm` is the normalized owner string.
//
// Namespaces:
//  - Word bank: default "nl-" ID prefix (data/word_ids.json, 5 digits)
//  - Idiom bank: "idm-" ID prefix (data/idiom_ids.json, 4 digits)
//  - Sentence bank: "snt-" ID prefix (data/sentence_ids.json, 5 digits)

export const ID_PATTERN = /^nl-(\d+)$/;
export const DEFAULT_ID_PREFIX = "nl-";
export const REGISTRY_VERSION = 1;

export class RegistryError extends Error {}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function defaultNormalizer(value) {
  return String(value ?? "").toLowerCase().trim();
}

/**
 * Validates a parsed registry object and indexes it.
 * Throws RegistryError on any schema, format, or ownership violation.
 * @param {unknown} registry - parsed JSON content of ID registry
 * @param {{ prefix?: string, idPattern?: RegExp, normalize?: (k: string) => string, digits?: number, formatId?: (n: number) => string }} [options]
 * @returns {{ entries: Map<string, string>, owners: Map<string, string>, highWaterMark: number, prefix: string, idPattern: RegExp, normalize: (k: string) => string, formatId: (n: number) => string }}
 */
export function validateRegistry(registry, options = {}) {
  if (
    !registry ||
    typeof registry !== "object" ||
    Array.isArray(registry) ||
    registry.version !== REGISTRY_VERSION ||
    !Number.isSafeInteger(registry.highWaterMark) ||
    registry.highWaterMark < 0 ||
    !registry.entries ||
    typeof registry.entries !== "object" ||
    Array.isArray(registry.entries)
  ) {
    throw new RegistryError("registry has an invalid schema (expected { version: 1, highWaterMark: int >= 0, entries: object })");
  }

  const prefix = typeof options.prefix === "string" && options.prefix.length > 0 ? options.prefix : DEFAULT_ID_PREFIX;
  const idPattern = options.idPattern instanceof RegExp
    ? options.idPattern
    : new RegExp("^" + escapeRegExp(prefix) + "(\\d+)$");
  const normalize = typeof options.normalize === "function" ? options.normalize : defaultNormalizer;
  const digits = typeof options.digits === "number" ? options.digits : (prefix === "idm-" ? 4 : 5);
  const formatId = typeof options.formatId === "function"
    ? options.formatId
    : (num) => prefix + String(num).padStart(digits, "0");

  const entries = new Map();
  const owners = new Map();
  let maxIdNum = 0;

  for (const [norm, id] of Object.entries(registry.entries)) {
    if (!norm || typeof id !== "string" || !idPattern.test(id)) {
      throw new RegistryError(`invalid registry entry '${norm}' -> '${id}'`);
    }
    const normalizedKey = normalize(norm);
    if (normalizedKey !== norm) {
      throw new RegistryError(`registry key '${norm}' is not canonical under normalizer (expected '${normalizedKey}')`);
    }
    if (owners.has(id)) {
      throw new RegistryError(`historical ID '${id}' is owned by both '${owners.get(id)}' and '${norm}'`);
    }
    owners.set(id, norm);
    entries.set(norm, id);
    const match = idPattern.exec(id);
    const num = match && match[1] ? Number(match[1]) : Number(id.slice(prefix.length));
    if (num > maxIdNum) maxIdNum = num;
  }

  if (registry.highWaterMark < maxIdNum) {
    throw new RegistryError(`registry high-water mark ${registry.highWaterMark} is below historical maximum ${maxIdNum}`);
  }

  return { entries, owners, highWaterMark: registry.highWaterMark, prefix, idPattern, normalize, formatId };
}

/**
 * Creates a deterministic, append-only ID allocator over a validated registry.
 * The allocator never mutates the input; call toRegistry() to obtain the
 * updated plain registry object including any newly appended entries.
 *
 * @param {{ entries: Map<string, string>, owners: Map<string, string>, highWaterMark: number, prefix?: string, idPattern?: RegExp, normalize?: (k: string) => string, formatId?: (n: number) => string }} validated
 * @param {{ prefix?: string, idPattern?: RegExp, normalize?: (k: string) => string, formatId?: (n: number) => string, digits?: number }} [options]
 */
export function createIdAllocator(validated, options = {}) {
  if (!validated || !(validated.entries instanceof Map) || !(validated.owners instanceof Map) ||
      !Number.isSafeInteger(validated.highWaterMark)) {
    throw new RegistryError("createIdAllocator requires the output of validateRegistry()");
  }

  const prefix = typeof options.prefix === "string" ? options.prefix : (validated.prefix || DEFAULT_ID_PREFIX);
  const normalize = typeof options.normalize === "function" ? options.normalize : (validated.normalize || defaultNormalizer);
  const digits = typeof options.digits === "number" ? options.digits : (prefix === "idm-" ? 4 : 5);
  const formatId = typeof options.formatId === "function"
    ? options.formatId
    : (validated.formatId || ((num) => prefix + String(num).padStart(digits, "0")));

  // Copy so the caller's validated structure is never mutated.
  const entries = new Map(validated.entries);
  const owners = new Map(validated.owners);
  const appended = [];
  let nextNum = validated.highWaterMark;

  /**
   * Returns the stable ID for a normalized key, appending a fresh ID above
   * the high-water mark when the key has no historical owner. A historical
   * ID is always returned to its original owner and never to any other key.
   * @param {string} rawKey - the key (normalized inside)
   */
  function assignId(rawKey) {
    const norm = normalize(rawKey);
    if (!norm) throw new RegistryError("cannot assign an ID to an empty key");
    const existing = entries.get(norm);
    if (existing !== undefined) return existing;
    nextNum++;
    const id = formatId(nextNum);
    // Monotonic growth above the high-water mark guarantees this ID has no owner.
    if (owners.has(id)) {
      throw new RegistryError(`allocator attempted to recycle owned ID '${id}'`);
    }
    entries.set(norm, id);
    owners.set(id, norm);
    appended.push([norm, id]);
    return id;
  }

  /** Historical ID for a normalized key, or undefined when never assigned. */
  function lookupId(rawKey) {
    return entries.get(normalize(rawKey));
  }

  /** Owner (normalized key) of an ID, or undefined when the ID is unowned. */
  function ownerOf(id) {
    return owners.get(id);
  }

  /** Current high-water mark (grows only when new IDs are appended). */
  function highWaterMark() {
    return nextNum;
  }

  /** IDs appended during this allocator's lifetime, in assignment order. */
  function appendedEntries() {
    return appended.slice();
  }

  /** Serializes the full registry (historical + appended entries) for persistence. */
  function toRegistry() {
    const obj = Object.create(null);
    for (const [norm, id] of entries) obj[norm] = id;
    return { version: REGISTRY_VERSION, highWaterMark: nextNum, entries: obj };
  }

  return { assignId, lookupId, ownerOf, highWaterMark, appendedEntries, toRegistry };
}
