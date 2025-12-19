# Sanity Studio Deployment Guide

**Task:** CP-04-002 Category Schema Deployment  
**Created:** 2025-12-19

## Prerequisites

### 1. Environment Variables

Ensure your `.env.local` file contains the required Sanity configuration:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production  # or 'development' for dev dataset
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-25
```

### 2. Sanity Authentication

You must be authenticated with Sanity to deploy. Run:

```bash
cd apps/site
pnpm sanity login
```

This will:

- Open your browser for OAuth authentication
- Store your credentials locally in `~/.config/sanity/config`
- Grant CLI access to your Sanity project

## Deployment Steps

### Step 1: Verify Configuration

Check that your CLI config is valid:

```bash
cd apps/site
pnpm sanity check
```

### Step 2: Deploy Studio

Deploy the Sanity Studio with the new category schema:

```bash
cd apps/site
pnpm sanity deploy
```

This will:

- Bundle your Studio configuration
- Upload to Sanity's hosting
- Make your Studio available at `https://your-project.sanity.studio/`

**Note:** The category schema is already registered in `sanity.config.ts` so it will be included in the deployment.

### Step 3: Verify Deployment

1. Navigate to your Studio: `https://your-project.sanity.studio/` (or `/studio` if embedded)
2. Check that "Category" appears in the content types list
3. Try creating a test category to verify the schema works

## Alternative: Schema-Only Deployment

If you only want to deploy the schema without deploying the entire Studio:

```bash
cd apps/site
pnpm sanity graphql deploy  # Deploy GraphQL schema
# OR
pnpm sanity schema deploy   # If available in your Sanity version
```

## Troubleshooting

### Error: Missing environment variable

**Problem:** `Missing environment variable: NEXT_PUBLIC_SANITY_DATASET`

**Solution:**

1. Check that `.env.local` exists in `apps/site/`
2. Verify it contains `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
3. Restart your terminal to reload environment variables

### Error: Forbidden - User is missing required grant

**Problem:** `User is missing required grant sanity.project.read`

**Solution:**

1. Run `pnpm sanity login` to authenticate
2. Ensure you have admin access to the Sanity project
3. If using a team project, ask the project owner to grant you deployment permissions

### Error: sanity.cli.ts does not contain a project identifier

**Problem:** CLI can't find project configuration

**Solution:**
✓ Already fixed! The `sanity.cli.ts` file has been created with proper configuration.

## Post-Deployment

After successful deployment:

1. **Create Initial Taxonomy**:
   - Log in to Studio
   - Navigate to Categories
   - Create top-level categories:
     - Sustainability
     - Farm Life
     - Recipes
     - Getting Started
   - Add child categories as needed

2. **Update Post Schema** (Next task: CP-04-003):
   - Add category reference field to post schema
   - Test category assignment in Studio

3. **Team Training**:
   - Show content team how to create categories
   - Demonstrate hierarchy (parent/child relationships)
   - Explain content type scoping

## Verification Checklist

- [ ] Environment variables configured
- [ ] Authenticated with `pnpm sanity login`
- [ ] Studio deployed successfully
- [ ] Category schema visible in Studio
- [ ] Test category created successfully
- [ ] Hierarchy (parent category) works
- [ ] Content type scoping works (post/recipe filter)
- [ ] Slug auto-generation works
- [ ] Slug uniqueness validation works

## Next Steps

After deployment:

1. **Create initial categories** in Studio
2. **Update post schema** (CP-04-003) to add category references
3. **Update recipe schema** (future) to add category references
4. **Implement frontend** category pages (CP-04-005 or later)

## Rollback

If you need to rollback the schema:

1. Remove category from `apps/site/src/sanity/schemas/index.ts`
2. Redeploy: `pnpm sanity deploy`
3. Category documents will remain but won't be editable in Studio

**Note:** Category documents are NOT deleted during rollback. They remain in the dataset.

## Support

- Sanity Documentation: https://www.sanity.io/docs
- Deployment Guide: https://www.sanity.io/docs/deployment
- CLI Reference: https://www.sanity.io/docs/cli
