// NederPath Progressive Grammar Lesson Flow
// Adapts the existing curated grammar bank into intro -> micro-teaching -> short test.
(function (global) {
  "use strict";

  const MAX_TEACHING_STEPS = 7;
  const MAX_TEST_QUESTIONS = 5;

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function escapeHTML(value) {
    const learning = global.NederLearning;
    if (learning && typeof learning.escapeHTML === "function") return learning.escapeHTML(String(value ?? ""));
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function buildTeachingSteps(rule) {
    if (!rule || typeof rule !== "object") return [];

    const authored = Array.isArray(rule.lessonSteps) ? rule.lessonSteps : [];
    const authoredSteps = authored
      .filter((step) => step && typeof step === "object" && cleanText(step.body))
      .slice(0, MAX_TEACHING_STEPS)
      .map((step, index) => ({
        title: cleanText(step.title) || `Core idea ${index + 1}`,
        body: cleanText(step.body),
        definition: cleanText(step.definition),
        tip: cleanText(step.tip),
        example: step.example && typeof step.example === "object"
          ? {
              nl: cleanText(step.example.nl),
              en: cleanText(step.example.en),
              highlight: cleanText(step.example.highlight)
            }
          : null
      }));
    if (authoredSteps.length) return authoredSteps;

    const rules = Array.isArray(rule.rules)
      ? rule.rules.filter((text) => cleanText(text)).slice(0, MAX_TEACHING_STEPS)
      : [];
    const sourceRules = rules.length ? rules : (cleanText(rule.summary) ? [cleanText(rule.summary)] : []);
    const examples = Array.isArray(rule.examples)
      ? rule.examples.filter((example) => example && typeof example === "object")
      : [];

    return sourceRules.map((body, index) => {
      const colonIndex = body.indexOf(":");
      const possibleTitle = colonIndex > 1 && colonIndex <= 46 ? cleanText(body.slice(0, colonIndex)) : "";
      const example = examples.length ? examples[index % examples.length] : null;
      const isLast = index === sourceRules.length - 1;
      return {
        title: possibleTitle || `Core idea ${index + 1}`,
        body: cleanText(body),
        definition: "",
        tip: isLast && cleanText(rule.correction)
          ? cleanText(rule.correction)
          : (example ? cleanText(example.highlight) : ""),
        example: example
          ? { nl: cleanText(example.nl), en: cleanText(example.en), highlight: cleanText(example.highlight) }
          : null
      };
    });
  }

  function getTestExercises(rule) {
    if (!rule || typeof rule !== "object" || !Array.isArray(rule.exercises)) return [];
    return rule.exercises
      .filter((exercise) => exercise && typeof exercise === "object")
      .slice(0, MAX_TEST_QUESTIONS);
  }

  function estimateMinutes(rule) {
    const stepCount = buildTeachingSteps(rule).length;
    const testCount = getTestExercises(rule).length;
    return Math.max(2, Math.min(8, Math.ceil(1 + (stepCount * 0.45) + (testCount * 0.35))));
  }

  function install(app) {
    if (!app || typeof app !== "object" || app.__progressiveGrammarFlowInstalled) return false;
    app.__progressiveGrammarFlowInstalled = true;

    const base = {
      attachGrammarListeners: typeof app.attachGrammarListeners === "function" ? app.attachGrammarListeners.bind(app) : null,
      openGrammarRule: typeof app.openGrammarRule === "function" ? app.openGrammarRule.bind(app) : null,
      resolveRoutedDetails: typeof app.resolveRoutedDetails === "function" ? app.resolveRoutedDetails.bind(app) : null,
      renderGrammarView: typeof app.renderGrammarView === "function" ? app.renderGrammarView.bind(app) : null
    };

    app.activeGrammarPhase = "intro";
    app.activeGrammarTeachIndex = 0;

    app.getActiveGrammarTeachingSteps = function (rule = this.activeGrammarRule) {
      return buildTeachingSteps(rule);
    };

    app.getActiveGrammarTestExercises = function (rule = this.activeGrammarRule) {
      return getTestExercises(rule);
    };

    if (base.resolveRoutedDetails) {
      app.resolveRoutedDetails = function () {
        const previousRuleId = this.activeGrammarRule && this.activeGrammarRule.id;
        const result = base.resolveRoutedDetails();
        const nextRuleId = this.activeGrammarRule && this.activeGrammarRule.id;
        if (nextRuleId && nextRuleId !== previousRuleId) {
          this.activeGrammarPhase = "intro";
          this.activeGrammarTeachIndex = 0;
          this.activeGrammarExIndex = 0;
          this.tokenReconstructionPlaced = [];
          this.activeGrammarAnswers = {};
        }
        return result;
      };
    }

    if (base.openGrammarRule) {
      app.openGrammarRule = function (ruleId) {
        this.activeGrammarPhase = "intro";
        this.activeGrammarTeachIndex = 0;
        return base.openGrammarRule(ruleId);
      };
    }

    if (base.renderGrammarView) {
      app.renderGrammarView = function () {
        const html = base.renderGrammarView();
        return typeof html === "string"
          ? html.replace(
              "120 in-depth rules, structural formulas, examples, and interactive exercises.",
              "120 short, interactive lessons that explain one idea at a time and finish with a short test."
            )
          : html;
      };
    }

    app.renderGrammarRuleDetail = function (rule) {
      const phase = ["intro", "teach", "test", "complete"].includes(this.activeGrammarPhase)
        ? this.activeGrammarPhase
        : "intro";
      const teachingSteps = this.getActiveGrammarTeachingSteps(rule);
      const testExercises = this.getActiveGrammarTestExercises(rule);

      if (phase === "teach") return this.renderProgressiveGrammarTeaching(rule, teachingSteps);
      if (phase === "test") return this.renderProgressiveGrammarTest(rule, testExercises);
      if (phase === "complete") return this.renderProgressiveGrammarComplete(rule, testExercises);
      return this.renderProgressiveGrammarIntro(rule, teachingSteps, testExercises);
    };

    app.renderProgressiveGrammarIntro = function (rule, teachingSteps, testExercises) {
      return `
        <div class="grammar-detail-container grammar-flow-shell animate-fade">
          <button class="btn btn-outline btn-sm" id="btn-back-grammar">← Back to grammar overview</button>
          <section class="grammar-flow-card grammar-flow-intro" aria-labelledby="grammar-lesson-title">
            <div class="grammar-flow-kicker">
              <span class="grammar-level badge-${escapeHTML(String(rule.level || "A1").toLowerCase())}">${escapeHTML(rule.level || "A1")}</span>
              <span>Short lesson</span>
            </div>
            <h1 class="grammar-flow-title" id="grammar-lesson-title">${escapeHTML(rule.title || "Grammar lesson")}</h1>
            <div class="grammar-flow-subtitle">${escapeHTML(rule.titleNl || "")}</div>
            <p class="grammar-flow-intro-copy">${escapeHTML(rule.summary || "Learn this grammar rule one step at a time.")}</p>
            <div class="grammar-flow-meta" aria-label="Lesson information">
              <span><strong>~${estimateMinutes(rule)}</strong> min</span>
              <span><strong>${teachingSteps.length}</strong> short steps</span>
              <span><strong>${testExercises.length}</strong> test questions</span>
            </div>
            <div class="grammar-flow-start-note">
              <strong>What happens?</strong>
              <span>First you get the core idea in small pieces. Then a short test follows.</span>
            </div>
            <button type="button" class="btn btn-primary btn-block grammar-flow-primary" id="btn-start-grammar-lesson">Start lesson →</button>
          </section>
        </div>
      `;
    };

    app.renderProgressiveGrammarTeaching = function (rule, teachingSteps) {
      if (!teachingSteps.length) {
        this.activeGrammarPhase = "test";
        return this.renderProgressiveGrammarTest(rule, this.getActiveGrammarTestExercises(rule));
      }
      const index = Math.max(0, Math.min(this.activeGrammarTeachIndex || 0, teachingSteps.length - 1));
      this.activeGrammarTeachIndex = index;
      const step = teachingSteps[index];
      const isLast = index === teachingSteps.length - 1;
      const progress = Math.round(((index + 1) / teachingSteps.length) * 100);
      const example = step.example && (step.example.nl || step.example.en) ? step.example : null;

      return `
        <div class="grammar-detail-container grammar-flow-shell animate-fade">
          <button class="btn btn-outline btn-sm" id="btn-back-grammar">← Grammar</button>
          <section class="grammar-flow-card grammar-flow-teach" aria-labelledby="grammar-step-title">
            <div class="grammar-flow-progress-head"><span>Explanation · ${index + 1}/${teachingSteps.length}</span><span>${progress}%</span></div>
            <div class="grammar-flow-progress-track" role="progressbar" aria-label="Explanation progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
            <div class="grammar-flow-step-label">${escapeHTML(rule.titleNl || rule.title || "Grammar")}</div>
            <h1 class="grammar-flow-step-title" id="grammar-step-title">${escapeHTML(step.title || `Core idea ${index + 1}`)}</h1>
            <p class="grammar-flow-rule">${escapeHTML(step.body || "")}</p>
            ${step.definition ? `<div class="grammar-flow-definition"><span class="grammar-flow-callout-label">Definition</span><p>${escapeHTML(step.definition)}</p></div>` : ""}
            ${example ? `<div class="grammar-flow-example"><span class="grammar-flow-callout-label">Example</span>${example.nl ? `<div class="grammar-flow-example-nl">${escapeHTML(example.nl)}</div>` : ""}${example.en ? `<div class="grammar-flow-example-en">${escapeHTML(example.en)}</div>` : ""}</div>` : ""}
            ${step.tip ? `<div class="grammar-flow-tip"><span aria-hidden="true">💡</span><div><strong>Tip</strong><span>${escapeHTML(step.tip)}</span></div></div>` : ""}
            ${isLast && (rule.commonMistake || rule.correction) ? `<details class="grammar-flow-more"><summary>See a common mistake</summary>${rule.commonMistake ? `<p><strong>Don't:</strong> ${escapeHTML(rule.commonMistake)}</p>` : ""}${rule.correction ? `<p><strong>Remember:</strong> ${escapeHTML(rule.correction)}</p>` : ""}</details>` : ""}
            <div class="grammar-flow-actions">
              <button type="button" class="btn btn-outline" id="btn-prev-grammar-teach" ${index === 0 ? "disabled" : ""}>← Previous</button>
              <button type="button" class="btn btn-primary" id="btn-next-grammar-teach">${isLast ? "Go to short test →" : "Continue →"}</button>
            </div>
          </section>
        </div>
      `;
    };

    app.renderProgressiveGrammarTest = function (rule, exercises) {
      if (!exercises.length) {
        return `<div class="grammar-detail-container grammar-flow-shell animate-fade"><section class="grammar-flow-card"><h1 class="grammar-flow-step-title">No test available</h1><p class="grammar-flow-rule">This lesson does not have testable exercises yet.</p><button type="button" class="btn btn-primary btn-block" id="btn-back-to-teaching">Back to explanation</button></section></div>`;
      }
      const index = Math.max(0, Math.min(this.activeGrammarExIndex || 0, exercises.length - 1));
      this.activeGrammarExIndex = index;
      const answeredState = this.activeGrammarAnswers && this.activeGrammarAnswers[index];
      const answeredCount = Object.keys(this.activeGrammarAnswers || {}).filter((key) => Number(key) < exercises.length).length;
      const allDone = answeredCount >= exercises.length;
      const isLast = index === exercises.length - 1;
      const progress = Math.round(((index + 1) / exercises.length) * 100);

      return `
        <div class="grammar-detail-container grammar-flow-shell animate-fade">
          <button class="btn btn-outline btn-sm" id="btn-back-to-teaching">← Review explanation</button>
          <section class="grammar-flow-card grammar-flow-test" aria-labelledby="grammar-test-title">
            <div class="grammar-flow-progress-head"><span>Short test · ${index + 1}/${exercises.length}</span><span>${answeredCount}/${exercises.length} answered</span></div>
            <div class="grammar-flow-progress-track" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
            <div class="grammar-flow-step-label">${escapeHTML(rule.titleNl || rule.title || "Grammar")}</div>
            <h1 class="grammar-flow-step-title" id="grammar-test-title">Question ${index + 1}</h1>
            <div class="grammar-flow-exercise-wrap">${this.renderGrammarExercise(exercises[index])}</div>
            <div class="grammar-flow-actions grammar-flow-test-actions">
              <button type="button" class="btn btn-outline" id="btn-prev-grammar-ex" ${index === 0 ? "disabled" : ""}>← Previous</button>
              ${isLast
                ? `<button type="button" class="btn btn-primary" id="btn-view-grammar-result" ${allDone ? "" : "disabled"}>See result →</button>`
                : `<button type="button" class="btn btn-primary" id="btn-next-grammar-ex" ${answeredState ? "" : "disabled"}>Next →</button>`}
            </div>
          </section>
        </div>
      `;
    };

    app.renderProgressiveGrammarComplete = function (rule, exercises) {
      const answers = Object.entries(this.activeGrammarAnswers || {})
        .filter(([key]) => Number(key) < exercises.length)
        .map(([, answer]) => answer);
      const correct = answers.filter((answer) => answer && answer.isCorrect).length;
      const score = exercises.length ? Math.round((correct / exercises.length) * 100) : 0;
      const missed = Math.max(0, exercises.length - correct);
      const statusClass = score >= 75 ? "completion-stage--success" : "completion-stage--retry";
      return `
        <div class="grammar-detail-container grammar-flow-shell animate-fade">
          <section class="completion-stage ${statusClass} grammar-flow-complete" aria-labelledby="grammar-complete-title">
            <div class="completion-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="completion-hero">
              <div class="completion-kicker"><span></span>Lesson complete<span></span></div>
              <h1 class="completion-title" id="grammar-complete-title">${escapeHTML(rule.titleNl || rule.title || "Grammar lesson")}</h1>
              <p class="completion-copy">${missed === 0 ? "Everything was correct. The core of this lesson is in place." : `You got ${correct} of ${exercises.length} questions right. Review the explanation briefly for the tricky parts.`}</p>
            </div>
            <div class="completion-score"><strong>${score}%</strong><span>test score</span></div>
            <div class="completion-stats">
              <div class="completion-stat"><span class="completion-stat-value">${correct}/${exercises.length}</span><span class="completion-stat-label">correct</span></div>
              <div class="completion-stat"><span class="completion-stat-value">${this.getActiveGrammarTeachingSteps(rule).length}</span><span class="completion-stat-label">explanation steps</span></div>
              <div class="completion-stat"><span class="completion-stat-value">${missed}</span><span class="completion-stat-label">to review</span></div>
            </div>
            <div class="grammar-flow-complete-actions">
              <button type="button" class="btn btn-outline" id="btn-restart-grammar-lesson">Restart lesson</button>
              <button type="button" class="btn btn-primary" id="btn-return-grammar-catalog">Back to grammar</button>
            </div>
          </section>
        </div>
      `;
    };

    app.recordGrammarExerciseAnswer = function (isCorrect, userAttempt) {
      if (!this.activeGrammarRule) return;
      if (this.activeGrammarAnswers && this.activeGrammarAnswers[this.activeGrammarExIndex]) return;
      if (!this.activeGrammarAnswers) this.activeGrammarAnswers = {};
      this.activeGrammarAnswers[this.activeGrammarExIndex] = { isCorrect, userAttempt };
      const exercises = this.getActiveGrammarTestExercises();
      const answers = Object.entries(this.activeGrammarAnswers).filter(([key]) => Number(key) < exercises.length);

      if (typeof this.announce === "function") this.announce(isCorrect ? "Correct!" : "Not quite.");
      if (answers.length >= exercises.length && exercises.length) {
        const numCorrect = answers.filter(([, answer]) => answer && answer.isCorrect).length;
        const score = Math.round((numCorrect / exercises.length) * 100);
        if (this.store && typeof this.store.completeGrammarRule === "function") this.store.completeGrammarRule(this.activeGrammarRule.id, score);
      } else if (this.store && typeof this.store.recordActivity === "function") {
        this.store.recordActivity(isCorrect ? 5 : 1);
      }
      if (typeof this.render === "function") this.render();
    };

    app.attachGrammarListeners = function () {
      if (base.attachGrammarListeners) base.attachGrammarListeners();
      if (typeof document === "undefined") return;

      const on = (id, handler) => {
        const element = document.getElementById(id);
        if (element) element.addEventListener("click", handler);
      };
      const showPhase = (phase, focusSelector) => {
        this.activeGrammarPhase = phase;
        this.focusIntention = focusSelector;
        if (typeof this.render === "function") this.render();
        if (typeof this.scrollToTop === "function") this.scrollToTop();
      };

      on("btn-start-grammar-lesson", () => {
        this.activeGrammarTeachIndex = 0;
        showPhase("teach", "#grammar-step-title");
      });

      on("btn-prev-grammar-teach", () => {
        if (this.activeGrammarTeachIndex > 0) {
          this.activeGrammarTeachIndex -= 1;
          showPhase("teach", "#grammar-step-title");
        }
      });

      on("btn-next-grammar-teach", () => {
        const steps = this.getActiveGrammarTeachingSteps();
        if (this.activeGrammarTeachIndex < steps.length - 1) {
          this.activeGrammarTeachIndex += 1;
          showPhase("teach", "#grammar-step-title");
        } else {
          this.activeGrammarExIndex = Math.max(0, Math.min(this.activeGrammarExIndex || 0, this.getActiveGrammarTestExercises().length - 1));
          this.tokenReconstructionPlaced = [];
          showPhase("test", "#grammar-test-title");
        }
      });

      on("btn-back-to-teaching", () => {
        const steps = this.getActiveGrammarTeachingSteps();
        this.activeGrammarTeachIndex = Math.max(0, steps.length - 1);
        this.tokenReconstructionPlaced = [];
        showPhase("teach", "#grammar-step-title");
      });

      on("btn-view-grammar-result", () => {
        const exercises = this.getActiveGrammarTestExercises();
        const answeredCount = Object.keys(this.activeGrammarAnswers || {}).filter((key) => Number(key) < exercises.length).length;
        if (exercises.length && answeredCount >= exercises.length) showPhase("complete", "#grammar-complete-title");
      });

      on("btn-restart-grammar-lesson", () => {
        this.activeGrammarTeachIndex = 0;
        this.activeGrammarExIndex = 0;
        this.tokenReconstructionPlaced = [];
        this.activeGrammarAnswers = {};
        showPhase("intro", "#grammar-lesson-title");
      });

      on("btn-return-grammar-catalog", () => {
        if (typeof this.openLearnItem === "function") this.openLearnItem("grammar");
      });
    };

    return true;
  }

  const API = { buildTeachingSteps, getTestExercises, estimateMinutes, install };
  global.NederGrammarFlow = API;

  function installWhenReady() {
    if (global.NederApp) {
      const installed = install(global.NederApp);
      if (installed && global.NederApp.currentTab === "grammar" && global.NederApp.activeGrammarRule && typeof global.NederApp.render === "function") {
        global.NederApp.render();
      }
      return;
    }
    if (typeof document !== "undefined") {
      const eventTarget = global && typeof global.addEventListener === "function" ? global : document;
      eventTarget.addEventListener("DOMContentLoaded", () => {
        const installed = install(global.NederApp);
        if (installed && global.NederApp.currentTab === "grammar" && global.NederApp.activeGrammarRule && typeof global.NederApp.render === "function") {
          global.NederApp.render();
        }
      }, { once: true });
    }
  }

  installWhenReady();
})(typeof window !== "undefined" ? window : globalThis);
