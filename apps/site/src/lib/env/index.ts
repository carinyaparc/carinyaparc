/**
 * Environment variable validation module
 *
 * This module provides type-safe access to environment variables
 * with runtime validation using Zod schemas.
 *
 * @module env
 */

// Types and schemas (safe to import anywhere)
export type { SanityEnv } from './types';
export { sanityEnvSchema } from './types';

// Server-only functions (can only be imported in server components/routes)
export { getSanityEnv } from './sanity';
