import type { Field } from 'payload';

export const recipeIngredientFields: Field[] = [
  {
    name: 'item',
    type: 'text',
    required: true,
    admin: {
      description: 'Full ingredient line, e.g. "500 g mixed root vegetables"',
    },
  },
];

export const recipeInstructionFields: Field[] = [
  {
    name: 'step',
    type: 'textarea',
    required: true,
  },
];
