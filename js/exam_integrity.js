// Generic exam-result provenance. UI-invisible. No Dutch exam banks are shipped.
// Formal results cannot be created until an evidence-backed bank exists.
(function installExamIntegrity(root, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root && typeof root === "object") root.NederExamIntegrity = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createExamIntegrityApi() {
  "use strict";

  const RESULT_SCHEMA_VERSION = 1;
  const INTEGRITY_SCHEMA_VERSION = 1;
  const TAINT_SCHEMA_VERSION = 1;
  const VALID_RESULT_STATUSES = Object.freeze(["formal", "practice", "legacy-incomplete"]);
  const REQUIRED_RESULT_FIELDS = Object.freeze([
    "resultSchemaVersion", "attemptId", "examId", "attemptMode", "status",
    "submittedAt", "itemCount", "scoreSummary", "checksum"
  ]);
  const REQUIRED_TAINT_FIELDS = Object.freeze([
    "taintSchemaVersion", "taintEventId", "controlId", "activatedAt",
    "appVersion", "queryGate", "clearedAt"
  ]);

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function cloneJson(value) {
    if (value === undefined) return null;
    return JSON.parse(JSON.stringify(value));
  }

  function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (!isPlainObject(value)) return value;
    const out = {};
    Object.keys(value).sort().forEach((key) => {
      if (value[key] !== undefined) out[key] = stableValue(value[key]);
    });
    return out;
  }

  function fingerprint(value) {
    const text = JSON.stringify(stableValue(value));
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }

  function checksumOf(result) {
    const copy = cloneJson(result) || {};
    delete copy.checksum;
    return fingerprint(copy);
  }

  function dutchExamsEnabled() {
    return false;
  }

  function examAvailability() {
    return {
      enabled: false,
      reason: "No independently reviewed Dutch examination bank exists yet.",
      certificationClaims: false
    };
  }

  function createTaintEvent(input = {}, options = {}) {
    const activatedAt = Number.isFinite(input.activatedAt) ? input.activatedAt : (options.now || Date.now());
    return {
      taintSchemaVersion: TAINT_SCHEMA_VERSION,
      taintEventId: input.taintEventId || `taint-${activatedAt.toString(36)}-${fingerprint({ activatedAt })}`,
      controlId: typeof input.controlId === "string" ? input.controlId : "",
      activatedAt,
      appVersion: typeof input.appVersion === "string" ? input.appVersion : "nederpath-replatform",
      queryGate: typeof input.queryGate === "string" ? input.queryGate : "",
      note: typeof input.note === "string" ? input.note : "",
      clearedAt: Number.isFinite(input.clearedAt) ? input.clearedAt : null
    };
  }

  function validateTaintEvent(event) {
    const errors = [];
    if (!isPlainObject(event)) return ["taint event must be an object"];
    for (const field of REQUIRED_TAINT_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(event, field)) errors.push(`missing ${field}`);
    }
    if (event.taintSchemaVersion !== TAINT_SCHEMA_VERSION) errors.push("invalid taint schema");
    if (event.queryGate !== "__wetest") errors.push("invalid queryGate");
    if (typeof event.controlId !== "string" || !event.controlId) errors.push("missing controlId");
    return errors;
  }

  function normalizeExamIntegrityContainer(raw) {
    const safe = isPlainObject(raw) ? raw : {};
    return {
      version: INTEGRITY_SCHEMA_VERSION,
      taintEvents: Array.isArray(safe.taintEvents) ? cloneJson(safe.taintEvents) : [],
      byAttemptId: isPlainObject(safe.byAttemptId) ? cloneJson(safe.byAttemptId) : {},
      migrationLog: Array.isArray(safe.migrationLog) ? cloneJson(safe.migrationLog) : []
    };
  }

  function appendTaintEvent(stateValue, event) {
    if (!isPlainObject(stateValue)) return { added: false, reason: "invalid-state" };
    const eventErrors = validateTaintEvent(event);
    if (eventErrors.length) return { added: false, reason: "invalid-event", errors: eventErrors };
    const integrity = normalizeExamIntegrityContainer(stateValue.examIntegrity);
    if (integrity.taintEvents.some((item) => item && item.taintEventId === event.taintEventId)) {
      return { added: false, reason: "duplicate-id" };
    }
    integrity.taintEvents.push(cloneJson(event));
    stateValue.examIntegrity = integrity;
    return { added: true, eventId: event.taintEventId };
  }

  function createResult(input = {}) {
    if (dutchExamsEnabled() !== true) {
      return { ok: false, reason: "exams-disabled" };
    }
    const taint = Array.isArray(input.overrideEventIds) && input.overrideEventIds.length > 0;
    const result = {
      resultSchemaVersion: RESULT_SCHEMA_VERSION,
      attemptId: String(input.attemptId || ""),
      examId: String(input.examId || ""),
      attemptMode: taint ? "practice" : "formal",
      status: taint ? "practice" : "formal",
      submittedAt: Number.isFinite(input.submittedAt) ? input.submittedAt : Date.now(),
      itemCount: Number.isInteger(input.itemCount) ? input.itemCount : 0,
      scoreSummary: isPlainObject(input.scoreSummary) ? cloneJson(input.scoreSummary) : { correct: 0, total: 0 },
      overrideEventIds: Array.isArray(input.overrideEventIds) ? input.overrideEventIds.slice() : [],
      checksum: null
    };
    result.checksum = checksumOf(result);
    return { ok: true, result };
  }

  function validateResult(result) {
    const errors = [];
    if (!isPlainObject(result)) return ["result must be an object"];
    for (const field of REQUIRED_RESULT_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(result, field)) errors.push(`missing ${field}`);
    }
    if (!VALID_RESULT_STATUSES.includes(result.status)) errors.push("invalid status");
    if (result.status === "formal" && Array.isArray(result.overrideEventIds) && result.overrideEventIds.length) {
      errors.push("formal result cannot carry practice taint");
    }
    if (result.checksum !== checksumOf(result)) errors.push("checksum mismatch");
    return errors;
  }

  function appendResult(stateValue, result) {
    if (!isPlainObject(stateValue)) return { added: false, reason: "invalid-state" };
    const errors = validateResult(result);
    if (errors.length) return { added: false, reason: "invalid-result", errors };
    const integrity = normalizeExamIntegrityContainer(stateValue.examIntegrity);
    if (integrity.byAttemptId[result.attemptId]) {
      return { added: false, reason: "immutable-duplicate" };
    }
    integrity.byAttemptId[result.attemptId] = cloneJson(result);
    stateValue.examIntegrity = integrity;
    return { added: true, attemptId: result.attemptId };
  }

  function isFormalPass(result) {
    return isPlainObject(result) && result.status === "formal" && validateResult(result).length === 0;
  }

  return {
    RESULT_SCHEMA_VERSION,
    VALID_RESULT_STATUSES,
    dutchExamsEnabled,
    examAvailability,
    createTaintEvent,
    validateTaintEvent,
    appendTaintEvent,
    normalizeExamIntegrityContainer,
    createResult,
    validateResult,
    appendResult,
    isFormalPass,
    checksumOf
  };
});
