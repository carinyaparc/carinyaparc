import { stripMdxBody } from '@/lib/mdx/strip-mdx';

export function parseRecipeInstructions(rawBody: string): string[] {
  const body = stripMdxBody(rawBody);
  const lines = body.split('\n');
  const instructions: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith('#') || trimmed.startsWith('>')) {
      continue;
    }

    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      instructions.push(normaliseStepText(numbered[1] ?? ''));
      continue;
    }

    if (instructions.length > 0) {
      instructions[instructions.length - 1] = `${instructions[instructions.length - 1]} ${trimmed}`;
    }
  }

  return instructions;
}

function normaliseStepText(step: string): string {
  return step.replace(/\*\*/g, '').trim();
}
