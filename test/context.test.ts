import { 
  emptyContext,
  addReserved,
  isReserved,
  getReserved,
  addDefinition,
  isDefined,
  getDefinition,
  setResult,
  getResult
} from '../bin/berri-lib/context.js';

const testContext = {
  result: 10,
  reserved: {
    "def": "reserved!"
  },
  memory: {
    "testVar": 13
  }
};

describe('context', () => {
  test('addReserved', () => {
    const resultantContext = addReserved(emptyContext, 'def', 'reserved!')
    expect(resultantContext.reserved['def']).toBe('reserved!');
    addReserved(resultantContext, 'new', 'definition');
    expect(resultantContext.reserved['new']).toBe(undefined);
  });
  test('isReserved', () => {
    expect(isReserved(testContext, 'def')).toBe(true);
    expect(isReserved(emptyContext, 'def')).toBe(false);
  });
  test('getReserved', () => {
    expect(getReserved(testContext, 'def')).toBe('reserved!');
  });
  test('addDefinition', () => {
    const resultantContext = addDefinition(emptyContext, 'testVar', 13);
    expect(resultantContext.memory['testVar']).toBe(13);
    const throwsError = () => addDefinition(testContext, 'def', 13);
    expect(throwsError).toThrow();

  })
  test('isDefined', () => {
    expect(isDefined(testContext, 'testVar')).toBe(true);
    expect(isDefined(testContext, 'def')).toBe(false);
  })
  test('getDefinition', () => {
    expect(getDefinition(testContext, 'testVar')).toBe(13);
    expect(getDefinition(testContext, 'def')).toBe(undefined);
  })
});