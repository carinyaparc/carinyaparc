export function stripMdxBody(content: string): string {
  return content
    .replace(/^import\s+.+$/gm, '')
    .replace(/<Image[\s\S]*?\/>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
