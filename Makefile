# Urban-IT Ledger Makefile

.PHONY: help dev build start stop clean logs test

# Default target
help:
	@echo "Urban-IT Ledger Development Commands"
	@echo "===================================="
	@echo "dev          - Start development environment"
	@echo "build        - Build all containers"
	@echo "start        - Start production environment"
	@echo "stop         - Stop all containers"
	@echo "clean        - Remove all containers and volumes"
	@echo "logs         - Show container logs"
	@echo "test         - Run tests"
	@echo "db-reset     - Reset database with fresh data"

# Development environment
dev:
	@echo "🚀 Starting development environment..."
	docker-compose up --build

# Build all containers
build:
	@echo "🔨 Building all containers..."
	docker-compose build

# Production environment
start:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d

# Stop all containers
stop:
	@echo "🛑 Stopping all containers..."
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

# Clean up everything
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.prod.yml down -v --remove-orphans
	docker system prune -f

# Show logs
logs:
	@echo "📋 Showing container logs..."
	docker-compose logs -f

# Run tests
test:
	@echo "🧪 Running tests..."
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

# Reset database
db-reset:
	@echo "🔄 Resetting database..."
	docker-compose exec backend npm run db:reset