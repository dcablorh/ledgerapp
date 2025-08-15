#!/bin/sh
set -e

echo "🚀 Starting Urban-IT Ledger Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "✅ Database is ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database if SEED_DATABASE is set
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

echo "🎉 Backend setup complete!"

# Start the application
exec "$@"