# Groceries Admin Panel - Makefile
# This Makefile provides convenient commands for development and deployment

.PHONY: help build up down restart logs clean dev deploy status health

# Default target
help: ## Show this help message
	@echo "Groceries Admin Panel - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development server
	npm run dev

install: ## Install dependencies
	npm install

build: ## Build the application
	npm run build

lint: ## Run linting
	npm run lint

type-check: ## Run TypeScript type checking
	npm run type-check

# Docker commands
docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop and remove Docker containers
	docker-compose down

docker-restart: ## Restart Docker containers
	docker-compose restart

docker-logs: ## Show Docker container logs
	docker-compose logs -f

docker-logs-admin: ## Show admin panel container logs
	docker-compose logs -f admin-panel

docker-logs-nginx: ## Show nginx container logs
	docker-compose logs -f nginx

docker-clean: ## Clean up Docker resources
	docker-compose down -v --remove-orphans
	docker system prune -f

# Deployment commands
deploy: ## Deploy to server using deploy script
	./deploy.sh deploy

deploy-stop: ## Stop deployment on server
	./deploy.sh stop

deploy-start: ## Start deployment on server
	./deploy.sh start

deploy-restart: ## Restart deployment on server
	./deploy.sh restart

deploy-status: ## Check deployment status on server
	./deploy.sh status

deploy-logs: ## View deployment logs on server
	./deploy.sh logs

deploy-cleanup: ## Clean up old Docker images on server
	./deploy.sh cleanup

# Health check commands
health: ## Check application health
	@echo "Checking application health..."
	@curl -f http://localhost/health || echo "Health check failed"

health-remote: ## Check remote application health
	@echo "Checking remote application health..."
	@curl -f http://91.99.95.75/health || echo "Remote health check failed"

# Local development with Docker
local-dev: docker-build docker-up ## Build and start local Docker development environment
	@echo "Local development environment started!"
	@echo "Admin panel: http://localhost/admin"
	@echo "Health check: http://localhost/health"

# Production deployment
prod-deploy: ## Full production deployment (build + deploy)
	@echo "Starting production deployment..."
	git add .
	git commit -m "Production deployment $(shell date +%Y-%m-%d_%H-%M-%S)" || true
	git push origin main
	@echo "Deployment triggered via GitHub Actions"

# Testing commands
test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

# Utility commands
status: ## Show status of all services
	@echo "=== Docker Containers ==="
	docker-compose ps
	@echo ""
	@echo "=== Application Health ==="
	@curl -s http://localhost/health || echo "Local app not running"
	@echo ""
	@echo "=== Remote Application Health ==="
	@curl -s http://91.99.95.75/health || echo "Remote app not accessible"

clean: ## Clean all build artifacts and dependencies
	rm -rf .next
	rm -rf node_modules
	rm -rf out
	rm -rf dist

reset: clean install ## Reset project (clean + install)
	@echo "Project reset complete"

# Git commands
commit: ## Commit changes with timestamp
	git add .
	git commit -m "Update $(shell date +%Y-%m-%d_%H-%M-%S)"

push: ## Push changes to main branch
	git push origin main

pull: ## Pull latest changes
	git pull origin main

# Server management
ssh-server: ## SSH into the server
	ssh root@91.99.95.75

server-status: ## Check server status
	@echo "Checking server status..."
	@curl -s http://91.99.95.75/health || echo "Server not accessible"

# Quick development workflow
quick-start: install dev ## Quick start for development (install + dev)

quick-deploy: commit push ## Quick deploy (commit + push)

# Environment setup
setup: install ## Setup development environment
	@echo "Setting up development environment..."
	@if [ ! -f .env ]; then cp env.example .env; echo "Created .env from env.example"; fi
	@echo "Setup complete! Run 'make dev' to start development"

# Show environment info
info: ## Show environment information
	@echo "=== Environment Information ==="
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Docker version: $(shell docker --version)"
	@echo "Docker Compose version: $(shell docker-compose --version)"
	@echo "Git branch: $(shell git branch --show-current)"
	@echo "Git commit: $(shell git rev-parse --short HEAD)"
	@echo "API URL: $(shell grep NEXT_PUBLIC_API_URL .env 2>/dev/null || echo 'Not set')"
