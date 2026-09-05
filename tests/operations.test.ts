import assert from 'node:assert/strict';
import test from 'node:test';

import { decodeStringList, isResultStatus, parseStringList } from '../lib/operations.ts';

test('aceita apenas resultados operacionais conhecidos', () => {
  assert.equal(isResultStatus('excellent'), true);
  assert.equal(isResultStatus('poor'), true);
  assert.equal(isResultStatus('unknown'), false);
});

test('remove plataformas inválidas e repetidas', () => {
  assert.deepEqual(parseStringList(['meta', 'google', 'meta', 'email'], ['meta', 'google']), ['meta', 'google']);
});

test('trata listas persistidas inválidas sem quebrar a tela', () => {
  assert.deepEqual(decodeStringList('["meta","google"]'), ['meta', 'google']);
  assert.deepEqual(decodeStringList('não é json'), []);
});
