import { describe, expect, it } from 'vitest';

import configPromise from '@payload-config';
import { Users } from './collections/Users';

describe('payload foundation', () => {
  it('defines the users collection for admin authentication', () => {
    expect(Users.slug).toBe('users');
    expect(Users.auth).toBeTruthy();
  });

  it('builds a sanitized config with postgres and admin settings', async () => {
    const config = await configPromise;

    const slugs = config.collections.map((collection) => collection.slug);

    expect(slugs).toContain('users');
    expect(config.db.name).toBe('postgres');
    expect(config.admin.user).toBe('users');
  });
});
