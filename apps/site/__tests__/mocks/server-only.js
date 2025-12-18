/**
 * Mock for server-only package used in tests
 * The server-only package is used to ensure certain modules are only imported on the server
 * In test environment, we mock it to allow testing server-side code
 */

// Empty export - the package just throws an error in browser environments
// In tests, we allow the import to succeed
export {};
