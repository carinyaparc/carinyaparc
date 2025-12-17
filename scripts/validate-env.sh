#!/bin/bash
# Environment Variable Configuration Validation Script
#
# This script validates that environment variable configuration meets
# requirements for Sanity CMS integration.
#
# Requirements covered: FR-005, FR-006, FR-007, NFR-001, NFR-004
# Design reference: CI/CD Smoke Test section in design.md
#
# Usage: ./scripts/validate-env.sh
#
# Exit codes:
#   0 - All validations passed
#   1 - One or more validations failed

set -e

echo "Validating environment variable configuration..."
echo ""

# Track validation status
validation_failed=0

# FR-005: Check .env.example exists and contains required variables
echo "Checking .env.example file..."
if [ ! -f "apps/site/.env.example" ]; then
  echo "✗ .env.example not found at apps/site/.env.example"
  validation_failed=1
else
  echo "✓ .env.example file exists"
fi

# FR-005, AC-001: Verify all required variables are documented
if [ -f "apps/site/.env.example" ]; then
  echo ""
  echo "Checking required variables in .env.example..."
  
  required_vars=(
    "NEXT_PUBLIC_SANITY_PROJECT_ID"
    "NEXT_PUBLIC_SANITY_DATASET"
    "SANITY_API_READ_TOKEN"
    "SANITY_API_WRITE_TOKEN"
  )

  for var in "${required_vars[@]}"; do
    if ! grep -q "$var" apps/site/.env.example; then
      echo "✗ $var not found in .env.example"
      validation_failed=1
    else
      echo "✓ $var documented in .env.example"
    fi
  done
fi

# FR-006, AC-002, NFR-001: Check .gitignore excludes sensitive files
echo ""
echo "Checking .gitignore configuration..."

gitignore_entries=(
  ".env.local"
  ".env.development"
  ".env.production"
)

for entry in "${gitignore_entries[@]}"; do
  if ! grep -q "$entry" .gitignore && ! grep -q "$entry" apps/site/.gitignore; then
    echo "✗ $entry not excluded in .gitignore"
    validation_failed=1
  else
    echo "✓ $entry properly excluded from version control"
  fi
done

# Additional security check: ensure .env.example is allowed
if grep -q "^\.env\.example$" .gitignore || grep -q "^\.env\.example$" apps/site/.gitignore; then
  echo "! Warning: .env.example should be committed (not in .gitignore)"
  echo "  Current .gitignore has exclusion rule that may prevent committing .env.example"
fi

# NFR-004: Verify .env.example is committed (exists in git)
echo ""
echo "Checking .env.example is tracked by git..."
if git ls-files --error-unmatch apps/site/.env.example > /dev/null 2>&1; then
  echo "✓ .env.example is tracked in version control"
else
  echo "! Warning: .env.example is not tracked by git"
  echo "  Run: git add apps/site/.env.example"
fi

# Summary
echo ""
echo "----------------------------------------"
if [ $validation_failed -eq 0 ]; then
  echo "✓ Environment configuration validation passed"
  echo "All required environment variables are properly documented"
  echo "and sensitive files are excluded from version control."
  exit 0
else
  echo "✗ Environment configuration validation failed"
  echo "Please fix the issues listed above and re-run validation."
  exit 1
fi

