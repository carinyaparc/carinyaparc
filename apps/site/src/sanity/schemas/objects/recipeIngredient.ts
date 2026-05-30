/**
 * Recipe Ingredient Object Schema
 *
 * Defines the structured ingredient object type for use in recipe documents.
 * Provides fields for quantity, unit, ingredient name, and optional notes.
 *
 * @module sanity/schemas/objects/recipeIngredient
 */

import { defineType } from 'sanity';
import type { SchemaTypeDefinition } from 'sanity';

/**
 * Recipe Ingredient schema definition
 *
 * Fields:
 * - quantity: Amount of ingredient (optional, e.g., "2", "1/2", "1.5")
 * - unit: Unit of measurement (optional, e.g., "cups", "tablespoons", "kg")
 * - ingredient: Name of the ingredient (required)
 * - notes: Additional preparation notes (optional, e.g., "finely chopped", "room temperature")
 *
 * Validation:
 * - Ingredient name is required
 * - All other fields optional for flexibility
 *
 * Preview: Displays quantity, unit, and ingredient name combined
 *
 * Maps to: FR-013 (Recipe schema SHALL include structured ingredient objects)
 */
export const recipeIngredientSchema: SchemaTypeDefinition = defineType({
  name: 'recipeIngredient',
  title: 'Recipe Ingredient',
  type: 'object',
  fields: [
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'string',
      description: 'Amount of ingredient (e.g., "2", "1/2", "1.5")',
    },
    {
      name: 'unit',
      title: 'Unit',
      type: 'string',
      description: 'Unit of measurement (e.g., "cups", "tablespoons", "kg", "mL")',
    },
    {
      name: 'ingredient',
      title: 'Ingredient',
      type: 'string',
      description: 'Name of the ingredient',
      validation: (Rule) => Rule.required().error('Ingredient name is required'),
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'string',
      description: 'Optional preparation notes (e.g., "finely chopped", "room temperature")',
    },
  ],
  preview: {
    select: {
      quantity: 'quantity',
      unit: 'unit',
      ingredient: 'ingredient',
    },
    prepare({ quantity, unit, ingredient }) {
      const parts = [quantity, unit, ingredient].filter(Boolean);
      return {
        title: parts.join(' '),
      };
    },
  },
});



