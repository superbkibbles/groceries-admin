#!/bin/bash

# Deployment script for groceries admin panel
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="groceries-admin"
CONTAINER_NAME="groceries-admin-panel"
NGINX_CONTAINER="groceries-nginx"
COMPOSE_FILE="docker-compose.yml"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check if Docker is installed and running
check_docker() {
    log "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker service."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    success "Docker is installed and running"
}

# Pull latest code from git
pull_latest_code() {
    log "Pulling latest code from git..."
    
    if [ ! -d ".git" ]; then
        error "Not a git repository. Please run this script from the project root."
        exit 1
    fi
    
    git fetch origin
    git reset --hard origin/main
    
    success "Latest code pulled successfully"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Use docker compose if available, otherwise docker-compose
    if docker compose version &> /dev/null; then
        docker compose build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    success "Docker images built successfully"
}

# Stop existing containers
stop_containers() {
    log "Stopping existing containers..."
    
    # Use docker compose if available, otherwise docker-compose
    if docker compose version &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    
    success "Existing containers stopped"
}

# Start new containers
start_containers() {
    log "Starting new containers..."
    
    # Use docker compose if available, otherwise docker-compose
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    success "New containers started"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "name=${CONTAINER_NAME}" --filter "health=healthy" | grep -q ${CONTAINER_NAME}; then
            success "Admin panel is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Admin panel failed to become healthy after ${max_attempts} attempts"
            docker logs ${CONTAINER_NAME}
            exit 1
        fi
        
        log "Attempt ${attempt}/${max_attempts} - waiting for admin panel to be healthy..."
        sleep 10
        ((attempt++))
    done
    
    # Check nginx health
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "name=${NGINX_CONTAINER}" --filter "health=healthy" | grep -q ${NGINX_CONTAINER}; then
            success "Nginx is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Nginx failed to become healthy after ${max_attempts} attempts"
            docker logs ${NGINX_CONTAINER}
            exit 1
        fi
        
        log "Attempt ${attempt}/${max_attempts} - waiting for nginx to be healthy..."
        sleep 5
        ((attempt++))
    done
}

# Clean up old images
cleanup_images() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused images older than 24 hours
    docker image prune -a -f --filter "until=24h"
    
    success "Old images cleaned up"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo "=================="
    
    # Show running containers
    docker ps --filter "name=${CONTAINER_NAME}" --filter "name=${NGINX_CONTAINER}"
    
    echo ""
    log "Service URLs:"
    echo "- Admin Panel: http://91.99.95.75/admin"
    echo "- Health Check: http://91.99.95.75/health"
    
    echo ""
    log "Container Logs:"
    echo "- Admin Panel: docker logs ${CONTAINER_NAME}"
    echo "- Nginx: docker logs ${NGINX_CONTAINER}"
}

# Main deployment function
deploy() {
    log "Starting deployment of ${PROJECT_NAME}..."
    
    check_root
    check_docker
    pull_latest_code
    build_images
    stop_containers
    start_containers
    wait_for_health
    cleanup_images
    show_status
    
    success "Deployment completed successfully!"
    log "Your admin panel is now available at: http://91.99.95.75/admin"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        log "Stopping all containers..."
        stop_containers
        success "All containers stopped"
        ;;
    "restart")
        log "Restarting containers..."
        stop_containers
        start_containers
        wait_for_health
        success "Containers restarted"
        ;;
    "status")
        show_status
        ;;
    "logs")
        log "Showing container logs..."
        docker logs ${CONTAINER_NAME} -f
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  stop     - Stop all containers"
        echo "  restart  - Restart containers"
        echo "  status   - Show deployment status"
        echo "  logs     - Show admin panel logs"
        echo "  help     - Show this help message"
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
