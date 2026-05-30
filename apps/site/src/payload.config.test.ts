import { describe, expect, it } from 'vitest';

import configPromise from '@payload-config';
import { Authors } from './collections/Authors';
import { Categories } from './collections/Categories';
import { Posts } from './collections/Posts';
import { Tags } from './collections/Tags';
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
    expect(slugs).toContain('authors');
    expect(slugs).toContain('categories');
    expect(slugs).toContain('tags');
    expect(slugs).toContain('posts');
    expect(config.db.name).toBe('postgres');
    expect(config.admin.user).toBe('users');
  });

  it('registers blog collections for admin editing', () => {
    expect(Authors.slug).toBe('authors');
    expect(Categories.slug).toBe('categories');
    expect(Tags.slug).toBe('tags');
    expect(Posts.slug).toBe('posts');
  });
});
