// NederPath stable word-ID allocator (pure and independently testable).
//
// Historical registry invariants enforced here:
//  - Every normalized word keeps its exact historical ID across regenerations.
//  - An ID is never reassigned to a different normalized word.
//  - New IDs are append-only above the monotonic high-water mark.
//  - Retired IDs (owners absent from a regeneration) stay in the registry and
//    are never recycled.
//
// The registry schema is: { version: 1, highWaterMark: <int>, entries: { norm: "nl-00001" } }
// where `norm` is the lowercase-trimmed Dutch word form.

export const ID_PATTERN = /^nl-(\d+)$/;
export const REGISTRY_VERSION = 1;

export class RegistryError extends Error {}

/**
 * Validates a parsed registry object and indexes it.
 * Throws RegistryError on any schema, format, or ownership violation.
 * @param {unknown} registry - parsed JSON content of data/word_ids.json
 * @returns {{ entries: Map<string, string>, owners: Map<string, string>, highWaterMark: number }}
 */
export function validateRegistry(registry) {
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

  const entries = new Map();
  const owners = new Map();
  let maxIdNum = 0;

  for (const [norm, id] of Object.entries(registry.entries)) {
    if (!norm || norm !== norm.toLowerCase().trim() || typeof id !== "string" || !ID_PATTERN.test(id)) {
      throw new RegistryError(`invalid registry entry '${norm}' -> '${id}'`);
    }
    if (owners.has(id)) {
      throw new RegistryError(`historical ID '${id}' is owned by both '${owners.get(id)}' and '${norm}'`);
    }
    owners.set(id, norm);
    entries.set(norm, id);
    const num = Number(id.slice(3));
    if (num > maxIdNum) maxIdNum = num;
  }

  if (registry.highWaterMark < maxIdNum) {
    throw new RegistryError(`registry high-water mark ${registry.highWaterMark} is below historical maximum ${maxIdNum}`);
  }

  return { entries, owners, highWaterMark: registry.highWaterMark };
}

/**
 * Creates a deterministic, append-only ID allocator over a validated registry.
 * The allocator never mutates the input; call toRegistry() to obtain the
 * updated plain registry object including any newly appended entries.
 *
 * @param {{ entries: Map<string, string>, owners: Map<string, string>, highWaterMark: number }} validated
 */
export function createIdAllocator(validated) {
  if (!validated || !(validated.entries instanceof Map) || !(validated.owners instanceof Map) ||
      !Number.isSafeInteger(validated.highWaterMark)) {
    throw new RegistryError("createIdAllocator requires the output of validateRegistry()");
  }

  // Copy so the caller's validated structure is never mutated.
  const entries = new Map(validated.entries);
  const owners = new Map(validated.owners);
  const appended = [];
  let nextNum = validated.highWaterMark;

  /**
   * Returns the stable ID for a normalized word, appending a fresh ID above
   * the high-water mark when the word has no historical owner. A historical
   * ID is always returned to its original owner and never to any other word.
   * @param {string} rawWord - the word form (normalized inside)
   */
  function assignId(rawWord) {
    const norm = String(rawWord || "").toLowerCase().trim();
    if (!norm) throw new RegistryError("cannot assign an ID to an empty word");
    const existing = entries.get(norm);
    if (existing !== undefined) return existing;
    nextNum++;
    const id = "nl-" + String(nextNum).padStart(5, "0");
    // Monotonic growth above the high-water mark guarantees this ID has no owner.
    if (owners.has(id)) {
      throw new RegistryError(`allocator attempted to recycle owned ID '${id}'`);
    }
    entries.set(norm, id);
    owners.set(id, norm);
    appended.push([norm, id]);
    return id;
  }

  /** Historical ID for a normalized word, or undefined when never assigned. */
  function lookupId(rawWord) {
    return entries.get(String(rawWord || "").toLowerCase().trim());
  }

  /** Owner (normalized word) of an ID, or undefined when the ID is unowned. */
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
