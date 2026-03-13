#!/bin/bash

# ─── FitSpace Platform Migration Script ─────────────────────
# This script runs the migration for the isolated platform schema
# to avoid touching the main FitSpace schema.

echo "🚀 Running Platform Migration..."

npx prisma migrate dev --name init_platform --schema prisma/platform.prisma

echo "✅ Platform Migration Complete!"
