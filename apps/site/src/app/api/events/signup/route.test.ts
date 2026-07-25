import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getEventById,
  countEventRegistrations,
  findEventRegistrationByEmail,
  isEventAtCapacity,
  getPayloadClient,
  sendEventSignupConfirmation,
} = vi.hoisted(() => ({
  getEventById: vi.fn(),
  countEventRegistrations: vi.fn(),
  findEventRegistrationByEmail: vi.fn(),
  isEventAtCapacity: vi.fn(),
  getPayloadClient: vi.fn(),
  sendEventSignupConfirmation: vi.fn(),
}));

vi.mock('@/features/events/queries/events', () => ({
  getEventById,
  countEventRegistrations,
  findEventRegistrationByEmail,
  isEventAtCapacity,
}));

vi.mock('@/lib/payload/client', () => ({
  getPayloadClient,
}));

vi.mock('@/features/events/email/send-event-signup-confirmation', () => ({
  sendEventSignupConfirmation,
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

import { POST } from '@/app/api/events/signup/route';

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/events/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const upcomingEvent = {
  id: 7,
  title: 'Winter planting day',
  slug: 'winter-planting-day',
  startsAt: '2030-06-15T23:00:00.000Z',
  location: 'Carinya Parc, The Branch NSW',
  capacity: 20,
  isFull: false,
  signupTarget: null,
  description: {} as never,
  updatedAt: '2030-01-01T00:00:00.000Z',
  createdAt: '2030-01-01T00:00:00.000Z',
  _status: 'published' as const,
};

describe('POST /api/events/signup', () => {
  const create = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EVENT_SIGNUP_RATE_LIMITING = 'false';
    getEventById.mockResolvedValue(upcomingEvent);
    findEventRegistrationByEmail.mockResolvedValue(null);
    countEventRegistrations.mockResolvedValue(0);
    isEventAtCapacity.mockReturnValue(false);
    create.mockResolvedValue({ id: 1 });
    getPayloadClient.mockResolvedValue({ create });
    sendEventSignupConfirmation.mockResolvedValue({ success: true, messageId: 'msg_1' });
  });

  afterEach(() => {
    delete process.env.EVENT_SIGNUP_RATE_LIMITING;
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/events/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    const response = await POST(req as never);
    expect(response.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const response = await POST(
      jsonRequest({
        eventId: 7,
        name: 'Alex',
        email: 'nope',
        submissionTime: 5000,
      }) as never,
    );
    expect(response.status).toBe(400);
  });

  it('silently accepts honeypot submissions', async () => {
    const response = await POST(
      jsonRequest({
        eventId: 7,
        name: 'Bot',
        email: 'bot@fastmail.com',
        website: 'https://spam.test',
        submissionTime: 5000,
      }) as never,
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it('records a registration and returns confirmation', async () => {
    const response = await POST(
      jsonRequest({
        eventId: 7,
        name: 'Alex Farmer',
        email: 'alex@fastmail.com',
        website: '',
        submissionTime: 5000,
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe('registered');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'event-registrations',
        overrideAccess: true,
        data: expect.objectContaining({
          event: 7,
          name: 'Alex Farmer',
          email: 'alex@fastmail.com',
          status: 'registered',
        }),
      }),
    );
    expect(sendEventSignupConfirmation).toHaveBeenCalled();
  });

  it('returns 409 when the event is at capacity', async () => {
    isEventAtCapacity.mockReturnValue(true);

    const response = await POST(
      jsonRequest({
        eventId: 7,
        name: 'Alex Farmer',
        email: 'alex@fastmail.com',
        submissionTime: 5000,
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.full).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 404 when the event is missing', async () => {
    getEventById.mockResolvedValue(null);

    const response = await POST(
      jsonRequest({
        eventId: 999,
        name: 'Alex Farmer',
        email: 'alex@fastmail.com',
        submissionTime: 5000,
      }) as never,
    );

    expect(response.status).toBe(404);
  });

  it('is idempotent for an existing registration', async () => {
    findEventRegistrationByEmail.mockResolvedValue({ id: 3, status: 'registered' });

    const response = await POST(
      jsonRequest({
        eventId: 7,
        name: 'Alex Farmer',
        email: 'alex@fastmail.com',
        submissionTime: 5000,
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });
});
