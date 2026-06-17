import { describe, expect, it } from 'vitest';

import { isPgPoolNoiseEvent } from './options';

interface TestEventException {
  type?: string;
  value?: string;
  mechanism?: { type?: string; handled?: boolean };
  stacktrace?: { frames?: Array<{ filename?: string; in_app?: boolean }> };
}

interface TestEvent {
  exception?: {
    values?: TestEventException[];
  };
}

function makeEvent(overrides: TestEvent = {}): TestEvent {
  return {
    exception: {
      values: [
        {
          type: 'Error',
          value: 'undefined',
          mechanism: { type: 'onunhandledrejection', handled: false },
          stacktrace: {
            frames: [
              { filename: 'node:internal/process/promises', in_app: false },
              { filename: '/var/task/node_modules/@sentry/node-core/...', in_app: false },
            ],
          },
        },
      ],
    },
    ...overrides,
  };
}

/** Return the first exception value, asserting it exists for test clarity. */
function firstEx(event: TestEvent): TestEventException {
  return event.exception!.values![0] as TestEventException;
}

describe('isPgPoolNoiseEvent', () => {
  it('returns true for an undefined rejection with no in-app frames', () => {
    expect(isPgPoolNoiseEvent(makeEvent())).toBe(true);
  });

  it('returns false when the rejection value is a real message', () => {
    const event = makeEvent();
    firstEx(event).value = 'Cannot read properties of undefined';
    expect(isPgPoolNoiseEvent(event)).toBe(false);
  });

  it('returns false when the mechanism is not onunhandledrejection', () => {
    const event = makeEvent();
    firstEx(event).mechanism!.type = 'generic';
    expect(isPgPoolNoiseEvent(event)).toBe(false);
  });

  it('returns false when there is at least one in-app frame', () => {
    const event = makeEvent();
    firstEx(event).stacktrace!.frames = [
      { filename: 'node:internal/process/promises', in_app: false },
      { filename: '/var/task/.next/server/app/page.js', in_app: true },
    ];
    expect(isPgPoolNoiseEvent(event)).toBe(false);
  });

  it('returns true when there are no frames at all', () => {
    const event = makeEvent();
    firstEx(event).stacktrace = { frames: [] };
    expect(isPgPoolNoiseEvent(event)).toBe(true);
  });

  it('returns true when stacktrace is missing', () => {
    const ex: TestEventException = {
      value: 'undefined',
      mechanism: { type: 'onunhandledrejection' },
      stacktrace: undefined,
    };
    expect(isPgPoolNoiseEvent({ exception: { values: [ex] } })).toBe(true);
  });

  it('returns false when exception is missing', () => {
    expect(isPgPoolNoiseEvent({})).toBe(false);
  });
});
