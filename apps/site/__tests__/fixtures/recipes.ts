/**
 * Recipe Test Fixtures
 *
 * Sample recipe data for testing recipe schema, queries, and components.
 * Includes complete recipe documents with all required and optional fields.
 *
 * @module __tests__/fixtures/recipes
 */

// Recipe type (simplified for fixtures, will be replaced by generated types)
interface Recipe {
  _id: string;
  _type: 'recipe';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { _type: 'slug'; current: string };
  excerpt: string;
  publishedAt: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  ingredients: RecipeIngredient[];
  nutritionInfo?: NutritionInfo;
  seo?: SEO;
}

interface RecipeIngredient {
  _type: 'recipeIngredient';
  _key: string;
  quantity?: string;
  unit?: string;
  ingredient: string;
  notes?: string;
}

interface NutritionInfo {
  calories?: number;
  protein?: string;
  carbohydrates?: string;
  fat?: string;
  fiber?: string;
  sodium?: string;
}

interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

/**
 * Sample recipe: Seasonal Vegetable Stir-Fry
 * Complete recipe with all optional fields populated
 */
export const seasonalVegetableStirFry: Partial<Recipe> = {
  _id: 'recipe-001',
  _type: 'recipe',
  _createdAt: '2025-01-15T10:00:00Z',
  _updatedAt: '2025-01-15T10:00:00Z',
  title: 'Seasonal Vegetable Stir-Fry',
  slug: { _type: 'slug', current: 'seasonal-vegetable-stir-fry' },
  excerpt:
    'A vibrant stir-fry showcasing peak-season vegetables from Carinya Parc. Quick, healthy, and adaptable to what is freshest in your garden.',
  publishedAt: '2025-01-15T10:00:00Z',
  servings: 4,
  prepTime: 20,
  cookTime: 15,
  totalTime: 35,
  difficulty: 'Easy',
  ingredients: [
    {
      _type: 'recipeIngredient',
      _key: 'ing-001',
      quantity: '2',
      unit: 'tablespoons',
      ingredient: 'olive oil',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-002',
      quantity: '1',
      unit: '',
      ingredient: 'onion',
      notes: 'sliced',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-003',
      quantity: '3',
      unit: 'cloves',
      ingredient: 'garlic',
      notes: 'minced',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-004',
      quantity: '2',
      unit: 'cups',
      ingredient: 'seasonal vegetables',
      notes: 'chopped (e.g., broccoli, capsicum, carrots)',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-005',
      quantity: '2',
      unit: 'tablespoons',
      ingredient: 'soy sauce',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-006',
      quantity: '1',
      unit: 'teaspoon',
      ingredient: 'sesame oil',
    },
  ],
  nutritionInfo: {
    calories: 180,
    protein: '4g',
    carbohydrates: '15g',
    fat: '12g',
    fiber: '4g',
    sodium: '480mg',
  },
  seo: {
    metaTitle: 'Seasonal Vegetable Stir-Fry Recipe | Carinya Parc',
    metaDescription:
      'Quick and healthy vegetable stir-fry using seasonal produce. Perfect for showcasing fresh garden vegetables.',
    keywords: ['stir-fry', 'vegetables', 'seasonal', 'quick recipe', 'healthy'],
  },
};

/**
 * Sample recipe: Homemade Tomato Passata
 * Recipe with minimal optional fields
 */
export const tomatoPassata: Partial<Recipe> = {
  _id: 'recipe-002',
  _type: 'recipe',
  _createdAt: '2025-02-01T14:30:00Z',
  _updatedAt: '2025-02-01T14:30:00Z',
  title: 'Homemade Tomato Passata',
  slug: { _type: 'slug', current: 'homemade-tomato-passata' },
  excerpt:
    'Preserve your tomato harvest with this traditional passata recipe. Perfect for storing summer flavours year-round.',
  publishedAt: '2025-02-01T14:30:00Z',
  prepTime: 30,
  cookTime: 120,
  totalTime: 150,
  difficulty: 'Medium',
  ingredients: [
    {
      _type: 'recipeIngredient',
      _key: 'ing-001',
      quantity: '5',
      unit: 'kg',
      ingredient: 'ripe tomatoes',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-002',
      quantity: '',
      unit: '',
      ingredient: 'salt',
      notes: 'to taste',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-003',
      quantity: '2',
      unit: 'tablespoons',
      ingredient: 'lemon juice',
      notes: 'per bottle for preservation',
    },
  ],
};

/**
 * Sample recipe: Sourdough Bread
 * Recipe with long preparation time
 */
export const sourdoughBread: Partial<Recipe> = {
  _id: 'recipe-003',
  _type: 'recipe',
  _createdAt: '2025-03-10T08:00:00Z',
  _updatedAt: '2025-03-10T08:00:00Z',
  title: 'Country Sourdough Bread',
  slug: { _type: 'slug', current: 'country-sourdough-bread' },
  excerpt:
    'A classic sourdough with a crispy crust and tangy flavour. Requires active sourdough starter and patience.',
  publishedAt: '2025-03-10T08:00:00Z',
  servings: 12,
  prepTime: 60,
  cookTime: 45,
  totalTime: 1500, // Includes proofing time (25 hours)
  difficulty: 'Hard',
  ingredients: [
    {
      _type: 'recipeIngredient',
      _key: 'ing-001',
      quantity: '500',
      unit: 'g',
      ingredient: 'bread flour',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-002',
      quantity: '350',
      unit: 'g',
      ingredient: 'water',
      notes: 'room temperature',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-003',
      quantity: '100',
      unit: 'g',
      ingredient: 'active sourdough starter',
    },
    {
      _type: 'recipeIngredient',
      _key: 'ing-004',
      quantity: '10',
      unit: 'g',
      ingredient: 'salt',
    },
  ],
  nutritionInfo: {
    calories: 120,
    protein: '4g',
    carbohydrates: '24g',
    fat: '1g',
    fiber: '1g',
    sodium: '180mg',
  },
};

/**
 * Array of all recipe fixtures for batch testing
 */
export const allRecipes: Partial<Recipe>[] = [
  seasonalVegetableStirFry,
  tomatoPassata,
  sourdoughBread,
];

/**
 * Minimal recipe fixture for validation testing
 */
export const minimalRecipe: Partial<Recipe> = {
  _id: 'recipe-min',
  _type: 'recipe',
  title: 'Minimal Recipe',
  slug: { _type: 'slug', current: 'minimal-recipe' },
  excerpt: 'A minimal recipe with only required fields.',
  publishedAt: '2025-01-01T00:00:00Z',
  ingredients: [
    {
      _type: 'recipeIngredient',
      _key: 'ing-001',
      ingredient: 'test ingredient',
    },
  ],
};
