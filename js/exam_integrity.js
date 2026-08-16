// Generic exam-result provenance. UI-invisible. No Dutch exam banks are shipped.
// Formal results cannot be created or accepted until an evidence-backed bank exists.
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
  const MAX_TAINT_EVENTS = 1000;
  const MAX_RESULTS = 5000;
  const MAX_MIGRATION_LOG = 500;
  const DANGEROUS_MAP_KEYS = new Set(["__proto__", "constructor", "prototype"]);
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

  function isBoundedIdentifier(value, maxLength = 120) {
    return typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= maxLength &&
      !/[\u0000-\u001F\u007F]/.test(value) &&
      !DANGEROUS_MAP_KEYS.has(value);
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
    if (!isBoundedIdentifier(event.taintEventId)) errors.push("invalid taintEventId");
    if (!isBoundedIdentifier(event.controlId)) errors.push("invalid controlId");
    if (!Number.isFinite(event.activatedAt) || event.activatedAt <= 0) errors.push("invalid activatedAt");
    if (typeof event.appVersion !== "string" || !event.appVersion.trim() || event.appVersion.length > 120) {
      errors.push("invalid appVersion");
    }
    if (event.queryGate !== "__wetest") errors.push("invalid queryGate");
    if (event.clearedAt !== null && (!Number.isFinite(event.clearedAt) || event.clearedAt < event.activatedAt)) {
      errors.push("invalid clearedAt");
    }
    if (event.note !== undefined && (typeof event.note !== "string" || event.note.length > 1000)) {
      errors.push("invalid note");
    }
    return errors;
  }

  function normalizeExamIntegrityContainer(raw) {
    const safe = isPlainObject(raw) ? raw : {};
    const taintEvents = [];
    const taintIds = new Set();
    if (Array.isArray(safe.taintEvents)) {
      for (const event of safe.taintEvents) {
        if (taintEvents.length >= MAX_TAINT_EVENTS) break;
        if (validateTaintEvent(event).length !== 0 || taintIds.has(event.taintEventId)) continue;
        taintIds.add(event.taintEventId);
        taintEvents.push(cloneJson(event));
      }
    }

    const byAttemptId = {};
    let resultCount = 0;
    if (isPlainObject(safe.byAttemptId)) {
      for (const [attemptId, result] of Object.entries(safe.byAttemptId)) {
        if (resultCount >= MAX_RESULTS) break;
        if (!isBoundedIdentifier(attemptId) || !isPlainObject(result) || result.attemptId !== attemptId) continue;
        if (validateResult(result).length !== 0) continue;
        byAttemptId[attemptId] = cloneJson(result);
        resultCount += 1;
      }
    }

    return {
      version: INTEGRITY_SCHEMA_VERSION,
      taintEvents,
      byAttemptId,
      migrationLog: Array.isArray(safe.migrationLog)
        ? cloneJson(safe.migrationLog.slice(0, MAX_MIGRATION_LOG))
        : []
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
    if (integrity.taintEvents.length >= MAX_TAINT_EVENTS) {
      return { added: false, reason: "limit-reached" };
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
    if (result.resultSchemaVersion !== RESULT_SCHEMA_VERSION) errors.push("invalid result schema");
    if (!isBoundedIdentifier(result.attemptId)) errors.push("missing or invalid attemptId");
    if (!isBoundedIdentifier(result.examId)) errors.push("missing or invalid examId");
    if (!VALID_RESULT_STATUSES.includes(result.status)) errors.push("invalid status");
    if (!VALID_RESULT_STATUSES.includes(result.attemptMode)) errors.push("invalid attemptMode");
    if (result.status !== "legacy-incomplete" && result.attemptMode !== result.status) {
      errors.push("attemptMode/status mismatch");
    }
    if (!Number.isFinite(result.submittedAt) || result.submittedAt <= 0) errors.push("invalid submittedAt");
    if (!Number.isInteger(result.itemCount) || result.itemCount < 0) errors.push("invalid itemCount");
    if (!isPlainObject(result.scoreSummary)) errors.push("invalid scoreSummary");

    const overrideEventIds = result.overrideEventIds;
    if (overrideEventIds !== undefined) {
      if (!Array.isArray(overrideEventIds)) {
        errors.push("invalid overrideEventIds");
      } else {
        const validIds = overrideEventIds.every((id) => isBoundedIdentifier(id));
        if (!validIds) errors.push("invalid overrideEventIds");
        if (new Set(overrideEventIds).size !== overrideEventIds.length) errors.push("duplicate overrideEventIds");
      }
    }

    if (result.status === "formal" && Array.isArray(overrideEventIds) && overrideEventIds.length) {
      errors.push("formal result cannot carry practice taint");
    }
    if (result.status === "formal" && dutchExamsEnabled() !== true) {
      errors.push("formal results disabled");
    }
    try {
      if (result.checksum !== checksumOf(result)) errors.push("checksum mismatch");
    } catch {
      errors.push("checksum validation failed");
    }
    return errors;
  }

  function appendResult(stateValue, result) {
    if (!isPlainObject(stateValue)) return { added: false, reason: "invalid-state" };
    const errors = validateResult(result);
    if (errors.length) return { added: false, reason: "invalid-result", errors };
    const integrity = normalizeExamIntegrityContainer(stateValue.examIntegrity);
    if (Object.prototype.hasOwnProperty.call(integrity.byAttemptId, result.attemptId)) {
      return { added: false, reason: "immutable-duplicate" };
    }
    if (Object.keys(integrity.byAttemptId).length >= MAX_RESULTS) {
      return { added: false, reason: "limit-reached" };
    }
    integrity.byAttemptId[result.attemptId] = cloneJson(result);
    stateValue.examIntegrity = integrity;
    return { added: true, attemptId: result.attemptId };
  }

  function isFormalPass(result) {
    return dutchExamsEnabled() === true &&
      isPlainObject(result) &&
      result.status === "formal" &&
      validateResult(result).length === 0;
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
