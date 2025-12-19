# Category Schema Integration Guide

**Task:** CP-04-002 (Category Taxonomy System)  
**Status:** ✓ Schema deployed, awaiting post/recipe integration  
**Last Updated:** 2025-12-19

## Overview

The category schema provides hierarchical taxonomy for organizing content across multiple content types (posts, recipes, etc.). This guide explains how to integrate categories into existing and future content schemas.

## Schema Features

- **Hierarchical structure**: Categories can have parent-child relationships (unlimited depth)
- **Content type scoping**: Categories can be limited to specific content types (post, recipe, or both)
- **Slug auto-generation**: URL-safe slugs generated automatically from titles
- **Validation**: Slug uniqueness, circular reference prevention, required fields

## Adding Categories to Content Schemas

When creating post or recipe schemas, add a category reference field:

```typescript
defineField({
  name: 'categories',
  title: 'Categories',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: ({ document }) => {
          // FR-005: Only show categories that apply to this content type
          const contentType = document?._type; // 'post' or 'recipe'
          return {
            filter: '$contentType in contentTypes',
            params: { contentType },
          };
        },
      },
    },
  ],
  description: 'Assign one or more categories to this content. Categories help organize and filter content.',
  validation: (Rule) => Rule.max(5).warning('Consider limiting to 5 categories for clarity'),
}),
```

## GROQ Queries

### Get all categories for a content type

```groq
*[_type == "category" && $contentType in contentTypes] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  "parent": parent->{_id, title, "slug": slug.current},
  contentTypes
}
```

### Get category with full hierarchy path

```groq
*[_type == "category" && _id == $categoryId][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  contentTypes,
  "path": select(
    defined(parent) => array::compact([
      ...^.parent->{"title": title, "slug": slug.current},
      {"title": title, "slug": slug.current}
    ]),
    [{"title": title, "slug": slug.current}]
  )
}
```

### Get posts by category

```groq
*[_type == "post" && $categoryId in categories[]._ref] {
  _id,
  title,
  "slug": slug.current,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}
```

### Get top-level categories only

```groq
*[_type == "category" && !defined(parent)] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description
}
```

## Frontend Integration (Future)

When implementing category pages on the frontend:

1. **Category Archive Page** (`/blog/category/[slug]` or `/recipes/category/[slug]`)
   - Fetch category by slug
   - Display category title, description, hierarchy breadcrumb
   - List all posts/recipes in this category

2. **Category Navigation**
   - Display top-level categories in navigation
   - Show hierarchy with parent > child > grandchild breadcrumbs

3. **Content Filtering**
   - Allow filtering by multiple categories
   - Show category badges on post/recipe cards

## Testing

- **Unit tests**: `apps/site/__tests__/unit/sanity/schemas/category.test.ts`
- **Integration tests**: `apps/site/__tests__/integration/sanity/category-crud.test.ts`
- **Smoke tests**: `apps/site/__tests__/smoke/category-schema.test.tsx`
- **Fixtures**: `apps/site/__tests__/fixtures/categories.ts`

## Deployment Checklist

- [x] Category schema created (`category.ts`)
- [x] TypeScript types defined (`types/category.ts`)
- [x] Schema registered in `schemas/index.ts`
- [x] Unit tests written and passing
- [x] Integration tests written
- [x] Smoke tests written and passing
- [x] Test fixtures created
- [ ] Post schema updated with category references (CP-04-003)
- [ ] Recipe schema updated with category references (future)
- [ ] Category deployed to Sanity Studio
- [ ] Initial taxonomy structure created
- [ ] Content team training completed
- [ ] Frontend category pages implemented (future)

## Requirements Traceability

- **FR-001**: Title, slug, description fields ✓
- **FR-002**: Auto-generated slugs ✓
- **FR-003**: Hierarchical parent-child relationships ✓
- **FR-004**: Content type scoping ✓
- **FR-005**: Filtered category selection in Studio ✓
- **FR-006**: Hierarchy display in Studio preview ✓
- **FR-007**: Preview configuration ✓
- **FR-008**: Slug uniqueness validation ✓

## Performance Considerations

- Category list queries: Target < 200ms (monitored via Sanity)
- Hierarchy path queries: Target < 150ms (max 10 levels)
- Slug validation: < 100ms (unique index on `slug.current`)

## Best Practices

- **Hierarchy depth**: Recommend 3-4 levels max for UX clarity
- **Category count**: Plan for ~500 categories within first year
- **Content type scoping**: Default to both types unless specific reason to limit
- **Naming**: Use clear, descriptive titles (e.g., "Regenerative Agriculture", not "Regen Ag")

## Support

For questions or issues:

- Check `docs/structure.md` for file organization
- Check `docs/tech.md` for Sanity configuration
- Review test files for usage examples
