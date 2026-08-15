# State migration

Storage identity remains `nederpath-v1`. HanaPath `hanapath-v1` is never read or written.

## Field classification

| Old field | Status |
|---|---|
| `user.totalXp` | PRESERVED |
| `user.streak` | PRESERVED |
| `user.lastActiveDate` | PRESERVED |
| `progress.dailyStats` | PRESERVED |
| `progress.studyDays` | PRESERVED |
| `srs.cards` | PRESERVED |
| `progress.grammarCompleted` | PRESERVED |
| `progress.comprehensionCompleted` | PRESERVED |
| `progress.wordsBookmarked` | PRESERVED |
| `progress.articleStats` | PRESERVED |
| `settings.sessionSize` | PRESERVED |
| `settings.dailyGoal` | PRESERVED |
| `settings.autoAdvance` | PRESERVED |
| `settings.hapticFeedback` | PRESERVED |
| `settings.theme` dark/light | TRANSFORMED into `settings.appearance`; `theme` kept for backup compatibility |
| `settings.appearance` | NEW (`system` / `light` / `dark`) |
| `settings.accent` | NEW (HanaPath accent ids, default `violet`) |
| `settings.reduceMotion` | NEW |
| Korean HanaPath learner fields | DROPPED_WITH_REASON — never imported |
| Invented fluency/confidence scores | OBSOLETE — not displayed |

Backup import still goes through `NederLearning.validateAndMergeBackup` and remains fail-closed for prototype pollution, invalid dates, and oversized collections.
