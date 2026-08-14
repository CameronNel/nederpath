# Generator determinism evidence

Executed from the final lexical source state on 2026-08-14:

```text
npm run words
npm run words
```

Both runs completed successfully and produced byte-identical artifacts:

| Artifact | First SHA-256 | Second SHA-256 |
|---|---|---|
| `data/words.js` | `1F5AAA9CD75319DCD5A76CA52E1E51ACA4A2C452B8AEBBFE01B3AFE03CA3435F` | `1F5AAA9CD75319DCD5A76CA52E1E51ACA4A2C452B8AEBBFE01B3AFE03CA3435F` |
| `data/word_ids.json` | `7EB440D5443CCB59F4282E98303E92FDD28392F452D23DDD97B63A69473BB039` | `7EB440D5443CCB59F4282E98303E92FDD28392F452D23DDD97B63A69473BB039` |

The regression suite independently repeats this check and also verifies that the checkout starts canonical.
