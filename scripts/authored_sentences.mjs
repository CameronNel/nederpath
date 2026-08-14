// NederPath Authored Sentences Master Module
// Re-exports all CEFR levels (A1, A2, B1, B2, C1) with strict schemas, unique Dutch keys, and authentic phrasing.

import { AUTHORED_SENTENCES_A1 } from './authored_sentences_a1.mjs';
import { AUTHORED_SENTENCES_A2 } from './authored_sentences_a2.mjs';
import { AUTHORED_SENTENCES_B1 } from './authored_sentences_b1.mjs';
import { AUTHORED_SENTENCES_B2 } from './authored_sentences_b2.mjs';
import { AUTHORED_SENTENCES_C1 } from './authored_sentences_c1.mjs';

export const AUTHORED_SENTENCES = [
  ...AUTHORED_SENTENCES_A1,
  ...AUTHORED_SENTENCES_A2,
  ...AUTHORED_SENTENCES_B1,
  ...AUTHORED_SENTENCES_B2,
  ...AUTHORED_SENTENCES_C1
];
